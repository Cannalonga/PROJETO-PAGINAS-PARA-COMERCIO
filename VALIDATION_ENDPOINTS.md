# 🧪 ENDPOINT VALIDATION CHECKLIST

## ✅ INSTRUCTIONS

Use **VSCode REST Client** or **Thunder Client** to test these endpoints.

All endpoints require:
- `Authorization: Bearer {token}` (get token from login)
- `Content-Type: application/json`
- `X-Tenant-ID: {tenantId}` (for protected endpoints)

---

## 1️⃣ AUTHENTICATION

### Login
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "token": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": "...",
    "email": "admin@example.com"
  }
}
```

---

## 2️⃣ PAGES MANAGEMENT

### List Pages
```http
GET http://localhost:3000/api/protected/pages
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}
```

**Expected:** 200 OK with pages array

### Create Page
```http
POST http://localhost:3000/api/protected/pages
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}
Content-Type: application/json

{
  "title": "Minha Primeira Página",
  "slug": "minha-primeira-pagina",
  "description": "Descrição da página",
  "blocks": []
}
```

**Expected:** 201 Created with new page object

### Get Page Details
```http
GET http://localhost:3000/api/protected/pages/{pageId}
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}
```

**Expected:** 200 OK with page details

### Update Page
```http
PUT http://localhost:3000/api/protected/pages/{pageId}
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}
Content-Type: application/json

{
  "title": "Título Atualizado",
  "blocks": [
    {
      "id": "block-1",
      "type": "heading",
      "content": { "text": "Bem-vindo" },
      "order": 0
    }
  ]
}
```

**Expected:** 200 OK with updated page

### Delete Page
```http
DELETE http://localhost:3000/api/protected/pages/{pageId}
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}
```

**Expected:** 204 No Content

---

## 3️⃣ TEMPLATES

### List Templates
```http
GET http://localhost:3000/api/protected/templates
Authorization: Bearer {token}
```

**Expected:** 200 OK with templates array

### Create Template
```http
POST http://localhost:3000/api/protected/templates
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}
Content-Type: application/json

{
  "name": "Template E-commerce",
  "category": "loja",
  "html": "<div>{{heading}}</div><p>{{description}}</p>",
  "css": "div { color: blue; }",
  "variables": [
    {
      "name": "heading",
      "type": "string",
      "required": true,
      "description": "Título principal"
    },
    {
      "name": "description",
      "type": "string",
      "required": false,
      "description": "Descrição"
    }
  ]
}
```

**Expected:** 201 Created

---

## 4️⃣ PUBLISHING

### Publish Page
```http
POST http://localhost:3000/api/protected/pages/{pageId}/publish
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}
Content-Type: application/json

{
  "message": "Publishing v1"
}
```

**Expected:** 200 OK with published page info

---

## 5️⃣ ANALYTICS

### Get Analytics
```http
GET http://localhost:3000/api/protected/analytics?pageId={pageId}&days=7
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}
```

**Expected:** 200 OK with analytics data

### Record Event
```http
POST http://localhost:3000/api/protected/analytics
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}
Content-Type: application/json

{
  "eventType": "PAGE_VIEW",
  "pageId": "{pageId}",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "referrer": "google.com"
  }
}
```

**Expected:** 201 Created

---

## ✅ VALIDATION CHECKLIST

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| Login | POST | ⏳ | Test first to get token |
| List Pages | GET | ⏳ | Should return array |
| Create Page | POST | ⏳ | Should return 201 |
| Get Page | GET | ⏳ | Use ID from Create |
| Update Page | PUT | ⏳ | Should update fields |
| Delete Page | DELETE | ⏳ | Should return 204 |
| List Templates | GET | ⏳ | Should return array |
| Create Template | POST | ⏳ | Should return 201 |
| Publish Page | POST | ⏳ | Should set published status |
| Get Analytics | GET | ⏳ | Should return metrics |
| Record Event | POST | ⏳ | Should track event |

---

## 🎯 QUICK TEST SEQUENCE

1. **Login** to get token
   - Copy `token` value
   - Use in next requests

2. **Create Page** to get pageId
   - Use token from step 1
   - Copy `id` value

3. **Get Page** to verify creation
   - Use pageId from step 2

4. **Update Page** to add blocks
   - Modify title or blocks

5. **Publish Page** to publish
   - Set status to PUBLISHED

6. **Get Analytics** to verify tracking

7. **Record Event** to test analytics
   - POST a PAGE_VIEW event

8. **Delete Page** to cleanup
   - Should return 204

---

## 📊 EXPECTED RESULTS

✅ All endpoints return correct status codes  
✅ All responses contain expected fields  
✅ Multi-tenant isolation working (X-Tenant-ID)  
✅ Authentication required (401 without token)  
✅ Proper error messages (400, 404, 500)  

---

## 🚀 IF ALL TESTS PASS

- ✅ Backend: 100% functional
- ✅ API: 21/21 endpoints working
- ✅ Multi-tenant: Isolation verified
- ✅ Security: JWT tokens working
- ✅ Data: Create/Read/Update/Delete working

**Status: READY FOR PRODUCTION** ✅
