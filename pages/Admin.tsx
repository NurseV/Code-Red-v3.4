
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import * as api from '../services/api';
import { Citizen, CitizenStatus, BillForgivenessRequest } from '../types';

interface DetailedForgivenessRequest extends BillForgivenessRequest {
    citizenName?: string;
    fireDueInfo?: string;
}

const CitizenApprovalTab: React.FC = () => {
    const [citizens, setCitizens] = useState<Citizen[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPendingCitizens = () => {
        setIsLoading(true);
        api.getPendingCitizens()
            .then(setCitizens)
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchPendingCitizens();
    }, []);

    const handleApproval = async (id: string, newStatus: CitizenStatus.ACTIVE | CitizenStatus.DENIED) => {
        try {
            await api.updateCitizenStatus(id, newStatus);
            fetchPendingCitizens(); // Refresh list
        } catch (error) {
            alert("Failed to update citizen status.");
        }
    };

    const columns = [
        { header: 'Name', accessor: (item: Citizen) => item.name },
        { header: 'Email', accessor: (item: Citizen) => item.email },
        {
            header: 'Actions',
            accessor: (item: Citizen) => (
                <div className="space-x-2">
                    <Button onClick={() => handleApproval(item.id, CitizenStatus.ACTIVE)} className="py-1 px-2 text-xs bg-green-600 hover:bg-green-700">Approve</Button>
                    <Button onClick={() => handleApproval(item.id, CitizenStatus.DENIED)} variant="danger" className="py-1 px-2 text-xs">Deny</Button>
                </div>
            )
        }
    ];

    if (isLoading) return <div className="text-center p-8 text-dark-text-secondary">Loading pending citizens...</div>;
    if (citizens.length === 0) return <p className="text-center text-dark-text-secondary py-4">No pending citizen registrations.</p>;
    return <Table columns={columns} data={citizens} />;
};

const ForgivenessRequestsTab: React.FC = () => {
    const [requests, setRequests] = useState<DetailedForgivenessRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRequests = () => {
        setIsLoading(true);
        api.getPendingForgivenessRequests()
            .then(setRequests)
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchRequests();
    }, []);
    

    const handleApproval = async (id: string, newStatus: 'Approved' | 'Denied') => {
        try {
            await api.updateForgivenessRequestStatus(id, newStatus);
            fetchRequests(); // Refresh list
        } catch (error) {
            alert("Failed to update request status.");
        }
    };
    
    const columns = [
        { header: 'Citizen', accessor: (item: DetailedForgivenessRequest) => item.citizenName },
        { header: 'Fire Due', accessor: (item: DetailedForgivenessRequest) => item.fireDueInfo },
        { header: 'Reason', accessor: (item: DetailedForgivenessRequest) => <p className="text-sm whitespace-normal max-w-xs">{item.reason}</p> },
        { header: 'Submitted', accessor: (item: DetailedForgivenessRequest) => new Date(item.submittedAt).toLocaleDateString() },
        {
            header: 'Actions',
            accessor: (item: DetailedForgivenessRequest) => (
                <div className="space-x-2">
                    <Button onClick={() => handleApproval(item.id, 'Approved')} className="py-1 px-2 text-xs bg-green-600 hover:bg-green-700">Approve</Button>
                    <Button onClick={() => handleApproval(item.id, 'Denied')} variant="danger" className="py-1 px-2 text-xs">Deny</Button>
                </div>
            )
        }
    ];
    
    if (isLoading) return <div className="text-center p-8 text-dark-text-secondary">Loading forgiveness requests...</div>;
    if (requests.length === 0) return <p className="text-center text-dark-text-secondary py-4">No pending forgiveness requests.</p>;
    return <Table columns={columns} data={requests} />;
}


const Admin: React.FC = () => {
    const TABS = [
        { label: 'Citizen Approvals', content: <CitizenApprovalTab /> },
        { label: 'Forgiveness Requests', content: <ForgivenessRequestsTab /> },
    ];

    return (
        <Card title="Citizen Administration">
            <Tabs tabs={TABS} />
        </Card>
    );
};

export default Admin;
