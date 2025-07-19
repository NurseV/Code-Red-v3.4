
import React from 'react';
import Card from '../../components/ui/Card';
import Tabs from '../../components/ui/Tabs';
import ProfileSettings from '../../components/portal/ProfileSettings';
import PropertySettings from '../../components/portal/PropertySettings';
import NotificationSettings from '../../components/portal/NotificationSettings';

const AccountSettings: React.FC = () => {

    const TABS = [
        { label: 'My Profile', content: <ProfileSettings /> },
        { label: 'My Properties', content: <PropertySettings /> },
        { label: 'Notification Preferences', content: <NotificationSettings /> },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-dark-text mb-2">Account Settings</h1>
            <p className="text-dark-text-secondary mb-6">Manage your contact information, linked properties, and notification preferences.</p>
            <Card>
                <Tabs tabs={TABS} />
            </Card>
        </div>
    );
};

export default AccountSettings;
