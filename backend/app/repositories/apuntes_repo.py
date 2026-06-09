# Repositorio de la colección 'apuntes': CRUD y consultas sobre Firestore.
from datetime import datetime, timezone
from google.cloud import firestore
from app.repositories.firestore_client import get_db

COLLECTION = "apuntes"

def now():
    return datetime.now(timezone.utc)

# Crea un apunte nuevo en estado 'forging' con los campos por defecto.
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
        "isPublic": False,
        "sourceApunteId": data.get("sourceApunteId"),
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

# Marca el apunte como listo guardando estructura, resumen y etiquetas.
def mark_ready(nid: str, structure: dict, summary: str, tags: list[str]) -> None:
    update(nid, {
        "structure": structure,
        "summary": summary,
        "tags": tags,
        "status": "ready",
        "forgedAt": now(),
    })

# Marca el apunte como erróneo con el mensaje de fallo.
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

# Apuntes de un usuario, ordenados por fecha de creación descendente.
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

# Búsqueda por prefijo usando el truco del carácter \uf8ff de Firestore.
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

# Guarda la ruta del audio TTS ya cacheado, por idioma.
def save_tts_path(nid: str, lang: str, path: str) -> None:
    update(nid, {f"ttsPaths.{lang}": path})

def delete(nid: str) -> None:
    db = get_db()
    db.collection(COLLECTION).document(nid).delete()

def set_public(nid: str, public: bool, asignatura: str = None) -> None:
    patch = {"isPublic": public}
    if asignatura is not None:
        patch["asignatura"] = asignatura
    update(nid, patch)

# Apuntes públicos de una asignatura (alimenta la sección Universidades).
def list_public_by_asignatura(asignatura: str) -> list[dict]:
    db = get_db()
    q = (db.collection(COLLECTION)
           .where(filter=firestore.FieldFilter("isPublic", "==", True))
           .where(filter=firestore.FieldFilter("asignatura", "==", asignatura))
           .limit(50))
    out = []
    for snap in q.stream():
        d = snap.to_dict()
        d["id"] = snap.id
        out.append(d)
    return out