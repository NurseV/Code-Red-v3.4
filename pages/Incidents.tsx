

import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import * as api from '../services/api';
import * as gemini from '../services/geminiService';
import { NfirsIncident as IncidentType, Personnel, Apparatus, SavedIncidentView } from '../types';
import { PlusIcon, RefreshCwIcon, SearchIcon, WandSparklesIcon, ChevronDownIcon, FilterIcon, MoreVerticalIcon, SaveIcon, XIcon, FileCheckIcon, EyeIcon, PrinterIcon, ShieldAlertIcon, EditIcon } from '../components/icons/Icons';
import { useInternalAuth } from '../hooks/useInternalAuth';
import { NFIRS_INCIDENT_TYPES } from '../constants/nfirs-codes';

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


const statusInfo: Record<IncidentType['status'], { icon: React.ReactNode, color: string }> = {
    'In Progress': { icon: <RefreshCwIcon className="h-3 w-3 mr-1.5 animate-spin"/>, color: 'bg-blue-500/20 text-blue-300' },
    'Review Needed': { icon: <EyeIcon className="h-3 w-3 mr-1.5"/>, color: 'bg-yellow-500/20 text-yellow-300' },
    'Locked': { icon: <FileCheckIcon className="h-3 w-3 mr-1.5"/>, color: 'bg-green-500/20 text-green-300' }
};

const IncidentSummaryCard: React.FC<{ incident: IncidentType }> = ({ incident }) => {
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [apparatus, setApparatus] = useState<Apparatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.getPersonnelList(),
            api.getApparatusList()
        ]).then(([allPersonnel, allApparatus]) => {
            setPersonnel(allPersonnel.filter(p => incident.respondingPersonnelIds.includes(p.id)));
            setApparatus(allApparatus.filter(a => incident.respondingApparatusIds.includes(a.id)));
        }).finally(() => setIsLoading(false));
    }, [incident]);

    return (
        <div className="bg-dark-bg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
                <h4 className="font-semibold text-dark-text mb-1">Narrative Snippet</h4>
                <p className="text-sm text-dark-text-secondary italic line-clamp-3">{incident.narrative || 'No narrative available.'}</p>
            </div>
            <div>
                 <h4 className="font-semibold text-dark-text mb-1">Responding Resources</h4>
                 {isLoading ? <p className="text-sm text-dark-text-secondary">Loading...</p> : (
                    <div className="flex space-x-4">
                        <p className="text-sm text-dark-text-secondary">Personnel: {personnel.length}</p>
                        <p className="text-sm text-dark-text-secondary">Apparatus: {apparatus.length}</p>
                    </div>
                 )}
            </div>
        </div>
    )
};


