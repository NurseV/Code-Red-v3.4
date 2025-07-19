
import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as api from '../services/api';
import { Incident, Invoice } from '../types';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import { SearchIcon, PlusIcon, MoreVerticalIcon, EyeIcon, PrinterIcon, Trash2Icon, CheckCircle2Icon, MailIcon } from '../components/icons/Icons';

type InvoiceStatus = Invoice['status'] | 'All';

const statusColors: Record<Invoice['status'], string> = {
    'Draft': 'bg-gray-500/20 text-gray-400',
    'Sent': 'bg-blue-500/20 text-blue-300',
    'Paid': 'bg-green-500/20 text-green-300',
    'Overdue': 'bg-red-500/20 text-red-300',
    'Void': 'bg-zinc-700/50 text-zinc-500 line-through',
};

const Invoicing: React.FC = () => {
    const [billableIncidents, setBillableIncidents] = useState<Incident[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [billableSearch, setBillableSearch] = useState('');
    const [invoiceSearch, setInvoiceSearch] = useState('');
    const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<InvoiceStatus>('All');
    
    const [selectedBillable, setSelectedBillable] = useState<string[]>([]);
    const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
    
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);

    const fetchData = () => {
        setIsLoading(true);
        Promise.all([
            api.getBillableIncidents(),
            api.getInvoices()
        ]).then(([incidents, invs]) => {
            setBillableIncidents(incidents);
            setInvoices(invs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }).finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchData();
        const handleClickOutside = (event: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setActionMenuOpen(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredBillable = useMemo(() => billableSearch ? billableIncidents.filter(i => i.incidentNumber.includes(billableSearch) || i.address.toLowerCase().includes(billableSearch.toLowerCase())) : billableIncidents, [billableIncidents, billableSearch]);
    const filteredInvoices = useMemo(() => invoices.filter(i => {
        const term = invoiceSearch.toLowerCase();
        const termMatch = invoiceSearch ? (i.id.includes(term) || i.incidentNumber.includes(term) || i.propertyAddress.toLowerCase().includes(term)) : true;
        const statusMatch = invoiceStatusFilter === 'All' || i.status === invoiceStatusFilter;
        return termMatch && statusMatch;
    }), [invoices, invoiceSearch, invoiceStatusFilter]);

    const handleGenerateInvoices = async (incidentIds: string[]) => {
        if (!window.confirm(`Generate ${incidentIds.length} invoice(s)?`)) return;
        await api.generateMultipleInvoices(incidentIds);
        fetchData();
        setSelectedBillable([]);
    };
    
    const handleUpdateInvoiceStatus = async (invoiceIds: string[], status: 'Paid' | 'Sent' | 'Void') => {
        if (!window.confirm(`Update ${invoiceIds.length} invoice(s) to "${status}"?`)) return;
        await api.updateMultipleInvoiceStatus(invoiceIds, status);
        fetchData();
        setSelectedInvoices([]);
        setActionMenuOpen(null);
    }
    
    const billableColumns = [
        { header: "Incident #", accessor: (item: Incident) => item.incidentNumber, sortKey: 'incidentNumber' as const },
        { header: "Incident Date", accessor: (item: Incident) => new Date(item.date).toLocaleDateString() },
        { header: "Type", accessor: (item: Incident) => item.type },
        { header: "Address", accessor: (item: Incident) => item.address },
        { header: "Property Owner", accessor: (item: Incident) => item.ownerName || 'N/A' },
        { header: "Actions", accessor: (item: Incident) => <Button size="sm" onClick={() => handleGenerateInvoices([item.id])}>Generate</Button> }
    ];

    const invoiceColumns = [
        { header: "Invoice #", accessor: (item: Invoice) => item.id, sortKey: 'id' as const },
        { header: "Issue Date", accessor: (item: Invoice) => new Date(item.date).toLocaleDateString(), sortKey: 'date' as const },
        { header: "Due Date", accessor: (item: Invoice) => new Date(item.dueDate).toLocaleDateString(), sortKey: 'dueDate' as const },
        { header: "Address", accessor: (item: Invoice) => item.propertyAddress },
        { header: "Total", accessor: (item: Invoice) => `$${item.totalAmount.toFixed(2)}` },
        { header: "Status", accessor: (item: Invoice) => <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[item.status]}`}>{item.status}</span>, sortKey: 'status' as const },
        { header: "Actions", accessor: (item: Invoice) => (
            <div className="relative" onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="p-1 h-7" onClick={() => setActionMenuOpen(actionMenuOpen === item.id ? null : item.id)}>
                    <MoreVerticalIcon className="h-5 w-5" />
                </Button>
                {actionMenuOpen === item.id && (
                    <div ref={actionMenuRef} className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-md shadow-lg z-10">
                        <ul>
                            <li><button className="flex items-center w-full text-left px-4 py-2 text-sm text-dark-text-secondary hover:bg-dark-border"><EyeIcon className="h-4 w-4 mr-3" /> View</button></li>
                            <li><button className="flex items-center w-full text-left px-4 py-2 text-sm text-dark-text-secondary hover:bg-dark-border"><PrinterIcon className="h-4 w-4 mr-3" /> Print</button></li>
                            {item.status !== 'Paid' && <li><button onClick={() => handleUpdateInvoiceStatus([item.id], 'Sent')} className="flex items-center w-full text-left px-4 py-2 text-sm text-dark-text-secondary hover:bg-dark-border"><MailIcon className="h-4 w-4 mr-3" /> Send/Resend</button></li>}
                            {item.status !== 'Paid' && <li><button onClick={() => handleUpdateInvoiceStatus([item.id], 'Paid')} className="flex items-center w-full text-left px-4 py-2 text-sm text-dark-text-secondary hover:bg-dark-border"><CheckCircle2Icon className="h-4 w-4 mr-3" /> Mark as Paid</button></li>}
                             {item.status !== 'Void' && <div className="border-t border-dark-border my-1"></div>}
                            {item.status !== 'Void' && <li><button onClick={() => handleUpdateInvoiceStatus([item.id], 'Void')} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-dark-border"><Trash2Icon className="h-4 w-4 mr-3" /> Void</button></li>}
                        </ul>
                    </div>
                )}
            </div>
        )}
    ];

    if (isLoading) return <div className="text-center p-8 text-dark-text-secondary">Loading invoicing data...</div>;

    return (
        <div className="space-y-8 p-6">
            <div>
                <h3 className="text-xl font-semibold text-dark-text mb-2">Billable Incidents (Pending Invoice)</h3>
                <div className="p-4 bg-dark-bg rounded-lg border border-dark-border">
                    <div className="flex justify-between items-center mb-4">
                        <div className="relative flex-grow max-w-sm">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                            <input type="text" placeholder="Search incidents..." value={billableSearch} onChange={e => setBillableSearch(e.target.value)} className="w-full bg-dark-card border border-dark-border rounded-md py-2 pl-10 pr-4 text-dark-text" />
                        </div>
                        {selectedBillable.length > 0 && <Button onClick={() => handleGenerateInvoices(selectedBillable)}>Generate {selectedBillable.length} Invoice(s)</Button>}
                    </div>
                    <Table columns={billableColumns} data={filteredBillable} isSelectable={true} selectedIds={selectedBillable} onSelectionChange={(ids) => setSelectedBillable(ids as string[])} itemClassName={() => 'text-sm'}/>
                    {filteredBillable.length === 0 && <p className="text-center p-4 text-dark-text-secondary">No incidents are currently flagged for billing.</p>}
                </div>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-dark-text mb-2">Generated Invoices</h3>
                <div className="p-4 bg-dark-bg rounded-lg border border-dark-border">
                     <div className="flex justify-between items-center mb-4">
                         <div className="flex items-center space-x-4">
                            <div className="relative flex-grow max-w-sm">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                                <input type="text" placeholder="Search invoices..." value={invoiceSearch} onChange={e => setInvoiceSearch(e.target.value)} className="w-full bg-dark-card border border-dark-border rounded-md py-2 pl-10 pr-4 text-dark-text" />
                            </div>
                             <select value={invoiceStatusFilter} onChange={e => setInvoiceStatusFilter(e.target.value as InvoiceStatus)} className="bg-dark-card border-dark-border rounded-md py-2 px-3 text-dark-text">
                                <option value="All">All Statuses</option>
                                <option value="Draft">Draft</option><option value="Sent">Sent</option><option value="Paid">Paid</option><option value="Overdue">Overdue</option><option value="Void">Void</option>
                            </select>
                         </div>
                        {selectedInvoices.length > 0 && <Button onClick={() => handleUpdateInvoiceStatus(selectedInvoices, 'Sent')}>Send {selectedInvoices.length} Invoice(s)</Button>}
                    </div>
                    <Table columns={invoiceColumns} data={filteredInvoices} isSelectable={true} selectedIds={selectedInvoices} onSelectionChange={(ids) => setSelectedInvoices(ids as string[])} itemClassName={(item: Invoice) => item.status === 'Overdue' ? 'bg-red-900/20' : ''}/>
                    {filteredInvoices.length === 0 && <p className="text-center p-4 text-dark-text-secondary">No invoices match the current filters.</p>}
                </div>
            </div>
        </div>
    );
};

export default Invoicing;
