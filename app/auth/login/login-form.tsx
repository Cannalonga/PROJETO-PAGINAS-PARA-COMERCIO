'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function LoginFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirecionar baseado na role após login
    useEffect(() => {
        if (session?.user) {
            const role = (session.user as any).role;
            if (role === 'SUPERADMIN') {
                router.push('/admin');
            } else {
                router.push(callbackUrl);
            }
        }
    }, [session, router, callbackUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError('Email ou senha inválidos');
                setLoading(false);
            }
            // Se login foi sucesso, o useEffect acima vai redirecionar
        } catch (err) {
            setError('Ocorreu um erro ao fazer login');
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            {/* Botão Voltar - Canto Superior Esquerdo */}
            <div className="absolute top-6 left-6">
                <button 
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm font-medium">Voltar</span>
                </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-xl">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="h-10 w-10 bg-sky-500 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-105 transition">
                            V
                        </div>
                        <span className="font-bold text-xl text-slate-50">VitrineFast</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-50 mb-2">Bem-vindo!</h1>
                    <p className="text-slate-400 text-sm">Faça login para acessar sua conta</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none transition disabled:opacity-50"
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Senha
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none transition disabled:opacity-50"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                    <p className="text-slate-400 text-sm">
                        Não tem uma conta?{' '}
                        <Link href="/auth/register" className="text-sky-400 hover:text-sky-300 font-medium">
                            Criar conta
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
