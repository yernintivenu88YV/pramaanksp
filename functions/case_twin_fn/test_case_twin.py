"""
test_case_twin.py

Seeded validation for case-twin scoring. Five cases: one target, one
genuine twin (similar MO/location/time/weapon), one partial match (same
crime type, different everything else), one clear non-match, and one
case that looks structurally unrelated but shares a canonicalized
suspect with the target -- specifically to test whether that signal can
surface a real connection that location/time/MO alone would miss.
"""

from datetime import datetime
from case_twin import CaseRecord, find_twins, narrative_similarity

CASE_001 = CaseRecord(
    case_id="CASE-001", crime_type="Burglary",
    modus_operandi="Rear window forced entry using crowbar, night time",
    narrative_text="Complainant reported burglary at residence. Entry made "
                    "through rear window using a crowbar. Occurred between "
                    "1 AM and 3 AM. Jewelry and cash stolen.",
    latitude=12.9352, longitude=77.6245,   # Koramangala
    date_time=datetime(2026, 7, 11, 2, 0), weapon="crowbar",
    canonical_suspect_ids=["CANON-0042"],
)

CASE_002 = CaseRecord(  # genuine twin
    case_id="CASE-002", crime_type="Burglary",
    modus_operandi="Rear window entry with crowbar, late night",
    narrative_text="Victim reported house burglary. Entry via rear window "
                    "using a crowbar, between midnight and 2 AM. Cash and "
                    "gold ornaments stolen.",
    latitude=12.9784, longitude=77.6408,   # Indiranagar, ~6km away
    date_time=datetime(2026, 7, 4, 1, 30), weapon="crowbar",
)

CASE_003 = CaseRecord(  # same crime type, different MO/time -- partial match
    case_id="CASE-003", crime_type="Burglary",
    modus_operandi="Front door lock picked during daytime while owners away",
    narrative_text="Complainant returned home to find front door lock picked "
                    "and valuables missing during daytime hours.",
    latitude=12.9600, longitude=77.6100,
    date_time=datetime(2026, 7, 7, 14, 0), weapon=None,
)

CASE_004 = CaseRecord(  # clear non-match
    case_id="CASE-004", crime_type="Chain snatching",
    modus_operandi="Snatched gold chain from pedestrian on motorbike",
    narrative_text="Victim was walking on the street when two men on a "
                    "motorbike snatched her gold chain and fled.",
    latitude=12.2958, longitude=76.6394,   # Mysuru, ~140km away
    date_time=datetime(2026, 7, 8, 11, 0), weapon=None,
)

CASE_005 = CaseRecord(  # structurally weak, but shares a canonical suspect
    case_id="CASE-005", crime_type="Vehicle theft",
    modus_operandi="Motorcycle stolen from parking area",
    narrative_text="Complainant's motorcycle was stolen from outside a "
                    "shopping complex.",
    latitude=13.0827, longitude=77.5877,   # ~20km away
    date_time=datetime(2026, 6, 1, 16, 0), weapon=None,
    canonical_suspect_ids=["CANON-0042"],  # same person as CASE_001
)


# ---------------------------------------------------------------------------
# Kannada-narrative cases -- narratives kept IN KANNADA, never translated
# before scoring (see narrative_similarity's contract). Structured fields
# mirror the English burglary set so the twin is a genuine twin overall and
# the non-match differs on everything, letting us confirm the ranking holds
# exactly the way it does for English -- this time on Kannada text.
# ---------------------------------------------------------------------------

CASE_K01 = CaseRecord(  # Kannada target: house burglary, rear window, crowbar, night
    case_id="CASE-K01", crime_type="Burglary",
    modus_operandi="Rear window forced entry using crowbar, night time",
    narrative_text=(
        "ದೂರುದಾರರ ಮನೆಯಲ್ಲಿ ಕಳ್ಳತನ ನಡೆದಿದೆ. ಕಳ್ಳರು ಹಿಂಬದಿ ಕಿಟಕಿಯನ್ನು ಹಾರೆಯಿಂದ "
        "ಮುರಿದು ಒಳಗೆ ಪ್ರವೇಶಿಸಿದ್ದಾರೆ. ರಾತ್ರಿ 1 ರಿಂದ 3 ಗಂಟೆಯ ನಡುವೆ ಘಟನೆ ನಡೆದಿದೆ. "
        "ಚಿನ್ನಾಭರಣ ಮತ್ತು ನಗದು ಕಳವಾಗಿದೆ."),
    latitude=12.9352, longitude=77.6245,   # Koramangala
    date_time=datetime(2026, 7, 11, 2, 0), weapon="crowbar",
    canonical_suspect_ids=["CANON-0042"],
)

CASE_K02 = CaseRecord(  # genuine Kannada twin of CASE-K01
    case_id="CASE-K02", crime_type="Burglary",
    modus_operandi="Rear window entry with crowbar, late night",
    narrative_text=(
        "ಸಂತ್ರಸ್ತರ ಮನೆಗೆ ಕನ್ನ ಹಾಕಲಾಗಿದೆ. ಕಳ್ಳರು ಹಿಂದಿನ ಕಿಟಕಿಯನ್ನು ಹಾರೆ ಬಳಸಿ "
        "ಮುರಿದು ನಡುರಾತ್ರಿ ಒಳಗೆ ನುಗ್ಗಿದ್ದಾರೆ. ನಗದು ಮತ್ತು ಚಿನ್ನದ ಆಭರಣಗಳು ಕಳವಾಗಿವೆ."),
    latitude=12.9784, longitude=77.6408,   # Indiranagar, ~6km away
    date_time=datetime(2026, 7, 4, 1, 30), weapon="crowbar",
)

