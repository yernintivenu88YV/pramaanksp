import logging
from flask import Request, make_response, jsonify
import zcatalyst_sdk

from entity_resolution import resolve_pair
from schemas import ResolveRequest

# Configure logging
logger = logging.getLogger()


def handler(request: Request):
    try:
        app = zcatalyst_sdk.initialize()

        if request.path == "/resolve" and request.method == "POST":
            body = request.get_json()
            req = ResolveRequest(**body)
            a = req.record_a.to_person_record()
            b = req.record_b.to_person_record()
            
            result = resolve_pair(a, b)
            
            response = make_response(jsonify({
                "decision": result.decision.value,
                "score": None if result.score == float("inf") else result.score,
                "evidence": result.evidence,
            }), 200)
            return response

        elif request.path == "/health" and request.method == "GET":
            response = make_response(jsonify({
                "status": "ok", 
                "module": "entity_resolution_fn"
            }), 200)
            return response

        else:
            response = make_response(jsonify({
                "error": "Not found"
            }), 404)
            return response

    except Exception as e:
        logger.error(f"Error resolving pair: {str(e)}")
        response = make_response(jsonify({
            "error": str(e)
        }), 500)
        return response
