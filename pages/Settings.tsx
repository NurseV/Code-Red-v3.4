

import React from 'react';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';

import DepartmentInformation from '../components/settings/DepartmentInformation';
import SystemListSettings from '../components/settings/SystemListSettings';
import FinancialSettings from '../components/settings/FinancialSettings';
import TemplateSettings from './ChecklistTemplates';
import AuditLogView from '../components/settings/AuditLogView';
import SecurityRoleSettings from '../components/settings/SecurityRoleSettings';
import NfirsFieldSettings from '../components/settings/NfirsFieldSettings';


const Settings: React.FC = () => {

    const TABS = [
        { label: 'Department Info', content: <DepartmentInformation /> },
        { label: 'System Lists', content: <SystemListSettings /> },
        { label: 'NFIRS Fields', content: <NfirsFieldSettings /> },
        { label: 'Security Roles', content: <SecurityRoleSettings /> },
        { label: 'Financials', content: <FinancialSettings /> },
        { label: 'Checklist Templates', content: <TemplateSettings /> },
        { label: 'Audit Log', content: <AuditLogView /> },
    ];

    return (
        <Card title="System Settings">
            <p className="text-sm text-dark-text-secondary mb-6">
                Manage system-wide options and categories. Changes made here will be reflected across the application.
            </p>
            <Tabs tabs={TABS} />
        </Card>
    );
};

export default Settings;