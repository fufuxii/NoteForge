# Servicio de Gemini (vía Vertex AI): fusiona las fuentes en un apunte estructurado en JSON.
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
        # Configura el SDK para usar Vertex AI con el proyecto/región de GCP.
        os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"
        _client = genai.Client()
    return _client

# Prompt de sistema: define el rol, el JSON de salida y las reglas de la forja.
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

# Construye el prompt con las fuentes (+contexto) y devuelve el JSON parseado.
def forge_note(sources_text: list[dict], context: dict = None) -> dict:
    client = _get_client()
    # Concatena cada fuente etiquetada con su origen.
    parts_text = "\n\n".join(
        f"[FUENTE {i+1} · {s['kind']}]\n{s['text']}"
        for i, s in enumerate(sources_text)
        if s.get("text")
    )

    context_block = ""
    # Añade contexto académico (universidad, carrera, asignatura) si se conoce.
    if context:
      parts = []
      if context.get("universidad"):
          parts.append(f"Universidad: {context['universidad']}")
      if context.get("estudios"):
          parts.append(f"Carrera: {context['estudios']}")
      if context.get("asignatura"):
          parts.append(f"Asignatura: {context['asignatura']}")
      if parts:
          context_block = "=== CONTEXTO DEL ESTUDIANTE ===\n" + "\n".join(parts) + "\n\n"
    
    full_prompt = f"{FORGE_PROMPT}\n\n{context_block}=== FUENTES ===\n{parts_text}\n\n=== JSON ==="

    # Log del prompt para depuración.
    print("\n====== PROMPT ENVIADO A GEMINI ======")
    print(full_prompt)
    print("=====================================\n")

    # Temperatura baja y salida forzada a JSON para una estructura estable.
    response = client.models.generate_content(
        model=current_app.config["GEMINI_MODEL"],
        contents=full_prompt,
        config=types.GenerateContentConfig(
            temperature=0.3,
            response_mime_type="application/json",
        ),
    )
    return json.loads(response.text)