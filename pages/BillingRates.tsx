
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import * as api from '../services/api';
import { BillingRate } from '../types';
import { EditIcon, SaveIcon } from '../components/icons/Icons';

const BillingRates: React.FC = () => {
    const [rates, setRates] = useState<BillingRate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const fetchRates = () => {
        setIsLoading(true);
        api.getBillingRates().then(setRates).finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchRates();
    }, []);

    const handleRateChange = (id: string, newRate: number) => {
        setRates(prev => prev.map(r => r.id === id ? { ...r, rate: newRate } : r));
    };

    const handleSaveChanges = async () => {
        try {
            await api.updateBillingRates(rates);
            alert("Billing rates updated successfully.");
            setIsEditing(false);
        } catch (e) {
            alert("Failed to save billing rates.");
        }
    };
    
    const handleCancel = () => {
        fetchRates(); // Re-fetch original rates
        setIsEditing(false);
    }

    if (isLoading) return <div className="text-center p-8 text-dark-text-secondary">Loading billing rates...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-dark-text">Service Billing Rates</h3>
                 {isEditing ? (
                    <div className="flex space-x-2">
                        <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                        <Button onClick={handleSaveChanges} icon={<SaveIcon className="h-4 w-4 mr-2" />}>Save Changes</Button>
                    </div>
                ) : (
                    <Button onClick={() => setIsEditing(true)} icon={<EditIcon className="h-4 w-4 mr-2" />}>Edit Rates</Button>
                )}
            </div>
             <p className="text-sm text-dark-text-secondary mb-6">These rates are used when generating invoices for billable incidents like MVAs or hazard mitigations.</p>

            <div className="space-y-4 max-w-lg mx-auto">
                {rates.map(rate => (
                    <div key={rate.id} className="grid grid-cols-2 gap-4 items-center bg-dark-bg p-4 rounded-lg border border-dark-border">
                        <label className="text-dark-text font-medium">{rate.item}</label>
                        <div className="flex items-center space-x-2">
                            <span className="text-dark-text-secondary">$</span>
                            <input 
                                type="number" 
                                value={rate.rate} 
                                onChange={e => handleRateChange(rate.id, Number(e.target.value))} 
                                disabled={!isEditing}
                                className="w-32 bg-dark-card border border-dark-border rounded-md py-2 px-3 text-dark-text disabled:bg-dark-bg disabled:opacity-70" 
                            />
                            <span className="text-dark-text-secondary">/ {rate.unit === 'per_hour' ? 'hour' : 'incident'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BillingRates;
