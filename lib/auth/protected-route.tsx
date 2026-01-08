'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string | string[]
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallback,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    // Apenas SET authorized se sessão existe e role está OK
    if (!session) {
      setIsAuthorized(false)
      return
    }

    const userRole = (session.user as any).role

    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      if (!roles.includes(userRole)) {
        setIsAuthorized(false)
        return
      }
    }

    setIsAuthorized(true)
  }, [session, status, requiredRole])

  if (status === 'loading') {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="text-slate-400">Carregando...</div>
        </div>
      )
    )
  }

  if (!isAuthorized) {
    // BLOQUEIA O ACESSO SEM REDIRECIONAR
    // Mostra fallback ou conteúdo de "não autorizado"
    return (
      fallback || (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-50 mb-4">Acesso Negado</h1>
            <p className="text-slate-400 mb-6">
              Você precisa estar autenticado para acessar esta página.
            </p>
            <a
              href="/auth/login"
              className="inline-block bg-sky-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-sky-400 transition"
            >
              Ir para Login
            </a>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}
