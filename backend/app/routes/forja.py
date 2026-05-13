from flask import Blueprint, request, jsonify, g
from app.auth.firebase_auth import require_auth
from app.services.forja_service import forge
from app.repositories import apuntes_repo

forja_bp = Blueprint("forja", __name__)

@forja_bp.post("")
@require_auth
def forjar():
    images = request.files.getlist("images")
    audios = request.files.getlist("audios")
    texts = request.form.getlist("texts")
    asignatura_id = request.form.get("asignaturaId")

    if not images and not audios and not any(t.strip() for t in texts):
        return jsonify({"error": "no_sources"}), 400

    try:
        nid = forge(g.user["uid"], asignatura_id, images, audios, texts)
    except Exception as e:
        return jsonify({"error": "forge_failed", "detail": str(e)}), 500

    apunte = apuntes_repo.get(nid)
    return jsonify({"id": nid, "apunte": apunte}), 201