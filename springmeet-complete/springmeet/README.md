# 🌸 SpringMeet — Complete Full-Stack Application

> **Make spring all over the world.**  
> Built by **Aittezaz Ahmad** · aittezazahmad@gmail.com · +92 341 909 8201

---

## 📦 Project Overview

SpringMeet is a complete **real-time matchmaking and video chat application** built with modern technologies:

- **Backend**: Node.js + Express + TypeScript + Prisma + Socket.IO
- **Frontend**: Next.js 14 + React + Tailwind CSS + TypeScript
- **Database**: PostgreSQL (for data) + Redis (for caching/sessions)
- **Deployment**: Docker + Docker Compose + Nginx + Let's Encrypt SSL
- **Infrastructure**: Fully containerized, production-ready

---

## 📂 Project Structure

```
springmeet/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── routes/         # API endpoints (auth, users, chat, etc.)
│   │   ├── services/       # Business logic (moderation, matching)
│   │   ├── socket/         # WebSocket server (real-time chat/calls)
│   │   ├── middleware/     # Auth, validation, rate-limiting
│   │   └── utils/          # Database, Redis, Email, JWT
│   ├── prisma/
│   │   └── schema.prisma   # Database schema (20+ models)
│   └── Dockerfile
├── frontend/                # Next.js 14 React app
│   ├── app/                # Pages (login, signup, chat, queue, etc.)
│   ├── components/         # Reusable UI components
│   ├── lib/                # API client, state management
│   ├── hooks/              # Custom hooks (useSocket, etc.)
│   └── Dockerfile
├── nginx/                   # Reverse proxy & SSL
│   └── nginx.conf          # Routing, rate limiting, HTTPS
├── docker-compose.yml       # Full stack orchestration
├── deploy.sh                # One-command deployment script
├── .env.example             # Environment template
├── DEPLOYMENT.md            # Detailed deployment guide
├── GITHUB_DEPLOYMENT.md     # GitHub + VPS quick start
└── PRE_DEPLOYMENT_CHECKLIST.md  # Launch checklist
```

---

## 🚀 Quick Start

### Local Development

1. **Install dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Run locally** (requires PostgreSQL + Redis running):
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

   - Frontend: http://localhost:3000
   - API: http://localhost:4000

---

## 🌐 Deploy to Production

### Quick Deployment (5 Minutes)

**See [GITHUB_DEPLOYMENT.md](GITHUB_DEPLOYMENT.md)** for complete step-by-step guide.

**TL;DR:**

```bash
# On your Ubuntu VPS:
cd /opt
git clone https://github.com/YOUR_USERNAME/springmeet.git
cd springmeet

# Configure
cp .env.example .env
nano .env  # Fill in your values

# Deploy
bash deploy.sh

# Done! Visit https://yourdomain.com
```

### Detailed Deployment Guide

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- VPS setup instructions
- Domain configuration
- SSL certificates
- Database management
- Monitoring & maintenance
- Troubleshooting

---

## ✅ Pre-Deployment

Before pushing to GitHub, complete the **[PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)**:

- Environment variables configured
- No secrets in source code
- Docker builds successfully
- All routes tested
- Database migrations work

---

## 🏗️ Architecture

### Backend Services

| Service | Port | Purpose |
|---------|------|---------|
| **Express API** | 4000 | REST endpoints |
| **Socket.IO** | 4000 | Real-time chat/calls |
| **PostgreSQL** | 5432 | Data persistence |
| **Redis** | 6379 | Sessions & caching |

### Frontend Services

| Service | Port | Purpose |
|---------|------|---------|
| **Next.js** | 3000 | Web application |
| **Nginx** | 80/443 | Reverse proxy |

### Key Features

✅ **User Authentication**
- Email/password signup & login
- JWT + refresh tokens
- Email verification
- Password reset

✅ **Matching System**
- Global matching (random users)
- Mode-based matching (soulmate, friendship, etc.)
- Skip/accept functionality
- AI-powered icebreakers

✅ **Real-Time Chat**
- WebSocket-based messaging
- Chat history
- User presence
- Read receipts

✅ **Audio/Video Calls**
- Peer-to-peer WebRTC
- Call history
- Call ratings

✅ **Safety & Moderation**
- User reports
- Content moderation
- Account warnings
- Suspension/banning

✅ **Admin Dashboard**
- User management
- Report review
- Analytics
- Settings

---

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Validation**: Zod
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Email**: Nodemailer

### Frontend
- **Framework**: Next.js 14
- **UI Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **HTTP**: Axios
- **WebSocket**: Socket.IO Client
- **Forms**: React Hook Form
- **UI Components**: Radix UI, Lucide Icons

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Web Server**: Nginx
- **SSL**: Let's Encrypt (Certbot)
- **Database**: PostgreSQL 16
- **Cache**: Redis 7

