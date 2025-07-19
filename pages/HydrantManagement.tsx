import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import * as api from '../services/api';
import { Hydrant, HydrantInspection, Coordinates } from '../types';
import { useInternalAuth } from '../hooks/useInternalAuth';
import { PlusIcon, DropletIcon, PipetteIcon, EyeIcon, SearchIcon, MapIcon, ListChecksIcon, AlertTriangleIcon, WrenchIcon } from '../components/icons/Icons';

type ViewMode = 'list' | 'map';

// --- Helper Functions & Components ---

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};

const getStatusAppearance = (status: Hydrant['status']) => {
    switch (status) {
        case 'In Service': return { color: 'text-green-400', pill: 'bg-green-500/20 text-green-300' };
        case 'Out of Service': return { color: 'text-red-400', pill: 'bg-red-500/20 text-red-300' };
        case 'Needs Maintenance': return { color: 'text-yellow-400', pill: 'bg-yellow-500/20 text-yellow-300' };
        default: return { color: 'text-gray-400', pill: 'bg-gray-500/20 text-gray-400' };
    }
};

const getDueDateStatus = (dateString?: string): { text: string; className: string } => {
    if (!dateString) return { text: 'N/A', className: 'text-dark-text' };
    
    const now = new Date();
    now.setHours(0,0,0,0);
    const expiryDate = new Date(dateString);
    const daysUntil = (expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24);

    if (daysUntil < 0) return { text: `Overdue`, className: 'text-red-400 font-bold' };
    if (daysUntil <= 30) return { text: `Expires in ${Math.ceil(daysUntil)} days`, className: 'text-yellow-400 font-bold' };
    return { text: new Date(dateString).toLocaleDateString(), className: 'text-dark-text' };
};

// --- Map View ---

