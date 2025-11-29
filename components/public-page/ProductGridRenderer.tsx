import { MessageCircle, Star } from 'lucide-react';
import Link from 'next/link';
import { Photo } from './types';

interface ProductGridProps {
    galleryPhotos: Photo[];
    whatsappLink: string | null;
}

export function ProductGridRenderer({ galleryPhotos, whatsappLink }: ProductGridProps) {
    if (galleryPhotos.length === 0) return null;

    return (
        <section className="relative py-24 px-4">
            {/* Section Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent"></div>

            <div className="relative max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm text-gray-300">Destaques</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4">
                        Nossos <span className="text-gradient">Produtos</span>
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Explore nossa seleção especial de produtos e serviços
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px] md:auto-rows-[250px]">
                    {galleryPhotos.map((photo, index) => {
                        const isLarge = index === 0 || index === 3;
                        const gridClass = isLarge ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1';

                        return (
                            <div
                                key={photo.slot || `photo-${index}`}
                                className={`group relative rounded-3xl overflow-hidden cursor-pointer ${gridClass}`}
                            >
                                {/* Image */}
                                <img
                                    src={photo.url}
                                    alt={photo.header || `Produto ${index + 1}`}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>

                                {/* Glow Effect on Hover */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent"></div>
                                </div>

                                {/* Content */}
                                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        {photo.header && (
                                            <h3 className={`font-bold text-white mb-2 ${isLarge ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
                                                {photo.header}
                                            </h3>
                                        )}
                                        {photo.description && (
                                            <p className={`text-gray-300 mb-4 line-clamp-2 ${isLarge ? 'text-base' : 'text-sm'}`}>
                                                {photo.description}
                                            </p>
                                        )}
                                        {whatsappLink && (
                                            <Link
                                                href={`${whatsappLink}&text=${encodeURIComponent(`Olá! Tenho interesse: ${photo.header || 'produto'}`)}`}
                                                target="_blank"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-semibold rounded-xl hover:bg-emerald-400 transition-colors opacity-0 group-hover:opacity-100"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                Quero Este
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* Badge */}
                                {isLarge && (
                                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-white" />
                                        Destaque
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
