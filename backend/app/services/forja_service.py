from app.repositories import apuntes_repo
from app.services import storage_service, vision_service, gemini_service, speech_service

def forge(uid: str, asignatura_id, images, audios, texts) -> str:
    sources_meta = []
    sources_text = []

    for img in images:
        meta = storage_service.upload_file(uid, img, kind="images")
        ocr_text = vision_service.ocr_from_gcs(meta["path"])
        sources_meta.append({"type": "image", "path": meta["path"], "ocr": ocr_text})
        sources_text.append({"kind": "imagen-ocr", "text": ocr_text})

    for aud in audios:
        meta = storage_service.upload_file(uid, aud, kind="audios")
        transcript = speech_service.transcribe_uri(meta["gcsUri"], meta["contentType"])
        sources_meta.append({"type": "audio", "path": meta["path"], "transcript": transcript})
        sources_text.append({"kind": "audio-transcripcion", "text": transcript})

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
        result = gemini_service.forge_note(sources_text)
        apuntes_repo.update(nid, {"title": result.get("title", "Apunte sin título")})
        apuntes_repo.mark_ready(
            nid,
            structure=result,
            summary=result.get("summary", ""),
            tags=result.get("tags", []),
        )
    except Exception as e:
        apuntes_repo.mark_error(nid, str(e))
        raise

    return nid