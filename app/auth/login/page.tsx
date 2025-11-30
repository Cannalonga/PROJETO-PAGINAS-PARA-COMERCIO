'use client';

import { Suspense } from 'react';
import LoginFormContent from './login-form';

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center">Carregando...</div>}>
            <LoginFormContent />
        </Suspense>
    );
}

