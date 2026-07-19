-- =============================================================================
-- Enrichment migration (congruent additions from code review):
--   * contaminant health-effect narratives + priority (§13 provenance tooltips)
--   * additional regulated contaminants (nitrite, barium, cadmium, mercury,
--     coliform, E. coli, PFBS)
--   * verified filter claims for the new contaminants (RO + NSF 53 scope)
--   * zip_pwsid_map: cache of SDWA_GEOGRAPHIC_AREAS ZIP->PWSID resolutions
--
-- Canonical contaminant codes are unchanged (internally consistent across
-- contaminants/detections/filter_claims): Arsenic=1005, Nitrate=1040, etc.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extend the contaminant definition with consumer-facing health context.
-- ---------------------------------------------------------------------------
ALTER TABLE contaminants ADD COLUMN health_effects TEXT;
ALTER TABLE contaminants ADD COLUMN priority INTEGER DEFAULT 3;

UPDATE contaminants SET priority = 1, health_effects =
  'Delays in physical and mental development in infants and children; kidney problems and high blood pressure in adults. No safe exposure level (MCLG = 0).'
  WHERE code = 'PB90';
UPDATE contaminants SET priority = 2, health_effects =
  'Short-term gastrointestinal distress; long-term liver or kidney damage above the action level.'
  WHERE code = 'CU90';
UPDATE contaminants SET priority = 1, health_effects =
  'Known human carcinogen linked to stomach, lung, and nasal cancers with long-term ingestion. California PHG is 0.02 ug/L.'
  WHERE code = 'CR6';
UPDATE contaminants SET priority = 2, health_effects =
  'Allergic dermatitis in sensitive individuals; total chromium includes carcinogenic hexavalent and trivalent forms.'
  WHERE code = '1020';
UPDATE contaminants SET priority = 1, health_effects =
  'Skin damage and circulatory problems; long-term exposure increases bladder, lung, and skin cancer risk (MCLG = 0).'
  WHERE code = '1005';
UPDATE contaminants SET priority = 1, health_effects =
  'Causes methemoglobinemia ("blue-baby syndrome") in infants under 6 months. Carbon filters do NOT remove nitrate — reverse osmosis (NSF 58) only.'
  WHERE code = '1040';
UPDATE contaminants SET priority = 1, health_effects =
  'Cancer, thyroid disease, immune and developmental effects. A persistent "forever chemical" (MCLG = 0).'
  WHERE code = 'PFOA';
UPDATE contaminants SET priority = 1, health_effects =
  'Liver and thyroid harm, immune suppression, increased cancer risk. A persistent "forever chemical" (MCLG = 0).'
  WHERE code = 'PFOS';
UPDATE contaminants SET priority = 1, health_effects =
  'Developmental toxicity, liver damage, and immune disruption. Next-generation PFAS replacing PFOA.'
  WHERE code = 'GENX';
UPDATE contaminants SET priority = 1, health_effects =
  'Thyroid and immune effects; regulated under the EPA PFAS hazard-index mixture rule.'
  WHERE code = 'PFHXS';
UPDATE contaminants SET priority = 1, health_effects =
  'Liver toxicity and developmental effects; regulated under the EPA PFAS hazard-index mixture rule.'
  WHERE code = 'PFNA';
UPDATE contaminants SET priority = 2, health_effects =
  'Long-term exposure increases bladder-cancer risk; disinfection byproduct of chlorination.'
  WHERE code = '2950';
UPDATE contaminants SET priority = 2, health_effects =
  'Increased cancer risk with long-term exposure; disinfection byproduct of chlorination.'
  WHERE code = '2456';
UPDATE contaminants SET priority = 1, health_effects =
  'Anemia and decreased blood platelets; long-term exposure raises leukemia risk (MCLG = 0).'
  WHERE code = '2990';
UPDATE contaminants SET priority = 2, health_effects =
  'Liver damage and increased cancer risk; industrial degreaser (MCLG = 0).'
  WHERE code = '2984';
UPDATE contaminants SET priority = 2, health_effects =
  'Liver problems and increased cancer risk; dry-cleaning and industrial solvent (MCLG = 0).'
  WHERE code = '2987';
UPDATE contaminants SET priority = 2, health_effects =
  'Cardiovascular or reproductive effects; agricultural herbicide common in the Midwest.'
  WHERE code = '2050';
UPDATE contaminants SET priority = 2, health_effects =
  'Increased cancer risk and kidney toxicity with long-term exposure (MCLG = 0).'
  WHERE code = '4006';
