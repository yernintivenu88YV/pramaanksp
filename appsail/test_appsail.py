import json
import math
import unittest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

import app as app_module
from app import app
from routers.entity_resolution_fn import MatchDecision


class FakeRepo:
    """
    In-memory repository double. app.py's middleware resolves the module-level
    `repo` global at call time, so swapping app_module.repo lets a test control
    exactly which persons/cases/links the analytics endpoints see -- required
    for hand-reproducibility assertions, which need known inputs.
    """

    def __init__(self, persons=None, cases=None, links=None, warrants=None):
        self.persons = persons or []
        self.cases = cases or []
        self.links = links or []
        self.warrants = warrants or []
        self.audit_rows = []
        self.conversation_rows = []
        self.app = None  # no live Catalyst -> SmartBrowz unavailable -> HTML fallback

    def is_fallback(self):
        return True

    def get_user_role(self, request_headers: dict) -> str:
        auth = (request_headers.get("authorization") or "").lower()
        if "acp" in auth:
            return "ACP"
        if "policy" in auth:
            return "Policy"
        if "si" in auth:
            return "SI"
        return "Analyst"

    def get_user_id(self, request_headers: dict) -> str:
        return "local-test-user"

    def insert_audit_log(self, session_id, role, resource, decision):
        self.audit_rows.append({
            "session_id": session_id, "role": role,
            "resource": resource, "decision": decision,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        })

    def fetch_audit_logs(self, limit=50):
        return self.audit_rows[-limit:]

    def insert_conversation_log(self, session_id, user_id, role,
                                query_text, response_text, cited_record_ids):
        self.conversation_rows.append({
            "session_id": session_id, "user_id": user_id, "role": role,
            "query_text": query_text, "response_text": response_text,
            "cited_record_ids": cited_record_ids,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        })

    def fetch_conversation_log(self, session_id=None, limit=200):
        rows = self.conversation_rows
        if session_id:
            rows = [r for r in rows if r["session_id"] == session_id]
        return rows[-limit:]

    def fetch_persons(self):
        return self.persons

    def fetch_cases(self):
        return self.cases

    def fetch_links(self):
        return self.links

    def fetch_warrants(self):
        return self.warrants

    def store_case_embedding(self, case_id, vector, model_id):
        pass

class AppSailUnifiedTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_checks(self):
        # 1. Gateway Health Check
        resp = self.client.get("/server/gateway_fn/health")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "ok")

        # 2. Entity Resolution Health Check
        resp = self.client.get("/server/entity_resolution_fn/health")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["module"], "entity_resolution_fn")

    def test_security_headers(self):
        resp = self.client.get("/server/gateway_fn/health")
        self.assertEqual(resp.headers.get("X-Frame-Options"), "DENY")
        self.assertEqual(resp.headers.get("X-Content-Type-Options"), "nosniff")
        self.assertIn("Content-Security-Policy", resp.headers)

    def test_rbac_gateway_access(self):
        # 1. Deny case details to Analyst
        resp = self.client.post(
            "/server/graph_fn/traverse",
            json={"canonical_id": "CANON-0042"},
            headers={"authorization": "Bearer role_Analyst"}
        )
        self.assertEqual(resp.status_code, 403)
        self.assertIn("Access Denied", resp.json()["detail"])

        # 2. Allow aggregate analytics (communities) to Analyst
        resp = self.client.post(
            "/server/graph_fn/communities",
            headers={"authorization": "Bearer role_Analyst"}
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["mode"], "mock")

        # 3. Allow case details to SI
        resp = self.client.post(
            "/server/graph_fn/traverse",
            json={"canonical_id": "CANON-0042"},
            headers={"authorization": "Bearer role_SI"}
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["mode"], "mock")

    def test_entity_resolution_logic(self):
        # High confidence match (deterministic phone match)
        payload = {
            "record_a": {
                "source_id": "rec-a", "source_table": "fir", "name": "Mohammed Rafi",
                "phone": "98450 11223", "age": 34
            },
            "record_b": {
                "source_id": "rec-b", "source_table": "registry", "name": "Md. Rafi",
                "phone": "9845011223", "age": 34
            }
        }
        resp = self.client.post(
            "/server/entity_resolution_fn/resolve",
            json=payload,
            headers={"authorization": "Bearer role_SI"}
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["decision"], MatchDecision.AUTO_MERGE.value)

        # Mismatch surname rejection
        payload = {
            "record_a": {
                "source_id": "rec-a", "source_table": "fir", "name": "Ramesh Gowda", "age": 30
            },
            "record_b": {
                "source_id": "rec-b", "source_table": "fir", "name": "Ramesh Nayak", "age": 30
            }
        }
        resp = self.client.post(
            "/server/entity_resolution_fn/resolve",
            json=payload,
            headers={"authorization": "Bearer role_SI"}
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["decision"], MatchDecision.REJECT.value)

    def test_case_twin_logic(self):
        payload = {
            "target": {
                "case_id": "CASE-001", "crime_type": "Burglary", 
                "modus_operandi": "Rear window forced entry using crowbar",
                "narrative_text": "Rear window forced entry using crowbar, night time.",
                "latitude": 12.9579, "longitude": 77.6251, "date_time": "2026-01-10 03:30:00"
            },
            "candidates": [
                {
                    "case_id": "CASE-002", "crime_type": "Burglary", 
                    "modus_operandi": "Rear window forced entry using crowbar, night time",
                    "narrative_text": "Rear window forced entry using crowbar, night time.",
                    "latitude": 12.9592, "longitude": 77.6235, "date_time": "2026-01-15 02:15:00"
                },
                {
                    "case_id": "CASE-004", "crime_type": "Chain snatching", 
                    "modus_operandi": "Snatched gold chain from pedestrian",
                    "narrative_text": "Snatched gold chain from pedestrian, motorcycle getaway.",
                    "latitude": 12.2958, "longitude": 76.6394, "date_time": "2026-02-01 10:15:00"
                }
            ],
            "top_k": 2
        }
        resp = self.client.post(
            "/server/case_twin_fn/match",
            json=payload,
            headers={"authorization": "Bearer role_SI"}
        )
        self.assertEqual(resp.status_code, 200)
        top_matches = resp.json()["top_matches"]
        self.assertEqual(top_matches[0]["case_id"], "CASE-002")
        self.assertGreater(top_matches[0]["total_score"], top_matches[1]["total_score"])

    def test_case_twin_kannada_narratives(self):
        """
        Task 5: Kannada narratives are scored IN KANNADA (never translated).
        Confirms the ranking holds the same way it does for English -- the
        genuine Kannada twin must out-rank the Kannada non-match.
        """
        payload = {
            "target": {
                "case_id": "CASE-K01", "crime_type": "Burglary",
                "modus_operandi": "Rear window forced entry using crowbar, night time",
                "narrative_text": (
                    "ದೂರುದಾರರ ಮನೆಯಲ್ಲಿ ಕಳ್ಳತನ ನಡೆದಿದೆ. ಕಳ್ಳರು ಹಿಂಬದಿ ಕಿಟಕಿಯನ್ನು ಹಾರೆಯಿಂದ "
                    "ಮುರಿದು ಒಳಗೆ ಪ್ರವೇಶಿಸಿದ್ದಾರೆ. ರಾತ್ರಿ 1 ರಿಂದ 3 ಗಂಟೆಯ ನಡುವೆ ಘಟನೆ ನಡೆದಿದೆ. "
                    "ಚಿನ್ನಾಭರಣ ಮತ್ತು ನಗದು ಕಳವಾಗಿದೆ."),
                "latitude": 12.9352, "longitude": 77.6245,
                "date_time": "2026-07-11 02:00:00", "weapon": "crowbar"
            },
            "candidates": [
                {   # genuine Kannada twin
                    "case_id": "CASE-K02", "crime_type": "Burglary",
                    "modus_operandi": "Rear window entry with crowbar, late night",
                    "narrative_text": (
                        "ಸಂತ್ರಸ್ತರ ಮನೆಗೆ ಕನ್ನ ಹಾಕಲಾಗಿದೆ. ಕಳ್ಳರು ಹಿಂದಿನ ಕಿಟಕಿಯನ್ನು ಹಾರೆ ಬಳಸಿ "
                        "ಮುರಿದು ನಡುರಾತ್ರಿ ಒಳಗೆ ನುಗ್ಗಿದ್ದಾರೆ. ನಗದು ಮತ್ತು ಚಿನ್ನದ ಆಭರಣಗಳು ಕಳವಾಗಿವೆ."),
                    "latitude": 12.9784, "longitude": 77.6408,
                    "date_time": "2026-07-04 01:30:00", "weapon": "crowbar"
                },
                {   # Kannada non-match: chain snatching, far away, daytime
                    "case_id": "CASE-K03", "crime_type": "Chain snatching",
                    "modus_operandi": "Snatched gold chain from pedestrian on motorbike",
                    "narrative_text": (
                        "ಸಂತ್ರಸ್ತೆ ರಸ್ತೆಯಲ್ಲಿ ನಡೆದುಕೊಂಡು ಹೋಗುತ್ತಿದ್ದಾಗ ಬೈಕ್‌ನಲ್ಲಿ ಬಂದ ಇಬ್ಬರು "
                        "ದುಷ್ಕರ್ಮಿಗಳು ಆಕೆಯ ಚಿನ್ನದ ಸರವನ್ನು ಕಿತ್ತುಕೊಂಡು ಪರಾರಿಯಾದರು."),
                    "latitude": 12.2958, "longitude": 76.6394,
                    "date_time": "2026-07-08 11:00:00", "weapon": None
                }
            ],
            "top_k": 2
        }
        resp = self.client.post(
            "/server/case_twin_fn/match",
            json=payload,
            headers={"authorization": "Bearer role_SI"}
        )
        self.assertEqual(resp.status_code, 200)
        top = resp.json()["top_matches"]
        # The genuine Kannada twin wins overall...
        self.assertEqual(top[0]["case_id"], "CASE-K02")
        # ...and specifically on the Kannada narrative signal itself, which is
        # what proves the multilingual embedding is doing the work.
        by_id = {m["case_id"]: m for m in top}
        self.assertGreater(by_id["CASE-K02"]["breakdown"]["narrative"],
                           by_id["CASE-K03"]["breakdown"]["narrative"])

    def test_case_twin_precomputed_embeddings(self):
        """
        Precomputed narrative vectors (built at ingestion by
        backfill_embeddings.py) must be used as-is at match time. Sending
        vectors with blank narrative_text proves the stored vector -- not the
        text -- drives the narrative score.
        """
        from routers.case_twin_fn import embed_narrative
        kn_a = "ದೂರುದಾರರ ಮನೆಯಲ್ಲಿ ಕಳ್ಳತನ ನಡೆದಿದೆ. ಕಳ್ಳರು ಹಿಂಬದಿ ಕಿಟಕಿಯನ್ನು ಹಾರೆಯಿಂದ ಮುರಿದು ಒಳಗೆ ಪ್ರವೇಶಿಸಿದ್ದಾರೆ."
        kn_twin = "ಸಂತ್ರಸ್ತರ ಮನೆಗೆ ಕನ್ನ ಹಾಕಲಾಗಿದೆ. ಕಳ್ಳರು ಹಿಂದಿನ ಕಿಟಕಿಯನ್ನು ಹಾರೆ ಬಳಸಿ ಮುರಿದು ನಡುರಾತ್ರಿ ಒಳಗೆ ನುಗ್ಗಿದ್ದಾರೆ."
        kn_non = "ಸಂತ್ರಸ್ತೆ ರಸ್ತೆಯಲ್ಲಿ ಹೋಗುತ್ತಿದ್ದಾಗ ಬೈಕ್‌ನಲ್ಲಿ ಬಂದವರು ಚಿನ್ನದ ಸರವನ್ನು ಕಿತ್ತುಕೊಂಡು ಪರಾರಿಯಾದರು."

        va, vb, vc = embed_narrative(kn_a), embed_narrative(kn_twin), embed_narrative(kn_non)
        if not va:
            self.skipTest("embedding model unavailable; precompute path not exercised")

        def rec(cid, vec, ctype="Burglary"):
            return {
                "case_id": cid, "crime_type": ctype, "modus_operandi": "x",
                "narrative_text": "", "narrative_embedding": vec,
                "latitude": 12.9352, "longitude": 77.6245,
                "date_time": "2026-07-11 02:00:00"
            }

        resp = self.client.post(
            "/server/case_twin_fn/match",
            json={"target": rec("K01", va),
                  "candidates": [rec("K02", vb), rec("K03", vc, "Chain snatching")],
                  "top_k": 2},
            headers={"authorization": "Bearer role_SI"}
        )
        self.assertEqual(resp.status_code, 200)
        by_id = {m["case_id"]: m for m in resp.json()["top_matches"]}
        self.assertGreater(by_id["K02"]["breakdown"]["narrative"],
                           by_id["K03"]["breakdown"]["narrative"])


