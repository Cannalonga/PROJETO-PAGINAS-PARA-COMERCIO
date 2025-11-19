# Week 2 Implementation Issues

## Template for GitHub Issues
Copy-paste each issue to GitHub Issues tab

---

### ISSUE #1: Day 1 - User Management: GET All Users with Tenant Scope

**Title:** `feat(users): GET /api/users - List all users (tenant-scoped)`

**Labels:** `enhancement`, `week2`, `day1`, `api`

**Assignees:** @Cannalonga

**Body:**

```markdown
## Description
Implement GET endpoint to list all users within a tenant scope.
Authenticated users should only see users from their own tenant.

## Requirements
- [x] Endpoint: `GET /api/users`
- [x] Query params: `?skip=0&take=10&role=admin` (optional filters)
- [x] Tenant isolation: Only show users from authenticated user's tenant
- [x] Response pagination: { data: User[], total: number }
- [x] Error handling: 403 if tenant mismatch, 400 invalid params
- [x] Audit logging: Log access attempt

## Implementation Checklist
- [ ] Add route handler `/api/users/route.ts`
- [ ] Apply middleware: auth → role → tenant-isolation → rate-limit
- [ ] Validate query with Zod (skip, take, role filters)
- [ ] Query Prisma with tenant filter
- [ ] Log to audit table
- [ ] Write unit tests
- [ ] Test manually with curl/Postman

## Acceptance Criteria
- [ ] GET /api/users returns 200 with paginated users
- [ ] Unauthenticated request returns 401
- [ ] User from Tenant A cannot see users from Tenant B
- [ ] Admin can filter by role
- [ ] Audit log shows all accesses

## Security Notes
- Tenant isolation via middleware (withTenantIsolation)
- Rate limit: 100 requests/min (api preset)
- PII masking in logs (email, phone)

## Related Issues
- #2 (GET user by ID)
- #3 (POST create user)
```

---

### ISSUE #2: Day 1 - User Management: GET User by ID

**Title:** `feat(users): GET /api/users/[id] - Get user details`

**Labels:** `enhancement`, `week2`, `day1`, `api`

**Assignees:** @Cannalonga

**Body:**

```markdown
## Description
Implement GET endpoint to retrieve a specific user by ID within tenant scope.

## Requirements
- [x] Endpoint: `GET /api/users/[id]`
- [x] Path param: `id` (user UUID)
- [x] Tenant isolation: User must own the tenant or be admin
- [x] Return: Full User object with relations (if needed)
- [x] Error handling: 404 if not found, 403 if forbidden

## Implementation Checklist
- [ ] Add route handler `/api/users/[id]/route.ts`
- [ ] Apply middleware: auth → role → tenant-isolation → rate-limit
- [ ] Validate ID with Zod (UUID format)
- [ ] Query Prisma with tenant filter
- [ ] Log access to audit table
- [ ] Mask PII in logs
- [ ] Write unit tests

## Acceptance Criteria
- [ ] GET /api/users/123 returns 200 with user data
- [ ] GET /api/users/invalid-id returns 400
- [ ] GET /api/users/other-tenant-user returns 403
- [ ] Audit log shows access attempt

## Related Issues
- #1 (GET all users)
- #3 (POST create user)
```

---

### ISSUE #3: Day 2 - User Management: POST Create User

**Title:** `feat(users): POST /api/users - Create new user`

**Labels:** `enhancement`, `week2`, `day2`, `api`

**Assignees:** @Cannalonga

**Body:**

