
import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import * as api from '../services/api';
import { Budget, LineItem, Transaction } from '../types';
import { PlusIcon, EditIcon, Trash2Icon, TrendingUpIcon, TrendingDownIcon, PieChartIcon, BarChartIcon } from '../components/icons/Icons';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

const StatCard: React.FC<{ title: string; value: string | number; percentage?: number; comparison?: number; trend?: 'good' | 'bad'; }> = ({ title, value, percentage, comparison, trend }) => {
    const comparisonText = comparison ? `vs ${currencyFormatter.format(comparison)} last year` : null;
    let TrendIcon = null;
    if (trend === 'good') TrendIcon = TrendingUpIcon;
    if (trend === 'bad') TrendIcon = TrendingDownIcon;

    const displayValue = typeof value === 'number' ? currencyFormatter.format(value) : value;

    return (
        <div className="bg-dark-bg p-4 rounded-lg border border-dark-border/50">
            <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-dark-text-secondary">{title}</p>
                {TrendIcon && <TrendIcon className={`h-5 w-5 ${trend === 'good' ? 'text-green-400' : 'text-red-400'}`} />}
            </div>
            <p className="text-3xl font-bold text-dark-text mt-1">{displayValue}</p>
            <div className="flex justify-between items-baseline mt-1 text-sm">
                {percentage !== undefined && <p className="text-dark-text">{percentage.toFixed(1)}% of Budget</p>}
                {comparisonText && <p className="text-dark-text-secondary text-xs">{comparisonText}</p>}
            </div>
        </div>
    );
};

const EnhancedBudgetBar: React.FC<{ budget: number, spent: number, yearProgress: number }> = ({ budget, spent, yearProgress }) => {
    const spentPercentage = budget > 0 ? (spent / budget) * 100 : 0;
    return (
        <div className="w-full bg-dark-bg h-4 rounded-full border border-dark-border/50 relative">
            <div className="bg-green-500 h-full rounded-full" style={{ width: `${Math.min(spentPercentage, 100)}%` }}></div>
            <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-dark-card" style={{ left: `${yearProgress}%` }} title={`Fiscal Year Progress: ${yearProgress.toFixed(0)}%`}></div>
        </div>
    );
};

