import json
import sqlite3
from typing import Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from app.config import settings
from app.database import get_session_db_connection

class SessionService:
    def __init__(self):
        self.ttl_hours = settings.SESSION_TTL_HOURS

    def save_state(self, session_id: str, state: Dict[str, Any]) -> None:
        """
        Saves or updates anonymous session state.
        """
        conn = get_session_db_connection()
        state_str = json.dumps(state, ensure_ascii=False)
        with conn:
            conn.execute("""
                INSERT INTO sessions (session_id, updated_at, state_json)
                VALUES (?, CURRENT_TIMESTAMP, ?)
                ON CONFLICT(session_id) DO UPDATE SET
                    updated_at = CURRENT_TIMESTAMP,
                    state_json = excluded.state_json;
            """, (session_id, state_str))
        conn.close()

    def get_state(self, session_id: str) -> Dict[str, Any]:
        """
        Retrieves session state if within TTL; clears and returns empty if expired.
        """
        conn = get_session_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT updated_at, state_json FROM sessions WHERE session_id = ?;", (session_id,))
        row = cur.fetchone()
        conn.close()

        if not row:
            return {}

        # Check TTL
        updated_at_str = row["updated_at"]
        try:
            # SQLite CURRENT_TIMESTAMP is UTC format: 'YYYY-MM-DD HH:MM:SS'
            updated_at = datetime.strptime(updated_at_str, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)
            if now - updated_at > timedelta(hours=self.ttl_hours):
                # Expired
                self.reset_session(session_id)
                return {}
        except Exception:
            pass

        try:
            return json.loads(row["state_json"])
        except Exception:
            return {}

    def reset_session(self, session_id: str) -> None:
        """
        Clears session state for the given session_id.
        """
        conn = get_session_db_connection()
        with conn:
            conn.execute("DELETE FROM sessions WHERE session_id = ?;", (session_id,))
        conn.close()
