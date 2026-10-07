.PHONY: up down build restart logs shell artisan migrate seed test npm composer

up:
	docker compose --env-file .env.docker up -d --build

down:
	docker compose --env-file .env.docker down

build:
	docker compose --env-file .env.docker build --no-cache

restart:
	docker compose --env-file .env.docker restart

logs:
	docker compose --env-file .env.docker logs -f app

shell:
	docker compose --env-file .env.docker exec app bash

artisan:
	docker compose --env-file .env.docker exec app php artisan $(cmd)

migrate:
	docker compose --env-file .env.docker exec app php artisan migrate --force

seed:
	docker compose --env-file .env.docker exec app php artisan db:seed --force

test:
	docker compose --env-file .env.docker exec app php artisan test --compact

npm:
	docker compose --env-file .env.docker exec app npm $(cmd)

composer:
	docker compose --env-file .env.docker exec app composer $(cmd)