```markdown
## Description
Implement POST endpoint to create a new user in a tenant.
Only tenant owners and admins can create users.

## Requirements
- [x] Endpoint: `POST /api/users`
- [x] Body: { email, firstName, lastName, role, password }
- [x] Tenant isolation: User must be owner/admin of tenant
- [x] Validation: Email unique per tenant, password minimum 8 chars
- [x] Hash password with bcrypt (12 rounds)
- [x] Send welcome email (async, queue)
- [x] Return: Created User object
- [x] Error handling: 400 validation, 403 forbidden, 409 duplicate

## Implementation Checklist
- [ ] Add route handler `/api/users/route.ts` POST method
- [ ] Apply middleware: auth → role(owner,admin) → tenant-isolation → rate-limit
- [ ] Validate body with Zod schema
- [ ] Check email uniqueness per tenant
- [ ] Hash password with bcryptjs
- [ ] Create user in Prisma
- [ ] Queue welcome email job
- [ ] Log to audit table (password redacted)
- [ ] Write unit tests with mocks

## Acceptance Criteria
- [ ] POST /api/users creates user and returns 201
- [ ] Invalid email returns 400
- [ ] Duplicate email in tenant returns 409
- [ ] Weak password returns 400
- [ ] Non-owner/admin returns 403
- [ ] Audit log shows creation (password masked)

## Security Notes
- Password hashed with bcrypt 12 rounds
- Email unique per tenant (composite index)
- PII masked in audit logs
- Rate limit: 5 requests/15 min (auth preset)

## Related Issues
- #1, #2 (GET users)
- #4 (PUT update user)
```

---

### ISSUE #4: Day 2 - User Management: PUT Update User

**Title:** `feat(users): PUT /api/users/[id] - Update user details`

**Labels:** `enhancement`, `week2`, `day2`, `api`

**Assignees:** @Cannalonga

**Body:**

```markdown
## Description
Implement PUT endpoint to update user details.
Users can update themselves; admins can update any user in their tenant.

## Requirements
- [x] Endpoint: `PUT /api/users/[id]`
- [x] Body: { firstName?, lastName?, role?, email? }
- [x] Authorization: Self or admin/owner of tenant
- [x] Validation: Email unique per tenant
- [x] Return: Updated User object
- [x] Log changes to audit table

## Implementation Checklist
- [ ] Add route handler `/api/users/[id]/route.ts` PUT method
- [ ] Apply middleware: auth → tenant-isolation → rate-limit
- [ ] Validate body with Zod (partial schema)
- [ ] Check authorization (self or admin)
- [ ] Update Prisma record
- [ ] Log oldValues and newValues to audit
- [ ] Mask PII in logs
- [ ] Write unit tests

## Acceptance Criteria
- [ ] PUT /api/users/123 updates and returns 200
- [ ] User can update their own profile
- [ ] Admin can update any user in tenant
- [ ] Non-admin cannot update others' profiles
- [ ] Duplicate email returns 409
- [ ] Audit log shows before/after values

## Related Issues
- #3 (POST create user)
- #5 (DELETE user)
```

---

### ISSUE #5: Day 2 - User Management: DELETE User

**Title:** `feat(users): DELETE /api/users/[id] - Delete user`

**Labels:** `enhancement`, `week2`, `day2`, `api`

**Assignees:** @Cannalonga

**Body:**

```markdown
## Description
Implement DELETE endpoint to remove a user.
Only tenant owners and admins can delete users.

## Requirements
- [x] Endpoint: `DELETE /api/users/[id]`
- [x] Authorization: Owner/admin only
- [x] Soft delete or hard delete (decide)
- [x] Cancel pending invites/tokens
- [x] Return: 204 No Content
- [x] Log deletion to audit table

## Implementation Checklist
- [ ] Add route handler `/api/users/[id]/route.ts` DELETE method
- [ ] Apply middleware: auth → role(owner,admin) → tenant-isolation → rate-limit
- [ ] Check authorization
- [ ] Soft-delete or mark as deleted
- [ ] Cancel active sessions/tokens
- [ ] Log deletion to audit
- [ ] Write unit tests

## Acceptance Criteria
- [ ] DELETE /api/users/123 returns 204
- [ ] Non-admin cannot delete users
- [ ] User cannot delete themselves
- [ ] Audit log shows deletion
- [ ] Cannot login after deletion

## Related Issues
- #4 (PUT update user)
- #6 (Password change endpoint)
```

---

### ISSUE #6: Day 2 - User Management: POST Change Password

**Title:** `feat(users): POST /api/users/[id]/change-password - Change user password`

**Labels:** `enhancement`, `week2`, `day2`, `auth`

**Assignees:** @Cannalonga

**Body:**

