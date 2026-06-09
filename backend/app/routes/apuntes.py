# Rutas de los apuntes: listado, detalle, búsqueda, TTS, exportación, traducción y visibilidad.
from datetime import datetime, timezone
from flask import Blueprint, jsonify, g, request, Response, current_app
from app.auth.firebase_auth import require_auth
from app.repositories import apuntes_repo
from app.services import tts_service, translation_service, storage_service, export_service

apuntes_bp = Blueprint("apuntes", __name__)


# Marca como 'error' los apuntes que llevan demasiado tiempo forjándose (timeout).
def _fail_if_stale(item):
    if item.get("status") != "forging":
        return item
    created = item.get("createdAt")
    if not created:
        return item
    try:
        age = (datetime.now(timezone.utc) - created).total_seconds()
    except TypeError:
        return item
    if age > current_app.config["MAX_FORGE_SECONDS"]:
        apuntes_repo.mark_error(item["id"], "timeout")
        item["status"] = "error"
        item["error"] = "timeout"
    return item

@apuntes_bp.get("")
@require_auth
# Lista los apuntes del usuario autenticado.
def list_apuntes():
    items = apuntes_repo.list_by_owner(g.user["uid"])
    return jsonify({"items": items, "count": len(items)})

@apuntes_bp.get("/<nid>")
@require_auth
# Detalle de un apunte; comprueba que pertenece al usuario.
def get_apunte(nid):
    item = apuntes_repo.get(nid)
    if not item or item["ownerUid"] != g.user["uid"]:
        return jsonify({"error": "not_found"}), 404
    item = _fail_if_stale(item)
    return jsonify(item)

@apuntes_bp.get("/search")
@require_auth
# Búsqueda por prefijo de título.
def search():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"items": []})
    items = apuntes_repo.search_by_title(g.user["uid"], q)
    return jsonify({"items": items})

@apuntes_bp.get("/<nid>/tts")
@require_auth
# Genera (o reutiliza) el audio TTS del apunte en el idioma pedido.
def tts(nid):
    item = apuntes_repo.get(nid)
    if not item or item["ownerUid"] != g.user["uid"]:
        return jsonify({"error": "not_found"}), 404

    lang = request.args.get("lang", item.get("language") or "es")
    if lang not in ("es", "ca", "en"):
        lang = "es"

    tts_paths = item.get("ttsPaths") or {}
    # Si el audio ya está cacheado en Storage, lo sirve directamente.
    if lang in tts_paths:
        audio_bytes = storage_service.download_bytes(tts_paths[lang])
        return Response(audio_bytes, mimetype="audio/mpeg")

    if lang != (item.get("language") or "es"):
        item = translation_service.translate_apunte(item, lang)

    text = tts_service.build_narration(item)
    if not text.strip():
        return jsonify({"error": "empty_content"}), 400

    # Sintetiza la voz y la guarda en Storage para futuras peticiones.
    audio_bytes = tts_service.synthesize(text, lang=lang)

    meta = storage_service.upload_bytes(
        uid=item["ownerUid"],
        data=audio_bytes,
        kind="tts",
        ext="mp3",
        content_type="audio/mpeg",
    )
    apuntes_repo.save_tts_path(nid, lang, meta["path"])

    return Response(audio_bytes, mimetype="audio/mpeg")

@apuntes_bp.get("/<nid>/export")
@require_auth
# Exporta el apunte a PDF, DOCX o TXT.
def export_apunte(nid):
    fmt = request.args.get("format", "pdf").lower()
    if fmt not in ("pdf", "docx", "txt"):
        return jsonify({"error": "invalid_format"}), 400

    item = apuntes_repo.get(nid)
    if not item or item["ownerUid"] != g.user["uid"]:
        return jsonify({"error": "not_found"}), 404

    if item.get("status") != "ready":
        return jsonify({"error": "not_ready"}), 409

    lang = request.args.get("lang", item.get("language") or "es")
    if lang not in ("es", "ca", "en"):
        lang = "es"
    if lang != (item.get("language") or "es"):
        item = translation_service.translate_apunte(item, lang)

    data, mimetype, ext = export_service.render(item, fmt)
    filename = export_service.safe_filename(item.get("title") or "apunte", ext)

    return Response(
        data,
        mimetype=mimetype,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )

@apuntes_bp.get("/<nid>/translate")
@require_auth
# Devuelve una traducción al vuelo (sin guardarla).
def translate_endpoint(nid):
    target = request.args.get("lang", "en")
    if target not in ("es", "ca", "en"):
        return jsonify({"error": "invalid_lang"}), 400

    item = apuntes_repo.get(nid)
    if not item or item["ownerUid"] != g.user["uid"]:
        return jsonify({"error": "not_found"}), 404

    translated = translation_service.translate_apunte(item, target)
    return jsonify(translated)

@apuntes_bp.post("/<nid>/translate")
@require_auth
def translate_save(nid):
    """Guarda la traducción como apunte nuevo independiente."""
    body   = request.get_json(silent=True) or {}
    target = body.get("lang")
    title  = (body.get("title") or "").strip()

    if target not in ("es", "ca", "en"):
        return jsonify({"error": "invalid_lang"}), 400

    item = apuntes_repo.get(nid)
    if not item or item["ownerUid"] != g.user["uid"]:
        return jsonify({"error": "not_found"}), 404

    translated = translation_service.translate_apunte(item, target)

    new_id = apuntes_repo.create(g.user["uid"], {
        "title":          title or translated.get("title", "Apunte traducido"),
        "asignaturaId":   item.get("asignaturaId"),
        "tags":           item.get("tags", []),
        "language":       target,
        "sources":        [],
        "sourceApunteId": nid,
    })

    apuntes_repo.mark_ready(
        new_id,
        structure=translated.get("structure"),
        summary=translated.get("summary", ""),
        tags=item.get("tags", []),
    )

    if item.get("isPublic"):
        apuntes_repo.update(new_id, {"isPublic": True})

    return jsonify({"id": new_id, "ok": True}), 201

@apuntes_bp.delete("/<nid>")
@require_auth
# Elimina un apunte propio.
def delete_apunte(nid):
    item = apuntes_repo.get(nid)
    if not item or item["ownerUid"] != g.user["uid"]:
        return jsonify({"error": "not_found"}), 404
    apuntes_repo.delete(nid)
    return "", 204

@apuntes_bp.patch("/<nid>/visibility")
@require_auth
# Cambia la visibilidad pública/privada y la asignatura asociada.
def share_apunte(nid):
    item = apuntes_repo.get(nid)
    if not item or item["ownerUid"] != g.user["uid"]:
        return jsonify({"error": "not_found"}), 404
    body = request.get_json(silent=True) or {}
    is_public = bool(body.get("isPublic", False))
    asignatura = body.get("asignatura", None)
    apuntes_repo.set_public(nid, is_public, asignatura)
    return jsonify({"id": nid, "isPublic": is_public, "asignatura": asignatura})