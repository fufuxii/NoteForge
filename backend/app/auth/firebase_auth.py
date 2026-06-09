# Decorador require_auth: valida el ID token de Firebase y deja el usuario en flask.g.
from functools import wraps
from flask import request, jsonify, g, current_app
from firebase_admin import auth as fb_auth

def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # En modo desarrollo inyecta un usuario ficticio y no comprueba el token.
        if current_app.config.get("DEV_MOCK_AUTH"):
            g.user = {"uid": "dev-user-1", "email": "dev@noteforge.local"}
            return fn(*args, **kwargs)

        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return jsonify({"error": "missing_token"}), 401
        token = header.split(" ", 1)[1]
        try:
            # Verifica la firma del token contra Firebase y extrae uid/email.
            decoded = fb_auth.verify_id_token(token)
            g.user = decoded
        except Exception as e:
            return jsonify({"error": "invalid_token", "detail": str(e)}), 401
        return fn(*args, **kwargs)
    return wrapper