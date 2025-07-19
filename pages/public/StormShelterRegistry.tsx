
import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import * as api from '../../services/api';
import ShelterMap from '../../components/gis/ShelterMap';
import { Coordinates } from '../../types';

const StormShelterRegistry: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shelterLocation, setShelterLocation] = useState<Coordinates | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const newShelterData = {
            ownerName: formData.get('ownerName') as string,
            address: formData.get('address') as string,
            contactPhone: formData.get('contactPhone') as string,
            locationOnProperty: formData.get('locationOnProperty') as string,
            propertyId: '', // In a real app, this would be linked
            coordinates: shelterLocation,
        };

        try {
            await api.createStormShelter(newShelterData);
            setSubmitted(true);
        } catch (error) {
            alert("Failed to register shelter. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <Card title="Registration Successful">
                <div className="text-center">
                    <p className="text-lg text-dark-text mb-4">Thank you for registering your storm shelter. Your information has been received.</p>
                    <Button onClick={() => setSubmitted(false)}>Register Another Shelter</Button>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Storm Shelter Registry">
            <p className="text-dark-text-secondary mb-6">
                Registering your storm shelter provides first responders with critical information that can help them locate you faster in an emergency. All information is kept confidential.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="ownerName" className="block text-sm font-medium text-dark-text-secondary mb-1">Full Name</label>
                            <input id="ownerName" name="ownerName" type="text" required className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-dark-text-secondary mb-1">Property Address of Shelter</label>
                            <input id="address" name="address" type="text" required className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="contactPhone" className="block text-sm font-medium text-dark-text-secondary mb-1">Best Contact Phone Number</label>
                            <input id="contactPhone" name="contactPhone" type="tel" required className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="locationOnProperty" className="block text-sm font-medium text-dark-text-secondary mb-1">Location on Property (Description)</label>
                            <textarea id="locationOnProperty" name="locationOnProperty" rows={3} required placeholder="e.g., Underground, accessible from back patio; In-garage safe room" className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Mark Shelter Location on Map</label>
                         <div className="h-96 w-full rounded-lg overflow-hidden border border-dark-border">
                            <ShelterMap onLocationChange={setShelterLocation} />
                        </div>
                        <p className="text-xs text-dark-text-secondary mt-1">Click on the map to place or move the pin.</p>
                    </div>
                </div>
                 <div className="pt-4 flex justify-end">
                    <Button type="submit" variant="primary" isLoading={isSubmitting}>Submit Registration</Button>
                </div>
            </form>
        </Card>
    );
};

export default StormShelterRegistry;
