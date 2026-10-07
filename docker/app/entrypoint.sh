#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

echo "[entrypoint] Aguardando MySQL em ${DB_HOST:-mysql}:${DB_PORT:-3306}..."
ATTEMPTS=0
until mysqladmin ping -h"${DB_HOST:-mysql}" -P"${DB_PORT:-3306}" -u"${DB_USERNAME:-mycompany}" -p"${DB_PASSWORD:-secret}" --silent; do
    ATTEMPTS=$((ATTEMPTS + 1))
    if [ "${ATTEMPTS}" -ge 60 ]; then
        echo "[entrypoint] MySQL indisponível após 120s."
        exit 1
    fi
    sleep 2
done
echo "[entrypoint] MySQL disponível."

if [ ! -f .env ]; then
    if [ -f .env.docker ]; then
        echo "[entrypoint] Copiando .env.docker -> .env"
        cp .env.docker .env
    elif [ -f .env.example ]; then
        echo "[entrypoint] Copiando .env.example -> .env"
        cp .env.example .env
    fi
fi

set_env_var() {
    local key="$1"
    local value="$2"
    if grep -qE "^${key}=" .env; then
        sed -i "s|^${key}=.*|${key}=${value}|" .env
    else
        printf '%s=%s\n' "${key}" "${value}" >> .env
    fi
}

set_env_var APP_URL "${APP_URL:-http://localhost:8080}"
set_env_var DB_CONNECTION mysql
set_env_var DB_HOST mysql
set_env_var DB_PORT 3306
set_env_var DB_DATABASE "${DB_DATABASE:-my_company}"
set_env_var DB_USERNAME "${DB_USERNAME:-mycompany}"
set_env_var DB_PASSWORD "${DB_PASSWORD:-secret}"
set_env_var MAIL_MAILER smtp
set_env_var MAIL_HOST mailpit
set_env_var MAIL_PORT 1025

if [ ! -d vendor ]; then
    echo "[entrypoint] Instalando dependências PHP (composer)..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

if [ ! -d node_modules ]; then
    echo "[entrypoint] Instalando dependências Node (npm)..."
    npm install
fi

if ! grep -qE '^APP_KEY=base64:.+' .env 2>/dev/null; then
    echo "[entrypoint] Gerando APP_KEY..."
    php artisan key:generate --force --no-interaction
fi

mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache || true
chmod -R ug+rwx storage bootstrap/cache || true

php artisan migrate --force --no-interaction

if [ "${RUN_SEEDERS:-true}" = "true" ]; then
    php artisan db:seed --force --no-interaction || true
fi

php artisan storage:link --force --no-interaction || true

if [ ! -f public/build/manifest.json ]; then
    echo "[entrypoint] Gerando assets frontend (npm run build)..."
    npm run build
fi

echo "[entrypoint] Aplicação pronta em http://localhost:${APP_PORT:-8080}"

exec "$@"
