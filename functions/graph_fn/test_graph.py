"""
test_graph.py

Verifies graph_fn handler logic locally by mocking the Flask request and
testing export, traversal, and community detection endpoints.
"""

import sys
import os
import json
from unittest.mock import MagicMock

# Setup path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Mock zcatalyst_sdk before import
class MockAuthentication:
    def get_current_user(self):
        return {
            "user_id": "test_user_123",
            "email_id": "si_test@pramaan.gov.in",
            "first_name": "Test",
            "last_name": "SI",
            "role_details": {"role_name": "SI"}
        }

class MockApp:
    def authentication(self):
        return MockAuthentication()
    def config(self):
        return {"project_domain": "localhost:3000"}
    
    def zcql(self):
        mock_zcql = MagicMock()
        # Mock rows for Catalyst Data Store
        mock_zcql.execute_query.side_effect = lambda query: []
        return mock_zcql

sys.modules['zcatalyst_sdk'] = MagicMock()
import zcatalyst_sdk
zcatalyst_sdk.initialize.return_value = MockApp()

from flask import Flask
import main
main.verify_rbac = MagicMock(return_value={"allowed": True})
from main import handler

def run_tests():
    app = Flask(__name__)
    with app.app_context():
        # Setup test request
        mock_request = MagicMock()
        mock_request.headers = {
            "x-zc-session-id": "test-session",
            "authorization": "Bearer dummy"
        }

        # 1. Test GET /health
        mock_request.path = "/health"
        mock_request.method = "GET"
        resp = handler(mock_request)
        print("GET /health status:", resp.status_code)
        print("GET /health body:", resp.get_data(as_text=True))
        assert resp.status_code == 200

        # 2. Test POST /traverse (should fallback to mock if no credentials)
        mock_request.path = "/traverse"
        mock_request.method = "POST"
        mock_request.get_json.return_value = {"canonical_id": "CANON-0042"}
        resp = handler(mock_request)
        print("\nPOST /traverse status:", resp.status_code)
        data = json.loads(resp.get_data(as_text=True))
        print("POST /traverse body (mode):", data.get("mode"))
        print("Relationships found:", len(data.get("relationships", [])))
        assert resp.status_code == 200
        assert data.get("canonical_id") == "CANON-0042"

        # 3. Test POST /communities (should fallback to mock if no credentials)
        mock_request.path = "/communities"
        mock_request.method = "POST"
        resp = handler(mock_request)
        print("\nPOST /communities status:", resp.status_code)
        data_comm = json.loads(resp.get_data(as_text=True))
        print("POST /communities body (mode):", data_comm.get("mode"))
        print("Total communities found:", len(data_comm.get("communities", [])))
        assert resp.status_code == 200
        assert len(data_comm.get("communities", [])) > 0

        # 4. Test POST /export
        mock_request.path = "/export"
        mock_request.method = "POST"
        resp = handler(mock_request)
        print("\nPOST /export status:", resp.status_code)
        data_exp = json.loads(resp.get_data(as_text=True))
        print("POST /export body:", data_exp)
        assert resp.status_code == 200
        assert "Export completed in Mock Mode" in data_exp.get("message")

        print("\nAll graph_fn local validation tests passed successfully!")

if __name__ == "__main__":
    run_tests()
