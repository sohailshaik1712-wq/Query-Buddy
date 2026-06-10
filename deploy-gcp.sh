#!/bin/bash

# ==============================================================================
# QueryBuddy Google Cloud Run Deployment Script (Fixed V3)
# ==============================================================================

# 1. Configuration
PROJECT_ID="query-buddy"
REGION="us-central1"
REPOSITORY="querybuddy-repo"

# Load values from backend/.env if available
if [ -f "backend/.env" ]; then
    echo "📄 Loading secrets from backend/.env..."
    DEEPSEEK_API_KEY=$(grep DEEPSEEK_API_KEY backend/.env | cut -d '=' -f2-)
    DEEPSEEK_API_BASE=$(grep DEEPSEEK_API_BASE backend/.env | cut -d '=' -f2-)
    DATABASE_URL=$(grep DATABASE_URL backend/.env | cut -d '=' -f2-)
    SECRET_KEY=$(grep SECRET_KEY backend/.env | cut -d '=' -f2-)
fi

# 1.5 Validate Secrets
if [ -z "$DATABASE_URL" ] || [ -z "$DEEPSEEK_API_KEY" ] || [ -z "$SECRET_KEY" ]; then
    echo "❌ Error: One or more required environment variables (DATABASE_URL, DEEPSEEK_API_KEY, SECRET_KEY) are empty."
    echo "Please check your backend/.env file."
    exit 1
fi

# Default DEEPSEEK_API_BASE if not provided
if [ -z "$DEEPSEEK_API_BASE" ]; then
    DEEPSEEK_API_BASE="https://api.deepseek.com"
fi

# 2. Setup Project and Enable APIs
echo "⚙️ Setting up GCP Project: $PROJECT_ID..."
gcloud config set project "$PROJECT_ID"

echo "🔧 Enabling required Google Cloud APIs..."
gcloud services enable \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    iam.googleapis.com \
    storage.googleapis.com

# 2.5 Fix Permissions for Service Account
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
SERVICE_ACCOUNT="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

echo "🔐 Granting required permissions to service account: $SERVICE_ACCOUNT..."
for ROLE in "roles/storage.admin" "roles/artifactregistry.admin" "roles/logging.logWriter"; do
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:$SERVICE_ACCOUNT" \
        --role="$ROLE" --quiet > /dev/null
done

# 3. Create Artifact Registry if it doesn't exist
echo "📦 Checking Artifact Registry..."
if ! gcloud artifacts repositories describe "$REPOSITORY" --location="$REGION" &>/dev/null; then
    echo "✨ Creating repository $REPOSITORY in $REGION..."
    gcloud artifacts repositories create "$REPOSITORY" \
        --repository-format=docker \
        --location="$REGION" \
        --description="Docker repository for QueryBuddy"
fi

# 4. Build and Deploy Backend
echo "🚀 Building Backend..."
BACKEND_TAG="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/backend:latest"
gcloud builds submit ./backend --tag "$BACKEND_TAG"

echo "🚢 Deploying Backend to Cloud Run..."
gcloud run deploy querybuddy-backend \
    --image "$BACKEND_TAG" \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars "DATABASE_URL=$DATABASE_URL,DEEPSEEK_API_KEY=$DEEPSEEK_API_KEY,DEEPSEEK_API_BASE=$DEEPSEEK_API_BASE,SECRET_KEY=$SECRET_KEY"

# Get the Backend URL
BACKEND_URL=$(gcloud run services describe querybuddy-backend --region "$REGION" --format 'value(status.url)')
echo "✅ Backend is live at: $BACKEND_URL"

# 5. Build and Deploy Frontend
echo "🚀 Building Frontend..."
FRONTEND_TAG="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/frontend:latest"

# Create a temporary cloudbuild.yaml for the frontend build arg injection
cat <<EOF > frontend_cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: [
      'build',
      '-t', '$FRONTEND_TAG',
      '--build-arg', 'NEXT_PUBLIC_API_URL=$BACKEND_URL/api/v1',
      '.'
    ]
images:
  - '$FRONTEND_TAG'
EOF

gcloud builds submit ./frontend --config frontend_cloudbuild.yaml
rm frontend_cloudbuild.yaml

echo "🚢 Deploying Frontend to Cloud Run..."
gcloud run deploy querybuddy-frontend \
    --image "$FRONTEND_TAG" \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated

# 6. Final Summary
FRONTEND_URL=$(gcloud run services describe querybuddy-frontend --region "$REGION" --format 'value(status.url)')

echo "=============================================================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "------------------------------------------------------------------------------"
echo "🔗 Frontend URL: $FRONTEND_URL"
echo "🔗 Backend API:  $BACKEND_URL/api/v1"
echo "=============================================================================="
