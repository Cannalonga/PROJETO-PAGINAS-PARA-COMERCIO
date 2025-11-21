# BILLING & STRIPE DEPLOYMENT CHECKLIST

**Status**: PHASE D - Production Ready  
**Version**: 1.0  
**Last Updated**: 2025-01-19  

---

## ⚡ QUICK START

For fast-track deployment (3 days):

```bash
# Day 1: Setup
1. Verify .env variables (see section below)
2. Create Stripe test products/prices
3. Run tests locally (npm run test)
4. Deploy to staging

# Day 2: Integration Testing
1. Test checkout flow end-to-end
2. Verify webhook signature validation
3. Test subscription state transitions

# Day 3: Production
1. Create live Stripe products/prices
2. Update .env with live keys
3. Deploy to production
4. Monitor webhook delivery
```

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Environment Variables

**Stripe API Keys** (Get from Stripe Dashboard → Developers)

- [ ] `STRIPE_SECRET_KEY` configured
  - Format: `sk_test_...` (test) or `sk_live_...` (production)
  - Save securely in secrets manager

- [ ] `STRIPE_WEBHOOK_SECRET` configured
  - Format: `whsec_test_...` (test) or `whsec_live_...` (production)
  - Get from: Webhooks → Select endpoint → Signing secret

- [ ] `STRIPE_PRICE_BASIC_ID` configured
  - Format: `price_...`
  - Get from: Products → Select product → Pricing section

- [ ] `STRIPE_PRICE_PRO_ID` configured
  - Format: `price_...`

- [ ] `STRIPE_PRICE_PREMIUM_ID` configured
  - Format: `price_...`

**Test Keys Template**
```env
# In .env.local or staging environment
STRIPE_SECRET_KEY="sk_test_51PtestexampleKeyHere"
STRIPE_WEBHOOK_SECRET="whsec_test_exampleWebhookSecretHere"
STRIPE_PRICE_BASIC_ID="price_1PbasicIdHere"
STRIPE_PRICE_PRO_ID="price_1PproIdHere"
STRIPE_PRICE_PREMIUM_ID="price_1PpremiumIdHere"
```

### Database

- [ ] Migration applied: `npx prisma migrate deploy`
  - Adds: `stripeSubscriptionId`, `plan`, `billingStatus` to Tenant
  - Creates indexes for billing queries

- [ ] Schema generated: `npx prisma generate`
  - Updates `@prisma/client` types

- [ ] Database backups configured
  - Automated daily backups
  - Retention: 30 days

### Code Quality

- [ ] TypeScript compilation: `npm run build` passes
  - No compilation errors
  - No type warnings

- [ ] Linting: `npm run lint` passes
  - No eslint warnings

- [ ] Unit tests: `npm run test` passes
  - BillingService tests all green
  - Coverage > 80%

- [ ] Security audit: `npm audit`
  - No critical vulnerabilities
  - Dependencies up-to-date

### Stripe Setup

#### Test Mode (Staging)

1. [ ] Create test products in Stripe Dashboard
   ```
   Product: "Plano Básico"
   Price: R$ 29/month
   Billing cycle: Monthly
   Copy Price ID → STRIPE_PRICE_BASIC_ID
   ```

2. [ ] Create test Webhook endpoint
   - Endpoint URL: `https://staging-domain.com/api/stripe/webhook`
   - Events: `customer.subscription.*`, `invoice.*`
   - Save Signing Secret → STRIPE_WEBHOOK_SECRET

3. [ ] Configure test events in Stripe:
   ```bash
   stripe trigger customer.subscription.created
   stripe trigger customer.subscription.updated
   stripe trigger customer.subscription.deleted
   ```

#### Live Mode (Production)

1. [ ] Create live products in Stripe Production
   - Same as test mode but with live credentials
   - Prices can be different (marketing)

2. [ ] Create live Webhook endpoint
   - Endpoint URL: `https://production-domain.com/api/stripe/webhook`
   - Events: Same as test mode

3. [ ] Enable webhook retry policies
   - Default (recommended): 5min, 30min, 2h, 5h, 10h, 10h

4. [ ] Configure Payment Methods
   - Enabled in Stripe: Credit card, Debit card, Pix (Brazil)
   - Disable: Methods you don't support

### Security

- [ ] Webhook signature verification active
  - Code uses `stripe.webhooks.constructEvent()`
  - STRIPE_WEBHOOK_SECRET never logged

- [ ] RBAC enforced for billing routes
  - Only OWNER/ADMIN can access
  - Verified in route handlers

- [ ] Rate limiting applied
  - `/api/billing/checkout`: 3/min
  - `/api/billing/portal`: 5/min

- [ ] Error messages sanitized
  - No internal errors exposed to client
  - Sentry/logging for debugging

- [ ] Sensitive data not logged
  - Card numbers: ✗ Never logged
  - Stripe API key: ✗ Never logged
  - Customer token: ✗ Never logged

### Monitoring & Alerts

- [ ] Error tracking configured
  - Sentry or similar
  - Billing errors tagged for visibility

