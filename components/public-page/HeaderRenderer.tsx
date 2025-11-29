import { Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { PublicPageData } from './types';

interface HeaderProps {
    data: PublicPageData;
    whatsappLink: string | null;
}

export function HeaderRenderer({ data, whatsappLink }: HeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <div className="glass mx-4 mt-4 rounded-2xl">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur-lg opacity-50"></div>
                                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                                    <span className="text-white font-black text-lg">
                                        {(data.title || 'V')[0].toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <span className="font-bold text-white text-lg hidden sm:block">{data.title || 'Vitrine'}</span>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-3">
                            {data.phone && (
                                <Link href={`tel:${data.phone.replace(/\D/g, '')}`} className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                                    <Phone className="w-4 h-4" />
                                    {data.phone}
                                </Link>
                            )}
                            {whatsappLink && (
                                <Link
                                    href={whatsappLink}
                                    target="_blank"
                                    className="group relative px-5 py-2.5 rounded-xl overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 transition-transform group-hover:scale-105"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="relative flex items-center gap-2 text-white font-semibold text-sm">
                                        <MessageCircle className="w-4 h-4" />
                                        <span className="hidden sm:inline">WhatsApp</span>
                                    </span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
