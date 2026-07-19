-- =============================================================================
-- WaterQualityLens — D1 schema (§10, §12, §22)
--
-- Three logical layers:
--   1. Spatial layer   : pws_boundaries (Tier 1/2 polygons) + pws_centroids (Tier 3)
--   2. Municipal layer : water_systems, contaminants, detections, violations
--   3. Hardware layer  : filters (SKUs), certifications, filter_claims
-- Plus: users, saved_addresses, alerts, premium vault, ingestion bookkeeping.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- SPATIAL LAYER
-- ---------------------------------------------------------------------------

-- Tier 1 (EXPLICIT) & Tier 2 (MATCHED) service-area polygons. Bounding box
-- columns let the point-in-polygon pre-filter run as an index range scan.
CREATE TABLE IF NOT EXISTS pws_boundaries (
  id            INTEGER PRIMARY KEY,
  pwsid         TEXT NOT NULL,
  tier          TEXT NOT NULL CHECK (tier IN ('EXPLICIT', 'MATCHED')),
  place_geoid   TEXT,                 -- TIGER place GEOID for Tier 2 proxy joins
  geometry      TEXT NOT NULL,        -- GeoJSON Polygon/MultiPolygon (string)
  min_lon       REAL NOT NULL,
  min_lat       REAL NOT NULL,
  max_lon       REAL NOT NULL,
  max_lat       REAL NOT NULL,
  updated_at    TEXT
);
CREATE INDEX IF NOT EXISTS idx_boundaries_bbox
  ON pws_boundaries (tier, min_lon, max_lon, min_lat, max_lat);
CREATE INDEX IF NOT EXISTS idx_boundaries_place
  ON pws_boundaries (tier, place_geoid);
CREATE INDEX IF NOT EXISTS idx_boundaries_pwsid ON pws_boundaries (pwsid);

-- Tier 3 (MODELED) centroids with optional per-system radius (km).
CREATE TABLE IF NOT EXISTS pws_centroids (
  pwsid           TEXT PRIMARY KEY,
  centroid_lat    REAL NOT NULL,
  centroid_lon    REAL NOT NULL,
  model_radius_km REAL,
  state_fips      TEXT,
  updated_at      TEXT
);
CREATE INDEX IF NOT EXISTS idx_centroids_latlon
  ON pws_centroids (centroid_lat, centroid_lon);

-- ---------------------------------------------------------------------------
-- MUNICIPAL LAYER
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS water_systems (
  pwsid             TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  state             TEXT,
  county            TEXT,
  population_served INTEGER,
  pws_type          TEXT,
  primary_source    TEXT,
  updated_at        TEXT
);

-- Canonical contaminant definitions with legal MCL and health goal (MCLG/PHG).
CREATE TABLE IF NOT EXISTS contaminants (
  code        TEXT PRIMARY KEY,       -- SDWIS-style contaminant code
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,          -- e.g. Metal, PFAS, VOC, Inorganic, DBP, Radionuclide
  mcl         REAL,                   -- legal Maximum Contaminant Level (canonical unit)
  health_goal REAL,                   -- MCLG / Public Health Goal (canonical unit)
  unit        TEXT NOT NULL,          -- canonical unit for mcl/health_goal AND detections
  description TEXT
);

-- Most-recent measured value per (system, contaminant). Value is in the
-- contaminant's canonical unit so exceedance math is apples-to-apples.
CREATE TABLE IF NOT EXISTS detections (
  pwsid            TEXT NOT NULL,
  contaminant_code TEXT NOT NULL,
  value            REAL NOT NULL,
  unit             TEXT NOT NULL,
  sample_date      TEXT,
  sampling_agency  TEXT,
  source           TEXT,
  updated_at       TEXT,
  PRIMARY KEY (pwsid, contaminant_code),
  FOREIGN KEY (contaminant_code) REFERENCES contaminants (code)
);
CREATE INDEX IF NOT EXISTS idx_detections_pwsid ON detections (pwsid);

-- Full historical time-series for trend lines (§9 quality gate).
CREATE TABLE IF NOT EXISTS detection_history (
  id               INTEGER PRIMARY KEY,
  pwsid            TEXT NOT NULL,
  contaminant_code TEXT NOT NULL,
  value            REAL NOT NULL,
  unit             TEXT NOT NULL,
  sample_date      TEXT
);
CREATE INDEX IF NOT EXISTS idx_history_pwsid_date
  ON detection_history (pwsid, sample_date);

