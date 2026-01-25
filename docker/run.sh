#!/bin/bash
set -euo pipefail

# Environment selection
MODE="dev"
if [ $# -gt 0 ]; then
    if [ "$1" == "prod" ]; then
        MODE="prod"
        shift
    elif [ "$1" == "dev" ]; then
        MODE="dev"
        shift
    fi
fi

if [ "$MODE" == "prod" ]; then
    COMPOSE_FILES="-f compose.yaml -f compose.prod.yaml"
    ENV_FILE="prod.env"
    BASE_URL="https://bde-grimm.com"
else
    COMPOSE_FILES="-f compose.yaml -f compose.dev.yaml"
    ENV_FILE="dev.env"
    BASE_URL="http://localhost"
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default Values
DEFAULT_FORGE_ID_CLIENT_ID="125070"
DEFAULT_FORGE_ID_CLIENT_SECRET="f6ff8d394e6185d41834b19210979b897852680cf34700ae4ecb24ea"
DEFAULT_WEBSITE_DISCORD_CLIENT_ID=""
DEFAULT_WEBSITE_DISCORD_CLIENT_SECRET=""
DEFAULT_GOOGLE_CLIENT_ID=""
DEFAULT_GOOGLE_CLIENT_SECRET=""
DEFAULT_GOOGLE_SERVICE_ACCOUNT_EMAIL=""
DEFAULT_GOOGLE_PRIVATE_KEY=""
DEFAULT_DISCORD_ROLE_SYNC_WEBHOOK_URL=""
DEFAULT_S3_ACCESS_KEY_ID=""
DEFAULT_S3_SECRET_ACCESS_KEY=""
DEFAULT_DISCORD_TOKEN=""
DEFAULT_DISCORD_CLIENT_ID=""
DEFAULT_DISCORD_API_KEY=""

# Helper Functions
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

prompt() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

check_cmd() {
    if ! command -v "$1" &>/dev/null; then
        error "$1 could not be found. Please install it."
    fi
}

generate_secret_hex() {
    openssl rand -hex 32
}

generate_secret_base64() {
    openssl rand -base64 32
}

read_input() {
    local var_name="$1"
    local prompt_text="$2"
    local default_value="$3"

    # Print the prompt with the default value displayed
    echo -ne "${BLUE}[SETUP]${NC} $prompt_text [default: ${default_value:0:20}...]: " >&2
    read -r user_input

    # Use default if input is empty
    if [ -z "$user_input" ]; then
        echo "$default_value"
    else
        echo "$user_input"
    fi
}

create_env_file() {
    log "Generating $ENV_FILE..."
    prompt "Please configure the following environment variables (press Enter to use defaults):"

    FORGE_ID_CLIENT_ID=$(read_input "FORGE_ID_CLIENT_ID" "Forge ID Client ID" "$DEFAULT_FORGE_ID_CLIENT_ID")
    FORGE_ID_CLIENT_SECRET=$(read_input "FORGE_ID_CLIENT_SECRET" "Forge ID Client Secret" "$DEFAULT_FORGE_ID_CLIENT_SECRET")
    WEBSITE_DISCORD_CLIENT_ID=$(read_input "WEBSITE_DISCORD_CLIENT_ID" "Discord Client ID (website)" "$DEFAULT_WEBSITE_DISCORD_CLIENT_ID")
    WEBSITE_DISCORD_CLIENT_SECRET=$(read_input "WEBSITE_DISCORD_CLIENT_SECRET" "Discord Client Secret (website)" "$DEFAULT_WEBSITE_DISCORD_CLIENT_SECRET")
    GOOGLE_CLIENT_ID=$(read_input "GOOGLE_CLIENT_ID" "Google Client ID" "$DEFAULT_GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET=$(read_input "GOOGLE_CLIENT_SECRET" "Google Client Secret" "$DEFAULT_GOOGLE_CLIENT_SECRET")
    GOOGLE_SERVICE_ACCOUNT_EMAIL=$(read_input "GOOGLE_SERVICE_ACCOUNT_EMAIL" "Google Service Account Email" "$DEFAULT_GOOGLE_SERVICE_ACCOUNT_EMAIL")
    GOOGLE_PRIVATE_KEY=$(read_input "GOOGLE_PRIVATE_KEY" "Google Private Key" "$DEFAULT_GOOGLE_PRIVATE_KEY")
    DISCORD_ROLE_SYNC_WEBHOOK_URL=$(read_input "DISCORD_ROLE_SYNC_WEBHOOK_URL" "Discord Role Sync Webhook URL" "$DEFAULT_DISCORD_ROLE_SYNC_WEBHOOK_URL")
    S3_ACCESS_KEY_ID=$(read_input "S3_ACCESS_KEY_ID" "S3 Access Key ID" "$DEFAULT_S3_ACCESS_KEY_ID")
    S3_SECRET_ACCESS_KEY=$(read_input "S3_SECRET_ACCESS_KEY" "S3 Secret Access Key" "$DEFAULT_S3_SECRET_ACCESS_KEY")
    DISCORD_TOKEN=$(read_input "DISCORD_TOKEN" "Discord Token" "$DEFAULT_DISCORD_TOKEN")
    DISCORD_CLIENT_ID=$(read_input "DISCORD_CLIENT_ID" "Discord Client ID" "$DEFAULT_DISCORD_CLIENT_ID")
    DISCORD_API_KEY=$(read_input "DISCORD_API_KEY" "Discord API Key" "$DEFAULT_DISCORD_API_KEY")

    cat >"$ENV_FILE" <<EOF
DB_PASSWORD="$(generate_secret_hex)"
GARAGE_RPC_SECRET="$(generate_secret_hex)"
BETTER_AUTH_SECRET="$(generate_secret_base64)"
FORGE_ID_CLIENT_ID="$FORGE_ID_CLIENT_ID"
FORGE_ID_CLIENT_SECRET="$FORGE_ID_CLIENT_SECRET"
WEBSITE_DISCORD_CLIENT_ID="$WEBSITE_DISCORD_CLIENT_ID"
WEBSITE_DISCORD_CLIENT_SECRET="$WEBSITE_DISCORD_CLIENT_SECRET"
GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"
GOOGLE_SERVICE_ACCOUNT_EMAIL="$GOOGLE_SERVICE_ACCOUNT_EMAIL"
GOOGLE_PRIVATE_KEY="$GOOGLE_PRIVATE_KEY"
DISCORD_ROLE_SYNC_WEBHOOK_URL="$DISCORD_ROLE_SYNC_WEBHOOK_URL"
S3_ACCESS_KEY_ID="$S3_ACCESS_KEY_ID"
S3_SECRET_ACCESS_KEY="$S3_SECRET_ACCESS_KEY"
DISCORD_TOKEN="$DISCORD_TOKEN"
DISCORD_CLIENT_ID="$DISCORD_CLIENT_ID"
DISCORD_API_KEY="$DISCORD_API_KEY"
BASE_URL="$BASE_URL"
EOF
    log "$ENV_FILE created successfully."
}

apply_migrations() {
    DB_PASSWORD="$1"
    cd "../$2"
    bun install -D drizzle-kit
    bunx drizzle-kit generate
    DB_PASSWORD="$DB_PASSWORD" bunx drizzle-kit migrate
    cd ../docker
}

apply_all_migrations() {
    log "Applying database migrations..."
    DB_PASSWORD=$(grep '^DB_PASSWORD=' ../docker/"$ENV_FILE" | cut -d '=' -f2- | tr -d '"')
    docker compose --env-file "$ENV_FILE" $COMPOSE_FILES up --build -d --wait db
    if ! docker compose --env-file "$ENV_FILE" $COMPOSE_FILES exec db psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='discord'" | grep -q 1; then
        docker compose --env-file "$ENV_FILE" $COMPOSE_FILES exec db psql -U postgres -c "CREATE DATABASE discord;"
    fi
    apply_migrations $DB_PASSWORD website
    apply_migrations $DB_PASSWORD discord-bot
}

# Main Execution

# Check dependencies
check_cmd "openssl"
check_cmd "docker"

# Check if env file exists
if [ ! -f "$ENV_FILE" ]; then
    create_env_file
else
    log "$ENV_FILE already exists, skipping generation."
fi

# Ensure BASE_URL is in the env file and up to date
if grep -q "^BASE_URL=" "$ENV_FILE"; then
    sed -i "s|^BASE_URL=.*|BASE_URL=\"$BASE_URL\"|" "$ENV_FILE"
else
    echo "BASE_URL=\"$BASE_URL\"" >> "$ENV_FILE"
fi

# apply database migrations
apply_all_migrations

# Run Docker Compose
log "Starting services with Docker Compose ($MODE mode)..."
if [ "$MODE" == "dev" ]; then
    docker compose --env-file "$ENV_FILE" $COMPOSE_FILES up --build --watch "$@"
else
    docker compose --env-file "$ENV_FILE" $COMPOSE_FILES up --build "$@"
fi
