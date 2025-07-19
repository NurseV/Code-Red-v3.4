
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useCitizenAuth } from '../../hooks/useCitizenAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import * as api from '../../services/api';
import { FireDueStatus, Property, FireDue } from '../../types';
import { CreditCardIcon } from '../../components/icons/Icons';

const CitizenDashboard: React.FC = () => {
    const { citizenUser } = useCitizenAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [dues, setDues] = useState<FireDue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedDue, setSelectedDue] = useState<FireDue | null>(null);

    const fetchDashboardData = () => {
        if (citizenUser) {
            setIsLoading(true);
            api.getCitizenDashboardData(citizenUser.id)
                .then(({ properties, dues }) => {
                    setProperties(properties);
                    setDues(dues);
                })
                .catch(err => console.error("Failed to load citizen data", err))
                .finally(() => setIsLoading(false));
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [citizenUser]);

    const handleOpenPaymentModal = (due: FireDue) => {
        setSelectedDue(due);
        setIsPaymentModalOpen(true);
    };

    const handleProcessPayment = async () => {
        if (!selectedDue) return;
        try {
            await api.payFireDue(selectedDue.id);
            setIsPaymentModalOpen(false);
            setSelectedDue(null);
            fetchDashboardData(); // Refresh data
        } catch (error) {
            alert("Mock payment failed. Please try again.");
        }
    };

    if (!citizenUser || isLoading) {
        return <div className="text-center text-dark-text-secondary p-8">Loading dashboard...</div>;
    }
    
    const getStatusColor = (status: FireDueStatus) => {
        switch (status) {
            case FireDueStatus.PAID: return 'bg-green-500/20 text-green-400';
            case FireDueStatus.UNPAID: return 'bg-yellow-500/20 text-yellow-400';
            case FireDueStatus.OVERDUE: return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };
    
    const hasOverdueBill = dues.some(due => due.status === FireDueStatus.OVERDUE);
    const getPropertyAddress = (propertyId: string) => properties.find(p => p.id === propertyId)?.address || 'N/A';

    return (
        <>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-dark-text">Welcome, {citizenUser.name}!</h1>
                    <p className="mt-1 text-lg text-dark-text-secondary">This is your personal portal.</p>
                </div>

                {hasOverdueBill && (
                    <div className="p-4 bg-red-800/80 border border-red-600 rounded-lg flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-white">Attention Required</h3>
                            <p className="text-red-200 text-sm">You have an overdue fire due. If you are facing financial hardship, you may be eligible for assistance.</p>
                        </div>
                        <ReactRouterDOM.Link to="/portal/bill-forgiveness" className="bg-white text-red-800 font-bold py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
                            Apply for Forgiveness
                        </ReactRouterDOM.Link>
                    </div>
                )}
                
                <Card title="My Properties">
                    {properties.length > 0 ? (
                        <ul className="divide-y divide-dark-border">
                            {properties.map(prop => (
                                <li key={prop.id} className="py-3">
                                    <p className="font-semibold text-dark-text">{prop.address}</p>
                                    <p className="text-sm text-dark-text-secondary">Parcel ID: {prop.parcelId}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-dark-text-secondary">You have no properties linked to your account. Please contact us to get your properties linked.</p>
                    )}
                </Card>

                <Card title="My Fire Dues">
                    {dues.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-dark-border/50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-dark-text-secondary">Property</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-dark-text-secondary">Year</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-dark-text-secondary">Amount</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-dark-text-secondary">Status</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-dark-text-secondary">Due Date</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-dark-text-secondary"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-border">
                                    {dues.map(due => (
                                        <tr key={due.id}>
                                            <td className="px-4 py-3 text-sm text-dark-text">{getPropertyAddress(due.propertyId)}</td>
                                            <td className="px-4 py-3 text-sm text-dark-text">{due.year}</td>
                                            <td className="px-4 py-3 text-sm text-dark-text">${due.amount.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(due.status)}`}>{due.status}</span></td>
                                            <td className="px-4 py-3 text-sm text-dark-text">{new Date(due.dueDate).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 text-sm">
                                                {due.status !== FireDueStatus.PAID && (
                                                    <Button variant="primary" className="py-1 px-2 text-xs" onClick={() => handleOpenPaymentModal(due)}>Pay Now</Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-dark-text-secondary">No fire due information available for your properties.</p>
                    )}
                </Card>
            </div>

            {selectedDue && (
                <Modal title={`Pay Fire Due: $${selectedDue.amount.toFixed(2)}`} isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)}>
                    <div className="space-y-4">
                        <p className="text-dark-text-secondary">You are paying the {selectedDue.year} fire due for the property at {getPropertyAddress(selectedDue.propertyId)}.</p>
                        <div className="p-4 border border-dark-border rounded-lg bg-dark-bg">
                            <label className="block text-sm font-medium text-dark-text-secondary mb-2">Mock Payment Information</label>
                            <div className="space-y-3">
                                <input type="text" placeholder="Card Number" className="w-full bg-dark-card border border-dark-border rounded-md py-2 px-3 text-dark-text" />
                                <div className="flex space-x-3">
                                    <input type="text" placeholder="MM / YY" className="w-1/2 bg-dark-card border border-dark-border rounded-md py-2 px-3 text-dark-text" />
                                    <input type="text" placeholder="CVC" className="w-1/2 bg-dark-card border border-dark-border rounded-md py-2 px-3 text-dark-text" />
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <Button onClick={handleProcessPayment} icon={<CreditCardIcon className="h-4 w-4 mr-2"/>}>
                                Submit Payment
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default CitizenDashboard;
