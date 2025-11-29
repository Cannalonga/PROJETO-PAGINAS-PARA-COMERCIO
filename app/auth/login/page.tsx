'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            } else {
                router.push(callbackUrl);
            }
        } catch (err) {
            setError('Ocorreu um erro ao fazer login');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-xl">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="h-10 w-10 bg-sky-500 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-105 transition">
                            V
                        </div>
                        <span className="font-bold text-xl text-slate-50">VitrineFast</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-50">Bem-vindo de volta</h1>
                    <p className="text-slate-400 mt-2">Entre para gerenciar sua vitrine</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
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
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-sky-500 text-white font-semibold rounded-xl hover:bg-sky-400 focus:ring-4 focus:ring-sky-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div className="mt-6 text-center space-y-4">
                    <p className="text-sm text-slate-400">
                        Ainda não tem uma conta?{' '}
                        <Link href="/auth/register" className="text-sky-400 hover:text-sky-300 font-medium">
                            Criar conta grátis
                        </Link>
                    </p>
                    <Link href="/" className="block text-xs text-slate-500 hover:text-slate-400">
                        ← Voltar para o início
                    </Link>
                </div>
            </div>
        </div>
    );
}
