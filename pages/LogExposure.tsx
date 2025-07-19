
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import * as api from '../services/api';
import { useInternalAuth } from '../hooks/useInternalAuth';
import { Incident, NfirsIncident } from '../types';

const LogExposure: React.FC = () => {
    const { id: incidentId } = ReactRouterDOM.useParams<{ id: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const { user } = useInternalAuth();
    const [incident, setIncident] = useState<NfirsIncident | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        exposureType: 'Smoke',
        details: '',
    });

    useEffect(() => {
        if (incidentId) {
            api.getIncidentById(incidentId)
                .then(setIncident)
                .finally(() => setIsLoading(false));
        }
    }, [incidentId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !incidentId || !incident) return;

        setIsSubmitting(true);
        try {
            const logData = {
                personnelId: user.id,
                incidentId: incidentId,
                incidentNumber: incident.incidentNumber,
                exposureDate: incident.date,
                exposureType: formData.exposureType as 'Chemical' | 'Biological' | 'Smoke' | 'Stress' | 'Other',
                details: formData.details,
            };
            await api.createExposureLog(logData);
            alert('Exposure log created successfully.');
            navigate(`/app/incidents/${incidentId}`);
        } catch (error) {
            alert('Failed to create exposure log.');
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="text-center text-dark-text-secondary">Loading...</div>;
    }

    if (!incident) {
        return <div className="text-center text-red-500">Incident not found.</div>;
    }

    return (
        <Card title="Log Confidential Exposure">
            <div className="p-4 mb-6 text-yellow-100 bg-yellow-600/50 border border-yellow-500 rounded-md">
                <h3 className="font-bold">Confidential Report</h3>
                <p className="text-sm">This entry is confidential and will be linked to your personnel file for health tracking purposes. It is not part of the official incident report.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-dark-text-secondary">Incident Number</label>
                    <p className="text-dark-text mt-1">{incident.incidentNumber}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-dark-text-secondary">Incident Date</label>
                    <p className="text-dark-text mt-1">{new Date(incident.date).toLocaleDateString()}</p>
                </div>
                 <div>
                    <label htmlFor="exposureType" className="block text-sm font-medium text-dark-text-secondary mb-1">Type of Exposure</label>
                    <select
                        id="exposureType"
                        name="exposureType"
                        value={formData.exposureType}
                        onChange={handleInputChange}
                        className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                    >
                        <option>Smoke</option>
                        <option>Chemical</option>
                        <option>Biological</option>
                        <option>Stress</option>
                        <option>Other</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="details" className="block text-sm font-medium text-dark-text-secondary mb-1">Details of Exposure</label>
                    <textarea
                        id="details"
                        name="details"
                        rows={5}
                        required
                        value={formData.details}
                        onChange={handleInputChange}
                        placeholder="Describe the exposure event. e.g., 'Exposed to hydraulic fluid from a leaking line during extrication.'"
                        className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                    />
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                    <Button type="button" variant="ghost" onClick={() => navigate(`/app/incidents/${incidentId}`)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isSubmitting}>
                        Save Confidential Log
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default LogExposure;
