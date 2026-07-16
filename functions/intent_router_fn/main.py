import logging
import os
import json
import requests
from flask import Request, make_response, jsonify
import zcatalyst_sdk

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def get_gateway_url(app):
    is_local = os.getenv("X_ZOHO_CATALYST_IS_LOCAL") == "true" or os.getenv("CATALYST_ACTIVE_DC") is None
    if is_local:
        return "http://127.0.0.1:3000/server/gateway_fn"
    else:
        project_domain = app.config.get("project_domain")
        return f"https://{project_domain}/server/gateway_fn"

def verify_rbac(app, request: Request, resource_name: str) -> dict:
    gateway_url = get_gateway_url(app) + "/check_access"
    
    headers = {}
    for h in ('cookie', 'authorization', 'x-zc-session-id'):
        val = request.headers.get(h)
        if val:
            headers[h] = val
            
    try:
        resp = requests.post(gateway_url, json={"resource": resource_name}, headers=headers, timeout=5)
        if resp.status_code == 200:
            return {"allowed": True}
        elif resp.status_code == 403:
            return {"allowed": False, "error": resp.json().get("error") or "Access Denied: Forbidden resource"}
        else:
            return {"allowed": False, "error": f"Gateway error: {resp.status_code}"}
    except Exception as e:
        return {"allowed": False, "error": f"Failed to contact gateway: {str(e)}"}

def load_env():
    # Load keys from local or home directory .env file if present
    for path in ['.env', os.path.expanduser('~/.env')]:
        if os.path.exists(path):
            try:
                with open(path) as f:
                    for line in f:
                        if line.strip() and not line.startswith('#'):
                            parts = line.strip().split('=', 1)
                            if len(parts) == 2:
                                key, val = parts
                                os.environ[key.strip()] = val.strip()
            except Exception as e:
                logger.error(f"Error loading .env file from {path}: {e}")

# Pre-defined seed data as fallback if Data Store query returns empty
SEED_CASES = {
    "CASE-001": {
        "case_id": "CASE-001",
        "crime_type": "Burglary",
        "modus_operandi": "Rear window forced entry using crowbar, night time",
        "narrative_text": "Complainant reported burglary at residence. Entry made through rear window using a crowbar. Occurred between 1 AM and 3 AM. Jewelry and cash stolen.",
        "latitude": 12.9352,
        "longitude": 77.6245,
        "date_time": "2026-07-11T02:00:00",
        "weapon": "crowbar",
        "canonical_suspect_ids": ["CANON-0042"]
    },
    "CASE-002": {
        "case_id": "CASE-002",
        "crime_type": "Burglary",
        "modus_operandi": "Rear window entry with crowbar, late night",
        "narrative_text": "Victim reported house burglary. Entry via rear window using a crowbar, between midnight and 2 AM. Cash and gold ornaments stolen.",
        "latitude": 12.9784,
        "longitude": 77.6408,
        "date_time": "2026-07-04T01:30:00",
        "weapon": "crowbar",
        "canonical_suspect_ids": []
    },
    "CASE-003": {
        "case_id": "CASE-003",
        "crime_type": "Burglary",
        "modus_operandi": "Front door lock picked during daytime while owners away",
        "narrative_text": "Complainant returned home to find front door lock picked and valuables missing during daytime hours.",
        "latitude": 12.9600,
        "longitude": 77.6100,
        "date_time": "2026-07-07T14:00:00",
        "weapon": None,
        "canonical_suspect_ids": []
    },
    "CASE-004": {
        "case_id": "CASE-004",
        "crime_type": "Chain snatching",
        "modus_operandi": "Snatched gold chain from pedestrian on motorbike",
        "narrative_text": "Victim was walking on the street when two men on a motorbike snatched her gold chain and fled.",
        "latitude": 12.2958,
        "longitude": 76.6394,
        "date_time": "2026-07-08T11:00:00",
        "weapon": None,
        "canonical_suspect_ids": []
    },
    "CASE-005": {
        "case_id": "CASE-005",
        "crime_type": "Vehicle theft",
        "modus_operandi": "Motorcycle stolen from parking area",
        "narrative_text": "Complainant's motorcycle was stolen from outside a shopping complex.",
        "latitude": 13.0827,
        "longitude": 77.5877,
        "date_time": "2026-06-01T16:00:00",
        "weapon": None,
        "canonical_suspect_ids": ["CANON-0042"]
    }
}

