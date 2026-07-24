-- Karnataka State Police (KSP) Official Datasheet Seed SQL
-- Format matches Karnataka Police Department FIR System Database Design Document
-- 
-- Table Definitions:
-- 1. CaseMaster (CrimeNo format: 18-digit [1 category + 4 district + 4 unit + 4 year + 5 running serial])
-- 2. ComplainantDetails
-- 3. Victim
-- 4. Accused (A1, A2 accused sorting)
-- 5. ArrestSurrender
-- 6. ActSectionAssociation

-- ----------------------------------------------------
-- 1. CaseMaster
-- ----------------------------------------------------
INSERT INTO CaseMaster (
    CaseMasterID, CrimeNo, CaseNo, CrimeRegisteredDate, PolicePersonID, 
    PoliceStationID, CaseCategoryID, GravityOffenceID, CrimeMajorHeadID, 
    CrimeMinorHeadID, CaseStatusID, CourtID, IncidentFromDate, IncidentToDate, 
    InfoReceivedPSDate, latitude, longitude, BriefFacts
) VALUES
(
    101, '104430006202600001', '202600001', '2026-01-10', 501, 
    4006, 1, 2, 12, 
    1204, 1, 301, '2026-01-10 02:00:00', '2026-01-10 03:30:00', 
    '2026-01-10 04:15:00', 12.9579, 77.6251, 
    'Rear window forced entry using crowbar during late night hours. Gold assets and cash stolen from locked bedroom safe in Indiranagar.'
),
(
    102, '104430006202600002', '202600002', '2026-01-15', 502, 
    4006, 1, 2, 12, 
    1204, 1, 301, '2026-01-15 01:30:00', '2026-01-15 02:45:00', 
    '2026-01-15 03:30:00', 12.9592, 77.6235, 
    'Burglary targeted locked residence while owners were away. Entry gained by forcing rear window using crowbar.'
),
(
    105, '104440008202600005', '202600005', '2026-02-10', 503, 
    4008, 1, 1, 14, 
    1402, 1, 302, '2026-02-10 18:00:00', '2026-02-10 18:30:00', 
    '2026-02-10 19:10:00', 13.0285, 77.5896, 
    'Two-wheeler vehicle theft (KA-02-MB-1234) outside office parking complex in Malleshwaram.'
);

-- ----------------------------------------------------
-- 2. ComplainantDetails
-- ----------------------------------------------------
INSERT INTO ComplainantDetails (
    ComplainantID, CaseMasterID, ComplainantName, AgeYear, OccupationID, ReligionID, CasteID, GenderID
) VALUES
(201, 101, 'Ramesh Gowda', 45, 12, 1, 104, 1),
(202, 102, 'Anitha Sundaram', 38, 15, 1, 102, 2),
(203, 105, 'Venkatesh K.', 29, 18, 1, 101, 1);

-- ----------------------------------------------------
-- 3. Victim
-- ----------------------------------------------------
INSERT INTO Victim (
    VictimMasterID, CaseMasterID, VictimName, AgeYear, GenderID, VictimPolice
) VALUES
(301, 101, 'Ramesh Gowda', 45, 1, '0'),
(302, 102, 'Anitha Sundaram', 38, 2, '0'),
(303, 105, 'Venkatesh K.', 29, 1, '0');

-- ----------------------------------------------------
-- 4. Accused (PersonID sorting: A1, A2...)
-- ----------------------------------------------------
INSERT INTO Accused (
    AccusedMasterID, CaseMasterID, AccusedName, AgeYear, GenderID, PersonID
) VALUES
(401, 101, 'Mohammed Rafi', 34, 1, 'A1'),
(402, 102, 'Mohammed Rafi', 34, 1, 'A1'),
(403, 105, 'Mohammed Rafi', 34, 1, 'A1'),
(404, 101, 'Mohammad Sharif', 36, 1, 'A2');

-- ----------------------------------------------------
-- 5. ArrestSurrender
-- ----------------------------------------------------
INSERT INTO ArrestSurrender (
    ArrestSurrenderID, CaseMasterID, ArrestSurrenderTypeID, ArrestSurrenderDate,
    ArrestSurrenderStateId, ArrestSurrenderDistrictId, PoliceStationID, IOID,
    CourtID, AccusedMasterID, IsAccused, IsComplainantAccused
) VALUES
(501, 101, 1, '2026-01-22', 29, 560, 4006, 501, 301, 401, 1, 0),
(502, 105, 1, '2026-02-14', 29, 560, 4008, 503, 302, 403, 1, 0);

-- ----------------------------------------------------
-- 6. ActSectionAssociation
-- ----------------------------------------------------
INSERT INTO ActSectionAssociation (
    CaseMasterID, ActID, SectionID, ActOrderID, SectionOrderID
) VALUES
(101, 1, 380, 1, 1), -- IPC Section 380 (Theft in dwelling house)
(101, 1, 457, 1, 2), -- IPC Section 457 (Lurking house-trespass/house-breaking by night)
(102, 1, 380, 1, 1),
(102, 1, 457, 1, 2),
(105, 1, 379, 1, 1); -- IPC Section 379 (Punishment for theft)
