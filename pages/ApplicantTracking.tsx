import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import * as api from '../services/api';
import { Applicant, ApplicantStatus } from '../types';

const statusStyles: Record<ApplicantStatus, string> = {
    [ApplicantStatus.APPLIED]: 'bg-blue-500',
    [ApplicantStatus.INTERVIEW]: 'bg-purple-500',
    [ApplicantStatus.OFFER]: 'bg-yellow-500',
    [ApplicantStatus.HIRED]: 'bg-green-500',
    [ApplicantStatus.REJECTED]: 'bg-red-600',
};

const ApplicantCard: React.FC<{ applicant: Applicant; onDragStart: (e: React.DragEvent, id: string) => void }> = ({ applicant, onDragStart }) => (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, applicant.id)}
        className="bg-dark-card border border-dark-border p-3 rounded-lg shadow-sm cursor-grab active:cursor-grabbing"
    >
        <p className="font-bold text-dark-text">{applicant.name}</p>
        <p className="text-sm text-dark-text-secondary">{applicant.email}</p>
        <p className="text-xs text-dark-text-secondary mt-1">Applied: {new Date(applicant.appliedDate).toLocaleDateString()}</p>
    </div>
);

const KanbanColumn: React.FC<{ 
    status: ApplicantStatus; 
    applicants: Applicant[]; 
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDrop: (e: React.DragEvent, status: ApplicantStatus) => void;
}> = ({ status, applicants, onDragStart, onDrop }) => {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };
    
    return (
        <div 
            className="bg-dark-bg rounded-lg w-full md:w-1/5 p-2 flex-shrink-0"
            onDragOver={handleDragOver}
            onDrop={(e) => onDrop(e, status)}
        >
            <div className={`text-sm font-semibold text-white px-3 py-1 rounded-t-md ${statusStyles[status]}`}>
                {status} ({applicants.length})
            </div>
            <div className="p-2 space-y-3 h-full min-h-[200px] bg-dark-card/50 rounded-b-md">
                {applicants.map(app => (
                    <ApplicantCard key={app.id} applicant={app} onDragStart={onDragStart} />
                ))}
            </div>
        </div>
    );
};

const ApplicantTracking: React.FC = () => {
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [applicantToPromote, setApplicantToPromote] = useState<Applicant | null>(null);

    const fetchApplicants = () => {
        setIsLoading(true);
        api.getApplicants().then(setApplicants).finally(() => setIsLoading(false));
    };
    
    useEffect(() => {
        fetchApplicants();
    }, []);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData("applicantId", id);
    };

    const handleDrop = (e: React.DragEvent, newStatus: ApplicantStatus) => {
        e.preventDefault();
        const applicantId = e.dataTransfer.getData("applicantId");
        const movedApplicant = applicants.find(app => app.id === applicantId);
        
        if (movedApplicant && movedApplicant.status !== newStatus) {
             if (newStatus === ApplicantStatus.HIRED) {
                setApplicantToPromote(movedApplicant);
                setIsModalOpen(true);
            } else {
                 // Optimistic UI update
                setApplicants(prev => prev.map(app => 
                    app.id === applicantId ? { ...app, status: newStatus } : app
                ));
                // API call to persist the change
                api.updateApplicantStatus(applicantId, newStatus).catch(err => {
                    console.error(err);
                    alert("Failed to update applicant status.");
                    setApplicants(prev => prev.map(app => 
                        app.id === applicantId ? { ...app, status: movedApplicant.status } : app
                    ));
                });
            }
        }
    };

    const handleConfirmPromotion = async () => {
        if (!applicantToPromote) return;
        
        try {
            await api.promoteApplicantToPersonnel(applicantToPromote.id);
            alert(`${applicantToPromote.name} has been promoted to Personnel.`);
            fetchApplicants(); // Refresh list
        } catch (error) {
            alert("Failed to promote applicant.");
        } finally {
            setIsModalOpen(false);
            setApplicantToPromote(null);
        }
    };
    
    const columns: ApplicantStatus[] = [
        ApplicantStatus.APPLIED,
        ApplicantStatus.INTERVIEW,
        ApplicantStatus.OFFER,
        ApplicantStatus.HIRED,
        ApplicantStatus.REJECTED,
    ];

    return (
        <>
            <Card title="Applicant Tracking">
                {isLoading ? <div className="text-center p-8 text-dark-text-secondary">Loading applicants...</div> : (
                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 overflow-x-auto pb-4">
                        {columns.map(status => (
                            <KanbanColumn
                                key={status}
                                status={status}
                                applicants={applicants.filter(a => a.status === status)}
                                onDragStart={handleDragStart}
                                onDrop={handleDrop}
                            />
                        ))}
                    </div>
                )}
            </Card>

            {applicantToPromote && (
                <Modal title="Confirm Promotion" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <p className="text-dark-text">
                        Are you sure you want to promote <span className="font-bold">{applicantToPromote.name}</span> to a probationary firefighter?
                    </p>
                    <p className="text-sm text-dark-text-secondary mt-2">
                        This will create a new record in the Personnel module and remove them from this applicant board.
                    </p>
                    <div className="mt-6 flex justify-end space-x-3">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleConfirmPromotion}>Confirm Promotion</Button>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default ApplicantTracking;
