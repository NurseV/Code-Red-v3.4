
import React, { useState, useEffect } from 'react';
import { OptionalFieldConfig } from '../../types';
import * as api from '../../services/api';
import { CONFIGURABLE_OPTIONAL_FIELDS } from '../../constants';
import Button from '../ui/Button';

const NfirsFieldSettings: React.FC = () => {
    const [config, setConfig] = useState<OptionalFieldConfig>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        api.getConfiguration()
           .then(c => setConfig(c.optionalFields))
           .finally(() => setIsLoading(false));
    }, []);

    const handleToggle = (fieldId: string) => {
        setConfig(prev => ({ ...prev, [fieldId]: !prev[fieldId] }));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const fullConfig = await api.getConfiguration();
            fullConfig.optionalFields = config;
            await api.updateConfiguration(fullConfig);
            alert("Settings saved successfully!");
        } catch (e) {
            alert("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="text-center p-8 text-dark-text-secondary">Loading field settings...</div>;
    }

    return (
        <div className="space-y-3">
            <p className="text-sm text-dark-text-secondary">
                Configure which optional NFIRS fields are treated as mandatory for report validation. Fields required by NFIRS standards cannot be changed.
            </p>
            <style>{`.toggle-checkbox:checked { right: 0; border-color: #DC2626; } .toggle-checkbox:checked + .toggle-label { background-color: #DC2626; }`}</style>
            <ul className="divide-y divide-dark-border bg-dark-bg p-3 rounded-md border border-dark-border">
                {CONFIGURABLE_OPTIONAL_FIELDS.map(field => (
                    <li key={field.id} className="py-2 flex justify-between items-center">
                        <span className="text-dark-text">{field.label}</span>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input
                                type="checkbox"
                                id={field.id}
                                checked={!!config[field.id]}
                                onChange={() => handleToggle(field.id)}
                                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                            />
                            <label htmlFor={field.id} className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-500 cursor-pointer"></label>
                        </div>
                    </li>
                ))}
            </ul>
             <div className="flex justify-end pt-4">
                <Button onClick={handleSaveChanges} isLoading={isSaving}>Save Changes</Button>
            </div>
        </div>
    );
};

export default NfirsFieldSettings;
