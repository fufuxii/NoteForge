import os
from flask import Flask
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials

def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    if not firebase_admin._apps:
        cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {"projectId": app.config["PROJECT_ID"]})
        else:
            firebase_admin.initialize_app(options={"projectId": app.config["PROJECT_ID"]})

    CORS(app, origins=app.config["ALLOWED_ORIGINS"])

    from app.routes.health import health_bp
    # from app.routes.forja import forja_bp
    # from app.routes.apuntes import apuntes_bp

    app.register_blueprint(health_bp)
    # app.register_blueprint(forja_bp, url_prefix="/forja")
    # app.register_blueprint(apuntes_bp, url_prefix="/apuntes")

    return app