class GraphAnalyticsTests(unittest.TestCase):
    """
    Task 6 coverage: /priority and /hotspots. The bar here is
    hand-reproducibility -- the returned total_score must be recomputable
    from the returned breakdown AND from the seeded raw inputs, per the
    project's explainability rule ("if I can't recompute the same number
    myself from the factors shown, the explainability requirement isn't
    actually met").
    """

    # Custom, non-default weights so the test catches a silently changed
    # blend, not just the default sum.
    WEIGHTS = {"w_recency": 2.0, "w_severity": 1.5,
               "w_centrality": 1.0, "w_warrant": 3.0}

    def setUp(self):
        self.now = datetime.now()

        def days_ago(n):
            return (self.now - timedelta(days=n)).strftime("%Y-%m-%d %H:%M:%S")

        # NOTE: the endpoint's warrant flag is currently HARDCODED to
        # ("CANON-0042", "CANON-0044") -- there is no warrant field in the
        # data model. The high-priority profile must therefore use
        # CANON-0042. Flagged as a wart: warrant should come from data.
        persons = [
            {"canonical_id": "CANON-0042", "name": "High Priority Suspect"},
            {"canonical_id": "CANON-5555", "name": "Co-Accused Associate"},
            {"canonical_id": "CANON-7777", "name": "Low Priority Person"},
        ]
        cases = [
            {"case_id": "HP-1", "crime_type": "Burglary",
             "date_time": days_ago(5), "latitude": 12.960, "longitude": 77.600},
            {"case_id": "HP-2", "crime_type": "Burglary",
             "date_time": days_ago(10), "latitude": 12.965, "longitude": 77.605},
            {"case_id": "HP-3", "crime_type": "Dacoity",
             "date_time": days_ago(20), "latitude": 12.958, "longitude": 77.598},
            {"case_id": "LP-1", "crime_type": "Public nuisance",
             "date_time": days_ago(400), "latitude": 15.850, "longitude": 74.500},
        ]
        links = [
            {"case_id": "HP-1", "canonical_id": "CANON-0042", "role_in_case": "accused"},
            {"case_id": "HP-2", "canonical_id": "CANON-0042", "role_in_case": "accused"},
            {"case_id": "HP-3", "canonical_id": "CANON-0042", "role_in_case": "accused"},
            {"case_id": "HP-1", "canonical_id": "CANON-5555", "role_in_case": "accused"},
            {"case_id": "LP-1", "canonical_id": "CANON-7777", "role_in_case": "accused"},
        ]
        warrants = [
            {"canonical_id": "CANON-0042", "active_flag": True, "warrant_number": "WAR-1"},
            {"canonical_id": "CANON-0044", "active_flag": True, "warrant_number": "WAR-2"}
        ]
        self.fake_repo = FakeRepo(persons=persons, cases=cases, links=links, warrants=warrants)
        self._orig_repo = app_module.repo
        app_module.repo = self.fake_repo
        self.client = TestClient(app)

    def tearDown(self):
        app_module.repo = self._orig_repo

    # ------------------------------------------------------------------
    # /priority
    # ------------------------------------------------------------------

    def _expected_breakdown(self, case_days, crime_types, n_cases, n_co_accused,
                            has_warrant):
        """Recompute every factor from raw inputs, independently of the API."""
        recency = min(1.0, sum(math.exp(-0.005 * d) for d in case_days))
        severity = 0.2
        for ct in crime_types:
            ct = ct.lower()
            if ct in ("burglary", "murder", "dacoity"):
                severity = max(severity, 1.0)
            elif ct in ("theft", "vehicle theft", "assault", "chain snatching"):
                severity = max(severity, 0.5)
        centrality = min(1.0, (n_cases + n_co_accused) / 5.0)
        warrant = 1.0 if has_warrant else 0.0
        return {"recency": recency, "severity": severity,
                "centrality": centrality, "warrant": warrant}

    def test_priority_score_reproducible_by_hand(self):
        resp = self.client.post(
            "/server/graph_fn/priority",
            json=self.WEIGHTS,
            headers={"authorization": "Bearer role_SI"},
        )
        self.assertEqual(resp.status_code, 200)
        scores = {s["canonical_id"]: s for s in resp.json()["scores"]}
        self.assertIn("CANON-0042", scores)
        self.assertIn("CANON-7777", scores)
        high, low = scores["CANON-0042"], scores["CANON-7777"]

        # --- 1. every breakdown factor matches an independent recomputation
        exp_high = self._expected_breakdown(
            case_days=[5, 10, 20], crime_types=["Burglary", "Burglary", "Dacoity"],
            n_cases=3, n_co_accused=1, has_warrant=True)
        exp_low = self._expected_breakdown(
            case_days=[400], crime_types=["Public nuisance"],
            n_cases=1, n_co_accused=0, has_warrant=False)
        for factor, expected in exp_high.items():
            self.assertAlmostEqual(high["breakdown"][factor], expected, places=3,
                                   msg=f"high-priority '{factor}' not reproducible")
        for factor, expected in exp_low.items():
            self.assertAlmostEqual(low["breakdown"][factor], expected, places=3,
                                   msg=f"low-priority '{factor}' not reproducible")

        # --- 2. total_score is exactly the weighted sum of the RETURNED
        #        breakdown (the explainability contract: an officer reading
        #        the response can recompute the number shown).
        for profile in (high, low):
            recomputed = (self.WEIGHTS["w_recency"] * profile["breakdown"]["recency"]
                          + self.WEIGHTS["w_severity"] * profile["breakdown"]["severity"]
                          + self.WEIGHTS["w_centrality"] * profile["breakdown"]["centrality"]
                          + self.WEIGHTS["w_warrant"] * profile["breakdown"]["warrant"])
            self.assertAlmostEqual(
                profile["total_score"], recomputed, delta=0.005,
                msg=f"{profile['canonical_id']}: total_score "
                    f"{profile['total_score']} != weighted sum of its own "
                    f"breakdown {recomputed:.4f}")

        # --- 3. and the same total from raw inputs, end to end.
        hand_high = sum(self.WEIGHTS[f"w_{k}"] * v for k, v in exp_high.items())
        hand_low = sum(self.WEIGHTS[f"w_{k}"] * v for k, v in exp_low.items())
        self.assertAlmostEqual(high["total_score"], hand_high, delta=0.005)
        self.assertAlmostEqual(low["total_score"], hand_low, delta=0.005)

        # --- 4. ordering + the transparency variables.
        self.assertGreater(high["total_score"], low["total_score"])
        self.assertEqual(high["variables"]["prior_cases"], 3)
        self.assertEqual(high["variables"]["co_accused_count"], 1)
        self.assertTrue(high["variables"]["has_active_warrant"])
        self.assertEqual(low["variables"]["prior_cases"], 1)
        self.assertEqual(low["variables"]["co_accused_count"], 0)
        self.assertFalse(low["variables"]["has_active_warrant"])

    def test_priority_default_weights_are_unit(self):
        """With no weights given, total must equal the plain sum of factors."""
        resp = self.client.post(
            "/server/graph_fn/priority", json={},
            headers={"authorization": "Bearer role_SI"})
        self.assertEqual(resp.status_code, 200)
        for s in resp.json()["scores"]:
            plain_sum = sum(s["breakdown"].values())
            self.assertAlmostEqual(s["total_score"], plain_sum, delta=0.005,
                                   msg=f"{s['canonical_id']}: default-weight total "
                                       f"not the sum of its breakdown")

    # ------------------------------------------------------------------
    # /hotspots
    # ------------------------------------------------------------------

    def test_hotspots_cluster_detection_and_isolation(self):
        # Seeded geometry: HP-1/HP-2/HP-3 sit within ~0.007 deg of each other
        # (well inside the ~10km / 0.1 deg radius); LP-1 is ~340km away in
        # Belagavi and must NOT be folded into the cluster.
        resp = self.client.post(
            "/server/graph_fn/hotspots",
            headers={"authorization": "Bearer role_SI"})
        self.assertEqual(resp.status_code, 200)
        hotspots = resp.json()["hotspots"]

        self.assertEqual(len(hotspots), 2,
                         msg=f"expected exactly 2 clusters, got {hotspots}")

        dense, isolated = hotspots[0], hotspots[1]  # sorted by density desc

        # The tight cluster: all three seeded incidents, nothing else.
        self.assertEqual(dense["density"], 3)
        self.assertEqual(set(dense["case_ids"]), {"HP-1", "HP-2", "HP-3"})
        # Burglary is 2 of the 3 -> primary crime.
        self.assertEqual(dense["primary_crime"], "Burglary")
        # Centroid is the mean of the member coordinates.
        self.assertAlmostEqual(dense["latitude"],
                               (12.960 + 12.965 + 12.958) / 3, places=3)
        self.assertAlmostEqual(dense["longitude"],
                               (77.600 + 77.605 + 77.598) / 3, places=3)

        # The isolated incident stands alone -- not swallowed by the cluster.
        self.assertEqual(isolated["density"], 1)
        self.assertEqual(isolated["case_ids"], ["LP-1"])
        self.assertNotIn("LP-1", dense["case_ids"])

    def test_hotspots_rbac_allows_analyst(self):
        """/hotspots is aggregate analytics -- Analyst must be allowed."""
        resp = self.client.post(
            "/server/graph_fn/hotspots",
            headers={"authorization": "Bearer role_Analyst"})
        self.assertEqual(resp.status_code, 200)


