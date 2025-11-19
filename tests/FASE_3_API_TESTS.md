# API Testing Guide - Fase 3 Sprint 1

## Base URL
```
http://localhost:3000
```

## Authentication
All protected endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

## Test Scenarios

### 1. Authentication Flow

#### 1.1 Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "SecurePass123!",
  "tenantId": "tenant-1"
}

Expected: 200 OK
Response: { token, user }
```

#### 1.2 Verify Token
```http
POST /api/auth/verify
Content-Type: application/json

{
  "token": "eyJhbGc..."
}

Expected: 200 OK
Response: { valid: true, userId, email, tenantId, role }
```

#### 1.3 Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json
Authorization: Bearer <TOKEN>

{
  "token": "eyJhbGc..."
}

Expected: 200 OK
Response: { token }
```

#### 1.4 Logout
```http
POST /api/auth/logout
Authorization: Bearer <TOKEN>

Expected: 200 OK
Response: { message: "Logged out successfully" }
```

### 2. User Management

#### 2.1 List Users
```http
GET /api/protected/users
Authorization: Bearer <TOKEN>
x-tenant-id: tenant-1

Expected: 200 OK
Response: [{ id, email, firstName, lastName, role, isActive, createdAt }]
```

#### 2.2 Create User
```http
POST /api/protected/users
Content-Type: application/json
Authorization: Bearer <TOKEN>
x-tenant-id: tenant-1

{
  "email": "newuser@example.com",
  "firstName": "João",
  "lastName": "Silva",
  "password": "SecurePass123!",
  "role": "CLIENTE_USER"
}

Expected: 201 Created
Response: { id, email, firstName, lastName, role, isActive, createdAt }
```

### 3. Tenant Management

#### 3.1 List Tenants
```http
GET /api/protected/tenants
Authorization: Bearer <TOKEN>
x-user-id: user-1

Expected: 200 OK
Response: { id, slug, name, status, logoUrl, createdAt }
```

#### 3.2 Create Tenant
```http
POST /api/protected/tenants
Content-Type: application/json
Authorization: Bearer <TOKEN>
x-user-id: user-1

{
  "name": "Minha Loja",
  "slug": "minha-loja",
  "email": "contact@minha-loja.com",
  "phone": "(11) 9999-9999"
}

Expected: 201 Created
Response: { id, slug, name, status, email, phone, createdAt }
```

#### 3.3 Get Tenant Details
```http
GET /api/protected/tenants/tenant-1
Authorization: Bearer <TOKEN>
x-user-id: user-1

Expected: 200 OK
Response: { id, slug, name, status, email, phone, address, city, state, logoUrl, customDomain, createdAt, updatedAt }
```

#### 3.4 Update Tenant
```http
PUT /api/protected/tenants/tenant-1
Content-Type: application/json
Authorization: Bearer <TOKEN>

{
  "name": "Minha Loja Atualizada",
  "email": "newemail@example.com"
}

Expected: 200 OK
Response: { id, slug, name, status, email, phone, address, city, state, logoUrl, customDomain, createdAt, updatedAt }
```

#### 3.5 Delete Tenant
```http
DELETE /api/protected/tenants/tenant-1
Authorization: Bearer <TOKEN>

Expected: 200 OK
Response: { message: "Tenant deleted successfully" }
```

### 4. Page Management

#### 4.1 List Pages
```http
GET /api/protected/pages
Authorization: Bearer <TOKEN>
x-tenant-id: tenant-1

Expected: 200 OK
Response: [{ id, title, slug, status, createdAt, updatedAt, publishedAt }]
```

#### 4.2 Create Page
```http
POST /api/protected/pages
Content-Type: application/json
Authorization: Bearer <TOKEN>
x-tenant-id: tenant-1

{
  "title": "Página Inicial",
  "slug": "pagina-inicial",
  "template": "loja",
  "description": "Home page da minha loja"
}

Expected: 201 Created
Response: { id, title, slug, template, status, createdAt, updatedAt }
```

#### 4.3 Get Page Details
```http
GET /api/protected/pages/page-1
Authorization: Bearer <TOKEN>
x-tenant-id: tenant-1

Expected: 200 OK
Response: { id, title, slug, status, content, createdAt, updatedAt, publishedAt }
```

#### 4.4 Update Page
```http
PUT /api/protected/pages/page-1
Content-Type: application/json
Authorization: Bearer <TOKEN>

{
  "title": "Página Inicial Atualizada",
  "description": "Updated description",
  "content": [
    {
      "id": "block-1",
      "type": "heading",
      "content": { "text": "Welcome!" },
      "order": 0
    }
  ]
}

Expected: 200 OK
Response: { id, title, slug, status, content, createdAt, updatedAt }
```

