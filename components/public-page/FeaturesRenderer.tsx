import { CheckCircle2, MessageCircle, Star } from 'lucide-react';

export function FeaturesRenderer() {
    return (
        <section className="py-24 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: CheckCircle2, title: 'Qualidade Garantida', desc: 'Produtos selecionados com excelência', color: 'emerald' },
                        { icon: MessageCircle, title: 'Atendimento Rápido', desc: 'Resposta imediata pelo WhatsApp', color: 'cyan' },
                        { icon: Star, title: 'Satisfação Total', desc: 'Clientes satisfeitos em primeiro lugar', color: 'purple' },
                    ].map((feature, index) => (
                        <div key={index} className="group relative p-8 rounded-3xl glass hover:bg-white/10 transition-all duration-300">
                            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-${feature.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                            <div className="relative">
                                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-gray-400">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
