
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line } from 'recharts';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import * as api from '../services/api';
import { Consumable, ConsumableUsageLog } from '../types';
import { PlusIcon, EditIcon, XIcon, SearchIcon, FilterIcon, PrinterIcon, BarcodeIcon, FileTextIcon, ListChecksIcon, LayoutDashboardIcon, TrendingUpIcon, AlertTriangleIcon } from '../components/icons/Icons';
import { useInternalAuth } from '../hooks/useInternalAuth';

type InventoryView = 'dashboard' | 'list' | 'audit';
type ItemStatus = 'ok' | 'low' | 'expiring' | 'expired';

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

// --- Helper Functions & Components ---
const getItemStatus = (item: Consumable): ItemStatus => {
    const now = new Date();
    if (item.expirationDate) {
        const expDate = new Date(item.expirationDate);
        if (expDate < now) return 'expired';
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        if (expDate <= thirtyDaysFromNow) return 'expiring';
    }
    if (item.quantity <= item.reorderLevel) return 'low';
    return 'ok';
};

const statusPill = (status: ItemStatus) => {
    const styles: Record<ItemStatus, string> = {
        ok: 'bg-green-500/20 text-green-400',
        low: 'bg-yellow-500/20 text-yellow-400',
        expiring: 'bg-orange-500/20 text-orange-400',
        expired: 'bg-red-500/20 text-red-400',
    };
    return <span className={`px-2 py-0.5 inline-flex text-xs capitalize font-semibold rounded-full ${styles[status]}`}>{status}</span>;
}

const Sparkline: React.FC<{ data: { value: number }[]; color: string }> = ({ data, color }) => (
    <ResponsiveContainer width="100%" height={50}>
        <LineChart data={data}>
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
    </ResponsiveContainer>
);

