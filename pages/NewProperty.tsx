import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import * as api from '../services/api';
import { Property, Owner } from '../types';

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }> = ({ label, error, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-dark-text-secondary mb-1">{label}</label>
        <input {...props} className={`block w-full bg-dark-bg border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none sm:text-sm ${error ? 'border-red-500' : 'border-dark-border focus:border-brand-primary'}`} />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-dark-text-secondary mb-1">{label}</label>
        <select {...props} className="block w-full bg-dark-bg border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none sm:text-sm border-dark-border focus:border-brand-primary">
            {children}
        </select>
    </div>
);

const NewProperty: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Partial<Property>>({
        address: '',
        parcelId: '',
        occupancyType: 'Residential - Single Family',
        constructionType: 'Wood-Frame',
        stories: 1,
        squareFootage: 0,
    });
    const [allOwners, setAllOwners] = useState<Owner[]>([]);
    const [selectedOwnerIds, setSelectedOwnerIds] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        api.getOwners().then(setAllOwners);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOwnerToggle = (ownerId: string) => {
        setSelectedOwnerIds(prev =>
            prev.includes(ownerId) ? prev.filter(id => id !== ownerId) : [...prev, ownerId]
        );
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.address?.trim()) newErrors.address = "Address is required.";
        if (!formData.parcelId?.trim()) newErrors.parcelId = "Parcel ID is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            const newPropertyData = { ...formData, ownerIds: selectedOwnerIds };
            const newProperty = await api.createProperty(newPropertyData);
            alert('Property created successfully!');
            navigate(`/app/properties/${newProperty.id}`);
        } catch (error) {
            alert('Failed to create property.');
            setIsSubmitting(false);
        }
    };

    return (
        <Card title="Add New Property">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Property Address" id="address" name="address" value={formData.address || ''} onChange={handleChange} required error={errors.address} />
                    <Input label="Parcel ID" id="parcelId" name="parcelId" value={formData.parcelId || ''} onChange={handleChange} required error={errors.parcelId} />
                    <Select label="Occupancy Type" id="occupancyType" name="occupancyType" value={formData.occupancyType} onChange={handleChange}>
                        <option>Residential - Single Family</option>
                        <option>Residential - Multi-Family</option>
                        <option>Commercial</option>
                        <option>Industrial</option>
                        <option>Vacant</option>
                    </Select>
                    <Select label="Construction Type" id="constructionType" name="constructionType" value={formData.constructionType} onChange={handleChange}>
                        <option>Wood-Frame</option>
                        <option>Masonry</option>
                        <option>Steel</option>
                        <option>Concrete</option>
                    </Select>
                    <Input label="Stories" id="stories" name="stories" type="number" value={formData.stories || ''} onChange={handleChange} />
                    <Input label="Square Footage" id="squareFootage" name="squareFootage" type="number" value={formData.squareFootage || ''} onChange={handleChange} />
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold text-dark-text mb-2">Assign Owner(s)</h3>
                    <div className="p-4 bg-dark-bg rounded-md border border-dark-border max-h-48 overflow-y-auto space-y-2">
                        {allOwners.map(owner => (
                            <label key={owner.id} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-dark-card">
                                <input
                                    type="checkbox"
                                    checked={selectedOwnerIds.includes(owner.id)}
                                    onChange={() => handleOwnerToggle(owner.id)}
                                    className="h-4 w-4 rounded border-gray-500 text-brand-primary focus:ring-transparent"
                                />
                                <span>{owner.name} ({owner.mailingAddress})</span>
                            </label>
                        ))}
                         {allOwners.length === 0 && <p className="text-sm text-dark-text-secondary text-center">No owners found. Please add owners first.</p>}
                    </div>
                </div>

                <div className="pt-5 border-t border-dark-border flex justify-end space-x-3">
                    <Button type="button" variant="ghost" onClick={() => navigate('/app/properties')}>Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>Create Property</Button>
                </div>
            </form>
        </Card>
    );
};

export default NewProperty;