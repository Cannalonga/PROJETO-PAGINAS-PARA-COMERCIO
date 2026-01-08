import React from 'react'
import '@/styles/globals.css'
import { Providers } from '@/components/providers'

export const metadata = {
  title: 'VitrineFast - Sua Vitrine Digital',
  description: 'Crie páginas profissionais para seu comércio em minutos, sem precisar de código',
  viewport: 'width=device-width, initial-scale=1',
  charset: 'utf-8',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
