import json
import logging
import os
from datetime import datetime, timezone
import zcatalyst_sdk

logger = logging.getLogger("appsail.repository")
logger.setLevel(logging.INFO)


def _parse_embedding(raw):
    """Data Store holds the narrative vector as a JSON array string."""
    if not raw:
        return None
    if isinstance(raw, list):
        return raw
    try:
        vec = json.loads(raw)
        return vec if isinstance(vec, list) and vec else None
    except Exception:
        return None

# Structured mock/seed fallback data matching data_store_schema.sql
MOCK_PERSONS = [
    {
        "person_id": "FIR-0192-P1", "source_table": "fir", "role": "accused", 
        "name": "Mohammed Rafi", "age": 34, "gender": "male", "address": "12 MG Road, Vijayawada", 
        "phone": "98450 11223", "vehicle_reg": "KA-02-MB-1234", "prior_record_flag": True,
        "canonical_id": "CANON-0042"
    },
    {
        "person_id": "BANK-KYC-P3", "source_table": "financial", "role": "accused", 
        "name": "Mohammad Rafi", "age": 35, "gender": "male", "address": "12 M.G Road, Vijayawada", 
        "phone": "9845011223", "vehicle_reg": "KA-02-MB-1234", "prior_record_flag": False,
        "canonical_id": "CANON-0042"
    },
    {
        "person_id": "FIR-0733-P4", "source_table": "fir", "role": "accused", 
        "name": "S. Praveen Kumar", "age": 29, "gender": "male", "address": "45 Anna Nagar, Chennai", 
        "phone": "9900881122", "vehicle_reg": None, "prior_record_flag": True,
        "canonical_id": "CANON-0044"
    },
    {
        "person_id": "FIR-2010-P1", "source_table": "fir", "role": "accused", 
        "name": "Ramesh Gowda", "age": 30, "gender": "male", "address": "Mysuru", 
        "phone": None, "vehicle_reg": None, "prior_record_flag": False,
        "canonical_id": "CANON-0045"
    }
]

MOCK_CASES = [
    {
        "case_id": "CASE-001", "fir_number": "FIR-2026-0001", "station_id": "STATION-BGLR-CENTRAL",
        "crime_type": "Burglary", "modus_operandi": "Rear window forced entry using crowbar",
        "date_time": "2026-01-10 03:30:00", "status": "Under Investigation",
        "narrative_text": "Rear window forced entry using crowbar, night time. Suspect fled with gold assets.",
        "latitude": 12.9579, "longitude": 77.6251
    },
    {
        "case_id": "CASE-002", "fir_number": "FIR-2026-0002", "station_id": "STATION-BGLR-CENTRAL",
        "crime_type": "Burglary", "modus_operandi": "Rear window forced entry using crowbar, night time",
        "date_time": "2026-01-15 02:15:00", "status": "Under Investigation",
        "narrative_text": "Rear window forced entry using crowbar, night time. Locked residence targeted.",
        "latitude": 12.9592, "longitude": 77.6235
    },
    {
        "case_id": "CASE-003", "fir_number": "FIR-2026-0003", "station_id": "STATION-BGLR-CENTRAL",
        "crime_type": "Burglary", "modus_operandi": "Front door lock broken with crowbar",
        "date_time": "2026-01-20 23:45:00", "status": "Under Investigation",
        "narrative_text": "Front door lock broken. Night burglary when family was out of town.",
        "latitude": 12.9610, "longitude": 77.6288
    },
    {
        "case_id": "CASE-004", "fir_number": "FIR-2026-0004", "station_id": "STATION-MYS-CENTRAL",
        "crime_type": "Chain snatching", "modus_operandi": "Snatched gold chain from pedestrian, motorcycle getaway",
        "date_time": "2026-02-01 10:15:00", "status": "Accused Arrested",
        "narrative_text": "Snatched gold chain from pedestrian, motorcycle getaway. Rider and pillion involved.",
        "latitude": 12.2958, "longitude": 76.6394
    },
    {
        "case_id": "CASE-005", "fir_number": "FIR-2026-0005", "station_id": "STATION-BGLR-NORTH",
        "crime_type": "Vehicle theft", "modus_operandi": "Motorcycle stolen from parking area",
        "date_time": "2026-02-10 18:30:00", "status": "Under Investigation",
        "narrative_text": "Motorcycle stolen from office parking area. CCTV shows masked suspect using master key.",
        "latitude": 13.0285, "longitude": 77.5896
    }
]