def fetch_case_data(app, case_id: str) -> dict:
    # 1. Attempt database lookup
    try:
        zcql = app.zcql()
        query = f"SELECT * FROM Case WHERE case_id = '{case_id}'"
        rows = zcql.execute_query(query)
        if rows:
            case_info = rows[0].get("Case") or {}
            # Fetch links
            link_query = f"SELECT canonical_id FROM CasePersonLink WHERE case_id = '{case_id}'"
            links = zcql.execute_query(link_query)
            suspects = [l.get("CasePersonLink", {}).get("canonical_id") for l in links if l.get("CasePersonLink")]
            
            return {
                "case_id": case_info.get("case_id"),
                "crime_type": case_info.get("crime_type"),
                "modus_operandi": case_info.get("modus_operandi"),
                "narrative_text": case_info.get("narrative_text"),
                "latitude": float(case_info.get("latitude") or 0.0),
                "longitude": float(case_info.get("longitude") or 0.0),
                "date_time": case_info.get("date_time"),
                "weapon": case_info.get("weapon"),
                "canonical_suspect_ids": suspects
            }
    except Exception as e:
        logger.error(f"Database query failed for case {case_id}: {e}")
    
    # 2. Fallback to seed data
    return SEED_CASES.get(case_id)

def fetch_all_other_cases(app, target_id: str) -> list:
    candidates = []
    # 1. Attempt database lookup
    try:
        zcql = app.zcql()
        query = f"SELECT case_id FROM Case WHERE case_id != '{target_id}'"
        rows = zcql.execute_query(query)
        if rows:
            for r in rows:
                c_id = r.get("Case", {}).get("case_id")
                if c_id:
                    c_data = fetch_case_data(app, c_id)
                    if c_data:
                        candidates.append(c_data)
            if candidates:
                return candidates
    except Exception as e:
        logger.error(f"Database query failed for other cases: {e}")

    # 2. Fallback to seed data
    return [val for key, val in SEED_CASES.items() if key != target_id]

def call_llm(query: str, gemini_key: str = None, anthropic_key: str = None) -> dict:
    system_instruction = (
        "You are a structured intent classifier for Pramaan, a police crime intelligence platform.\n"
        "Your task is to classify user query intents and extract parameters strictly into JSON matching the schema.\n"
        "Available intents:\n"
        "1. 'entity-lookup': Triggered when the user asks to link, verify, or resolve names, phone numbers, or vehicle registrations (implies resolving two identity records).\n"
        "2. 'case-similarity-search': Triggered when the user asks to find cases similar to a target case or case ID (e.g. 'similar burglary cases to CASE-001').\n"
        "3. 'graph-network-query': Triggered when the user asks for relationships, links, networks, associates, or gang members linked to a suspect or canonical ID (e.g. 'linked to CANON-0042').\n"
        "\n"
        "Response Schema:\n"
        "{\n"
        "  \"intent\": \"entity-lookup\" | \"case-similarity-search\" | \"graph-network-query\",\n"
        "  \"entity_lookup_record_a\": { \"name\": string, \"name_kannada\": string, \"age\": int, \"gender\": string, \"address\": string, \"phone\": string, \"vehicle_reg\": string },\n"
        "  \"entity_lookup_record_b\": { \"name\": string, \"name_kannada\": string, \"age\": int, \"gender\": string, \"address\": string, \"phone\": string, \"vehicle_reg\": string },\n"
        "  \"case_similarity_target_id\": string,\n"
        "  \"case_similarity_top_k\": int,\n"
        "  \"graph_query_canonical_id\": string\n"
        "}\n"
        "\n"
        "Transliteration Rule for Kannada names:\n"
        "If a name in the query is written in Kannada script (e.g. 'ಮೊಹಮ್ಮದ್ ರಫಿ' or 'ಮಹಮ್ಮದ್ ರಫಿ'), extract the original Kannada script into 'name_kannada' and provide a romanized transliteration (e.g. 'Mohammad Rafi' or 'Mahammad Rafi') in 'name'. If the name is in English, set 'name_kannada' to null and populate 'name'.\n"
        "Always respond with a valid JSON object matching this schema. If any parameter field is missing or not mentioned, set it to null or default. Return only raw JSON, no markdown formatting."
    )

    if gemini_key:
        import google.generativeai as genai
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel("gemini-3.1-flash-lite")
        response = model.generate_content(
            contents=[
                {"role": "user", "parts": [system_instruction, f"User query: {query}"]}
            ]
        )
        text = response.text
        start_idx = text.find("{")
        end_idx = text.rfind("}") + 1
        if start_idx != -1 and end_idx != -1:
            return json.loads(text[start_idx:end_idx])
        else:
            return json.loads(text)
        
    elif anthropic_key:
        import anthropic
        client = anthropic.Anthropic(api_key=anthropic_key)
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1000,
            system=system_instruction,
            messages=[
                {"role": "user", "content": f"User query: {query}"}
            ]
        )
        # Parse JSON block out of response
        text = response.content[0].text
        start_idx = text.find("{")
        end_idx = text.rfind("}") + 1
        if start_idx != -1 and end_idx != -1:
            return json.loads(text[start_idx:end_idx])
        else:
            raise ValueError(f"Failed to find JSON block in Claude response: {text}")


    else:
        raise ValueError("No LLM API keys provided.")

