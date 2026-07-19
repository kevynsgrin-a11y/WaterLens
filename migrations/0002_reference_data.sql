-- =============================================================================
-- Curated reference data — the proprietary, defensible moat (§4, §10, §22).
--
-- Certification policy (verbatim from the plan):
--   * Health standards 53 / 58 / 401 are the ONLY standards that may back a
--     contaminant remediation claim.
--   * NSF 42 (aesthetic) and NSF 372 (lead-free materials) are isolated from all
--     health claims — they must NEVER satisfy a detected contaminant.
--   * P473 was retired in 2022 and absorbed into 53/58; it is marked obsolete.
--
-- Units are canonical per contaminant and shared by mcl/health_goal/detections:
--   ug/L = micrograms per liter (ppb); ng/L = nanograms per liter (ppt);
--   mg/L = milligrams per liter (ppm); pCi/L = picocuries per liter.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- NSF/ANSI standards
-- ---------------------------------------------------------------------------
INSERT OR REPLACE INTO certifications (standard, description, is_health, is_obsolete) VALUES
  ('42',   'Aesthetic effects: chlorine, taste, odor, particulates. No health-contaminant protection.', 0, 0),
  ('53',   'Health effects: lead, VOCs, cysts, chromium, and (post-P473) PFAS reduction.',              1, 0),
  ('58',   'Reverse osmosis: dissolved inorganics, arsenic, hexavalent chromium, and total PFAS.',      1, 0),
  ('401',  'Emerging/incidental compounds: pharmaceuticals and select trace contaminants.',             1, 0),
  ('372',  'Lead-free materials (manufacturing content only). Not a water-treatment claim.',             0, 0),
  ('P473', 'Retired 2022 PFOA/PFOS standard; absorbed into NSF/ANSI 53 and 58.',                        0, 1);

-- ---------------------------------------------------------------------------
-- Contaminants (MCL / health goal in canonical unit)
-- ---------------------------------------------------------------------------
INSERT OR REPLACE INTO contaminants (code, name, category, mcl, health_goal, unit, description) VALUES
  ('PB90', 'Lead',                  'Metal',        15,    0,     'ug/L', 'Neurotoxin. Federal action level 15 ug/L; MCLG is zero. Primarily from lead service lines and premise plumbing.'),
  ('CU90', 'Copper',                'Metal',        1.3,   1.3,   'mg/L', 'Action level 1.3 mg/L. Elevated levels cause GI distress.'),
  ('CR6',  'Hexavalent Chromium',   'Metal',        10,    0.02,  'ug/L', 'Chromium-6. California MCL 10 ug/L; public health goal 0.02 ug/L. Carcinogen.'),
  ('1020', 'Total Chromium',        'Metal',        100,   100,   'ug/L', 'Federal MCL 100 ug/L (0.1 mg/L).'),
  ('1005', 'Arsenic',               'Metal',        10,    0,     'ug/L', 'MCL 10 ug/L; MCLG zero. Carcinogen.'),
  ('1040', 'Nitrate',               'Inorganic',    10,    10,    'mg/L', 'MCL 10 mg/L as nitrogen. Acute risk to infants (blue-baby syndrome).'),
  ('PFOA', 'PFOA',                  'PFAS',         4,     0,     'ng/L', 'EPA 2024 MCL 4.0 ppt; MCLG zero. Forever chemical.'),
  ('PFOS', 'PFOS',                  'PFAS',         4,     0,     'ng/L', 'EPA 2024 MCL 4.0 ppt; MCLG zero. Forever chemical.'),
  ('GENX', 'GenX (HFPO-DA)',        'PFAS',         10,    10,    'ng/L', 'EPA 2024 MCL 10 ppt (Hazard Index component).'),
  ('PFHXS','PFHxS',                 'PFAS',         10,    10,    'ng/L', 'EPA 2024 MCL 10 ppt (Hazard Index component).'),
  ('PFNA', 'PFNA',                  'PFAS',         10,    10,    'ng/L', 'EPA 2024 MCL 10 ppt (Hazard Index component).'),
  ('2950', 'Total Trihalomethanes', 'DBP',          80,    0,     'ug/L', 'Disinfection byproduct. MCL 80 ug/L.'),
  ('2456', 'Haloacetic Acids (HAA5)','DBP',         60,    0,     'ug/L', 'Disinfection byproduct. MCL 60 ug/L.'),
  ('2990', 'Benzene',               'VOC',          5,     0,     'ug/L', 'Volatile organic compound. MCL 5 ug/L; MCLG zero.'),
  ('2984', 'Trichloroethylene',     'VOC',          5,     0,     'ug/L', 'TCE. MCL 5 ug/L; MCLG zero.'),
  ('2987', 'Tetrachloroethylene',   'VOC',          5,     0,     'ug/L', 'PCE. MCL 5 ug/L; MCLG zero.'),
  ('2050', 'Atrazine',              'Pesticide',    3,     3,     'ug/L', 'Herbicide. MCL 3 ug/L.'),
  ('4006', 'Uranium',               'Radionuclide', 30,    0,     'ug/L', 'MCL 30 ug/L; MCLG zero.'),
  ('4010', 'Combined Radium 226/228','Radionuclide',5,     0,     'pCi/L','MCL 5 pCi/L; MCLG zero.'),
  ('1925', 'Fluoride',              'Inorganic',    4,     4,     'mg/L', 'MCL 4 mg/L. Secondary standard 2 mg/L.');

