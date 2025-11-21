'use client';

import React from 'react';
import { initSentry } from '@/lib/sentry';

// Initialize Sentry on app start
if (typeof window !== 'undefined') {
  initSentry();
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Plataforma para criar páginas para comércios locais" />
        <title>Páginas para o Comércio</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
