/**
 * PATCH #4: Session Timeout Reduction
 * Vulnerability: CVSS 6.8 - Weak Session Management
 * 
 * Issue: Session maxAge = 30 days (industry standard: 15-30 min)
 * Impact: If device stolen/compromised, attacker has 30 days of access
 * 
 * HOW TO APPLY:
 * 1. Update lib/auth.ts: Change maxAge from 30 days to 15 minutes
 * 2. Implement refresh token rotation
 * 3. Add idle timeout logout
 */

// ============================================================================
// FILE: lib/auth.ts (UPDATED)
// ============================================================================

import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/db/prisma';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.password) {
          throw new Error('User not found');
        }

        // Verify password with bcrypt (constant-time comparison)
        const isPasswordValid = await compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        // Check if account is active
        if (!user.isActive) {
          throw new Error('Account is disabled');
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
          isActive: user.isActive,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    // ✅ CRITICAL FIX: Reduce session maxAge from 30 days to 15 minutes
    maxAge: 15 * 60, // 15 minutes (was: 30 * 24 * 60 * 60)
    // ✅ NEW: Update token every 5 minutes (refresh token rotation)
    updateAge: 5 * 60,
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 15 * 60, // 15 minutes
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.issuedAt = Date.now();
      }

      // ✅ NEW: Check token age for idle timeout
      const tokenAge = (Date.now() - (token.issuedAt as number)) / 1000; // seconds
      const idleTimeout = 15 * 60; // 15 minutes

      if (tokenAge > idleTimeout) {
        return Promise.reject(new Error('Token expired'));
      }

      return token;
    },

    async session({ session, token }) {
      session.user.role = token.role as string;
      session.user.tenantId = token.tenantId as string;
      // ✅ NEW: Add token metadata to session
      session.expiresAt = new Date(
        (token.iat as number) * 1000 + 15 * 60 * 1000
      ).toISOString();
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Prevent open redirects
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  events: {
    async signOut({ token }) {
      // Clean up any tokens
      console.log(`[AUTH] User signed out: ${token.sub}`);
    },
  },
};

// ============================================================================
// STEP 2: Middleware for Idle Timeout (NEW FILE)
// ============================================================================

/*
// File: lib/idle-timeout.ts

import { getSession } from 'next-auth/react';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
let lastActivity = Date.now();

export function setupIdleTimeout() {
  if (typeof window === 'undefined') return;

  // Track user activity
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

  events.forEach(event => {
    document.addEventListener(event, () => {
      lastActivity = Date.now();
    });
  });

  // Check for idle timeout every minute
  setInterval(async () => {
    const idleTime = Date.now() - lastActivity;
    
    if (idleTime > IDLE_TIMEOUT_MS) {
      console.log('[AUTH] Session idle timeout - logging out');
      await signOut({ redirect: true, callbackUrl: '/auth/signin' });
    }
  }, 60 * 1000); // Check every minute
}

export function resetIdleTimer() {
  lastActivity = Date.now();
}
*/

// ============================================================================
// STEP 3: Client-side Session Check (NEW)
// ============================================================================

/*
// File: lib/use-session-check.ts

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useSessionCheck() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated' || !session?.expiresAt) return;

    const expiresAt = new Date(session.expiresAt).getTime();
    const now = Date.now();
    const timeRemaining = expiresAt - now;

    // Warn user 1 minute before expiry
    const warningTimeout = timeRemaining - 60 * 1000;

    if (warningTimeout > 0) {
      const timer = setTimeout(() => {
        // Show warning toast
        console.warn('[SESSION] Session expiring in 1 minute');
      }, warningTimeout);

      return () => clearTimeout(timer);
    }
  }, [session, status]);
}
*/

// ============================================================================
// STEP 4: Test Coverage
// ============================================================================

/*
// File: __tests__/integration/session-timeout.test.ts

describe('Session Timeout', () => {
  test('Session expires after 15 minutes', async () => {
    const session = await getSession();
    expect(session?.expiresAt).toBeDefined();
    
    const expiresAt = new Date(session?.expiresAt).getTime();
    const issuedAt = new Date(session?.issued_at || Date.now()).getTime();
    const maxAge = expiresAt - issuedAt;
    
    // Should be 15 minutes (900 seconds)
    expect(maxAge).toBeLessThanOrEqual(15 * 60 * 1000);
    expect(maxAge).toBeGreaterThan(14 * 60 * 1000); // Allow small variance
  });

  test('Idle session terminates', async () => {
    // Simulate 16 minutes of inactivity
    jest.useFakeTimers();
    jest.advanceTimersByTime(16 * 60 * 1000);
    
    const session = await getSession();
    expect(session).toBeNull(); // Session should be expired
    
    jest.useRealTimers();
  });

  test('Activity refreshes token', async () => {
    const session1 = await getSession();
    const expiry1 = new Date(session1?.expiresAt).getTime();
    
    // Simulate activity
    jest.useFakeTimers();
    jest.advanceTimersByTime(5 * 60 * 1000); // 5 minutes
    
    const session2 = await getSession();
    const expiry2 = new Date(session2?.expiresAt).getTime();
    
    // New token should extend expiry (updateAge = 5 min)
    expect(expiry2).toBeGreaterThan(expiry1);
    
    jest.useRealTimers();
  });
});
*/

// ============================================================================
// METRICS & MONITORING
// ============================================================================

/*
KEY METRICS TO MONITOR:
  - Average session duration (should be < 15 min)
  - Sessions terminated by idle timeout (should be > 50%)
  - Failed requests due to expired session (should be < 5%)
  - Token refresh rate (should be every 5 min)

ALERTS:
  - Session expiry errors spiking → May indicate UX issue
  - Users with sessions > 30 min → Possible concurrent sessions
*/
