# 🚀 DEPLOYMENT & ROLLBACK RUNBOOK

**Last Updated:** November 18, 2025  
**Target:** Production deployment strategy with zero-downtime and automated rollback

---

## 1. Pre-Deployment Verification

### Environment Checklist
```bash
# 1. Verify Node version
node --version  # Should be 18+

# 2. Verify dependencies
npm ci
npm list | grep "npm ERR"  # Should be empty

# 3. Verify build
npm run build
# Expected: "Compiled successfully ✓"

# 4. Verify tests
npm test
# Expected: 0 failed tests (or appropriately skipped)

# 5. Verify security gates
npm audit --audit-level=high
# Expected: "0 vulnerabilities"

# 6. Verify git clean
git status
# Expected: "nothing to commit, working tree clean"
```

---

## 2. Database Migrations (Zero-Downtime)

### Before Deployment

```bash
# 1. Create snapshot/backup
npx prisma migrate status
# Review pending migrations

# 2. Test on shadow database (CI/CD does this automatically)
npx prisma migrate deploy --skip-generate
# On staging environment - DO NOT run on production yet

# 3. Export current production data (if needed)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 4. Review migration safety
cat prisma/migrations/*/migration.sql
# ✅ Safe: ALTER COLUMN, ADD COLUMN (with defaults), DROP COLUMN (if unused)
# ❌ Unsafe: Rename without mapping, delete data, lock table >1min
```

### During Deployment

```bash
# 1. Create new database tag/version
# Via provider (Supabase, Railway, AWS RDS):
# - Take automated backup
# - Enable replication if applicable

# 2. Run migration in low-traffic window (2-4 AM UTC recommended)
npx prisma migrate deploy

# 3. Verify migration success
npx prisma generate
npm run build

# 4. Health check
curl https://api.seudominio.com/health
# Expected: { "status": "ok", "version": "X.Y.Z" }
```

### Rollback Procedure (If Migration Fails)

```bash
# 1. Immediate: Stop deployment
git tag -a "deployment/FAILED_$(date +%Y%m%d_%H%M%S)" -m "Migration failed"
git push origin --tags

# 2. Revert to last working version
git revert HEAD  # Creates new commit
git push origin main

# 3. Restore database snapshot
# Via provider console:
# - Select backup from before migration
# - Click "Restore"
# - Wait for restore complete

# 4. Verify old version works
curl https://api.seudominio.com/health

# 5. Post-mortem
# - Check Sentry for errors
# - Review Prisma schema for issues
# - Update DEPLOYMENT.md with findings
```

---

## 3. Application Deployment (Vercel / Self-Hosted)

### Option A: Vercel (Recommended for SaaS)

```bash
# 1. Build and push to main
git checkout main
git pull origin main
npm ci && npm run build  # Test locally first
git add package-lock.json
git commit -m "build: update dependencies for deployment"
git push origin main

# 2. Vercel auto-deploys on push to main
# Monitor: https://vercel.com/dashboard/paginas-comercio/deployments

# 3. Verify deployment
curl https://paginas-comercio.vercel.app/health

# 4. Smoke tests (automated via CI/CD)
# - Homepage loads
# - API /health endpoint responsive
# - Authentication flow works
```

### Option B: Self-Hosted (Docker)

```bash
# 1. Build Docker image
docker build -t paginas-comercio:vX.Y.Z .

# 2. Push to registry
docker push your-registry/paginas-comercio:vX.Y.Z

# 3. Update production deployment
kubectl set image deployment/paginas-comercio \
  paginas-comercio=your-registry/paginas-comercio:vX.Y.Z

# 4. Wait for rollout
kubectl rollout status deployment/paginas-comercio

# 5. Verify
curl https://api.seudominio.com/health
```

### Option C: Traditional VM

```bash
# 1. SSH into server
ssh deploy@production.example.com

# 2. Pull latest code
cd /app
git pull origin main

# 3. Install dependencies
npm ci

# 4. Build application
npm run build

# 5. Migrate database
npx prisma migrate deploy

# 6. Restart service
sudo systemctl restart paginas-comercio

# 7. Verify
curl http://localhost:3000/health
```

