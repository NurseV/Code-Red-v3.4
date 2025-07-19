

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import * as api from '../services/api';
import { Apparatus as ApparatusType, ApparatusStatus, Role, SavedApparatusView } from '../types';
import { useInternalAuth } from '../hooks/useInternalAuth';
import { 
    ListChecksIcon, SearchIcon, PlusIcon, TruckIcon, WrenchIcon, XCircleIcon, CheckCircle2Icon,
    ChevronDownIcon, SaveIcon, XIcon, FilterIcon, Trash2Icon, EyeIcon
} from '../components/icons/Icons';

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

// --- Sub-components for the page ---

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string; onClick: () => void; }> = ({ title, value, icon, color, onClick }) => (
    <div onClick={onClick} className="bg-dark-card border border-dark-border rounded-lg p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-brand-primary/50 cursor-pointer">
        <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
            <div>
                <p className="text-sm font-medium text-dark-text-secondary">{title}</p>
                <p className="text-3xl font-bold text-dark-text">{value}</p>
            </div>
        </div>
    </div>
);

const ApparatusSummaryCard: React.FC<{apparatus: ApparatusType}> = ({ apparatus }) => {
    const [lastCheckBy, setLastCheckBy] = useState('Loading...');

    useEffect(() => {
        const lastVitals = apparatus.vitalsHistory?.[0];
        if (lastVitals?.userId) {
            api.getPersonnelById(lastVitals.userId).then(user => {
                setLastCheckBy(user?.name || 'Unknown');
            });
        } else {
            setLastCheckBy('N/A');
        }
    }, [apparatus]);

    const DetailItem: React.FC<{label: string, value?: string | number}> = ({label, value}) => (
        <div>
            <p className="text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">{label}</p>
            <p className="text-sm text-dark-text mt-1">{value || 'N/A'}</p>
        </div>
    );
    
    return (
        <div className="bg-dark-bg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <DetailItem label="Last Check By" value={lastCheckBy} />
            <DetailItem label="Next Annual Service" value={apparatus.serviceDates?.nextAnnualServiceDue ? new Date(apparatus.serviceDates.nextAnnualServiceDue).toLocaleDateString() : 'N/A'}/>
            <DetailItem label="Next Pump Test" value={apparatus.serviceDates?.nextPumpTestDue ? new Date(apparatus.serviceDates.nextPumpTestDue).toLocaleDateString() : 'N/A'}/>
             <div className="flex items-center justify-end">
                 <ReactRouterDOM.Link to={`/app/apparatus/${apparatus.id}`}>
                    <Button variant="secondary" size="sm">View Full Details</Button>
                 </ReactRouterDOM.Link>
            </div>
        </div>
    );
};


// --- Main Apparatus Page Component ---

