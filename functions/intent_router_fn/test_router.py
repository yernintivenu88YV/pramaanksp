"""
test_router.py

Verifies intent_router_fn handler logic locally by mocking the Flask request
and checking classifications.
"""

import sys
import os
import json
from unittest.mock import MagicMock

# Set console output encoding to utf-8 to prevent cp1252 errors on Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass


# Setup path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load local environment if any
for path in ['.env', os.path.expanduser('~/.env')]:
    if os.path.exists(path):
        with open(path) as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    parts = line.strip().split('=', 1)
                    if len(parts) == 2:
                        os.environ[parts[0].strip()] = parts[1].strip()

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

sys.modules['zcatalyst_sdk'] = MagicMock()
import zcatalyst_sdk
zcatalyst_sdk.initialize.return_value = MockApp()

# Now import handler
from main import handler, call_llm

def test_routing_stub():
    # Test stub check
    gemini_key = os.getenv("GEMINI_API_KEY")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    
    if not gemini_key and not anthropic_key:
        print("WARNING: No LLM keys found in environment. Skipping live API call.")
        return

    print("Running live LLM classification tests...")
    
    # 1. Test case-similarity-search intent (English)
    q1 = "Find similar burglary cases to CASE-001"
    res1 = call_llm(q1, gemini_key=gemini_key, anthropic_key=anthropic_key)
    print(f"\nQuery: '{q1}'")
    print(f"Classified Intent: {res1.get('intent')}")
    print(f"Extracted parameters: {json.dumps(res1, indent=2)}")
    assert res1.get('intent') == "case-similarity-search"
    assert res1.get('case_similarity_target_id') == "CASE-001"

    # 2. Test entity-lookup intent (Kannada)
    q2 = "ಮೊಹಮ್ಮದ್ ರಫಿ ಮತ್ತು ಮಹಮ್ಮದ್ ರಫಿ ಇವರ ಗುರುತುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ"
    res2 = call_llm(q2, gemini_key=gemini_key, anthropic_key=anthropic_key)
    print(f"\nQuery: '{q2}'")
    print(f"Classified Intent: {res2.get('intent')}")
    print(f"Extracted parameters: {json.dumps(res2, indent=2)}")
    assert res2.get('intent') == "entity-lookup"
    
    # Verify names are extracted and transliterated
    rec_a = res2.get('entity_lookup_record_a') or {}
    rec_b = res2.get('entity_lookup_record_b') or {}
    print(f"Extracted Record A Romanized Name: {rec_a.get('name')}")
    print(f"Extracted Record B Romanized Name: {rec_b.get('name')}")
    print(f"Extracted Record A Kannada Name: {rec_a.get('name_kannada')}")
    print(f"Extracted Record B Kannada Name: {rec_b.get('name_kannada')}")
    
    assert rec_a.get('name') is not None
    assert rec_b.get('name') is not None
    assert rec_a.get('name_kannada') == "ಮೊಹಮ್ಮದ್ ರಫಿ"
    assert rec_b.get('name_kannada') == "ಮಹಮ್ಮದ್ ರಫಿ"

    # 3. Test graph network extension point (English)
    q3 = "Who is linked to suspect CANON-0042?"
    res3 = call_llm(q3, gemini_key=gemini_key, anthropic_key=anthropic_key)
    print(f"\nQuery: '{q3}'")
    print(f"Classified Intent: {res3.get('intent')}")
    print(f"Extracted parameters: {json.dumps(res3, indent=2)}")
    assert res3.get('intent') == "graph-network-query"
    assert res3.get('graph_query_canonical_id') == "CANON-0042"

    print("\nAll live LLM tests completed successfully!")

if __name__ == "__main__":
    test_routing_stub()
