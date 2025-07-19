import React, { useState, useEffect } from 'react';
import Tabs from '../ui/Tabs';
import Button from '../ui/Button';
import * as api from '../../services/api';
import { BillingRate } from '../../types';

const AnnualDuesTab: React.FC = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [amount, setAmount] = useState('');

    const handleSetDues = async () => {
        if (!amount || !year) {
            alert("Please enter a valid year and amount.");
            return;
        }
        if (window.confirm(`Are you sure you want to set the annual fire due to $${amount} for all unpaid properties in ${year}? This cannot be undone.`)) {
            try {
                const result = await api.setAnnualFireDue(Number(amount), year);
                alert(`Successfully updated ${result.updatedCount} properties.`);
                setAmount('');
            } catch (e) {
                alert("Failed to set annual dues.");
            }
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <h3 className="text-lg font-medium text-dark-text">Set Annual Fire Due</h3>
            <p className="text-sm text-dark-text-secondary mt-1 mb-4">This will apply the specified amount to all properties with an 'Unpaid' status for the selected year.</p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="year" className="block text-sm font-medium text-dark-text-secondary mb-1">Fiscal Year</label>
                    <input id="year" type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="block w-full bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-dark-text-secondary mb-1">Annual Due Amount ($)</label>
                    <input id="amount" type="number" placeholder="150.00" value={amount} onChange={e => setAmount(e.target.value)} className="block w-full bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text sm:text-sm" />
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSetDues}>Apply Amount</Button>
                </div>
            </div>
        </div>
    );
};

const BillingRatesTab: React.FC = () => {
    const [rates, setRates] = useState<BillingRate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRates = () => {
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
        } catch(e) {
            alert("Failed to save billing rates.");
        }
    }

    if (isLoading) return <div className="text-center p-8 text-dark-text-secondary">Loading billing rates...</div>;

    return (
        <div>
            <div className="space-y-4">
            {rates.map(rate => (
                <div key={rate.id} className="grid grid-cols-3 gap-4 items-center">
                    <label className="text-dark-text">{rate.item} Rate</label>
                    <div className="col-span-2 flex items-center space-x-2">
                        <span className="text-dark-text-secondary">$</span>
                        <input type="number" value={rate.rate} onChange={e => handleRateChange(rate.id, Number(e.target.value))} className="w-32 bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text sm:text-sm" />
                        <span className="text-dark-text-secondary">/ {rate.unit === 'per_hour' ? 'hour' : 'incident'}</span>
                    </div>
                </div>
            ))}
            </div>
            <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>
        </div>
    );
};

const FinancialSettings: React.FC = () => {
    const TABS = [
        { label: 'Annual Dues', content: <AnnualDuesTab /> },
        { label: 'Billing Rates', content: <BillingRatesTab /> },
    ];
    return <Tabs tabs={TABS} />;
};

export default FinancialSettings;