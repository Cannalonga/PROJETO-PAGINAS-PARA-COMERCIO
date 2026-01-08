'use client'

import { ProtectedRoute } from '@/lib/auth/protected-route'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
