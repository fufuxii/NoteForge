# Orquestador de la forja: encadena Storage -> OCR/Speech -> Gemini -> guardado.
from app.repositories import apuntes_repo
from app.services import storage_service, vision_service, gemini_service, speech_service, translation_service

# Versión síncrona del pipeline (sube fuentes, las transcribe y llama a Gemini).
def forge(uid: str, asignatura_id, images, audios, texts) -> str:
    sources_meta = []
    sources_text = []

    # Cada imagen se sube y se pasa por OCR.
    for img in images:
        meta = storage_service.upload_file(uid, img, kind="images")
        ocr_text = vision_service.ocr_from_gcs(meta["path"])
        sources_meta.append({"type": "image", "path": meta["path"], "ocr": ocr_text})
        sources_text.append({"kind": "imagen-ocr", "text": ocr_text})

    # Cada audio se sube y se transcribe.
    for aud in audios:
        meta = storage_service.upload_file(uid, aud, kind="audios")
        transcript = speech_service.transcribe_uri(meta["gcsUri"], meta["contentType"])
        sources_meta.append({"type": "audio", "path": meta["path"], "transcript": transcript})
        sources_text.append({"kind": "audio-transcripcion", "text": transcript})

    # Las notas de texto se añaden tal cual.
    for t in texts:
        if t and t.strip():
            sources_meta.append({"type": "text", "text": t})
            sources_text.append({"kind": "texto-usuario", "text": t})

    nid = apuntes_repo.create(uid, {
        "asignaturaId": asignatura_id,
        "title": "Forjando…",
        "sources": sources_meta,
    })

    try:
        # Llama a Gemini y marca el apunte como listo con el resultado.
        result = gemini_service.forge_note(sources_text)
        apuntes_repo.update(nid, {"title": result.get("title", "Apunte sin título")})

        combined_text = " ".join(s["text"] for s in sources_text if s.get("text"))
        detected_lang = translation_service.detect_language(combined_text)

        apuntes_repo.mark_ready(
            nid,
            structure=result,
            summary=result.get("summary", ""),
            tags=result.get("tags", []),
        )

        apuntes_repo.update(nid, {"language": detected_lang})

    except Exception as e:
        apuntes_repo.mark_error(nid, str(e))
        raise

    return nid

# Versión en segundo plano (la usa el endpoint); recibe los ficheros ya leídos en memoria.
def forge_async(uid, asignatura_id, images_data, audios_data, texts, nid, context=None):
    from io import BytesIO
    from werkzeug.datastructures import FileStorage

    sources_meta = []
    sources_text = []

    try:
        for filename, data, mimetype in images_data:
            fs = FileStorage(stream=BytesIO(data), filename=filename, content_type=mimetype)
            meta = storage_service.upload_file(uid, fs, kind="images")
            ocr_text = vision_service.ocr_from_gcs(meta["path"])
            sources_meta.append({"type": "image", "path": meta["path"], "ocr": ocr_text})
            sources_text.append({"kind": "imagen-ocr", "text": ocr_text})

        for filename, data, mimetype in audios_data:
            fs = FileStorage(stream=BytesIO(data), filename=filename, content_type=mimetype)
            meta = storage_service.upload_file(uid, fs, kind="audios")
            transcript = speech_service.transcribe_uri(meta["gcsUri"], meta["contentType"])
            sources_meta.append({"type": "audio", "path": meta["path"], "transcript": transcript})
            sources_text.append({"kind": "audio-transcripcion", "text": transcript})

        for t in texts:
            if t and t.strip():
                sources_meta.append({"type": "text", "text": t})
                sources_text.append({"kind": "texto-usuario", "text": t})

        apuntes_repo.update(nid, {"sources": sources_meta})

        result = gemini_service.forge_note(sources_text, context=context)
        apuntes_repo.update(nid, {"title": result.get("title", "Apunte sin título")})

        combined_text = " ".join(s["text"] for s in sources_text if s.get("text"))
        detected_lang = translation_service.detect_language(combined_text)

        apuntes_repo.mark_ready(
            nid,
            structure=result,
            summary=result.get("summary", ""),
            tags=result.get("tags", []),
        )

        apuntes_repo.update(nid, {"language": detected_lang})

    except Exception as e:
        apuntes_repo.mark_error(nid, str(e))