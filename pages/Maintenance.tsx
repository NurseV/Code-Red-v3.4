
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import * as api from '../services/api';
import { RepairTicket, Personnel } from '../types';
import { XIcon } from '../components/icons/Icons';

type TicketStatus = 'Open' | 'In Progress' | 'Resolved';

const statusStyles: Record<TicketStatus, string> = {
    'Open': 'bg-red-500',
    'In Progress': 'bg-yellow-500',
    'Resolved': 'bg-green-500',
};

const TicketCard: React.FC<{ ticket: RepairTicket; onClick: () => void; onDragStart: (e: React.DragEvent, id: string) => void }> = ({ ticket, onClick, onDragStart }) => (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, ticket.id)}
        onClick={onClick}
        className="bg-dark-card border border-dark-border p-3 rounded-lg shadow-sm cursor-pointer active:cursor-grabbing"
    >
        <p className="font-bold text-dark-text">{ticket.itemDescription}</p>
        <p className="text-sm text-dark-text-secondary">{ticket.apparatusUnitId}</p>
        <p className="text-xs text-dark-text-secondary mt-1">Created: {new Date(ticket.createdAt).toLocaleDateString()}</p>
    </div>
);

const KanbanColumn: React.FC<{ 
    status: TicketStatus; 
    tickets: RepairTicket[]; 
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDrop: (e: React.DragEvent, status: TicketStatus) => void;
    onCardClick: (ticket: RepairTicket) => void;
}> = ({ status, tickets, onDragStart, onDrop, onCardClick }) => {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };
    
    return (
        <div 
            className="bg-dark-bg rounded-lg w-full p-2"
            onDragOver={handleDragOver}
            onDrop={(e) => onDrop(e, status)}
        >
            <div className={`text-sm font-semibold text-white px-3 py-1 rounded-t-md ${statusStyles[status]}`}>
                {status} ({tickets.length})
            </div>
            <div className="p-2 space-y-3 h-full min-h-[200px] bg-dark-card/50 rounded-b-md">
                {tickets.map(ticket => (
                    <TicketCard key={ticket.id} ticket={ticket} onDragStart={onDragStart} onClick={() => onCardClick(ticket)} />
                ))}
            </div>
        </div>
    );
};

const Maintenance: React.FC = () => {
    const [tickets, setTickets] = useState<RepairTicket[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null);
    const [ticketUpdates, setTicketUpdates] = useState({ assigneeId: '', resolutionNotes: '' });

    const fetchTickets = () => {
        setIsLoading(true);
        Promise.all([api.getRepairTickets(), api.getPersonnelList()])
          .then(([ticketData, personnelData]) => {
            setTickets(ticketData);
            setPersonnel(personnelData);
          })
          .finally(() => setIsLoading(false));
    };
    
    useEffect(() => {
        fetchTickets();
    }, []);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData("ticketId", id);
    };

    const handleDrop = (e: React.DragEvent, newStatus: TicketStatus) => {
        e.preventDefault();
        const ticketId = e.dataTransfer.getData("ticketId");
        const movedTicket = tickets.find(t => t.id === ticketId);
        
        if (movedTicket && movedTicket.status !== newStatus) {
            const updatedTicket = { ...movedTicket, status: newStatus };
            setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
            api.updateRepairTicket(ticketId, { status: newStatus }).catch(() => {
                alert("Failed to update status.");
                fetchTickets(); // Revert on failure
            });
        }
    };

    const handleCardClick = (ticket: RepairTicket) => {
        setSelectedTicket(ticket);
        setTicketUpdates({
            assigneeId: ticket.assigneeId || '',
            resolutionNotes: ticket.resolutionNotes || '',
        });
        setIsModalOpen(true);
    };

    const handleUpdateTicket = async () => {
        if (!selectedTicket) return;
        try {
            await api.updateRepairTicket(selectedTicket.id, {
                assigneeId: ticketUpdates.assigneeId || null,
                resolutionNotes: ticketUpdates.resolutionNotes
            });
            setIsModalOpen(false);
            fetchTickets();
        } catch (e) {
            alert("Failed to update ticket.");
        }
    };

    const handleDeleteTicket = async () => {
        if (!selectedTicket || !window.confirm("Are you sure you want to delete this ticket?")) return;
        try {
            await api.deleteRepairTicket(selectedTicket.id);
            setIsModalOpen(false);
            fetchTickets();
        } catch (e) {
            alert("Failed to delete ticket.");
        }
    };
    
    const columns: TicketStatus[] = ['Open', 'In Progress', 'Resolved'];

    return (
        <>
            <Card title="Maintenance & Repair Tickets">
                {isLoading ? <div className="text-center p-8 text-dark-text-secondary">Loading tickets...</div> : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {columns.map(status => (
                            <KanbanColumn
                                key={status}
                                status={status}
                                tickets={tickets.filter(t => t.status === status)}
                                onDragStart={handleDragStart}
                                onDrop={handleDrop}
                                onCardClick={handleCardClick}
                            />
                        ))}
                    </div>
                )}
            </Card>

            {selectedTicket && (
                <Modal title={`Ticket for ${selectedTicket.apparatusUnitId}`} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-text-secondary">Item Description</label>
                            <p className="text-dark-text p-2 bg-dark-bg rounded-md">{selectedTicket.itemDescription}</p>
                        </div>
                        <div>
                            <label htmlFor="assignee" className="block text-sm font-medium text-dark-text-secondary mb-1">Assigned To</label>
                            <select
                                id="assignee"
                                value={ticketUpdates.assigneeId}
                                onChange={e => setTicketUpdates(prev => ({ ...prev, assigneeId: e.target.value }))}
                                className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                            >
                                <option value="">Unassigned</option>
                                {personnel.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-dark-text-secondary mb-1">Resolution Notes</label>
                            <textarea
                                id="notes"
                                rows={4}
                                value={ticketUpdates.resolutionNotes}
                                onChange={e => setTicketUpdates(prev => ({ ...prev, resolutionNotes: e.target.value }))}
                                className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                            />
                        </div>
                        <div className="pt-4 flex justify-between">
                            <Button variant="danger" onClick={handleDeleteTicket} icon={<XIcon className="h-4 w-4 mr-1"/>}>Delete</Button>
                            <div className="flex space-x-3">
                                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button onClick={handleUpdateTicket}>Save Changes</Button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default Maintenance;