import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import * as api from '../../services/api';
import { Announcement } from '../../types';

const BurnPermitApplication: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBurnBanActive, setIsBurnBanActive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getAnnouncements()
            .then(announcements => {
                const ban = announcements.some(ann => ann.title.toLowerCase().includes('burn ban'));
                setIsBurnBanActive(ban);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const newPermitData = {
            applicantName: formData.get('applicantName') as string,
            address: formData.get('address') as string,
            phone: formData.get('phone') as string,
            burnType: formData.get('burnType') as string,
            requestedDate: formData.get('requestedDate') as string,
        };

        try {
            await api.createBurnPermit(newPermitData);
            setSubmitted(true);
        } catch (error) {
            alert("Failed to submit application. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <Card title="Burn Permit Application"><div className="text-center p-8">Loading...</div></Card>
    }

    if (submitted) {
        return (
            <Card title="Application Received">
                <div className="text-center">
                    <p className="text-lg text-dark-text mb-4">Your burn permit application has been submitted for review. You will be contacted shortly.</p>
                    <Button onClick={() => setSubmitted(false)}>Submit Another Application</Button>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Burn Permit Application">
            {isBurnBanActive && (
                 <div className="p-4 mb-6 text-yellow-100 bg-yellow-600/50 border border-yellow-500 rounded-md">
                    <h3 className="font-bold">Active Burn Ban Notice</h3>
                    <p className="text-sm">A county-wide burn ban is currently in effect. All permit applications will be denied until the ban is lifted. Please check the announcements for more information.</p>
                </div>
            )}
            <p className="text-dark-text-secondary mb-6">
                Please fill out the form below to apply for a burn permit. Permits are required for all open burning.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="applicantName" className="block text-sm font-medium text-dark-text-secondary mb-1">Full Name</label>
                    <input id="applicantName" name="applicantName" type="text" required disabled={isBurnBanActive} className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:opacity-50" />
                </div>
                 <div>
                    <label htmlFor="address" className="block text-sm font-medium text-dark-text-secondary mb-1">Address of Burn Location</label>
                    <input id="address" name="address" type="text" required disabled={isBurnBanActive} className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:opacity-50" />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-dark-text-secondary mb-1">Contact Phone Number</label>
                    <input id="phone" name="phone" type="tel" required disabled={isBurnBanActive} className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:opacity-50" />
                </div>
                 <div>
                    <label htmlFor="requestedDate" className="block text-sm font-medium text-dark-text-secondary mb-1">Requested Burn Date</label>
                    <input id="requestedDate" name="requestedDate" type="date" required disabled={isBurnBanActive} className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:opacity-50" />
                </div>
                 <div>
                    <label htmlFor="burnType" className="block text-sm font-medium text-dark-text-secondary mb-1">Type of Material to Burn</label>
                    <input id="burnType" name="burnType" type="text" required placeholder="e.g., Yard debris, brush pile" disabled={isBurnBanActive} className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:opacity-50" />
                </div>

                 <div className="pt-4 flex justify-end">
                    <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isBurnBanActive}>Submit Application</Button>
                </div>
            </form>
        </Card>
    );
};

export default BurnPermitApplication;
