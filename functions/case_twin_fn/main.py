import logging
from flask import Request, make_response, jsonify
import zcatalyst_sdk

from case_twin import find_twins
from schemas import MatchRequest

logger = logging.getLogger()


def handler(request: Request):
    try:
        app = zcatalyst_sdk.initialize()

        if request.path == "/match" and request.method == "POST":
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