const HydrantMap: React.FC<{ hydrants: Hydrant[], onSelect: (hydrant: Hydrant) => void }> = ({ hydrants, onSelect }) => {
    const mapGridStyle = {
        backgroundImage: `
            linear-gradient(rgba(107, 114, 128, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(107, 114, 128, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: `25px 25px`,
    };

    return (
        <div className="relative w-full h-[60vh] bg-dark-card rounded-lg overflow-hidden border border-dark-border" style={mapGridStyle}>
            {hydrants.map(hydrant => {
                const appearance = getStatusAppearance(hydrant.status);
                return (
                     <div 
                        key={hydrant.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                        style={{ top: `${hydrant.location.lat}%`, left: `${hydrant.location.lng}%` }}
                        onClick={() => onSelect(hydrant)}
                        role="button"
                        aria-label={`Hydrant ${hydrant.id}`}
                    >
                        <DropletIcon className={`h-6 w-6 ${appearance.color} transition-transform duration-200 group-hover:scale-150`} />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max hidden group-hover:block bg-dark-bg text-white text-xs rounded py-1 px-2 border border-dark-border shadow-lg z-10">
                            {hydrant.id} - {hydrant.address}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

// --- Main Component ---
const HydrantManagement: React.FC = () => {
    const { user } = useInternalAuth();
    const [allHydrants, setAllHydrants] = useState<Hydrant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<ViewMode>('list');
    
    // Filtering and Sorting
    const [filters, setFilters] = useState({ searchTerm: '', status: 'All', zone: 'All' });
    const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Hydrant, direction: 'ascending' | 'descending' } | null>({ key: 'id', direction: 'ascending' });

    // Modals
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);
    const [selectedHydrant, setSelectedHydrant] = useState<Hydrant | null>(null);
    
    // Form state for new inspection
    const [inspectionForm, setInspectionForm] = useState({ staticPressure: '', residualPressure: '', flowGpm: '', notes: '' });
    // Form state for new hydrant
    const [newHydrantForm, setNewHydrantForm] = useState({ id: '', address: '', type: 'Dry Barrel' as Hydrant['type'], manufacturer: '', zone: '' });

    const fetchHydrants = () => {
        setIsLoading(true);
        api.getHydrants().then(setAllHydrants).finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchHydrants();
    }, []);

    const zones = useMemo(() => ['All', ...new Set(allHydrants.map(h => h.zone))], [allHydrants]);

    const filteredAndSortedHydrants = useMemo(() => {
        let filtered = allHydrants.filter(h => {
            const termMatch = debouncedSearchTerm ? (h.id.toLowerCase().includes(debouncedSearchTerm) || h.address.toLowerCase().includes(debouncedSearchTerm)) : true;
            const statusMatch = filters.status === 'All' || h.status === filters.status;
            const zoneMatch = filters.zone === 'All' || h.zone === filters.zone;
            return termMatch && statusMatch && zoneMatch;
        });

        if (sortConfig) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [allHydrants, debouncedSearchTerm, filters, sortConfig]);

    const handleOpenTestModal = (hydrant: Hydrant) => {
        setSelectedHydrant(hydrant);
        setIsTestModalOpen(true);
    };

    const handleLogInspection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHydrant || !user) return;
        
        const newInspectionData = {
            ...inspectionForm,
            staticPressure: Number(inspectionForm.staticPressure),
            residualPressure: Number(inspectionForm.residualPressure),
            flowGpm: Number(inspectionForm.flowGpm),
        };

        const newInspection: Omit<HydrantInspection, 'id'> = {
            hydrantId: selectedHydrant.id,
            date: new Date().toISOString(),
            inspectorName: user.name,
            ...newInspectionData,
        };

        try {
            await api.createHydrantInspection(newInspection);
            alert('Inspection logged successfully!');
            setIsTestModalOpen(false);
            setInspectionForm({ staticPressure: '', residualPressure: '', flowGpm: '', notes: '' });
            fetchHydrants();
        } catch (error) {
            alert('Failed to log inspection.');
        }
    };

    const handleAddHydrant = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createHydrant(newHydrantForm);
            alert('Hydrant created successfully!');
            setIsAddModalOpen(false);
            setNewHydrantForm({ id: '', address: '', type: 'Dry Barrel', manufacturer: '', zone: '' });
            fetchHydrants();
        } catch(e) {
            alert('Failed to create hydrant.');
        }
    };

    const handleReportIssue = () => {
        setIsReportIssueModalOpen(true);
        // In a real app, this would integrate with the maintenance module.
        // For now, we show a confirmation and then close the modal.
        setTimeout(() => setIsReportIssueModalOpen(false), 2000);
    };

    const columns = [
        { header: 'Hydrant ID', accessor: (item: Hydrant) => <span className="font-mono">{item.id}</span>, sortKey: 'id' as const },
        { header: 'Address', accessor: (item: Hydrant) => item.address, sortKey: 'address' as const },
        { header: 'Type', accessor: (item: Hydrant) => `${item.type} (${item.manufacturer})`, sortKey: 'type' as const },
        { header: 'Status', accessor: (item: Hydrant) => <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusAppearance(item.status).pill}`}>{item.status}</span>, sortKey: 'status' as const },
        { header: 'Static Pressure (PSI)', accessor: (item: Hydrant) => item.inspections[0]?.staticPressure.toLocaleString() || 'N/A' },
        { header: 'Last Flow (GPM)', accessor: (item: Hydrant) => item.inspections[0]?.flowGpm.toLocaleString() || 'N/A' },
        { header: 'Next Inspection Due', accessor: (item: Hydrant) => <span className={getDueDateStatus(item.nextInspectionDueDate).className}>{getDueDateStatus(item.nextInspectionDueDate).text}</span>, sortKey: 'nextInspectionDueDate' as const },
        { header: 'Actions', accessor: (item: Hydrant) => (
            <div className="flex space-x-1">
                <Button variant="ghost" size="sm" className="p-1 h-7" onClick={() => handleOpenTestModal(item)} title="View Details / Log Test"><EyeIcon className="h-4 w-4"/></Button>
                <Button variant="ghost" size="sm" className="p-1 h-7" onClick={() => handleOpenTestModal(item)} title="Log Test"><PipetteIcon className="h-4 w-4"/></Button>
                <Button variant="ghost" size="sm" className="p-1 h-7 text-yellow-400" onClick={handleReportIssue} title="Report Issue"><WrenchIcon className="h-4 w-4"/></Button>
            </div>
        )},
    ];

    return (
        <div className="space-y-6">
            <Card>
                 <div className="flex justify-between items-center mb-4">
                     <h2 className="text-2xl font-bold">Hydrant Management</h2>
                     <div className="flex items-center space-x-2">
                         <div className="flex items-center bg-dark-card border border-dark-border rounded-lg p-1">
                            <Button variant={view === 'list' ? 'primary' : 'ghost'} size="sm" className="!px-3 !py-1" onClick={() => setView('list')} aria-label="List View"><ListChecksIcon className="h-5 w-5"/></Button>
                            <Button variant={view === 'map' ? 'primary' : 'ghost'} size="sm" className="!px-3 !py-1" onClick={() => setView('map')} aria-label="Map View"><MapIcon className="h-5 w-5"/></Button>
                         </div>
                         <Button onClick={() => setIsAddModalOpen(true)} icon={<PlusIcon className="h-4 w-4 mr-2"/>}>New Hydrant</Button>
                     </div>
                 </div>
                 
                 <div className="p-4 bg-dark-bg rounded-lg border border-dark-border flex flex-wrap gap-4">
                    <div className="relative flex-grow">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                        <input type="text" placeholder="Search by ID or address..." value={filters.searchTerm} onChange={e => setFilters({...filters, searchTerm: e.target.value})} className="w-full bg-dark-card border border-dark-border rounded-md py-2 pl-10 pr-4 text-dark-text" />
                    </div>
                    <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="bg-dark-card border-dark-border rounded-md py-2 px-3 text-dark-text">
                        <option value="All">All Statuses</option>
                        <option value="In Service">In Service</option>
                        <option value="Needs Maintenance">Needs Maintenance</option>
                        <option value="Out of Service">Out of Service</option>
                    </select>
                     <select value={filters.zone} onChange={e => setFilters({...filters, zone: e.target.value})} className="bg-dark-card border-dark-border rounded-md py-2 px-3 text-dark-text">
                         {zones.map(zone => <option key={zone} value={zone}>{zone === 'All' ? 'All Zones' : zone}</option>)}
                    </select>
                 </div>
                 
                 <div className="mt-6">
                    {isLoading ? <div className="text-center p-8 text-dark-text-secondary">Loading hydrants...</div> : (
                        view === 'list' ? (
                            <Table columns={columns} data={filteredAndSortedHydrants} sortConfig={sortConfig} requestSort={(key) => setSortConfig(prev => ({ key, direction: prev?.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending' }))} />
                        ) : (
                            <HydrantMap hydrants={filteredAndSortedHydrants} onSelect={handleOpenTestModal} />
                        )
                    )}
                 </div>
            </Card>

            {/* View / Test Modal */}
            {selectedHydrant && (
                <Modal title={`Hydrant ${selectedHydrant.id}`} isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)}>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-dark-text mb-2">Inspection History</h3>
                            {selectedHydrant.inspections.length > 0 ? (
                                <ul className="space-y-2 max-h-48 overflow-y-auto border border-dark-border p-2 rounded-md">
                                    {selectedHydrant.inspections.map(insp => (
                                        <li key={insp.id} className="text-sm p-2 bg-dark-bg rounded">
                                            <p><b>{new Date(insp.date).toLocaleDateString()}:</b> Flowed {insp.flowGpm} GPM (Static: {insp.staticPressure}, Residual: {insp.residualPressure})</p>
                                            <p className="text-dark-text-secondary pl-2">- {insp.notes || "No notes."} (Insp: {insp.inspectorName})</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-dark-text-secondary">No inspection history found.</p>}
                        </div>
                        <form onSubmit={handleLogInspection} className="space-y-4 border-t border-dark-border pt-4">
                             <h3 className="text-lg font-semibold text-dark-text flex items-center"><PipetteIcon className="h-5 w-5 mr-2 text-brand-primary"/> Log New Flow Test</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-text-secondary mb-1">Static Pressure (PSI)</label>
                                    <input type="number" value={inspectionForm.staticPressure} onChange={e => setInspectionForm({...inspectionForm, staticPressure: e.target.value})} required className="block w-full bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text sm:text-sm"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-text-secondary mb-1">Residual Pressure (PSI)</label>
                                    <input type="number" value={inspectionForm.residualPressure} onChange={e => setInspectionForm({...inspectionForm, residualPressure: e.target.value})} required className="block w-full bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text sm:text-sm"/>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-dark-text-secondary mb-1">Flow (GPM)</label>
                                    <input type="number" value={inspectionForm.flowGpm} onChange={e => setInspectionForm({...inspectionForm, flowGpm: e.target.value})} required className="block w-full bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text sm:text-sm"/>
                                </div>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-dark-text-secondary mb-1">Notes</label>
                                <textarea rows={2} value={inspectionForm.notes} onChange={e => setInspectionForm({...inspectionForm, notes: e.target.value})} className="block w-full bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text sm:text-sm" placeholder="e.g., Caps are tight, no leaks observed."></textarea>
                             </div>
                             <div className="flex justify-end pt-2"><Button type="submit">Log Inspection</Button></div>
                        </form>
                    </div>
                </Modal>
            )}

            {/* Add Hydrant Modal */}
             <Modal title="Add New Hydrant" isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                <form onSubmit={handleAddHydrant} className="space-y-4">
                    <input type="text" placeholder="Hydrant ID (e.g., hyd-006)" value={newHydrantForm.id} onChange={e => setNewHydrantForm({...newHydrantForm, id: e.target.value})} required className="w-full bg-dark-bg border-dark-border p-2 rounded-md" />
                    <input type="text" placeholder="Address" value={newHydrantForm.address} onChange={e => setNewHydrantForm({...newHydrantForm, address: e.target.value})} required className="w-full bg-dark-bg border-dark-border p-2 rounded-md" />
                    <select value={newHydrantForm.type} onChange={e => setNewHydrantForm({...newHydrantForm, type: e.target.value as any})} className="w-full bg-dark-bg border-dark-border p-2 rounded-md"><option>Dry Barrel</option><option>Wet Barrel</option></select>
                    <input type="text" placeholder="Manufacturer" value={newHydrantForm.manufacturer} onChange={e => setNewHydrantForm({...newHydrantForm, manufacturer: e.target.value})} className="w-full bg-dark-bg border-dark-border p-2 rounded-md" />
                    <input type="text" placeholder="Zone" value={newHydrantForm.zone} onChange={e => setNewHydrantForm({...newHydrantForm, zone: e.target.value})} className="w-full bg-dark-bg border-dark-border p-2 rounded-md" />
                    <div className="flex justify-end pt-4 space-x-2"><Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button><Button type="submit">Add Hydrant</Button></div>
                </form>
            </Modal>
            
            {/* Report Issue Modal */}
            <Modal title="Report Issue" isOpen={isReportIssueModalOpen} onClose={() => setIsReportIssueModalOpen(false)}>
                <div className="text-center p-4">
                    <p className="text-lg text-dark-text">Issue Reported!</p>
                    <p className="text-dark-text-secondary mt-2">A maintenance ticket has been created and the crew will be notified.</p>
                </div>
            </Modal>
        </>
    );
};

export default HydrantManagement;