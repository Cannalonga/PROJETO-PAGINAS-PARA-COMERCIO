import { MessageCircle, Facebook, ExternalLink, MapPin } from 'lucide-react';
import Link from 'next/link';
import { PublicPageData } from './types';

interface ShareProps {
    data: PublicPageData;
}

export function ShareRenderer({ data }: ShareProps) {
    return (
        <section className="py-24 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                        Compartilhe com <span className="text-gradient">Amigos</span>
                    </h2>
                    <p className="text-gray-400">Ajude a divulgar este negócio</p>
                </div>

                {/* Share Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* WhatsApp Share */}
                    <button
                        onClick={() => {
                            const text = `Olha só essa vitrine incrível: ${data.title}! 🏪✨`;
                            const url = typeof window !== 'undefined' ? window.location.href : '';
                            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                        }}
                        className="group p-6 rounded-2xl glass hover:bg-green-500/20 transition-all flex flex-col items-center gap-3"
                    >
                        <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-7 h-7 text-green-400" />
                        </div>
                        <span className="text-gray-400 group-hover:text-green-400 font-medium transition-colors">WhatsApp</span>
                    </button>

                    {/* Facebook Share */}
                    <button
                        onClick={() => {
                            const url = typeof window !== 'undefined' ? window.location.href : '';
                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                        }}
                        className="group p-6 rounded-2xl glass hover:bg-blue-500/20 transition-all flex flex-col items-center gap-3"
                    >
                        <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Facebook className="w-7 h-7 text-blue-400" />
                        </div>
                        <span className="text-gray-400 group-hover:text-blue-400 font-medium transition-colors">Facebook</span>
                    </button>

                    {/* Twitter/X Share */}
                    <button
                        onClick={() => {
                            const text = `Olha só essa vitrine incrível: ${data.title}! 🏪✨`;
                            const url = typeof window !== 'undefined' ? window.location.href : '';
                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                        }}
                        className="group p-6 rounded-2xl glass hover:bg-gray-500/20 transition-all flex flex-col items-center gap-3"
                    >
                        <div className="w-14 h-14 rounded-xl bg-gray-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-7 h-7 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </div>
                        <span className="text-gray-400 group-hover:text-white font-medium transition-colors">Twitter/X</span>
                    </button>

                    {/* Copy Link */}
                    <button
                        onClick={() => {
                            const url = typeof window !== 'undefined' ? window.location.href : '';
                            navigator.clipboard.writeText(url).then(() => {
                                alert('✅ Link copiado para a área de transferência!');
                            });
                        }}
                        className="group p-6 rounded-2xl glass hover:bg-purple-500/20 transition-all flex flex-col items-center gap-3"
                    >
                        <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ExternalLink className="w-7 h-7 text-purple-400" />
                        </div>
                        <span className="text-gray-400 group-hover:text-purple-400 font-medium transition-colors">Copiar Link</span>
                    </button>
                </div>

                {/* Google Maps Link */}
                {data.address && (
                    <div className="mt-8 text-center">
                        <Link
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${data.address}, ${data.city}, ${data.state}`)}`}
                            target="_blank"
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-rose-400 transition-colors"
                        >
                            <MapPin className="w-5 h-5" />
                            Ver no Google Maps
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
