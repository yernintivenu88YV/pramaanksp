"""
test_isolation.py

Mechanically enforces the isolation contract for the public "Sahaaya"
assistant. Task 5.3 requires this path to be a genuinely separate,
unauthenticated one: static procedural content only, with ZERO code
paths touching case data or any Pramaan investigation backend.

This scans every file in this folder (the entire public-assistant
surface) and FAILS if any forbidden token appears -- so the guarantee
survives future edits instead of relying on a one-time eyeball check.

Run: python test_isolation.py
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

# Tokens that would indicate the public page reaching into the authenticated
# investigation surface, case data, or the user's identity.
FORBIDDEN = [
    "entity_resolution_fn",
    "case_twin_fn",
    "graph_fn",
    "intent_router_fn",
    "gateway_fn",
    "/server/",          # any Catalyst Advanced I/O function call
    "catalyst.auth",     # logged-in user identity
    "window.catalyst",
    "isUserAuthenticated",
    "canonical_id",      # resolved person identifiers
    "canonical_suspect",
]

# Network primitives are only allowed inside a COMMENT (the ConvoKraft embed
# placeholder). An *active* fetch/XHR/WebSocket call is a contract breach.
NET_TOKENS = ["fetch(", "XMLHttpRequest", "WebSocket", "axios"]

# Files that are allowed to contain forbidden tokens *as documentation of the
# rule itself* (this test, and any README describing what is prohibited).
SELF_DOC = {"test_isolation.py"}


def scan():
    problems = []
    for fname in sorted(os.listdir(HERE)):
        path = os.path.join(HERE, fname)
        if not os.path.isfile(path) or fname in SELF_DOC:
            continue
        if not fname.lower().endswith((".html", ".htm", ".js", ".css", ".json")):
            continue
        with open(path, encoding="utf-8") as fh:
            lines = fh.readlines()

        in_block_comment = False
        for n, raw in enumerate(lines, 1):
            line = raw.rstrip("\n")
            stripped = line.strip()

            # Determine whether this line is inside a comment. Naming a forbidden
            # symbol in a comment (e.g. this contract, or the embed placeholder)
            # is documentation, not a code path -- only ACTIVE references fail.
            # Track HTML/JS block comments crudely but adequately for this file set.
            was_in_block = in_block_comment
            if "<!--" in line or "/*" in line:
                in_block_comment = True
            commented = (
                was_in_block
                or in_block_comment
                or stripped.startswith("//")
                or stripped.startswith("*")
                or stripped.startswith("<!--")
            )
            if "-->" in line or "*/" in line:
                in_block_comment = False

            if commented:
                continue

            # Active code: no backend/identity references, no network calls.
            for tok in FORBIDDEN:
                if tok in line:
                    problems.append(
                        f"{fname}:{n}: forbidden reference '{tok}' in active code -> {stripped}")
            for tok in NET_TOKENS:
                if tok in line:
                    problems.append(
                        f"{fname}:{n}: active network call '{tok}' (breaks isolation) -> {stripped}")
    return problems


def main():
    problems = scan()
    if problems:
        print("ISOLATION FAILED -- public assistant reaches into forbidden surface:")
        for p in problems:
            print("  " + p)
        sys.exit(1)
    print("ISOLATION OK -- public assistant is static-only:")
    print("  no calls to entity_resolution_fn / case_twin_fn / graph_fn /")
    print("  intent_router_fn / gateway_fn, no /server/ endpoints, no auth,")
    print("  no case identifiers, and no active fetch/XHR/WebSocket.")


if __name__ == "__main__":
    main()
