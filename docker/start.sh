#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

if ! command -v docker >/dev/null 2>&1; then
    echo "Docker não encontrado. Instale o Docker Desktop e tente de novo."
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "Docker não está em execução. Abra o Docker Desktop e tente de novo."
    exit 1
fi

if [ ! -f .env.docker ]; then
    if [ -f .env.docker.example ]; then
        cp .env.docker.example .env.docker
        echo "Criado .env.docker a partir de .env.docker.example"
    else
        echo "Arquivo .env.docker.example não encontrado."
        exit 1
    fi
fi

# Compose usa este arquivo para variáveis de porta / build
cp -f .env.docker .env.compose

APP_PORT="$(grep -E '^APP_PORT=' .env.docker | cut -d= -f2- || true)"
APP_PORT="${APP_PORT:-8080}"

echo "Subindo My Company (build + migrate + seed + assets)..."
docker compose --env-file .env.compose up -d --build

echo
echo "Aguardando a aplicação responder em http://localhost:${APP_PORT}/up ..."
ATTEMPTS=0
until curl -fsS "http://127.0.0.1:${APP_PORT}/up" >/dev/null 2>&1; do
    ATTEMPTS=$((ATTEMPTS + 1))
    if [ "${ATTEMPTS}" -ge 90 ]; then
        echo
        echo "Timeout aguardando a aplicação. Veja os logs:"
        echo "  docker compose --env-file .env.compose logs -f app"
        exit 1
    fi
    sleep 2
done

echo
echo "Aplicação pronta:"
echo "  App:     http://localhost:${APP_PORT}"
echo "  Mailpit: http://localhost:8025"
echo "  Login:   test@example.com / password"
echo
echo "Logs: docker compose --env-file .env.compose logs -f app"
