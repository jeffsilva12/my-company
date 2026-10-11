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
    # APP_KEY vazio vindo do Compose sobrescreve o .env — remove do ambiente
    if [ -z "${APP_KEY:-}" ]; then
        unset APP_KEY || true
    fi

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
        log "Composer: vendor já instalado."
        return
    fi

    log "Rodando: composer install --no-interaction --prefer-dist --optimize-autoloader"
    composer install --no-interaction --prefer-dist --optimize-autoloader
}

ensure_npm_install() {
    if [ -f node_modules/.package-lock.json ] || [ -f node_modules/vite/package.json ]; then
        log "npm: node_modules já instalado."
        return
    fi

    log "Rodando: npm install"
    npm install
}

ensure_app_key() {
    # Nunca deixar APP_KEY vazia no ambiente do processo (PHP-FPM herda isso)
    if [ -z "${APP_KEY:-}" ]; then
        unset APP_KEY || true
    fi

    if ! grep -qE '^APP_KEY=base64:.+' .env 2>/dev/null; then
        log "Rodando: php artisan key:generate --force"
        php artisan key:generate --force --no-interaction
    else
        log "APP_KEY já definida no .env."
    fi

    local key
    key="$(grep -E '^APP_KEY=' .env | head -n1 | cut -d= -f2-)"
    if [ -z "${key}" ]; then
        log "Falha: APP_KEY continua vazia após key:generate."
        exit 1
    fi

    export APP_KEY="${key}"
    log "APP_KEY exportada para o processo (PHP-FPM/Nginx)."
}

ensure_permissions() {
    mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache
    chown -R www-data:www-data storage bootstrap/cache || true
    chmod -R ug+rwx storage bootstrap/cache || true
}

ensure_database() {
    log "Rodando: php artisan migrate --force"
    php artisan migrate --force --no-interaction

    if [ "${RUN_SEEDERS:-true}" = "true" ]; then
        log "Rodando: php artisan db:seed --force"
        php artisan db:seed --force --no-interaction
    fi
}

ensure_storage_link() {
    log "Rodando: php artisan storage:link --force"
    php artisan storage:link --force --no-interaction
}

ensure_npm_build() {
    if [ -f public/build/manifest.json ]; then
        log "npm: assets já gerados (public/build/manifest.json)."
        return
    fi

    log "Rodando: npm run build"
    npm run build
}

wait_for_mysql
ensure_env_file
sync_runtime_env
ensure_composer
ensure_npm_install
ensure_app_key
ensure_permissions
ensure_database
ensure_storage_link
ensure_npm_build

log "Aplicação pronta em ${APP_URL:-http://localhost:8080}"
log "Login demo: test@example.com / password"

exec "$@"
