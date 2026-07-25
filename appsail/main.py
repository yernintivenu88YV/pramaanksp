#!/usr/bin/env python3
import os
import sys
import json
import logging
import traceback
import subprocess
        try:
            pip_list = subprocess.run(['pip', 'list'], capture_output=True, text=True).stdout
            diag = {
                'pip_list': pip_list,
                'pip_install_out': 'disabled',
                'pip_install_err': 'disabled',
            }
        except Exception as e:
            diag = {'error': str(e)}
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
