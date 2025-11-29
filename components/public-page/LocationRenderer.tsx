import { MapPin, Clock } from 'lucide-react';
import { PublicPageData } from './types';

interface LocationProps {
    data: PublicPageData;
}

export function LocationRenderer({ data }: LocationProps) {
    if (!data.address || !data.city || !data.state) return null;

    return (
        <section className="py-24 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                        Nossa <span className="text-gradient">Localização</span>
                    </h2>
                    <p className="text-gray-400 text-lg">Venha nos visitar</p>
                </div>

                {/* Map Container */}
                <div className="relative rounded-3xl overflow-hidden glass p-2">
                    <iframe
                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(`${data.address}, ${data.city}, ${data.state}, Brazil`)}&zoom=15`}
                        width="100%"
                        height="450"
                        style={{ border: 0, borderRadius: '1.25rem' }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full"
                    />

                    {/* Info Overlay */}
                    <div className="absolute bottom-6 left-6 right-6 sm:right-auto">
                        <div className="glass rounded-2xl p-4 sm:p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                                    <MapPin className="w-6 h-6 text-rose-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold mb-1">{data.title}</h3>
                                    <p className="text-gray-400 text-sm">{data.address}</p>
                                    <p className="text-gray-500 text-sm">{data.city} - {data.state}</p>
                                    {data.businessHours && (
                                        <p className="text-emerald-400 text-sm mt-2 flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {data.businessHours}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
