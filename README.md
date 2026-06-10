# NoteForge

Plataforma web que forja apunts estructurats a partir d'imatges, àudios i text, fent servir IA. Aquests apunts es poden llegir, escoltar (TTS), traduir, exportar (PDF/DOCX/TXT) i compartir per assignatura amb altres estudiants.

UAB · Sistemes Multimèdia 2025/2026 — Pablo Gil Gómez, Fiorella Queirolo,Meritxell Argente, Alba Rodríguez.

## Arquitectura

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 19 + Vite + Tailwind v4 + Firebase Auth (Google) → Firebase Hosting |
| Backend  | Flask 3 + Gunicorn, patró *app factory* + blueprints (rutes → serveis → repositoris) → Cloud Run |
| Persistència | Firestore (col·leccions `apuntes`, `users`, `universidades`) + Cloud Storage |
| IA (núvol) | Cloud Vision (OCR), Speech-to-Text, Text-to-Speech, Translation, Gemini 2.5 Flash (via Vertex AI) |
> Nota: el projecte no fa servir Google Cloud Functions. El codi del núvol és el
> servei de backend a Cloud Run (contenidor serverless) més les crides a les APIs
> gestionades d'IA. Tens el detall a `FUNCIONS_CLOUD.txt`.

## Estructura

```
NoteForge/
├── backend/            # API Flask + pipeline d'IA (Cloud Run)
│   ├── app/
│   │   ├── routes/         # endpoints HTTP (blueprints)
│   │   ├── services/       # crides a les APIs de Google Cloud + exportació
│   │   ├── repositories/   # accés a Firestore
│   │   └── auth/           # verificació del token de Firebase
│   ├── main.py             # punt d'entrada local
│   ├── Dockerfile          # imatge per a Cloud Run
│   └── requirements.txt
├── frontend/           # SPA React (Firebase Hosting)
│   ├── src/
│   ├── firebase.json   # config del hosting (SPA rewrite a index.html)
│   └── .env.production # VITE_API_URL → URL del backend a Cloud Run
└── infra/
    └── deploy-backend.sh   # desplegament del backend a Cloud Run
```

## Requisits

- Python 3.11
- Node.js 20+ i npm
- (Per desplegar) gcloud CLI i Firebase CLI, amb accés al projecte GCP `noteforge-sm2026`

## Configuració de Google Cloud

1. APIs que han d'estar activades al projecte: Cloud Vision, Speech-to-Text,
   Text-to-Speech, Cloud Translation, Vertex AI, Firestore, Cloud Storage,
   Identity Toolkit (Firebase Auth).
2. Compte de servei amb permisos: `storage.objectAdmin`, `datastore.user`,
   `aiplatform.user`, `speech.client`, `cloudtranslate.user`,
   `serviceusage.serviceUsageConsumer`.
3. Credencials en local: descarrega el JSON del compte de servei i apunta-hi
   `GOOGLE_APPLICATION_CREDENTIALS` (o fes servir `gcloud auth application-default login`).
   A Cloud Run no cal JSON: el servei agafa el seu propi compte de servei.

# Executar en local

### 1) Backend (port 8080)

```bash
cd backend
python -m venv .venv
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# macOS / Linux:
# source .venv/bin/activate

pip install -r requirements.txt

# variables d'entorn: copia l'exemple i edita'l
copy .env.example .env            # Windows
# cp .env.example .env            # macOS / Linux

python main.py
# → http://localhost:8080  (GET / respon el healthcheck)
```

Amb `DEV_MOCK_AUTH=1` (per defecte a l'exemple) no cal login de Firebase per provar
l'API. Les funcions d'IA, però, sí que necessiten credencials de GCP vàlides.

### 2) Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

En desenvolupament, Vite fa de *proxy*: les crides a `/api` van a `http://localhost:8080`
(mira `vite.config.js`). Així el frontend i el backend parlen entre ells en local.

## Desplegament

### Backend → Cloud Run

```bash
# des de l'arrel del projecte
bash infra/deploy-backend.sh
# (usa gcloud run deploy amb --source backend; build automàtic des del Dockerfile)
```

Retorna la URL pública del servei (p. ex. `https://noteforge-api-…run.app`).

### Frontend → Firebase Hosting

```bash
cd frontend
# .env.production ja apunta VITE_API_URL a la URL del backend de Cloud Run
npm run build          # genera dist/
firebase deploy        # publica dist/ a Firebase Hosting
# → https://noteforge-sm2026.web.app
```

## Notes

El `requirements.txt` original venia codificat en **UTF-16**, cosa que pot fer "petar" el `pip install` en alguns entorns. En aquest paquet ja està convertit a **UTF-8**.