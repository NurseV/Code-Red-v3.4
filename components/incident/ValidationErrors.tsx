
import React, { useState, useRef, useEffect } from 'react';
import { ValidationError } from '../../services/validationService';
import { AlertTriangleIcon } from '../icons/Icons';

interface Props {
    errors: ValidationError[];
    onNavigate: (moduleId: string, fieldId: string) => void;
}

const ValidationErrors: React.FC<Props> = ({ errors, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const errorCount = errors.length;
    if (errorCount === 0) return null;

    const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleNavigation = (moduleId: string, fieldId: string) => {
        onNavigate(moduleId, fieldId);
        setIsOpen(false);
    }

    return (
        <div ref={wrapperRef} className="relative mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-red-800/80 border border-red-600 rounded-lg flex items-center justify-between p-3 text-white hover:bg-red-700/80 transition-colors"
            >
                <div className="flex items-center">
                    <AlertTriangleIcon className="h-5 w-5 mr-2" />
                    <span className="font-bold">Validation Issues</span>
                </div>
                <span className="h-6 w-6 bg-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {errorCount}
                </span>
            </button>
            {isOpen && (
                <div className="absolute top-full mt-1 w-full bg-dark-card border border-dark-border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                    <ul className="divide-y divide-dark-border">
                        {errors.map((error, index) => (
                            <li key={index}>
                                <button
                                    onClick={() => handleNavigation(error.moduleId, error.fieldId)}
                                    className="w-full text-left p-3 hover:bg-dark-border transition-colors text-dark-text-secondary"
                                >
                                    <span className="font-semibold capitalize text-dark-text">{error.moduleId} Module:</span> {error.message}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ValidationErrors;
