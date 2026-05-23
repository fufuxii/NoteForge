import copy
from google.cloud import translate
from flask import current_app

_client = None

def _get_client():
    global _client
    if _client is None:
        _client = translate.TranslationServiceClient()
    return _client

def _batch(texts: list[str], source: str, target: str) -> list[str]:
    if not texts:
        return []
    client = _get_client()
    parent = f"projects/{current_app.config['PROJECT_ID']}/locations/global"
    response = client.translate_text(
        request={
            "parent": parent,
            "contents": texts,
            "mime_type": "text/plain",
            "source_language_code": source,
            "target_language_code": target,
        }
    )
    return [t.translated_text for t in response.translations]

def translate_apunte(apunte: dict, target_lang: str) -> dict:
    source = apunte.get("language") or "es"
    if source == target_lang:
        return apunte

    out = copy.deepcopy(apunte)
    out["language"] = target_lang

    setters = []

    def collect(text, set_fn):
        if text and isinstance(text, str) and text.strip():
            setters.append((text, set_fn))

    collect(out.get("title"), lambda t: out.update({"title": t}))
    collect(out.get("summary"), lambda t: out.update({"summary": t}))

    structure = out.get("structure")
    if structure:
        collect(structure.get("title"), lambda t: structure.update({"title": t}))
        collect(structure.get("summary"), lambda t: structure.update({"summary": t}))

        for sec in structure.get("sections", []):
            collect(sec.get("heading"), lambda t, s=sec: s.update({"heading": t}))
            for block in sec.get("blocks", []):
                btype = block.get("type")
                if btype in ("paragraph", "quote"):
                    collect(block.get("text"), lambda t, b=block: b.update({"text": t}))
                elif btype == "bullet_list":
                    items = block.get("items", [])
                    for idx in range(len(items)):
                        collect(items[idx], lambda t, lst=items, i=idx: lst.__setitem__(i, t))

    if not setters:
        return out

    texts = [s[0] for s in setters]
    translated = _batch(texts, source, target_lang)

    for (_, setter), tr in zip(setters, translated):
        setter(tr)

    return out

def detect_language(text: str) -> str:
    if not text or not text.strip():
        return "es"
    try:
        client = _get_client()
        parent = f"projects/{current_app.config['PROJECT_ID']}/locations/global"
        response = client.detect_language(
            request={
                "parent": parent,
                "content": text[:1000],
                "mime_type": "text/plain",
            }
        )
        detected = response.languages[0].language_code if response.languages else "es"
        return detected if detected in ("es", "ca", "en") else "es"
    except Exception:
        return "es"