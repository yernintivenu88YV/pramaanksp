-- Pramaan -- Core Data Store schema
--
-- Written as standard SQL DDL for clarity and portability. This
-- specifies the DESIGN -- table names, fields, relationships -- not
-- Catalyst Data Store's exact column-type syntax, which should be
-- verified against the Data Store console/docs before creating these
-- for real. The one non-negotiable design rule is marked below: nothing
-- downstream references a raw person_id. Everything references
-- canonical_id.

CREATE TABLE Person (
    person_id           VARCHAR(40) PRIMARY KEY,
    source_table        VARCHAR(50) NOT NULL,   -- which system this record came from
    role                VARCHAR(20) NOT NULL,   -- accused | victim | witness
    name                VARCHAR(200) NOT NULL,
    age                 INTEGER,
    gender              VARCHAR(20),
    address             VARCHAR(500),
    phone               VARCHAR(20),
    vehicle_reg         VARCHAR(20),
    prior_record_flag   BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP NOT NULL
);

-- The table most reference architectures for this challenge omit, and
-- the one everything else quietly depends on.
CREATE TABLE EntityResolution (
    canonical_id        VARCHAR(40) NOT NULL,   -- the resolved, unified identity
    source_record_id    VARCHAR(40) NOT NULL,   -- references Person.person_id
    source_table        VARCHAR(50) NOT NULL,
    match_confidence     DECIMAL(5,2),
    matched_by          VARCHAR(20) NOT NULL,   -- deterministic | probabilistic | manual
    reviewed_by         VARCHAR(40),
    reviewed_at         TIMESTAMP,
    created_at          TIMESTAMP NOT NULL,
    PRIMARY KEY (canonical_id, source_record_id)
);

CREATE TABLE Location (
    location_id         VARCHAR(40) PRIMARY KEY,
    station_id          VARCHAR(20) NOT NULL,
    latitude            DECIMAL(9,6),
    longitude           DECIMAL(9,6),
    area_type           VARCHAR(20)             -- urban | rural
);

CREATE TABLE Case (
    case_id             VARCHAR(40) PRIMARY KEY,
    fir_number          VARCHAR(30) NOT NULL,
    station_id          VARCHAR(20) NOT NULL,
    crime_type          VARCHAR(100) NOT NULL,
    modus_operandi       VARCHAR(500),
    date_time           TIMESTAMP NOT NULL,
    status              VARCHAR(30) NOT NULL,
    narrative_text       TEXT,
    location_id          VARCHAR(40)             -- references Location.location_id
);

-- NOTE: canonical_id here, never person_id. This is the constraint that
-- keeps the network graph and case-twin finder honest -- if this table
-- ever references a raw, unresolved person_id, every downstream feature
-- built on it inherits whatever fragmentation exists in the raw data.
CREATE TABLE CasePersonLink (
    case_id             VARCHAR(40) NOT NULL,   -- references Case.case_id
    canonical_id        VARCHAR(40) NOT NULL,   -- references EntityResolution.canonical_id
    role_in_case         VARCHAR(20) NOT NULL,   -- accused | victim | witness
    PRIMARY KEY (case_id, canonical_id, role_in_case)
);

CREATE TABLE Vehicle (
    vehicle_id           VARCHAR(40) PRIMARY KEY,
    registration_no       VARCHAR(20) NOT NULL,
    owner_canonical_id    VARCHAR(40)             -- references EntityResolution.canonical_id
);

CREATE TABLE FinancialTransaction (
    transaction_id        VARCHAR(40) PRIMARY KEY,
    case_id               VARCHAR(40),            -- references Case.case_id
    account_ref           VARCHAR(40),
    amount                DECIMAL(14,2),
    txn_date              TIMESTAMP,
    flagged_reason         VARCHAR(200)
);

-- Derived, never manually entered. Rule-based and transparent by design
-- -- contributing_factors is a human-readable string, not a black box.
CREATE TABLE OffenderProfile (
    canonical_id           VARCHAR(40) PRIMARY KEY,  -- references EntityResolution.canonical_id
    priority_score          DECIMAL(5,2),
    contributing_factors     TEXT,
    last_computed_at        TIMESTAMP,
    model_version           VARCHAR(20)
);

-- What makes the audit trail and the PDF export of conversation history
-- possible. cited_record_ids should never be empty for a real answer --
-- that's the evidence-composer rule enforced at the data layer.
CREATE TABLE ConversationLog (
    session_id             VARCHAR(40) NOT NULL,
    user_id                VARCHAR(40) NOT NULL,
    role                   VARCHAR(20) NOT NULL,     -- SI | ACP | Analyst | Policy
    query_text              TEXT NOT NULL,
    response_text           TEXT NOT NULL,
    cited_record_ids         TEXT,                     -- JSON array of source record IDs
    timestamp               TIMESTAMP NOT NULL,
    PRIMARY KEY (session_id, timestamp)
);

CREATE TABLE AccessAuditLog (
    log_id                 VARCHAR(40) PRIMARY KEY,  -- Auto-generated ROWID
    session_id             VARCHAR(40) NOT NULL,
    role                   VARCHAR(20) NOT NULL,
    resource               VARCHAR(50) NOT NULL,
    decision               VARCHAR(10) NOT NULL,     -- allow | deny
    timestamp              TIMESTAMP NOT NULL
);