---

## 4. Rollback Strategies

### Quick Rollback (Last 1 Hour)

```bash
# 1. Identify last working version
git log --oneline | head -5

# 2. Revert to previous commit
git revert HEAD --no-edit
git push origin main

# 3. Trigger redeployment
# Vercel: Auto on main push
# Docker: kubectl set image ...
# VM: git pull && npm run build && systemctl restart

# 4. Verify rollback
curl https://api.seudominio.com/health
```

### Full Rollback (Database + App)

```bash
# If application rollback alone isn't sufficient:

# 1. Stop new version
# Vercel: Disable deployments temporarily
# Docker: kubectl scale deployment/paginas-comercio --replicas=0
# VM: sudo systemctl stop paginas-comercio

# 2. Restore database snapshot
# Provider console → Backups → Restore [timestamp before migration]
# Wait for restore to complete (~5-15 minutes)

# 3. Deploy previous working version
git revert HEAD
git push origin main
# Wait for deployment to complete

# 4. Verify
# - Check health endpoint
# - Query audit logs
# - Test key workflows (login, create page, etc.)
```

### Canary Deployment (Safer Alternative)

```bash
# 1. Deploy to staging first
git push origin staging
# Wait for CI/CD to pass

# 2. Manual testing on staging
curl https://staging.seudominio.com/health
# Run E2E tests
npm run test:e2e

# 3. Deploy to 10% of production traffic
# Vercel: Traffic splits via Experiments
# Load Balancer: 90% old, 10% new version
# Kubernetes: 1/10 replicas new version

# 4. Monitor metrics (Sentry, analytics)
# - Error rate (target: <0.1%)
# - Latency (target: p95 <200ms)
# - User reports

# 5. Rollback if issues found
git revert HEAD
git push origin main

# 6. If no issues in 30 min, expand to 100%
kubectl scale deployment/paginas-comercio-new --replicas=10
```

---

## 5. Health Checks & Monitoring

### Health Endpoint
```bash
GET /api/health
Response: { "status": "ok", "version": "0.1.0", "uptime": "23h45m12s" }

# Automated by monitoring
# - New Relic, DataDog, Sentry, etc.
# - Alerts if /health fails for >2 min
```

### Critical Metrics
```
✅ API response time (p95): <200ms
✅ Error rate: <0.1%
✅ Database connections: <80% of pool
✅ Disk usage: <80%
✅ Memory usage: <80%
✅ CPU: <70% average
```

### Monitor During Deployment
```bash
# Real-time logs
# Vercel: vercel logs
# Kubernetes: kubectl logs -f deployment/paginas-comercio
# VM: tail -f /var/log/paginas-comercio.log

# Metrics
# Open Sentry dashboard: errors, performance, releases
# Check analytics: user activity, page loads, API calls

# User feedback
# Slack channel: deployment-notifications
# Email alerts: ops@seudominio.com
```

---

## 6. Feature Flags (Gradual Rollout)

### Using Feature Flags to Minimize Risk

```typescript
// lib/features.ts
export const features = {
  NEW_ADMIN_DASHBOARD: process.env.FEATURE_ADMIN_V2 === 'true',
  NEW_PAYMENT_PROCESSOR: process.env.FEATURE_STRIPE_V2 === 'true',
  ADVANCED_ANALYTICS: process.env.FEATURE_ANALYTICS_V2 === 'true',
};

// app/api/pages/route.ts
if (features.NEW_ADMIN_DASHBOARD) {
  // Use new dashboard
} else {
  // Use old dashboard
}
```

### Deployment with Feature Flags

```bash
# 1. Deploy new code with feature flag OFF
npm run build
npm run deploy  # Feature disabled

# 2. Monitor for issues (should be 0 since off)
# ...

# 3. Enable for 10% of users
FEATURE_ADMIN_V2=true npm run deploy-canary

# 4. If no issues, enable for 100%
FEATURE_ADMIN_V2=true npm run deploy-prod

# 5. Remove flag in next release
git rm lib/features.ts
```

