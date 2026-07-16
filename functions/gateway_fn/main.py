import logging
from datetime import datetime, timezone
from flask import Request, make_response, jsonify
import zcatalyst_sdk

from rbac import Role, Resource, check_access

# ==============================================================================
# PRAMAAN RBAC ACCESS CONTROL POLICY & DESIGN REASONING
# ==============================================================================
# - own_case_detail:
#   * Sub-Inspector (SI) and ACP roles require individual, person-level case
#     details and suspect identification reports to conduct active criminal
#     investigations. They are granted access.
#   * Analysts and Policy Makers work on aggregate trends, hotspot metrics,
#     and regional statistics. They are denied access to raw person-level
#     identities and case details to enforce user privacy and data protection.
# - aggregate_analytics:
#   * Granted to Analysts and Policy Makers for aggregate queries (e.g. Leiden
#     community partitions, statistical trends).
# ==============================================================================

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(request: Request):
    try:
        app = zcatalyst_sdk.initialize()

        if request.path == "/check_access" and request.method == "POST":
            body = request.get_json() or {}
            resource_name = body.get("resource")
            if not resource_name:
                return make_response(jsonify({"error": "Missing 'resource' parameter"}), 400)

            # 1. Resolve user role strictly from authenticated session
            role_str = None
            try:
                current_user = app.authentication().get_current_user()
                if current_user:
                    role_details = current_user.get("role_details") or {}
                    role_str = role_details.get("role_name")
            except Exception as auth_err:
                logger.error(f"Authentication failed: {auth_err}")

            if not role_str:
                return make_response(jsonify({
                    "allowed": False, 
                    "error": "Unauthorized: No valid session role found"
                }), 401)

            # Map role string and resource string to enums
            try:
                role_enum = Role(role_str)
            except ValueError:
                # If role_str is invalid, fail closed
                logger.warning(f"Invalid role: {role_str}")
                return make_response(jsonify({
                    "allowed": False, 
                    "error": f"Access Denied: Invalid role '{role_str}'"
                }), 403)

            try:
                resource_enum = Resource(resource_name)
            except ValueError:
                # If resource is invalid, fail closed
                logger.warning(f"Invalid resource: {resource_name}")
                return make_response(jsonify({
                    "allowed": False, 
                    "error": f"Access Denied: Invalid resource '{resource_name}'"
                }), 403)

            # 2. Check access permissions
            audit_log = []
            result = check_access(role_enum, resource_enum, audit_log)
            decision = "allow" if result["allowed"] else "deny"

            # 3. Write to AccessAuditLog table in Data Store
            try:
                session_id = request.headers.get("X-ZC-Session-ID") or request.headers.get("Cookie") or "session-unknown"
                if len(session_id) > 40:
                    session_id = session_id[:40]

                db = app.datastore()
                table = db.table("AccessAuditLog")
                
                # Format current UTC time
                utc_now_str = datetime.now(timezone.utc).replace(tzinfo=None).strftime('%Y-%m-%d %H:%M:%S')

                row_data = {
                    "session_id": session_id,
                    "role": role_enum.value,
                    "resource": resource_enum.value,
                    "decision": decision,
                    "timestamp": utc_now_str
                }
                table.insert_row(row_data)
                logger.info(f"AccessAuditLog entry written: {row_data}")
            except Exception as db_err:
                logger.error(f"Failed writing audit log: {db_err}")
                raise db_err

            # 4. Respond
            status_code = 200 if result["allowed"] else 403
            return make_response(jsonify({
                "allowed": result["allowed"],
                "role": role_enum.value,
                "resource": resource_enum.value,
                "decision": decision
            }), status_code)

        elif request.path == "/health" and request.method == "GET":
            return make_response(jsonify({
                "status": "ok", 
                "module": "gateway_fn"
            }), 200)

        else:
            return make_response(jsonify({"error": "Not found"}), 404)

    except Exception as e:
        logger.exception(f"Unhandled exception in gateway_fn: {e}")
        return make_response(jsonify({"error": str(e)}), 500)
