import uuid
from datetime import timedelta
from google.cloud import storage
from flask import current_app

_client = None

def _get_client():
    global _client
    if _client is None:
        _client = storage.Client()
    return _client

def upload_file(uid: str, file_storage, kind: str) -> dict:
    bucket_name = current_app.config["BUCKET"]
    bucket = _get_client().bucket(bucket_name)
    ext = (file_storage.filename.rsplit(".", 1)[-1] or "bin").lower()
    blob_name = f"users/{uid}/{kind}/{uuid.uuid4().hex}.{ext}"
    blob = bucket.blob(blob_name)
    blob.upload_from_file(file_storage.stream, content_type=file_storage.mimetype)
    return {
        "path": blob_name,
        "gcsUri": f"gs://{bucket_name}/{blob_name}",
        "contentType": file_storage.mimetype,
    }

def signed_url(path: str, minutes: int = 60) -> str:
    bucket = _get_client().bucket(current_app.config["BUCKET"])
    blob = bucket.blob(path)
    return blob.generate_signed_url(
        version="v4",
        expiration=timedelta(minutes=minutes),
        method="GET",
    )

def download_bytes(path: str) -> bytes:
    bucket = _get_client().bucket(current_app.config["BUCKET"])
    return bucket.blob(path).download_as_bytes()

def upload_bytes(uid: str, data: bytes, kind: str, ext: str, content_type: str) -> dict:
    bucket_name = current_app.config["BUCKET"]
    bucket = _get_client().bucket(bucket_name)
    blob_name = f"users/{uid}/{kind}/{uuid.uuid4().hex}.{ext}"
    blob = bucket.blob(blob_name)
    blob.upload_from_string(data, content_type=content_type)
    return {
        "path": blob_name,
        "gcsUri": f"gs://{bucket_name}/{blob_name}",
        "contentType": content_type,
    }