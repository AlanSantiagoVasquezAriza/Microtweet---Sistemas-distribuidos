# ========================================
# Makefile (opcional, para facilitar comandos)
# ========================================
.PHONY: help setup start stop restart logs test clean

help:
	@echo "Microtweet - Available commands:"
	@echo "  make setup    - Initial setup (create .env, build images)"
	@echo "  make start    - Start all services"
	@echo "  make stop     - Stop all services"
	@echo "  make restart  - Restart all services"
	@echo "  make logs     - View logs (all services)"
	@echo "  make test     - Run API tests"
	@echo "  make clean    - Stop and remove everything"

setup:
	@bash scripts/setup.sh

start:
	@docker-compose up -d
	@echo "✓ Services started"

stop:
	@docker-compose down
	@echo "✓ Services stopped"

restart:
	@docker-compose restart
	@echo "✓ Services restarted"

logs:
	@docker-compose logs -f

test:
	@bash scripts/test-api.sh

clean:
	@bash scripts/cleanup.sh