class ExportTests(unittest.TestCase):
    """
    PDF export (SmartBrowz) coverage. Locally there are no Catalyst
    credentials, so the contract under test is: ConversationLog rows are
    actually written by /route (the audit found the table previously
    unwritten by any code), the composed export is complete and correct,
    and the endpoint declares its mode honestly via X-Pramaan-Export-Mode
    (smartbrowz_pdf live, fallback_html_no_smartbrowz here) instead of
    fabricating a PDF.
    """

    def setUp(self):
        import repositories as repo_module
        self.fake_repo = FakeRepo(
            persons=list(repo_module.MOCK_PERSONS),
            cases=list(repo_module.MOCK_CASES),
            links=list(repo_module.MOCK_LINKS),
            warrants=list(repo_module.MOCK_WARRANTS),
        )
        self._orig_repo = app_module.repo
        app_module.repo = self.fake_repo
        self.client = TestClient(app)

    def tearDown(self):
        app_module.repo = self._orig_repo

    def test_route_writes_conversation_log(self):
        """/route must persist a ConversationLog row with cited record IDs."""
        from unittest import mock
        from routers import intent_router_fn as ir

        canned_classification = {
            "intent": "case-similarity-search",
            "case_similarity_target_id": "CASE-001",
            "case_similarity_top_k": 2,
        }

        class _FakeDownstream:
            status_code = 200
            def json(self):
                return {"top_matches": [{"case_id": "CASE-002"}],
                        "flagged_linkages": [{"case_id": "CASE-005"}]}

        with mock.patch.dict("os.environ", {"GEMINI_API_KEY": "test-key"}), \
             mock.patch.object(ir, "call_llm", return_value=canned_classification), \
             mock.patch.object(ir.requests, "post", return_value=_FakeDownstream()):
            resp = self.client.post(
                "/server/intent_router_fn/route",
                json={"query": "CASE-001 ಗೆ ಹೋಲುವ ಕಳ್ಳತನ ಪ್ರಕರಣಗಳನ್ನು ಹುಡುಕಿ"},
                headers={"authorization": "Bearer role_SI",
                         "x-zc-session-id": "session-test-77"})

        self.assertEqual(resp.status_code, 200)
        rows = self.fake_repo.conversation_rows
        self.assertEqual(len(rows), 1, "exactly one ConversationLog row per answered query")
        row = rows[0]
        self.assertEqual(row["session_id"], "session-test-77")
        self.assertEqual(row["role"], "SI")
        self.assertIn("ಹೋಲುವ ಕಳ್ಳತನ", row["query_text"])  # Kannada preserved verbatim
        cited = json.loads(row["cited_record_ids"])
        # Evidence-composer rule: the answer's grounding records are cited.
        self.assertIn("CASE-001", cited)
        self.assertIn("CASE-002", cited)
        self.assertIn("CASE-005", cited)

    def test_conversation_pdf_export(self):
        # Empty history must fail loudly, not produce a padded document.
        resp = self.client.post(
            "/server/export_fn/conversation_pdf", json={},
            headers={"authorization": "Bearer role_SI"})
        self.assertEqual(resp.status_code, 404)

        # Seed two rows (one Kannada) and export.
        self.fake_repo.insert_conversation_log(
            session_id="session-test-77", user_id="local-test-user", role="SI",
            query_text="Find similar burglary cases to CASE-001",
            response_text="{}", cited_record_ids='["CASE-001", "CASE-002"]')
        self.fake_repo.insert_conversation_log(
            session_id="session-test-77", user_id="local-test-user", role="SI",
            query_text="CANON-0042 ಜೊತೆ ಯಾರು ಸಂಪರ್ಕದಲ್ಲಿದ್ದಾರೆ?",
            response_text="{}", cited_record_ids='["CANON-0042"]')

        resp = self.client.post(
            "/server/export_fn/conversation_pdf",
            json={"session_id": "session-test-77"},
            headers={"authorization": "Bearer role_SI"})
        self.assertEqual(resp.status_code, 200)
        # No Catalyst credentials here -> mode must say so, honestly.
        self.assertEqual(resp.headers["X-Pramaan-Export-Mode"],
                         "fallback_html_no_smartbrowz")
        body = resp.text
        self.assertIn("Find similar burglary cases to CASE-001", body)
        self.assertIn("ಸಂಪರ್ಕದಲ್ಲಿದ್ದಾರೆ", body)   # Kannada rendered, not translated
        self.assertIn("CASE-002", body)             # cited records printed
        self.assertIn("Conversation History Export", body)

    def test_dossier_pdf_export(self):
        # RBAC: a dossier is person-level case data -- Analyst must be denied,
        # and the denial itself must land in the audit trail.
        resp = self.client.post(
            "/server/export_fn/dossier_pdf", json={"case_id": "CASE-001"},
            headers={"authorization": "Bearer role_Analyst"})
        self.assertEqual(resp.status_code, 403)
        self.assertTrue(any(a["decision"] == "deny" for a in self.fake_repo.audit_rows))

        # Unknown case fails loudly.
        resp = self.client.post(
            "/server/export_fn/dossier_pdf", json={"case_id": "CASE-999"},
            headers={"authorization": "Bearer role_SI"})
        self.assertEqual(resp.status_code, 404)

        # Real dossier for CASE-001.
        resp = self.client.post(
            "/server/export_fn/dossier_pdf", json={"case_id": "CASE-001"},
            headers={"authorization": "Bearer role_SI"})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.headers["X-Pramaan-Export-Mode"],
                         "fallback_html_no_smartbrowz")
        body = resp.text
        self.assertIn("Court-Ready Case Dossier", body)
        self.assertIn("CASE-001", body)
        # Section 2: resolved suspect via canonical identity.
        self.assertIn("CANON-0042", body)
        self.assertIn("Mohammad Rafi", body)
        # Section 3: case-twin evidence actually computed (top match present).
        self.assertIn("Case-twin similarity evidence", body)
        self.assertIn("CASE-002", body)
        # Sections 4-6 present.
        self.assertIn("Associate clusters", body)
        self.assertIn("Spatial hotspots", body)
        self.assertIn("HOTSPOT-1", body)
        self.assertIn("Access audit trail", body)
        # The denied Analyst attempt above is part of the printed trail.
        self.assertIn("deny", body)


