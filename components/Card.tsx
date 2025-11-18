import React from 'react';

interface CardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, className = '', children }) => {
  return (
    <div className={`card ${className}`}>
      {title && <div className="card-header"><h3 className="font-semibold text-lg">{title}</h3></div>}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};
