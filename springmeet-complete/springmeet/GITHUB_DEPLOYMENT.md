# 🚀 GitHub & Deployment Quick Start

This document guides you through pushing your SpringMeet project to GitHub and deploying it to a live server.

---

## ✅ Pre-Push Checklist

Before pushing to GitHub:

- [ ] `.env` file is NOT committed (check .gitignore)
- [ ] `node_modules/` directories are in .gitignore
- [ ] Build artifacts (`.next/`, `dist/`) are in .gitignore
- [ ] No hardcoded secrets in source code
- [ ] All environment variables use `process.env.VARIABLE_NAME`
- [ ] `deploy.sh` script is executable (`chmod +x deploy.sh`)
- [ ] README.md and DEPLOYMENT.md are up to date

---

## 📌 Step 1: Initialize Git (if not already done)

```bash
cd springmeet

# Initialize git
git init

# Add all files except those in .gitignore
git add .

# Make first commit
git commit -m "Initial commit: SpringMeet full stack application"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/springmeet.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 📤 Step 2: Push to GitHub

### If You Haven't Set Up SSH Keys

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@gmail.com"

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub
# Paste in GitHub Settings → SSH and GPG Keys
```

### Push Your Code

```bash
# Make sure you're in the project directory
cd springmeet

# Verify remote is set
git remote -v

# Push code
git push -u origin main

# Verify on GitHub - visit: https://github.com/YOUR_USERNAME/springmeet
```

---

## 🌐 Step 3: Deploy to Live Server

### Get a VPS

**Recommended providers** (~$5-15/month):
- [DigitalOcean](https://digitalocean.com) - $5/mo droplet
- [Hetzner](https://hetzner.com) - €3/mo VPS
- [Linode](https://linode.com) - $5/mo Nanode
- [Vultr](https://vultr.com) - $2.50/mo instance
- [AWS Lightsail](https://aws.amazon.com/lightsail/) - $3.50/mo

**Recommended specs:**
- OS: Ubuntu 20.04 LTS or 22.04 LTS
- CPU: 1+ vCPU
- RAM: 2GB minimum (4GB recommended)
- Storage: 20GB+

### Buy a Domain

Get from:
- [Namecheap](https://namecheap.com)
- [GoDaddy](https://godaddy.com)
- [Google Domains](https://domains.google.com)

### Connect Your Domain

In your domain registrar, set DNS A records:

```
A record:  @     (yourdomain.com)      → YOUR_SERVER_IP
A record:  api   (api.yourdomain.com)  → YOUR_SERVER_IP
```

Wait 5-30 minutes for DNS propagation. Check with:

```bash
nslookup yourdomain.com
# Should show your server IP
```

### Deploy on Your Server

```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Navigate to /opt
cd /opt

# Clone your GitHub repository
git clone https://github.com/YOUR_USERNAME/springmeet.git
cd springmeet

# Copy and edit environment file
cp .env.example .env
nano .env

# Edit the following:
# - POSTGRES_PASSWORD (generate: openssl rand -hex 16)
# - REDIS_PASSWORD (generate: openssl rand -hex 16)
# - JWT_SECRET (generate: openssl rand -hex 64)
# - JWT_REFRESH_SECRET (generate: openssl rand -hex 64)
# - SMTP_USER & SMTP_PASS (Gmail credentials)
# - Replace yourdomain.com with your actual domain

# Update nginx.conf with your domain
sed -i 's/yourdomain.com/YOUR_DOMAIN.com/g' nginx/nginx.conf

# Run the deployment script
bash deploy.sh

# Wait 3-5 minutes for services to start
```

### Verify Deployment

```bash
# Check all services
docker compose ps

# Test API endpoint
curl https://api.yourdomain.com/api/health

# View logs
docker compose logs -f backend

# Monitor resources
docker stats
```

---

## 📊 Post-Deployment

### Access Your App

- **Frontend**: https://yourdomain.com
- **API**: https://api.yourdomain.com/api
- **Admin**: Use credentials from seeded data

### Change Default Admin Password

1. Login with: `aittezazahmad@gmail.com / Admin@12345!`
2. Go to Settings
3. Change password immediately

### Monitor Your Server

```bash
# SSH back into server
ssh root@YOUR_SERVER_IP
cd /opt/springmeet

# View real-time logs
docker compose logs -f

# Check container status
docker compose ps

# Monitor resource usage
docker stats

# Update service if needed
git pull origin main
docker compose up -d --build
```

---

## 🔄 Future Updates

### Pull Latest Changes from GitHub

```bash
# On your server
cd /opt/springmeet
git pull origin main
docker compose up -d --build
```

### Make Changes Locally and Push

```bash
# On your local machine
cd springmeet

# Make your changes
# ... edit files ...

# Commit
git add .
git commit -m "Add new feature"

# Push
git push origin main

# Then on server, pull and rebuild
ssh root@YOUR_SERVER_IP
cd /opt/springmeet
git pull origin main
docker compose up -d --build
```

---

## 🆘 Common Issues

### Domain not resolving

```bash
# Wait for DNS to propagate
nslookup yourdomain.com

# Check DNS settings in domain registrar
# Should point to: YOUR_SERVER_IP for both @ and api
```

### SSL certificate issues

```bash
# Check certificate status
docker compose logs certbot

# Manually renew
docker compose run certbot renew

# Check expiration
openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/cert.pem
```

### API not responding

```bash
# Check backend logs
docker compose logs -f backend

# Check database connection
docker compose logs postgres

# Restart backend
docker compose restart backend
```

### Frontend shows blank page

```bash
# Check frontend logs
docker compose logs frontend

# Verify environment variables
docker compose exec frontend env | grep NEXT_PUBLIC

# Rebuild frontend
docker compose up -d --no-deps --build frontend
```

---

## 📞 Support

- **Documentation**: See DEPLOYMENT.md for detailed guide
- **Email**: aittezazahmad@gmail.com
- **Phone**: +92 341 909 8201

---

## 🎉 Success!

You've deployed SpringMeet! 🌸

**Next steps:**
- Share your domain with users
- Monitor logs regularly
- Keep dependencies updated
- Backup your database weekly
- Monitor server resources

**Make spring all over the world!** 🌍
