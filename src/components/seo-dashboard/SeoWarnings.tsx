'use client';

/**
 * SeoWarnings - Lista de recomendações dinâmicas
 */

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { ChevronDown } from 'lucide-react';

interface SeoWarningsProps {
  data: any;
}

export default function SeoWarnings({ data }: SeoWarningsProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const warnings = data.schemaWarnings || [];
  const recommendations = data.schemaRecommendations || [];

  // Prioridade das recomendações
  const prioritizedRecs = [
    ...recommendations.filter((r: string) => r.includes('📍')), // Address
    ...recommendations.filter((r: string) => r.includes('📞')), // Phone
    ...recommendations.filter((r: string) => r.includes('⏰')), // Hours
    ...recommendations.filter((r: string) => !r.match(/^[📍📞⏰🗺️⭐📱🖼️💰📝]/)), // Others
  ].slice(0, 8);

  const allItems = [
    ...warnings.map((w: string) => ({ type: 'warning' as const, text: w })),
    ...prioritizedRecs.map((r: string) => ({ type: 'recommendation' as const, text: r })),
  ];

  if (allItems.length === 0) {
    return (
      <div className={`rounded-lg p-8 text-center ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <p className="text-2xl mb-2">🎉</p>
        <p className={`text-lg font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
          Perfeito! Seu SEO está otimizado.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Nenhuma recomendação pendente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allItems.map((item, idx) => {
        const isWarning = item.type === 'warning';
        const isExpanded = expandedIndex === idx;

        return (
          <div
            key={idx}
            className={`rounded-lg border ${
              isWarning
                ? isDark
                  ? 'bg-red-950 border-red-800'
                  : 'bg-red-50 border-red-200'
                : isDark
                  ? 'bg-yellow-950 border-yellow-800'
                  : 'bg-yellow-50 border-yellow-200'
            } overflow-hidden transition-all`}
          >
            <button
              onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              className="w-full p-4 flex justify-between items-start hover:opacity-80 transition-opacity"
            >
              <div className="flex gap-3 flex-1 text-left">
                <span className="text-xl flex-shrink-0">{isWarning ? '⚠️' : '💡'}</span>
                <div>
                  <p
                    className={`font-medium ${
                      isWarning
                        ? isDark
                          ? 'text-red-200'
                          : 'text-red-800'
                        : isDark
                          ? 'text-yellow-200'
                          : 'text-yellow-800'
                    }`}
                  >
                    {item.text}
                  </p>
                  {isWarning && (
                    <p className={`text-sm mt-1 ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                      Campo obrigatório para melhor SEO
                    </p>
                  )}
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 flex-shrink-0 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                } ${
                  isWarning
                    ? isDark
                      ? 'text-red-300'
                      : 'text-red-600'
                    : isDark
                      ? 'text-yellow-300'
                      : 'text-yellow-600'
                }`}
              />
            </button>

            {isExpanded && (
              <div
                className={`px-4 pb-4 border-t ${
                  isWarning
                    ? isDark
                      ? 'border-red-800'
                      : 'border-red-200'
                    : isDark
                      ? 'border-yellow-800'
                      : 'border-yellow-200'
                }`}
              >
                <div
                  className={`text-sm ${
                    isWarning
                      ? isDark
                        ? 'text-red-200'
                        : 'text-red-700'
                      : isDark
                        ? 'text-yellow-200'
                        : 'text-yellow-700'
                  }`}
                >
                  {isWarning ? (
                    <p>
                      Este campo é importante para que seu negócio apareça corretamente nos
                      resultados de busca do Google. Procure preenchê-lo assim que possível.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p>
                        <strong>Como resolver:</strong>
                      </p>
                      {item.text.includes('📍') && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Digite seu endereço completo (rua, número, cidade, estado)</li>
                          <li>Inclua o CEP para precisão</li>
                          <li>O Google usa isso para mapas e busca local</li>
                        </ul>
                      )}
                      {item.text.includes('📞') && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Adicione seu telefone principal</li>
                          <li>WhatsApp também funciona</li>
                          <li>Clientes podem ligar direto dos resultados de busca</li>
                        </ul>
                      )}
                      {item.text.includes('⏰') && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Informe quando você abre e fecha</li>
                          <li>Para cada dia da semana</li>
                          <li>Google mostra em "Horário de funcionamento"</li>
                        </ul>
                      )}
                      {item.text.includes('⭐') && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Solicite avaliações de seus clientes</li>
                          <li>Estrelas aparecem nos resultados de busca</li>
                          <li>Aumenta CTR em até 30%</li>
                        </ul>
                      )}
                      {item.text.includes('📱') && (
                        <ul className="list-disc list-inside space-y-1">
                          <li>Vincule seu Instagram, Facebook, etc</li>
                          <li>Valida sua identidade no Google</li>
                          <li>Clientes encontram facilmente seus perfis</li>
                        </ul>
                      )}
                      {!item.text.match(/^[📍📞⏰⭐📱🗺️🖼️💰📝]/) && (
                        <p>Consulte a documentação do BLOCO 3 para mais detalhes.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
