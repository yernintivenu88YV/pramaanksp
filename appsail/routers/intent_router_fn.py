import json
import logging
import os
from typing import Optional, Dict, Any
from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel
import requests

from rate_limit import limiter
from . import bhashini

logger = logging.getLogger("appsail.intent_router")
router = APIRouter(prefix="/server/intent_router_fn")

class RouteRequest(BaseModel):
    query: str

class VoiceRequest(BaseModel):
    audio_base64: str
    source_language: Optional[str] = "kn"
    tts: Optional[bool] = True

# Pre-defined seed cases for fallback matching
SEED_CASES = {
    "CASE-001": {
        "case_id": "CASE-001",
        "fir_number": "FIR-2026-0001",
        "station_id": "STATION-BGLR-CENTRAL",
        "crime_type": "Burglary",
        "modus_operandi": "Rear window forced entry using crowbar",
        "narrative_text": "Rear window forced entry using crowbar, night time. Suspect fled with gold assets.",
        "latitude": 12.9579,
        "longitude": 77.6251,
        "date_time": "2026-01-10T03:30:00",
        "weapon": None,
        "canonical_suspect_ids": ["CANON-0042"]
    },
    "CASE-002": {
        "case_id": "CASE-002",
        "fir_number": "FIR-2026-0002",
        "station_id": "STATION-BGLR-CENTRAL",
        "crime_type": "Burglary",
        "modus_operandi": "Rear window forced entry using crowbar, night time",
        "narrative_text": "Rear window forced entry using crowbar, night time. Locked residence targeted.",
        "latitude": 12.9592,
        "longitude": 77.6235,
        "date_time": "2026-01-15T02:15:00",
        "weapon": None,
        "canonical_suspect_ids": ["CANON-0042"]
    },
    "CASE-005": {
        "case_id": "CASE-005",
        "fir_number": "FIR-2026-0005",
        "station_id": "STATION-BGLR-NORTH",
        "crime_type": "Vehicle theft",
        "modus_operandi": "Motorcycle stolen from parking area",
        "narrative_text": "Complainant's motorcycle was stolen from outside a shopping complex.",
        "latitude": 13.0827,
        "longitude": 77.5877,
        "date_time": "2026-02-10T18:30:00",
        "weapon": None,
        "canonical_suspect_ids": ["CANON-0042"]
    }
}

def load_env():
    for path in ['.env', os.path.expanduser('~/.env')]:
        if os.path.exists(path):
            try:
                with open(path) as f:
                    for line in f:
                        if line.strip() and not line.startswith('#'):
                            parts = line.strip().split('=', 1)
                            if len(parts) == 2:
                                os.environ[parts[0].strip()] = parts[1].strip()
            except Exception as e:
                logger.error(f"Error loading .env: {e}")

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
        text = response.content[0].text
        start_idx = text.find("{")
        end_idx = text.rfind("}") + 1
        if start_idx != -1 and end_idx != -1:
            return json.loads(text[start_idx:end_idx])
        raise ValueError(f"Failed to find JSON block in Claude response: {text}")

    raise ValueError("No LLM API keys provided.")

def _extract_cited_ids(result: dict) -> list:
    """
    Record IDs the answer is grounded in -- the evidence-composer rule is
    that cited_record_ids is never empty for a real answer (see
    ConversationLog in data_store_schema.sql). Best-effort per intent; the
    intent name itself is the last-resort citation.
    """
    cited = []
    intent = result.get("intent")
    cls = result.get("classification") or {}
    resp = result.get("response") if isinstance(result.get("response"), dict) else {}

    if intent == "case-similarity-search":
        if cls.get("case_similarity_target_id"):
            cited.append(cls["case_similarity_target_id"])
        for m in (resp.get("top_matches") or []):
            cited.append(m.get("case_id"))
        for m in (resp.get("flagged_linkages") or []):
            cited.append(m.get("case_id"))
    elif intent == "graph-network-query":
        if cls.get("graph_query_canonical_id"):
            cited.append(cls["graph_query_canonical_id"])
        for n in (resp.get("nodes") or []):
            cited.append(n.get("id"))
    elif intent == "entity-lookup":
        for key in ("entity_lookup_record_a", "entity_lookup_record_b"):
            rec = cls.get(key) or {}
            if rec.get("source_id"):
                cited.append(rec["source_id"])
        if resp.get("canonical_id"):
            cited.append(resp["canonical_id"])

    cited = list(dict.fromkeys(c for c in cited if c))
    return cited or ([intent] if intent else [])