// --- Dashboard View ---
const InventoryDashboard: React.FC<{ consumables: Consumable[], onNavigate: (view: InventoryView, filters: any) => void }> = ({ consumables, onNavigate }) => {
    
    const stats = useMemo(() => {
        const now = new Date();
        let needsReorder = 0;
        let expiringOrExpired = 0;

        const categoryCounts = consumables.reduce((acc, item) => {
            const status = getItemStatus(item);
            if (status === 'low') needsReorder++;
            if (status === 'expiring' || status === 'expired') expiringOrExpired++;
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Mock historical data for sparklines
        const generateHistory = (base: number) => Array.from({ length: 7 }, (_, i) => ({ value: base + Math.floor(Math.random() * (i + 1) * 2 - (i+1))}));

        return {
            needsReorder,
            expiringOrExpired,
            categoryDistribution: Object.entries(categoryCounts).map(([name, value]) => ({ name, value })),
            reorderHistory: generateHistory(needsReorder),
            expiringHistory: generateHistory(expiringOrExpired)
        };
    }, [consumables]);

    const attentionItems = useMemo(() => {
        return consumables
            .map(c => ({ ...c, status: getItemStatus(c) }))
            .filter(c => c.status === 'low' || c.status === 'expiring' || c.status === 'expired')
            .sort((a, b) => (a.status === 'expired' ? -1 : 1)); // Prioritize expired
    }, [consumables]);


    const StatCard: React.FC<{ title: string; value: number; color: string; history: { value: number }[]; onClick: () => void }> = ({ title, value, color, history, onClick }) => (
        <div onClick={onClick} className={`p-5 rounded-lg border ${color} bg-dark-card group cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1`}>
            <div className="flex justify-between items-start">
                 <div>
                    <p className="text-sm font-medium text-dark-text-secondary">{title}</p>
                    <p className="text-4xl font-bold text-dark-text">{value}</p>
                 </div>
                 <TrendingUpIcon className="h-6 w-6 text-gray-500 group-hover:text-white transition-colors" />
            </div>
            <div className="mt-2 -mx-5 -mb-5">
                <Sparkline data={history} color={color.replace('border-', '#')} />
            </div>
        </div>
    );
    
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    const attentionColumns = [
        { header: 'Item Name', accessor: (item: any) => item.name },
        { header: 'Qty on Hand', accessor: (item: any) => item.quantity },
        { header: 'Status', accessor: (item: any) => statusPill(item.status) }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="Items Needing Reorder" value={stats.needsReorder} color="border-yellow-500" history={stats.reorderHistory} onClick={() => onNavigate('list', { status: 'low' })} />
                <StatCard title="Expiring / Expired" value={stats.expiringOrExpired} color="border-red-500" history={stats.expiringHistory} onClick={() => onNavigate('list', { status: 'expiring' })} />
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Inventory Distribution by Category" className="lg:col-span-1">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie 
                                data={stats.categoryDistribution} 
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                outerRadius={100} 
                                fill="#8884d8" 
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {stats.categoryDistribution.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={COLORS[index % COLORS.length]} 
                                        className="cursor-pointer"
                                        onClick={() => onNavigate('list', { category: entry.name })}
                                    />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
                 <Card title="Attention Items" className="lg:col-span-2">
                    {attentionItems.length > 0 ? (
                         <Table columns={attentionColumns} data={attentionItems} />
                    ) : (
                        <div className="text-center py-8 text-dark-text-secondary">
                            <p>All items are in good standing.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

// --- Inventory List View ---
const InventoryList: React.FC<{ 
    consumables: Consumable[], 
    onUpdate: () => void, 
    user: any, 
    filters: any, 
    setFilters: (filters: any) => void 
}> = ({ consumables, onUpdate, user, filters, setFilters }) => {
    const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Consumable | null>(null);
    const [editData, setEditData] = useState<Partial<Consumable>>({});
    const [adjustData, setAdjustData] = useState({ quantity: 0, reason: '' });
    
    const filteredConsumables = useMemo(() => {
        return consumables
            .map(c => ({ ...c, status: getItemStatus(c) }))
            .filter(item => {
                const termMatch = debouncedSearchTerm ? item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) : true;
                const categoryMatch = !filters.category || filters.category === 'All' || item.category === filters.category;
                const statusMatch = !filters.status || filters.status === 'All' || item.status === filters.status;
                return termMatch && categoryMatch && statusMatch;
            });
    }, [consumables, debouncedSearchTerm, filters]);

    const categories = useMemo(() => ['All', ...new Set(consumables.map(c => c.category))], [consumables]);

    const handleOpenEditModal = (item: Consumable | null) => {
        setSelectedItem(item);
        setEditData(item ? { id: item.id, name: item.name, category: item.category, reorderLevel: item.reorderLevel, expirationDate: item.expirationDate } : { name: '', category: 'Medical', reorderLevel: 10, quantity: 0 });
        setIsEditModalOpen(true);
    };
    
    const handleSaveItem = async () => {
        try {
            if (selectedItem) {
                await api.updateConsumable(selectedItem.id, editData);
            } else {
                await api.createConsumable(editData as any);
            }
            onUpdate();
            setIsEditModalOpen(false);
        } catch(e) { alert('Failed to save item.'); }
    };
    
    const handleDeleteItem = async (id: string) => {
        if(window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            await api.deleteConsumable(id);
            onUpdate();
        }
    };
    
    const handleOpenAdjustModal = (item: Consumable) => {
        setSelectedItem(item);
        setAdjustData({ quantity: item.quantity, reason: '' });
        setIsAdjustModalOpen(true);
    };

    const handleAdjustStock = async () => {
        if(!selectedItem || !adjustData.reason) {
            alert('A reason for the adjustment is required.');
            return;
        }
        const change = adjustData.quantity - selectedItem.quantity;
        if(change === 0) {
            setIsAdjustModalOpen(false);
            return;
        }
        await api.logConsumableUsage(selectedItem.id, change, adjustData.reason, user.id);
        onUpdate();
        setIsAdjustModalOpen(false);
    };

    const handleOpenHistoryModal = (item: Consumable) => {
        setSelectedItem(item);
        setIsHistoryModalOpen(true);
    };

    const columns = [
        { header: 'Item Name', accessor: (item: any) => item.name },
        { header: 'Category', accessor: (item: any) => item.category },
        { header: 'Quantity', accessor: (item: any) => (
            <button onClick={() => handleOpenAdjustModal(item)} className="hover:underline">{item.quantity}</button>
        )},
        { header: 'Reorder At', accessor: (item: any) => item.reorderLevel },
        { header: 'Expires', accessor: (item: any) => item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'N/A' },
        { header: 'Status', accessor: (item: any) => statusPill(item.status) },
        { header: 'Actions', accessor: (item: any) => (
            <div className="flex space-x-1">
                <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(item)}><EditIcon className="h-4 w-4"/></Button>
                <Button variant="ghost" size="sm" onClick={() => handleOpenHistoryModal(item)}><FileTextIcon className="h-4 w-4"/></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}><XIcon className="h-4 w-4 text-red-500"/></Button>
            </div>
        )},
    ];

    return (
      <div className="space-y-4">
          <div className="p-4 bg-dark-card rounded-lg flex items-center space-x-4">
            <div className="relative flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                <input type="text" placeholder="Search items..." value={filters.searchTerm} onChange={e => setFilters({...filters, searchTerm: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-md py-2 pl-10 pr-4 text-dark-text" />
            </div>
             <select value={filters.category || 'All'} onChange={e => setFilters({...filters, category: e.target.value})} className="bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text">
                {categories.map(c => <option key={c}>{c}</option>)}
            </select>
             <select value={filters.status || 'All'} onChange={e => setFilters({...filters, status: e.target.value as any})} className="bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text">
                <option value="All">All Statuses</option>
                <option value="ok">OK</option>
                <option value="low">Low Stock</option>
                <option value="expiring">Expiring Soon</option>
                <option value="expired">Expired</option>
            </select>
            <Button onClick={() => handleOpenEditModal(null)} icon={<PlusIcon className="h-4 w-4 mr-1"/>}>New Item</Button>
        </div>
        <Table columns={columns} data={filteredConsumables} />

        {/* Edit/Add Modal */}
        <Modal title={selectedItem ? 'Edit Item' : 'Add New Item'} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
            <div className="space-y-4">
                <input type="text" placeholder="Item Name" value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full bg-dark-bg border-dark-border rounded p-2"/>
                <select value={editData.category || 'Medical'} onChange={e => setEditData({...editData, category: e.target.value as any})} className="w-full bg-dark-bg border-dark-border rounded p-2">
                    <option>Medical</option><option>Station Supplies</option><option>Rescue</option>
                </select>
                <input type="number" placeholder="Reorder Level" value={editData.reorderLevel || ''} onChange={e => setEditData({...editData, reorderLevel: Number(e.target.value)})} className="w-full bg-dark-bg border-dark-border rounded p-2"/>
                {!selectedItem && <input type="number" placeholder="Initial Quantity" value={editData.quantity || ''} onChange={e => setEditData({...editData, quantity: Number(e.target.value)})} className="w-full bg-dark-bg border-dark-border rounded p-2"/>}
                <div>
                    <label className="text-sm text-dark-text-secondary">Expiration Date (optional)</label>
                    <input type="date" value={editData.expirationDate?.split('T')[0] || ''} onChange={e => setEditData({...editData, expirationDate: e.target.value})} className="w-full bg-dark-bg border-dark-border rounded p-2"/>
                </div>
                 <div className="flex justify-end space-x-2"><Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button><Button onClick={handleSaveItem}>Save</Button></div>
            </div>
        </Modal>

        {/* Adjust Stock Modal */}
        {selectedItem && (
            <Modal title={`Adjust Stock: ${selectedItem.name}`} isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)}>
                <div className="space-y-4">
                    <input type="number" placeholder="New Quantity" value={adjustData.quantity} onChange={e => setAdjustData({...adjustData, quantity: Number(e.target.value)})} className="w-full bg-dark-bg border-dark-border rounded p-2"/>
                    <input type="text" placeholder="Reason for change (e.g., Restock, Used on call)" value={adjustData.reason} onChange={e => setAdjustData({...adjustData, reason: e.target.value})} className="w-full bg-dark-bg border-dark-border rounded p-2"/>
                    <div className="flex justify-end space-x-2"><Button variant="ghost" onClick={() => setIsAdjustModalOpen(false)}>Cancel</Button><Button onClick={handleAdjustStock}>Adjust Stock</Button></div>
                </div>
            </Modal>
        )}

        {/* History Modal */}
        {selectedItem && (
            <Modal title={`History for ${selectedItem.name}`} isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)}>
                <ul className="space-y-2 max-h-80 overflow-y-auto">
                    {selectedItem.usageHistory?.length ? selectedItem.usageHistory.map(log => (
                        <li key={log.id} className="p-2 bg-dark-bg rounded text-sm">
                            <p><span className="font-bold">{new Date(log.date).toLocaleString()}:</span> <span className={log.change > 0 ? 'text-green-400' : 'text-red-400'}>{log.change > 0 ? `+${log.change}`: log.change}</span></p>
                            <p className="text-dark-text-secondary pl-2">- {log.reason} (by {log.userName})</p>
                        </li>
                    )) : <p className="text-dark-text-secondary text-center">No history for this item.</p>}
                </ul>
            </Modal>
        )}
      </div>
    );
};