---

## 📊 Database Schema

20+ models including:

- **Users** (auth, profile, preferences)
- **Matches** (matching sessions)
- **Messages** (chat history)
- **Calls** (voice/video call logs)
- **Reports** (safety reports)
- **Notifications** (alerts & events)
- **Admin Logs** (audit trail)

See [backend/prisma/schema.prisma](backend/prisma/schema.prisma) for full schema.

---

## 🔐 Security Features

- ✅ HTTPS/TLS encryption
- ✅ JWT authentication
- ✅ CORS protection
- ✅ Rate limiting (auth: 5/min, API: 30/min)
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (CSP headers)
- ✅ CSRF protection
- ✅ Input validation & sanitization
- ✅ Secure password hashing (bcrypt)
- ✅ Content moderation

---

## 📈 Performance

- **Frontend**: Next.js `standalone` output for minimal size
- **Backend**: Connection pooling, query optimization
- **Caching**: Redis for sessions & frequent queries
- **Compression**: Gzip on all HTTP responses
- **Images**: WebP optimization ready

---

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **[GITHUB_DEPLOYMENT.md](GITHUB_DEPLOYMENT.md)** - GitHub + VPS quick start
- **[PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)** - Launch checklist
- **[backend/src/](backend/src/)** - Well-commented source code
- **[frontend/](frontend/)** - React components with JSDoc

---

## 🚀 Deployment Checklist

### Before Pushing to GitHub

- [ ] Review [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)
- [ ] `.env` is in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] Docker images build successfully
- [ ] All tests pass

### Before Going Live

- [ ] Register domain
- [ ] Get VPS (DigitalOcean, Hetzner, etc.)
- [ ] Follow [DEPLOYMENT.md](DEPLOYMENT.md) step-by-step
- [ ] Test all features
- [ ] Change default admin password
- [ ] Set up monitoring
- [ ] Plan backups

---

## 📞 Support & Contributions

- **Email**: aittezazahmad@gmail.com
- **Phone**: +92 341 909 8201
- **GitHub Issues**: Report bugs and feature requests

---

## 📝 License

This project is provided as-is for deployment and customization.

---

## 🎯 Next Steps

1. **Review the code** - Understand the architecture
2. **Set up locally** - Follow Quick Start above
3. **Deploy to production** - Use DEPLOYMENT.md
4. **Customize** - Add your branding and features
5. **Launch** - Share with your community

---

**🌸 Make spring all over the world!**

> Built with ❤️ by Aittezaz Ahmad

#### Step 5 — Configure Environment

```bash
# Copy and edit the env file
cp .env.example .env
nano .env
```

Fill in ALL values in .env:
```env
POSTGRES_USER=springmeet_user
POSTGRES_PASSWORD=MyStr0ngP@ssw0rd!
POSTGRES_DB=springmeet_db
REDIS_PASSWORD=MyR3d!sP@ss!
JWT_SECRET=<run: openssl rand -hex 64>
JWT_REFRESH_SECRET=<run: openssl rand -hex 64>
SMTP_USER=aittezazahmad@gmail.com
SMTP_PASS=<your Gmail App Password>
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Generate JWT secrets:**
```bash
openssl rand -hex 64  # copy for JWT_SECRET
openssl rand -hex 64  # copy for JWT_REFRESH_SECRET
```

**Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" → "Other (custom name)" → "SpringMeet"
3. Copy the 16-character password into SMTP_PASS

#### Step 6 — Update nginx.conf with Your Domain

```bash
# Replace yourdomain.com everywhere in nginx.conf
sed -i 's/yourdomain.com/YOURACTUALDOMAIN.COM/g' nginx/nginx.conf
```

#### Step 7 — Get SSL Certificate

First, start nginx with HTTP only to get certificate:
```bash
# Temporarily comment out SSL lines in nginx.conf for first run
# Then:
docker compose up -d nginx certbot postgres redis

# Get SSL cert
docker compose run certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  --email aittezazahmad@gmail.com --agree-tos \
  -d yourdomain.com -d api.yourdomain.com
```

#### Step 8 — Deploy Everything

```bash
# Build and start all services
docker compose up -d --build

# Check all running
docker compose ps

# Watch logs
docker compose logs -f backend
docker compose logs -f frontend
```

#### Step 9 — Seed Database

```bash
docker compose exec backend npm run db:seed
```

This creates:
- **Admin account:** aittezazahmad@gmail.com / Admin@12345!
- **Test users:** luna@test.com, kai@test.com, etc. / Test@12345!

#### Step 10 — Verify Deployment

```bash
# Health check
curl https://api.yourdomain.com/api/health

