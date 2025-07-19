
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import * as api from '../services/api';
import { FireDue, FireDueStatus, Property } from '../types';
import { DollarSignIcon, TrendingUpIcon, TrendingDownIcon, SearchIcon, PlusIcon, FileDownIcon, MoreVerticalIcon, EditIcon, Trash2Icon, CheckCircle2Icon } from '../components/icons/Icons';

interface DetailedFireDue extends FireDue {
    address: string;
    ownerName: string;
    parcelId: string;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; change?: number; changeType?: 'increase' | 'decrease' }> = ({ title, value, icon, change, changeType }) => {
    return (
        <div className="bg-dark-bg border border-dark-border/50 rounded-lg p-5">
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-dark-card rounded-lg">{icon}</div>
                <div>
                    <p className="text-sm font-medium text-dark-text-secondary">{title}</p>
                    <p className="text-2xl font-bold text-dark-text">{value}</p>
                </div>
            </div>
        </div>
    );
};

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

const getStatusColor = (status: FireDueStatus) => {
    switch (status) {
        case FireDueStatus.PAID: return { pill: 'bg-green-500/20 text-green-400' };
        case FireDueStatus.UNPAID: return { pill: 'bg-yellow-500/20 text-yellow-400' };
        case FireDueStatus.OVERDUE: return { pill: 'bg-red-500/20 text-red-400' };
        default: return { pill: 'bg-gray-500/20 text-gray-400' };
    }
};