def _log_conversation(request: Request, query_text: str, result: dict):
    """
    Persist one ConversationLog row per answered query. This feeds the
    conversation-history PDF export (export_fn); logging failures must never
    break the answer itself, so this swallows and reports its own errors.
    """
    try:
        repo = request.state.repo
        headers = dict(request.headers)
        session_id = (headers.get("x-zc-session-id")
                      or headers.get("cookie")
                      or "session-unknown")
        repo.insert_conversation_log(
            session_id=session_id,
            user_id=repo.get_user_id(headers),
            role=repo.get_user_role(headers),
            query_text=query_text,
            response_text=json.dumps(result, ensure_ascii=False, default=str)[:4000],
            cited_record_ids=json.dumps(_extract_cited_ids(result), ensure_ascii=False),
        )
    except Exception as e:
        logger.error(f"Conversation logging failed (answer unaffected): {e}")


def _speech_summary(route_json: dict) -> str:
    if not isinstance(route_json, dict) or route_json.get("error"):
        return "Sorry, that request could not be completed."
    intent = route_json.get("intent")
    spoken = {
        "entity-lookup": "Running an identity resolution lookup.",
        "case-similarity-search": "Searching for similar cases.",
        "graph-network-query": "Looking up the suspect network.",
    }
    return spoken.get(intent, "Your request has been processed.")

@router.get("/health")
def health():
    return {"status": "ok", "module": "intent_router_fn"}