- [ ] Logging system ready
  - All `/api/billing/*` requests logged
  - Webhook events logged with status

- [ ] Alerting configured
  - High webhook error rate (> 5%)
  - Stripe API errors
  - Database connection errors

- [ ] Dashboard/Analytics ready
  - MRR (Monthly Recurring Revenue) tracking
  - Subscription count by plan
  - Failed payment tracking

---

## 🧪 TESTING CHECKLIST

### Unit Tests

```bash
npm run test -- billing-service.test.ts
```

- [ ] `createOrGetCustomerForTenant`
  - ✅ Returns existing customer
  - ✅ Creates new customer
  - ✅ Throws for invalid tenant

- [ ] `mapStripeStatusToBillingStatus`
  - ✅ All 7 statuses mapped correctly
  - ✅ Unknown status defaults to INACTIVE

- [ ] `handleSubscriptionUpdated`
  - ✅ Updates tenant with correct plan
  - ✅ Idempotent (call twice = same result)
  - ✅ Handles missing tenant gracefully

- [ ] Error classes
  - ✅ BillingValidationError has 400 status
  - ✅ BillingNotFoundError has 404 status
  - ✅ StripeError has 500 status

### Integration Tests (Stripe Test Mode)

```bash
# Use Stripe test card: 4242 4242 4242 4242
```

- [ ] Test checkout flow
  ```bash
  1. POST /api/billing/checkout { "plan": "PRO" }
  2. Verify: 201 response with checkout URL
  3. Verify: Stripe customer created
  4. Verify: Metadata correct in Stripe
  ```

- [ ] Test webhook processing
  ```bash
  1. Simulate Stripe webhook manually:
     stripe trigger customer.subscription.created
  2. Verify: Webhook received without signature error
  3. Verify: Tenant.plan updated correctly
  4. Verify: Tenant.billingStatus updated
  ```

- [ ] Test webhook idempotency
  ```bash
  1. Send same webhook twice
  2. Verify: Tenant updated exactly once (idempotent)
  3. Verify: No duplicate charges/subscriptions
  ```

- [ ] Test webhook replay
  ```bash
  1. In Stripe Dashboard → Webhooks → Endpoint → Messages
  2. Find a failed event
  3. Click "Resend"
  4. Verify: Reprocessed without errors
  ```

### Manual Testing (Postman/Browser)

- [ ] Create checkout session
  ```bash
  curl -X POST http://localhost:3000/api/billing/checkout \
    -H "Authorization: Bearer <JWT>" \
    -H "Content-Type: application/json" \
    -d '{"plan":"PRO"}'
  
  Expected: 201 with { "url": "https://checkout.stripe.com/..." }
  ```

- [ ] Webhook endpoint is public
  ```bash
  curl -X POST http://localhost:3000/api/stripe/webhook \
    -H "stripe-signature: invalid" \
    -d '{"type":"customer.subscription.created"}'
  
  Expected: 400 (Invalid signature)
  ```

- [ ] Webhook endpoint is NOT accessible without signature
  ```bash
  curl -X POST http://localhost:3000/api/stripe/webhook \
    -d '{"type":"customer.subscription.created"}'
  
  Expected: 400 (Missing/Invalid signature)
  ```

- [ ] Rate limiting works
  ```bash
  for i in {1..5}; do
    curl -X POST http://localhost:3000/api/billing/checkout ...
  done
  
  Expected: 5th request returns 429 (Too Many Requests)
  ```

---

## 🚀 STAGING DEPLOYMENT

### 1. Environment Setup

```bash
# 1. Set staging environment variables
export NODE_ENV=staging
export STRIPE_SECRET_KEY=sk_test_...
export STRIPE_WEBHOOK_SECRET=whsec_test_...
export STRIPE_PRICE_BASIC_ID=price_...
export STRIPE_PRICE_PRO_ID=price_...
export STRIPE_PRICE_PREMIUM_ID=price_...

# 2. Run database migration
npx prisma migrate deploy

# 3. Generate Prisma client
npx prisma generate

# 4. Build application
npm run build

# 5. Run tests
npm run test

# 6. Deploy to staging platform
# (Vercel: git push staging-branch)
```

### 2. Staging Validation

```bash
# 1. Verify environment variables loaded
curl https://staging-api.com/api/health

# 2. Test checkout endpoint
curl -X POST https://staging-api.com/api/billing/checkout \
  -H "Authorization: Bearer <staging-jwt>" \
  -d '{"plan":"PRO"}'

# 3. Test webhook endpoint
# (Use Stripe Dashboard → Send test event)

# 4. Monitor logs
tail -f /var/log/app.log | grep BILLING

# 5. Check database
psql $DATABASE_URL -c "SELECT slug, plan, billingStatus FROM Tenant LIMIT 10;"
```

### 3. Staging Sign-Off

- [ ] Checkout endpoint returns valid URL
- [ ] Webhook signature verification working
- [ ] Tenant plan updated on webhook
- [ ] Rate limiting enforced
- [ ] Error logging working
- [ ] No sensitive data in logs

---

## 🌐 PRODUCTION DEPLOYMENT

