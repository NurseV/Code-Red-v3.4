import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, actions, icon }) => {
  return (
    <div className={`bg-dark-card border border-dark-border rounded-lg shadow-md ${className}`}>
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-dark-border flex justify-between items-center">
          {title && (
            <div className="flex items-center">
                {icon && <div className="mr-3">{icon}</div>}
                <h2 className="text-lg font-bold text-dark-text">{title}</h2>
            </div>
          )}
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
