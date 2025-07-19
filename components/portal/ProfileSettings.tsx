
import React, { useState, useEffect } from 'react';
import { useCitizenAuth } from '../../hooks/useCitizenAuth';
import * as api from '../../services/api';
import { Citizen } from '../../types';
import Button from '../ui/Button';
import { PlusIcon, XIcon } from '../icons/Icons';

const ProfileSettings: React.FC = () => {
    const { citizenUser, login } = useCitizenAuth();
    const [citizen, setCitizen] = useState<Citizen | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [newPhoneNumber, setNewPhoneNumber] = useState<{ number: string; type: 'Mobile' | 'Home' | 'Work' }>({ number: '', type: 'Mobile' });

    const fetchCitizenData = () => {
        if (citizenUser) {
            setIsLoading(true);
            api.getCitizenDetails(citizenUser.id)
                .then(data => {
                    if (data && !Array.isArray(data)) {
                        setCitizen(data);
                        setFormData({ name: data.name, email: data.email });
                    }
                })
                .finally(() => setIsLoading(false));
        }
    };

    useEffect(() => {
        fetchCitizenData();
    }, [citizenUser]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!citizen) return;

        try {
            await api.updateCitizenDetails(citizen.id, formData);
            // Re-login to update context if name or email changes
            if (citizen.password) {
                await login(formData.email, citizen.password);
            }
            setIsEditing(false);
            fetchCitizenData();
             alert('Profile updated successfully!');
        } catch (error) {
            alert('Failed to update profile.');
        }
    };

    const handleAddPhone = async () => {
        if (!citizen || !newPhoneNumber.number) return;
        try {
            await api.addPhoneNumber(citizen.id, newPhoneNumber);
            setNewPhoneNumber({ number: '', type: 'Mobile' });
            fetchCitizenData();
        } catch (error) {
            alert('Failed to add phone number.');
        }
    };

    const handleDeletePhone = async (number: string) => {
        if (!citizen) return;
        if (window.confirm(`Are you sure you want to delete the number ${number}?`)) {
            try {
                await api.deletePhoneNumber(citizen.id, number);
                fetchCitizenData();
            } catch (error) {
                alert('Failed to delete phone number.');
            }
        }
    };

    if (isLoading || !citizen) {
        return <p className="text-dark-text-secondary">Loading profile...</p>;
    }

    return (
        <div className="space-y-8">
            {/* Profile Info */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
                <h3 className="text-lg font-semibold text-dark-text">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Full Name</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={!isEditing} className="w-full bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text disabled:opacity-70" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Email Address</label>
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={!isEditing} className="w-full bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text disabled:opacity-70" />
                    </div>
                </div>
                <div className="flex justify-end space-x-2">
                    {isEditing ? (
                        <>
                            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </>
                    ) : (
                        <Button type="button" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    )}
                </div>
            </form>

            {/* Phone Numbers */}
            <div className="space-y-4 pt-8 border-t border-dark-border">
                <h3 className="text-lg font-semibold text-dark-text">Phone Numbers for Notifications</h3>
                 <ul className="space-y-2">
                    {citizen.phoneNumbers?.map(phone => (
                        <li key={phone.number} className="flex justify-between items-center p-2 bg-dark-bg rounded-md">
                            <span>{phone.number} <span className="text-xs text-dark-text-secondary">({phone.type})</span></span>
                            <Button variant="ghost" onClick={() => handleDeletePhone(phone.number)} className="p-1"><XIcon className="h-4 w-4 text-red-500"/></Button>
                        </li>
                    ))}
                </ul>
                <div className="flex items-end space-x-2 p-3 bg-dark-bg rounded-md border border-dark-border">
                    <div className="flex-grow">
                         <label className="block text-xs font-medium text-dark-text-secondary mb-1">New Phone Number</label>
                        <input type="tel" value={newPhoneNumber.number} onChange={e => setNewPhoneNumber({...newPhoneNumber, number: e.target.value})} className="w-full bg-dark-card border border-dark-border rounded-md py-2 px-3 text-dark-text" placeholder="e.g., 555-123-4567"/>
                    </div>
                    <div className="w-1/3">
                        <label className="block text-xs font-medium text-dark-text-secondary mb-1">Type</label>
                        <select value={newPhoneNumber.type} onChange={e => setNewPhoneNumber({...newPhoneNumber, type: e.target.value as 'Mobile' | 'Home' | 'Work'})} className="w-full bg-dark-card border border-dark-border rounded-md py-2 px-3 text-dark-text">
                            <option>Mobile</option>
                            <option>Home</option>
                            <option>Work</option>
                        </select>
                    </div>
                    <Button onClick={handleAddPhone} icon={<PlusIcon className="h-5 w-5"/>}></Button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
