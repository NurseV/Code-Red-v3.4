import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import * as api from '../services/api';
import { SystemConfiguration } from '../types';
import { PlusIcon, XIcon } from '../components/icons/Icons';
import DepartmentInformation from '../components/settings/DepartmentInformation';
import NfirsFieldSettings from '../components/settings/NfirsFieldSettings';

// Reusing EditableList from the original Configuration page for the other tabs
const EditableList: React.FC<{
    title: string;
    items: string[];
    onUpdate: (newItems: string[]) => void;
}> = ({ title, items, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newItem, setNewItem] = useState('');

    const handleAddItem = () => {
        if (newItem.trim() && !items.includes(newItem.trim())) {
            onUpdate([...items, newItem.trim()]);
            setNewItem('');
        }
    };
    
    const handleRemoveItem = (itemToRemove: string) => {
        onUpdate(items.filter(item => item !== itemToRemove));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-dark-text">{title}</h3>
                <Button onClick={() => setIsModalOpen(true)} icon={<PlusIcon className="h-4 w-4 mr-2"/>}>Add</Button>
            </div>
            <ul className="space-y-2 bg-dark-bg p-3 rounded-md border border-dark-border max-h-96 overflow-y-auto">
                {items.length > 0 ? items.map(item => (
                    <li key={item} className="flex justify-between items-center p-2 bg-dark-card rounded">
                        <span className="text-dark-text">{item}</span>
                        <Button variant="ghost" className="p-1" onClick={() => handleRemoveItem(item)}>
                            <XIcon className="h-4 w-4 text-red-500"/>
                        </Button>
                    </li>
                )) : <p className="text-center text-dark-text-secondary py-4">No items configured.</p>}
            </ul>
            <Modal title={`Add New ${title.slice(0, -1)}`} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="space-y-4">
                    <input 
                        type="text" 
                        value={newItem}
                        onChange={e => setNewItem(e.target.value)}
                        className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                    />
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => { handleAddItem(); setIsModalOpen(false); }}>Add</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const Settings: React.FC = () => {
    const [config, setConfig] = useState<SystemConfiguration | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getConfiguration().then(setConfig).finally(() => setIsLoading(false));
    }, []);

    const handleUpdateConfig = async (updatedConfig: Partial<SystemConfiguration>) => {
        if (!config) return;
        const newConfig = { ...config, ...updatedConfig };
        try {
            const updated = await api.updateConfiguration(newConfig);
            setConfig(updated);
        } catch(e) {
            alert("Failed to update configuration.");
        }
    };

    if (isLoading || !config) {
        return <div className="text-center p-8 text-dark-text-secondary">Loading configuration...</div>;
    }

    const TABS = [
        { label: 'Department Info', content: <DepartmentInformation /> },
        { label: 'Optional NFIRS Fields', content: <NfirsFieldSettings /> },
        { label: 'Incident Types', content: <EditableList title="Incident Types" items={config.incidentTypes} onUpdate={(newItems) => handleUpdateConfig({ incidentTypes: newItems })} /> },
        { label: 'Budget Categories', content: <EditableList title="Budget Categories" items={config.budgetCategories} onUpdate={(newItems) => handleUpdateConfig({ budgetCategories: newItems })} /> },
    ];

    return (
        <Card title="System Settings">
            <p className="text-sm text-dark-text-secondary mb-6">
                Manage system-wide options and categories. Changes made here will be reflected across the application.
            </p>
            <Tabs tabs={TABS} />
        </Card>
    );
};

export default Settings;