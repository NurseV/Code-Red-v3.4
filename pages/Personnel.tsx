

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import * as api from '../services/api';
import { Personnel as PersonnelType, Role, Applicant, ApplicantStatus, SavedPersonnelView } from '../types';
import { MOCK_PERSONNEL } from '../constants';
import { useInternalAuth } from '../hooks/useInternalAuth';
import { UserPlusIcon, UsersIcon, ShieldAlertIcon, SearchIcon, PlusIcon, ChevronDownIcon, ChevronUpIcon, MoreVerticalIcon, EyeIcon, SaveIcon, Trash2Icon, XIcon, UserCheckIcon, UserXIcon } from '../components/icons/Icons';

// --- Applicant Tracking Sub-components ---
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
        className="bg-dark-bg border border-dark-border p-3 rounded-lg shadow-sm cursor-grab active:cursor-grabbing"
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
            className="bg-dark-bg/80 rounded-lg w-full md:w-1/5 p-2 flex-shrink-0"
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

const ApplicantTrackingView: React.FC = () => {
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
                setApplicants(prev => prev.map(app => 
                    app.id === applicantId ? { ...app, status: newStatus } : app
                ));
                api.updateApplicantStatus(applicantId, newStatus).catch(err => {
                    alert("Failed to update applicant status.");
                    fetchApplicants();
                });
            }
        }
    };

    const handleConfirmPromotion = async () => {
        if (!applicantToPromote) return;
        
        try {
            await api.promoteApplicantToPersonnel(applicantToPromote.id);
            alert(`${applicantToPromote.name} has been promoted to Personnel.`);
            fetchApplicants(); 
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


// --- Personnel Roster Sub-components ---
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

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-dark-bg p-4 rounded-lg border border-dark-border flex items-center">
        <div className="p-3 rounded-full bg-dark-card mr-4">{icon}</div>
        <div>
            <p className="text-sm font-medium text-dark-text-secondary">{title}</p>
            <p className="text-2xl font-bold text-dark-text">{value}</p>
        </div>
    </div>
);

const FilterPill: React.FC<{ label: string; onClear: () => void }> = ({ label, onClear }) => (
    <span className="inline-flex items-center py-1 pl-3 pr-2 rounded-full text-sm font-medium bg-dark-border text-dark-text">
        {label}
        <button onClick={onClear} className="ml-2 -mr-0.5 p-0.5 rounded-full hover:bg-dark-bg transition-colors">
            <XIcon className="h-3 w-3" />
        </button>
    </span>
);


const PersonnelSummaryCard: React.FC<{person: PersonnelType}> = ({ person }) => {
    const DetailItem: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
        <div>
            <p className="text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">{label}</p>
            <p className="text-sm text-dark-text mt-1">{value || 'N/A'}</p>
        </div>
    );

    return (
        <div className="bg-dark-bg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
             <DetailItem label="NFIRS ID" value={person.nfirsId} />
             <DetailItem label="Active 911 Code" value={person.active911Code} />
             <DetailItem label="Positions" value={person.positions?.join(', ')} />
             <DetailItem label="Primary Contact" value={(person.phoneNumbers || []).find(p => p.type === "Work")?.number || 'N/A'} />
             <div className="col-span-2 md:col-span-4">
                 <p className="text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">Emergency Contacts</p>
                 <ul className="mt-1 space-y-1">
                 {(person.emergencyContacts || []).length > 0 ? (person.emergencyContacts || []).map(c => (
                     <li key={c.id} className="text-sm text-dark-text">{c.name} ({c.relationship}): {c.phone}</li>
                 )) : <li className="text-sm text-dark-text">N/A</li>}
                 </ul>
             </div>
        </div>
    );
};

