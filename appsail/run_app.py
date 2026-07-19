import os
import sys
import logging

# Ensure current script directory is in sys.path and is current working directory
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
os.chdir(current_dir)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("appsail.run")

try:
    from app import app
    import uvicorn

    port_val = (
        os.environ.get("X_ZOHO_CATALYST_LISTEN_PORT")
        or os.environ.get("PORT")
        or os.environ.get("LISTEN_PORT")
        or "8000"
    )
    try:
        port = int(port_val)
    except (ValueError, TypeError):
        port = 8000

    logger.info(f"Starting Pramaan AppSail main server on port {port} (CWD: {os.getcwd()})")
    print(f"Starting Pramaan AppSail main server on port {port}", flush=True)
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")

except Exception as e:
    import traceback
    tb = traceback.format_exc()
    logger.error(f"Main app startup failed: {e}\n{tb}")
    print(f"Main app startup failed: {e}\n{tb}", flush=True)

    # Start a minimal fallback server on the assigned port to report diagnosis
    from fastapi import FastAPI
    import uvicorn

    fallback_app = FastAPI(title="Pramaan Fallback Diagnostic Server")

    @fallback_app.get("/")
    def index():
        return {"status": "fallback_error", "error": str(e), "traceback": tb}

    @fallback_app.get("/server/gateway_fn/health")
    def health():
        return {"status": "fallback_error", "error": str(e), "traceback": tb}

    port_val = (
        os.environ.get("X_ZOHO_CATALYST_LISTEN_PORT")
        or os.environ.get("PORT")
        or os.environ.get("LISTEN_PORT")
        or "8000"
    )
    try:
        port = int(port_val)
    except (ValueError, TypeError):
        port = 8000

    print(f"Starting fallback diagnostic server on port {port}", flush=True)
    uvicorn.run(fallback_app, host="0.0.0.0", port=port, log_level="info")

