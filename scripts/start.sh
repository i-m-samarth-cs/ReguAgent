#!/usr/bin/env bash
set -e

echo "=== ReguAgent Startup ==="

# Copy env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "[✓] Created .env from .env.example"
fi

# Pull images
docker-compose pull --quiet

# Start services
echo "[→] Starting services..."
docker-compose up -d --build

echo ""
echo "[✓] ReguAgent is starting up."
echo ""
echo "Services:"
echo "  Frontend  → http://localhost:3000"
echo "  Backend   → http://localhost:8000"
echo "  API Docs  → http://localhost:8000/docs"
echo ""
echo "Demo credentials:"
echo "  compliance@demo.in / demo1234  (Compliance Officer)"
echo "  risk@demo.in       / demo1234  (Risk Manager)"
echo "  legal@demo.in      / demo1234  (Department Lead - Legal)"
echo "  tech@demo.in       / demo1234  (Department Lead - Tech)"
echo ""
echo "Follow logs: docker-compose logs -f backend"
