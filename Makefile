.PHONY: up down build restart logs shell artisan migrate seed test npm composer reset

COMPOSE = docker compose --env-file .env.compose

ensure-env:
	@if [ ! -f .env.docker ]; then cp .env.docker.example .env.docker; fi
	@cp -f .env.docker .env.compose

up: ensure-env
	@bash docker/start.sh

down: ensure-env
	$(COMPOSE) down

reset: ensure-env
	$(COMPOSE) down -v
	@bash docker/start.sh

build: ensure-env
	$(COMPOSE) build --no-cache

restart: ensure-env
	$(COMPOSE) restart

logs: ensure-env
	$(COMPOSE) logs -f app

shell: ensure-env
	$(COMPOSE) exec app bash

artisan: ensure-env
	$(COMPOSE) exec app php artisan $(cmd)

migrate: ensure-env
	$(COMPOSE) exec app php artisan migrate --force

seed: ensure-env
	$(COMPOSE) exec app php artisan db:seed --force

test: ensure-env
	$(COMPOSE) exec app php artisan test --compact

npm: ensure-env
	$(COMPOSE) exec app npm $(cmd)

composer: ensure-env
	$(COMPOSE) exec app composer $(cmd)
