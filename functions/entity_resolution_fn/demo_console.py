"""
demo_console.py

An interactive demo console built on the tested entity-resolution engine,
covering two specific live-demo moments:

  1. Cross-examine the AI -- ask "why" about a match decision and get the
     actual evidence chain back, phrased as an answer to that question,
     not a black-box confidence number.
  2. Live counterfactual -- mutate a record's name in front of the judges
     and watch the confidence score respond, proving the matching logic
     is actually computing something rather than replaying a script.

Scope note: this builds two of the four ideas from the last brainstorm.
Review-queue flywheel logging is a schema/logging design task rather
than a demo moment by itself, and the Kannada read-aloud mode needs a
live Bhashini connection this sandbox can't reach -- both are better
tackled next, once there's a real API key to prove the second one against.
"""

import dataclasses
from entity_resolution import (
    PersonRecord, resolve_pair, MatchDecision,
    HIGH_CONFIDENCE_THRESHOLD, LOW_CONFIDENCE_THRESHOLD,
)


def explain(a: PersonRecord, b: PersonRecord) -> str:
    """Cross-examine mode -- answers 'why do you think these are the same person?'"""
    result = resolve_pair(a, b)
    lines = [
        f"Q: Why treat '{a.name}' ({a.source_table} {a.source_id}) and "
        f"'{b.name}' ({b.source_table} {b.source_id}) as the same person?",
        "",
    ]
    if result.score == float("inf"):
        lines.append(
            f"A: They share a strong identifier that almost never agrees by "
            f"coincidence -- {result.evidence[0]}. That alone is conclusive, "
            f"regardless of how differently the names are spelled."
        )
    else:
        lines.append(
            "A: No shared strong identifier, so this is a weighted judgment "
            "across three independent signals:"
        )
        for e in result.evidence:
            lines.append(f"     - {e}")
        lines.append(f"   Combined score: {result.score:.2f}")
        if result.decision == MatchDecision.AUTO_MERGE:
            lines.append(
                f"   That clears the auto-merge threshold ({HIGH_CONFIDENCE_THRESHOLD}) "
                f"-> merged into one canonical identity."
            )
        elif result.decision == MatchDecision.REVIEW_QUEUE:
            lines.append(
                f"   That's between the reject floor ({LOW_CONFIDENCE_THRESHOLD}) and the "
                f"auto-merge threshold ({HIGH_CONFIDENCE_THRESHOLD}) -- genuinely ambiguous, "
                f"so a human reviews it. The system doesn't guess here."
            )
        else:
            lines.append(
                f"   That's below the reject floor ({LOW_CONFIDENCE_THRESHOLD}) -- not "
                f"enough evidence these are the same person."
            )
    return "\n".join(lines)


def counterfactual(a: PersonRecord, b: PersonRecord, mutated_name: str, label: str):
    """Live counterfactual mode -- mutate one field and show the score move."""
    before = resolve_pair(a, b)
    b_after = dataclasses.replace(b, name=mutated_name)
    after = resolve_pair(a, b_after)

    def fmt(r):
        return "deterministic match" if r.score == float("inf") else f"{r.score:.2f}"

    print(f"\n--- Live counterfactual: {label} ---")
    print(f"  Before -> '{a.name}' vs '{b.name}': {before.decision.value} ({fmt(before)})")
    print(f"  After  -> '{a.name}' vs '{b_after.name}': {after.decision.value} ({fmt(after)})")


if __name__ == "__main__":
    print("=" * 72)
    print("DEMO MOMENT 1 -- Cross-examine the AI")
    print("=" * 72)
    rafi_a = PersonRecord("FIR-0455-P2", "fir", "Mohammed Rafi",
                           address="12 MG Road Vijayawada", age=34)
    rafi_b = PersonRecord("BANK-KYC-P3", "financial", "Mohammad Rafi",
                           address="12 M.G Road, Vijayawada", age=35)
    print(explain(rafi_a, rafi_b))

    print("\n" + "=" * 72)
    print("DEMO MOMENT 2 -- Live counterfactual: change the name, watch the score move")
    print("=" * 72)
    counterfactual(rafi_a, rafi_b, "Mohammad Sharif",
                    "swap the surname entirely -- should collapse the match")
    counterfactual(rafi_a, rafi_b, "Mohammed Raffi",
                    "one extra letter -- should barely move the score")

    print("\n" + "=" * 72)
    print("DEMO MOMENT 3 -- Honest uncertainty: a real case that stays in review")
    print("=" * 72)
    praveen_a = PersonRecord("FIR-0611-P1", "fir", "Praveen Kumar S",
                               address="45 Anna Nagar Chennai", age=29)
    praveen_b = PersonRecord("FIR-0733-P4", "fir", "S. Praveen Kumar",
                               address="45 Anna Nagar, Chennai", age=29)
    print(explain(praveen_a, praveen_b))
    print(
        "\nNote: this is a genuine match the system correctly declines to "
        "auto-merge -- exactly the behavior worth showing live, since it proves "
        "the system is calibrated, not just confident."
    )
