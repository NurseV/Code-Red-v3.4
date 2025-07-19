
import React, { useState, useEffect } from 'react';
import { useCitizenAuth } from '../../hooks/useCitizenAuth';
import * as api from '../../services/api';
import { Citizen } from '../../types';
import Button from '../ui/Button';

type Category = 'Emergency Alerts' | 'General Announcements' | 'Event Reminders';
const CATEGORIES: Category[] = ['Emergency Alerts', 'General Announcements', 'Event Reminders'];

const NotificationSettings: React.FC = () => {
    const { citizenUser } = useCitizenAuth();
    const [citizen, setCitizen] = useState<Citizen | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [preferences, setPreferences] = useState<Record<Category, boolean>>({
        'Emergency Alerts': true,
        'General Announcements': true,
        'Event Reminders': false,
    });
    
    useEffect(() => {
        if (citizenUser) {
            api.getCitizenDetails(citizenUser.id)
                .then(data => {
                    if (data && !Array.isArray(data)) {
                        setCitizen(data);
                        if (data.notificationPreferences) {
                            setPreferences(data.notificationPreferences);
                        }
                    }
                })
                .finally(() => setIsLoading(false));
        }
    }, [citizenUser]);
    
    const handleToggle = (category: Category) => {
        const newPreferences = { ...preferences, [category]: !preferences[category] };
        setPreferences(newPreferences);
        if (citizen) {
            api.updateNotificationPreferences(citizen.id, newPreferences)
                .catch(() => alert('Failed to save preference.'));
        }
    };
    
    if (isLoading || !citizen) {
        return <p className="text-dark-text-secondary">Loading preferences...</p>;
    }
    
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-dark-text">Notification Subscriptions</h3>
            <p className="text-sm text-dark-text-secondary">Choose which types of notifications you would like to receive. These may be sent via Email or SMS based on the contact information in your profile.</p>

            <style>{`.toggle-checkbox:checked { right: 0; border-color: #DC2626; } .toggle-checkbox:checked + .toggle-label { background-color: #DC2626; }`}</style>
            
            <div className="space-y-3 bg-dark-bg p-4 rounded-md border border-dark-border">
                {CATEGORIES.map(category => (
                    <div key={category} className="flex justify-between items-center py-2">
                        <span className="text-dark-text">{category}</span>
                        <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                            <input
                                type="checkbox"
                                id={category}
                                checked={preferences[category]}
                                onChange={() => handleToggle(category)}
                                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                            />
                            <label htmlFor={category} className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-500 cursor-pointer"></label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationSettings;
