"""
test_rbac.py

Exhaustive negative-test suite: every role against every resource, not
just the ones expected to be granted. The two resources granted to
nobody (informant identity, other-jurisdiction case detail) are the
ones most worth proving are denied to every single role, not assumed.
"""

from rbac import Role, Resource, check_access, can_access, PERMISSIONS


def run():
    audit_log = []
    failures = []
    total_checks = 0

    for role in Role:
        for resource in Resource:
            expected_allowed = resource in PERMISSIONS.get(role, set())
            result = check_access(role, resource, audit_log)
            total_checks += 1
            status = "PASS" if result["allowed"] == expected_allowed else "FAIL"
            if status == "FAIL":
                failures.append((role, resource, expected_allowed, result["allowed"]))
            print(f"{status}  {role.value:<10}{resource.value:<32}"
                  f"expected={expected_allowed!s:<6}got={result['allowed']}")

    print(f"\n{total_checks} checks run, {len(failures)} failed, "
          f"{len(audit_log)} audit entries created (should equal {total_checks}).")

    print("\nDefault-deny check -- these two resources should be granted to NOBODY:")
    for resource in (Resource.INFORMANT_IDENTITY, Resource.OTHER_JURISDICTION_CASE_DETAIL):
        denied_to_all = all(not can_access(role, resource) for role in Role)
        print(f"  {resource.value}: denied to every role -> {denied_to_all}")

    assert len(failures) == 0, f"RBAC failures: {failures}"
    assert len(audit_log) == total_checks, "Audit log did not capture every check"
    print("\nAll checks passed.")


if __name__ == "__main__":
    run()
