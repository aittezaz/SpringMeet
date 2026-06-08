# ✅ Pre-Deployment Checklist

Complete this checklist before pushing to GitHub and deploying to production.

---

## 📋 Code Quality

- [ ] No console.log() statements in production code
- [ ] No TODO comments left in critical code
- [ ] All TypeScript files compile without errors
- [ ] ESLint passes (if configured)
- [ ] No unused imports or variables
- [ ] Error handling implemented for all API calls
- [ ] Input validation on all API endpoints

---

## 🔐 Security

- [ ] `.env` is in `.gitignore` (NOT committed)
- [ ] `.env.example` has no real secrets, only placeholders
- [ ] No passwords hardcoded in source code
- [ ] No API keys in source code
- [ ] JWT secrets are environment variables only
- [ ] CORS is configured properly (only allow frontend domain)
- [ ] Rate limiting is enabled on auth endpoints
- [ ] HTTPS is enforced in production
- [ ] SQL injection prevention (Prisma ORM handles this)
- [ ] XSS protection headers in place

---

## 📦 Environment Variables

### Root `./.env.example`
- [ ] POSTGRES_USER defined
- [ ] POSTGRES_PASSWORD placeholder (not real value)
- [ ] POSTGRES_DB defined
- [ ] REDIS_PASSWORD placeholder (not real value)
- [ ] JWT_SECRET placeholder with instructions
- [ ] JWT_REFRESH_SECRET placeholder with instructions
- [ ] SMTP_HOST set to smtp.gmail.com
- [ ] SMTP_PORT set to 587
- [ ] SMTP_USER placeholder
- [ ] SMTP_PASS placeholder with instructions
- [ ] FRONTEND_URL set to yourdomain.com
- [ ] NEXT_PUBLIC_API_URL set correctly
- [ ] NEXT_PUBLIC_SOCKET_URL set correctly
- [ ] NEXT_PUBLIC_APP_URL set correctly

### Backend `.env.example`
- [ ] NODE_ENV defaults to production
- [ ] PORT is 4000
- [ ] DATABASE_URL uses environment variables
- [ ] REDIS_HOST, PORT, PASSWORD use variables
- [ ] JWT secrets use environment variables
- [ ] SMTP credentials are variables

### Frontend `.env.example`
- [ ] NEXT_PUBLIC_API_URL configured
- [ ] NEXT_PUBLIC_SOCKET_URL configured
- [ ] NEXT_PUBLIC_APP_URL configured

---

## 🐳 Docker Configuration

### Backend Dockerfile
- [ ] Uses multi-stage build (builder + runner)
- [ ] Installs only production dependencies in runner
- [ ] Sets appropriate USER (not root)
- [ ] Exposes correct PORT (4000)
- [ ] Runs migrations in CMD
- [ ] Includes healthcheck (if needed)

### Frontend Dockerfile
- [ ] Uses multi-stage build (deps, builder, runner)
- [ ] Accepts build arguments for env vars
- [ ] Sets NODE_ENV=production
- [ ] Uses standalone output
- [ ] Sets correct PORT (3000)
- [ ] Runs with non-root user

### docker-compose.yml
- [ ] PostgreSQL service configured correctly
- [ ] Redis service configured correctly
- [ ] Backend service depends on databases
- [ ] Frontend service depends on backend
- [ ] Nginx service configured
- [ ] Certbot service configured
- [ ] Health checks on databases
- [ ] Volumes for persistent data
- [ ] Environment variables use .env file

---

## 🌐 Nginx Configuration

- [ ] HTTP redirects to HTTPS
- [ ] SSL certificates configured
- [ ] Rate limiting configured
- [ ] WebSocket support for Socket.IO
- [ ] CORS headers if needed
- [ ] Security headers (HSTS, CSP, etc.)
- [ ] Upstream services configured
- [ ] Error pages configured

---

## 📖 Documentation

- [ ] README.md is comprehensive
- [ ] README.md includes setup instructions
- [ ] DEPLOYMENT.md is complete
- [ ] DEPLOYMENT.md includes troubleshooting
- [ ] GITHUB_DEPLOYMENT.md provides quick start
- [ ] `.env.example` files have good comments
- [ ] Code comments explain complex logic

