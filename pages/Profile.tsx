import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useInternalAuth } from '../hooks/useInternalAuth';
import * as api from '../services/api';
import { Personnel } from '../types';

const Profile: React.FC = () => {
    const { user, login } = useInternalAuth();
    const [profile, setProfile] = useState<Personnel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        if (user) {
            api.getPersonnelById(user.id)
                .then(data => {
                    setProfile(data);
                    if (data) {
                        setFormData({ 
                            name: data.name, 
                            email: data.emails?.[0]?.address || '', 
                            phone: data.phoneNumbers?.[0]?.number || '' 
                        });
                    }
                })
                .finally(() => setIsLoading(false));
        }
    }, [user]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setIsLoading(true);
        try {
            // This is a simplified update. A real app would handle multiple emails/phones.
            const updatedProfileData: Partial<Personnel> = {
                name: formData.name,
                emails: profile.emails.length > 0 ? [{ ...profile.emails[0], address: formData.email }] : [{ type: 'Work', address: formData.email }],
                phoneNumbers: profile.phoneNumbers.length > 0 ? [{ ...profile.phoneNumbers[0], number: formData.phone }] : [{ type: 'Mobile', number: formData.phone }],
            };

            const updatedProfile = await api.updateUserProfile(profile.id, updatedProfileData);
            setProfile(updatedProfile);
            // Re-login to update user context if name changed
            if (user && user.name !== updatedProfile.name) {
                await login(updatedProfile.username);
            }
            setIsEditing(false);
        } catch (error) {
            alert("Failed to update profile.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="text-center text-dark-text-secondary">Loading profile...</div>;
    }

    if (!profile) {
        return <div className="text-center text-red-500">Could not load profile data.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <div className="flex flex-col md:flex-row items-center">
                    <img className="h-24 w-24 rounded-full object-cover border-4 border-dark-border" src={profile.avatarUrl} alt="User avatar" />
                    <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-dark-text">{profile.name}</h2>
                        <p className="text-xl text-dark-text-secondary">{profile.rank}</p>
                        <p className="text-md text-dark-text-secondary">{profile.role}</p>
                    </div>
                    <div className="md:ml-auto mt-4 md:mt-0">
                        {!isEditing && <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>}
                    </div>
                </div>
            </Card>

            <form onSubmit={handleSave}>
                <Card title="Contact Information" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-dark-text-secondary">Full Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} className="mt-1 block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text disabled:opacity-70 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-dark-text-secondary">Email Address</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} className="mt-1 block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text disabled:opacity-70 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"/>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-dark-text-secondary">Phone Number</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} className="mt-1 block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text disabled:opacity-70 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"/>
                        </div>
                    </div>
                </Card>

                <Card title="Security" className="mt-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-medium text-dark-text">Password</h3>
                            <p className="text-sm text-dark-text-secondary">Last changed: 3 months ago</p>
                        </div>
                        <Button variant="secondary" onClick={() => alert("This feature is not yet implemented.")} disabled={!isEditing}>Change Password</Button>
                    </div>
                </Card>
                
                {isEditing && (
                    <div className="mt-6 flex justify-end space-x-3">
                        <Button type="button" variant="ghost" onClick={() => { setIsEditing(false); setFormData({ name: profile.name, email: profile.emails?.[0]?.address || '', phone: profile.phoneNumbers?.[0]?.number || '' }); }}>Cancel</Button>
                        <Button type="submit" isLoading={isLoading}>Save Changes</Button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default Profile;
