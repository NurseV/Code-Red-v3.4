
import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../services/api';
import Card from '../components/ui/Card';
import { DollarSignIcon, TrendingUpIcon, AlertTriangleIcon, ClockIcon } from '../components/icons/Icons';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-dark-card border border-dark-border/50 rounded-lg p-5 shadow-lg">
        <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
            <div>
                <p className="text-sm font-medium text-dark-text-secondary">{title}</p>
                <p className="text-3xl font-bold text-dark-text">{value}</p>
            </div>
        </div>
    </div>
);

const COLORS = {
    Paid: '#10B981',
    Sent: '#3B82F6',
    Overdue: '#EF4444',
    Draft: '#6B7280',
    Void: '#374151'
};

const FinancialsDashboard: React.FC = () => {
    const [stats, setStats] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getFinancialsDashboardStats().then(setStats).finally(() => setIsLoading(false));
    }, []);

    const invoiceStatusData = useMemo(() => {
        if (!stats) return [];
        return Object.entries(stats.invoiceStatusCounts).map(([name, value]) => ({ name, value }));
    }, [stats]);

    if (isLoading) {
        return <div className="text-center p-8 text-dark-text-secondary">Loading financial dashboard...</div>;
    }
    
    if (!stats) {
        return <div className="text-center p-8 text-red-500">Failed to load financial data.</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Outstanding" value={currencyFormatter.format(stats.totalOutstanding)} icon={<DollarSignIcon className="h-6 w-6 text-white"/>} color="bg-yellow-600" />
                <StatCard title="Amount Overdue" value={currencyFormatter.format(stats.totalOverdue)} icon={<AlertTriangleIcon className="h-6 w-6 text-white"/>} color="bg-red-600" />
                <StatCard title="Collected (YTD)" value={currencyFormatter.format(stats.collectedYTD)} icon={<TrendingUpIcon className="h-6 w-6 text-white"/>} color="bg-green-600" />
                <StatCard title="Pending Incidents" value={stats.pendingIncidents} icon={<ClockIcon className="h-6 w-6 text-white"/>} color="bg-blue-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                 <div className="lg:col-span-3">
                     <Card title="Monthly Revenue">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/>
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${value/1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                                    formatter={(value: number) => currencyFormatter.format(value)}
                                    cursor={{ fill: 'rgba(147, 197, 253, 0.1)' }}
                                />
                                <Bar dataKey="amount" name="Revenue" fill="#10B981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card title="Invoice Status Breakdown">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={invoiceStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {invoiceStatusData.map((entry) => <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} formatter={(value: number) => `${value} invoice(s)`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default FinancialsDashboard;
