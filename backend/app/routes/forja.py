from flask import Blueprint, request, jsonify, g, current_app
from app.auth.firebase_auth import require_auth
from app.services.forja_service import forge_async
from app.repositories import apuntes_repo
from app.repositories import users_repo
from concurrent.futures import ThreadPoolExecutor

forja_bp = Blueprint("forja", __name__)

_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="forja")


@forja_bp.post("")
@require_auth
def forjar():
    images = request.files.getlist("images")
    audios = request.files.getlist("audios")
    texts = request.form.getlist("texts")
    asignatura_id = request.form.get("asignaturaId")

    if not images and not audios and not any(t.strip() for t in texts):
        return jsonify({"error": "no_sources"}), 400

    images_data = [(f.filename, f.read(), f.mimetype) for f in images]
    audios_data = [(f.filename, f.read(), f.mimetype) for f in audios]

    nid = apuntes_repo.create(g.user["uid"], {"asignaturaId": asignatura_id})

    app = current_app._get_current_object()
    uid = g.user["uid"]

    user_profile = users_repo.get(uid) or {}
    context = {
        "universidad": user_profile.get("universidad", ""),
        "estudios":    user_profile.get("estudios", ""),
        "asignatura":  asignatura_id or "",
    }

    def run():
        with app.app_context():
            forge_async(uid, asignatura_id, images_data, audios_data, texts, nid, context)

    _executor.submit(run)

    return jsonify({"id": nid}), 202