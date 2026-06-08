# 🌸 SpringMeet Deployment Guide

> **Make spring all over the world.**

This guide will help you deploy SpringMeet to a live server. The entire stack is containerized with Docker, making deployment straightforward.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Domain name (e.g., `yourdomain.com`)
- [ ] VPS with Ubuntu 20.04+ or similar Linux
- [ ] SSH access to your server
- [ ] Email address for Let's Encrypt SSL certificates
- [ ] (Optional) Gmail App Password for email notifications
- [ ] (Optional) Stripe keys for premium features
- [ ] Git repository with project pushed

---

## 🚀 Quick Start (5 Steps)

### Step 1: Prepare Your Server

SSH into your server and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### Step 2: Clone Project

```bash
# Navigate to deployment directory
cd /opt

# Clone your repository
git clone https://github.com/YOUR_USERNAME/springmeet.git
cd springmeet
```

### Step 3: Configure Environment

```bash
# Copy and edit the environment file
cp .env.example .env
nano .env
```

**Fill in all values:**

```env
# ── Database ──
POSTGRES_USER=springmeet_user
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD_HERE  # Generate: openssl rand -hex 16
POSTGRES_DB=springmeet_db

# ── Redis ──
REDIS_PASSWORD=YOUR_STRONG_REDIS_PASSWORD    # Generate: openssl rand -hex 16

# ── JWT (Generate: openssl rand -hex 64) ──
JWT_SECRET=YOUR_GENERATED_64_CHAR_HEX
JWT_REFRESH_SECRET=YOUR_GENERATED_64_CHAR_HEX

# ── Email (Gmail App Password) ──
# 1. Go to https://myaccount.google.com/apppasswords
# 2. Select Mail → Other (custom) → SpringMeet
# 3. Copy the 16-character password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=YOUR_APP_PASSWORD_HERE

# ── Domain URLs ──
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Generate strong passwords:**

```bash
# Generate random hex strings
openssl rand -hex 16  # For DB/Redis passwords
openssl rand -hex 64  # For JWT secrets
```

### Step 4: Configure DNS

Update your domain's DNS records to point to your server IP:

```
A  yourdomain.com      → YOUR_SERVER_IP
A  api.yourdomain.com  → YOUR_SERVER_IP
CNAME  www.yourdomain.com → yourdomain.com
```

Update the nginx configuration:

```bash
# Replace yourdomain.com everywhere
sed -i 's/yourdomain.com/YOUR_ACTUAL_DOMAIN.com/g' nginx/nginx.conf
```

### Step 5: Deploy

Run the deployment script:

```bash
bash deploy.sh
```

This will:
- Validate your `.env` file
- Install Docker if needed
- Build backend and frontend images
- Start PostgreSQL and Redis
- Run database migrations
- Seed sample data
- Start all services

**Wait 2-3 minutes** for everything to start and stabilize.

---

## ✅ Verify Deployment

### Check Services Running

```bash
docker compose ps

# Should show all containers running:
# springmeet_postgres  ✓
# springmeet_redis     ✓
# springmeet_api       ✓
# springmeet_frontend  ✓
# springmeet_nginx     ✓
# springmeet_certbot   ✓
```

### Test API Health

```bash
# Health check endpoint
curl https://api.yourdomain.com/api/health

# Expected response:
# {"status":"ok","timestamp":"...","service":"SpringMeet API 🌸"}
```

### View Logs

```bash
# Backend logs
docker compose logs -f backend

# Frontend logs
docker compose logs -f frontend

# Nginx logs
docker compose logs -f nginx
```

### Access the Application

- **Frontend**: https://yourdomain.com
- **API Docs**: https://api.yourdomain.com/api/health
- **Admin Login**: Use email/password created during seed

---

## 🔐 First Time Setup

### Default Admin Account

After deployment, seed database includes:

```
Email:    aittezazahmad@gmail.com
Password: Admin@12345!
Role:     ADMIN
```

**⚠️ IMPORTANT**: Change admin password immediately on first login!

### Test Users

The seed also creates test accounts:

```
luna@test.com / Test@12345!
kai@test.com / Test@12345!
alex@test.com / Test@12345!
```

These are for testing only. Delete in production.

---

## 📊 Database Management

### Access Prisma Studio (local only)

```bash
# Connect to backend container
docker compose exec backend npx prisma studio

# Accessible at: http://localhost:5555
```

### Backup Database

```bash
# Create backup
docker compose exec postgres pg_dump -U springmeet_user springmeet_db > backup.sql

# Restore from backup
docker compose exec -T postgres psql -U springmeet_user springmeet_db < backup.sql
```

### Run Migrations

When you update `prisma/schema.prisma`:

```bash
# Inside the backend container
docker compose exec backend npx prisma migrate deploy

# Or restart backend service
docker compose up -d --no-deps --build backend
```

---

## 🔄 Updates & Maintenance

### Pull Latest Code

```bash
git pull origin main
```

### Rebuild Services

```bash
# Rebuild and restart
docker compose up -d --build

