
import React from 'react';

interface FormControlProps {
    error?: string;
}

export const FormRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 items-start ${className}`}>{children}</div>
);

export const Label: React.FC<{ htmlFor?: string; children: React.ReactNode, sublabel?: string }> = ({ htmlFor, children, sublabel }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-dark-text-secondary md:pt-2 md:text-right md:pr-4">
        {children}
        {sublabel && <span className="block text-xs">({sublabel})</span>}
    </label>
);

const InputError: React.FC<{ message?: string }> = ({ message }) => {
    if (!message) return null;
    return <p className="text-red-400 text-xs mt-1">{message}</p>;
}

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & FormControlProps> = ({ error, ...props }) => {
    const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-dark-border focus:border-brand-primary focus:ring-brand-primary';
    return (
        <div className={props.className?.includes('col-span') ? props.className : "md:col-span-2"}>
            <input
                {...props}
                className={`block w-full bg-dark-bg border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none sm:text-sm disabled:opacity-50 disabled:bg-dark-bg/50 ${errorClasses}`}
            />
            <InputError message={error} />
        </div>
    );
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & FormControlProps> = ({ error, ...props }) => {
    const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-dark-border focus:border-brand-primary focus:ring-brand-primary';
    return (
         <div className={props.className?.includes('col-span') ? props.className : "md:col-span-2"}>
            <select
                {...props}
                className={`block w-full bg-dark-bg border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none sm:text-sm disabled:opacity-50 disabled:bg-dark-bg/50 ${errorClasses}`}
            />
            <InputError message={error} />
        </div>
    );
};

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & FormControlProps> = ({ error, ...props }) => {
    const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-dark-border focus:border-brand-primary focus:ring-brand-primary';
    return (
        <div className={props.className?.includes('col-span') ? props.className : "md:col-span-2"}>
            <textarea
                {...props}
                className={`block w-full bg-dark-bg border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none sm:text-sm disabled:opacity-50 disabled:bg-dark-bg/50 ${errorClasses}`}
            />
            <InputError message={error} />
        </div>
    );
};
