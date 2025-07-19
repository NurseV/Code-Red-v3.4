import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronsUpDownIcon } from '../icons/Icons';

interface ComboboxOption {
    value: string;
    label: string;
}

interface ComboboxProps {
    options: ComboboxOption[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    error?: string;
    placeholder?: string;
}

const Combobox: React.FC<ComboboxProps> = ({ options, value, onChange, disabled, error, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0, width: 0 });

    const calculatePosition = () => {
        if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setDropdownCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            calculatePosition();
            window.addEventListener('resize', calculatePosition, true);
            document.addEventListener('scroll', calculatePosition, true);
            return () => {
                window.removeEventListener('resize', calculatePosition, true);
                document.removeEventListener('scroll', calculatePosition, true);
            };
        }
    }, [isOpen]);

    const selectedOption = options.find(option => option.value === value);

    const filteredOptions = query === ''
        ? options
        : options.filter(option =>
            option.label.toLowerCase().includes(query.toLowerCase())
        );

    const handleSelect = (newValue: string) => {
        onChange(newValue);
        setIsOpen(false);
        setQuery('');
    };

    const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-dark-border focus:border-brand-primary focus:ring-brand-primary';

    const DropdownList = (
        <ul
            style={{
                top: `${dropdownCoords.top}px`,
                left: `${dropdownCoords.left}px`,
                width: `${dropdownCoords.width}px`,
            }}
            // Use 'fixed' position to break out of the overflow context
            className="fixed z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-dark-card py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-dark-border"
        >
            {filteredOptions.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-dark-text-secondary">
                    Nothing found.
                </div>
            ) : (
                filteredOptions.map((option) => (
                    <li
                        key={option.value}
                        className={`relative cursor-pointer select-none py-2 px-4 ${value === option.value ? 'bg-brand-primary text-white' : 'text-dark-text hover:bg-dark-border'}`}
                        onClick={() => handleSelect(option.value)}
                    >
                        {option.label}
                    </li>
                ))
            )}
        </ul>
    );

    return (
        <div className="md:col-span-2" ref={wrapperRef}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    className={`block w-full bg-dark-bg border rounded-md shadow-sm py-2 pl-3 pr-10 text-dark-text focus:outline-none sm:text-sm disabled:opacity-50 disabled:bg-dark-bg/50 ${errorClasses}`}
                    value={query || selectedOption?.label || ''}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onClick={() => setIsOpen(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                />
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-2"
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={disabled}
                >
                    <ChevronsUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </button>
            </div>

            {isOpen && createPortal(DropdownList, document.body)}

             {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default Combobox;
