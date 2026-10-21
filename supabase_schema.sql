-- ==============================================================
-- Supabase PostgreSQL Schema
-- Post-Operative Patient Remote Recovery Tracker
-- ==============================================================
-- Safe to run more than once: uses IF NOT EXISTS / OR REPLACE.
-- Does NOT drop any table or delete any data.
-- Does NOT touch auth.users (Supabase internal auth).
-- All tables match the Flask SQLAlchemy models in models/database.py.
-- RLS is enabled on every table; Flask uses DATABASE_URL (postgres
-- role) which bypasses RLS, so the policies protect direct
-- PostgREST / Supabase-client access only.
-- ==============================================================
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ==============================================================


-- ==============================================================
-- 1. PROFILES
-- ==============================================================
-- Mirrors the Flask User model (__tablename__ = 'users').
-- Named "profiles" here because:
--   • The connection test (test_supabase.py) queries public.profiles.
--   • "users" would conflict with Supabase's internal auth.users
--     convention and cause confusion.
--   • The Flask app uses SQLAlchemy with DATABASE_URL and manages
--     its own users table independently; this table is the
--     Supabase-schema equivalent that PostgREST can see.
--
-- Columns exactly match models/database.py → class User:
--   id, name, email, password, role, created_at
-- ==============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(120)  UNIQUE NOT NULL,
    password    VARCHAR(255)  NOT NULL,
    role        VARCHAR(20)   NOT NULL DEFAULT 'patient'
                    CHECK (role IN ('patient', 'doctor', 'admin')),
    created_at  TIMESTAMPTZ   DEFAULT NOW()
);


-- ==============================================================
-- 2. PATIENTS
-- ==============================================================
-- Mirrors Flask Patient model (__tablename__ = 'patients').
-- FK → profiles(id) instead of users(id) because profiles IS
-- the user identity table in this Supabase schema.
-- Columns exactly match models/database.py → class Patient.
-- ==============================================================
CREATE TABLE IF NOT EXISTS patients (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER       NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    age                 INTEGER,
    gender              VARCHAR(20),
    phone               VARCHAR(30),
    address             TEXT,
    surgery_type        VARCHAR(100),
    surgery_date        DATE,
    hospital            VARCHAR(150),
    doctor_name         VARCHAR(100),
    emergency_contact   VARCHAR(100),
    recovery_status     VARCHAR(50)   DEFAULT 'Healing Normally',
    created_at          TIMESTAMPTZ   DEFAULT NOW()
);


-- ==============================================================
-- 3. DOCTORS
-- ==============================================================
-- Mirrors Flask Doctor model (__tablename__ = 'doctors').
-- Columns exactly match models/database.py → class Doctor.
-- ==============================================================
CREATE TABLE IF NOT EXISTS doctors (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER       NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    specialization  VARCHAR(100),
    phone           VARCHAR(30),
    hospital        VARCHAR(150),
    created_at      TIMESTAMPTZ   DEFAULT NOW()
);


-- ==============================================================
-- 4. RECOVERY_UPDATES
-- ==============================================================
-- Mirrors Flask RecoveryUpdate model (__tablename__ = 'recovery_updates').
-- Columns exactly match models/database.py → class RecoveryUpdate.
-- Note: temperature stored as NUMERIC(5,2) to safely hold both
-- Celsius and Fahrenheit values (Flask uses db.Float).
-- ==============================================================
CREATE TABLE IF NOT EXISTS recovery_updates (
    id              SERIAL PRIMARY KEY,
    patient_id      INTEGER       NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    update_date     DATE          NOT NULL,
    pain_level      INTEGER       NOT NULL,
    temperature     NUMERIC(5,2)  NOT NULL,
    swelling        VARCHAR(20)   NOT NULL,
    redness         VARCHAR(20)   NOT NULL,
    discharge       VARCHAR(20)   NOT NULL,
    bleeding        VARCHAR(20)   NOT NULL,
    mobility        VARCHAR(20)   NOT NULL,
    appetite        VARCHAR(20)   DEFAULT 'Normal',
    sleep_quality   VARCHAR(20)   DEFAULT 'Good',
    recovery_status VARCHAR(50)   DEFAULT 'Healing Normally',
    comments        TEXT,
    created_at      TIMESTAMPTZ   DEFAULT NOW()
);


-- ==============================================================
-- 5. WOUND_IMAGES
-- ==============================================================
-- Mirrors Flask WoundImage model (__tablename__ = 'wound_images').
-- Columns exactly match models/database.py → class WoundImage.
-- ai_confidence is NUMERIC(5,2) matching db.Float in Flask.
-- ==============================================================
CREATE TABLE IF NOT EXISTS wound_images (
    id              SERIAL PRIMARY KEY,
    patient_id      INTEGER       NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    image_path      VARCHAR(255)  NOT NULL,
    upload_date     TIMESTAMPTZ   DEFAULT NOW(),
    description     TEXT,
    ai_result       VARCHAR(50)   NOT NULL,
    ai_confidence   NUMERIC(5,2),
    ai_message      TEXT
);


