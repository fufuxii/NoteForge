from flask import Blueprint, request, jsonify, g
from app.auth.firebase_auth import require_auth
from app.services.forja_service import forge_async
from app.repositories import apuntes_repo
import threading

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

    images_data = [(f.filename, f.read(), f.mimetype) for f in images]
    audios_data = [(f.filename, f.read(), f.mimetype) for f in audios]

    nid = apuntes_repo.create(g.user["uid"], {"asignaturaId": asignatura_id})

    from flask import current_app
    app = current_app._get_current_object()
    uid = g.user["uid"]

    def run():
        with app.app_context():
            forge_async(uid, asignatura_id, images_data, audios_data, texts, nid)

    threading.Thread(target=run, daemon=True).start()

    # 202 Accepted — devuelve el id inmediatamente
    return jsonify({"id": nid}), 202