export const FireDues: React.FC = () => {
    const [dues, setDues] = useState<DetailedFireDue[]>([]);
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({ status: 'all' as FireDueStatus | 'all', searchTerm: '' });
    const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);
    const [sortConfig, setSortConfig] = useState<{ key: keyof DetailedFireDue, direction: 'ascending' | 'descending' } | null>({ key: 'dueDate', direction: 'descending' });
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDue, setEditingDue] = useState<Partial<DetailedFireDue> | null>(null);

    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);

    const fetchData = useCallback(() => {
        setIsLoading(true);
        Promise.all([
            api.getFireDuesWithDetails(),
            api.getProperties(),
        ]).then(([duesData, propertiesData]) => {
            setDues(duesData);
            setAllProperties(propertiesData as Property[]);
        }).finally(() => setIsLoading(false));
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setActionMenuOpen(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const summaryStats = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const totalDue = dues.filter(d => d.status === 'Unpaid' || d.status === 'Overdue').reduce((sum, d) => sum + d.amount, 0);
        const totalOverdue = dues.filter(d => d.status === 'Overdue').reduce((sum, d) => sum + d.amount, 0);
        
        const ytdDues = dues.filter(d => d.year === currentYear);
        const paidYtdCount = ytdDues.filter(d => d.status === 'Paid').length;
        const collectionRate = ytdDues.length > 0 ? (paidYtdCount / ytdDues.length) * 100 : 0;
        const totalCollectedYTD = ytdDues.filter(d => d.status === 'Paid').reduce((sum, d) => sum + d.amount, 0);

        return { totalDue, totalOverdue, collectionRate, totalCollectedYTD };
    }, [dues]);

    const requestSort = (key: keyof DetailedFireDue) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const processedDues = useMemo(() => {
        let filtered = dues.filter(due => {
            const statusMatch = filters.status === 'all' || due.status === filters.status;
            const searchMatch = debouncedSearchTerm ? (
                due.address.toLowerCase().includes(debouncedSearchTerm) ||
                due.ownerName.toLowerCase().includes(debouncedSearchTerm) ||
                due.parcelId.toLowerCase().includes(debouncedSearchTerm)
            ) : true;
            return statusMatch && searchMatch;
        });

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filtered;
    }, [dues, filters, debouncedSearchTerm, sortConfig]);

    const paginatedDues = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return processedDues.slice(startIndex, startIndex + itemsPerPage);
    }, [processedDues, currentPage, itemsPerPage]);
    
    const totalPages = Math.ceil(processedDues.length / itemsPerPage);

    const handleOpenModal = (due: Partial<DetailedFireDue> | null) => {
        setEditingDue(due);
        setIsModalOpen(true);
    };

    const handleSaveDue = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDue) return;
        
        try {
            if (editingDue.id) {
                await api.updateFireDue(editingDue.id, editingDue);
            } else {
                await api.createFireDue(editingDue);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert(`Failed to save fire due.`);
        }
    };
    
    const handleDeleteDue = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this fire due record?")) {
            await api.deleteFireDue(id);
            setActionMenuOpen(null);
            fetchData();
        }
    };

    const handleBulkMarkPaid = async () => {
        if(window.confirm(`Are you sure you want to mark ${selectedIds.length} items as paid?`)) {
            await api.updateMultipleFireDueStatus(selectedIds, FireDueStatus.PAID);
            fetchData();
            setSelectedIds([]);
        }
    };
    
    const handleExport = () => {
        const headers = ["Parcel ID", "Property Address", "Primary Owner", "Fiscal Year", "Amount", "Due Date", "Status", "Payment Date"];
        const rows = processedDues.map(d => [
            d.parcelId, d.address, d.ownerName, d.year, d.amount, d.dueDate, d.status, d.paymentDate || ''
        ].join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "fire_dues_export.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        { header: 'Parcel ID', accessor: (item: DetailedFireDue) => item.parcelId, sortKey: 'parcelId' as const },
        { header: 'Property Address', accessor: (item: DetailedFireDue) => <ReactRouterDOM.Link to={`/app/properties/${item.propertyId}`} className="hover:underline text-brand-secondary">{item.address}</ReactRouterDOM.Link>, sortKey: 'address' as const },
        { header: 'Primary Owner', accessor: (item: DetailedFireDue) => item.ownerName, sortKey: 'ownerName' as const },
        { header: 'Fiscal Year', accessor: (item: DetailedFireDue) => item.year, sortKey: 'year' as const },
        { header: 'Amount', accessor: (item: DetailedFireDue) => `$${item.amount.toFixed(2)}`, sortKey: 'amount' as const },
        { header: 'Due Date', accessor: (item: DetailedFireDue) => new Date(item.dueDate).toLocaleDateString(), sortKey: 'dueDate' as const },
        { header: 'Status', accessor: (item: DetailedFireDue) => <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status).pill}`}>{item.status}</span>, sortKey: 'status' as const },
        {
            header: 'Actions',
            accessor: (item: DetailedFireDue) => item.status === FireDueStatus.PAID ? (
                <span className="text-sm text-gray-400">{item.paymentDate ? new Date(item.paymentDate).toLocaleDateString() : 'Paid'}</span>
            ) : (
                <div className="relative text-right" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setActionMenuOpen(actionMenuOpen === item.id ? null : item.id)} className="p-1 rounded-full hover:bg-dark-border">
                        <MoreVerticalIcon className="h-5 w-5" />
                    </button>
                    {actionMenuOpen === item.id && (
                        <div ref={actionMenuRef} className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-md shadow-lg z-10">
                            <ul>
                                <li>
                                    <button onClick={() => handleOpenModal(item)} className="w-full text-left flex items-center px-4 py-2 text-sm text-dark-text-secondary hover:bg-dark-border"><EditIcon className="h-4 w-4 mr-2" /> Edit</button>
                                </li>
                                <li>
                                    <button onClick={() => handleDeleteDue(item.id)} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-dark-border"><Trash2Icon className="h-4 w-4 mr-2" /> Delete</button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            )
        },
    ];

    return (
        <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <StatCard title="Total Outstanding" value={`$${summaryStats.totalDue.toLocaleString()}`} icon={<DollarSignIcon className="h-6 w-6 text-yellow-400" />} />
                <StatCard title="Total Overdue" value={`$${summaryStats.totalOverdue.toLocaleString()}`} icon={<DollarSignIcon className="h-6 w-6 text-red-400" />} />
                <StatCard title="YTD Collection Rate" value={`${summaryStats.collectionRate.toFixed(1)}%`} icon={<TrendingUpIcon className="h-6 w-6 text-green-400" />} />
                <StatCard title="YTD Collected" value={`$${summaryStats.totalCollectedYTD.toLocaleString()}`} icon={<CheckCircle2Icon className="h-6 w-6 text-blue-400" />} />
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                        <input type="text" placeholder="Search by address, owner, parcel..." value={filters.searchTerm} onChange={e => setFilters({ ...filters, searchTerm: e.target.value })} className="w-full bg-dark-bg border border-dark-border rounded-md py-2 pl-10 pr-4 text-dark-text" />
                    </div>
                    <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value as any })} className="bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text">
                        <option value="all">All Statuses</option>
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="secondary" onClick={handleExport} icon={<FileDownIcon className="h-4 w-4 mr-2" />}>Export CSV</Button>
                    <Button onClick={() => handleOpenModal(null)} icon={<PlusIcon className="h-4 w-4 mr-2" />}>New Due Record</Button>
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div className="p-3 mb-4 bg-blue-900/50 border border-blue-700 rounded-lg flex justify-between items-center">
                    <span className="font-semibold">{selectedIds.length} items selected</span>
                    <Button variant="secondary" size="sm" onClick={handleBulkMarkPaid}>Mark as Paid</Button>
                </div>
            )}
            
            {isLoading ? <div className="text-center p-8 text-dark-text-secondary">Loading fire dues...</div> :
                <>
                    <Table columns={columns} data={paginatedDues} isSelectable selectedIds={selectedIds} onSelectionChange={(ids) => setSelectedIds(ids as string[])} sortConfig={sortConfig} requestSort={requestSort} />
                    <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm text-dark-text-secondary">Showing {paginatedDues.length} of {processedDues.length} results</span>
                        <div className="flex items-center space-x-2">
                            <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                            <span className="text-sm text-dark-text">Page {currentPage} of {totalPages}</span>
                            <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                        </div>
                    </div>
                </>
            }

            <Modal title={editingDue?.id ? "Edit Fire Due" : "Create New Fire Due"} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSaveDue} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Property</label>
                        <select
                            value={editingDue?.propertyId || ''}
                            onChange={e => setEditingDue({ ...editingDue, propertyId: e.target.value })}
                            required
                            className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text"
                        >
                            <option value="">Select a property</option>
                            {allProperties.map(prop => (
                                <option key={prop.id} value={prop.id}>{(prop as any).address}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Fiscal Year</label>
                        <input
                            type="number"
                            value={editingDue?.year || ''}
                            onChange={e => setEditingDue({ ...editingDue, year: Number(e.target.value) })}
                            required
                            className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Amount</label>
                        <input
                            type="number"
                            step="0.01"
                            value={editingDue?.amount || ''}
                            onChange={e => setEditingDue({ ...editingDue, amount: Number(e.target.value) })}
                            required
                            className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text"
                        />
                    </div>
                    {editingDue?.id && (
                        <div>
                            <label className="block text-sm font-medium text-dark-text-secondary mb-1">Status</label>
                            <select
                                value={editingDue?.status || ''}
                                onChange={e => setEditingDue({ ...editingDue, status: e.target.value as FireDueStatus })}
                                required
                                className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text"
                            >
                                {Object.values(FireDueStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="pt-4 flex justify-end space-x-2">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">{editingDue?.id ? 'Save Changes' : 'Create Record'}</Button>
                    </div>
                </form>
            </Modal>
        </Card>
    );
};

export default FireDues;
