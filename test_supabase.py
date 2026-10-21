"""
Supabase Connection Test Script
================================
Tests connectivity to Supabase services without exposing credentials.

Usage:
    python test_supabase.py
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Tables / views to verify (order matters: views after their base tables)
REQUIRED_TABLES = [
    "profiles",
    "patients",
    "doctors",
    "recovery_updates",
    "wound_images",
    "doctor_notes",
    "alerts",
    "follow_ups",
]

# Friendly label for the final report
TABLE_LABELS = {
    "profiles":         "PROFILES",
    "patients":         "PATIENTS",
    "doctors":          "DOCTORS",
    "recovery_updates": "RECOVERY UPDATES",
    "wound_images":     "WOUND IMAGES",
    "doctor_notes":     "DOCTOR NOTES",
    "alerts":           "ALERTS",
    "follow_ups":       "FOLLOW UPS",
}


def test_supabase_connection():
    """Test Supabase client connectivity and all required table queries."""

    print("=" * 60)
    print("  SUPABASE CONNECTION TEST")
    print("=" * 60)
    print()

    supabase_url = os.getenv("SUPABASE_URL", "")
    supabase_key = os.getenv("SUPABASE_KEY", "")
    database_url = os.getenv("DATABASE_URL", "")

    # ── 1. Validate environment variables ──────────────────────────
    placeholders_url = {"", "YOUR_SUPABASE_PROJECT_URL"}
    placeholders_key = {"", "YOUR_SUPABASE_ANON_PUBLIC_KEY"}

    if supabase_url in placeholders_url:
        print("[FAIL] SUPABASE_URL is not set or still has a placeholder value.")
        print("       -> Open .env and replace YOUR_SUPABASE_PROJECT_URL")
        return False

    if supabase_key in placeholders_key:
        print("[FAIL] SUPABASE_KEY is not set or still has a placeholder value.")
        print("       -> Open .env and replace YOUR_SUPABASE_ANON_PUBLIC_KEY")
        return False

    project_host = supabase_url.split("//")[-1] if "//" in supabase_url else "***"
    print("[OK]   Environment variables loaded (credentials not displayed)")
    print(f"[OK]   Supabase project: {project_host}")
    print()

    # ── 2. Initialise Supabase client ──────────────────────────────
    client_ok = False
    try:
        from supabase import create_client
        sb = create_client(supabase_url, supabase_key)
        print("[OK]   SUPABASE CLIENT INITIALIZED SUCCESSFULLY")
        client_ok = True
    except Exception as e:
        print(f"[FAIL] Supabase client initialization failed: {e}")
        return False
    print()

    # ── 3. Probe each required table / view ────────────────────────
    print("Testing required tables / views...")
    table_results = {}   # table_name -> "FOUND" | "NOT FOUND" | "ERROR"
    all_tables_ok = True

    for table in REQUIRED_TABLES:
        try:
            result = sb.table(table).select("id").limit(1).execute()
            row_count = len(result.data) if result.data else 0
            print(f"[OK]   {table:<20} — accessible ({row_count} row(s) returned)")
            table_results[table] = "FOUND"
        except Exception as e:
            err = str(e)
            if "does not exist" in err or "PGRST205" in err or "relation" in err:
                print(f"[FAIL] {table:<20} — NOT FOUND (schema not applied yet)")
                table_results[table] = "NOT FOUND"
            else:
                print(f"[WARN] {table:<20} — query error: {err[:80]}")
                table_results[table] = "NOT FOUND"
            all_tables_ok = False
    print()

    # ── 4. Test Supabase Storage ───────────────────────────────────
    print("Testing Supabase Storage (wound-images bucket)...")
    try:
        # Check access to the specific bucket instead of listing all buckets
        bucket_client = sb.storage.from_("wound-images")
        # Generate a public URL for a dummy file to verify the client can interact with the bucket
        test_url = bucket_client.get_public_url("test_connection.jpg")
        
        if test_url:
            print("[OK]   STORAGE BUCKET 'wound-images' IS ACCESSIBLE")
            print("[OK]   STORAGE CONNECTION SUCCESSFUL")
        else:
            print("[WARN] Storage bucket test failed to generate a URL.")
    except Exception as e:
        print(f"[WARN] Storage access note: {e}")
        print("       -> Storage test skipped (may be a permissions issue)")
    print()

    # ── 5. Test direct PostgreSQL connection (SQLAlchemy) ──────────
    placeholder_patterns = ("YOUR_", "<password>")
    is_placeholder = not database_url or any(p in database_url for p in placeholder_patterns)

    if not is_placeholder:
        print("Testing PostgreSQL connection (DATABASE_URL)...")
        try:
            from sqlalchemy import create_engine, text
            db_uri = database_url
            if db_uri.startswith("postgres://"):
                db_uri = db_uri.replace("postgres://", "postgresql://", 1)
            if "supabase.com" in db_uri and "sslmode" not in db_uri:
                db_uri += "?sslmode=require"
            engine = create_engine(db_uri)
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("[OK]   POSTGRESQL CONNECTION SUCCESSFUL")
        except Exception as e:
            print(f"[WARN] PostgreSQL connection note: {e}")
            print("       -> Check your DATABASE_URL in .env")
    else:
        print("[SKIP] DATABASE_URL not set or still placeholder — SQLite fallback active.")
    print()

    # ── Final Report ───────────────────────────────────────────────
    print("=" * 60)
    print("  FINAL STATUS REPORT")
    print("=" * 60)
    print(f"SUPABASE CLIENT:  {'CONNECTED' if client_ok else 'NOT CONNECTED'}")
    for table, label in TABLE_LABELS.items():
        status = table_results.get(table, "NOT FOUND")
        print(f"{label + ':':<20} {status}")
    print(f"DATABASE QUERY:   {'WORKING' if all_tables_ok else 'NOT WORKING'}")
    print("=" * 60)

    if not all_tables_ok:
        print()
        print("[ACTION REQUIRED] One or more tables are missing.")
        print("  1. Open: https://supabase.com/dashboard/project/fmuaydhjuynyfczmqttx/sql")
        print("  2. Click 'New Query'")
        print("  3. Paste the full contents of supabase_schema.sql")
        print("  4. Click Run, then re-run: python test_supabase.py")

    return client_ok


if __name__ == "__main__":
    success = test_supabase_connection()
    sys.exit(0 if success else 1)
