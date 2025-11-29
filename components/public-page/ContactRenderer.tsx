import { MessageCircle, ArrowRight, Phone, ChevronRight, Mail, MapPin, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { PublicPageData } from './types';

interface ContactProps {
    data: PublicPageData;
    whatsappLink: string | null;
}

export function ContactRenderer({ data, whatsappLink }: ContactProps) {
    return (
        <section className="py-24 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                        Entre em <span className="text-gradient">Contato</span>
                    </h2>
                    <p className="text-gray-400 text-lg">Estamos prontos para atender você</p>
                </div>

                {/* Contact Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* WhatsApp - Destaque */}
                    {whatsappLink && (
                        <Link
                            href={whatsappLink}
                            target="_blank"
                            className="group relative p-8 rounded-3xl overflow-hidden sm:col-span-2 lg:col-span-2"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-600"></div>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-emerald-400 to-green-500"></div>

                            {/* Decorative */}
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full"></div>
                            <div className="absolute -left-5 -bottom-5 w-32 h-32 bg-white/10 rounded-full"></div>

                            <div className="relative">
                                <MessageCircle className="w-12 h-12 text-white mb-6" />
                                <h3 className="text-2xl font-bold text-white mb-2">WhatsApp</h3>
                                <p className="text-white/80 mb-6">Resposta rápida garantida</p>
                                <div className="flex items-center gap-2 text-white font-semibold">
                                    Iniciar conversa
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Phone */}
                    {data.phone && (
                        <Link href={`tel:${data.phone.replace(/\D/g, '')}`} className="group p-8 rounded-3xl glass hover:bg-white/10 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Phone className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Telefone</h3>
                            <p className="text-gray-400 mb-4">{data.phone}</p>
                            <span className="text-blue-400 font-semibold flex items-center gap-1">
                                Ligar <ChevronRight className="w-4 h-4" />
                            </span>
                        </Link>
                    )}

                    {/* Email */}
                    {data.email && (
                        <Link href={`mailto:${data.email}`} className="group p-8 rounded-3xl glass hover:bg-white/10 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Mail className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Email</h3>
                            <p className="text-gray-400 mb-4 truncate">{data.email}</p>
                            <span className="text-purple-400 font-semibold flex items-center gap-1">
                                Enviar <ChevronRight className="w-4 h-4" />
                            </span>
                        </Link>
                    )}

                    {/* Address */}
                    {data.address && (
                        <Link
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${data.address}, ${data.city}, ${data.state}`)}`}
                            target="_blank"
                            className="group p-8 rounded-3xl glass hover:bg-white/10 transition-all sm:col-span-2 lg:col-span-2"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <MapPin className="w-6 h-6 text-rose-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Localização</h3>
                            <p className="text-gray-400">{data.address}</p>
                            <p className="text-gray-500 text-sm mb-4">{data.city} - {data.state}, {data.zipCode}</p>
                            <span className="text-rose-400 font-semibold flex items-center gap-1">
                                Ver no mapa <ExternalLink className="w-4 h-4" />
                            </span>
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}
