import json
import os
from google import genai
from google.genai import types
from flask import current_app

_client = None

def _get_client():
    global _client
    if _client is None:
        os.environ["GOOGLE_CLOUD_PROJECT"] = current_app.config["PROJECT_ID"]
        os.environ["GOOGLE_CLOUD_LOCATION"] = current_app.config["REGION"]
        os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"
        _client = genai.Client()
    return _client

FORGE_PROMPT = """Eres NoteForge, un asistente que transforma apuntes brutos de estudiantes en documentos estructurados de estudio.

Recibes uno o más fragmentos de texto extraídos de imágenes (apuntes manuscritos), audios transcritos y notas de texto del usuario. Tu trabajo es fusionarlos en un único apunte coherente.

Devuelve EXCLUSIVAMENTE un JSON válido con esta forma exacta:

{
  "title": "string corto y descriptivo",
  "summary": "resumen de 2-3 frases del contenido",
  "tags": ["lista", "de", "etiquetas", "cortas"],
  "language": "es | ca | en",
  "sections": [
    {
      "heading": "string",
      "level": 1,
      "blocks": [
        {"type": "paragraph", "text": "..."},
        {"type": "bullet_list", "items": ["...", "..."]},
        {"type": "formula", "latex": "..."},
        {"type": "quote", "text": "...", "source": "audio 14:08"}
      ]
    }
  ]
}

Reglas:
- Detecta el idioma predominante y úsalo en la salida.
- Conserva fórmulas matemáticas en LaTeX cuando aparezcan.
- No inventes contenido que no esté en las fuentes.
- Si las fuentes son inconexas, organízalas como secciones independientes.
- Las etiquetas deben ser sustantivos cortos (1-2 palabras).
"""

def forge_note(sources_text: list[dict]) -> dict:
    client = _get_client()
    parts_text = "\n\n".join(
        f"[FUENTE {i+1} · {s['kind']}]\n{s['text']}"
        for i, s in enumerate(sources_text)
        if s.get("text")
    )
    full_prompt = f"{FORGE_PROMPT}\n\n=== FUENTES ===\n{parts_text}\n\n=== JSON ==="

    response = client.models.generate_content(
        model=current_app.config["GEMINI_MODEL"],
        contents=full_prompt,
        config=types.GenerateContentConfig(
            temperature=0.3,
            response_mime_type="application/json",
        ),
    )
    return json.loads(response.text)