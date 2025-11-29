import { Phone, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PublicPageData, Photo } from './types';

interface HeroProps {
    data: PublicPageData;
    whatsappLink: string | null;
    heroPhoto?: Photo;
}

export function HeroRenderer({ data, whatsappLink, heroPhoto }: HeroProps) {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 px-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Gradient Orbs */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/30 rounded-full blur-[120px] animate-float"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] animate-float delay-200"></div>
                <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-cyan-500/20 rounded-full blur-[80px] animate-float delay-400"></div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>

                {/* Radial Gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0a0a_70%)]"></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 max-w-6xl mx-auto text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-slideUp">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-gray-300">Vitrine Digital Premium</span>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>

                {/* Main Title */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight animate-slideUp delay-100">
                    <span className="text-white">{(data.title || 'Sua Vitrine').split(' ')[0]}</span>
                    <br />
                    <span className="text-gradient">{(data.title || 'Digital').split(' ').slice(1).join(' ') || 'Premium'}</span>
                </h1>

                {/* Description */}
                <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed animate-slideUp delay-200">
                    {data.pageDescription || 'Descubra produtos e serviços exclusivos. Qualidade e atendimento que você merece.'}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slideUp delay-300">
                    {whatsappLink && (
                        <Link
                            href={whatsappLink}
                            target="_blank"
                            className="group relative px-8 py-4 rounded-2xl overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 animate-gradient"></div>
                            <div className="absolute inset-[2px] bg-[#0a0a0a] rounded-2xl group-hover:bg-transparent transition-colors duration-300"></div>
                            <span className="relative flex items-center gap-3 text-white font-bold text-lg">
                                <MessageCircle className="w-5 h-5" />
                                Fazer Pedido
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                    )}
                    {data.phone && (
                        <Link
                            href={`tel:${data.phone.replace(/\D/g, '')}`}
                            className="group flex items-center gap-3 px-8 py-4 rounded-2xl glass hover:bg-white/10 transition-colors"
                        >
                            <Phone className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                            <span className="text-gray-300 group-hover:text-white font-semibold transition-colors">Ligar Agora</span>
                        </Link>
                    )}
                </div>

                {/* Hero Image */}
                {heroPhoto && (
                    <div className="relative mt-16 animate-scaleIn delay-400">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-purple-500 rounded-3xl blur-2xl opacity-30 animate-glow"></div>
                        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                            <img
                                src={heroPhoto.url}
                                alt={heroPhoto.header || data.title || 'Hero'}
                                className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>

                            {/* Floating Card */}
                            {heroPhoto.header && (
                                <div className="absolute bottom-6 left-6 right-6 glass rounded-2xl p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">{heroPhoto.header}</h3>
                                            {heroPhoto.description && (
                                                <p className="text-gray-400 text-sm">{heroPhoto.description}</p>
                                            )}
                                        </div>
                                        {whatsappLink && (
                                            <Link href={whatsappLink} target="_blank" className="p-3 bg-emerald-500 rounded-xl hover:bg-emerald-400 transition-colors">
                                                <MessageCircle className="w-5 h-5 text-white" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
                <span className="text-gray-500 text-xs uppercase tracking-widest">Scroll</span>
                <div className="w-6 h-10 rounded-full border-2 border-gray-700 flex items-start justify-center p-2">
                    <div className="w-1.5 h-2.5 bg-emerald-500 rounded-full"></div>
                </div>
            </div>
        </section>
    );
}