---

## 🗄️ Database

- [ ] Prisma schema is complete and valid
- [ ] All migrations are tracked in git
- [ ] Seed script (`src/utils/seed.ts`) creates test data
- [ ] Default admin account is created in seed
- [ ] No hardcoded database URLs
- [ ] Connection pooling is configured
- [ ] Backups are planned (documented in DEPLOYMENT.md)

---

## 🚀 Backend API

- [ ] Health check endpoint works (`/api/health`)
- [ ] All routes are properly mounted
- [ ] CORS configuration includes frontend URL
- [ ] Rate limiting is applied globally and to auth
- [ ] Error handling middleware is in place
- [ ] Request logging is configured
- [ ] JWT authentication is implemented
- [ ] Token refresh logic works
- [ ] Input validation on all endpoints
- [ ] Database queries are optimized

---

## 💻 Frontend Application

- [ ] All pages load without errors
- [ ] Environment variables are used (not hardcoded)
- [ ] API calls use configured API_URL
- [ ] WebSocket connection uses SOCKET_URL
- [ ] Token management (localStorage) works
- [ ] Error boundaries are implemented
- [ ] Loading states are shown
- [ ] Responsive design works on mobile
- [ ] Images are optimized
- [ ] Build output is optimized (`output: standalone`)

---

## 🔗 Integration Tests

- [ ] Registration flow works end-to-end
- [ ] Login and token refresh work
- [ ] Protected routes require authentication
- [ ] WebSocket connections work
- [ ] Real-time chat messages are delivered
- [ ] Database migrations run without errors
- [ ] Redis caching works
- [ ] Email sending is configured

---

## 📝 Git & GitHub

- [ ] Repository is public (if planning to share)
- [ ] `.gitignore` includes:
  - [ ] `.env` files
  - [ ] `node_modules/`
  - [ ] Build artifacts (`.next/`, `dist/`, `build/`)
  - [ ] IDE files (`.vscode/`, `.idea/`)
  - [ ] OS files (`.DS_Store`, `Thumbs.db`)
  - [ ] Logs
  - [ ] Database files
  - [ ] SSL certificates
- [ ] All source code is committed
- [ ] No uncommitted changes before push
- [ ] Commit history is clean
- [ ] README.md is at root level

---

## 🔍 Final Verification

Run these commands before pushing:

```bash
# Check for uncommitted changes
git status

# Verify all files are correct
git log --oneline | head -5

# Test Docker build locally (optional)
docker compose build

# Verify environment files are not committed
git ls-files | grep -i "\.env$"
# Should return: only .env.example files

# Verify node_modules is ignored
git ls-files | grep node_modules
# Should return: nothing

# Final check
git diff --cached --name-only | grep -E "\.env$"
# Should return: nothing (no .env files staged)
```

---

## ✨ Ready to Deploy!

If all items are checked, you're ready to:

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Deploy to Live Server**
   - Follow GITHUB_DEPLOYMENT.md instructions
   - Run `bash deploy.sh` on your VPS

3. **Monitor Deployment**
   ```bash
   docker compose logs -f
   ```

---

## 🎯 Launch Checklist

After deployment to live server:

- [ ] Visit https://yourdomain.com - App loads
- [ ] API health check: https://api.yourdomain.com/api/health
- [ ] Can register new account
- [ ] Can login with account
- [ ] Can chat in real-time
- [ ] Emails are sent (check inbox)
- [ ] Admin dashboard accessible
- [ ] Change default admin password
- [ ] Monitor logs: `docker compose logs -f`
- [ ] Share domain with beta users

---

## 🆘 Need Help?

- Check DEPLOYMENT.md for detailed troubleshooting
- Review GITHUB_DEPLOYMENT.md for common issues
- Check Docker logs: `docker compose logs backend`
- SSH into server and check manually
- Email support for critical issues

---

**🌸 You're ready to make spring all over the world!**
