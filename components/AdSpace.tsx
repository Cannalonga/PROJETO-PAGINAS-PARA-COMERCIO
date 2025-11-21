'use client';

import React from 'react';

interface AdSpaceProps {
  position: 'top' | 'middle' | 'footer';
  className?: string;
}

export const AdSpace: React.FC<AdSpaceProps> = ({ position, className = '' }) => {
  const baseStyles = 'bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg';
  
  const positionStyles = {
    top: 'h-24 mb-6',
    middle: 'h-32 my-8',
    footer: 'h-16 mt-6'
  };

  const stickyFooter = position === 'footer' ? 'sticky bottom-0 z-40 shadow-lg' : '';

  return (
    <div
      className={`${baseStyles} ${positionStyles[position]} ${stickyFooter} ${className} flex items-center justify-center`}
      style={{
        backgroundImage: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-500">Espaço para Publicidade</p>
        <p className="text-xs text-slate-400 mt-1">Anúncios relevantes aqui</p>
      </div>
    </div>
  );
};

export default AdSpace;
