from google.cloud import vision
from app.services.storage_service import download_bytes

_client = None

def _get_client():
    global _client
    if _client is None:
        _client = vision.ImageAnnotatorClient()
    return _client

def ocr_from_gcs(gcs_path: str) -> str:
    content = download_bytes(gcs_path)
    image = vision.Image(content=content)
    response = _get_client().document_text_detection(image=image)
    if response.error.message:
        raise RuntimeError(f"Vision OCR error: {response.error.message}")
    return response.full_text_annotation.text or ""