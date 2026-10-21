"""
Supabase Client (Optional)
===========================
Initializes the Supabase Python client for Storage operations (wound image uploads).
All database operations go through SQLAlchemy via DATABASE_URL — this client is NOT
required for the app to function with a local SQLite or direct Postgres connection.

If SUPABASE_URL / SUPABASE_KEY are not set, the client is None and Storage
features gracefully degrade (images are saved locally only).
"""

import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# Detect placeholder values left over from the .env template
_PLACEHOLDERS = {"", "YOUR_SUPABASE_PROJECT_URL", "YOUR_SUPABASE_ANON_PUBLIC_KEY"}

supabase = None

if SUPABASE_URL not in _PLACEHOLDERS and SUPABASE_KEY not in _PLACEHOLDERS:
    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase client initialized successfully.")
    except Exception as e:
        logger.warning("Supabase client could not be initialized: %s", e)
        supabase = None
else:
    logger.info(
        "Supabase credentials not configured — running without Supabase client. "
        "Wound images will be saved locally only. "
        "To enable Supabase Storage, set SUPABASE_URL and SUPABASE_KEY in your .env file."
    )


def get_supabase():
    """Return the Supabase client instance, or None if not configured."""
    return supabase
