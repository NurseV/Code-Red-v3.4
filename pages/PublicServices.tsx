
import React, { useState, useEffect } from 'react';
import Table from '../components/ui/Table';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import * as api from '../services/api';
import { StormShelter, BurnPermit, BurnPermitStatus } from '../types';

const StormShelterTab: React.FC = () => {
    const [shelters, setShelters] = useState<StormShelter[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getStormShelters()
            .then(setShelters)
            .finally(() => setIsLoading(false));
    }, []);

    const columns = [
        { header: 'Address', accessor: (item: StormShelter) => item.address },
        { header: 'Owner Name', accessor: (item: StormShelter) => item.ownerName },
        { header: 'Location Details', accessor: (item: StormShelter) => item.locationOnProperty },
        { header: 'Contact Phone', accessor: (item: StormShelter) => item.contactPhone },
    ];
    
    if(isLoading) return <div className="text-center p-8 text-dark-text-secondary">Loading storm shelters...</div>;

    return <Table columns={columns} data={shelters} />;
};

const BurnPermitsTab: React.FC = () => {
    const [permits, setPermits] = useState<BurnPermit[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getBurnPermits()
            .then(setPermits)
            .finally(() => setIsLoading(false));
    }, []);

    const handleStatusChange = async (id: string, status: BurnPermitStatus) => {
        try {
            await api.updateBurnPermitStatus(id, status);
            setPermits(permits.map(p => p.id === id ? { ...p, status } : p));
        } catch (error) {
            alert("Failed to update permit status.");
        }
    };
    
    const getStatusColor = (status: BurnPermitStatus) => {
        switch (status) {
            case BurnPermitStatus.APPROVED: return 'bg-green-500/20 text-green-400';
            case BurnPermitStatus.PENDING: return 'bg-yellow-500/20 text-yellow-400';
            case BurnPermitStatus.DENIED: return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const columns = [
        { header: 'Applicant', accessor: (item: BurnPermit) => item.applicantName },
        { header: 'Address', accessor: (item: BurnPermit) => item.address },
        { header: 'Burn Type', accessor: (item: BurnPermit) => item.burnType },
        { header: 'Date Requested', accessor: (item: BurnPermit) => new Date(item.requestedDate).toLocaleDateString() },
        {
            header: 'Status',
            accessor: (item: BurnPermit) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                </span>
            ),
        },
        {
            header: 'Actions',
            accessor: (item: BurnPermit) => (
                item.status === BurnPermitStatus.PENDING ? (
                    <div className="space-x-2">
                        <Button onClick={() => handleStatusChange(item.id, BurnPermitStatus.APPROVED)} className="py-1 px-2 text-xs bg-green-600 hover:bg-green-700">Approve</Button>
                        <Button onClick={() => handleStatusChange(item.id, BurnPermitStatus.DENIED)} variant="danger" className="py-1 px-2 text-xs">Deny</Button>
                    </div>
                ) : null
            ),
        },
    ];
    
    if(isLoading) return <div className="text-center p-8 text-dark-text-secondary">Loading burn permits...</div>;

    return <Table columns={columns} data={permits} />;
};

const PublicServices: React.FC = () => {
    const TABS = [
        { label: 'Storm Shelters', content: <StormShelterTab /> },
        { label: 'Burn Permits', content: <BurnPermitsTab /> },
    ];

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Public Services Management</h2>
            <Tabs tabs={TABS} />
        </div>
    );
};

export default PublicServices;
