
import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import * as api from '../../services/api';
import { ChecklistTemplate, ChecklistItemTemplate } from '../../types';
import { PlusIcon, ListChecksIcon, XIcon, EditIcon } from '../icons/Icons';

const TemplateSettings: React.FC = () => {
    const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);

    // State for new/edit template form
    const [modalData, setModalData] = useState({ name: '', type: 'General' as ChecklistTemplate['apparatusType'], items: [] as (ChecklistItemTemplate | Omit<ChecklistItemTemplate, 'id'>)[] });

    const fetchTemplates = () => {
        setIsLoading(true);
        api.getChecklistTemplates().then(setTemplates).finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleViewTemplate = (template: ChecklistTemplate) => {
        setSelectedTemplate(template);
        setIsDetailModalOpen(true);
    };
    
    const handleOpenCreateModal = () => {
        setSelectedTemplate(null);
        setModalData({ name: '', type: 'General', items: [{ text: '' }] });
        setIsEditModalOpen(true);
    };

    const handleOpenEditModal = (template: ChecklistTemplate) => {
        setSelectedTemplate(template);
        setModalData({ name: template.name, type: template.apparatusType, items: [...template.items] });
        setIsEditModalOpen(true);
    };

    const handleAddItem = () => {
        setModalData(prev => ({ ...prev, items: [...prev.items, { text: '' }] }));
    };
    
    const handleRemoveItem = (index: number) => {
        setModalData(prev => ({...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handleItemChange = (index: number, value: string) => {
        const updatedItems = [...modalData.items];
        updatedItems[index].text = value;
        setModalData(prev => ({...prev, items: updatedItems }));
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalItemsRaw = modalData.items.filter(item => item.text.trim() !== '');
        if (!modalData.name || finalItemsRaw.length === 0) {
            alert("Template name and at least one item are required.");
            return;
        }

        const templateData = {
            name: modalData.name,
            apparatusType: modalData.type,
            items: finalItemsRaw.map((item, index) => ({
                id: 'id' in item ? item.id! : `temp-id-${index}`,
                text: item.text
            })),
        };
        
        try {
            if (selectedTemplate) {
                await api.updateChecklistTemplate(selectedTemplate.id, templateData);
            } else {
                await api.createChecklistTemplate(templateData);
            }
            setIsEditModalOpen(false);
            fetchTemplates();
        } catch (error) {
            alert(`Failed to ${selectedTemplate ? 'update' : 'create'} template.`);
        }
    };

    const handleDeleteTemplate = async (templateId: string) => {
        if (window.confirm("Are you sure you want to delete this template?")) {
            try {
                await api.deleteChecklistTemplate(templateId);
                fetchTemplates();
            } catch (error) {
                alert("Failed to delete template.");
            }
        }
    };


    return (
        <>
            <div className="flex justify-between items-center mb-4">
                 <p className="text-sm text-dark-text-secondary">Manage the checklists used for daily apparatus readiness checks.</p>
                <Button onClick={handleOpenCreateModal} icon={<PlusIcon className="h-4 w-4 mr-2" />}>New Template</Button>
            </div>
            {isLoading ? <div className="text-center p-8 text-dark-text-secondary">Loading templates...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(template => (
                        <div key={template.id} className="bg-dark-bg border border-dark-border rounded-lg p-4 flex flex-col">
                            <div className="flex-grow">
                                <ListChecksIcon className="h-8 w-8 text-brand-secondary mb-2" />
                                <h3 className="font-bold text-lg text-dark-text">{template.name}</h3>
                                <p className="text-sm text-dark-text-secondary">Applies to: {template.apparatusType}</p>
                                <p className="text-sm text-dark-text-secondary">{template.items.length} items</p>
                            </div>
                            <div className="mt-4 flex space-x-2">
                                <Button variant="secondary" className="w-full" onClick={() => handleViewTemplate(template)}>
                                    View Items
                                </Button>
                                <Button variant="ghost" onClick={() => handleOpenEditModal(template)}><EditIcon className="h-4 w-4"/></Button>
                                <Button variant="ghost" onClick={() => handleDeleteTemplate(template.id)}><XIcon className="h-4 w-4 text-red-500"/></Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedTemplate && !isEditModalOpen && (
                <Modal 
                    title={`Items for ${selectedTemplate.name}`} 
                    isOpen={isDetailModalOpen} 
                    onClose={() => setIsDetailModalOpen(false)}
                >
                    <ul className="divide-y divide-dark-border max-h-80 overflow-y-auto">
                        {selectedTemplate.items.map((item, index) => (
                            <li key={item.id} className="py-2 text-dark-text">
                                {index + 1}. {item.text}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-6 flex justify-end">
                        <Button onClick={() => setIsDetailModalOpen(false)}>Close</Button>
                    </div>
                </Modal>
            )}

            <Modal title={selectedTemplate ? "Edit Checklist Template" : "Create New Checklist Template"} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <form onSubmit={handleModalSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="templateName" className="block text-sm font-medium text-dark-text-secondary mb-1">Template Name</label>
                        <input id="templateName" type="text" value={modalData.name} onChange={e => setModalData(d => ({...d, name: e.target.value}))} required className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="apparatusType" className="block text-sm font-medium text-dark-text-secondary mb-1">Apparatus Type</label>
                        <select id="apparatusType" value={modalData.type} onChange={e => setModalData(d => ({...d, type: e.target.value as any}))} required className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                            <option>General</option>
                            <option>Engine</option>
                            <option>Ladder</option>
                            <option>Rescue</option>
                            <option>Tanker</option>
                            <option>Brush Truck</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Checklist Items</label>
                        <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-dark-border rounded-md">
                            {modalData.items.map((item, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input type="text" placeholder={`Item ${index + 1}`} value={item.text} onChange={e => handleItemChange(index, e.target.value)} className="flex-grow bg-dark-card border border-dark-border rounded-md py-1 px-2 text-sm text-dark-text" />
                                    <Button type="button" variant="danger" onClick={() => handleRemoveItem(index)} className="p-1 h-7 w-7"><XIcon className="h-4 w-4"/></Button>
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="secondary" onClick={handleAddItem} className="mt-2 text-xs py-1 px-2">Add Item</Button>
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Template</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default TemplateSettings;
