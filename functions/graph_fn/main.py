import logging
import os
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
    import requests
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

def get_neo4j_driver():
    load_env()
    uri = os.getenv("NEO4J_URI")
    username = os.getenv("NEO4J_USERNAME")
    password = os.getenv("NEO4J_PASSWORD")
    
    if not uri or not username or not password:
        logger.warning("Neo4j connection credentials not fully set in .env. Falling back to Mock mode.")
        return None
        
    from neo4j import GraphDatabase
    try:
        driver = GraphDatabase.driver(uri, auth=(username, password))
        # Test connection
        driver.verify_connectivity()
        return driver
    except Exception as e:
        logger.error(f"Failed to connect to Neo4j instance at {uri}: {e}")
        return None

# Mock data for fallback mode when no Neo4j Aura is connected
MOCK_TRAVERSAL = {
    "CANON-0042": {
        "canonical_id": "CANON-0042",
        "name": "Mohammed Rafi",
        "nodes": [
            {"id": "CASE-001", "label": "Case", "properties": {"crime_type": "Burglary", "modus_operandi": "Rear window forced entry using crowbar"}},
            {"id": "CASE-005", "label": "Case", "properties": {"crime_type": "Vehicle theft", "modus_operandi": "Motorcycle stolen from parking area"}},
            {"id": "KA-02-MB-1234", "label": "Vehicle", "properties": {}},
            {"id": "CANON-0043", "label": "Person", "properties": {"name": "Mohammad Sharif", "age": 45}}
        ],
        "relationships": [
            {"source": "CANON-0042", "target": "CASE-001", "type": "ACCUSED_IN"},
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

def handler(request: Request):
    try:
        app = zcatalyst_sdk.initialize()

        # Dynamic resource gating based on endpoint path
        resource_needed = "aggregate_analytics" if request.path == "/communities" else "own_case_detail"
        rbac_res = verify_rbac(app, request, resource_needed)
        if not rbac_res["allowed"]:
            return make_response(jsonify({"error": rbac_res["error"]}), 403)

        if request.path == "/export" and request.method == "POST":
            # 1. Fetch data from Catalyst Datastore
            try:
                zcql = app.zcql()
                links_rows = zcql.execute_query("SELECT case_id, canonical_id FROM CasePersonLink")
                cases_rows = zcql.execute_query("SELECT case_id, crime_type, modus_operandi, narrative_text, latitude, longitude, date_time, weapon FROM Case")
                
                # Fetch distinct resolved persons
                persons_rows = zcql.execute_query("SELECT person_id, canonical_id, name, age, gender, address, phone, vehicle_reg FROM Person")
            except Exception as db_err:
                logger.error(f"Catalyst database extraction failed: {db_err}")
                return make_response(jsonify({"error": f"Database extraction failed: {db_err}"}), 500)

            # Map Data Store results into clean dict lists
            links = [{"case_id": r["CasePersonLink"]["case_id"], "canonical_id": r["CasePersonLink"]["canonical_id"]} for r in links_rows if r.get("CasePersonLink")]
            cases = []
            locations = {}
            for r in cases_rows:
                c = r.get("Case")
                if c:
                    cases.append({
                        "case_id": c.get("case_id"),
                        "crime_type": c.get("crime_type"),
                        "modus_operandi": c.get("modus_operandi"),
                        "weapon": c.get("weapon"),
                        "date_time": c.get("date_time")
                    })
                    lat, lon = c.get("latitude"), c.get("longitude")
                    if lat and lon:
                        loc_id = f"LOC-{lat}-{lon}"
                        locations[loc_id] = {
                            "id": loc_id,
                            "latitude": float(lat),
                            "longitude": float(lon)
                        }

            persons = []
            vehicles = []
            person_vehicles = []
            seen_canon = set()
            for r in persons_rows:
                p = r.get("Person")
                if p:
                    canon_id = p.get("canonical_id")
                    if canon_id not in seen_canon:
                        seen_canon.add(canon_id)
                        persons.append({
                            "canonical_id": canon_id,
                            "name": p.get("name"),
                            "age": int(p.get("age")) if p.get("age") else None,
                            "gender": p.get("gender"),
                            "address": p.get("address"),
                            "phone": p.get("phone")
                        })
                    v_reg = p.get("vehicle_reg")
                    if v_reg:
                        vehicles.append({"vehicle_reg": v_reg})
                        person_vehicles.append({"canonical_id": canon_id, "vehicle_reg": v_reg})

            # 2. Export to Neo4j
            driver = get_neo4j_driver()
            if not driver:
                return make_response(jsonify({
                    "status": "warning",
                    "message": "Export completed in Mock Mode (Neo4j credentials not configured).",
                    "statistics": {
                        "nodes_exported": len(persons) + len(cases) + len(locations) + len(vehicles),
                        "edges_exported": len(links) + len(person_vehicles)
                    }
                }), 200)

            try:
                with driver.session() as session:
                    # Idempotent write operations
                    session.run("UNWIND $persons AS p MERGE (n:Person {id: p.canonical_id}) SET n.name = p.name, n.age = p.age, n.gender = p.gender, n.address = p.address, n.phone = p.phone", persons=persons)
                    session.run("UNWIND $cases AS c MERGE (n:Case {id: c.case_id}) SET n.crime_type = c.crime_type, n.modus_operandi = c.modus_operandi, n.weapon = c.weapon, n.date_time = c.date_time", cases=cases)
                    session.run("UNWIND $locations AS loc MERGE (n:Location {id: loc.id}) SET n.latitude = loc.latitude, n.longitude = loc.longitude", locations=list(locations.values()))
                    session.run("UNWIND $vehicles AS v MERGE (n:Vehicle {id: v.vehicle_reg})", vehicles=vehicles)
                    
                    # Link Case to Location
                    case_locs = []
                    for r in cases_rows:
                        c = r.get("Case")
                        if c:
                            lat, lon = c.get("latitude"), c.get("longitude")
                            if lat and lon:
                                case_locs.append({"case_id": c.get("case_id"), "loc_id": f"LOC-{lat}-{lon}"})
                    session.run("UNWIND $case_locs AS cl MATCH (c:Case {id: cl.case_id}) MATCH (l:Location {id: cl.loc_id}) MERGE (c)-[:LOCATED_AT]->(l)", case_locs=case_locs)
                    
                    # Link Person to Vehicle
                    session.run("UNWIND $person_vehicles AS pv MATCH (p:Person {id: pv.canonical_id}) MATCH (v:Vehicle {id: pv.vehicle_reg}) MERGE (p)-[:USES_VEHICLE]->(v)", person_vehicles=person_vehicles)
                    
                    # Link Person to Case
                    session.run("UNWIND $links AS l MATCH (p:Person {id: l.canonical_id}) MATCH (c:Case {id: l.case_id}) MERGE (p)-[:ACCUSED_IN]->(c)", links=links)
                
                return make_response(jsonify({
                    "status": "success",
                    "message": "Nodes and edges successfully exported to Neo4j Aura.",
                    "statistics": {
                        "persons": len(persons),
                        "cases": len(cases),
                        "locations": len(locations),
                        "vehicles": len(vehicles)
                    }
                }), 200)
            except Exception as neo_err:
                logger.error(f"Neo4j write transaction failed: {neo_err}")
                return make_response(jsonify({"error": f"Neo4j database write failed: {neo_err}"}), 500)
            finally:
                driver.close()

        elif request.path == "/traverse" and request.method == "POST":
            body = request.get_json() or {}
            canonical_id = body.get("canonical_id")
            if not canonical_id:
                return make_response(jsonify({"error": "Missing 'canonical_id' parameter"}), 400)

            driver = get_neo4j_driver()
            if not driver:
                # Fallback to mock data for traversal
                mock_entry = MOCK_TRAVERSAL.get(canonical_id) or {
                    "canonical_id": canonical_id,
                    "name": "Unknown Suspect",
                    "nodes": [],
                    "relationships": []
                }
                return make_response(jsonify({
                    "mode": "mock",
                    "canonical_id": canonical_id,
                    "nodes": mock_entry["nodes"],
                    "relationships": mock_entry["relationships"]
                }), 200)

            try:
                nodes_res = []
                rels_res = []
                with driver.session() as session:
                    # Query 1-step and 2-step connections
                    query = (
                        "MATCH (p:Person {id: $canonical_id})-[r]-(n) "
                        "RETURN labels(n) AS labels, properties(n) AS props, n.id AS id, type(r) AS rel_type"
                    )
                    records = session.run(query, canonical_id=canonical_id)
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
                            "source": canonical_id,
                            "target": node_id,
                            "type": rec["rel_type"]
                        })
                return make_response(jsonify({
                    "mode": "live",
                    "canonical_id": canonical_id,
                    "nodes": nodes_res,
                    "relationships": rels_res
                }), 200)
            except Exception as tx_err:
                logger.error(f"Neo4j traversal query failed: {tx_err}")
                return make_response(jsonify({"error": str(tx_err)}), 500)
            finally:
                driver.close()

        elif request.path == "/communities" and request.method == "POST":
            driver = get_neo4j_driver()
            if not driver:
                # Fallback to mock data for communities
                return make_response(jsonify({
                    "mode": "mock",
                    "communities": MOCK_COMMUNITIES
                }), 200)

            try:
                # GDS Leiden community detection pipeline
                with driver.session() as session:
                    # 1. Clean previous projection if exists
                    session.run("CALL gds.graph.exists('pramaanNetwork') YIELD exists "
                                "FOREACH (x IN CASE WHEN exists THEN [1] ELSE [] END | "
                                "  CALL gds.graph.drop('pramaanNetwork') YIELD graphName "
                                "  RETURN graphName"
                                ")")
                    
                    # 2. Project network in memory
                    session.run(
                        "CALL gds.graph.project.cypher("
                        "  'pramaanNetwork',"
                        "  'MATCH (p:Person) RETURN id(p) AS id, [\"Person\"] AS labels',"
                        "  'MATCH (p1:Person)-[:ACCUSED_IN]->(c:Case)<-[:ACCUSED_IN]-(p2:Person) RETURN id(p1) AS source, id(p2) AS target, \"CO_ACCUSED\" AS type'"
                        ")"
                    )

                    # 3. Stream Leiden community values
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

                    # 4. Clean up graph projection
                    session.run("CALL gds.graph.drop('pramaanNetwork')")
                
                return make_response(jsonify({
                    "mode": "live",
                    "communities": communities_res
                }), 200)
            except Exception as gds_err:
                logger.error(f"GDS Leiden pipeline failed: {gds_err}")
                return make_response(jsonify({"error": f"Leiden community detection failed: {gds_err}"}), 500)
            finally:
                driver.close()

        elif request.path == "/health" and request.method == "GET":
            return make_response(jsonify({
                "status": "ok", 
                "module": "graph_fn"
            }), 200)

        else:
            return make_response(jsonify({"error": "Not found"}), 404)

    except Exception as e:
        logger.exception(f"Unhandled exception in graph_fn: {e}")
        return make_response(jsonify({"error": str(e)}), 500)
