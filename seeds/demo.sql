-- =============================================================================
-- Demo / local-development seed data (NOT auto-applied as a migration).
--
-- Provides enough spatial + municipal data to exercise the full lookup pipeline
-- locally, including the two high-complexity municipal profiles the plan calls
-- out for unit testing: Flint, MI and Newark, NJ (§16), plus one "clean" system
-- to verify the zero-recommendation path.
--
-- Apply with:  npm run db:seed:local   (or db:seed:remote)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Water systems
-- ---------------------------------------------------------------------------
INSERT OR REPLACE INTO water_systems (pwsid, name, state, county, population_served, pws_type, primary_source, updated_at) VALUES
  ('MI0002360', 'City of Flint',             'MI', 'Genesee',   95000,  'CWS', 'SW', '2026-07-01T00:00:00Z'),
  ('NJ0714001', 'Newark Water Department',   'NJ', 'Essex',     285000, 'CWS', 'SW', '2026-07-01T00:00:00Z'),
  ('TX0610001', 'Clear Springs Water District','TX','Travis',   42000,  'CWS', 'GW', '2026-07-01T00:00:00Z');

-- ---------------------------------------------------------------------------
-- Tier 1 (EXPLICIT) service-area polygons + Tier 3 centroids
-- ---------------------------------------------------------------------------
INSERT OR REPLACE INTO pws_boundaries (id, pwsid, tier, place_geoid, geometry, min_lon, min_lat, max_lon, max_lat, updated_at) VALUES
  (1, 'MI0002360', 'EXPLICIT', '2629000',
      '{"type":"Polygon","coordinates":[[[-83.78,42.95],[-83.60,42.95],[-83.60,43.08],[-83.78,43.08],[-83.78,42.95]]]}',
      -83.78, 42.95, -83.60, 43.08, '2026-07-01T00:00:00Z'),
  (2, 'NJ0714001', 'EXPLICIT', '3451000',
      '{"type":"Polygon","coordinates":[[[-74.25,40.68],[-74.10,40.68],[-74.10,40.79],[-74.25,40.79],[-74.25,40.68]]]}',
      -74.25, 40.68, -74.10, 40.79, '2026-07-01T00:00:00Z'),
  (3, 'TX0610001', 'EXPLICIT', '4805000',
      '{"type":"Polygon","coordinates":[[[-97.83,30.20],[-97.66,30.20],[-97.66,30.34],[-97.83,30.34],[-97.83,30.20]]]}',
      -97.83, 30.20, -97.66, 30.34, '2026-07-01T00:00:00Z');

INSERT OR REPLACE INTO pws_centroids (pwsid, centroid_lat, centroid_lon, model_radius_km, state_fips, updated_at) VALUES
  ('MI0002360', 43.0125, -83.6875, 12, '26', '2026-07-01T00:00:00Z'),
  ('NJ0714001', 40.7357, -74.1724, 10, '34', '2026-07-01T00:00:00Z'),
  ('TX0610001', 30.2672, -97.7431, 15, '48', '2026-07-01T00:00:00Z');

-- ---------------------------------------------------------------------------
-- Detections (canonical units matching contaminants table)
-- ---------------------------------------------------------------------------

-- Flint, MI — elevated lead + copper + disinfection byproducts.
INSERT OR REPLACE INTO detections (pwsid, contaminant_code, value, unit, sample_date, sampling_agency, source, updated_at) VALUES
  ('MI0002360', 'PB90', 27,  'ug/L', '2026-05-15', 'MI EGLE', 'SDWIS_LCR', '2026-07-01T00:00:00Z'),
  ('MI0002360', 'CU90', 1.1, 'mg/L', '2026-05-15', 'MI EGLE', 'SDWIS_LCR', '2026-07-01T00:00:00Z'),
  ('MI0002360', '2950', 62,  'ug/L', '2026-04-10', 'MI EGLE', 'SDWIS',     '2026-07-01T00:00:00Z');

-- Newark, NJ — elevated lead + PFOA (co-detected forever chemical).
INSERT OR REPLACE INTO detections (pwsid, contaminant_code, value, unit, sample_date, sampling_agency, source, updated_at) VALUES
  ('NJ0714001', 'PB90', 48, 'ug/L', '2026-06-01', 'NJ DEP', 'SDWIS_LCR', '2026-07-01T00:00:00Z'),
  ('NJ0714001', 'PFOA', 9,  'ng/L', '2026-06-01', 'NJ DEP', 'SDWIS',     '2026-07-01T00:00:00Z'),
  ('NJ0714001', 'CR6',  6,  'ug/L', '2026-06-01', 'NJ DEP', 'SDWIS',     '2026-07-01T00:00:00Z');

-- Clear Springs, TX — everything within health goals (chlorine only, in-limit).
INSERT OR REPLACE INTO detections (pwsid, contaminant_code, value, unit, sample_date, sampling_agency, source, updated_at) VALUES
  ('TX0610001', '1040', 3.2, 'mg/L', '2026-05-20', 'TCEQ', 'SDWIS', '2026-07-01T00:00:00Z');

-- ---------------------------------------------------------------------------
-- Historical trend series (§9 quality gate — enables index-eligible entity pages)
-- ---------------------------------------------------------------------------
INSERT INTO detection_history (pwsid, contaminant_code, value, unit, sample_date) VALUES
  ('MI0002360', 'PB90', 21, 'ug/L', '2025-11-01'),
  ('MI0002360', 'PB90', 24, 'ug/L', '2026-02-01'),
  ('MI0002360', 'PB90', 27, 'ug/L', '2026-05-15'),
  ('NJ0714001', 'PB90', 52, 'ug/L', '2025-12-01'),
  ('NJ0714001', 'PB90', 50, 'ug/L', '2026-03-01'),
  ('NJ0714001', 'PB90', 48, 'ug/L', '2026-06-01'),
  ('NJ0714001', 'PFOA', 11, 'ng/L', '2025-12-01'),
  ('NJ0714001', 'PFOA', 9,  'ng/L', '2026-06-01');

-- ---------------------------------------------------------------------------
-- Violations
-- ---------------------------------------------------------------------------
INSERT OR REPLACE INTO violations
  (pwsid, violation_id, contaminant_code, violation_code, violation_category, is_health_based, begin_date, status, created_at) VALUES
  ('MI0002360', 'MI-2026-0012', 'PB90', '63', 'MCL', 1, '2026-05-20', 'Unaddressed', '2026-06-01T00:00:00Z'),
  ('NJ0714001', 'NJ-2026-0044', 'PB90', '63', 'MCL', 1, '2026-06-05', 'Unaddressed', '2026-06-10T00:00:00Z'),
  ('NJ0714001', 'NJ-2026-0045', 'PFOA', '2X', 'MCL', 1, '2026-06-05', 'Unaddressed', '2026-06-10T00:00:00Z');

-- ---------------------------------------------------------------------------
-- Ingestion freshness log
-- ---------------------------------------------------------------------------
INSERT INTO ingestion_log (pwsid, violations, detections, fetched_at) VALUES
  ('MI0002360', 1, 3, '2026-07-01T00:00:00Z'),
  ('NJ0714001', 2, 3, '2026-07-01T00:00:00Z'),
  ('TX0610001', 0, 1, '2026-07-01T00:00:00Z');