const Incidents: React.FC = () => {
    const navigate = ReactRouterDOM.useNavigate();
    const { user } = useInternalAuth();
    const [searchParams] = ReactRouterDOM.useSearchParams();

    // Data states
    const [allIncidents, setAllIncidents] = useState<IncidentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    
    // UI states
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);

    // AI Narrative Modal
    const [isNarrativeModalOpen, setIsNarrativeModalOpen] = useState(false);
    const [narrativeKeywords, setNarrativeKeywords] = useState('');
    const [generatedNarrative, setGeneratedNarrative] = useState('');
    const [isNarrativeLoading, setIsNarrativeLoading] = useState(false);

    // Filtering & Views
    const [filters, setFilters] = useState({ 
        searchTerm: '', 
        type: 'All', 
        status: (searchParams.get('status') as IncidentType['status']) || ('All' as 'All' | IncidentType['status']), 
        dateStart: searchParams.get('month') ? new Date(parseInt(searchParams.get('year')!), new Date(Date.parse(`${searchParams.get('month')} 1, 2024`)).getMonth(), 1).toISOString().split('T')[0] : '', 
        dateEnd: searchParams.get('month') ? new Date(parseInt(searchParams.get('year')!), new Date(Date.parse(`${searchParams.get('month')} 1, 2024`)).getMonth() + 1, 0).toISOString().split('T')[0] : '' 
    });
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: keyof IncidentType, direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });
    const [savedViews, setSavedViews] = useState<SavedIncidentView[]>([]);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [newViewName, setNewViewName] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);
    
    useEffect(() => {
        const statusParam = searchParams.get('status') as IncidentType['status'];
        if (statusParam && Object.values(['In Progress', 'Review Needed', 'Locked']).includes(statusParam)) {
            setFilters(prev => ({...prev, status: statusParam}));
        }
    }, [searchParams]);

    const fetchIncidents = () => {
        setIsLoading(true);
        api.getIncidentsList({ ...filters, searchTerm: debouncedSearchTerm })
          .then(setAllIncidents)
          .finally(() => setIsLoading(false));
    };
    
    useEffect(() => {
        fetchIncidents();
        api.getIncidentViews().then(setSavedViews);
    }, [debouncedSearchTerm, filters.type, filters.status, filters.dateStart, filters.dateEnd]);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setActionMenuOpen(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSync = async () => {
      setIsSyncing(true);
      try {
          const newIncident = await api.syncWithActive911();
          setAllIncidents(prev => [newIncident, ...prev]);
      } catch (error) {
          alert("Failed to sync with Active911.");
      } finally {
          setIsSyncing(false);
      }
    };
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value }));
    };

    const handleGenerateNarrative = async () => {
        if (!narrativeKeywords.trim()) return;
        setIsNarrativeLoading(true);
        setGeneratedNarrative('');
        const narrative = await gemini.generateIncidentNarrative(narrativeKeywords, user);
        setGeneratedNarrative(narrative);
        setIsNarrativeLoading(false);
    }
    
    const handleCopyNarrative = () => {
        navigator.clipboard.writeText(generatedNarrative).then(() => {
            alert('Narrative copied to clipboard!');
            setIsNarrativeModalOpen(false);
        });
    }
    
    const requestSort = (key: keyof IncidentType) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedIncidents = useMemo(() => {
        let sortableItems = [...allIncidents];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [allIncidents, sortConfig]);

    const paginatedIncidents = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedIncidents.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedIncidents, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(sortedIncidents.length / itemsPerPage);

    const handleBulkClose = async () => {
        if (window.confirm(`Are you sure you want to lock ${selectedIds.length} incidents?`)) {
            await api.updateMultipleIncidentStatus(selectedIds, 'Locked');
            fetchIncidents();
            setSelectedIds([]);
        }
    };
    
    const handleExportCsv = () => {
        const selectedIncidents = sortedIncidents.filter(i => selectedIds.includes(i.id));
        const headers = ['Incident #', 'Type', 'Address', 'Date', 'Status'];
        const rows = selectedIncidents.map(inc => [
            `"${inc.incidentNumber}"`,
            `"${inc.type}"`,
            `"${inc.address}"`,
            `"${new Date(inc.date).toLocaleString()}"`,
            `"${inc.status}"`
        ].join(','));
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "incidents_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        { header: 'Incident #', accessor: (item: IncidentType) => <ReactRouterDOM.Link to={`/app/incidents/${item.id}`} className="font-medium text-dark-text hover:text-brand-primary hover:underline">{item.incidentNumber}</ReactRouterDOM.Link>, sortKey: 'incidentNumber' as const },
        { header: 'Type', accessor: (item: IncidentType) => item.type, sortKey: 'type' as const },
        { header: 'Address', accessor: (item: IncidentType) => item.address, sortKey: 'address' as const },
        { header: 'Date', accessor: (item: IncidentType) => new Date(item.date).toLocaleString(), sortKey: 'date' as const },
        { header: 'Status', sortKey: 'status' as const, accessor: (item: IncidentType) => (
            <span className={`inline-flex items-center text-xs leading-5 font-semibold rounded-full px-2 py-1 ${statusInfo[item.status].color}`}>
                {statusInfo[item.status].icon}
                {item.status}
            </span>
        )},
        { header: 'Actions', accessor: (item: IncidentType) => (
            <div className="relative text-right" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" className="p-1" onClick={() => setActionMenuOpen(actionMenuOpen === item.id ? null : item.id)}>
                    <MoreVerticalIcon className="h-5 w-5" />
                </Button>
                {actionMenuOpen === item.id && (
                     <div ref={actionMenuRef} className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-md shadow-lg z-10">
                         <ul>
                            <li><ReactRouterDOM.Link to={`/app/incidents/${item.id}`} className="flex items-center w-full text-left px-4 py-2 text-sm text-dark-text-secondary hover:bg-dark-border"><EyeIcon className="h-4 w-4 mr-3" /> View Report</ReactRouterDOM.Link></li>
                            <li><ReactRouterDOM.Link to={`/app/incidents/${item.id}/edit`} className="flex items-center w-full text-left px-4 py-2 text-sm text-dark-text-secondary hover:bg-dark-border"><EditIcon className="h-4 w-4 mr-3" /> Edit</ReactRouterDOM.Link></li>
                            <li><ReactRouterDOM.Link to={`/app/incidents/${item.id}/log-exposure`} className="flex items-center w-full text-left px-4 py-2 text-sm text-dark-text-secondary hover:bg-dark-border"><ShieldAlertIcon className="h-4 w-4 mr-3" /> Log Exposure</ReactRouterDOM.Link></li>
                         </ul>
                     </div>
                )}
            </div>
        )}
    ];

    return (
        <div className="space-y-4">
            <Card>
                <div className="md:flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-dark-text mb-4 md:mb-0">Incident Log</h2>
                    <div className="flex space-x-2">
                        <Button onClick={handleSync} variant="ghost" isLoading={isSyncing} icon={<RefreshCwIcon className="h-4 w-4 mr-2" />}>Sync with Active911</Button>
                        <Button onClick={() => setIsNarrativeModalOpen(true)} variant="secondary" icon={<WandSparklesIcon className="h-4 w-4 mr-2" />}>Generate Narrative</Button>
                        <Button onClick={() => navigate('/app/incidents/new')} icon={<PlusIcon className="h-4 w-4 mr-2" />}>New Incident</Button>
                    </div>
                </div>

                <div className="bg-dark-bg p-3 rounded-lg border border-dark-border">
                    <div className="flex flex-wrap gap-4 justify-between items-center">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="relative flex-grow">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                                <input type="text" name="searchTerm" placeholder="Search by address, number..." value={filters.searchTerm} onChange={handleFilterChange} className="w-full bg-dark-card border border-dark-border rounded-md py-2 pl-10 pr-4 text-dark-text"/>
                            </div>
                            <Button variant="ghost" onClick={() => setIsFilterPanelOpen(p => !p)} icon={<FilterIcon className="h-4 w-4 mr-1"/>}>
                                Filters <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform ${isFilterPanelOpen ? 'rotate-180' : ''}`} />
                            </Button>
                        </div>
                    </div>
                    {isFilterPanelOpen && (
                        <div className="mt-4 pt-4 border-t border-dark-border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <input type="date" name="dateStart" value={filters.dateStart} onChange={handleFilterChange} className="bg-dark-card border-dark-border rounded-md p-2"/>
                            <input type="date" name="dateEnd" value={filters.dateEnd} onChange={handleFilterChange} className="bg-dark-card border-dark-border rounded-md p-2"/>
                            <select name="type" onChange={handleFilterChange} value={filters.type} className="bg-dark-card border-dark-border rounded-md p-2"><option>All Types</option>{NFIRS_INCIDENT_TYPES.map(t => <option key={t.code} value={t.description}>{t.description}</option>)}</select>
                            <select name="status" onChange={handleFilterChange} value={filters.status} className="bg-dark-card border-dark-border rounded-md p-2"><option>All</option><option>In Progress</option><option>Review Needed</option><option>Locked</option></select>
                        </div>
                    )}
                </div>
            </Card>

            {selectedIds.length > 0 && (
                <div className="p-3 bg-blue-900/50 border border-blue-700 rounded-lg flex justify-between items-center">
                    <span className="font-semibold text-dark-text">{selectedIds.length} incidents selected</span>
                    <div className="flex space-x-2">
                        <Button variant="secondary" size="sm" onClick={handleBulkClose}>Lock Selected</Button>
                        <Button variant="secondary" size="sm" onClick={handleExportCsv}>Export Selected (.csv)</Button>
                    </div>
                </div>
            )}
            
            {isLoading ? <div className="text-center p-8 text-dark-text-secondary">Loading incidents...</div>
                : (
                    <>
                        <div className="hidden md:block">
                            <Table columns={columns} data={paginatedIncidents} sortConfig={sortConfig} requestSort={requestSort} onRowClick={(item) => setExpandedRowId(prevId => prevId === item.id ? null : item.id)} expandedRowId={expandedRowId} renderExpandedRow={(item) => <IncidentSummaryCard incident={item} />} isSelectable selectedIds={selectedIds} onSelectionChange={(ids) => setSelectedIds(ids as string[])} />
                        </div>
                         <div className="block md:hidden space-y-3">
                             {paginatedIncidents.map(inc => (
                                <div key={inc.id} className="bg-dark-card border border-dark-border rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-dark-text">{inc.type}</p>
                                            <p className="text-sm text-dark-text-secondary">{inc.address}</p>
                                        </div>
                                         <span className={`inline-flex items-center text-xs leading-5 font-semibold rounded-full px-2 py-1 ${statusInfo[inc.status].color}`}>
                                            {statusInfo[inc.status].icon}
                                            {inc.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-dark-text-secondary mt-2">{new Date(inc.date).toLocaleString()}</p>
                                </div>
                             ))}
                         </div>
                        <div className="mt-4 flex justify-between items-center">
                             <span className="text-sm text-dark-text-secondary">Showing {paginatedIncidents.length} of {sortedIncidents.length} results</span>
                            <div className="flex items-center space-x-2">
                                <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                                <span className="text-sm text-dark-text">Page {currentPage} of {totalPages}</span>
                                <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                            </div>
                        </div>
                    </>
                )
            }
             <Modal title="AI-Powered Narrative Generator" isOpen={isNarrativeModalOpen} onClose={() => setIsNarrativeModalOpen(false)}>
                 <div className="space-y-4">
                    <p className="text-dark-text-secondary text-sm">Enter keywords for the incident, and the AI will generate a draft narrative. Example: "2-story residential, smoke showing, forced entry, primary search, fire knocked down".</p>
                    <textarea value={narrativeKeywords} onChange={e => setNarrativeKeywords(e.target.value)} rows={3} placeholder="Enter keywords here..." className="w-full bg-dark-bg border-dark-border rounded-md p-2 text-dark-text"/>
                    <Button onClick={handleGenerateNarrative} isLoading={isNarrativeLoading} className="w-full">Generate Narrative</Button>
                    {generatedNarrative && (
                        <div className="p-3 bg-dark-bg rounded-md border border-dark-border">
                            <h4 className="font-semibold mb-2">Generated Narrative:</h4>
                            <p className="text-dark-text-secondary whitespace-pre-wrap">{generatedNarrative}</p>
                            <div className="text-right mt-3">
                                <Button onClick={handleCopyNarrative}>Copy to Clipboard</Button>
                            </div>
                        </div>
                    )}
                 </div>
             </Modal>
        </div>
    );
};

export default Incidents;