const Apparatus: React.FC = () => {
  const navigate = ReactRouterDOM.useNavigate();
  const { user } = useInternalAuth();
  const [searchParams] = ReactRouterDOM.useSearchParams();
  const [allApparatus, setAllApparatus] = useState<ApparatusType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ApparatusType, direction: 'ascending' | 'descending' } | null>({ key: 'unitId', direction: 'ascending' });
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [savedViews, setSavedViews] = useState<SavedApparatusView[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<ApparatusStatus>(ApparatusStatus.IN_SERVICE);
  const [viewsDropdownOpen, setViewsDropdownOpen] = useState(false);
  const viewsDropdownRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState({
      searchTerm: '',
      type: 'All' as 'All' | ApparatusType['type'],
      status: (searchParams.get('status') as ApparatusStatus) || ('All' as 'All' | ApparatusStatus),
  });
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [apparatusData, viewsData] = await Promise.all([
        api.getApparatusList(),
        api.getApparatusViews()
    ]);
    setAllApparatus(apparatusData);
    setSavedViews(viewsData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const statusParam = searchParams.get('status') as ApparatusStatus | null;
    if (statusParam && Object.values(ApparatusStatus).includes(statusParam)) {
        setFilters(prev => ({ ...prev, status: statusParam }));
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (viewsDropdownRef.current && !viewsDropdownRef.current.contains(event.target as Node)) setViewsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const stats = useMemo(() => ({
      inService: allApparatus.filter(a => a.status === ApparatusStatus.IN_SERVICE).length,
      outOfService: allApparatus.filter(a => a.status === ApparatusStatus.OUT_OF_SERVICE).length,
      maintenance: allApparatus.filter(a => a.status === ApparatusStatus.MAINTENANCE).length,
  }), [allApparatus]);

  const filteredApparatus = useMemo(() => {
      return allApparatus.filter(item => {
          const termMatch = debouncedSearchTerm ? item.unitId.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) : true;
          const typeMatch = filters.type === 'All' || item.type === filters.type;
          const statusMatch = filters.status === 'All' || item.status === filters.status;
          return termMatch && typeMatch && statusMatch;
      });
  }, [allApparatus, debouncedSearchTerm, filters.type, filters.status]);

  const sortedApparatus = useMemo(() => {
    let sortableItems = [...filteredApparatus];
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
  }, [filteredApparatus, sortConfig]);

  const requestSort = (key: keyof ApparatusType) => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
      }
      setSortConfig({ key, direction });
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFilters(prev => ({...prev, [name]: value as any }));
      setExpandedRowId(null);
  };
  
  const handleStatCardClick = (status: ApparatusStatus) => {
      setFilters(prev => ({ ...prev, status }));
  };
  
  const handleRowClick = (item: ApparatusType) => {
      setExpandedRowId(prevId => (prevId === item.id ? null : item.id));
  };
  
  const handleApplyView = (view: SavedApparatusView) => {
    setFilters(view.filters);
    setSortConfig(view.sortConfig);
    setViewsDropdownOpen(false);
  };

  const handleSaveView = async () => {
    if (!newViewName) return;
    const newViewData = { name: newViewName, filters, sortConfig };
    const saved = await api.saveApparatusView(newViewData);
    setSavedViews([...savedViews, saved]);
    setIsViewModalOpen(false);
    setNewViewName('');
  };

   const handleDeleteView = async (viewId: string) => {
    if (window.confirm("Are you sure you want to delete this saved view?")) {
        await api.deleteApparatusView(viewId);
        setSavedViews(savedViews.filter(v => v.id !== viewId));
    }
   };

  const handleBulkStatusUpdate = async () => {
    await api.updateMultipleApparatusStatus(selectedIds, bulkStatus);
    fetchData(); // Refetch all data
    setSelectedIds([]);
    setIsBulkStatusModalOpen(false);
  };
  
  const clearFilters = () => {
      setFilters({ searchTerm: '', type: 'All', status: 'All' });
      setSortConfig({ key: 'unitId', direction: 'ascending' });
  }

  const statusMap: Record<ApparatusStatus, { icon: React.ReactNode, color: string }> = {
      [ApparatusStatus.IN_SERVICE]: { icon: <CheckCircle2Icon className="h-4 w-4 mr-2" />, color: 'text-green-400' },
      [ApparatusStatus.OUT_OF_SERVICE]: { icon: <XCircleIcon className="h-4 w-4 mr-2" />, color: 'text-red-400' },
      [ApparatusStatus.MAINTENANCE]: { icon: <WrenchIcon className="h-4 w-4 mr-2" />, color: 'text-yellow-400' },
  };
  
  const columns = [
    { header: 'Unit ID', accessor: (item: ApparatusType) => item.unitId, sortKey: 'unitId' as const },
    { header: 'Type', accessor: (item: ApparatusType) => item.type, sortKey: 'type' as const },
    { header: 'Status', sortKey: 'status' as const, accessor: (item: ApparatusType) => (
         <span className={`inline-flex items-center text-sm font-semibold ${statusMap[item.status].color}`}>
            {statusMap[item.status].icon}
            {item.status}
        </span>
      ),
    },
    { header: 'Mileage', accessor: (item: ApparatusType) => item.mileage.toLocaleString(), sortKey: 'mileage' as const },
    { header: 'Engine Hours', accessor: (item: ApparatusType) => item.engineHours.toFixed(1), sortKey: 'engineHours' as const },
    { header: 'Last Check', accessor: (item: ApparatusType) => new Date(item.lastCheck).toLocaleDateString(), sortKey: 'lastCheck' as const },
  ];

  const canAdd = user && [Role.ADMINISTRATOR, Role.CHIEF].includes(user.role);

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="In Service" value={stats.inService} icon={<TruckIcon className="h-6 w-6 text-white"/>} color="bg-green-600" onClick={() => handleStatCardClick(ApparatusStatus.IN_SERVICE)} />
            <StatCard title="Out of Service" value={stats.outOfService} icon={<TruckIcon className="h-6 w-6 text-white"/>} color="bg-red-600" onClick={() => handleStatCardClick(ApparatusStatus.OUT_OF_SERVICE)} />
            <StatCard title="In Maintenance" value={stats.maintenance} icon={<TruckIcon className="h-6 w-6 text-white"/>} color="bg-yellow-600" onClick={() => handleStatCardClick(ApparatusStatus.MAINTENANCE)} />
        </div>
        <Card>
            <div className="p-4 bg-dark-card mb-4 rounded-lg flex flex-wrap items-center gap-4 justify-between">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                        <input type="text" name="searchTerm" placeholder="Search by Unit ID..." value={filters.searchTerm} onChange={handleFilterChange} className="w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 pl-10 pr-4 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"/>
                    </div>
                    <select name="type" onChange={handleFilterChange} value={filters.type} className="bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text sm:text-sm">
                        <option>All Types</option><option>Engine</option><option>Ladder</option><option>Rescue</option><option>Tanker</option><option>Brush Truck</option>
                    </select>
                    <select name="status" onChange={handleFilterChange} value={filters.status} className="bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text sm:text-sm">
                        <option>All Statuses</option>
                        <option>{ApparatusStatus.IN_SERVICE}</option><option>{ApparatusStatus.OUT_OF_SERVICE}</option><option>{ApparatusStatus.MAINTENANCE}</option>
                    </select>
                    <Button variant="ghost" onClick={clearFilters}>Clear Filters</Button>
                </div>
                <div className="flex items-center gap-4">
                     <div className="relative" ref={viewsDropdownRef}>
                        <Button variant="ghost" onClick={() => setViewsDropdownOpen(p => !p)} icon={<SaveIcon className="h-4 w-4 mr-2"/>}>Views <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform ${viewsDropdownOpen ? 'rotate-180' : ''}`} /></Button>
                        {viewsDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-60 bg-dark-card border border-dark-border rounded-lg shadow-lg z-20">
                            <div className="p-2 border-b border-dark-border"><Button size="sm" className="w-full" onClick={() => setIsViewModalOpen(true)}>Save Current View</Button></div>
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
                    {canAdd && <Button onClick={() => navigate('/app/apparatus/new')} icon={<PlusIcon className="mr-2 h-5 w-5"/>}>New Apparatus</Button>}
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div className="p-3 mb-4 bg-blue-900/50 border border-blue-700 rounded-lg flex justify-between items-center">
                    <span className="font-semibold text-dark-text">{selectedIds.length} apparatus selected</span>
                    <Button variant="secondary" size="sm" onClick={() => setIsBulkStatusModalOpen(true)}>Change Status</Button>
                </div>
            )}
            
            {isLoading ? <div className="text-center p-8 text-dark-text-secondary">Loading apparatus fleet...</div>
                : <Table columns={columns} data={sortedApparatus} onRowClick={handleRowClick} sortConfig={sortConfig} requestSort={requestSort} expandedRowId={expandedRowId} renderExpandedRow={item => <ApparatusSummaryCard apparatus={item} />} isSelectable onSelectionChange={ids => setSelectedIds(ids as string[])} selectedIds={selectedIds} />
            }
        </Card>
        
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
        
        <Modal title="Bulk Change Status" isOpen={isBulkStatusModalOpen} onClose={() => setIsBulkStatusModalOpen(false)}>
            <div className="space-y-4">
                <p className="text-sm text-dark-text-secondary">Select the new status to apply to {selectedIds.length} selected apparatus.</p>
                <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value as ApparatusStatus)} className="w-full bg-dark-bg border-dark-border rounded-md py-2 px-3 text-dark-text sm:text-sm">
                    {Object.values(ApparatusStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="flex justify-end pt-2 space-x-2">
                    <Button variant="ghost" onClick={() => setIsBulkStatusModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleBulkStatusUpdate}>Apply Status</Button>
                </div>
            </div>
        </Modal>
    </div>
  );
};

export default Apparatus;
