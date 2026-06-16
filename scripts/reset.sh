#!/usr/bin/env bash
set -e

echo "[!] This will delete all data and reseed. Press Ctrl+C to cancel."
sleep 3

docker-compose down -v
docker-compose up -d --build
echo "[✓] Reset complete. Fresh seed data will be loaded on startup."
