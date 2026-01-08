'use client';

import { Suspense } from 'react';
import LoginFormContent from './login-form';
import { GuestOnly } from '@/lib/auth/guest-only';

export default function LoginPage() {
    return (
        <GuestOnly>
            <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center">Carregando...</div>}>
                <LoginFormContent />
            </Suspense>
        </GuestOnly>
    );
}

