import unittest
from fastapi.testclient import TestClient

from app import app
from routers.entity_resolution_fn import MatchDecision

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

if __name__ == "__main__":
    unittest.main()
