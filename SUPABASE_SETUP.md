# Supabase Setup Guide

Step-by-step instructions to connect your Post-Operative Recovery Tracker to Supabase.

---

## Prerequisites

- A [Supabase](https://supabase.com) account (free tier works)
- Python 3.10+ with dependencies installed (`pip install -r requirements.txt`)

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Choose an organization, set a project name (e.g., `post-op-recovery`), and set a **database password** (save this — you'll need it)
4. Select a region close to your users
5. Click **Create new project** and wait for provisioning (~2 minutes)

---

## Step 2: Get Your Credentials

Once your project is ready, go to **Settings → API** in the Supabase Dashboard:

| Credential | Where to Find It | `.env` Variable |
|---|---|---|
| **Project URL** | Settings → API → Project URL | `SUPABASE_URL` |
| **Anon/Public Key** | Settings → API → Project API Keys → `anon` `public` | `SUPABASE_KEY` |
| **Database Connection String** | Settings → Database → Connection string → URI | `DATABASE_URL` |

> [!WARNING]
> For `DATABASE_URL`, replace `[YOUR-PASSWORD]` in the connection string with the database password you set in Step 1.

---

## Step 3: Update Your `.env` File

Open `.env` in the project root and replace the placeholder values:

```env
SUPABASE_URL=https://abcdefghijk.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.abcdefghijk:YOUR_DB_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## Step 4: Create Database Tables

1. In your Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of [`supabase_schema.sql`](supabase_schema.sql)
4. Click **Run** (or press Ctrl+Enter)
5. You should see "Success. No rows returned" — this means all tables were created

The schema creates these tables:
- `users` — User accounts (patients, doctors, admins)
- `patients` — Patient profiles and surgery details
- `doctors` — Doctor profiles
- `recovery_updates` — Daily symptom tracking entries
- `wound_images` — Wound photo records with AI assessment results
- `doctor_notes` — Clinical notes from doctors
- `alerts` — System alerts (AI flags, symptom warnings)

It also:
- Creates performance indexes on frequently-queried columns
- Enables Row Level Security (RLS) on all tables
- Creates a `wound-images` Storage bucket for wound photo uploads

---

## Step 5: Verify the Connection

Run the test script:

```bash
python test_supabase.py
```

Expected output:
```
============================================================
  SUPABASE CONNECTION TEST
============================================================

[OK]   Environment variables loaded (credentials not displayed)
[OK]   Supabase project: abcdefghijk.supabase.co

[OK]   SUPABASE CLIENT INITIALIZED SUCCESSFULLY

Testing database query (profiles table)...
[OK]   DATABASE QUERY SUCCESSFUL — 0 profile(s) found

Testing Supabase Storage (wound-images bucket)...
[OK]   STORAGE BUCKET 'wound-images' EXISTS
[OK]   STORAGE CONNECTION SUCCESSFUL

Testing PostgreSQL connection (DATABASE_URL)...
[OK]   POSTGRESQL CONNECTION SUCCESSFUL

============================================================
  SUPABASE CONNECTION SUCCESSFUL
  DATABASE QUERY SUCCESSFUL
============================================================
```

---

## Step 6: Initialize & Seed Demo Data

```bash
python init_db.py
```

This creates demo accounts and sample data in your Supabase PostgreSQL database.

**Demo Accounts** (all passwords: `password123`):
| Email | Role |
|---|---|
| `admin@demo.com` | Admin |
| `doctor@demo.com` | Doctor |
| `patient@demo.com` | Patient |

---

## Step 7: Start the App

```bash
python app.py
```

The Flask API server starts on `http://localhost:5000`. All data is now stored in Supabase PostgreSQL, and wound images are uploaded to Supabase Storage.

---

## How It Works

```
┌──────────────┐     SQLAlchemy (DATABASE_URL)     ┌─────────────────────┐
│  Flask App   │ ─────────────────────────────────► │  Supabase PostgreSQL │
│  (Backend)   │                                    │  (All tables)        │
│              │     Supabase Python Client         ├─────────────────────┤
│              │ ─────────────────────────────────► │  Supabase Storage    │
│              │   (wound image uploads only)       │  (wound-images)      │
└──────────────┘                                    └─────────────────────┘
```

- **Database operations** (users, patients, recovery updates, wounds, alerts, doctor notes) all go through **SQLAlchemy** using your `DATABASE_URL`. This is a direct PostgreSQL connection to Supabase.
- **File uploads** (wound images) go through the **Supabase Python client** to Supabase Storage. If Supabase credentials aren't configured, images are saved locally in the `uploads/` folder.

---

## Troubleshooting

### `[FAIL] SUPABASE_URL is not set`
→ Update your `.env` with real Supabase credentials (Step 3).

### `[WARN] PostgreSQL connection note: ...SSL...`
→ Make sure your `DATABASE_URL` uses the pooler connection string from Settings → Database. SSL is auto-configured by the app.

### `[WARN] Storage bucket 'wound-images' not found`
→ Either run `supabase_schema.sql` (it creates the bucket), or create it manually: Supabase Dashboard → Storage → New Bucket → name it `wound-images`.

### App works locally with SQLite but not with Supabase
→ Check that your `DATABASE_URL` doesn't contain placeholder values like `YOUR_PROJECT_REF` or `YOUR_PASSWORD`.

### `relation "users" does not exist`
→ You need to run the schema first (Step 4). SQLAlchemy's `db.create_all()` should also create tables, but the SQL Editor approach is more reliable.
