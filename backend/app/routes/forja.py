# Endpoint de la 'forja': recibe las fuentes (imágenes, audios, texto)
# y lanza el pipeline de IA en segundo plano.
from flask import Blueprint, request, jsonify, g, current_app
from app.auth.firebase_auth import require_auth
from app.services.forja_service import forge_async
from app.repositories import apuntes_repo
from app.repositories import users_repo
from concurrent.futures import ThreadPoolExecutor

forja_bp = Blueprint("forja", __name__)

# Pool de hilos que ejecuta la forja sin bloquear la respuesta HTTP.
_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="forja")


@forja_bp.post("")
@require_auth
def forjar():
    images = request.files.getlist("images")
    audios = request.files.getlist("audios")
    texts = request.form.getlist("texts")
    asignatura_id = request.form.get("asignaturaId")

    # Rechaza la petición si no llega ninguna fuente.
    if not images and not audios and not any(t.strip() for t in texts):
        return jsonify({"error": "no_sources"}), 400

    # Lee los ficheros a memoria antes de salir del contexto de la petición.
    images_data = [(f.filename, f.read(), f.mimetype) for f in images]
    audios_data = [(f.filename, f.read(), f.mimetype) for f in audios]

    # Crea el apunte en estado 'forging' y devuelve su id al instante.
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

    # Encola la forja; el cliente irá consultando el estado por polling.
    _executor.submit(run)

    # 202 Accepted: trabajo aceptado pero todavía en proceso.
    return jsonify({"id": nid}), 202