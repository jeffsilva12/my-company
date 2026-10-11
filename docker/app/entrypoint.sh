#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

log() {
    echo "[entrypoint] $*"
}

wait_for_mysql() {
    local host="${DB_HOST:-mysql}"
    local port="${DB_PORT:-3306}"
    local user="${DB_USERNAME:-mycompany}"
    local pass="${DB_PASSWORD:-secret}"
    local attempts=0

    log "Aguardando MySQL em ${host}:${port}..."
    until mysqladmin ping -h"${host}" -P"${port}" -u"${user}" -p"${pass}" --silent; do
        attempts=$((attempts + 1))
        if [ "${attempts}" -ge 60 ]; then
            log "MySQL indisponível após 120s."
            exit 1
        fi
        sleep 2
    done
    log "MySQL disponível."
}

ensure_env_file() {
    if [ -f .env ]; then
        return
    fi

    if [ -f .env.docker ]; then
        log "Copiando .env.docker -> .env"
        cp .env.docker .env
    elif [ -f .env.example ]; then
        log "Copiando .env.example -> .env"
        cp .env.example .env
    else
        log "Nenhum arquivo .env encontrado."
        exit 1
    fi
}

set_env_var() {
    local key="$1"
    local value="$2"

    if grep -qE "^${key}=" .env; then
        sed -i "s|^${key}=.*|${key}=${value}|" .env
    else
        printf '%s=%s\n' "${key}" "${value}" >> .env
    fi
}

sync_runtime_env() {
    set_env_var APP_URL "${APP_URL:-http://localhost:8080}"
    set_env_var APP_ENV "${APP_ENV:-local}"
    set_env_var APP_DEBUG "${APP_DEBUG:-true}"
    set_env_var DB_CONNECTION mysql
    set_env_var DB_HOST mysql
    set_env_var DB_PORT 3306
    set_env_var DB_DATABASE "${DB_DATABASE:-my_company}"
    set_env_var DB_USERNAME "${DB_USERNAME:-mycompany}"
    set_env_var DB_PASSWORD "${DB_PASSWORD:-secret}"
    set_env_var MAIL_MAILER smtp
    set_env_var MAIL_HOST mailpit
    set_env_var MAIL_PORT 1025
    set_env_var QUEUE_CONNECTION "${QUEUE_CONNECTION:-database}"
    set_env_var CACHE_STORE "${CACHE_STORE:-database}"
    set_env_var SESSION_DRIVER "${SESSION_DRIVER:-database}"
}

ensure_composer() {
    if [ -f vendor/autoload.php ]; then
        return
    fi

    log "Instalando dependências PHP (composer)..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
}

ensure_npm() {
    if [ -f node_modules/.package-lock.json ] || [ -f node_modules/vite/package.json ]; then
        return
    fi

    log "Instalando dependências Node (npm)..."
    npm install
}

ensure_app_key() {
    if grep -qE '^APP_KEY=base64:.+' .env 2>/dev/null; then
        return
    fi

    log "Gerando APP_KEY..."
    php artisan key:generate --force --no-interaction
}

ensure_permissions() {
    mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache
    chown -R www-data:www-data storage bootstrap/cache || true
    chmod -R ug+rwx storage bootstrap/cache || true
}

ensure_database() {
    log "Executando migrations..."
    php artisan migrate --force --no-interaction

    if [ "${RUN_SEEDERS:-true}" = "true" ]; then
        log "Executando seeders..."
        php artisan db:seed --force --no-interaction
    fi

    php artisan storage:link --force --no-interaction || true
}

ensure_frontend_build() {
    if [ -f public/build/manifest.json ]; then
        return
    fi

    log "Gerando assets frontend (npm run build)..."
    npm run build
}

wait_for_mysql
ensure_env_file
sync_runtime_env
ensure_composer
ensure_npm
ensure_app_key
ensure_permissions
ensure_database
ensure_frontend_build

log "Aplicação pronta em ${APP_URL:-http://localhost:8080}"
log "Login demo: test@example.com / password"

exec "$@"