CASE_K03 = CaseRecord(  # Kannada non-match: chain snatching, far away, daytime
    case_id="CASE-K03", crime_type="Chain snatching",
    modus_operandi="Snatched gold chain from pedestrian on motorbike",
    narrative_text=(
        "ಸಂತ್ರಸ್ತೆ ರಸ್ತೆಯಲ್ಲಿ ನಡೆದುಕೊಂಡು ಹೋಗುತ್ತಿದ್ದಾಗ ಬೈಕ್‌ನಲ್ಲಿ ಬಂದ ಇಬ್ಬರು "
        "ದುಷ್ಕರ್ಮಿಗಳು ಆಕೆಯ ಚಿನ್ನದ ಸರವನ್ನು ಕಿತ್ತುಕೊಂಡು ಪರಾರಿಯಾದರು."),
    latitude=12.2958, longitude=76.6394,   # Mysuru, ~140km away
    date_time=datetime(2026, 7, 8, 11, 0), weapon=None,
)


def run_kannada():
    """
    Confirms the ranking holds on Kannada narratives, and -- the point of
    Task 5 -- that the narrative sub-score itself works IN KANNADA:
    the genuine twin must out-score the non-match on narrative alone, not
    just on the structured features. Relative assertions (twin > non-match)
    so the check is robust to the exact embedding model in use.
    """
    print("\n" + "=" * 100)
    print("KANNADA NARRATIVE RANKING (narratives scored in Kannada, no translation)")
    print("=" * 100)

    twin_narr = narrative_similarity(CASE_K01, CASE_K02)
    nonmatch_narr = narrative_similarity(CASE_K01, CASE_K03)
    print(f"narrative_similarity(K01, K02 twin)      = {twin_narr:.3f}")
    print(f"narrative_similarity(K01, K03 non-match) = {nonmatch_narr:.3f}")

    top, flagged = find_twins(CASE_K01, [CASE_K02, CASE_K03], top_k=1)
    print(f"\nTop match by full blend: {top[0].case.case_id} "
          f"(score {top[0].total_score:.3f}, narrative={top[0].breakdown['narrative']:.3f})")

    # 1. The Kannada narrative signal itself discriminates twin from non-match.
    assert twin_narr > nonmatch_narr, (
        f"Kannada narrative similarity failed to rank twin above non-match "
        f"({twin_narr:.3f} !> {nonmatch_narr:.3f})")
    # 2. The genuine twin wins the overall ranking, same as the English set.
    assert top[0].case.case_id == "CASE-K02", (
        f"expected CASE-K02 as top Kannada twin, got {top[0].case.case_id}")
    print("\nPASS: Kannada twin out-scores the non-match on narrative alone, "
          "and wins the overall ranking -- same behaviour proven for English.")
    return twin_narr, nonmatch_narr


def run():
    candidates = [CASE_002, CASE_003, CASE_004, CASE_005]
    top, flagged = find_twins(CASE_001, candidates, top_k=2)

    print(f"Target: {CASE_001.case_id} -- {CASE_001.crime_type}, "
          f"\"{CASE_001.modus_operandi}\"\n")

    print("Ranked by similarity (top 2):")
    print(f"{'Rank':<6}{'Case':<10}{'Score':<8}Breakdown")
    print("-" * 100)
    for i, t in enumerate(top, 1):
        breakdown_str = ", ".join(f"{k}={v:.2f}" for k, v in t.breakdown.items())
        print(f"{i:<6}{t.case.case_id:<10}{t.total_score:.3f}   {breakdown_str}")

    print("\nFlagged separately -- shares a confirmed suspect but didn't rank in the top on similarity alone:")
    if not flagged:
        print("  (none)")
    for t in flagged:
        print(f"  {t.case.case_id} -- similarity score {t.total_score:.3f} (would not have made top 2 alone), "
              f"but shares canonical suspect CANON-0042 with the target")

    print("\nWhat this demonstrates: CASE-005 shares almost nothing structurally with "
          "the target -- different crime type, ~20km away, three weeks apart, no weapon "
          "or MO match -- and correctly does NOT rank in the top 2 on similarity. But it "
          "shares a confirmed identity with the target's accused, and that surfaces "
          "explicitly rather than being buried by CASE-003, which merely looks similar "
          "without any confirmed connection at all.")

    # Regression assertions on the English set (unchanged expected behaviour).
    top_ids = [t.case.case_id for t in top]
    assert top_ids[0] == "CASE-002", f"expected CASE-002 top, got {top_ids}"
    assert "CASE-005" in [f.case.case_id for f in flagged], \
        "CASE-005 should be flagged via shared canonical suspect"
    assert narrative_similarity(CASE_001, CASE_002) > narrative_similarity(CASE_001, CASE_004), \
        "English twin narrative should out-score the chain-snatching non-match"


if __name__ == "__main__":
    run()
    run_kannada()
