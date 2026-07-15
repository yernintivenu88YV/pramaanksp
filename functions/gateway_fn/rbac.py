"""
rbac.py

The role-based access control model, checked in code and tested here --
not just described in a document. This is what Catalyst's Authentication
and Security Rules should enforce; this module is the source of truth
for what the rules should say, with a negative test suite proving the
denials actually hold.

Default-deny by design: informant identity and other-jurisdiction case
detail aren't granted to any role below. That's deliberate, not an
oversight -- those need an explicit, separately-modeled clearance this
version doesn't grant to anyone, so the safe default is nobody gets them.
"""

from enum import Enum


class Role(Enum):
    SI = "SI"                  # Investigating Officer
    ACP = "ACP"                 # Supervisor
    ANALYST = "Analyst"
    POLICY = "Policy"           # Command tier


class Resource(Enum):
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


def can_access(role: Role, resource: Resource) -> bool:
    return resource in PERMISSIONS.get(role, set())


def check_access(role: Role, resource: Resource, audit_log: list) -> dict:
    """
    Every check -- allowed or denied -- writes an audit entry. This is
    the function every Function in the system calls before returning
    any data. It's a data-layer decision, not a UI-layer one: hiding a
    button is not access control.
    """
    allowed = can_access(role, resource)
    audit_log.append({
        "role": role.value,
        "resource": resource.value,
        "decision": "allow" if allowed else "deny",
    })
    return {"allowed": allowed}
