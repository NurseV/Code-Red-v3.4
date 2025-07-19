import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FileCheckIcon, ShieldAlertIcon } from '../../components/icons/Icons';
import * as api from '../../services/api';

const RecordsRequest: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        requesterName: '',
        requesterEmail: '',
        requesterPhone: '',
        description: '',
        dateRangeStart: '',
        dateRangeEnd: '',
        requestedFormat: 'Electronic' as 'Electronic' | 'Paper',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.createRecordsRequest(formData);
            setSubmitted(true);
        } catch (error) {
            alert("Failed to submit your request. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <Card title="Request Submitted Successfully">
                <div className="text-center">
                    <FileCheckIcon className="mx-auto h-16 w-16 text-green-500" />
                    <h2 className="mt-4 text-2xl font-bold text-dark-text">Thank You</h2>
                    <p className="mt-2 text-dark-text-secondary">Your public records request has been received. We will process it in accordance with applicable laws and will contact you at the email address provided.</p>
                    <p className="mt-2 text-sm text-dark-text-secondary">Your request ID will be sent to your email.</p>
                    <Button onClick={() => setSubmitted(false)} className="mt-6">Submit Another Request</Button>
                </div>
            </Card>
        );
    }
    
    return (
        <Card title="Public Records Request Form">
            <div className="p-4 mb-6 text-yellow-100 bg-yellow-600/50 border border-yellow-500 rounded-md flex items-start space-x-3">
                <ShieldAlertIcon className="h-6 w-6 mt-1 flex-shrink-0" />
                <div>
                    <h3 className="font-bold">Public Records Disclaimer</h3>
                    <p className="text-sm">
                        This request is subject to public records laws. Information you submit may be considered a public record and may be subject to disclosure. Do not include sensitive personal information not required by this form.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="requesterName" className="block text-sm font-medium text-dark-text-secondary mb-1">Full Name</label>
                        <input id="requesterName" name="requesterName" type="text" required value={formData.requesterName} onChange={handleInputChange} className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="requesterEmail" className="block text-sm font-medium text-dark-text-secondary mb-1">Email Address</label>
                        <input id="requesterEmail" name="requesterEmail" type="email" required value={formData.requesterEmail} onChange={handleInputChange} className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="requesterPhone" className="block text-sm font-medium text-dark-text-secondary mb-1">Phone Number (Optional)</label>
                        <input id="requesterPhone" name="requesterPhone" type="tel" value={formData.requesterPhone} onChange={handleInputChange} className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="requestedFormat" className="block text-sm font-medium text-dark-text-secondary mb-1">Requested Format</label>
                        <select id="requestedFormat" name="requestedFormat" value={formData.requestedFormat} onChange={handleInputChange} className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                            <option>Electronic</option>
                            <option>Paper</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-dark-text-secondary mb-1">Description of Records Requested</label>
                    <textarea id="description" name="description" rows={5} required value={formData.description} onChange={handleInputChange} placeholder="Please be as specific as possible. Include incident numbers, dates, addresses, or names if known." className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-1">Date Range of Records (Optional)</label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="dateRangeStart" className="block text-xs font-medium text-dark-text-secondary mb-1">Start Date</label>
                            <input id="dateRangeStart" name="dateRangeStart" type="date" value={formData.dateRangeStart} onChange={handleInputChange} className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                         </div>
                         <div>
                            <label htmlFor="dateRangeEnd" className="block text-xs font-medium text-dark-text-secondary mb-1">End Date</label>
                            <input id="dateRangeEnd" name="dateRangeEnd" type="date" value={formData.dateRangeEnd} onChange={handleInputChange} className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                         </div>
                     </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button type="submit" variant="primary" isLoading={isSubmitting}>Submit Request</Button>
                </div>
            </form>
        </Card>
    );
};

export default RecordsRequest;