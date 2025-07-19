
import React, { useState, ReactNode } from 'react';
import { ChevronDownIcon } from '../icons/Icons';

interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false, icon }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-dark-border rounded-lg bg-dark-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-dark-border/30 hover:bg-dark-border/50 focus:outline-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
            {icon && <div className="mr-3 text-brand-secondary">{icon}</div>}
            <h3 className="text-lg font-bold text-dark-text">{title}</h3>
        </div>
        <ChevronDownIcon
          className={`h-6 w-6 text-dark-text-secondary transition-transform duration-300 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[2000px]' : 'max-h-0'
        }`}
      >
        <div className="p-4 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;
