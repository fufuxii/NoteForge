from flask import Blueprint, jsonify, g, request, Response
from app.auth.firebase_auth import require_auth
from app.repositories import apuntes_repo
from app.services import tts_service, translation_service

apuntes_bp = Blueprint("apuntes", __name__)

@apuntes_bp.get("")
@require_auth
def list_apuntes():
    items = apuntes_repo.list_by_owner(g.user["uid"])
    return jsonify({"items": items, "count": len(items)})

@apuntes_bp.get("/<nid>")
@require_auth
def get_apunte(nid):
    item = apuntes_repo.get(nid)
    if not item or item["ownerUid"] != g.user["uid"]:
        return jsonify({"error": "not_found"}), 404
    return jsonify(item)

@apuntes_bp.get("/search")
@require_auth
def search():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"items": []})
    items = apuntes_repo.search_by_title(g.user["uid"], q)
    return jsonify({"items": items})

@apuntes_bp.get("/<nid>/tts")
@require_auth
def tts(nid):
    item = apuntes_repo.get(nid)
    if not item or item["ownerUid"] != g.user["uid"]:
        return jsonify({"error": "not_found"}), 404

    lang = request.args.get("lang", item.get("language") or "es")
    if lang not in ("es", "ca", "en"):
        lang = "es"

    if lang != (item.get("language") or "es"):
        item = translation_service.translate_apunte(item, lang)

    text = tts_service.build_narration(item)
    if not text.strip():
        return jsonify({"error": "empty_content"}), 400

    audio_bytes = tts_service.synthesize(text, lang=lang)
    return Response(audio_bytes, mimetype="audio/mpeg")

@apuntes_bp.get("/<nid>/translate")
@require_auth
def translate_endpoint(nid):
    target = request.args.get("lang", "en")
    if target not in ("es", "ca", "en"):
        return jsonify({"error": "invalid_lang"}), 400

    item = apuntes_repo.get(nid)
    if not item or item["ownerUid"] != g.user["uid"]:
        return jsonify({"error": "not_found"}), 404

    translated = translation_service.translate_apunte(item, target)
    return jsonify(translated)