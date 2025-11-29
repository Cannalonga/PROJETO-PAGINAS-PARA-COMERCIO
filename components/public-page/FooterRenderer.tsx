import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { PublicPageData } from './types';

interface FooterProps {
    data: PublicPageData;
    whatsappLink: string | null;
}

export function FooterRenderer({ data, whatsappLink }: FooterProps) {
    return (
        <footer className="border-t border-white/10 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                            <span className="text-white font-bold">{(data.title || 'V')[0].toUpperCase()}</span>
                        </div>
                        <div>
                            <p className="text-white font-semibold">{data.title || 'Vitrine'}</p>
                            <p className="text-gray-500 text-sm">Vitrine Digital</p>
                        </div>
                    </div>

                    {/* Social */}
                    <div className="flex items-center gap-3">
                        {data.instagram && (
                            <Link href={`https://instagram.com/${data.instagram.replace('@', '')}`} target="_blank" className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors">
                                <Instagram className="w-5 h-5 text-gray-400" />
                            </Link>
                        )}
                        {data.facebook && (
                            <Link href={`https://facebook.com/${data.facebook}`} target="_blank" className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors">
                                <Facebook className="w-5 h-5 text-gray-400" />
                            </Link>
                        )}
                        {whatsappLink && (
                            <Link href={whatsappLink} target="_blank" className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors">
                                <MessageCircle className="w-5 h-5 text-gray-400" />
                            </Link>
                        )}
                    </div>

                    {/* Copyright */}
                    <div className="text-center md:text-right">
                        <p className="text-gray-500 text-sm">© {new Date().getFullYear()} {data.title}. Todos os direitos reservados.</p>
                        <p className="text-gray-600 text-xs mt-1">
                            Feito com 💚 por <span className="text-emerald-500 font-semibold">VitrineFast</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
