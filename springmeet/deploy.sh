#!/bin/bash
# ═══════════════════════════════════════════════
# SpringMeet Quick Deploy Script
# Run on your Ubuntu VPS: bash deploy.sh
# ═══════════════════════════════════════════════

set -e
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo -e "${GREEN}🌸 SpringMeet Deploy Script${NC}"
echo "=============================="

# Check .env exists
if [ ! -f .env ]; then
  echo -e "${RED}❌ .env file not found! Copy .env.example to .env and fill in values.${NC}"
  exit 1
fi

source .env

# Check required vars
required=("POSTGRES_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET" "JWT_REFRESH_SECRET" "SMTP_PASS")
for var in "${required[@]}"; do
  if [ -z "${!var}" ] || [[ "${!var}" == *"CHANGE"* ]] || [[ "${!var}" == *"GENERATE"* ]]; then
    echo -e "${RED}❌ $var is not set properly in .env${NC}"
    exit 1
  fi
done

echo -e "${GREEN}✅ Environment validated${NC}"

# Install Docker if not present
if ! command -v docker &> /dev/null; then
  echo -e "${YELLOW}📦 Installing Docker...${NC}"
  curl -fsSL https://get.docker.com | sh
  usermod -aG docker $USER
fi

# Pull latest images
echo -e "${YELLOW}📥 Pulling Docker images...${NC}"
docker compose pull postgres redis nginx

# Build app images
echo -e "${YELLOW}🔨 Building application...${NC}"
docker compose build --no-cache backend frontend

# Start database + redis first
echo -e "${YELLOW}🗄️  Starting databases...${NC}"
docker compose up -d postgres redis
echo "Waiting for databases to be healthy..."
sleep 15

# Run migrations + seed
echo -e "${YELLOW}🌱 Running migrations and seed...${NC}"
docker compose run --rm backend sh -c "npx prisma migrate deploy && npm run db:seed"

# Start all services
echo -e "${YELLOW}🚀 Starting all services...${NC}"
docker compose up -d

# Wait and check health
sleep 10
if curl -sf http://localhost:4000/api/health > /dev/null; then
  echo -e "${GREEN}✅ API is healthy!${NC}"
else
  echo -e "${RED}⚠️  API health check failed. Check: docker compose logs backend${NC}"
fi

echo ""
echo -e "${GREEN}🌸 SpringMeet is deploying!${NC}"
echo "=============================="
echo "Frontend:  http://localhost (or https://yourdomain.com)"
echo "API:       http://localhost:4000/api/health"
echo "Admin:     https://yourdomain.com/admin"
echo ""
echo "Admin login: aittezazahmad@gmail.com / Admin@12345!"
echo -e "${RED}⚠️  Change the admin password immediately after first login!${NC}"
echo ""
echo "Monitor: docker compose logs -f"
echo "Stop:    docker compose down"
