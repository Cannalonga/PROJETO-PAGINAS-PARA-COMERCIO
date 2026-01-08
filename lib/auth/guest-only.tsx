'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface GuestOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * GuestOnly: Bloqueia usuários AUTENTICADOS de acessar rotas de guest (como /auth/login)
 * Se o usuário está autenticado, redireciona para /dashboard
 * Se não está autenticado, permite acesso
 */
export function GuestOnly({ children, fallback }: GuestOnlyProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    // Se existe sessão, redireciona para dashboard
    if (session) {
      router.push('/dashboard')
      return
    }

    // Se não há sessão, permite acesso (é guest)
    setIsGuest(true)
  }, [session, status, router])

  if (status === 'loading') {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="text-slate-400">Carregando...</div>
        </div>
      )
    )
  }

  if (!isGuest) {
    // Usuário autenticado - redirecionando...
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-400">Redirecionando...</div>
      </div>
    )
  }

  return <>{children}</>
}
