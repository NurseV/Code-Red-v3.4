
import React, { useState, useEffect } from 'react';
import { DepartmentInfo, DepartmentContact } from '../../types';
import * as api from '../../services/api';
import Button from '../ui/Button';

const InfoInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-dark-text-secondary">{label}</label>
        <input {...props} className="mt-1 block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
    </div>
);

const ContactInputGroup: React.FC<{
    title: string;
    contact: DepartmentContact;
    prefix: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ title, contact, prefix, onChange }) => (
    <div>
        <h4 className="font-medium text-dark-text mb-2">{title}</h4>
        <div className="space-y-3 p-3 bg-dark-bg rounded-md border border-dark-border">
            <InfoInput label="Name" id={`${prefix}.name`} name={`${prefix}.name`} value={contact.name} onChange={onChange} />
            <InfoInput label="Role" id={`${prefix}.role`} name={`${prefix}.role`} value={contact.role} onChange={onChange} />
            <InfoInput label="Phone" id={`${prefix}.phone`} name={`${prefix}.phone`} value={contact.phone} onChange={onChange} />
            <InfoInput label="Email" id={`${prefix}.email`} name={`${prefix}.email`} value={contact.email} onChange={onChange} />
        </div>
    </div>
);


const DepartmentInformation: React.FC = () => {
    const [info, setInfo] = useState<DepartmentInfo | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        api.getDepartmentInfo().then(setInfo);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInfo(prev => {
            if (!prev) return null;
            if (name.includes('.')) {
                const [section, field] = name.split('.');
                return { ...prev, [section]: { ...(prev[section] as object), [field]: value } };
            }
            if (name === 'servicesProvided') {
                return { ...prev, servicesProvided: value.split(',').map(s => s.trim()) };
            }
            return { ...prev, [name]: value };
        });
    };
    
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!info) return;
        setIsSaving(true);
        try {
            await api.updateDepartmentInfo(info);
            alert("Department Information Saved!");
        } catch (error) {
            alert("Failed to save information.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!info) {
        return <div className="text-center p-8 text-dark-text-secondary">Loading...</div>;
    }

    return (
        <form onSubmit={handleSave} className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold text-dark-text mb-4">General Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoInput label="Department Name" id="name" name="name" value={info.name} onChange={handleChange} />
                    <InfoInput label="Fire Department ID (FDID)" id="fdid" name="fdid" value={info.fdid} onChange={handleChange} />
                    <InfoInput label="FIPS County Code" id="fipsCode" name="fipsCode" value={info.fipsCode} onChange={handleChange} />
                    <InfoInput label="Phone Number" id="phone" name="phone" type="tel" value={info.phone} onChange={handleChange} />
                    <InfoInput label="Fax Number" id="fax" name="fax" type="tel" value={info.fax} onChange={handleChange} />
                    <InfoInput label="Email Address" id="email" name="email" type="email" value={info.email} onChange={handleChange} />
                </div>
            </div>
            
             <div>
                <h3 className="text-lg font-semibold text-dark-text mb-4">Department Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InfoInput label="Street Address" id="address.street" name="address.street" value={info.address.street} onChange={handleChange} className="md:col-span-3"/>
                    <InfoInput label="City" id="address.city" name="address.city" value={info.address.city} onChange={handleChange} />
                    <InfoInput label="State" id="address.state" name="address.state" value={info.address.state} onChange={handleChange} />
                    <InfoInput label="ZIP Code" id="address.zip" name="address.zip" value={info.address.zip} onChange={handleChange} />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-dark-text mb-4">Operational Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoInput label="Number of Stations" id="stationCount" name="stationCount" type="number" value={info.stationCount} onChange={handleChange} />
                    <InfoInput label="Annual Dispatches" id="annualDispatches" name="annualDispatches" type="number" value={info.annualDispatches} onChange={handleChange} />
                    <InfoInput label="Frequency Status" id="frequencyStatus" name="frequencyStatus" value={info.frequencyStatus} onChange={handleChange} placeholder="e.g., Mostly volunteer" />
                    <InfoInput label="EMS Status" id="emsStatus" name="emsStatus" value={info.emsStatus} onChange={handleChange} placeholder="e.g., Do not provide EMS service"/>
                    <div className="md:col-span-2">
                        <InfoInput label="Services Provided" id="servicesProvided" name="servicesProvided" value={info.servicesProvided.join(', ')} onChange={handleChange} placeholder="Comma-separated list, e.g., Fire Suppression, Rescue" />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-dark-text mb-4">Personnel Counts</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InfoInput label="Paid Firefighters" id="numberOfPaidFirefighters" name="numberOfPaidFirefighters" type="number" value={info.numberOfPaidFirefighters} onChange={handleChange} />
                    <InfoInput label="Volunteer Firefighters" id="numberOfVolunteerFirefighters" name="numberOfVolunteerFirefighters" type="number" value={info.numberOfVolunteerFirefighters} onChange={handleChange} />
                    <InfoInput label="Paid Per Call Volunteers" id="numberOfVolunteerPaidPerCallFirefighters" name="numberOfVolunteerPaidPerCallFirefighters" type="number" value={info.numberOfVolunteerPaidPerCallFirefighters} onChange={handleChange} />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-dark-text mb-4">Key Contacts</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ContactInputGroup title="Primary Contact" contact={info.primaryContact} prefix="primaryContact" onChange={handleChange} />
                    <ContactInputGroup title="Secondary Contact" contact={info.secondaryContact} prefix="secondaryContact" onChange={handleChange} />
                    <ContactInputGroup title="Medical Director" contact={info.medicalDirector} prefix="medicalDirector" onChange={handleChange} />
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-dark-border">
                <Button type="submit" isLoading={isSaving}>Save Department Info</Button>
            </div>
        </form>
    );
};

export default DepartmentInformation;
