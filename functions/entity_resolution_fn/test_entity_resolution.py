"""
test_entity_resolution.py

Seeded validation harness. The real dataset for this datathon will
almost certainly be synthetic, so the credible way to demonstrate this
works is to deliberately seed known-duplicate and known-non-duplicate
pairs and measure precision/recall against that ground truth -- not to
eyeball the output and call it done.
"""

import sys
# Set console output encoding to utf-8 to prevent cp1252 errors on Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

from entity_resolution import PersonRecord, resolve_pair, MatchDecision

# Each tuple: (record_a, record_b, is_true_match, note)
TEST_PAIRS = [
    (
        PersonRecord("FIR-0192-P1", "fir", "Mohammed Rafi", phone="98450 11223",
                      address="12 MG Road, Vijayawada", age=34),
        PersonRecord("VEH-REG-P7", "vehicle_registry", "Md. Rafi", phone="9845011223",
                      address="12 M.G Road Vijayawada", age=34),
        True, "same phone number, name abbreviated differently"
    ),
    (
        PersonRecord("FIR-0455-P2", "fir", "Mohammed Rafi", address="12 MG Road Vijayawada", age=34),
        PersonRecord("BANK-KYC-P3", "financial", "Mohammad Rafi", address="12 M.G Road, Vijayawada", age=35),
        True, "no shared strong identifier -- common transliteration spelling variant"
    ),
    (
        PersonRecord("FIR-0611-P1", "fir", "Praveen Kumar S", address="45 Anna Nagar Chennai", age=29),
        PersonRecord("FIR-0733-P4", "fir", "S. Praveen Kumar", address="45 Anna Nagar, Chennai", age=29),
        True, "name order plus initial variant, same address and age"
    ),
    (
        PersonRecord("FIR-0812-P2", "fir", "Lakshmi Devi", vehicle_reg="KA-05 MZ 1234", age=41),
        PersonRecord("VEH-REG-P9", "vehicle_registry", "Lakshmidevi", vehicle_reg="KA05MZ1234", age=41),
        True, "spacing variant, matching vehicle registration"
    ),
    (
        PersonRecord("FIR-1250-P1", "fir", "Anitha Rao", address="Malleswaram Bengaluru", age=38),
        PersonRecord("FIR-1310-P2", "fir", "Anita Rao", address="Malleshwaram, Bengaluru", age=39),
        True, "minor spelling variant, matching address and age"
    ),
    (
        PersonRecord("FIR-0921-P1", "fir", "Praveen Kumar", address="Jayanagar Bengaluru", age=45),
        PersonRecord("FIR-1004-P3", "fir", "Praveen Kumar", address="Vidyaranyapura Mysuru", age=23),
        False, "identical name, but address and age both disagree strongly"
    ),
    (
        PersonRecord("FIR-1102-P1", "fir", "Suresh Reddy", phone="90080 12233", age=52),
        PersonRecord("FIR-1180-P2", "fir", "Suresh Reddy", phone="7708899001", age=27),
        False, "common name shared by two unrelated people"
    ),
    (
        PersonRecord("FIR-1400-P1", "fir", "Ramesh Gowda", address="Hubli", age=30),
        PersonRecord("FIR-1420-P2", "fir", "Ganesh Naidu", address="Belagavi", age=55),
        False, "no meaningful similarity on any field"
    ),
    (
        PersonRecord("FIR-2000-P1", "fir", "Mohammad Rafi", address="Malleshwaram, Bengaluru", age=45, name_kannada="ಮೊಹಮ್ಮದ್ ರಫಿ"),
        PersonRecord("FIR-2000-P2", "fir", "Mahammad Rafi", address="Malleshwaram, Bengaluru", age=45, name_kannada="ಮಹಮ್ಮದ್ ರಫಿ"),
        True, "Kannada name spelling variation (transliterated to Mohammad vs Mahammad)"
    ),
    (
        PersonRecord("FIR-2010-P1", "fir", "Ramesh Gowda", address="Mysuru", age=30, name_kannada="ರಮೇಶ್ ಗೌಡ"),
        PersonRecord("FIR-2010-P2", "fir", "Suresh Reddy", address="Bengaluru", age=45, name_kannada="ಸುರೇಶ್ ರೆಡ್ಡಿ"),
        False, "Kannada name true-negative (unrelated people)"
    ),
    (
        PersonRecord("FIR-2020-P1", "fir", "Ramesh Gowda", address="Malleswaram, Bengaluru", age=30, name_kannada="ರಮೇಶ್ ಗೌಡ"),
        PersonRecord("FIR-2020-P2", "fir", "Ramesh Nayak", address="Jayanagar, Bengaluru", age=30, name_kannada="ರಮೇಶ್ ನಾಯಕ್"),
        False, "Kannada name sharing first name but different surname (should reject)"
    ),
]


def run():
    tp = fp = tn = fn = 0
    review_count = 0
    rows = []

    for a, b, is_match, note in TEST_PAIRS:
        result = resolve_pair(a, b)
        label = f"{a.name} vs {b.name}"
        score_display = "det." if result.score == float("inf") else f"{result.score:.2f}"
        truth = "MATCH" if is_match else "no match"
        rows.append((label, result.decision.value, score_display, truth, note))

        merged = result.decision == MatchDecision.AUTO_MERGE
        if result.decision == MatchDecision.REVIEW_QUEUE:
            review_count += 1
        elif merged and is_match:
            tp += 1
        elif merged and not is_match:
            fp += 1
        elif not merged and not is_match:
            tn += 1
        elif not merged and is_match:
            fn += 1

    print(f"{'Pair':<40}{'Decision':<15}{'Score':<8}{'Truth':<10}Note")
    print("-" * 115)
    for label, decision, score, truth, note in rows:
        print(f"{label:<40}{decision:<15}{score:<8}{truth:<10}{note}")

    print("-" * 115)
    precision = tp / (tp + fp) if (tp + fp) else float("nan")
    recall = tp / (tp + fn) if (tp + fn) else float("nan")
    print(f"\nOn auto-merge decisions only: precision {precision:.2f} "
          f"({tp} correct of {tp + fp} merged), recall {recall:.2f} "
          f"({tp} of {tp + fn} true matches caught)")
    print(f"True negatives correctly rejected: {tn} | Sent to human review queue: {review_count}")

    print("\nWorked example -- full evidence trail for the hardest true match "
          "(no shared phone/vehicle, resolved on name+address+age alone):")
    a, b = TEST_PAIRS[1][0], TEST_PAIRS[1][1]
    hardest = resolve_pair(a, b)
    print(f"  {a.name} ({a.source_table}, {a.source_id})  vs  {b.name} ({b.source_table}, {b.source_id})")
    for line in hardest.evidence:
        print(f"    - {line}")
    print(f"  => {hardest.decision.value}, total score {hardest.score:.2f} "
          f"(auto-merge threshold: {5.0}, review-queue floor: {2.5})")


if __name__ == "__main__":
    run()
