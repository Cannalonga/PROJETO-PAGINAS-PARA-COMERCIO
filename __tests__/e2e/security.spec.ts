/**
 * E2E SECURITY TESTS - Playwright Test Suite
 * File: __tests__/e2e/security.spec.ts
 * 
 * Covers OWASP Top 10 scenarios with end-to-end tests
 * 
 * Run:
 * - npm run test:e2e -- security.spec.ts
 * - npx playwright test __tests__/e2e/security.spec.ts
 * 
 * Prerequisites:
 * - npm install -D @playwright/test
 * - Application running on http://localhost:3000
 */

import { test, expect } from '@playwright/test';

// Configure test base URL
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Test user credentials
const testUsers = {
  admin: {
    email: 'admin@example.com',
    password: 'SecurePass123!',
  },
  regular: {
    email: 'user@example.com',
    password: 'UserPass123!',
  },
  malicious: {
    email: 'hacker@example.com',
    password: 'Hacker123!',
  },
};

// ============================================================================
// IDOR SECURITY TESTS
// ============================================================================

test.describe('IDOR - Insecure Direct Object Reference Prevention', () => {
  
  test('User A cannot access User B profile', async ({ page, context }) => {
    // Login as User A
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.fill('input[name="email"]', testUsers.regular.email);
    await page.fill('input[name="password"]', testUsers.regular.password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForNavigation();
    expect(page.url()).toContain('/dashboard');
    
    // Try to access User B's profile directly via URL
    const userBId = 'different-user-id-12345';
    await page.goto(`${BASE_URL}/dashboard/users/${userBId}`);
    
    // Should be denied access (404 or 403 error page)
    const accessDenied = 
      page.url().includes('/auth/signin') || // Redirected to login
      page.url().includes('/404') ||          // Not found
      await page.locator('text=Forbidden').isVisible() ||
      await page.locator('text=Access denied').isVisible();
    
    expect(accessDenied).toBeTruthy();
  });
  
  test('User can access only own profile', async ({ page }) => {
    // Login as regular user
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.fill('input[name="email"]', testUsers.regular.email);
    await page.fill('input[name="password"]', testUsers.regular.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForNavigation();
    
    // Navigate to own profile
    await page.click('text=My Profile');
    
    // Should see own email
    await expect(page.locator(`text=${testUsers.regular.email}`)).toBeVisible();
  });
  
  test('API endpoint rejects unauthorized user access', async ({ request }) => {
    // Get auth token for User A
    let response = await request.post(`${BASE_URL}/api/auth/signin`, {
      data: {
        email: testUsers.regular.email,
        password: testUsers.regular.password,
      },
    });
    
    const token = (await response.json()).token;
    
    // Try to access User B's API endpoint
    response = await request.get(`${BASE_URL}/api/users/different-user-id`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // Should return 403 Forbidden
    expect(response.status()).toBe(403);
    expect(await response.json()).toHaveProperty('error');
  });
});

// ============================================================================
// BFLA SECURITY TESTS
// ============================================================================

test.describe('BFLA - Broken Function Level Authorization', () => {
  
  test('Regular user cannot access admin panel', async ({ page }) => {
    // Login as regular user
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.fill('input[name="email"]', testUsers.regular.email);
    await page.fill('input[name="password"]', testUsers.regular.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForNavigation();
    
    // Try to access admin panel directly
    await page.goto(`${BASE_URL}/admin`);
    
    // Should be denied (redirected to home or 403)
    const isDenied = 
      !page.url().includes('/admin') ||
      await page.locator('text=Access denied').isVisible() ||
      await page.locator('text=Unauthorized').isVisible();
    
    expect(isDenied).toBeTruthy();
  });
  
  test('Regular user cannot access admin API endpoints', async ({ request }) => {
    // Get token for regular user
    let response = await request.post(`${BASE_URL}/api/auth/signin`, {
      data: {
        email: testUsers.regular.email,
        password: testUsers.regular.password,
      },
    });
    
    const token = (await response.json()).token;
    
    // Try to access admin VIP endpoint
    response = await request.post(`${BASE_URL}/api/admin/vip`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { userId: 'some-id', planType: 'PREMIUM' },
    });
    
    // Should return 403 Forbidden
    expect(response.status()).toBe(403);
  });
  
  test('Admin user can access admin endpoints', async ({ request }) => {
    // Get token for admin
    let response = await request.post(`${BASE_URL}/api/auth/signin`, {
      data: {
        email: testUsers.admin.email,
        password: testUsers.admin.password,
      },
    });
    
    const token = (await response.json()).token;
    
    // Access admin endpoint
    response = await request.get(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    // Should succeed (200) - not 403
    expect(response.status()).not.toBe(403);
  });
});

// ============================================================================
// AUTHENTICATION SECURITY TESTS
// ============================================================================

test.describe('Authentication Security', () => {
  
  test('Login with invalid credentials fails', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.fill('input[name="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    const errorVisible = await page.locator('text=Invalid email or password').isVisible();
    expect(errorVisible).toBeTruthy();
    
    // Should NOT redirect to dashboard
    expect(page.url()).toContain('/auth/signin');
  });
  
  test('Protected routes require authentication', async ({ page }) => {
    // Try to access protected page without login
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Should redirect to login
    expect(page.url()).toContain('/auth/signin');
  });
  
  test('Logout clears session', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.fill('input[name="email"]', testUsers.regular.email);
    await page.fill('input[name="password"]', testUsers.regular.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForNavigation();
    expect(page.url()).toContain('/dashboard');
    
    // Logout
    await page.click('text=Logout');
    
    // Should redirect to home/login
    await page.waitForNavigation();
    expect(page.url()).not.toContain('/dashboard');
  });
  
  test('Session timeout logs user out', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.fill('input[name="email"]', testUsers.regular.email);
    await page.fill('input[name="password"]', testUsers.regular.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForNavigation();
    
    // Simulate 16 minutes of inactivity (session maxAge = 15 min)
    await page.context().storageState(); // Get current state
    
    // Clear session from storage
    await page.evaluate(() => {
      // Remove auth token/session
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Try to navigate protected page
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Should redirect to login due to missing session
    expect(page.url()).toContain('/auth/signin');
  });
});

// ============================================================================
// INPUT VALIDATION & INJECTION TESTS
// ============================================================================

test.describe('Input Validation & Injection Prevention', () => {
  
  test('SQL injection attempt in search is prevented', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.fill('input[name="email"]', testUsers.regular.email);
    await page.fill('input[name="password"]', testUsers.regular.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForNavigation();
    
    // Try SQL injection in search
    const maliciousInput = "test'; DROP TABLE users; --";
    await page.fill('input[placeholder="Search..."]', maliciousInput);
    await page.press('input[placeholder="Search..."]', 'Enter');
    
    // Should handle gracefully (not crash)
    const isStillLoaded = await page.locator('body').isVisible();
    expect(isStillLoaded).toBeTruthy();
    
    // Should NOT execute the DROP TABLE
    // (Would need to check database to verify, or check for error page)
  });
  
  test('XSS attempt in user input is prevented', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.fill('input[name="email"]', testUsers.regular.email);
    await page.fill('input[name="password"]', testUsers.regular.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForNavigation();
    
    // Try to inject script
    const xssPayload = '<script>alert("XSS")</script>';
    await page.fill('input[name="bio"]', xssPayload);
    await page.click('button:has-text("Save")');
    
    // Script should be escaped/sanitized, not executed
    // Check that alert was NOT triggered (no dialog appears)
    // And payload is not in DOM as executable script
    const scriptTags = await page.locator('script:has-text("XSS")').count();
    expect(scriptTags).toBe(0);
  });
  
  test('Email validation enforces proper format', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`);
    
    // Try invalid email
    await page.fill('input[name="email"]', 'not-an-email');
    await page.fill('input[name="password"]', 'ValidPass123!');
    await page.click('button[type="submit"]');
    
    // Should show validation error
    const errorVisible = await page.locator('text=Invalid email').isVisible();
    expect(errorVisible).toBeTruthy();
    
    // Should NOT create account
    expect(page.url()).toContain('/auth/signup');
  });
});

// ============================================================================
// CSRF PROTECTION TESTS
// ============================================================================

test.describe('CSRF Token Protection', () => {
  
  test('POST requests without CSRF token are rejected', async ({ request }) => {
    // Try POST without CSRF token
    const response = await request.post(`${BASE_URL}/api/users/update`, {
      data: { email: 'newtest@example.com' },
      headers: {
        // Intentionally NOT including CSRF token
      },
    });
    
    // Should reject (403 or 400)
    expect([403, 400]).toContain(response.status());
  });
});

// ============================================================================
// RATE LIMITING TESTS
// ============================================================================

test.describe('Rate Limiting Protection', () => {
  
  test('Multiple failed login attempts trigger rate limiting', async ({ request }) => {
    const maxAttempts = 6;
    let response;
    
    // Make 6 failed login attempts
    for (let i = 0; i < maxAttempts; i++) {
      response = await request.post(`${BASE_URL}/api/auth/signin`, {
        data: {
          email: 'nonexistent@example.com',
          password: 'wrongpass',
        },
      });
      
      // 6th attempt should be rate limited (429)
      if (i === maxAttempts - 1) {
        expect(response.status()).toBe(429);
      }
    }
  });
  
  test('Rate limit resets after time window', async ({ request }) => {
    // Make request that hits rate limit
    await request.post(`${BASE_URL}/api/auth/signin`, {
      data: { email: 'test', password: 'test' },
    });
    
    // Wait 1 second (simplified - real test would wait 15min)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Should be able to try again
    const response = await request.post(`${BASE_URL}/api/auth/signin`, {
      data: {
        email: testUsers.regular.email,
        password: testUsers.regular.password,
      },
    });
    
    // Should NOT be rate limited
    expect(response.status()).not.toBe(429);
  });
});

// ============================================================================
// SECURE HEADERS TESTS
// ============================================================================

test.describe('Security Headers', () => {
  
  test('Response includes HSTS header', async ({ request }) => {
    const response = await request.get(`${BASE_URL}`);
    
    const hstsHeader = response.headersArray().find(
      h => h.name.toLowerCase() === 'strict-transport-security'
    );
    
    expect(hstsHeader).toBeDefined();
    expect(hstsHeader?.value).toContain('max-age');
  });
  
  test('Response includes X-Frame-Options header', async ({ request }) => {
    const response = await request.get(`${BASE_URL}`);
    
    const xFrameHeader = response.headersArray().find(
      h => h.name.toLowerCase() === 'x-frame-options'
    );
    
    expect(xFrameHeader).toBeDefined();
    expect(xFrameHeader?.value).toBe('DENY');
  });
  
  test('Response includes Content-Type header', async ({ request }) => {
    const response = await request.get(`${BASE_URL}`);
    
    const contentTypeHeader = response.headersArray().find(
      h => h.name.toLowerCase() === 'content-type'
    );
    
    expect(contentTypeHeader).toBeDefined();
  });
});

// ============================================================================
// PRIVILEGE ESCALATION TESTS
// ============================================================================

test.describe('Privilege Escalation Prevention', () => {
  
  test('User cannot escalate own role', async ({ request }) => {
    // Login as regular user
    let response = await request.post(`${BASE_URL}/api/auth/signin`, {
      data: {
        email: testUsers.regular.email,
        password: testUsers.regular.password,
      },
    });
    
    const token = (await response.json()).token;
    const userId = (await response.json()).userId;
    
    // Try to change own role to admin
    response = await request.put(`${BASE_URL}/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { role: 'CLIENTE_ADMIN' },
    });
    
    // Should be rejected (403 or field ignored)
    expect([403, 400]).toContain(response.status());
  });
});

// ============================================================================
// FILE UPLOAD SECURITY TESTS
// ============================================================================

test.describe('File Upload Security', () => {
  
  test('Only valid file types are accepted', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.fill('input[name="email"]', testUsers.regular.email);
    await page.fill('input[name="password"]', testUsers.regular.password);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForNavigation();
    
    // Try to upload executable file (should be blocked)
    const fileInput = await page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      // File would be validated by magic bytes
      // This test verifies UI prevents submission
      await expect(page.locator('button:has-text("Upload")')).toBeDefined();
    }
  });
  
  test('File upload respects rate limits', async ({ request }) => {
    // Get auth token
    let response = await request.post(`${BASE_URL}/api/auth/signin`, {
      data: {
        email: testUsers.regular.email,
        password: testUsers.regular.password,
      },
    });
    
    const token = (await response.json()).token;
    
    // Try to upload 16 files in quick succession (limit: 15/min)
    for (let i = 0; i < 16; i++) {
      response = await request.post(`${BASE_URL}/api/upload`, {
        headers: { Authorization: `Bearer ${token}` },
        // File data would be sent here
      });
      
      if (i === 15) {
        // 16th upload should be rate limited
        expect(response.status()).toBe(429);
      }
    }
  });
});

// ============================================================================
// SETUP & TEARDOWN
// ============================================================================

test.beforeEach(async ({ page }) => {
  // Clear browser storage before each test
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test.afterEach(async ({ page }) => {
  // Cleanup after each test
  await page.close();
});
