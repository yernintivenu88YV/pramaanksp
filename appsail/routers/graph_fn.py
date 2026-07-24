from datetime import datetime
import logging
import math
import os
from typing import Optional, List, Dict
from fastapi import APIRouter, Request, HTTPException, status
from pydantic import BaseModel

logger = logging.getLogger("appsail.graph")
router = APIRouter(prefix="/server/graph_fn")

SEED_LINKS = [
    {"case_id": "CASE-001", "canonical_id": "CANON-0042"},
    {"case_id": "CASE-002", "canonical_id": "CANON-0042"},
    {"case_id": "CASE-005", "canonical_id": "CANON-0042"},
    {"case_id": "CASE-003", "canonical_id": "CANON-0043"},
    {"case_id": "CASE-004", "canonical_id": "CANON-0044"}
]

SEED_CASES = [
    {"case_id": "CASE-001", "crime_type": "Burglary", "latitude": 12.9579, "longitude": 77.6251, "date_time": "2026-01-10T03:30:00"},
    {"case_id": "CASE-002", "crime_type": "Burglary", "latitude": 12.9592, "longitude": 77.6235, "date_time": "2026-01-15T02:15:00"},
    {"case_id": "CASE-003", "crime_type": "Burglary", "latitude": 12.9610, "longitude": 77.6288, "date_time": "2026-01-20T23:45:00"},
    {"case_id": "CASE-004", "crime_type": "Chain snatching", "latitude": 12.2958, "longitude": 76.6394, "date_time": "2026-02-01T10:15:00"}
]

SEED_PERSONS = [
    {"canonical_id": "CANON-0042", "name": "Mohammed Rafi"},
    {"canonical_id": "CANON-0043", "name": "Mohammad Sharif"},
    {"canonical_id": "CANON-0044", "name": "Vikram Singh"},
    {"canonical_id": "CANON-0045", "name": "Vikramaditya Singh"}
]

MOCK_TRAVERSAL = {
    "CANON-0042": {
        "canonical_id": "CANON-0042",
        "name": "Mohammed Rafi",
        "nodes": [
            {"id": "CASE-001", "label": "Case", "properties": {"crime_type": "Burglary", "modus_operandi": "Rear window forced entry using crowbar"}},
            {"id": "CASE-002", "label": "Case", "properties": {"crime_type": "Burglary", "modus_operandi": "Rear window forced entry using crowbar, night time"}},
            {"id": "CASE-005", "label": "Case", "properties": {"crime_type": "Vehicle theft", "modus_operandi": "Motorcycle stolen from parking area"}},
            {"id": "KA-02-MB-1234", "label": "Vehicle", "properties": {}},
            {"id": "CANON-0043", "label": "Person", "properties": {"name": "Mohammad Sharif", "age": 45}}
        ],
        "relationships": [
            {"source": "CANON-0042", "target": "CASE-001", "type": "ACCUSED_IN"},
            {"source": "CANON-0042", "target": "CASE-002", "type": "ACCUSED_IN"},
            {"source": "CANON-0042", "target": "CASE-005", "type": "ACCUSED_IN"},
            {"source": "CANON-0042", "target": "KA-02-MB-1234", "type": "USES_VEHICLE"},
            {"source": "CANON-0042", "target": "CANON-0043", "type": "CO_ACCUSED"}
        ]
    }
}

MOCK_COMMUNITIES = [
    {"canonical_id": "CANON-0042", "communityId": 0, "name": "Mohammed Rafi"},
    {"canonical_id": "CANON-0043", "communityId": 0, "name": "Mohammad Sharif"},
    {"canonical_id": "CANON-0044", "communityId": 1, "name": "Vikram Singh"},
    {"canonical_id": "CANON-0045", "communityId": 1, "name": "Vikramaditya Singh"}
]

class TraverseRequest(BaseModel):
    canonical_id: str

class PriorityRequest(BaseModel):
    w_recency: Optional[float] = 1.0
    w_severity: Optional[float] = 1.0
    w_centrality: Optional[float] = 1.0
    w_warrant: Optional[float] = 1.0

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
                logger.error(f"Error loading env: {e}")

def get_neo4j_driver():
    load_env()
    uri = os.getenv("NEO4J_URI")
    username = os.getenv("NEO4J_USERNAME")
    password = os.getenv("NEO4J_PASSWORD")
    if not uri or not username or not password:
        return None
    try:
        from neo4j import GraphDatabase
        driver = GraphDatabase.driver(uri, auth=(username, password))
        driver.verify_connectivity()
        return driver
    except Exception:
        return None

@router.get("/health")
def health():
    return {"status": "ok", "module": "graph_fn"}

