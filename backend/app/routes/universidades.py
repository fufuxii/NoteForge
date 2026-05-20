from flask import Blueprint, jsonify
from app.repositories import universidades_repo, apuntes_repo

universidades_bp = Blueprint("universidades", __name__)

@universidades_bp.get("")
def get_universidades():
    return jsonify(universidades_repo.get_all())

@universidades_bp.get("/<uid>/estudios")
def get_estudios(uid):
    universidad = universidades_repo.get(uid)
    if not universidad:
        return jsonify({"error": "not_found"}), 404
    return jsonify(universidad.get("estudios", []))

@universidades_bp.get("/apuntes-publicos")
def get_apuntes_publicos():
    from flask import request
    asignatura = request.args.get("asignatura", "").strip()
    if not asignatura:
        return jsonify({"error": "asignatura requerida"}), 400
    items = apuntes_repo.list_public_by_asignatura(asignatura)
    return jsonify({"items": items})