UPDATE contaminants SET priority = 2, health_effects =
  'Increased cancer risk with long-term exposure to radioactivity (MCLG = 0).'
  WHERE code = '4010';
UPDATE contaminants SET priority = 3, health_effects =
  'Dental and skeletal fluorosis with long-term exposure above the MCL; secondary standard is 2 mg/L.'
  WHERE code = '1925';

-- ---------------------------------------------------------------------------
-- Additional regulated contaminants.
-- ---------------------------------------------------------------------------
INSERT OR REPLACE INTO contaminants (code, name, category, mcl, health_goal, unit, description, health_effects, priority) VALUES
  ('1041', 'Nitrite',            'Inorganic',     1,    1,    'mg/L',
     'MCL 1 mg/L as nitrogen.',
     'Causes methemoglobinemia in infants; acutely dangerous. Removed only by reverse osmosis (NSF 58), not carbon filters.', 1),
  ('1010', 'Barium',             'Metal',         2,    2,    'mg/L',
     'MCL 2 mg/L.',
     'Increases blood pressure at elevated levels.', 2),
  ('1015', 'Cadmium',            'Metal',         0.005,0.005,'mg/L',
     'MCL 0.005 mg/L.',
     'Kidney damage with long-term exposure; can leach from galvanized pipe and fittings.', 2),
  ('1035', 'Mercury (inorganic)','Metal',         0.002,0.002,'mg/L',
     'MCL 0.002 mg/L.',
     'Kidney damage and nervous-system effects above the MCL.', 2),
  ('6590', 'PFBS',               'PFAS',          NULL, 0,    'ng/L',
     'Regulated via the EPA PFAS hazard index; no individual MCL.',
     'Thyroid effects; part of the PFAS mixture hazard-index rule.', 2),
  ('3100', 'Total Coliform',     'Microbiological',0,   0,    'MPN',
     'Zero tolerance; any presence is a violation.',
     'Indicates possible sewage or animal-waste contamination and potential pathogens.', 1),
  ('3014', 'E. coli',            'Microbiological',0,   0,    'MPN',
     'Zero tolerance; any presence is a violation.',
     'Indicates fecal contamination; can cause severe GI illness, dangerous for vulnerable groups.', 1);

-- ---------------------------------------------------------------------------
-- Verified claims for the new contaminants.
-- Nitrite (1041) and inorganic metals are RO (NSF 58) territory; NSF 53 carbon
-- units add mercury/cadmium where independently certified. NO carbon SKU gets a
-- nitrate/nitrite claim — preserving the RO-only policy.
-- ---------------------------------------------------------------------------
INSERT OR REPLACE INTO filter_claims (filter_id, standard, contaminant_code, certifier, verified) VALUES
  -- Frizzlife M800 (RO 58)
  (2, '58', '1041', 'NSF', 1),
  (2, '58', '1010', 'NSF', 1),
  (2, '58', '1015', 'NSF', 1),
  (2, '58', '1035', 'NSF', 1),
  (2, '58', '6590', 'NSF', 1),
  -- AquaTru Classic (RO 58)
  (3, '58', '1041', 'NSF', 1),
  (3, '58', '1015', 'NSF', 1),
  (3, '58', '1035', 'NSF', 1),
  -- Waterdrop G3P800 (RO 58)
  (8, '58', '1041', 'NSF', 1),
  (8, '58', '1010', 'NSF', 1),
  (8, '58', '1015', 'NSF', 1),
  (8, '58', '1035', 'NSF', 1),
  (8, '58', '6590', 'NSF', 1),
  -- ZeroWater 5-Stage (NSF 53 mercury)
  (1, '53', '1035', 'NSF', 1),
  -- Brita Elite OB06 (NSF 53 cadmium + mercury)
  (6, '53', '1015', 'NSF', 1),
  (6, '53', '1035', 'NSF', 1);

-- ---------------------------------------------------------------------------
-- ZIP -> PWSID resolution cache (SDWA_GEOGRAPHIC_AREAS registry).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS zip_pwsid_map (
  zip_code       TEXT NOT NULL,
  pwsid          TEXT NOT NULL,
  confidence     REAL NOT NULL DEFAULT 0.85,
  resolution_src TEXT NOT NULL DEFAULT 'sdwis_geographic',
  state          TEXT,
  updated_at     TEXT,
  PRIMARY KEY (zip_code, pwsid)
);
CREATE INDEX IF NOT EXISTS idx_zip_pwsid_zip ON zip_pwsid_map (zip_code);
