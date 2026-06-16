#!/usr/bin/env bash
set -e

echo "[→] Running seed data script..."
docker-compose exec backend python -m app.seed_data
echo "[✓] Seed complete."