-- ---------------------------------------------------------------------------
-- Filters (SKUs). Explicit ids so filter_claims can reference them.
-- ---------------------------------------------------------------------------
INSERT OR REPLACE INTO filters (id, brand, model, sku, form_factor, price_usd, capacity_gallons, affiliate_url, active) VALUES
  (1,  'ZeroWater',        '5-Stage Ready-Pour Pitcher',       'ZW-ZD010RP',   'PITCHER',       39.99,   25,   'https://affil.waterqualitylens.com/zerowater-zd010rp',  1),
  (2,  'Frizzlife',        'M800 Under-Sink Reverse Osmosis',  'FZ-M800',      'UNDERSINK_RO',  399.00,  1100, 'https://affil.waterqualitylens.com/frizzlife-m800',     1),
  (3,  'AquaTru',          'Classic Countertop RO',            'AT-CLASSIC',   'COUNTERTOP_RO', 449.00,  600,  'https://affil.waterqualitylens.com/aquatru-classic',    1),
  (4,  'Clearly Filtered', 'Affinity Filtered Water Pitcher',  'CF-AFFINITY',  'PITCHER',       90.00,   100,  'https://affil.waterqualitylens.com/clearlyfiltered',    1),
  (5,  'Brita',            'Standard Everyday Pitcher (OB03)', 'BR-OB03',      'PITCHER',       29.99,   40,   'https://affil.waterqualitylens.com/brita-standard',     1),
  (6,  'Brita',            'Elite Pitcher (OB06)',             'BR-OB06',      'PITCHER',       39.99,   120,  'https://affil.waterqualitylens.com/brita-elite',        1),
  (7,  'Pureline',         'Universal Replacement Cartridge',  'PL-UNIV01',    'REFRIGERATOR',  19.99,   200,  'https://affil.waterqualitylens.com/pureline-univ',      1),
  (8,  'Waterdrop',        'G3P800 Under-Sink RO',             'WD-G3P800',    'UNDERSINK_RO',  549.00,  1000, 'https://affil.waterqualitylens.com/waterdrop-g3p800',   1),
  (9,  'LifeStraw',        'Home Water Filter Pitcher',        'LS-HOME7',     'PITCHER',       59.99,   40,   'https://affil.waterqualitylens.com/lifestraw-home',     1),
  (10, 'Epic Water',       'Pure Filter Pitcher',              'EP-PURE10',    'PITCHER',       69.95,   150,  'https://affil.waterqualitylens.com/epic-pure',          1),
  (11, 'SpringWell',       'CF1 Whole House Filter',           'SW-CF1',       'WHOLE_HOUSE',   1000.00, 1000000, 'https://affil.waterqualitylens.com/springwell-cf1',  1);

-- ---------------------------------------------------------------------------
-- Filter claims (SKU × standard × contaminant). ONLY health standards (53/58/401)
-- appear against contaminants; 42/372 claims are recorded but never health-eligible.
-- ---------------------------------------------------------------------------

-- (1) ZeroWater 5-Stage Pitcher — NSF 42 (chlorine) + NSF 53 (lead, chromium, PFAS).
INSERT OR REPLACE INTO filter_claims (filter_id, standard, contaminant_code, certifier, verified) VALUES
  (1, '42',  '2950', 'NSF',   1),   -- aesthetic/chlorine (non-health)
  (1, '53',  'PB90', 'NSF',   1),
  (1, '53',  'CR6',  'NSF',   1),
  (1, '53',  '1020', 'NSF',   1),
  (1, '53',  'PFOA', 'IAPMO', 1),
  (1, '53',  'PFOS', 'IAPMO', 1);

-- (2) Frizzlife M800 Under-Sink RO — broad NSF 58 coverage.
INSERT OR REPLACE INTO filter_claims (filter_id, standard, contaminant_code, certifier, verified) VALUES
  (2, '58', 'PB90', 'NSF', 1),
  (2, '58', 'CR6',  'NSF', 1),
  (2, '58', '1020', 'NSF', 1),
  (2, '58', '1005', 'NSF', 1),
  (2, '58', 'PFOA', 'NSF', 1),
  (2, '58', 'PFOS', 'NSF', 1),
  (2, '58', 'GENX', 'NSF', 1),
  (2, '58', 'PFHXS','NSF', 1),
  (2, '58', 'PFNA', 'NSF', 1),
  (2, '58', '1040', 'NSF', 1),
  (2, '58', '4006', 'NSF', 1),
  (2, '58', '4010', 'NSF', 1),
  (2, '58', '1925', 'NSF', 1);