# Or rebuild specific service
docker compose up -d --no-deps --build backend
```

### Monitor Resources

```bash
# Check container resource usage
docker stats

# Check disk space
df -h

# Check logs for errors
docker compose logs --tail=50 backend
```

### Restart Service

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart backend
```

### Stop Services

```bash
# Stop all services (keep data)
docker compose stop

# Start again
docker compose start

# Remove containers (keep volumes)
docker compose down

# Remove everything including volumes (⚠️ deletes data!)
docker compose down -v
```

---

## 🚨 Troubleshooting

### Backend won't start

```bash
# Check logs
docker compose logs backend

# Common issues:
# 1. Database not ready - wait 30 seconds
# 2. Redis not accessible - check REDIS_PASSWORD
# 3. JWT_SECRET not set - verify .env file
```

### Frontend shows blank page

```bash
# Check logs
docker compose logs frontend

# Verify environment variables:
docker compose exec frontend env | grep NEXT_PUBLIC
```

### SSL certificate not working

```bash
# Check certbot logs
docker compose logs certbot

# Manual cert renewal
docker compose run certbot renew

# Check certificate expiry
openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/cert.pem
```

### Database migrations failed

```bash
# Check migration status
docker compose exec backend npx prisma migrate status

# Reset database (⚠️ loses data!)
docker compose exec backend npx prisma migrate reset --force

# View logs
docker compose logs backend
```

### Port already in use

```bash
# Find process using port
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :5432

# Kill process
sudo kill -9 <PID>
```

---

## 📈 Performance Tuning

### Enable Caching

Redis is already configured. To optimize:

```bash
# Check Redis memory usage
docker compose exec redis redis-cli INFO memory

# Flush old cache if needed
docker compose exec redis redis-cli FLUSHDB
```

### Database Connection Pooling

PostgreSQL connection pool is managed by Prisma. Optimal settings are already configured.

### CDN for Static Assets

Consider using CloudFront or Cloudflare for:
- Frontend JS/CSS files
- User profile images
- Static assets

### Monitor Performance

```bash
# Check slow queries
docker compose logs backend | grep "Slow query"

# Check database connections
docker compose exec postgres psql -U springmeet_user -d springmeet_db \
  -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## 🔒 Security Hardening

### Environment Variables

```bash
# Never commit .env to git (already in .gitignore)
# Rotate JWT secrets quarterly
openssl rand -hex 64 | xargs -I {} docker compose exec backend \
  npx prisma db execute "UPDATE settings SET value = '{}' WHERE key = 'JWT_SECRET'"
```

### Firewall Rules

```bash
# Allow only necessary ports
sudo ufw enable
sudo ufw default deny incoming
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 5432/tcp  # PostgreSQL (internal only, remove this!)
```

### Nginx Security Headers

Already configured in `nginx/nginx.conf`:
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- CSP headers

### Database Security

```bash
# Change default postgres password
docker compose exec postgres psql -U springmeet_user -d springmeet_db \
  -c "ALTER USER springmeet_user WITH PASSWORD 'NEW_STRONG_PASSWORD';"

# Backup .env file
cp .env .env.backup
chmod 600 .env .env.backup
```

---

## 📞 Monitoring & Alerts

### Use Cloud Provider Tools

- **DigitalOcean**: Use Monitoring tab
- **AWS**: CloudWatch
- **Linode**: Longview
- **Hetzner**: Status Dashboard

### Manual Health Checks

```bash
# Create a monitoring script
cat > healthcheck.sh << 'EOF'
#!/bin/bash
API_HEALTH=$(curl -s https://api.yourdomain.com/api/health | grep -o status)
if [[ $API_HEALTH == *"ok"* ]]; then
  echo "✅ API is healthy"
else
  echo "❌ API is down!"
  # Send alert email here
fi
EOF

# Run every 5 minutes with cron
(crontab -l 2>/dev/null; echo "*/5 * * * * bash /path/to/healthcheck.sh") | crontab -
```

---

## 🆘 Support & Help

### Check Logs First

```bash
# All services
docker compose logs --tail=100

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

### Common Commands

```bash
# Interactive shell in container
docker compose exec backend sh

# View environment variables
docker compose exec backend env

# Restart clean
docker compose down && docker compose up -d --build

# Full system rebuild (⚠️ deletes data)
docker compose down -v && docker system prune -a && docker compose up -d --build
```

### Get Help

- **Email**: aittezazahmad@gmail.com
- **Phone**: +92 341 909 8201
- **GitHub Issues**: Report bugs

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial release |
| 1.1.0 | 2024-02-20 | Added monitoring guide |
| 2.0.0 | 2024-06-07 | Complete production setup |

---

## 🎉 You're Ready!

Your SpringMeet application is now live! 🌸

- Monitor the logs: `docker compose logs -f`
- Share your domain with users
- Promote and grow your community

**Make spring all over the world!** 🌍
