import React from 'react';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';

// Import the individual tab components
import FinancialsDashboard from './FinancialsDashboard';
import { FireDues } from './FireDues';
import Budgeting from './Budgeting';
import Invoicing from './Invoicing';

const Financials: React.FC = () => {
    const TABS = [
        { label: 'Dashboard', content: <FinancialsDashboard /> },
        { label: 'Invoicing', content: <Invoicing /> },
        { label: 'Fire Dues', content: <FireDues /> },
        { label: 'Budgeting', content: <Budgeting /> },
    ];

    return (
        <Card>
            <Tabs tabs={TABS} tabsContainerClassName="px-6" />
        </Card>
    );
};

export default Financials;
