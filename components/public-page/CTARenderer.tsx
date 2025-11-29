import { MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CTAProps {
    whatsappLink: string | null;
}

export function CTARenderer({ whatsappLink }: CTAProps) {
    if (!whatsappLink) return null;

    return (
        <section className="py-24 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="relative rounded-[3rem] overflow-hidden">
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 animate-gradient"></div>

                    {/* Content */}
                    <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6">
                            Pronto para começar?
                        </h2>
                        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                            Entre em contato agora e descubra como podemos ajudar você
                        </p>
                        <Link
                            href={whatsappLink}
                            target="_blank"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-gray-900 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-white/25 transition-all hover:scale-105"
                        >
                            <MessageCircle className="w-6 h-6" />
                            Falar no WhatsApp
                            <ArrowRight className="w-6 h-6" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