MOCK_LINKS = [
    {"case_id": "CASE-001", "canonical_id": "CANON-0042", "role_in_case": "accused"},
    {"case_id": "CASE-002", "canonical_id": "CANON-0042", "role_in_case": "accused"},
    {"case_id": "CASE-005", "canonical_id": "CANON-0042", "role_in_case": "accused"},
    {"case_id": "CASE-003", "canonical_id": "CANON-0043", "role_in_case": "accused"},
    {"case_id": "CASE-004", "canonical_id": "CANON-0044", "role_in_case": "accused"}
]

class CatalystRepository:
    def __init__(self):
        self.app = None
        self._is_fallback = False
        # In-memory stores backing fallback mode, so conversation logging and
        # the audit trail stay exercisable (and testable) without a live
        # Data Store. Live mode writes the real tables instead.
        self._conversation_fallback = []
        self._audit_fallback = []
        try:
            # Attempt to initialize Catalyst SDK
            self.app = zcatalyst_sdk.initialize()
            # Test database check to ensure connectivity
            self.app.zcql().execute_query("SELECT ROWID FROM AccessAuditLog LIMIT 1")
            logger.info("Catalyst SDK successfully initialized and verified.")
        except Exception as e:
            logger.warning(f"Catalyst SDK failed to verify connection. Running in fallback mode: {e}")
            self._is_fallback = True

    def is_fallback(self):
        return self._is_fallback

    def get_user_role(self, request_headers: dict) -> str:
        if self._is_fallback:
            # Fallback default roles for local testing based on user header or query
            auth_header = request_headers.get("authorization") or ""
            if "si" in auth_header.lower():
                return "SI"
            elif "acp" in auth_header.lower():
                return "ACP"
            elif "policy" in auth_header.lower():
                return "Policy Maker"
            return "Analyst"
            
        try:
            current_user = self.app.authentication().get_current_user()
            if current_user:
                role_details = current_user.get("role_details") or {}
                return role_details.get("role_name", "Analyst")
        except Exception as auth_err:
            logger.error(f"Authentication role check failed: {auth_err}")
        return "Analyst"

    def insert_audit_log(self, session_id: str, role: str, resource: str, decision: str):
        utc_now = datetime.now(timezone.utc).replace(tzinfo=None).strftime('%Y-%m-%d %H:%M:%S')
        row_data = {
            "session_id": session_id[:40] if session_id else "unknown-session",
            "role": role,
            "resource": resource,
            "decision": decision,
            "timestamp": utc_now
        }
        
        if self._is_fallback:
            logger.info(f"[FALLBACK AUDIT LOG] {row_data}")
            self._audit_fallback.append(row_data)
            return

        try:
            db = self.app.datastore()
            table = db.table("AccessAuditLog")
            table.insert_row(row_data)
            logger.info(f"Audit log inserted: {row_data}")
        except Exception as e:
            logger.error(f"Failed to insert audit log in Catalyst Data Store: {e}")

    def fetch_audit_logs(self, limit: int = 50):
        """Recent access-audit rows -- the dossier's chain-of-access section."""
        if self._is_fallback:
            return self._audit_fallback[-limit:]
        try:
            zcql = self.app.zcql()
            rows = zcql.execute_query(
                f"SELECT session_id, role, resource, decision, timestamp "
                f"FROM AccessAuditLog LIMIT {int(limit)}")
            return [r.get("AccessAuditLog") for r in rows if r.get("AccessAuditLog")]
        except Exception as e:
            logger.error(f"Failed to fetch audit logs: {e}")
            return []

    def get_user_id(self, request_headers: dict) -> str:
        if self._is_fallback:
            return "local-user"
        try:
            current_user = self.app.authentication().get_current_user()
            if current_user:
                return str(current_user.get("user_id") or current_user.get("email_id") or "unknown-user")
        except Exception as e:
            logger.error(f"Authentication user-id check failed: {e}")
        return "unknown-user"

    def insert_conversation_log(self, session_id: str, user_id: str, role: str,
                                query_text: str, response_text: str,
                                cited_record_ids: str):
        """
        One row per answered query (schema: ConversationLog). This is what
        makes the conversation-history PDF export possible; the evidence-
        composer rule is that cited_record_ids is never empty for a real
        answer.
        """
        utc_now = datetime.now(timezone.utc).replace(tzinfo=None).strftime('%Y-%m-%d %H:%M:%S')
        row_data = {
            "session_id": (session_id or "unknown-session")[:40],
            "user_id": (user_id or "unknown-user")[:40],
            "role": role,
            "query_text": query_text,
            "response_text": response_text,
            "cited_record_ids": cited_record_ids,
            "timestamp": utc_now,
        }
        if self._is_fallback:
            logger.info(f"[FALLBACK CONVERSATION LOG] session={row_data['session_id']} "
                        f"role={role} cited={cited_record_ids}")
            self._conversation_fallback.append(row_data)
            return
        try:
            self.app.datastore().table("ConversationLog").insert_row(row_data)
            logger.info(f"Conversation log inserted for session {row_data['session_id']}")
        except Exception as e:
            logger.error(f"Failed to insert conversation log: {e}")

    def fetch_conversation_log(self, session_id: str = None, limit: int = 200):
        if self._is_fallback:
            rows = self._conversation_fallback
            if session_id:
                rows = [r for r in rows if r.get("session_id") == session_id]
            return rows[-limit:]
        try:
            zcql = self.app.zcql()
            where = f" WHERE session_id = '{session_id}'" if session_id else ""
            rows = zcql.execute_query(
                f"SELECT session_id, user_id, role, query_text, response_text, "
                f"cited_record_ids, timestamp FROM ConversationLog{where} LIMIT {int(limit)}")
            return [r.get("ConversationLog") for r in rows if r.get("ConversationLog")]
        except Exception as e:
            logger.error(f"Failed to fetch conversation log: {e}")
            return []

    def fetch_persons(self):
        if self._is_fallback:
            return MOCK_PERSONS
        try:
            zcql = self.app.zcql()
            rows = zcql.execute_query("SELECT person_id, canonical_id, name, age, gender, address, phone, vehicle_reg FROM Person")
            return [r.get("Person") for r in rows if r.get("Person")]
        except Exception as e:
            logger.error(f"Failed to fetch persons from Catalyst Data Store: {e}")
            return MOCK_PERSONS

    def fetch_cases(self):
        if self._is_fallback:
            return MOCK_CASES
        try:
            zcql = self.app.zcql()
            rows = zcql.execute_query("SELECT case_id, crime_type, modus_operandi, narrative_text, narrative_embedding, latitude, longitude, date_time FROM Case")
            res = []
            for r in rows:
                c = r.get("Case")
                if c:
                    res.append({
                        "case_id": c.get("case_id"),
                        "fir_number": c.get("fir_number") or f"FIR-26-{c.get('case_id')}",
                        "station_id": c.get("station_id") or "STATION-CENTRAL",
                        "crime_type": c.get("crime_type"),
                        "modus_operandi": c.get("modus_operandi"),
                        "narrative_text": c.get("narrative_text"),
                        # Precomputed vector, stored as a JSON array string.
                        "narrative_embedding": _parse_embedding(c.get("narrative_embedding")),
                        "latitude": float(c.get("latitude")) if c.get("latitude") else None,
                        "longitude": float(c.get("longitude")) if c.get("longitude") else None,
                        "date_time": c.get("date_time")
                    })
            return res
        except Exception as e:
            logger.error(f"Failed to fetch cases from Catalyst Data Store: {e}")
            return MOCK_CASES

    def store_case_embedding(self, case_id: str, vector: list, model_id: str):
        """
        Persist a narrative vector computed at ingestion (see
        case_twin_fn.embed_narrative). Idempotent: re-running overwrites.
        """
        if self._is_fallback:
            logger.info(f"[FALLBACK] would store {len(vector)}-dim vector for {case_id} ({model_id})")
            return
        try:
            zcql = self.app.zcql()
            rows = zcql.execute_query(f"SELECT ROWID FROM Case WHERE case_id = '{case_id}'")
            if not rows:
                logger.warning(f"store_case_embedding: no Case row for {case_id}")
                return
            row_id = rows[0]["Case"]["ROWID"]
            table = self.app.datastore().table("Case")
            table.update_row({
                "ROWID": row_id,
                "narrative_embedding": json.dumps(vector),
                "embedding_model": model_id,
            })
            logger.info(f"Stored narrative embedding for {case_id} ({model_id})")
        except Exception as e:
            logger.error(f"Failed to store embedding for {case_id}: {e}")

    def fetch_links(self):
        if self._is_fallback:
            return MOCK_LINKS
        try:
            zcql = self.app.zcql()
            rows = zcql.execute_query("SELECT case_id, canonical_id, role_in_case FROM CasePersonLink")
            return [
                {
                    "case_id": r["CasePersonLink"]["case_id"], 
                    "canonical_id": r["CasePersonLink"]["canonical_id"],
                    "role_in_case": r["CasePersonLink"].get("role_in_case", "accused")
                } 
                for r in rows if r.get("CasePersonLink")
            ]
        except Exception as e:
            logger.error(f"Failed to fetch links from Catalyst Data Store: {e}")
            return MOCK_LINKS
