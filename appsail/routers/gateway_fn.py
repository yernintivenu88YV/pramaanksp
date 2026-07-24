from enum import Enum
import logging
from fastapi import APIRouter, Request, Response, HTTPException, status
from pydantic import BaseModel

logger = logging.getLogger("appsail.gateway")
router = APIRouter(prefix="/server/gateway_fn")

class Role(str, Enum):
    SI = "SI"
    ACP = "ACP"
    ANALYST = "Analyst"
    POLICY = "Policy"

class Resource(str, Enum):
    OWN_CASE_DETAIL = "own_case_detail"
    OTHER_JURISDICTION_CASE_DETAIL = "other_jurisdiction_case_detail"
    INFORMANT_IDENTITY = "informant_identity"
    AGGREGATE_ANALYTICS = "aggregate_analytics"
    CASE_REASSIGNMENT = "case_reassignment"
    DISTRICT_ROLLUP = "district_rollup"
    STATE_ROLLUP = "state_rollup"

PERMISSIONS = {
    Role.SI: {Resource.OWN_CASE_DETAIL, Resource.AGGREGATE_ANALYTICS},
    Role.ACP: {Resource.OWN_CASE_DETAIL, Resource.AGGREGATE_ANALYTICS,
               Resource.CASE_REASSIGNMENT, Resource.DISTRICT_ROLLUP},
    Role.ANALYST: {Resource.AGGREGATE_ANALYTICS, Resource.DISTRICT_ROLLUP},
    Role.POLICY: {Resource.DISTRICT_ROLLUP, Resource.STATE_ROLLUP},
}

class CheckAccessRequest(BaseModel):
    resource: str

@router.get("/health")
def health(request: Request):
    """
    Liveness + data-source diagnostics. `data_source` reports whether the
    Data Store probe succeeded; when it didn't, `fallback_reason` carries the
    actual exception so a "seed_fallback" is explainable instead of opaque.
    """
    repo = getattr(request.state, "repo", None)
    body = {"status": "ok", "module": "gateway_fn"}
    if repo is not None:
        try:
            is_fb = repo.is_fallback()
            body["data_source"] = "seed_fallback" if is_fb else "live"
            if hasattr(repo, "sdk_initialized"):
                body["sdk_initialized"] = repo.sdk_initialized()
            if is_fb and hasattr(repo, "fallback_reason"):
                body["fallback_reason"] = repo.fallback_reason()
            if hasattr(repo, "last_conv_error"):
                body["conversation_log_error"] = repo.last_conv_error()
        except Exception as e:  # never let diagnostics break liveness
            body["diag_error"] = str(e)
    return body

@router.post("/check_access")
def check_access(req: CheckAccessRequest, request: Request):
    # Resolve user role
    repo = request.state.repo
    role_str = repo.get_user_role(dict(request.headers))
    
    try:
        role_enum = Role(role_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail=f"Access Denied: Invalid role '{role_str}'"
        )

    try:
        resource_enum = Resource(req.resource)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail=f"Access Denied: Invalid resource '{req.resource}'"
        )

    allowed = resource_enum in PERMISSIONS.get(role_enum, set())
    decision = "allow" if allowed else "deny"

    # Insert log via repository
    session_id = request.headers.get("X-ZC-Session-ID") or request.headers.get("Cookie") or "session-unknown"
    repo.insert_audit_log(session_id, role_enum.value, resource_enum.value, decision)

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "allowed": False,
                "role": role_enum.value,
                "resource": resource_enum.value,
                "decision": "deny"
            }
        )

    return {
        "allowed": True,
        "role": role_enum.value,
        "resource": resource_enum.value,
        "decision": "allow"
    }
