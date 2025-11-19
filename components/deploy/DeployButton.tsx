// components/deploy/DeployButton.tsx
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/Button'

interface DeployButtonProps {
  pageId: string
  pageName: string
  isLoading?: boolean
  onDeploy?: () => Promise<void>
}

export function DeployButton({
  pageId,
  pageName,
  isLoading = false,
  onDeploy,
}: DeployButtonProps) {
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    try {
      setError(null)
      if (onDeploy) {
        await onDeploy()
      } else {
        const response = await fetch('/api/deploy/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageId, pageName }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Falha ao publicar')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleClick}
        disabled={isLoading}
        className="bg-brand-500 hover:bg-brand-600"
      >
        {isLoading ? 'Deploying...' : 'Publish Page'}
      </Button>
      {error && <span className="text-red-600 text-sm">{error}</span>}
    </div>
  )
}
