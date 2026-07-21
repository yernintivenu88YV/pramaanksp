-- Pramaan demo seed data
-- Insert AFTER creating the tables in data_store_schema.sql.
-- Minimal, self-consistent set that lights up every feature:
--   entity resolution, case-twin (EN + KN), graph, priority (warrant-driven),
--   hotspots, and the court dossier export.
-- canonical_id is the only person reference downstream (never person_id).

-- ---- Persons (resolved canonical identities) ----
INSERT INTO Person (person_id, source_table, role, name, age, gender, address, phone, vehicle_reg, prior_record_flag, created_at) VALUES
 ('P-001','fir','accused','Mohammed Rafi',45,'Male','No 12, 5th Cross, Malleshwaram, Bengaluru','9845012345','KA-02-MB-1234',TRUE,'2026-01-05 10:00:00'),
 ('P-002','registry','accused','Mohammad Rafi',45,'Male','No 12, 5th Cross, Malleshwaram, Bengaluru','9845012345',NULL,TRUE,'2026-01-06 10:00:00'),
 ('P-003','fir','accused','Suresh Kumar',33,'Male','221, 2nd Main, Jayanagar, Bengaluru','9812033445',NULL,FALSE,'2026-01-07 10:00:00');

INSERT INTO EntityResolution (canonical_id, source_record_id, source_table, match_confidence, matched_by, reviewed_by, reviewed_at, created_at) VALUES
 ('CANON-0042','P-001','fir',1.00,'deterministic',NULL,NULL,'2026-01-06 11:00:00'),
 ('CANON-0042','P-002','registry',1.00,'deterministic',NULL,NULL,'2026-01-06 11:00:00'),
 ('CANON-0044','P-003','fir',0.90,'probabilistic',NULL,NULL,'2026-01-07 11:00:00');

-- ---- Cases (narrative_embedding left NULL; backfill_embeddings.py fills it) ----
INSERT INTO Cases (case_id, fir_number, station_id, crime_type, modus_operandi, date_time, status, narrative_text, location_id) VALUES
 ('CASE-001','FIR-2026-0001','STATION-BGLR-CENTRAL','Burglary','Rear window forced entry using crowbar, night time','2026-07-11 02:00:00','open','Complainant reported burglary at residence. Entry made through rear window using a crowbar. Occurred between 1 AM and 3 AM. Jewelry and cash stolen.','LOC-001'),
 ('CASE-002','FIR-2026-0002','STATION-BGLR-CENTRAL','Burglary','Rear window entry with crowbar, late night','2026-07-04 01:30:00','open','Victim reported house burglary. Entry via rear window using a crowbar, between midnight and 2 AM. Cash and gold ornaments stolen.','LOC-002'),
 ('CASE-003','FIR-2026-0003','STATION-BGLR-SOUTH','Burglary','Front door lock picked during daytime while owners away','2026-07-07 14:00:00','open','Complainant returned home to find front door lock picked and valuables missing during daytime hours.','LOC-003'),
 ('CASE-004','FIR-2026-0004','STATION-MYS-CENTRAL','Chain snatching','Snatched gold chain from pedestrian on motorbike','2026-07-08 11:00:00','open','Victim was walking on the street when two men on a motorbike snatched her gold chain and fled.','LOC-004'),
 ('CASE-005','FIR-2026-0005','STATION-BGLR-NORTH','Vehicle theft','Motorcycle stolen from parking area','2026-06-01 16:00:00','open','Complainant''s motorcycle was stolen from outside a shopping complex.','LOC-005'),
 -- Kannada narratives, kept in Kannada (no translation) for case-twin KN demo:
 ('CASE-K01','FIR-2026-0011','STATION-BGLR-CENTRAL','Burglary','Rear window forced entry using crowbar, night time','2026-07-11 02:00:00','open','ದೂರುದಾರರ ಮನೆಯಲ್ಲಿ ಕಳ್ಳತನ ನಡೆದಿದೆ. ಕಳ್ಳರು ಹಿಂಬದಿ ಕಿಟಕಿಯನ್ನು ಹಾರೆಯಿಂದ ಮುರಿದು ಒಳಗೆ ಪ್ರವೇಶಿಸಿದ್ದಾರೆ. ರಾತ್ರಿ 1 ರಿಂದ 3 ಗಂಟೆಯ ನಡುವೆ ಘಟನೆ ನಡೆದಿದೆ. ಚಿನ್ನಾಭರಣ ಮತ್ತು ನಗದು ಕಳವಾಗಿದೆ.','LOC-001'),
 ('CASE-K02','FIR-2026-0012','STATION-BGLR-CENTRAL','Burglary','Rear window entry with crowbar, late night','2026-07-04 01:30:00','open','ಸಂತ್ರಸ್ತರ ಮನೆಗೆ ಕನ್ನ ಹಾಕಲಾಗಿದೆ. ಕಳ್ಳರು ಹಿಂದಿನ ಕಿಟಕಿಯನ್ನು ಹಾರೆ ಬಳಸಿ ಮುರಿದು ನಡುರಾತ್ರಿ ಒಳಗೆ ನುಗ್ಗಿದ್ದಾರೆ. ನಗದು ಮತ್ತು ಚಿನ್ನದ ಆಭರಣಗಳು ಕಳವಾಗಿವೆ.','LOC-002');

-- ---- Locations ----
INSERT INTO Location (location_id, station_id, latitude, longitude, area_type) VALUES
 ('LOC-001','STATION-BGLR-CENTRAL',12.9352,77.6245,'urban'),
 ('LOC-002','STATION-BGLR-CENTRAL',12.9784,77.6408,'urban'),
 ('LOC-003','STATION-BGLR-SOUTH',12.9600,77.6100,'urban'),
 ('LOC-004','STATION-MYS-CENTRAL',12.2958,76.6394,'urban'),
 ('LOC-005','STATION-BGLR-NORTH',13.0827,77.5877,'urban');

-- ---- Case <-> canonical person links (accused) ----
INSERT INTO CasePersonLink (case_id, canonical_id, role_in_case) VALUES
 ('CASE-001','CANON-0042','accused'),
 ('CASE-002','CANON-0044','accused'),
 ('CASE-005','CANON-0042','accused'),
 ('CASE-K01','CANON-0042','accused'),
 ('CASE-K02','CANON-0044','accused');

-- ---- Warrants (drives the priority score's warrant factor -- real data, not hardcoded) ----
INSERT INTO Warrant (warrant_number, canonical_id, active_flag, issuing_court, offence, issued_at, updated_at) VALUES
 ('WAR-2026-001','CANON-0042',TRUE,'IV ACMM Court, Bengaluru','Burglary / IPC 457','2026-06-20 00:00:00','2026-06-20 00:00:00'),
 ('WAR-2026-002','CANON-0044',FALSE,'JMFC Mysuru','Chain snatching / IPC 379','2026-05-10 00:00:00','2026-07-01 00:00:00');
