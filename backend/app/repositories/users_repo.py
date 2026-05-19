from app.repositories.firestore_client import get_db
from datetime import datetime, timezone

COLLECTION = "users"

def get(uid: str) -> dict | None:
    db = get_db
    snap = db.collection(COLLECTION).document(uid).get()
    if not snap.exists:
        return None
    return {"uid": uid, **snap.to_dict()}

def upsert(uid: str, data: dict) -> dict:
    db = get_db()
    patch = {
        "universidad": data.get("universidad" ,""),
        "estudios": data.get("estudios", ""),
        "updatedAt": datetime.now(timezone.utc)
    }
    db.collection(COLLECTION).document(uid).set(patch, merge=True)
    return {"uid": uid, **patch}