def handler(request: Request):
    try:
        app = zcatalyst_sdk.initialize()

        if request.path == "/route" and request.method == "POST":
            # 1. Gate query with RBAC pre-check
            rbac_res = verify_rbac(app, request, "own_case_detail")
            if not rbac_res["allowed"]:
                return make_response(jsonify({"error": rbac_res["error"]}), 403)

            body = request.get_json() or {}
            query = body.get("query")
            if not query:
                return make_response(jsonify({"error": "Missing 'query' parameter"}), 400)

            # 2. Check and load credentials
            load_env()
            gemini_key = os.getenv("GEMINI_API_KEY")
            anthropic_key = os.getenv("ANTHROPIC_API_KEY")

            if not gemini_key and not anthropic_key:
                return make_response(jsonify({
                    "error": "Missing LLM API credentials. Please set GEMINI_API_KEY or ANTHROPIC_API_KEY in the environment or a .env file."
                }), 400)

            # 3. Call LLM for intent classification
            try:
                classification = call_llm(query, gemini_key=gemini_key, anthropic_key=anthropic_key)
            except Exception as llm_err:
                logger.error(f"LLM classification failed: {llm_err}")
                return make_response(jsonify({"error": f"LLM reasoning failed: {str(llm_err)}"}), 500)

            intent = classification.get("intent")
            logger.info(f"Classified intent: {intent}")

            # 4. Route based on intent
            is_local = os.getenv("X_ZOHO_CATALYST_IS_LOCAL") == "true" or os.getenv("CATALYST_ACTIVE_DC") is None
            base_url = "http://127.0.0.1:3000/server" if is_local else f"https://{app.config.get('project_domain')}/server"

            # Forward auth headers
            headers = {}
            for h in ('cookie', 'authorization', 'x-zc-session-id'):
                val = request.headers.get(h)
                if val:
                    headers[h] = val

            if intent == "entity-lookup":
                rec_a = classification.get("entity_lookup_record_a") or {}
                rec_b = classification.get("entity_lookup_record_b") or {}
                
                # Make sure name is populated (minimum requirement)
                if not rec_a.get("name") or not rec_b.get("name"):
                    return make_response(jsonify({
                        "error": "Invalid intent parameters: Both record names must be specified for entity-lookup.",
                        "classification": classification
                    }), 400)

                # Set required metadata defaults for Pydantic schema validation
                rec_a.setdefault("source_id", "router-query-a")
                rec_a.setdefault("source_table", "query")
                rec_b.setdefault("source_id", "router-query-b")
                rec_b.setdefault("source_table", "query")

                payload = {
                    "record_a": rec_a,
                    "record_b": rec_b
                }
                resp = requests.post(f"{base_url}/entity_resolution_fn/resolve", json=payload, headers=headers, timeout=10)
                
                return make_response(jsonify({
                    "intent": "entity-lookup",
                    "classification": classification,
                    "status_code": resp.status_code,
                    "response": resp.json() if resp.status_code == 200 else resp.text
                }), resp.status_code)

            elif intent == "case-similarity-search":
                target_id = classification.get("case_similarity_target_id")
                top_k = classification.get("case_similarity_top_k") or 2
                
                if not target_id:
                    return make_response(jsonify({
                        "error": "Invalid intent parameters: Missing target case ID for case-similarity-search.",
                        "classification": classification
                    }), 400)

                target = fetch_case_data(app, target_id)
                if not target:
                    return make_response(jsonify({
                        "error": f"Target case '{target_id}' could not be resolved from DB or seeds.",
                        "classification": classification
                    }), 404)

                candidates = fetch_all_other_cases(app, target_id)
                payload = {
                    "target": target,
                    "candidates": candidates,
                    "top_k": top_k
                }
                resp = requests.post(f"{base_url}/case_twin_fn/match", json=payload, headers=headers, timeout=15)
                
                return make_response(jsonify({
                    "intent": "case-similarity-search",
                    "classification": classification,
                    "status_code": resp.status_code,
                    "response": resp.json() if resp.status_code == 200 else resp.text
                }), resp.status_code)

            elif intent == "graph-network-query":
                canonical_id = classification.get("graph_query_canonical_id")
                return make_response(jsonify({
                    "intent": "graph-network-query",
                    "classification": classification,
                    "parameters": {"canonical_id": canonical_id},
                    "message": "Graph network queries are routed to graph_fn (extension point ready, to be implemented in Task 4)"
                }), 200)

            else:
                return make_response(jsonify({
                    "error": f"Unknown or unrouted intent: '{intent}'",
                    "classification": classification
                }), 400)

        elif request.path == "/health" and request.method == "GET":
            return make_response(jsonify({
                "status": "ok", 
                "module": "intent_router_fn"
            }), 200)

        else:
            return make_response(jsonify({"error": "Not found"}), 404)

    except Exception as e:
        logger.exception(f"Unhandled exception in intent_router_fn: {e}")
        return make_response(jsonify({"error": str(e)}), 500)
