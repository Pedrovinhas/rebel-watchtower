.PHONY: up down build rebuild test test-frontend shell-api shell-frontend install install-local migrate seed logs setup

DC       = docker compose -f docker-compose.yml -f docker-compose.dev.yml
DC_PROD  = docker compose -f docker-compose.yml

setup:
	cp -n api/.env.example api/.env
	cp -n frontend/.env.example frontend/.env
	$(MAKE) install-local

up:
	$(DC) up

down:
	$(DC) down

logs:
	$(DC) logs -f

build:
	$(DC_PROD) build

rebuild:
	$(DC) down -v
	$(DC) build --no-cache

install:
	$(DC) build api frontend

install-local:
	docker run --rm -v "$(CURDIR)/api:/app" -w /app node:24-alpine sh -c "npm install"
	docker run --rm -v "$(CURDIR)/frontend:/app" -w /app node:24-alpine sh -c "npm install"

test:
	$(DC) run --rm --build api npm test

test-frontend:
	$(DC) run --rm --build frontend npm test

shell-api:
	$(DC) run --rm api sh

shell-frontend:
	$(DC) run --rm frontend sh

migrate:
	docker compose exec postgres psql -U rebel -d holocron \
		-f /docker-entrypoint-initdb.d/001_create_entities.sql
	docker compose exec postgres psql -U rebel -d holocron \
		-f /docker-entrypoint-initdb.d/002_create_events.sql

seed:
	docker compose exec postgres psql -U rebel -d holocron \
		-f /docker-entrypoint-initdb.d/003_seed.sql
