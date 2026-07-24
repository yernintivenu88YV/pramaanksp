import os
import sys
import json
import logging
import traceback
import subprocess

# Ensure this directory is importable and is the CWD.
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
os.chdir(current_dir)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("appsail.run")

pip_output = ""
try:
    logger.info("Running manual pip install for diagnostics...")
    pip_output = subprocess.check_output([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], stderr=subprocess.STDOUT).decode("utf-8")
except subprocess.CalledProcessError as e:
    pip_output = f"PIP INSTALL FAILED with code {e.returncode}:\n{e.output.decode('utf-8')}"
except Exception as e:
    pip_output = f"PIP INSTALL EXCEPTION: {e}"



def _listen_port() -> int:
    val = (
        os.environ.get("X_ZOHO_CATALYST_LISTEN_PORT")
        or os.environ.get("PORT")
        or os.environ.get("LISTEN_PORT")
        or "8000"
    )
    try:
        return int(val)
    except (ValueError, TypeError):
        return 8000


port = _listen_port()

try:
    # Primary path: the real FastAPI app under uvicorn.
    from app import app
    import uvicorn

    msg = f"Starting Pramaan AppSail main server on 0.0.0.0:{port} (CWD: {os.getcwd()})"
    logger.info(msg)
    print(msg, flush=True)
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")

except BaseException as e:  # BaseException so even SystemExit/import-time exits surface
    tb = traceback.format_exc()
    print(f"Main app startup FAILED: {e}\n{tb}", flush=True)

    # Dependency-free diagnostic fallback. Uses ONLY the Python standard
    # library, so it still binds and reports the real error even if fastapi /
    # uvicorn / any pip dependency failed to install in the container. This is
    # the difference between an opaque platform 503 and a readable traceback:
    #   - If this server answers -> run_app.py IS executing; the JSON body is
    #     the actual startup error to fix.
    #   - If the platform still 503s -> run_app.py is NOT being executed at all
    #     (the effective Startup Command isn't `python run_app.py`).
    from http.server import BaseHTTPRequestHandler, HTTPServer

    # Environment diagnostics: figure out WHY an import failed (deps not
    # installed? wrong path? partial package?). Best-effort, never raises.
    diag = {}
    try:
        diag["sys_path"] = sys.path
        diag["cwd_listing"] = sorted(os.listdir(os.getcwd()))[:60]
        diag["requirements_at_cwd"] = os.path.exists(os.path.join(os.getcwd(), "requirements.txt"))
        # Where does 'fastapi' resolve, if at all?
        import importlib.util as _u
        spec = _u.find_spec("fastapi")
        diag["fastapi_spec_origin"] = getattr(spec, "origin", None) if spec else None
        diag["fastapi_spec_locations"] = list(getattr(spec, "submodule_search_locations", []) or []) if spec else None
        # Find any site-packages on the path and whether fastapi is inside.
        sp_info = {}
        for p in sys.path:
            try:
                if p and os.path.isdir(p) and ("site-packages" in p or "dist-packages" in p):
                    sp_info[p] = "fastapi" in os.listdir(p)
            except Exception:
                pass
        diag["site_packages"] = sp_info
    except Exception as diag_err:
        diag["diag_error"] = str(diag_err)

    body = json.dumps({
        "status": "fallback_error",
        "error": str(e),
        "traceback": tb,
        "cwd": os.getcwd(),
        "diag": diag,
        "pip_diagnostic_output": pip_output,
    }).encode("utf-8")

    class DiagnosticHandler(BaseHTTPRequestHandler):
        def _respond(self):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self):
            self._respond()

        def do_POST(self):
            self._respond()

        def log_message(self, *args):
            pass

    print(f"Starting stdlib fallback diagnostic server on 0.0.0.0:{port}", flush=True)
    HTTPServer(("0.0.0.0", port), DiagnosticHandler).serve_forever()