@router.post("/export")
def export(request: Request):
    repo = request.state.repo
    persons = repo.fetch_persons()
    cases = repo.fetch_cases()
    links = repo.fetch_links()
    
    driver = get_neo4j_driver()
    if not driver:
        return {
            "status": "warning",
            "message": "Export completed in Mock Mode (Neo4j credentials not configured).",
            "statistics": {
                "nodes_exported": len(persons) + len(cases),
                "edges_exported": len(links)
            }
        }
        
    try:
        with driver.session() as session:
            session.run(
                "UNWIND $persons AS p MERGE (n:Person {id: p.canonical_id}) "
                "SET n.name = p.name, n.age = p.age, n.gender = p.gender, n.address = p.address, n.phone = p.phone",
                persons=persons
            )
            session.run(
                "UNWIND $cases AS c MERGE (n:Case {id: c.case_id}) "
                "SET n.crime_type = c.crime_type, n.modus_operandi = c.modus_operandi, n.weapon = c.weapon, n.date_time = c.date_time",
                cases=cases
            )
            session.run(
                "UNWIND $links AS l MATCH (p:Person {id: l.canonical_id}) MATCH (c:Case {id: l.case_id}) "
                "MERGE (p)-[:ACCUSED_IN]->(c)",
                links=links
            )
        return {
            "status": "success",
            "message": "Nodes and edges successfully exported to Neo4j Aura.",
            "statistics": {
                "persons": len(persons),
                "cases": len(cases),
                "links": len(links)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Neo4j write transaction failed: {str(e)}")
    finally:
        driver.close()

@router.post("/traverse")
def traverse(req: TraverseRequest):
    driver = get_neo4j_driver()
    if not driver:
        mock_entry = MOCK_TRAVERSAL.get(req.canonical_id) or {
            "canonical_id": req.canonical_id,
            "name": "Unknown Suspect",
            "nodes": [],
            "relationships": []
        }
        return {
            "mode": "mock",
            "canonical_id": req.canonical_id,
            "nodes": mock_entry["nodes"],
            "relationships": mock_entry["relationships"]
        }
        
    try:
        nodes_res = []
        rels_res = []
        with driver.session() as session:
            query = (
                "MATCH (p:Person {id: $canonical_id})-[r]-(n) "
                "RETURN labels(n) AS labels, properties(n) AS props, n.id AS id, type(r) AS rel_type"
            )
            records = session.run(query, canonical_id=req.canonical_id)
            for rec in records:
                labels = list(rec["labels"])
                label = labels[0] if labels else "Unknown"
                node_id = rec["id"] or rec["props"].get("id") or "unknown"
                nodes_res.append({
                    "id": node_id,
                    "label": label,
                    "properties": dict(rec["props"])
                })
                rels_res.append({
                    "source": req.canonical_id,
                    "target": node_id,
                    "type": rec["rel_type"]
                })
        return {
            "mode": "live",
            "canonical_id": req.canonical_id,
            "nodes": nodes_res,
            "relationships": rels_res
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        driver.close()

@router.post("/communities")
def communities():
    driver = get_neo4j_driver()
    if not driver:
        return {
            "mode": "mock",
            "communities": MOCK_COMMUNITIES
        }
        
    try:
        with driver.session() as session:
            session.run("CALL gds.graph.exists('pramaanNetwork') YIELD exists "
                        "FOREACH (x IN CASE WHEN exists THEN [1] ELSE [] END | "
                        "  CALL gds.graph.drop('pramaanNetwork') YIELD graphName "
                        "  RETURN graphName"
                        ")")
            session.run(
                "CALL gds.graph.project.cypher("
                "  'pramaanNetwork',"
                "  'MATCH (p:Person) RETURN id(p) AS id, [\"Person\"] AS labels',"
                "  'MATCH (p1:Person)-[:ACCUSED_IN]->(c:Case)<-[:ACCUSED_IN]-(p2:Person) RETURN id(p1) AS source, id(p2) AS target, \"CO_ACCUSED\" AS type'"
                ")"
            )
            records = session.run(
                "CALL gds.leiden.stream('pramaanNetwork') "
                "YIELD nodeId, communityId "
                "RETURN gds.util.asNode(nodeId).id AS canonical_id, "
                "       gds.util.asNode(nodeId).name AS name, communityId"
            )
            communities_res = []
            for rec in records:
                communities_res.append({
                    "canonical_id": rec["canonical_id"],
                    "name": rec["name"] or "Unknown",
                    "communityId": rec["communityId"]
                })
            session.run("CALL gds.graph.drop('pramaanNetwork')")
            
        return {
            "mode": "live",
            "communities": communities_res
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Leiden community detection failed: {str(e)}")
    finally:
        driver.close()

@router.api_route("/priority", methods=["GET", "POST"])
def priority(req: Optional[PriorityRequest] = None, request: Request = None):
    if req is None:
        req = PriorityRequest()
    repo = request.state.repo
    links = repo.fetch_links()
    cases_list = repo.fetch_cases()
    persons_list = repo.fetch_persons()
    warrants = repo.fetch_warrants()
    active_warrants = {w["canonical_id"] for w in warrants if w.get("active_flag")}
    
    # Map raw lists
    cases = {}
    for c in cases_list:
        cases[c["case_id"]] = c
        
    persons = {}
    for p in persons_list:
        persons[p["canonical_id"]] = p
        
    # Check if empty, use seeds
    if not links:
        links = SEED_LINKS
    if not cases:
        for sc in SEED_CASES:
            cases[sc["case_id"]] = sc
        cases["CASE-005"] = {"case_id": "CASE-005", "crime_type": "Vehicle theft", "date_time": "2026-06-01T16:00:00"}
    if not persons:
        for sp in SEED_PERSONS:
            persons[sp["canonical_id"]] = sp
            
    now = datetime.now()
    suspect_cases = {}
    for l in links:
        c_id = l["canonical_id"]
        suspect_cases.setdefault(c_id, []).append(l["case_id"])
        
    case_suspects = {}
    for l in links:
        case_suspects.setdefault(l["case_id"], set()).add(l["canonical_id"])
        
    co_accused_map = {}
    for c_id in suspect_cases:
        co_accused = set()
        for case_id in suspect_cases[c_id]:
            co_accused.update(case_suspects.get(case_id, []))
        co_accused.discard(c_id)
        co_accused_map[c_id] = co_accused
        
    scores_res = []
    for c_id, p_info in persons.items():
        name = p_info["name"]
        case_ids = suspect_cases.get(c_id, [])
        total_decay = 0.0
        max_severity = 0.2
        
        for cid in case_ids:
            case = cases.get(cid)
            if not case:
                continue
                
            ct = case.get("crime_type", "").lower()
            if ct in ("burglary", "murder", "dacoity"):
                max_severity = max(max_severity, 1.0)
            elif ct in ("theft", "vehicle theft", "assault", "chain snatching"):
                max_severity = max(max_severity, 0.5)
            else:
                max_severity = max(max_severity, 0.2)
                
            dt_str = case.get("date_time", "")
            try:
                # Normalize time format
                if "T" in dt_str:
                    dt_str = dt_str.replace("Z", "")
                    dt = datetime.fromisoformat(dt_str)
                else:
                    dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
                days = max(0, (now - dt).days)
                total_decay += math.exp(-0.005 * days)
            except Exception:
                total_decay += 1.0
                
        recency_score = min(1.0, total_decay)
        severity_score = max_severity
        degree = len(case_ids) + len(co_accused_map.get(c_id, []))
        centrality_score = min(1.0, degree / 5.0)
        warrant_score = 1.0 if c_id in active_warrants else 0.0
        
        total = (req.w_recency * recency_score +
                 req.w_severity * severity_score +
                 req.w_centrality * centrality_score +
                 req.w_warrant * warrant_score)
                 
        scores_res.append({
            "canonical_id": c_id,
            "name": name,
            "total_score": round(total, 3),
            "breakdown": {
                "recency": round(recency_score, 3),
                "severity": round(severity_score, 3),
                "centrality": round(centrality_score, 3),
                "warrant": round(warrant_score, 3)
            },
            "variables": {
                "prior_cases": len(case_ids),
                "co_accused_count": len(co_accused_map.get(c_id, [])),
                "has_active_warrant": warrant_score == 1.0
            }
        })
        
    scores_res.sort(key=lambda s: s["total_score"], reverse=True)
    mode_val = "seed_fallback" if repo.is_fallback() else "live"
    
    return {
        "mode": mode_val,
        "scores": scores_res
    }

@router.post("/hotspots")
def hotspots(request: Request):
    repo = request.state.repo
    cases = repo.fetch_cases()
    
    if not cases:
        for sc in SEED_CASES:
            cases.append({
                "case_id": sc["case_id"],
                "crime_type": sc["crime_type"],
                "latitude": float(sc["latitude"]),
                "longitude": float(sc["longitude"])
            })
            
    clusters = []
    visited = set()
    
    for i, c1 in enumerate(cases):
        if c1["case_id"] in visited:
            continue
        cluster_cases = [c1]
        visited.add(c1["case_id"])
        
        for c2 in cases:
            if c2["case_id"] in visited:
                continue
            dlat = c1["latitude"] - c2["latitude"]
            dlon = c1["longitude"] - c2["longitude"]
            dist = math.sqrt(dlat**2 + dlon**2)
            if dist < 0.1: # ~10km radius
                cluster_cases.append(c2)
                visited.add(c2["case_id"])
                
        avg_lat = sum(c["latitude"] for c in cluster_cases) / len(cluster_cases)
        avg_lon = sum(c["longitude"] for c in cluster_cases) / len(cluster_cases)
        
        crime_types = [c["crime_type"] for c in cluster_cases]
        primary_crime = max(set(crime_types), key=crime_types.count)
        
        clusters.append({
            "cluster_id": f"HOTSPOT-{i+1}",
            "latitude": round(avg_lat, 4),
            "longitude": round(avg_lon, 4),
            "density": len(cluster_cases),
            "primary_crime": primary_crime,
            "case_ids": [c["case_id"] for c in cluster_cases]
        })
        
    clusters.sort(key=lambda x: x["density"], reverse=True)
    mode_val = "seed_fallback" if repo.is_fallback() else "live"
    
    return {
        "mode": mode_val,
        "hotspots": clusters
    }