# Should return:
# {"status":"ok","timestamp":"...","service":"SpringMeet API 🌸"}
```

Visit https://yourdomain.com — SpringMeet is live! 🌸

---

### Option B — Render.com (Free tier, zero-ops)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo
4. **Backend:** Set root dir = `backend`, build = `npm install && npm run build`, start = `npm start`
5. Add a PostgreSQL database (Render provides free tier)
6. Add Redis (Render Redis or Upstash free tier)
7. Set all environment variables in Render dashboard
8. **Frontend:** New Static Site or Web Service, root = `frontend`
9. Add environment variables

---

### Option C — Railway.app (Easiest)

1. Push to GitHub
2. Go to [railway.app](https://railway.app)
3. New Project → Deploy from GitHub repo
4. Add PostgreSQL and Redis plugins
5. Set environment variables
6. Deploy both services

---

## 🔄 SSL Auto-Renewal

Set up auto-renewal cron:
```bash
crontab -e
# Add:
0 12 * * * docker compose -f /opt/springmeet/docker-compose.yml run certbot renew --quiet && docker compose -f /opt/springmeet/docker-compose.yml exec nginx nginx -s reload
```

---

## 📊 Monitoring

```bash
# Live logs
docker compose logs -f

# Backend only
docker compose logs -f backend

# Check resource usage
docker stats

# Restart a service
docker compose restart backend

# Update after code changes
docker compose up -d --build backend
```

---

## 🔧 Common Issues

**Port 80/443 in use:**
```bash
sudo lsof -i :80
sudo kill -9 <PID>
```

**Database migration failed:**
```bash
docker compose exec backend npx prisma migrate deploy
```

**Can't connect to Redis:**
```bash
docker compose exec redis redis-cli -a YOUR_REDIS_PASSWORD ping
```

**Email not sending:**
- Make sure Gmail 2FA is ON
- Use App Password, NOT your regular Gmail password
- Less secure app access is NOT needed with App Passwords

---

## 🛡️ Security Checklist

- [ ] Change all default passwords in .env
- [ ] Use strong JWT secrets (64+ chars)
- [ ] Enable firewall: `ufw allow 22,80,443 && ufw enable`
- [ ] Keep Docker and Ubuntu updated
- [ ] Set up automated backups for PostgreSQL
- [ ] Monitor logs for suspicious activity

**Firewall setup:**
```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

---

## 💾 Database Backup

```bash
# Manual backup
docker compose exec postgres pg_dump -U springmeet_user springmeet_db > backup_$(date +%Y%m%d).sql

# Restore
docker compose exec -T postgres psql -U springmeet_user springmeet_db < backup_20250101.sql
```

Auto-backup cron (daily at 2am):
```bash
0 2 * * * docker compose -f /opt/springmeet/docker-compose.yml exec -T postgres pg_dump -U springmeet_user springmeet_db > /opt/backups/springmeet_$(date +\%Y\%m\%d).sql
```

---

## 👤 Admin Panel

After deployment, log in at: `https://yourdomain.com/admin`

**Admin credentials (from seed):**
- Email: aittezazahmad@gmail.com
- Password: Admin@12345! ← **CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN**

The admin panel lets you:
- View live stats (users, matches, acceptance rate)
- Ban / suspend / warn users
- Review reports
- Configure session duration (10 or 15 minutes)
- Monitor abuse trends

---

## 📱 API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/verify-email | Verify email |
| POST | /api/auth/forgot-password | Request reset |
| POST | /api/auth/reset-password | Reset password |
| GET | /api/auth/me | Current user |
| POST | /api/matching/join-queue | Enter queue |
| POST | /api/matching/leave-queue | Leave queue |
| POST | /api/chat/send-message | Send message |
| POST | /api/chat/accept | Accept match |
| GET | /api/chat/session/:id | Get session |
| GET | /api/inbox | List inbox |
| POST | /api/calls/start | Start call |
| POST | /api/reports | Report user |
| POST | /api/reports/block | Block user |
| GET | /api/admin/stats | Admin stats |
| GET | /api/health | Health check |

---

## 🌐 WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| match:found | Server→Client | Match found |
| chat:message | Bidirectional | New message |
| chat:typing | Bidirectional | Typing indicator |
| chat:accepted_by_one | Server→Client | One accepted |
| chat:mutual_accept | Server→Client | Both accepted |
| chat:expired | Server→Client | Session expired |
| call:incoming | Server→Client | Incoming call |
| call:accepted | Server→Client | Call accepted |
| call:ended | Server→Client | Call ended |
| webrtc:offer | Client→Client | WebRTC offer |
| webrtc:answer | Client→Client | WebRTC answer |
| webrtc:ice-candidate | Client→Client | ICE candidate |

---

## 📞 Support

**Founder:** Aittezaz Ahmad  
**Email:** aittezazahmad@gmail.com  
**WhatsApp:** +92 341 909 8201  
**Phone:** +92 341 909 8201

---

*🌸 SpringMeet — Making the world a little more springy, one conversation at a time.*
