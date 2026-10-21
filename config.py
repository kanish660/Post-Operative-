import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'post-op-recovery-secret-key-2026')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-post-op-tracker')
    
    # Database Configuration Priority:
    # 1. DATABASE_URL (Supabase PostgreSQL) — preferred
    # 2. MySQL (if USE_MYSQL=true)
    # 3. Local SQLite fallback
    DATABASE_URL = os.environ.get('DATABASE_URL')
    
    # MYSQL Configuration (legacy fallback)
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_DB = os.environ.get('MYSQL_DB', 'post_op_recovery')
    USE_MYSQL = os.environ.get('USE_MYSQL', 'false').lower() == 'true'
    
    # Ignore placeholder values
    is_placeholder_db = (
        not DATABASE_URL or
        'YOUR_PROJECT_REF' in DATABASE_URL or
        'YOUR_PASSWORD' in DATABASE_URL or
        'YOUR_POSTGRESQL_CONNECTION_STRING' in DATABASE_URL or
        '<password>' in DATABASE_URL
    )
    
    if DATABASE_URL and not is_placeholder_db:
        # Fix postgres:// -> postgresql:// for SQLAlchemy compatibility
        if DATABASE_URL.startswith("postgres://"):
            DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        # Supabase requires SSL for pooled connections
        if 'supabase.com' in DATABASE_URL and 'sslmode' not in DATABASE_URL:
            separator = '&' if '?' in DATABASE_URL else '?'
            DATABASE_URL = DATABASE_URL + separator + 'sslmode=require'
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    elif USE_MYSQL:
        SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"
    else:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'post_op_recovery.db')}"
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max image upload limit
