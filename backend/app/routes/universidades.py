from flask import Blueprint, jsonify
from app.repositories import universidades_repo

universidades_bp = Blueprint("universidades", __name__)

@universidades_bp.get("")
def get_universidades():
    return jsonify(universidades_repo.get_all())

@universidades_bp.get("/<uid>/estudios")
def get_estudios(uid):
    uni = universidades_repo.get(uid)
    if not uni:
        return jsonify({"error": "not_found"}), 404
    return jsonify(uni.get("estudios", []))