CREATE TABLE IF NOT EXISTS violations (
  pwsid              TEXT NOT NULL,
  violation_id       TEXT NOT NULL,
  contaminant_code   TEXT,
  violation_code     TEXT,
  violation_category TEXT,
  is_health_based    INTEGER NOT NULL DEFAULT 0,
  begin_date         TEXT,
  status             TEXT,
  created_at         TEXT,
  PRIMARY KEY (pwsid, violation_id)
);
CREATE INDEX IF NOT EXISTS idx_violations_pwsid ON violations (pwsid);
CREATE INDEX IF NOT EXISTS idx_violations_health
  ON violations (pwsid, is_health_based, created_at);

-- ---------------------------------------------------------------------------
-- HARDWARE LAYER (curated proprietary moat — §10)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS certifications (
  standard    TEXT PRIMARY KEY,       -- '42' | '53' | '58' | '401' | '372' | 'P473'
  description TEXT NOT NULL,
  is_health   INTEGER NOT NULL,       -- 1 => may back a health remediation claim
  is_obsolete INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS filters (
  id               INTEGER PRIMARY KEY,
  brand            TEXT NOT NULL,
  model            TEXT NOT NULL,
  sku              TEXT NOT NULL UNIQUE,
  form_factor      TEXT NOT NULL CHECK (form_factor IN
                     ('PITCHER','FAUCET','COUNTERTOP_RO','UNDERSINK_RO','WHOLE_HOUSE','REFRIGERATOR')),
  price_usd        REAL,
  capacity_gallons REAL,
  affiliate_url    TEXT,
  active           INTEGER NOT NULL DEFAULT 1
);

-- One row per verified reduction claim: SKU × standard × contaminant.
-- This SKU-level granularity is the platform's defensive moat (§4, §10).
CREATE TABLE IF NOT EXISTS filter_claims (
  filter_id        INTEGER NOT NULL,
  standard         TEXT NOT NULL,
  contaminant_code TEXT NOT NULL,
  certifier        TEXT NOT NULL DEFAULT 'NSF',   -- NSF | WQA | IAPMO
  verified         INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (filter_id, standard, contaminant_code),
  FOREIGN KEY (filter_id) REFERENCES filters (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_claims_contaminant
  ON filter_claims (contaminant_code, standard, verified);

-- ---------------------------------------------------------------------------
-- USERS / ALERTS / PREMIUM VAULT
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id                INTEGER PRIMARY KEY,
  email             TEXT NOT NULL UNIQUE,
  password_hash     TEXT NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'free',  -- 'free' | 'premium'
  created_at        TEXT
);

CREATE TABLE IF NOT EXISTS saved_addresses (
  id               INTEGER PRIMARY KEY,
  user_id          INTEGER NOT NULL,
  pwsid            TEXT,
  label            TEXT,
  address          TEXT NOT NULL,
  dwelling_type    TEXT DEFAULT 'UNKNOWN',
  alert_email      INTEGER NOT NULL DEFAULT 1,
  alert_sms        INTEGER NOT NULL DEFAULT 0,
  last_notified_at TEXT,
  created_at       TEXT,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_addresses (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_pwsid ON saved_addresses (pwsid);

CREATE TABLE IF NOT EXISTS alert_outbox (
  id         INTEGER PRIMARY KEY,
  user_id    INTEGER NOT NULL,
  email      TEXT NOT NULL,
  pwsid      TEXT,
  type       TEXT NOT NULL,
  subject    TEXT NOT NULL,
  body       TEXT NOT NULL,
  delivered  INTEGER NOT NULL DEFAULT 0,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS lab_results (
  id               INTEGER PRIMARY KEY,
  user_id          INTEGER NOT NULL,
  saved_address_id INTEGER,
  provider         TEXT NOT NULL,      -- TAP_SCORE | SIMPLELAB | MANUAL
  external_id      TEXT,
  analyte          TEXT NOT NULL,
  value            REAL NOT NULL,
  unit             TEXT NOT NULL,
  sampled_at       TEXT,
  created_at       TEXT,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_lab_user ON lab_results (user_id);

CREATE TABLE IF NOT EXISTS cartridge_schedules (
  id                      INTEGER PRIMARY KEY,
  user_id                 INTEGER NOT NULL,
  filter_id               INTEGER NOT NULL,
  installed_at            TEXT NOT NULL,
  capacity_gallons        REAL,
  estimated_daily_gallons REAL NOT NULL DEFAULT 3,
  created_at              TEXT,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_cartridge_user ON cartridge_schedules (user_id);

-- ---------------------------------------------------------------------------
-- INGESTION BOOKKEEPING (freshness reporting — §11, §13)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ingestion_log (
  id         INTEGER PRIMARY KEY,
  pwsid      TEXT NOT NULL,
  violations INTEGER NOT NULL DEFAULT 0,
  detections INTEGER NOT NULL DEFAULT 0,
  fetched_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ingestion_pwsid ON ingestion_log (pwsid, fetched_at);
