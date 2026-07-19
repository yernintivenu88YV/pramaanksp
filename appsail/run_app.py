import os
import sys
import traceback

traceback_info = ""

try:
    # Try importing the main application
    from app import app
    import uvicorn
    
    port_val = os.environ.get("X_ZOHO_CATALYST_LISTEN_PORT") or os.environ.get("PORT") or "8000"
    port = int(port_val)
    
    print(f"Starting main application on port {port}")
    uvicorn.run("app:app", host="0.0.0.0", port=port)
    
except Exception as e:
    tb = traceback.format_exc()
    print("Main app startup failed. Traceback:")
    print(tb)
    traceback_info = tb
    
    # Start a minimal fallback server on the same port so we can retrieve the error
    from fastapi import FastAPI
    import uvicorn
    
    fallback_app = FastAPI()
    
    @fallback_app.get("/server/gateway_fn/health")
    def health():
        return {"status": "fallback", "error": str(e), "traceback": traceback_info}
        
    @fallback_app.get("/")
    def index():
        return {"status": "fallback", "error": str(e), "traceback": traceback_info}
        
    port_val = os.environ.get("X_ZOHO_CATALYST_LISTEN_PORT") or os.environ.get("PORT") or "8000"
    try:
        port = int(port_val)
    except ValueError:
        port = 8000
        
    print(f"Starting fallback server on port {port}")
    uvicorn.run(fallback_app, host="0.0.0.0", port=port)
