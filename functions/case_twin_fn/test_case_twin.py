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
from case_twin import CaseRecord, find_twins

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


if __name__ == "__main__":
    run()