@router.post("/route")
@limiter.limit("20/minute")
def route(req: RouteRequest, request: Request):
    load_env()
    gemini_key = os.getenv("GEMINI_API_KEY")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    
    classification = None
    if not gemini_key and not anthropic_key:
        logger.warning("No LLM keys found in environment. Falling back to rule-based classification.")
        # Rule-based fallback classifier
        query_lower = req.query.lower()
        if "similar" in query_lower or "similarity" in query_lower or "ಹೋಲುವ" in query_lower or "case-" in query_lower:
            import re
            m = re.search(r"case-\d+", query_lower)
            target_id = m.group(0).upper() if m else "CASE-001"
            classification = {
                "intent": "case-similarity-search",
                "case_similarity_target_id": target_id,
                "case_similarity_top_k": 3
            }
        elif "lookup" in query_lower or "resolve" in query_lower or "entity" in query_lower or "ಹೋಲಿಕೆ" in query_lower:
            classification = {
                "intent": "entity-lookup",
                "entity_lookup_record_a": {"name": "Ramesh"},
                "entity_lookup_record_b": {"name": "Ramesha"}
            }
        elif "network" in query_lower or "traverse" in query_lower or "graph" in query_lower or "ಸಂಪರ್ಕ" in query_lower or "canon-" in query_lower:
            import re
            m = re.search(r"canon-\d+", query_lower)
            canon_id = m.group(0).upper() if m else "CANON-0042"
            classification = {
                "intent": "graph-network-query",
                "graph_query_canonical_id": canon_id
            }
        else:
            classification = {
                "intent": "case-similarity-search",
                "case_similarity_target_id": "CASE-001",
                "case_similarity_top_k": 3
            }
    else:
        try:
            classification = call_llm(req.query, gemini_key=gemini_key, anthropic_key=anthropic_key)
        except Exception as e:
            logger.error(f"LLM classification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"LLM reasoning failed: {str(e)}"
            )
        
    intent = classification.get("intent")
    logger.info(f"Classified intent: {intent}")
    
    base_url = str(request.base_url).rstrip("/")
    headers = {"Content-Type": "application/json"}
    for h in ('cookie', 'authorization', 'x-zc-session-id'):
        val = request.headers.get(h)
        if val:
            headers[h] = val
            
    if intent == "entity-lookup":
        rec_a = classification.get("entity_lookup_record_a") or {}
        rec_b = classification.get("entity_lookup_record_b") or {}
        
        if not rec_a.get("name") or not rec_b.get("name"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "Invalid intent parameters: Both record names must be specified for entity-lookup.",
                    "classification": classification
                }
            )
            
        rec_a.setdefault("source_id", "router-query-a")
        rec_a.setdefault("source_table", "query")
        rec_b.setdefault("source_id", "router-query-b")
        rec_b.setdefault("source_table", "query")
        
        payload = {"record_a": rec_a, "record_b": rec_b}
        resp = requests.post(f"{base_url}/server/entity_resolution_fn/resolve", json=payload, headers=headers, timeout=10)

        result = {
            "intent": "entity-lookup",
            "classification": classification,
            "status_code": resp.status_code,
            "response": resp.json() if resp.status_code == 200 else resp.text
        }
        _log_conversation(request, req.query, result)
        return result
        
    elif intent == "case-similarity-search":
        target_id = classification.get("case_similarity_target_id")
        top_k = classification.get("case_similarity_top_k") or 2
        
        if not target_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "Invalid intent parameters: Missing target case ID for case-similarity-search.",
                    "classification": classification
                }
            )
            
        # Try database fetch, fall back to seed
        repo = request.state.repo
        cases = repo.fetch_cases()
        links = repo.fetch_links()
        
        target = None
        for c in cases:
            if c["case_id"] == target_id:
                target = c
                break
                
        if not target:
            target_data = SEED_CASES.get(target_id)
            if not target_data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail={
                        "error": f"Target case '{target_id}' could not be resolved from DB or seeds.",
                        "classification": classification
                    }
                )
            target = target_data
            
        # Build suspect canonical IDs for target
        target_suspects = [l["canonical_id"] for l in links if l["case_id"] == target["case_id"]]
        target["canonical_suspect_ids"] = target_suspects
        
        candidates = []
        for c in cases:
            if c["case_id"] == target["case_id"]:
                continue
            cand = dict(c)
            cand["canonical_suspect_ids"] = [l["canonical_id"] for l in links if l["case_id"] == c["case_id"]]
            candidates.append(cand)
            
        # Fallback to seed cases if candidates is empty
        if not candidates:
            candidates = [val for key, val in SEED_CASES.items() if key != target["case_id"]]
            
        payload = {
            "target": target,
            "candidates": candidates,
            "top_k": top_k
        }
        resp = requests.post(f"{base_url}/server/case_twin_fn/match", json=payload, headers=headers, timeout=15)

        result = {
            "intent": "case-similarity-search",
            "classification": classification,
            "status_code": resp.status_code,
            "response": resp.json() if resp.status_code == 200 else resp.text
        }
        _log_conversation(request, req.query, result)
        return result
        
    elif intent == "graph-network-query":
        canonical_id = classification.get("graph_query_canonical_id")
        if not canonical_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "Invalid intent parameters: Missing target canonical ID for graph-network-query.",
                    "classification": classification
                }
            )
            
        payload = {"canonical_id": canonical_id}
        resp = requests.post(f"{base_url}/server/graph_fn/traverse", json=payload, headers=headers, timeout=15)
        resp_json = resp.json() if resp.status_code == 200 else {}

        result = {
            "intent": "graph-network-query",
            "mode": resp_json.get("mode", "unknown"),
            "classification": classification,
            "status_code": resp.status_code,
            "response": resp_json if resp.status_code == 200 else resp.text
        }
        _log_conversation(request, req.query, result)
        return result
        
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Unknown or unrouted intent: '{intent}'"
    )

@router.post("/voice")
def voice(req: VoiceRequest, request: Request):
    asr_res = bhashini.asr(req.audio_base64, req.source_language)
    transcript = (asr_res.get("transcript") or "").strip()
    if not transcript:
        return {
            "transcript": "",
            "asr": {"mode": asr_res.get("mode"), "language": asr_res.get("language")},
            "error": "No transcript produced from audio. Set BHASHINI_* env variables for live ASR."
        }
        
    base_url = str(request.base_url).rstrip("/")
    headers = {"Content-Type": "application/json"}
    for h in ('cookie', 'authorization', 'x-zc-session-id'):
        val = request.headers.get(h)
        if val:
            headers[h] = val
            
    route_resp = requests.post(
        f"{base_url}/server/intent_router_fn/route",
        json={"query": transcript},
        headers=headers,
        timeout=30
    )
    
    try:
        route_json = route_resp.json()
    except Exception:
        route_json = {"raw": route_resp.text}
        
    speak_res = {"mode": "skipped"}
    if req.tts:
        speak_res = bhashini.tts(_speech_summary(route_json), asr_res.get("language", req.source_language))
        
    return {
        "transcript": transcript,
        "asr": {"mode": asr_res.get("mode"), "language": asr_res.get("language")},
        "route": route_json,
        "tts": speak_res
    }
