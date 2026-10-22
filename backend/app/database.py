import os
import sqlite3
from app.config import settings

def get_source_db_connection() -> sqlite3.Connection:
    """
    Returns a read-only SQLite connection to the primary Torob dataset database.
    Enforces mode=ro via URI.
    """
    db_path = settings.SOURCE_DB_PATH
    if not os.path.exists(db_path):
        raise FileNotFoundError(
            f"Dataset database not found at '{db_path}'. "
            "Please ensure torob-dataset/processed_data/torob_agent.sqlite is present."
        )
    
    # Use URI mode=ro to ensure database cannot be modified
    uri_path = f"file:{os.path.abspath(db_path)}?mode=ro"
    conn = sqlite3.connect(uri_path, uri=True, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def get_session_db_connection() -> sqlite3.Connection:
    """
    Returns a writable SQLite connection to the local session storage database.
    Initializes tables if they do not exist.
    """
    db_path = settings.SESSION_DB_PATH
    os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
    
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    
    # Initialize session tables
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                state_json TEXT
            );
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_sessions_updated ON sessions(updated_at);
        """)
    return conn