#### 4.5 Publish Page
```http
POST /api/protected/pages/page-1/publish
Content-Type: application/json
Authorization: Bearer <TOKEN>

{
  "message": "Publishing v1.0"
}

Expected: 200 OK
Response: { id, title, slug, status: "PUBLISHED", publishedAt, message }
```

#### 4.6 Delete Page
```http
DELETE /api/protected/pages/page-1
Authorization: Bearer <TOKEN>

Expected: 200 OK
Response: { message: "Page deleted successfully" }
```

### 5. Template Management

#### 5.1 List Templates
```http
GET /api/protected/templates
Authorization: Bearer <TOKEN>

Expected: 200 OK
Response: [{ id, name, description, category, thumbnail, variables }]
```

#### 5.1.1 List Templates by Category
```http
GET /api/protected/templates?category=loja
Authorization: Bearer <TOKEN>

Expected: 200 OK
Response: [{ id, name, description, category: "loja", thumbnail, variables }]
```

#### 5.2 Create Template
```http
POST /api/protected/templates
Content-Type: application/json
Authorization: Bearer <TOKEN>
x-tenant-id: tenant-1
x-user-role: OPERADOR

{
  "name": "Store Template",
  "category": "loja",
  "description": "Template for retail stores",
  "html": "<div>{{storeName}}</div><p>{{description}}</p>",
  "css": "body { font-family: Arial; }",
  "variables": [
    {
      "name": "storeName",
      "type": "string",
      "required": true,
      "description": "Name of the store"
    }
  ]
}

Expected: 201 Created
Response: { id, name, category, createdAt }
```

### 6. Analytics

#### 6.1 Get Analytics
```http
GET /api/protected/analytics?pageId=page-1&days=7
Authorization: Bearer <TOKEN>
x-tenant-id: tenant-1

Expected: 200 OK
Response: {
  totalViews: 1250,
  uniqueVisitors: 342,
  avgSessionDuration: 285,
  bounceRate: 42.5,
  topPages: [{ slug, views, clicks }],
  topReferrers: [{ referrer, views }],
  deviceBreakdown: { mobile, desktop, tablet },
  events: [{ date, views, clicks, submissions }]
}
```

#### 6.2 Record Event
```http
POST /api/protected/analytics
Content-Type: application/json
Authorization: Bearer <TOKEN>
x-tenant-id: tenant-1

{
  "pageId": "page-1",
  "eventType": "BUTTON_CLICK",
  "eventData": { "buttonId": "cta-button" }
}

Expected: 201 Created
Response: { message: "Event recorded successfully" }
```

## Error Responses

### 400 Bad Request
```json
{ "error": "Missing required fields" }
```

### 401 Unauthorized
```json
{ "error": "Invalid credentials" }
```

### 403 Forbidden
```json
{ "error": "Insufficient permissions" }
```

### 404 Not Found
```json
{ "error": "Resource not found" }
```

### 409 Conflict
```json
{ "error": "Resource already exists" }
```

### 500 Internal Server Error
```json
{ "error": "Internal server error" }
```

## Headers

All requests should include:
- `x-correlation-id`: UUID for tracing (auto-generated if not provided)
- `Authorization`: Bearer token for protected endpoints
- `Content-Type`: application/json (for POST/PUT)
- `x-tenant-id`: Tenant ID (for tenant-scoped endpoints)
- `x-user-id`: User ID (for user-specific operations)
- `x-user-role`: User role (for permission checks)

## Testing with cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"SecurePass123!","tenantId":"tenant-1"}'

# Get Pages
curl -X GET http://localhost:3000/api/protected/pages \
  -H "Authorization: Bearer <TOKEN>" \
  -H "x-tenant-id: tenant-1"

# Create Page
curl -X POST http://localhost:3000/api/protected/pages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "x-tenant-id: tenant-1" \
  -d '{"title":"Home","slug":"home","template":"loja"}'
```

## Testing with Postman

1. Import the collection from `tests/postman-collection.json`
2. Set environment variables:
   - `base_url`: http://localhost:3000
   - `token`: <JWT_TOKEN>
   - `tenant_id`: tenant-1
3. Run the test collection

## Continuous Testing

Run the automated test suite:
```bash
npm run test:api
```

Expected output:
```
✓ 50+ test scenarios passing
✓ 100% endpoint coverage
✓ All validation rules enforced
✓ Security checks passing
```