const RosterView: React.FC = () => {
    const { user } = useInternalAuth();
    const navigate = ReactRouterDOM.useNavigate();
    const [searchParams, setSearchParams] = ReactRouterDOM.useSearchParams();
    const [personnel, setPersonnel] = useState<PersonnelType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEmployeeData, setNewEmployeeData] = useState({ name: '', email: '', rank: 'Probation', status: 'Probation' as PersonnelType['status']});
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    
    const [sortConfig, setSortConfig] = useState<{ key: keyof PersonnelType, direction: 'ascending' | 'descending' } | null>({ key: 'rank', direction: 'ascending' });

    const [filters, setFilters] = useState({
        searchTerm: '',
        rank: 'All',
        status: (searchParams.get('status') as PersonnelType['status']) || ('All' as 'All' | PersonnelType['status']),
        trainingCompliance: searchParams.get('filter') as 'non-compliant' | undefined,
    });
    const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);
    const [allPersonnel, setAllPersonnel] = useState<PersonnelType[]>([]);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [savedViews, setSavedViews] = useState<SavedPersonnelView[]>([]);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [newViewName, setNewViewName] = useState('');
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
    const [viewsDropdownOpen, setViewsDropdownOpen] = useState(false);

    const actionMenuRef = useRef<HTMLDivElement>(null);
    const viewsDropdownRef = useRef<HTMLDivElement>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const params = {
            searchTerm: debouncedSearchTerm,
            rank: filters.rank === 'All' ? undefined : filters.rank,
            status: filters.status === 'All' ? undefined : filters.status,
            trainingCompliance: filters.trainingCompliance
        };
        const data = await api.getPersonnelList(params);
        setAllPersonnel(data);
        setIsLoading(false);
        setCurrentPage(1); // Reset page on filter/sort change
    }, [debouncedSearchTerm, filters.rank, filters.status, filters.trainingCompliance]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        api.getPersonnelViews().then(setSavedViews);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) setActionMenuOpen(null);
            if (viewsDropdownRef.current && !viewsDropdownRef.current.contains(event.target as Node)) setViewsDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const stats = useMemo(() => ({
        total: allPersonnel.length,
        active: allPersonnel.filter(p => p.status === 'Active').length,
        probation: allPersonnel.filter(p => p.status === 'Probation').length,
        inactive: allPersonnel.filter(p => p.status === 'Inactive').length
    }), [allPersonnel]);
  
    const RANK_ORDER = ['Chief', 'Captain', 'Lieutenant', 'Engineer', 'Firefighter', 'Paramedic', 'Probation', 'Administrator'];

    const sortedPersonnel = useMemo(() => {
        let sortableItems = [...allPersonnel];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                let comparison = 0;
                if (sortConfig.key === 'rank') {
                    comparison = (RANK_ORDER.indexOf(aVal as string) ?? 99) - (RANK_ORDER.indexOf(bVal as string) ?? 99);
                } else if (typeof aVal === 'string' && typeof bVal === 'string') {
                    comparison = aVal.localeCompare(bVal);
                } else {
                    if (aVal < bVal) comparison = -1;
                    if (aVal > bVal) comparison = 1;
                }
                return sortConfig.direction === 'ascending' ? comparison : -comparison;
            });
        }
        return sortableItems;
    }, [allPersonnel, sortConfig]);

    const paginatedPersonnel = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedPersonnel.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedPersonnel, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(sortedPersonnel.length / itemsPerPage);
  
    const requestSort = (key: keyof PersonnelType) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value as any }));
    };

    const handleClearFilter = (filterKey: keyof typeof filters) => {
        if (filterKey === 'trainingCompliance') {
            searchParams.delete('filter');
            setSearchParams(searchParams);
        }
        setFilters(prev => ({
            ...prev,
            [filterKey]: filterKey === 'searchTerm' ? '' : filterKey === 'trainingCompliance' ? undefined : 'All',
        }));
    };

    const handleApplyView = (view: SavedPersonnelView) => {
        setFilters({
            ...view.filters,
            trainingCompliance: undefined,
        });
        setSortConfig(view.sortConfig);
        setViewsDropdownOpen(false);
    };

    const handleSaveView = async () => {
        if (!newViewName) return;
        const newViewData = { name: newViewName, filters, sortConfig };
        const saved = await api.savePersonnelView(newViewData);
        setSavedViews([...savedViews, saved]);
        setIsViewModalOpen(false);
        setNewViewName('');
    };

    const handleDeleteView = async (viewId: string) => {
        if (window.confirm("Are you sure you want to delete this saved view?")) {
            await api.deletePersonnelView(viewId);
            setSavedViews(savedViews.filter(v => v.id !== viewId));
        }
    };

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            const newPersonnel = await api.createPersonnelDirectly(newEmployeeData, user);
            setIsAddModalOpen(false);
            navigate(`/app/personnel/${newPersonnel.id}`);
        } catch(err) {
            alert("Failed to create new employee.");
        }
    };

    const handleBulkDeactivate = async () => {
        if (window.confirm(`Are you sure you want to deactivate ${selectedIds.length} personnel?`)) {
            await api.updateMultiplePersonnelStatus(selectedIds, 'Inactive');
            fetchData();
            setSelectedIds([]);
        }
    };
    
    const handleRowClick = (item: PersonnelType) => {
        setExpandedRowId(prevId => (prevId === item.id ? null : item.id));
    };

    const renderExpandedRow = (item: PersonnelType) => (
        <PersonnelSummaryCard person={item} />
    );

    const ranks = useMemo(() => ['All', ...new Set(MOCK_PERSONNEL.map(p => p.rank))], []);

    const columns = [
        {
            header: 'Name', sortKey: 'name' as const,
            accessor: (item: PersonnelType) => (
                <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full" src={item.avatarUrl} alt="" />
                    <div className="ml-4">
                        <div className="flex items-center">
                            <ReactRouterDOM.Link to={`/app/personnel/${item.id}`} className="text-sm font-medium text-dark-text hover:text-brand-primary hover:underline" onClick={e => e.stopPropagation()}>{item.name}</ReactRouterDOM.Link>
                            {item.hasExpiringCerts && 
                                <div className="ml-2 group relative">
                                    <ShieldAlertIcon className="h-5 w-5 text-yellow-400"/>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max hidden group-hover:block bg-dark-bg text-white text-xs rounded py-1 px-2 border border-dark-border shadow-lg z-10">Has expiring certifications</div>
                                </div>
                            }
                        </div>
                        <div className="text-sm text-dark-text-secondary">{item.emails?.[0]?.address}</div>
                    </div>
                </div>
            ),
        },
        { header: 'Rank', sortKey: 'rank' as const, accessor: (item: PersonnelType) => item.rank },
        {
            header: 'Status',
            accessor: (item: PersonnelType) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.status === 'Active' ? 'bg-green-500/20 text-green-300' : 
                    item.status === 'Probation' ? 'bg-purple-500/20 text-purple-300' :
                    'bg-red-500/20 text-red-300'
                }`}>
                    {item.status}
                </span>
            ),
        },
        { header: 'Badge #', accessor: (item: PersonnelType) => item.badgeNumber },
        {
            header: 'Actions', className: 'text-right w-12',
            accessor: (item: PersonnelType) => (
                <div className="relative text-right" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setActionMenuOpen(actionMenuOpen === item.id ? null : item.id)} className="p-1 rounded-full hover:bg-dark-border">
                        <MoreVerticalIcon className="h-5 w-5 text-dark-text-secondary" />
                    </button>
                    {actionMenuOpen === item.id && (
                        <div ref={actionMenuRef} className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-md shadow-lg z-10">
                            <ul>
                                <li>
                                    <ReactRouterDOM.Link to={`/app/personnel/${item.id}`} className="flex items-center w-full text-left px-4 py-2 text-sm text-dark-text-secondary hover:bg-dark-border hover:text-dark-text">
                                        <EyeIcon className="h-4 w-4 mr-3" /> View Profile
                                    </ReactRouterDOM.Link>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            )
        }
    ];

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <StatCard title="Total Personnel" value={stats.total} icon={<UsersIcon className="h-6 w-6 text-blue-400"/>}/>
                <StatCard title="Active" value={stats.active} icon={<UserCheckIcon className="h-6 w-6 text-green-400"/>}/>
                <StatCard title="Probationary" value={stats.probation} icon={<UserPlusIcon className="h-6 w-6 text-purple-400"/>}/>
                <StatCard title="Inactive" value={stats.inactive} icon={<UserXIcon className="h-6 w-6 text-red-400"/>}/>
            </div>
            <div className="p-4 bg-dark-card mb-4 rounded-lg flex flex-wrap items-center gap-2">
                <div className="relative flex-grow min-w-[200px]">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                    <input type="text" name="searchTerm" placeholder="Search by name, badge..." value={filters.searchTerm} onChange={handleFilterChange} className="w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 pl-10 pr-4 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"/>
                </div>
                <select name="rank" onChange={handleFilterChange} value={filters.rank} className="bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text sm:text-sm">
                    {ranks.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select name="status" onChange={handleFilterChange} value={filters.status} className="bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text sm:text-sm">
                    <option>All</option><option>Active</option><option>Probation</option><option>Inactive</option>
                </select>
                <div className="relative" ref={viewsDropdownRef}>
                    <Button variant="ghost" onClick={() => setViewsDropdownOpen(prev => !prev)} icon={<SaveIcon className="h-5 w-5 mr-2"/>}>Views <ChevronDownIcon className="h-4 w-4 ml-1"/></Button>
                    {viewsDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-60 bg-dark-card border border-dark-border rounded-lg shadow-lg z-20">
                           <div className="p-2 border-b border-dark-border">
                                <Button size="sm" className="w-full" onClick={() => { setIsViewModalOpen(true); setViewsDropdownOpen(false); }}>Save Current View</Button>
                           </div>
                            <ul className="max-h-60 overflow-y-auto">
                                {savedViews.map(view => (
                                    <li key={view.id} className="flex justify-between items-center px-3 py-2 text-sm text-dark-text-secondary hover:bg-dark-border group">
                                        <button className="text-left w-full" onClick={() => handleApplyView(view)}>{view.name}</button>
                                        <button className="opacity-0 group-hover:opacity-100" onClick={() => handleDeleteView(view.id)}><Trash2Icon className="h-4 w-4 text-red-400"/></button>
                                    </li>
                                ))}
                                {savedViews.length === 0 && <li className="px-3 py-4 text-center text-xs">No saved views.</li>}
                            </ul>
                        </div>
                    )}
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} icon={<PlusIcon className="h-5 w-5 mr-2"/>}>Add Employee</Button>
            </div>
            <div className="flex items-center gap-2 mb-4 h-6">
                {(filters.searchTerm || filters.rank !== 'All' || filters.status !== 'All' || filters.trainingCompliance) && <span className="text-sm font-semibold text-dark-text-secondary">Active Filters:</span>}
                {filters.searchTerm && <FilterPill label={`Search: "${filters.searchTerm}"`} onClear={() => handleClearFilter('searchTerm')} />}
                {filters.rank !== 'All' && <FilterPill label={`Rank: ${filters.rank}`} onClear={() => handleClearFilter('rank')} />}
                {filters.status !== 'All' && <FilterPill label={`Status: ${filters.status}`} onClear={() => handleClearFilter('status')} />}
                {filters.trainingCompliance && <FilterPill label="Non-Compliant Training" onClear={() => handleClearFilter('trainingCompliance')} />}
            </div>
            
            {selectedIds.length > 0 && (
                <div className="p-3 mb-4 bg-blue-900/50 border border-blue-700 rounded-lg flex justify-between items-center">
                    <span className="font-semibold text-dark-text">{selectedIds.length} personnel selected</span>
                    <Button variant="danger" size="sm" onClick={handleBulkDeactivate}>Deactivate Selected</Button>
                </div>
            )}
            
            {isLoading ? (
                <div className="text-center p-8 text-dark-text-secondary">Loading personnel...</div>
            ) : (
                <>
                <Table columns={columns} data={paginatedPersonnel} sortConfig={sortConfig} requestSort={requestSort} onRowClick={handleRowClick} isSelectable selectedIds={selectedIds} onSelectionChange={(ids) => setSelectedIds(ids as string[])} expandedRowId={expandedRowId} renderExpandedRow={renderExpandedRow} />
                <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-dark-text-secondary">Showing {paginatedPersonnel.length} of {sortedPersonnel.length} results</span>
                    <div className="flex items-center space-x-2">
                        <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                        <span className="text-sm text-dark-text">Page {currentPage} of {totalPages}</span>
                        <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                    </div>
                </div>
                </>
            )}
            <Modal title="Add New Employee (Direct)" isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                <form onSubmit={handleAddEmployee} className="space-y-4">
                    <p className="text-sm text-dark-text-secondary">Use this form to add existing personnel for system migration purposes.</p>
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Full Name</label>
                        <input type="text" value={newEmployeeData.name} onChange={e => setNewEmployeeData({...newEmployeeData, name: e.target.value})} required className="w-full bg-dark-bg border-dark-border rounded-md p-2 text-dark-text" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Email Address</label>
                        <input type="email" value={newEmployeeData.email} onChange={e => setNewEmployeeData({...newEmployeeData, email: e.target.value})} required className="w-full bg-dark-bg border-dark-border rounded-md p-2 text-dark-text" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Initial Rank</label>
                        <input type="text" value={newEmployeeData.rank} onChange={e => setNewEmployeeData({...newEmployeeData, rank: e.target.value})} required className="w-full bg-dark-bg border-dark-border rounded-md p-2 text-dark-text" />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-dark-text-secondary mb-1">Status</label>
                         <select value={newEmployeeData.status} onChange={e => setNewEmployeeData({...newEmployeeData, status: e.target.value as any})} className="w-full bg-dark-bg border-dark-border rounded-md p-2 text-dark-text">
                            <option>Probation</option><option>Active</option><option>Inactive</option>
                        </select>
                    </div>
                    <div className="flex justify-end pt-4 space-x-2">
                        <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Employee</Button>
                    </div>
                </form>
            </Modal>
            <Modal title="Save Current View" isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
                <div className="space-y-4">
                    <p className="text-sm text-dark-text-secondary">Save the current filters and sorting for quick access later.</p>
                    <input type="text" value={newViewName} onChange={e => setNewViewName(e.target.value)} placeholder="Enter view name..." className="w-full bg-dark-bg border-dark-border rounded-md p-2 text-dark-text" />
                    <div className="flex justify-end pt-2 space-x-2">
                        <Button variant="ghost" onClick={() => setIsViewModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveView}>Save View</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

// --- Main Personnel Page Component ---
const Personnel: React.FC = () => {
  const { user } = useInternalAuth();
  const [view, setView] = useState<'roster' | 'applicants'>('roster');

  return (
    <Card 
      title={view === 'roster' ? "Personnel Roster" : "Applicant Tracking"}
      actions={
        <div className="flex space-x-2">
            {view === 'roster' && user && [Role.CHIEF, Role.ADMINISTRATOR].includes(user.role) && (
              <Button onClick={() => setView('applicants')} icon={<UserPlusIcon className="h-5 w-5 mr-2" />}>
                Applicant Tracking
              </Button>
            )}
            {view === 'applicants' && (
               <Button onClick={() => setView('roster')} icon={<UsersIcon className="h-5 w-5 mr-2" />}>
                Personnel Roster
              </Button>
            )}
        </div>
      }
    >
        {view === 'roster' ? <RosterView /> : <ApplicantTrackingView />}
    </Card>
  );
};

export default Personnel;
