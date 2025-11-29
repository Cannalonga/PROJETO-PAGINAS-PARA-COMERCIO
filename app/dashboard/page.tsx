'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ChartData {
    date: string;
    count: number;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<{ totalViews: number; chartData: ChartData[] } | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            setLoading(false);
            fetchStats();
        }
    }, [status, router]);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/analytics/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50">
            {/* Navbar */}
            <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white">V</div>
                        <span>VitrineFast</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-400 hidden md:block">
                            Olá, {session?.user?.name}
                        </span>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="text-sm text-red-400 hover:text-red-300 transition"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Meu Painel</h1>
                    <p className="text-slate-400">Gerencie suas vitrines e acompanhe resultados</p>
                </div>

                {/* Status da Loja */}
                {session?.user?.tenantId ? (
                    <div className="space-y-6">

                        {/* Analytics Section */}
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Total Views Card */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-sm font-medium text-slate-400">Visualizações (7 dias)</h2>
                                        <p className="text-3xl font-bold text-white mt-1">
                                            {stats ? stats.totalViews : '...'}
                                        </p>
                                    </div>
                                    <div className="h-10 w-10 bg-sky-500/10 text-sky-400 rounded-lg flex items-center justify-center text-xl">
                                        👁️
                                    </div>
                                </div>
                                <div className="text-xs text-emerald-400 font-medium">
                                    +12% vs semana anterior
                                </div>
                            </div>

                            {/* Chart Card */}
                            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                <h2 className="text-sm font-medium text-slate-400 mb-6">Evolução de Acessos</h2>
                                <div className="h-32 flex items-end justify-between gap-2">
                                    {stats?.chartData.map((item, index) => {
                                        const max = Math.max(...stats.chartData.map(d => d.count), 1); // Evitar divisão por zero
                                        const height = (item.count / max) * 100;
                                        return (
                                            <div key={index} className="flex flex-col items-center gap-2 flex-1 group">
                                                <div className="relative w-full flex justify-center items-end h-full">
                                                    <div
                                                        className="w-full max-w-[24px] bg-sky-500/20 group-hover:bg-sky-500 transition-all rounded-t-sm"
                                                        style={{ height: `${height}%` }}
                                                    ></div>
                                                    {/* Tooltip */}
                                                    <div className="absolute -top-8 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap border border-slate-700">
                                                        {item.count} views
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-slate-500">{item.date}</span>
                                            </div>
                                        );
                                    })}
                                    {!stats && (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                                            Carregando gráfico...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Card da Loja */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold mb-1">Sua Vitrine</h2>
                                        <p className="text-sm text-slate-400">Status: <span className="text-emerald-400">Ativa</span></p>
                                    </div>
                                    <div className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center text-2xl">
                                        🏪
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Link
                                        href={`/preview/${session.user.tenantId}`}
                                        className="block w-full py-3 bg-sky-500 text-white font-semibold text-center rounded-xl hover:bg-sky-400 transition"
                                    >
                                        Editar Vitrine
                                    </Link>
                                    <Link
                                        href={`/loja/${session.user.tenantId}`} // TODO: Usar slug real
                                        target="_blank"
                                        className="block w-full py-3 bg-slate-800 text-slate-300 font-semibold text-center rounded-xl hover:bg-slate-700 transition"
                                    >
                                        Ver Loja Online ↗
                                    </Link>
                                </div>
                            </div>

                            {/* Card do Plano */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold mb-1">Seu Plano</h2>
                                        <p className="text-sm text-slate-400">Plano Atual: <span className="text-purple-400 font-semibold">Gratuito</span></p>
                                    </div>
                                    <div className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center text-2xl">
                                        💳
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-800/50 rounded-xl">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-slate-400">Vitrines usadas</span>
                                            <span className="text-slate-200">1 / 1</span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-2">
                                            <div className="bg-sky-500 h-2 rounded-full w-full"></div>
                                        </div>
                                    </div>

                                    <button className="block w-full py-3 border border-sky-500 text-sky-400 font-semibold text-center rounded-xl hover:bg-sky-500/10 transition">
                                        Fazer Upgrade
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Estado Sem Loja */
                    <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
                        <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                            ✨
                        </div>
                        <h2 className="text-xl font-bold mb-2">Você ainda não tem uma vitrine</h2>
                        <p className="text-slate-400 mb-6">Crie sua primeira vitrine em minutos</p>
                        <Link
                            href="/setup"
                            className="inline-flex px-6 py-3 bg-sky-500 text-white font-semibold rounded-xl hover:bg-sky-400 transition"
                        >
                            Criar Vitrine Agora
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
