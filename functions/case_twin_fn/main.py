import logging
import os
import requests
from flask import Request, make_response, jsonify
import zcatalyst_sdk

from case_twin import find_twins
from schemas import MatchRequest

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def get_gateway_url(app):
    is_local = os.getenv("X_ZOHO_CATALYST_IS_LOCAL") == "true" or os.getenv("CATALYST_ACTIVE_DC") is None
    if is_local:
        return "http://127.0.0.1:3000/server/gateway_fn"
    else:
        project_domain = app.config.get("project_domain")
        return f"https://{project_domain}/server/gateway_fn"

def verify_rbac(app, request: Request, resource_name: str) -> dict:
    gateway_url = get_gateway_url(app) + "/check_access"
    
    headers = {}
    for h in ('cookie', 'authorization', 'x-zc-session-id'):
        val = request.headers.get(h)
        if val:
            headers[h] = val
            
    try:
        resp = requests.post(gateway_url, json={"resource": resource_name}, headers=headers, timeout=5)
        if resp.status_code == 200:
            return {"allowed": True}
        elif resp.status_code == 403:
            return {"allowed": False, "error": resp.json().get("error") or "Access Denied: Forbidden resource"}
        else:
            return {"allowed": False, "error": f"Gateway error: {resp.status_code}"}
    except Exception as e:
        return {"allowed": False, "error": f"Failed to contact gateway: {str(e)}"}


def handler(request: Request):
    try:
        app = zcatalyst_sdk.initialize()

        if request.path == "/match" and request.method == "POST":
            # 1. Gate request with RBAC pre-check
            rbac_res = verify_rbac(app, request, "own_case_detail")
            if not rbac_res["allowed"]:
                return make_response(jsonify({"error": rbac_res["error"]}), 403)

            body = request.get_json()
            req = MatchRequest(**body)
            target = req.target.to_case_record()
            candidates = [c.to_case_record() for c in req.candidates]
            
            top, flagged = find_twins(target, candidates, top_k=req.top_k)
            
            # Serialize the ranked results
            top_serialized = []
            for t in top:
                top_serialized.append({
                    "case_id": t.case.case_id,
                    "total_score": t.total_score,
                    "breakdown": t.breakdown,
                    "shared_confirmed_suspect": t.shared_confirmed_suspect
                })
                
            flagged_serialized = []
            for f in flagged:
                flagged_serialized.append({
                    "case_id": f.case.case_id,
                    "total_score": f.total_score,
                    "breakdown": f.breakdown,
                    "shared_confirmed_suspect": f.shared_confirmed_suspect
                })

            response = make_response(jsonify({
                "ranked_similarity": top_serialized,
                "flagged_shared_suspect": flagged_serialized
            }), 200)
            return response

        elif request.path == "/health" and request.method == "GET":
            response = make_response(jsonify({
                "status": "ok",
                "module": "case_twin_fn"
            }), 200)
            return response

        else:
            response = make_response(jsonify({"error": "Not found"}), 404)
            return response

    except Exception as e:
        logger.error(f"Error finding twins: {str(e)}")
        response = make_response(jsonify({"error": str(e)}), 500)
        return response

