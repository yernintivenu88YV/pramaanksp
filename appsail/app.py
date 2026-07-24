import logging
import os
from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from rate_limit import limiter  # single shared limiter (see rate_limit.py)
from repositories import CatalystRepository
from routers import gateway_fn, entity_resolution_fn, case_twin_fn, intent_router_fn, graph_fn, export_fn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("appsail.app")

app = FastAPI(title="Pramaan Unified AppSail Server")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 1. Global Repository Instance
repo = CatalystRepository()

# 2. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to specific domains in prod if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Security Headers & Repository Injection Middleware
@app.middleware("http")
async def security_headers_and_repo_middleware(request: Request, call_next):
    # Initialize the Catalyst SDK from THIS request. AppSail only carries the
    # Catalyst headers per-request, so this is the only point at which the
    # Data Store connection can be established (see repositories._ensure_app).
    try:
        repo.init_from_request(request)
    except Exception:  # never let SDK init break request handling
        pass

    # Inject repository instance into request state
    request.state.repo = repo
    
    response: Response = await call_next(request)
    
    # Inject secure headers to prevent common vulnerabilities
    response.headers["Content-Security-Policy"] = "default-src 'self' 'unsafe-inline' 'unsafe-eval' https:; img-src 'self' data: https:;"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response

# 4. Central RBAC Gateway Middleware
@app.middleware("http")
async def rbac_gateway_middleware(request: Request, call_next):
    path = request.url.path
    # Intercept only API endpoints
    if path.startswith("/server/") and not path.endswith("/health") and not path.endswith("/check_access"):
        resource_needed = "own_case_detail"
        if path in ("/server/graph_fn/communities", "/server/graph_fn/hotspots"):
            resource_needed = "aggregate_analytics"
            
        role_str = repo.get_user_role(dict(request.headers))
        try:
            role_enum = gateway_fn.Role(role_str)
            resource_enum = gateway_fn.Resource(resource_needed)
            allowed = resource_enum in gateway_fn.PERMISSIONS.get(role_enum, set())
        except Exception:
            allowed = False
            
        decision = "allow" if allowed else "deny"
        session_id = request.headers.get("X-ZC-Session-ID") or request.headers.get("Cookie") or "session-unknown"
        
        # Audit decision in Data Store
        repo.insert_audit_log(session_id, role_str, resource_needed, decision)
        
        if not allowed:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": f"Access Denied: Role '{role_str}' does not have permission '{resource_needed}'"}
            )
            
    return await call_next(request)

# 5. Include API Routers
app.include_router(gateway_fn.router)
app.include_router(entity_resolution_fn.router)
app.include_router(case_twin_fn.router)
app.include_router(intent_router_fn.router)
app.include_router(graph_fn.router)
app.include_router(export_fn.router)  # SmartBrowz PDF export (own_case_detail)

# 6. Rate limiting is applied directly on the router endpoints themselves
#    (entity_resolution_fn.resolve @ 30/min, intent_router_fn.route @ 20/min)
#    via the shared limiter in rate_limit.py. The previous @app.post
#    re-registrations here were dead code -- shadowed by the routers included
#    above -- so the limits never fired; they have been removed.

# 7. Serve Web Client Frontend dynamically
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
    logger.info("Serving compiled React client dynamically from appsail/static")
else:
    logger.warning("Compiled static client folder (appsail/static) not found. Dynamic frontend UI will not be served.")

if __name__ == "__main__":
    import uvicorn
    # Bind to X_ZOHO_CATALYST_LISTEN_PORT provided by the platform
    port_val = os.environ.get("X_ZOHO_CATALYST_LISTEN_PORT") or os.environ.get("PORT") or "8000"
    try:
        port = int(port_val)
    except ValueError:
        port = 8000
    logger.info(f"Starting uvicorn programmatically on port {port}")
    uvicorn.run("app:app", host="0.0.0.0", port=port)