// --- Audit View ---
const InventoryAuditView: React.FC<{ 
    consumables: Consumable[],
    onAuditComplete: (updates: { consumableId: string, newQuantity: number }[]) => void 
}> = ({ consumables, onAuditComplete }) => {
    const [auditSession, setAuditSession] = useState<Record<string, { item: Consumable, count: number }>>({});
    const [lastScanned, setLastScanned] = useState<Consumable | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const scannerInputRef = useRef<HTMLInputElement>(null);

    // Keep input focused for scanner
    useEffect(() => {
        scannerInputRef.current?.focus();
    }, []);

    const handleScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const scannedId = e.currentTarget.value;
            if (!scannedId) return;

            const item = consumables.find(c => c.id === scannedId);
            
            if (item) {
                setAuditSession(prev => {
                    const existing = prev[item.id];
                    return {
                        ...prev,
                        [item.id]: {
                            item: item,
                            count: (existing?.count || 0) + 1,
                        }
                    };
                });
                setLastScanned(item);
            } else {
                console.warn(`Scanned item ID "${scannedId}" not found.`);
                setLastScanned(null);
            }
            e.currentTarget.value = '';
        }
    };

    const discrepancyReport = useMemo(() => {
        if (!isFinished) return [];

        const report: { item: Consumable, systemQty: number, auditQty: number, diff: number }[] = [];
        
        const allItems = new Map<string, Consumable>();
        consumables.forEach(c => allItems.set(c.id, c));
        Object.values(auditSession).forEach(({ item }) => allItems.set(item.id, item));

        allItems.forEach(item => {
            const auditQty = auditSession[item.id]?.count || 0;
            const systemQty = consumables.find(c => c.id === item.id)?.quantity || 0;
            const diff = auditQty - systemQty;
            if (diff !== 0) {
                report.push({
                    item: item,
                    systemQty: systemQty,
                    auditQty: auditQty,
                    diff: diff
                });
            }
        });

        return report;
    }, [isFinished, auditSession, consumables]);
    
    const handleReconcile = () => {
        const updates = discrepancyReport.map(report => ({
            consumableId: report.item.id,
            newQuantity: report.auditQty
        }));
        onAuditComplete(updates);
        setIsFinished(false);
        setAuditSession({});
        setLastScanned(null);
    };

    if (isFinished) {
        return (
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Audit Discrepancy Report</h3>
                {discrepancyReport.length > 0 ? (
                    <>
                        <Table
                            columns={[
                                { header: 'Item', accessor: (row: any) => row.item.name },
                                { header: 'System Qty', accessor: (row: any) => row.systemQty },
                                { header: 'Counted Qty', accessor: (row: any) => row.auditQty },
                                { header: 'Discrepancy', accessor: (row: any) => <span className={row.diff > 0 ? 'text-green-400' : 'text-red-400'}>{row.diff > 0 ? `+${row.diff}` : row.diff}</span> }
                            ]}
                            data={discrepancyReport}
                        />
                        <div className="flex justify-end space-x-2">
                             <Button variant="ghost" onClick={() => { setIsFinished(false); setAuditSession({}); setLastScanned(null); }}>Start New Audit</Button>
                             <Button onClick={handleReconcile}>Reconcile Counts</Button>
                        </div>
                    </>
                ) : (
                     <div className="text-center p-8">
                         <p className="text-green-400 font-bold text-lg">No discrepancies found!</p>
                         <p className="text-dark-text-secondary">All counts match the system records.</p>
                          <Button variant="ghost" onClick={() => { setIsFinished(false); setAuditSession({}); setLastScanned(null); }} className="mt-4">Start New Audit</Button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
                <Card title="Scanner Input">
                    <p className="text-sm text-dark-text-secondary mb-2">Click the input below. A USB barcode scanner should be plug-and-play and will enter data as if typed.</p>
                     <input
                        ref={scannerInputRef}
                        type="text"
                        placeholder="Waiting for scan..."
                        onKeyDown={handleScan}
                        className="w-full bg-dark-bg border-2 border-brand-primary rounded-md py-2 px-3 text-dark-text text-lg focus:ring-2 focus:ring-brand-secondary"
                     />
                </Card>
                 <Card title="Last Scanned Item">
                    {lastScanned ? (
                         <div>
                            <p className="text-lg font-bold text-dark-text">{lastScanned.name}</p>
                            <p className="text-dark-text-secondary">{lastScanned.category}</p>
                            <p className="font-mono text-xs text-dark-text-secondary mt-2">{lastScanned.id}</p>
                        </div>
                    ) : (
                        <p className="text-dark-text-secondary text-center">No item scanned yet.</p>
                    )}
                 </Card>
                 <Button onClick={() => setIsFinished(true)} disabled={Object.keys(auditSession).length === 0} className="w-full" size="lg">
                    Finish & View Report
                 </Button>
            </div>
            <div className="md:col-span-2">
                <Card title={`Audited Items (${Object.keys(auditSession).length})`}>
                     <div className="max-h-[60vh] overflow-y-auto">
                        <Table
                            columns={[
                                { header: 'Item', accessor: (row: any) => row.item.name },
                                { header: 'Count', accessor: (row: any) => row.count }
                            ]}
                            data={Object.values(auditSession).sort((a,b) => b.count - a.count)}
                         />
                     </div>
                </Card>
            </div>
        </div>
    )
};


// --- Main Inventory Component ---
const Inventory: React.FC = () => {
    const [consumables, setConsumables] = useState<Consumable[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<InventoryView>('dashboard');
    const [filters, setFilters] = useState({ searchTerm: '', category: 'All', status: 'All' });
    const { user } = useInternalAuth();
    const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [adjustData, setAdjustData] = useState({ consumableId: '', change: 0, reason: '' });


    const fetchData = () => {
        setIsLoading(true);
        api.getConsumables().then(data => {
            setConsumables(data);
            if (data.length > 0) {
                setAdjustData(prev => ({ ...prev, consumableId: data[0].id }))
            }
        }).finally(() => setIsLoading(false));
    };

    useEffect(fetchData, []);
    
    const handleNavigation = (targetView: InventoryView, newFilters = {}) => {
        setFilters({ searchTerm: '', category: 'All', status: 'All', ...newFilters });
        setView(targetView);
    };

    const handleAdjustStock = async () => {
        if(!adjustData.consumableId || !adjustData.reason || adjustData.change === 0) {
            alert('An item, reason, and non-zero quantity change are required.');
            return;
        }
        await api.logConsumableUsage(adjustData.consumableId, adjustData.change, adjustData.reason, user.id);
        fetchData();
        setIsAdjustModalOpen(false);
        setAdjustData({ consumableId: consumables[0]?.id || '', change: 0, reason: '' });
    };

    const handleAuditComplete = async (updates: { consumableId: string, newQuantity: number }[]) => {
        if(!user) return;
        
        const currentQuantities = new Map(consumables.map(c => [c.id, c.quantity]));
        
        const updatesWithChange = updates.map(update => ({
            ...update,
            change: update.newQuantity - (currentQuantities.get(update.consumableId) || 0)
        })).filter(u => u.change !== 0);

        if(updatesWithChange.length === 0) {
            alert("No changes to apply.");
            return;
        }

        setIsLoading(true);
        try {
            for(const update of updatesWithChange) {
                await api.logConsumableUsage(update.consumableId, update.change, `Audit reconciliation on ${new Date().toLocaleDateString()}`, user.id);
            }
            alert('Inventory counts have been reconciled successfully.');
            fetchData();
        } catch (e) {
            alert('An error occurred during reconciliation.');
        } finally {
            setIsLoading(false);
        }
    };


    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <InventoryDashboard consumables={consumables} onNavigate={handleNavigation} />;
            case 'list':
                return <InventoryList consumables={consumables} onUpdate={fetchData} user={user} filters={filters} setFilters={setFilters} />;
            case 'audit':
                return <InventoryAuditView consumables={consumables} onAuditComplete={handleAuditComplete} />;
            default:
                return null;
        }
    };
    
    const reorderItems = consumables.filter(c => c.quantity <= c.reorderLevel);

    if (isLoading || !user) return <div className="text-center p-8 text-dark-text-secondary">Loading consumables...</div>;

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                 <h1 className="text-2xl font-bold">Inventory Management</h1>
                 <div className="flex space-x-2">
                     <div className="hidden md:flex items-center space-x-2 border-r border-dark-border pr-2 mr-2">
                        <Button variant="secondary" size="sm" onClick={() => setIsAdjustModalOpen(true)}>Log Usage</Button>
                        <Button variant="secondary" size="sm" onClick={() => setIsReorderModalOpen(true)}>Reorder Report</Button>
                     </div>
                    <Button variant={view === 'dashboard' ? 'primary' : 'ghost'} onClick={() => setView('dashboard')} icon={<LayoutDashboardIcon className="h-4 w-4" />}/>
                    <Button variant={view === 'list' ? 'primary' : 'ghost'} onClick={() => setView('list')} icon={<ListChecksIcon className="h-4 w-4" />}/>
                    <Button variant={view === 'audit' ? 'primary' : 'ghost'} onClick={() => setView('audit')} icon={<BarcodeIcon className="h-4 w-4" />}/>
                 </div>
            </div>
            {renderView()}

            {/* Modals */}
             <Modal title="Log Consumable Usage / Stock Change" isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)}>
                <div className="space-y-4">
                    <p className="text-sm text-dark-text-secondary">Use a negative number for usage and a positive number for restocking.</p>
                     <select value={adjustData.consumableId} onChange={e => setAdjustData({...adjustData, consumableId: e.target.value})} className="w-full bg-dark-bg border-dark-border rounded p-2">
                        {consumables.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="number" placeholder="Quantity Change (e.g., -5 or +50)" value={adjustData.change || ''} onChange={e => setAdjustData({...adjustData, change: Number(e.target.value)})} className="w-full bg-dark-bg border-dark-border rounded p-2"/>
                    <input type="text" placeholder="Reason for change" value={adjustData.reason} onChange={e => setAdjustData({...adjustData, reason: e.target.value})} className="w-full bg-dark-bg border-dark-border rounded p-2"/>
                    <div className="flex justify-end space-x-2"><Button variant="ghost" onClick={() => setIsAdjustModalOpen(false)}>Cancel</Button><Button onClick={handleAdjustStock}>Log Change</Button></div>
                </div>
            </Modal>
            
            <Modal title="Reorder Report" isOpen={isReorderModalOpen} onClose={() => setIsReorderModalOpen(false)}>
                <div className="printable-content">
                    <h3 className="text-xl font-bold text-dark-text mb-4">Items to Reorder</h3>
                    <table className="w-full text-left">
                        <thead className="border-b-2 border-dark-border"><tr className="text-dark-text-secondary"><th>Item</th><th>Current Qty</th><th>Reorder At</th><th>Suggested Order</th></tr></thead>
                        <tbody className="divide-y divide-dark-border">
                            {reorderItems.map(item => (
                                <tr key={item.id} className="text-dark-text">
                                    <td className="py-2">{item.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.reorderLevel}</td>
                                    <td>{Math.max(1, (item.reorderLevel * 2) - item.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end mt-4"><Button onClick={() => window.print()}>Print</Button></div>
            </Modal>
        </div>
    );
};

export default Inventory;
