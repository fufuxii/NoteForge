# Servicio de Text-to-Speech: convierte el apunte en audio narrado.
from google.cloud import texttospeech

_client = None

# Voz neuronal por idioma soportado.
VOICES = {
    "es": ("es-ES", "es-ES-Neural2-A"),
    "ca": ("ca-ES", "ca-ES-Standard-A"),
    "en": ("en-US", "en-US-Neural2-F"),
}

def _get_client():
    global _client
    if _client is None:
        _client = texttospeech.TextToSpeechClient()
    return _client

# Genera el MP3 a partir del texto (con límite de caracteres por petición).
def synthesize(text: str, lang: str = "es") -> bytes:
    language_code, voice_name = VOICES.get(lang, VOICES["es"])
    synthesis_input = texttospeech.SynthesisInput(text=text[:4500])
    voice = texttospeech.VoiceSelectionParams(
        language_code=language_code,
        name=voice_name,
    )
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
        speaking_rate=1.0,
    )
    response = _get_client().synthesize_speech(
        input=synthesis_input,
        voice=voice,
        audio_config=audio_config,
    )
    return response.audio_content

# Aplana título, resumen y secciones en un texto lineal para narrar.
def build_narration(apunte: dict) -> str:
    parts = [apunte.get("title", ""), "."]
    if apunte.get("summary"):
        parts.append(apunte["summary"])
    structure = apunte.get("structure") or {}
    for sec in structure.get("sections", []):
        parts.append(f". Sección: {sec.get('heading', '')}.")
        for b in sec.get("blocks", []):
            if b.get("type") == "paragraph":
                parts.append(b.get("text", ""))
            elif b.get("type") == "bullet_list":
                parts.append(". ".join(b.get("items", [])))
    return " ".join(parts)