class RateLimitAndRoleTests(unittest.TestCase):
    """
    Task 4 loose ends:
      (a) the rate limiter is now attached to the REAL router endpoints
          (not the dead @app.post duplicates that FastAPI shadowed), so it
          actually fires; and
      (b) CatalystRepository resolves the Policy role to the exact string
          the gateway enum expects ("Policy", never "Policy Maker"), so RBAC
          for that role does not silently break.
    """

    def _reset_limiter(self):
        try:
            from rate_limit import limiter
            limiter._storage.reset()
        except Exception:
            pass

    def setUp(self):
        import repositories as repo_module
        self.fake_repo = FakeRepo(
            persons=list(repo_module.MOCK_PERSONS),
            cases=list(repo_module.MOCK_CASES),
            links=list(repo_module.MOCK_LINKS),
            warrants=list(repo_module.MOCK_WARRANTS),
        )
        self._orig_repo = app_module.repo
        app_module.repo = self.fake_repo
        self.client = TestClient(app)
        self._reset_limiter()   # start from a clean window

    def tearDown(self):
        app_module.repo = self._orig_repo
        self._reset_limiter()   # don't leak consumed budget into other tests

    _RESOLVE_BODY = {
        "record_a": {"source_id": "a", "source_table": "fir", "name": "Ramesh Kumar", "age": 30},
        "record_b": {"source_id": "b", "source_table": "fir", "name": "Suresh Reddy", "age": 41},
    }

    # ------------------------------------------------------------------ (a)

    def test_rate_limit_actually_fires_on_burst(self):
        """
        Exceeding 30/minute on the real /resolve handler returns 429 -- proof
        the limit is live on the router endpoint, not the shadowed @app.post
        duplicate that never fired. The 31st/32nd calls in the same window are
        rejected; health (unlimited) keeps answering.
        """
        codes = []
        for _ in range(32):
            r = self.client.post(
                "/server/entity_resolution_fn/resolve",
                json=self._RESOLVE_BODY,
                headers={"authorization": "Bearer role_SI"})
            codes.append(r.status_code)
        self.assertEqual(codes[:30], [200] * 30,
                         f"first 30 should pass, got {codes[:30]}")
        self.assertIn(429, codes, f"limit never fired; codes={codes}")

        # An unlimited endpoint is unaffected even after the burst.
        health = self.client.get("/server/entity_resolution_fn/health")
        self.assertEqual(health.status_code, 200)

    # ------------------------------------------------------------------ (b)

    def test_policy_role_string_matches_gateway_enum(self):
        """
        The real CatalystRepository (fallback mode here) must map a Policy
        auth header to "Policy" -- the exact gateway enum value -- not
        "Policy Maker", which would raise ValueError and break RBAC.
        """
        from repositories import CatalystRepository
        from routers import gateway_fn
        repo = CatalystRepository()  # no live Catalyst -> fallback mode

        role = repo.get_user_role({"authorization": "Bearer role_Policy"})
        self.assertEqual(role, "Policy")
        # The string must be a valid Role enum member (no ValueError).
        self.assertEqual(gateway_fn.Role(role), gateway_fn.Role.POLICY)
        # And the header-less fallback default is a real role, not a bad string.
        self.assertEqual(gateway_fn.Role(repo.get_user_role({})),
                         gateway_fn.Role.ANALYST)

    def test_policy_role_recognized_and_authorized_for_its_permission(self):
        """
        End to end via gateway_fn/check_access: a Policy user IS allowed the
        permission the role actually holds (district_rollup) -- a 200 with
        allowed=True. Under a "Policy Maker" mismatch this same call would
        instead 403 with "Invalid role", so this is a direct regression guard.
        """
        resp = self.client.post(
            "/server/gateway_fn/check_access",
            json={"resource": "district_rollup"},
            headers={"authorization": "Bearer role_Policy"})
        self.assertEqual(resp.status_code, 200, resp.text)
        body = resp.json()
        self.assertTrue(body["allowed"])
        self.assertEqual(body["role"], "Policy")


if __name__ == "__main__":
    unittest.main()
