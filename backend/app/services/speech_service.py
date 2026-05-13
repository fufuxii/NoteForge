from google.cloud import speech

_client = None

def _get_client():
    global _client
    if _client is None:
        _client = speech.SpeechClient()
    return _client

def transcribe_bytes(audio_bytes: bytes, mime_type: str, language: str = "es-ES") -> str:
    if "webm" in mime_type or "opus" in mime_type:
        encoding = speech.RecognitionConfig.AudioEncoding.WEBM_OPUS
        sample_rate = 48000
    elif "mp3" in mime_type or "mpeg" in mime_type:
        encoding = speech.RecognitionConfig.AudioEncoding.MP3
        sample_rate = None
    elif "wav" in mime_type:
        encoding = speech.RecognitionConfig.AudioEncoding.LINEAR16
        sample_rate = 16000
    else:
        encoding = speech.RecognitionConfig.AudioEncoding.ENCODING_UNSPECIFIED
        sample_rate = None

    config_kwargs = {
        "encoding": encoding,
        "language_code": language,
        "enable_automatic_punctuation": True,
        "model": "latest_long",
        "alternative_language_codes": ["ca-ES", "en-US"],
    }
    if sample_rate:
        config_kwargs["sample_rate_hertz"] = sample_rate

    config = speech.RecognitionConfig(**config_kwargs)
    audio = speech.RecognitionAudio(content=audio_bytes)

    response = _get_client().recognize(config=config, audio=audio)
    return " ".join(r.alternatives[0].transcript for r in response.results if r.alternatives)