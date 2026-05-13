from datetime import datetime, timezone
from google.cloud import firestore
from app.repositories.firestore_client import get_db

COLLECTION = "apuntes"

def now():
    return datetime.now(timezone.utc)

def create(uid: str, data: dict) -> str:
    db = get_db()
    doc = {
        "ownerUid": uid,
        "title": data.get("title", "Sin título"),
        "asignaturaId": data.get("asignaturaId"),
        "tags": data.get("tags", []),
        "language": data.get("language", "es"),
        "status": "forging",
        "sources": data.get("sources", []),
        "structure": None,
        "summary": None,
        "audioUrl": None,
        "createdAt": now(),
        "updatedAt": now(),
        "forgedAt": None,
    }
    ref = db.collection(COLLECTION).document()
    ref.set(doc)
    return ref.id

def update(nid: str, patch: dict) -> None:
    db = get_db()
    patch["updatedAt"] = now()
    db.collection(COLLECTION).document(nid).update(patch)

def mark_ready(nid: str, structure: dict, summary: str, tags: list[str]) -> None:
    update(nid, {
        "structure": structure,
        "summary": summary,
        "tags": tags,
        "status": "ready",
        "forgedAt": now(),
    })

def mark_error(nid: str, error_msg: str) -> None:
    update(nid, {"status": "error", "error": error_msg})

def get(nid: str) -> dict | None:
    db = get_db()
    snap = db.collection(COLLECTION).document(nid).get()
    if not snap.exists:
        return None
    data = snap.to_dict()
    data["id"] = snap.id
    return data

def list_by_owner(uid: str, limit: int = 50) -> list[dict]:
    db = get_db()
    q = (db.collection(COLLECTION)
           .where(filter=firestore.FieldFilter("ownerUid", "==", uid))
           .limit(limit))
    out = []
    for snap in q.stream():
        d = snap.to_dict()
        d["id"] = snap.id
        out.append(d)
    out.sort(key=lambda x: x.get("createdAt") or "", reverse=True)
    return out

def search_by_title(uid: str, prefix: str, limit: int = 10) -> list[dict]:
    db = get_db()
    end = prefix + "\uf8ff"
    q = (db.collection(COLLECTION)
           .where(filter=firestore.FieldFilter("ownerUid", "==", uid))
           .order_by("title")
           .start_at([prefix])
           .end_at([end])
           .limit(limit))
    return [{**s.to_dict(), "id": s.id} for s in q.stream()]