### Phase 1: Prepare (1 hour)

- [ ] Create live Stripe products
- [ ] Update environment variables with live keys
- [ ] Database backup created
- [ ] Rollback plan documented

### Phase 2: Deploy (30 min)

```bash
# 1. Final database migration
npx prisma migrate deploy

# 2. Final build verification
npm run build

# 3. Run full test suite
npm run test

# 4. Deploy application
# (Vercel, AWS, etc.)
git push production
```

### Phase 3: Validate (30 min)

- [ ] Application health check passes
- [ ] Test checkout with live Stripe (test mode first!)
  ```bash
  curl -X POST https://api.production.com/api/billing/checkout \
    -H "Authorization: Bearer <prod-jwt>" \
    -d '{"plan":"PRO"}'
  ```

- [ ] Webhook endpoint registered in Stripe
  - URL: `https://api.production.com/api/stripe/webhook`
  - Events: All subscription + invoice events
  - Signing secret verified

- [ ] Error monitoring working
  - Sentry receiving errors
  - Alerts configured

- [ ] Database connection working
  - Queries executing
  - Backups scheduled

- [ ] Logs accessible
  - Can tail real-time logs
  - Billing events visible

### Phase 4: Monitor (24 hours)

```bash
# Continuous monitoring
- Webhook delivery status: 100% success rate
- Checkout error rate: < 1%
- API response time: < 1s
- Database query time: < 100ms
```

---

## 🔄 ROLLBACK PROCEDURES

### Scenario: Critical Bug in Billing

**If webhook processing broken** (affects all users)

```bash
# 1. Immediately (0 min)
   - Pause webhook delivery in Stripe Dashboard
   - Alert engineering team
   - Prepare rollback

# 2. Quick fix (5-10 min)
   - Fix code
   - Deploy fix
   - Resume webhooks

# 3. Or rollback (5 min)
   - Git revert to last working version
   - npm run build
   - Deploy previous release
   - Resume webhooks

# 4. Post-incident (30 min)
   - Replay missed webhooks from Stripe Dashboard
   - Verify all tenants have correct plan
   - Analyze root cause
   - Update code + tests
```

**If Stripe API keys compromised**

```bash
# 1. Revoke compromised keys in Stripe Dashboard
   - Go to API Keys
   - Mark as "revoked"

# 2. Generate new keys
   - Create new key pair
   - Update environment variables

# 3. Deploy immediately
   - git push production
   - Monitor for connectivity issues

# 4. Audit
   - Check Stripe activity log for unauthorized calls
   - Monitor for fraudulent subscriptions
```

**If database corrupted**

```bash
# 1. Use backup (within last 24h)
   - List backups: pg_basebackup --list
   - Restore from backup

# 2. Verify data integrity
   - SELECT count(*) FROM Tenant;
   - SELECT * FROM Tenant WHERE plan != 'FREE';

# 3. Replay webhooks
   - Stripe Dashboard → Webhooks → Resend all
   - Or manual script to sync with Stripe

# 4. Alert customers
   - "Brief outage, everything back to normal"
```

---

## 📊 SUCCESS METRICS

### Baseline (Week 1)

- [ ] 0% webhook failure rate
- [ ] 0% checkout errors
- [ ] 0% database errors
- [ ] 100% signature verification success

### Target (Month 1)

- [ ] 100% webhook delivery rate
- [ ] 95%+ checkout success rate
- [ ] < 1% error rate
- [ ] No security incidents

### Long-term (Quarter 1)

- [ ] MRR > $10k
- [ ] Churn rate < 10%
- [ ] < 5 min payment processing time
- [ ] 99.9% uptime

---

## 📞 SUPPORT & CONTACTS

### Stripe Support

- Dashboard: https://dashboard.stripe.com
- Docs: https://stripe.com/docs/billing
- Help: https://support.stripe.com

### On-Call Escalation

| Issue | Contact | Response Time |
|-------|---------|---|
| Webhook down | Engineering Lead | 5 min |
| Stripe API error | Stripe Support | 30 min |
| Database down | DevOps Lead | 10 min |
| Security incident | CTO | 2 min |

### Monitoring Dashboards

- Webhook delivery: https://dashboard.stripe.com/webhooks
- Error tracking: https://sentry.io/organizations/
- Application logs: https://your-logging-service.com

---

## ✅ DEPLOYMENT SIGN-OFF

- [ ] **Engineering Lead**: Code reviewed and approved
- [ ] **QA Lead**: All tests passing
- [ ] **DevOps Lead**: Infrastructure ready
- [ ] **Product Lead**: Feature approved
- [ ] **Security Lead**: Security audit passed
- [ ] **Finance Lead**: Pricing configured correctly

**Date Deployed**: _______________  
**Deployed By**: _______________  
**Version**: 1.0  

---

## 📝 POST-DEPLOYMENT NOTES

```
Date: _______________
Deployer: _______________
Issues: _______________
Resolutions: _______________
Lessons Learned: _______________
```

---

**Last Updated**: 2025-01-19  
**Maintained By**: Engineering Team
