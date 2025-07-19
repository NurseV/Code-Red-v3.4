
import React, { useEffect } from 'react';
import { XIcon } from '../icons/Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  containerClassName?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, containerClassName = '' }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`relative bg-dark-card border border-dark-border rounded-lg shadow-xl w-full max-w-lg mx-4 ${containerClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-dark-border no-print">
          <h2 id="modal-title" className="text-xl font-bold text-dark-text">{title}</h2>
          <button
            onClick={onClose}
            className="text-dark-text-secondary hover:text-dark-text"
            aria-label="Close modal"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
