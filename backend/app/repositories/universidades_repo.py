from app.repositories.firestore_client import get_db

COLLECTION = "universidades"

def get_all() -> list[dict]:
    db = get_db()
    return [{"id": s.id, **s.to_dict()} for s in db.collection(COLLECTION).stream()]

def get(uid: str) -> dict | None:
    db = get_db()
    snap = db.collection(COLLECTION).document(uid).get()
    if not snap.exists:
        return None
    return {"id": snap.id, **snap.to_dict()}