---

## 7. Disaster Recovery

### If Everything Fails

```bash
# 1. Enable maintenance mode
echo "maintenance" > /var/www/paginas-comercio/STATUS

# 2. Revert to stable known version
git checkout v0.1.0  # Last known good
git push --force origin main

# 3. Restore database
pg_restore backup_2025-11-18_03-00.sql > $DATABASE_URL

# 4. Rebuild and restart
npm ci
npm run build
npm run start

# 5. Disable maintenance mode
rm /var/www/paginas-comercio/STATUS

# 6. Verify
curl https://api.seudominio.com/health

# 7. Investigate root cause
# - Check git log for bad commit
# - Check Prisma migration logs
# - Review dependency updates
# - Post-mortem meeting
```

---

## 8. Release Versioning

### Semantic Versioning

```
vMAJOR.MINOR.PATCH
v0.1.0 = Major (breaking), Minor (features), Patch (fixes)

0.1.0 → 0.1.1  Patch: Bug fix, small improvement
0.1.0 → 0.2.0  Minor: New feature, backward compatible
0.1.0 → 1.0.0  Major: Breaking change, new architecture
```

### Tagging Releases

```bash
# Create version tag
git tag -a v0.2.0 -m "Week 2: Admin Dashboard + User Management"

# Push tag
git push origin v0.2.0

# List versions
git tag --list

# Create release notes (GitHub UI)
# - Go to Releases → Draft new release
# - Tag: v0.2.0
# - Title: "Week 2: Admin Dashboard"
# - Changelog: List of changes, fixes, security updates
```

---

## 9. Deployment Schedule

### Recommended Windows

| Type | Day | Time | Duration | Approval |
|------|-----|------|----------|----------|
| Hotfix (security) | Any | ASAP | <15 min | Tech Lead |
| Patch | Mon-Fri | 9 AM UTC | <1 hour | Release Manager |
| Feature | Tue-Thu | 9 AM UTC | <2 hours | Product + Eng Lead |
| Major | Monthly | 1 AM UTC | <30 min | Director + Team |

### Communication

```
Before deployment:
- Announce in #deployments Slack channel
- Notify support team

During deployment:
- Real-time status updates
- Link to deployment dashboard

After deployment:
- Confirm success
- Share release notes
- Monitor for issues (2 hours minimum)
```

---

## 10. Deployment Checklist (Copy & Execute)

```
⏰ PRE-DEPLOYMENT (1 hour before)
- [ ] npm audit --audit-level=high ✓
- [ ] npm run build ✓
- [ ] npm test ✓
- [ ] git log --oneline -5  (review commits)
- [ ] Notify team in Slack
- [ ] Take database backup
- [ ] Enable monitoring dashboard

🚀 DEPLOYMENT (actual deploy)
- [ ] git push origin main
- [ ] Wait for CI/CD to pass
- [ ] Wait for deployment to complete
- [ ] Verify /health endpoint
- [ ] Run smoke tests
- [ ] Monitor error rate (target: <0.1%)

✅ POST-DEPLOYMENT (30 minutes after)
- [ ] Check Sentry for new errors
- [ ] Review user activity (analytics)
- [ ] Verify audit logs are working
- [ ] Confirm all features still work
- [ ] Announce success in Slack
- [ ] Update release notes
- [ ] Schedule post-mortem if issues found
```

---

## Quick Reference Commands

```bash
# Status
git status
npm audit

# Deploy Vercel
git push origin main  # Auto-deploys

# Deploy Docker
docker build -t app:v0.2.0 .
docker push registry/app:v0.2.0
kubectl set image deployment/app app=registry/app:v0.2.0

# Rollback
git revert HEAD
git push origin main

# Monitor
curl https://api.example.com/health
tail -f logs/production.log
```

---

**Status:** 🟢 READY FOR PRODUCTION  
**Next:** Follow checklist above before each deployment.
