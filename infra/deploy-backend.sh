#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-noteforge-sm2026}"
REGION="${GCP_REGION:-europe-west1}"
SERVICE="${SERVICE:-noteforge-api}"

gcloud run deploy "$SERVICE" \
  --source backend \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --allow-unauthenticated \
  --no-cpu-throttling \
  --cpu=2 \
  --memory=1Gi \
  --min-instances=1 \
  --max-instances=4 \
  --timeout=3600 \
  --concurrency=20 \
  --set-env-vars="GCP_PROJECT_ID=${PROJECT_ID},GCP_REGION=global,MAX_FORGE_SECONDS=1800"