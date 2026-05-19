from flask import Blueprint, jsonify, g, request
from app.auth.firebase_auth import require_auth
from app.repositories import users_repo

users_bp = Blueprint("users", __name__)

@users_bp.get("/profile")
@require_auth
def get_profile():
    profile = users_repo.get(g.user["uid"]) or {"uid": g.user["uid"], "universidad": "", "estudios": ""}
    return jsonify(profile)

@users_bp.patch("/profile")
@require_auth
def update_profile():
    body = request.get_json(silent=True) or {}
    profile = users_repo.upsert(g.user["uid"], body)
    return jsonify(profile)