```markdown
## Description
Implement endpoint to change user password.
User must provide current password to change to new password.

## Requirements
- [x] Endpoint: `POST /api/users/[id]/change-password`
- [x] Body: { currentPassword, newPassword, confirmPassword }
- [x] Verify current password is correct
- [x] Validate new password (min 8 chars, complexity)
- [x] Hash with bcrypt (12 rounds)
- [x] Invalidate all active sessions
- [x] Send email notification
- [x] Return: 200 success

## Implementation Checklist
- [ ] Add route handler `/api/users/[id]/change-password/route.ts`
- [ ] Apply middleware: auth → tenant-isolation → rate-limit
- [ ] Validate both passwords provided
- [ ] Compare currentPassword with stored hash
- [ ] Validate new password meets criteria
- [ ] Hash new password
- [ ] Update Prisma
- [ ] Invalidate sessions (via NextAuth or JWT blacklist)
- [ ] Queue notification email
- [ ] Log to audit (passwords redacted)

## Acceptance Criteria
- [ ] POST returns 200 on success
- [ ] Wrong current password returns 401
- [ ] Weak new password returns 400
- [ ] User logged out after change (all sessions invalid)
- [ ] Audit log shows change attempt (not actual passwords)

## Security Notes
- Rate limit: 5 requests/15 min
- Passwords never logged (always redacted)
- All sessions invalidated
- Email confirmation sent

## Related Issues
- #5 (DELETE user)
```

---

### ISSUE #7: Day 3 - Tenant Management: GET All Tenants

**Title:** `feat(tenants): GET /api/tenants - List user's tenants`

**Labels:** `enhancement`, `week2`, `day3`, `api`

**Assignees:** @Cannalonga

**Body:**

```markdown
## Description
Implement GET endpoint to list all tenants a user belongs to.

## Requirements
- [x] Endpoint: `GET /api/tenants`
- [x] Return: TenantMembership[] with tenant details
- [x] Pagination: skip, take params
- [x] Filters: status, role (optional)

## Implementation Checklist
- [ ] Add route handler `/api/tenants/route.ts`
- [ ] Middleware stack applied
- [ ] Query TenantMembership with user filter
- [ ] Paginate results
- [ ] Log access to audit
- [ ] Unit tests

## Acceptance Criteria
- [ ] Returns list of user's tenants
- [ ] Only shows owned/admin/member tenants
- [ ] Pagination works
```

---

### ISSUE #8: Day 3 - Tenant Management: GET Tenant by ID

**Title:** `feat(tenants): GET /api/tenants/[id] - Get tenant details`

**Labels:** `enhancement`, `week2`, `day3`, `api`

**Assignees:** @Cannalonga

---

### ISSUE #9: Day 4 - Tenant Management: PUT Update Tenant

**Title:** `feat(tenants): PUT /api/tenants/[id] - Update tenant`

**Labels:** `enhancement`, `week2`, `day4`, `api`

**Assignees:** @Cannalonga

---

### ISSUE #10: Day 5 - Pages Management: GET All Pages

**Title:** `feat(pages): GET /api/pages - List pages for tenant`

**Labels:** `enhancement`, `week2`, `day5`, `api`

**Assignees:** @Cannalonga

---

### ISSUE #11: Day 5 - Pages Management: POST Create Page

**Title:** `feat(pages): POST /api/pages - Create new page`

**Labels:** `enhancement`, `week2`, `day5`, `api`

**Assignees:** @Cannalonga

---

### ISSUE #12: Day 6 - Pages Management: PUT Update Page + DELETE Page

**Title:** `feat(pages): PUT/DELETE /api/pages/[id] - Update and delete pages`

**Labels:** `enhancement`, `week2`, `day6`, `api`

**Assignees:** @Cannalonga

---

## How to Import These Issues

1. Copy each issue body
2. Go to GitHub repo → Issues → New Issue
3. Paste title and body
4. Add labels and assignees
5. Create Issue

Or use GitHub CLI:
```bash
gh issue create --title "..." --body "..." --label "enhancement" --label "week2"
```

## Progress Tracking

Use this checklist to track Week 2 progress:

- [ ] Day 1 complete (2 issues: GET all, GET by ID)
- [ ] Day 2 complete (3 issues: POST, PUT, DELETE)
- [ ] Day 3 complete (tenants)
- [ ] Day 4 complete (tenants cont)
- [ ] Day 5 complete (pages)
- [ ] Day 6 complete (pages cont)
- [ ] Day 7 complete (testing)