-- ==============================================================
-- 6. DOCTOR_NOTES
-- ==============================================================
-- Mirrors Flask DoctorNote model (__tablename__ = 'doctor_notes').
-- Columns exactly match models/database.py → class DoctorNote.
-- ==============================================================
CREATE TABLE IF NOT EXISTS doctor_notes (
    id          SERIAL PRIMARY KEY,
    patient_id  INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id   INTEGER NOT NULL REFERENCES doctors(id)  ON DELETE CASCADE,
    note        TEXT    NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ==============================================================
-- 7. ALERTS
-- ==============================================================
-- Mirrors Flask Alert model (__tablename__ = 'alerts').
-- alert_type values used in routes: 'AI Flag', 'Symptom Alert',
-- 'Doctor Follow-up' — stored as free-form VARCHAR, no CHECK
-- constraint so new types can be added without schema changes.
-- status CHECK matches Flask: 'Active' | 'Resolved'.
-- ==============================================================
CREATE TABLE IF NOT EXISTS alerts (
    id          SERIAL PRIMARY KEY,
    patient_id  INTEGER      NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    alert_type  VARCHAR(50)  NOT NULL,
    message     TEXT         NOT NULL,
    status      VARCHAR(20)  DEFAULT 'Active'
                    CHECK (status IN ('Active', 'Resolved')),
    created_at  TIMESTAMPTZ  DEFAULT NOW()
);


-- ==============================================================
-- 8. FOLLOW_UPS
-- ==============================================================
-- New table to track scheduled clinical follow-up appointments.
-- Referenced by routes/doctor.py (mark_follow_up flag) and
-- the required table list in test_supabase.py.
-- FK → patients(id) and doctors(id) with CASCADE delete.
-- ==============================================================
CREATE TABLE IF NOT EXISTS follow_ups (
    id              SERIAL PRIMARY KEY,
    patient_id      INTEGER      NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id       INTEGER      NOT NULL REFERENCES doctors(id)  ON DELETE CASCADE,
    scheduled_date  DATE         NOT NULL,
    reason          TEXT,
    status          VARCHAR(20)  DEFAULT 'Pending'
                        CHECK (status IN ('Pending', 'Completed', 'Cancelled')),
    notes           TEXT,
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);


-- ==============================================================
-- INDEXES
-- ==============================================================
CREATE INDEX IF NOT EXISTS idx_patients_user_id           ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_recovery_status   ON patients(recovery_status);
CREATE INDEX IF NOT EXISTS idx_recovery_updates_patient   ON recovery_updates(patient_id);
CREATE INDEX IF NOT EXISTS idx_recovery_updates_date      ON recovery_updates(update_date);
CREATE INDEX IF NOT EXISTS idx_wound_images_patient       ON wound_images(patient_id);
CREATE INDEX IF NOT EXISTS idx_wound_images_upload_date   ON wound_images(upload_date);
CREATE INDEX IF NOT EXISTS idx_doctor_notes_patient       ON doctor_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_doctor_notes_doctor        ON doctor_notes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_alerts_patient             ON alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status              ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_follow_ups_patient         ON follow_ups(patient_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_doctor          ON follow_ups(doctor_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status          ON follow_ups(status);


-- ==============================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================
-- Enabled on all tables. Flask uses DATABASE_URL (postgres role)
-- which bypasses RLS automatically — so the app is unaffected.
-- These policies protect tables from direct PostgREST / anon
-- key access.
-- ==============================================================
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients         ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors          ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE wound_images     ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_notes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups       ENABLE ROW LEVEL SECURITY;


-- ==============================================================
-- STORAGE BUCKET — wound-images
-- ==============================================================
-- ON CONFLICT DO NOTHING makes this safe to re-run.
-- ==============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('wound-images', 'wound-images', false)
ON CONFLICT (id) DO NOTHING;


-- ==============================================================
-- STORAGE POLICIES
-- ==============================================================
-- DROP before CREATE so re-running the script never raises
-- "policy already exists". Safe because no data lives in policies.
-- ==============================================================

-- Upload policy
DROP POLICY IF EXISTS "wound_images_insert" ON storage.objects;
CREATE POLICY "wound_images_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'wound-images');

-- Read policy
DROP POLICY IF EXISTS "wound_images_select" ON storage.objects;
CREATE POLICY "wound_images_select"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'wound-images');