-- (3) AquaTru Classic Countertop RO — NSF 42/53/58/401.
INSERT OR REPLACE INTO filter_claims (filter_id, standard, contaminant_code, certifier, verified) VALUES
  (3, '42',  '2950', 'NSF', 1),
  (3, '53',  'PB90', 'NSF', 1),
  (3, '53',  'CR6',  'NSF', 1),
  (3, '58',  '1005', 'NSF', 1),
  (3, '58',  'PFOA', 'NSF', 1),
  (3, '58',  'PFOS', 'NSF', 1),
  (3, '58',  '1040', 'NSF', 1),
  (3, '58',  '1925', 'NSF', 1),
  (3, '401', '2984', 'NSF', 1),
  (3, '53',  '2950', 'NSF', 1);

-- (4) Clearly Filtered Affinity Pitcher — tested to 42/53/58/401 (broad).
INSERT OR REPLACE INTO filter_claims (filter_id, standard, contaminant_code, certifier, verified) VALUES
  (4, '53',  'PB90', 'WQA', 1),
  (4, '53',  'CR6',  'WQA', 1),
  (4, '53',  '1020', 'WQA', 1),
  (4, '58',  'PFOA', 'WQA', 1),
  (4, '58',  'PFOS', 'WQA', 1),
  (4, '58',  '1005', 'WQA', 1),
  (4, '58',  '1925', 'WQA', 1),
  (4, '401', '2984', 'WQA', 1),
  (4, '401', '2050', 'WQA', 1);

-- (5) Brita Standard (OB03) — NSF 42 ONLY. Deliberately holds NO health cert:
--     it does NOT reduce lead (the exact Voice-of-Customer confusion in §8).
INSERT OR REPLACE INTO filter_claims (filter_id, standard, contaminant_code, certifier, verified) VALUES
  (5, '42', '2950', 'NSF', 1);

-- (6) Brita Elite (OB06) — NSF 42 + NSF 53 for lead, benzene (NOT PFAS/chromium-6).
INSERT OR REPLACE INTO filter_claims (filter_id, standard, contaminant_code, certifier, verified) VALUES
  (6, '42', '2950', 'NSF', 1),
  (6, '53', 'PB90', 'NSF', 1),
  (6, '53', '2990', 'NSF', 1),
  (6, '53', 'CU90', 'NSF', 1);

-- (7) Pureline generic cartridge — NSF 42 + NSF 372 ONLY. Deceptive-marketing
--     archetype (§5, §8): markets "lead-free" 372 but holds NO health cert.
INSERT OR REPLACE INTO filter_claims (filter_id, standard, contaminant_code, certifier, verified) VALUES
  (7, '42',  '2950', 'NSF', 1),
  (7, '372', 'PB90', 'NSF', 1);   -- 372 is materials-only; never satisfies a health match

-- (8) Waterdrop G3P800 Under-Sink RO — NSF 58/53/401.
INSERT OR REPLACE INTO filter_claims (filter_id, standard, contaminant_code, certifier, verified) VALUES
  (8, '58',  'PB90', 'NSF', 1),
  (8, '58',  'CR6',  'NSF', 1),
  (8, '58',  '1005', 'NSF', 1),
  (8, '58',  'PFOA', 'NSF', 1),
  (8, '58',  'PFOS', 'NSF', 1),
  (8, '58',  'GENX', 'NSF', 1),
  (8, '58',  '1040', 'NSF', 1),
  (8, '58',  '4006', 'NSF', 1),
  (8, '58',  '1925', 'NSF', 1),
  (8, '53',  '2950', 'NSF', 1),
  (8, '401', '2984', 'NSF', 1);

-- (9) LifeStraw Home Pitcher — NSF 53 (lead) + IAPMO PFAS + 401.
INSERT OR REPLACE INTO filter_claims (filter_id, standard, contaminant_code, certifier, verified) VALUES
  (9, '53',  'PB90', 'NSF',   1),
  (9, '53',  'PFOA', 'IAPMO', 1),
  (9, '53',  'PFOS', 'IAPMO', 1),
  (9, '401', '2050', 'NSF',   1);

-- (10) Epic Pure Pitcher — tested to 53/401 for lead, chromium, VOCs (NOT PFAS full).
INSERT OR REPLACE INTO filter_claims (filter_id, standard, contaminant_code, certifier, verified) VALUES
  (10, '53',  'PB90', 'WQA', 1),
  (10, '53',  'CR6',  'WQA', 1),
  (10, '53',  '1020', 'WQA', 1),
  (10, '401', '2984', 'WQA', 1),
  (10, '401', '2987', 'WQA', 1);

-- (11) SpringWell CF1 Whole House — NSF 42 aesthetic only (no health cover).
INSERT OR REPLACE INTO filter_claims (filter_id, standard, contaminant_code, certifier, verified) VALUES
  (11, '42', '2950', 'NSF', 1);