const ExpandedRowContent: React.FC<{ lineItemId: string }> = ({ lineItemId }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getTransactionsForLineItem(lineItemId).then(data => {
            setTransactions(data);
            setIsLoading(false);
        });
    }, [lineItemId]);

    if (isLoading) return <div className="p-4 text-center bg-dark-bg text-dark-text-secondary">Loading transactions...</div>;
    if (!transactions.length) return <div className="p-4 text-center bg-dark-bg text-dark-text-secondary">No transactions recorded for this line item.</div>;

    return (
        <div className="p-4 bg-dark-bg">
             <table className="w-full text-left text-sm">
                <thead className="text-xs text-dark-text-secondary uppercase">
                    <tr><th className="py-1">Date</th><th className="py-1">Vendor</th><th className="py-1 text-right">Amount</th></tr>
                </thead>
                <tbody className="divide-y divide-dark-border/50">
                    {transactions.map(t => (
                        <tr key={t.id}>
                            <td className="py-2">{new Date(t.date).toLocaleDateString()}</td>
                            <td className="py-2">{t.vendor}</td>
                            <td className="py-2 text-right">{currencyFormatter.format(t.amount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const Budgeting: React.FC = () => {
    const [budget, setBudget] = useState<Budget | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<'overview' | 'historical'>('overview');
    const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<LineItem> | null>(null);

    const fetchBudget = () => {
        setIsLoading(true);
        api.getBudgetData().then(setBudget).finally(() => setIsLoading(false));
    };

    useEffect(() => { fetchBudget(); }, []);

    const { fiscalYearProgress, pacingStatus, projectedSpending } = useMemo(() => {
        if (!budget) return { fiscalYearProgress: 0, pacingStatus: 'N/A', projectedSpending: 0 };
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const fiscalYearProgress = ((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24) / 365) * 100;
        const budgetSpentProgress = (budget.totalSpent / budget.totalBudget) * 100;

        const projectedSpending = (budget.totalSpent / fiscalYearProgress) * 100;

        let pacingStatus = 'On Track';
        if (budgetSpentProgress > fiscalYearProgress + 5) pacingStatus = 'Over Pace';
        if (budgetSpentProgress < fiscalYearProgress - 5) pacingStatus = 'Under Pace';
        
        return { fiscalYearProgress, pacingStatus, projectedSpending };
    }, [budget]);

    const handlePieClick = (data: any) => {
        if (data && data.name) {
            setActiveCategoryFilter(prev => prev === data.name ? null : data.name);
        }
    };
    
    const handleOpenModal = (item: Partial<LineItem> | null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSaveItem = async (e: React.FormEvent, formData: any) => {
        e.preventDefault();
        const itemData = {
            category: formData.category,
            budgetedAmount: parseFloat(formData.budgetedAmount) || 0,
        };
        try {
            if (editingItem && editingItem.id) {
                await api.updateLineItem(editingItem.id, itemData);
            } else {
                await api.addLineItemToBudget(itemData);
            }
            setIsModalOpen(false);
            fetchBudget();
        } catch (error) {
            alert(`Failed to ${editingItem ? 'update' : 'add'} line item.`);
        }
    };
    
    const handleDeleteItem = async (itemId: string) => {
        if (window.confirm("Are you sure you want to delete this line item?")) {
            await api.deleteLineItem(itemId);
            fetchBudget();
        }
    };

    const getVarianceColor = (variance: number) => {
        if (variance >= 0) return 'text-green-400';
        return 'text-red-400';
    };

    const filteredLineItems = useMemo(() => {
        if (!budget) return [];
        if (!activeCategoryFilter) return budget.lineItems;
        return budget.lineItems.filter(item => item.category === activeCategoryFilter);
    }, [budget, activeCategoryFilter]);

    const columns = [
        { header: 'Category', accessor: (item: LineItem) => item.category, className: "w-1/4" },
        { header: '% of Budget', className: "w-1/4", accessor: (item: LineItem) => {
            const percentage = item.budgetedAmount > 0 ? (item.actualAmount / item.budgetedAmount) * 100 : 0;
            return (
                <div className="flex items-center">
                    <div className="w-full bg-dark-bg rounded-full h-2.5 border border-dark-border/50 mr-2">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <span className="text-xs w-12 text-right">{percentage.toFixed(0)}%</span>
                </div>
            );
        }},
        { header: 'Budgeted', accessor: (item: LineItem) => currencyFormatter.format(item.budgetedAmount) },
        { header: 'Spent', accessor: (item: LineItem) => currencyFormatter.format(item.actualAmount) },
        { header: 'Variance', accessor: (item: LineItem) => {
                const variance = item.budgetedAmount - item.actualAmount;
                return <span className={getVarianceColor(variance)}>{currencyFormatter.format(variance)}</span>;
        }},
        { header: 'Last Expense', accessor: (item: LineItem) => item.lastExpenseDate ? new Date(item.lastExpenseDate).toLocaleDateString() : 'N/A' },
        { header: 'Actions', accessor: (item: LineItem) => (
            <div className="flex space-x-2 justify-end">
                <Button onClick={() => handleOpenModal(item)} variant="ghost" className="p-1 h-7 w-7"><EditIcon className="h-4 w-4" /></Button>
                <Button onClick={() => handleDeleteItem(item.id)} variant="ghost" className="p-1 h-7 w-7"><Trash2Icon className="h-4 w-4 text-red-500" /></Button>
            </div>
        )}
    ];

    if (isLoading || !budget) {
        return <div className="text-center p-8 text-dark-text-secondary">Loading budget data...</div>
    }

    const historicalData = budget.lineItems.map(item => ({
        name: item.category,
        'This Year': item.actualAmount,
        'Last Year': item.lastYearAmount
    }));

    return (
        <>
            <div className="space-y-6">
                <Card title={`Fiscal Year ${budget.fiscalYear} Budget Overview`}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                        <StatCard title="Total Budget" value={budget.totalBudget} comparison={budget.lastYearTotalBudget} trend={budget.totalBudget > (budget.lastYearTotalBudget ?? 0) ? 'bad' : 'good'} />
                        <StatCard title="Total Spent" value={budget.totalSpent} percentage={(budget.totalSpent / budget.totalBudget) * 100} comparison={budget.lastYearTotalSpent} trend={budget.totalSpent > (budget.lastYearTotalSpent ?? 0) ? 'bad' : 'good'} />
                        <StatCard title="Remaining" value={budget.totalBudget - budget.totalSpent} />
                        <StatCard title="Pacing" value={pacingStatus} />
                        <StatCard title="Projected" value={projectedSpending} />
                    </div>
                    <EnhancedBudgetBar budget={budget.totalBudget} spent={budget.totalSpent} yearProgress={fiscalYearProgress} />
                </Card>

                <Card title="Monthly Spending Trend">
                     <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={budget.monthlySpending} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                            <XAxis dataKey="month" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" tickFormatter={val => currencyFormatter.format(val).replace('$', '') + 'k'} />
                            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} formatter={(value) => currencyFormatter.format(value as number)} />
                            <Line type="monotone" dataKey="spent" stroke="#EF4444" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
                
                <Card 
                    title={view === 'overview' ? "Budget Line Items" : "Historical Comparison"}
                    actions={<Button onClick={() => setView(v => v === 'overview' ? 'historical' : 'overview')} variant="secondary" icon={<BarChartIcon className="h-4 w-4 mr-2" />}>{view === 'overview' ? 'Compare Historical' : 'View Current Budget'}</Button>}
                >
                    {view === 'overview' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <Table columns={columns} data={filteredLineItems} onRowClick={(item) => setExpandedRowId(prev => prev === item.id ? null : item.id)} expandedRowId={expandedRowId} renderExpandedRow={(item) => <ExpandedRowContent lineItemId={item.id} />} />
                                <div className="mt-4"><Button onClick={() => handleOpenModal(null)} icon={<PlusIcon className="h-4 w-4 mr-2"/>}>Add Line Item</Button></div>
                            </div>
                             <div className="flex flex-col items-center justify-center">
                                <h4 className="font-semibold mb-2">Spending Breakdown</h4>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={budget.lineItems} dataKey="actualAmount" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} onClick={(e) => handlePieClick(e)}>
                                            {budget.lineItems.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="cursor-pointer outline-none" />)}
                                        </Pie>
                                        <Tooltip formatter={(value) => currencyFormatter.format(value as number)} contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                                        <Legend onClick={handlePieClick} wrapperStyle={{fontSize: "12px", cursor: "pointer"}}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ) : (
                         <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={historicalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${value/1000}k`} />
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} formatter={(value) => currencyFormatter.format(value as number)} />
                                <Legend />
                                <Bar dataKey="Last Year" fill="#8884d8" />
                                <Bar dataKey="This Year" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Card>
            </div>

            <LineItemModal isOpen={isModalOpen} item={editingItem} onClose={() => setIsModalOpen(false)} onSave={handleSaveItem} />
        </>
    );
};

const LineItemModal: React.FC<{isOpen: boolean, onClose: () => void, item: Partial<LineItem> | null, onSave: (e: React.FormEvent, data: any) => void}> = ({isOpen, onClose, item, onSave}) => {
    const [modalData, setModalData] = useState({ category: '', budgetedAmount: '' });
    
    useEffect(() => {
        if (item) {
            setModalData({ category: item.category || '', budgetedAmount: String(item.budgetedAmount || '') });
        } else {
            setModalData({ category: '', budgetedAmount: '' });
        }
    }, [item]);
    
    if (!isOpen) return null;
    
    return (
        <Modal title={item ? "Edit Line Item" : "Add New Line Item"} isOpen={isOpen} onClose={onClose}>
            <form onSubmit={(e) => onSave(e, modalData)} className="space-y-4">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-dark-text-secondary mb-1">Category Name</label>
                    <input id="category" type="text" value={modalData.category} onChange={(e) => setModalData({...modalData, category: e.target.value})} required className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text" />
                </div>
                <div>
                    <label htmlFor="budgetedAmount" className="block text-sm font-medium text-dark-text-secondary mb-1">Budgeted Amount</label>
                    <input id="budgetedAmount" type="number" value={modalData.budgetedAmount} onChange={(e) => setModalData({...modalData, budgetedAmount: e.target.value})} required className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text" placeholder="e.g., 50000" />
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Item</Button>
                </div>
            </form>
        </Modal>
    )
}

export default Budgeting;
