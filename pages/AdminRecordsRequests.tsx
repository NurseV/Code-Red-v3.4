
import React, { useState, useEffect } from 'react';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import * as api from '../services/api';
import { RecordsRequest, RecordsRequestStatus } from '../types';

const DetailItem: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-dark-text-secondary">{label}</dt>
        <dd className="mt-1 text-sm text-dark-text">{value || 'N/A'}</dd>
    </div>
);

const AdminRecordsRequests: React.FC = () => {
    const [requests, setRequests] = useState<RecordsRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<RecordsRequest | null>(null);
    const [newStatus, setNewStatus] = useState<RecordsRequestStatus>(RecordsRequestStatus.PENDING);

    const fetchRequests = () => {
        setIsLoading(true);
        api.getRecordsRequests()
            .then(setRequests)
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const openModal = (request: RecordsRequest) => {
        setSelectedRequest(request);
        setNewStatus(request.status);
        setIsModalOpen(true);
    };

    const handleUpdateStatus = async () => {
        if (!selectedRequest) return;
        try {
            await api.updateRecordsRequestStatus(selectedRequest.id, newStatus);
            setIsModalOpen(false);
            fetchRequests(); // Refresh the list
        } catch (error) {
            alert('Failed to update request status.');
        }
    };
    
    const getStatusColor = (status: RecordsRequestStatus) => {
        switch (status) {
            case RecordsRequestStatus.PENDING: return 'bg-yellow-500/20 text-yellow-400';
            case RecordsRequestStatus.IN_PROGRESS: return 'bg-blue-500/20 text-blue-400';
            case RecordsRequestStatus.COMPLETED: return 'bg-green-500/20 text-green-400';
            case RecordsRequestStatus.DENIED: return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const columns = [
        { 
            header: 'Requester', 
            accessor: (item: RecordsRequest) => (
                <div>
                    <p className="font-medium">{item.requesterName}</p>
                    <p className="text-xs text-dark-text-secondary">{item.requesterEmail}</p>
                </div>
            )
        },
        { 
            header: 'Submitted', 
            accessor: (item: RecordsRequest) => new Date(item.submittedAt).toLocaleString() 
        },
        { 
            header: 'Description', 
            accessor: (item: RecordsRequest) => <p className="truncate max-w-sm">{item.description}</p>
        },
        {
            header: 'Status',
            accessor: (item: RecordsRequest) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                </span>
            ),
        },
        {
            header: 'Actions',
            accessor: (item: RecordsRequest) => (
                <Button variant="secondary" onClick={() => openModal(item)} className="py-1 px-2 text-xs">
                    View Details
                </Button>
            ),
        },
    ];

    return (
        <>
            <h2 className="text-xl font-bold mb-4">Public Records Requests</h2>
            {isLoading ? (
                <div className="text-center p-8 text-dark-text-secondary">Loading requests...</div>
            ) : (
                <Table columns={columns} data={requests} />
            )}

            {selectedRequest && (
                <Modal title={`Request from ${selectedRequest.requesterName}`} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem label="Requester Name" value={selectedRequest.requesterName} />
                            <DetailItem label="Requester Email" value={selectedRequest.requesterEmail} />
                            <DetailItem label="Requester Phone" value={selectedRequest.requesterPhone} />
                            <DetailItem label="Submitted At" value={new Date(selectedRequest.submittedAt).toLocaleString()} />
                            <DetailItem label="Requested Format" value={selectedRequest.requestedFormat} />
                            <DetailItem label="Current Status" value={
                                <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                                    {selectedRequest.status}
                                </span>
                            } />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem label="Date Range Start" value={selectedRequest.dateRangeStart ? new Date(selectedRequest.dateRangeStart).toLocaleDateString() : 'N/A'} />
                            <DetailItem label="Date Range End" value={selectedRequest.dateRangeEnd ? new Date(selectedRequest.dateRangeEnd).toLocaleDateString() : 'N/A'} />
                        </div>
                        <DetailItem label="Description of Request" value={<p className="whitespace-pre-wrap bg-dark-bg p-2 rounded-md">{selectedRequest.description}</p>} />
                        
                        <div className="pt-4 border-t border-dark-border space-y-2">
                             <label htmlFor="status" className="block text-sm font-medium text-dark-text-secondary">Update Status</label>
                             <div className="flex items-center space-x-3">
                                 <select 
                                    id="status"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value as RecordsRequestStatus)}
                                    className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                >
                                    {Object.values(RecordsRequestStatus).map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                <Button onClick={handleUpdateStatus}>Save</Button>
                             </div>
                        </div>

                    </div>
                </Modal>
            )}
        </>
    );
};

export default AdminRecordsRequests;
