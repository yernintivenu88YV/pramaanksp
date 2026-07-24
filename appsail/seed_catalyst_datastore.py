"""
Pramaan — Catalyst Data Store Turnkey Database Seeder
===================================================
Inserts sample KSP FIR records into Zoho Catalyst Data Store tables using ZCQL / Catalyst SDK.

Usage:
  python appsail/seed_catalyst_datastore.py
"""

import sys
import os
import json

# Sample records formatted to official KSP Data Dictionary PDF & ER Diagram
SEED_CASES = [
    {
        "case_id": "CASE-001",
        "fir_number": "104430006202600001",
        "station_id": "4006",
        "crime_type": "Burglary",
        "modus_operandi": "Rear window forced entry using crowbar during late night hours",
        "date_time": "2026-01-10 02:00:00",
        "status": "Active",
        "narrative_text": "Complainant reported burglary at residence in Indiranagar. Entry made through rear window using crowbar between 1 AM and 3 AM. Gold assets and cash stolen.",
        "latitude": 12.9579,
        "longitude": 77.6251,
        "location_id": "LOC-560038"
    },
    {
        "case_id": "CASE-002",
        "fir_number": "104430006202600002",
        "station_id": "4006",
        "crime_type": "Burglary",
        "modus_operandi": "Rear window entry with crowbar late night while owners away",
        "date_time": "2026-01-15 01:30:00",
        "status": "Active",
        "narrative_text": "Victim reported house burglary in Koramangala. Entry via rear window using crowbar between midnight and 2 AM. Cash and gold ornaments stolen.",
        "latitude": 12.9592,
        "longitude": 77.6235,
        "location_id": "LOC-560034"
    },
    {
        "case_id": "CASE-005",
        "fir_number": "104440008202600005",
        "station_id": "4008",
        "crime_type": "Vehicle theft",
        "modus_operandi": "Motorcycle stolen from office parking area",
        "date_time": "2026-02-10 18:00:00",
        "status": "Escalated",
        "narrative_text": "Complainant reported motorcycle KA-02-MB-1234 stolen from outside office parking complex in Malleshwaram.",
        "latitude": 13.0285,
        "longitude": 77.5896,
        "location_id": "LOC-560003"
    }
]

SEED_PERSONS = [
    {
        "person_id": "P-101",
        "canonical_id": "CANON-0042",
        "source_table": "Accused",
        "role": "accused",
        "name": "Mohammed Rafi",
        "age": 34,
        "gender": "Male",
        "phone": "+91 98801 23456",
        "vehicle_reg": "KA-02-MB-1234",
        "address": "42, 2nd Cross, Shivajinagar, Bengaluru"
    },
    {
        "person_id": "P-102",
        "canonical_id": "CANON-0044",
        "source_table": "Accused",
        "role": "accused",
        "name": "S. Praveen Kumar",
        "age": 38,
        "gender": "Male",
        "phone": "+91 98450 98765",
        "vehicle_reg": "KA-04-HE-5678",
        "address": "15, Main Road, Rajajinagar, Bengaluru"
    }
]

SEED_WARRANTS = [
    {
        "warrant_number": "WAR-2026-001",
        "canonical_id": "CANON-0042",
        "active_flag": True,
        "issuing_court": "1st ACMM Court, Bengaluru",
        "offence": "IPC 380 - Theft in dwelling house"
    },
    {
        "warrant_number": "WAR-2026-002",
        "canonical_id": "CANON-0044",
        "active_flag": True,
        "issuing_court": "2nd ACMM Court, Bengaluru",
        "offence": "IPC 379 - Punishment for theft"
    }
]

def generate_zcql_script():
    """Generates ZCQL SQL Statements for Zoho Catalyst Console Data Store Import."""
    statements = []
    statements.append("-- Pramaan - Catalyst Data Store Seed Statements (ZCQL Format)\n")
    
    # Case table insertions
    for c in SEED_CASES:
        stmt = f"INSERT INTO Cases (case_id, fir_number, station_id, crime_type, modus_operandi, date_time, status, narrative_text, latitude, longitude) VALUES ('{c['case_id']}', '{c['fir_number']}', '{c['station_id']}', '{c['crime_type']}', '{c['modus_operandi']}', '{c['date_time']}', '{c['status']}', '{c['narrative_text']}', {c['latitude']}, {c['longitude']});"
        statements.append(stmt)
        
    # Person table insertions
    for p in SEED_PERSONS:
        stmt = f"INSERT INTO Person (person_id, source_table, role, name, age, gender, phone, vehicle_reg, address) VALUES ('{p['person_id']}', '{p['source_table']}', '{p['role']}', '{p['name']}', {p['age']}, '{p['gender']}', '{p['phone']}', '{p['vehicle_reg']}', '{p['address']}');"
        statements.append(stmt)
        
    # Warrant insertions
    for w in SEED_WARRANTS:
        flag = "true" if w['active_flag'] else "false"
        stmt = f"INSERT INTO Warrant (warrant_number, canonical_id, active_flag, issuing_court, offence) VALUES ('{w['warrant_number']}', '{w['canonical_id']}', {flag}, '{w['issuing_court']}', '{w['offence']}');"
        statements.append(stmt)
        
    return "\n".join(statements)

def seed_via_catalyst_sdk():
    """Attempts direct insert via Catalyst Python SDK if environment is initialized."""
    try:
        from zcatalyst_sdk.catalyst_app import CatalystApp
        app = CatalystApp()
        zcql = app.zcql()
        
        for c in SEED_CASES:
            query = f"INSERT INTO Cases (case_id, fir_number, station_id, crime_type, modus_operandi, status) VALUES ('{c['case_id']}', '{c['fir_number']}', '{c['station_id']}', '{c['crime_type']}', '{c['modus_operandi']}', '{c['status']}')"
            zcql.execute_query(query)
            
        print("Successfully seeded Data Store via Catalyst SDK!")
        return True
    except Exception as e:
        print(f"Catalyst SDK context not detected locally: {e}")
        print("Generated ZCQL Statements for Catalyst Console Import:")
        print(generate_zcql_script())
        return False

if __name__ == "__main__":
    print("Initializing Pramaan Catalyst Data Store Seeder...")
    seed_via_catalyst_sdk()
