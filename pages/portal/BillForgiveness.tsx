
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useCitizenAuth } from '../../hooks/useCitizenAuth';
import * as api from '../../services/api';
import { FireDue } from '../../types';

const BillForgiveness: React.FC = () => {
    const { citizenUser } = useCitizenAuth();
    const navigate = ReactRouterDOM.useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reason, setReason] = useState("");
    const [selectedDueId, setSelectedDueId] = useState("");
    const [overdueDues, setOverdueDues] = useState<FireDue[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (citizenUser) {
            api.getOverdueDuesForCitizen(citizenUser.id)
                .then(dues => {
                    setOverdueDues(dues);
                    if (dues.length > 0) {
                        setSelectedDueId(dues[0].id);
                    }
                })
                .finally(() => setIsLoading(false));
        }
    }, [citizenUser]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!reason || !selectedDueId || !citizenUser) return;
        setIsSubmitting(true);
        
        try {
            await api.createBillForgivenessRequest(citizenUser.id, selectedDueId, reason);
            setSubmitted(true);
        } catch (e) {
            alert('Failed to submit request.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <Card title="Bill Forgiveness Application"><div className="text-center p-8">Loading...</div></Card>;
    }

    if (submitted) {
        return (
            <Card title="Request Submitted">
                <div className="text-center">
                    <p className="text-lg text-dark-text mb-4">Your request for bill forgiveness has been submitted for review. We will contact you soon regarding your application.</p>
                    <Button onClick={() => navigate('/portal/dashboard')}>Return to Dashboard</Button>
                </div>
            </Card>
        );
    }
    
    if (overdueDues.length === 0) {
        return (
             <Card title="Bill Forgiveness Application">
                 <p className="text-dark-text-secondary text-center">You have no overdue bills eligible for a forgiveness application.</p>
                  <div className="mt-4 text-center">
                    <Button onClick={() => navigate('/portal/dashboard')}>Return to Dashboard</Button>
                </div>
             </Card>
        )
    }

    return (
        <Card title="Bill Forgiveness Application">
            <p className="text-dark-text-secondary mb-6">
                We understand that financial hardships can happen. Please select the overdue bill and briefly explain your circumstances for our review.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="overdueBill" className="block text-sm font-medium text-dark-text-secondary mb-1">Select Overdue Bill</label>
                    <select 
                        id="overdueBill" 
                        name="overdueBill"
                        value={selectedDueId}
                        onChange={(e) => setSelectedDueId(e.target.value)}
                        className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                    >
                        {overdueDues.map(due => (
                            <option key={due.id} value={due.id}>
                                {due.year} Bill - ${due.amount.toFixed(2)} (Due: {new Date(due.dueDate).toLocaleDateString()})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-dark-text-secondary mb-1">Reason for Request</label>
                    <textarea 
                        id="reason" 
                        name="reason" 
                        rows={5} 
                        required 
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Please describe the financial hardship you are experiencing..." 
                        className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" 
                     />
                </div>
                 <div className="pt-4 flex justify-end space-x-3">
                    <Button type="button" variant="ghost" onClick={() => navigate('/portal/dashboard')}>Cancel</Button>
                    <Button type="submit" variant="primary" isLoading={isSubmitting}>Submit Request</Button>
                </div>
            </form>
        </Card>
    );
};

export default BillForgiveness;
