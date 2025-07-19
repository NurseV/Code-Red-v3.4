
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import * as api from '../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUpIcon, PieChartIcon, BanknoteIcon } from '../components/icons/Icons';

const COLORS = ['#16A34A', '#DC2626', '#F97316']; // Green, Red, Orange

const Analytics: React.FC = () => {
    const [data, setData] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getAnalyticsData().then(setData).finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return <div className="text-center p-8 text-dark-text-secondary">Loading analytics data...</div>;
    }

    if (!data) {
        return <div className="text-center p-8 text-red-500">Failed to load analytics data.</div>;
    }
    
    return (
        <div className="space-y-6">
            <Card title="Incidents by Month" actions={<TrendingUpIcon className="h-6 w-6 text-brand-secondary" />}>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.incidentsByMonth}>
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                        <Legend />
                        <Bar dataKey="count" fill="#DC2626" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card title="Training Compliance" actions={<PieChartIcon className="h-6 w-6 text-brand-secondary" />}>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data.trainingCompliance}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {data.trainingCompliance.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                             <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}/>
                             <Legend />
                        </PieChart>
                     </ResponsiveContainer>
                </Card>
                <Card title="Budget Overview" actions={<BanknoteIcon className="h-6 w-6 text-brand-secondary" />}>
                     <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.budgetPerformance}>
                             <XAxis dataKey="name" stroke="#9CA3AF" />
                             <YAxis stroke="#9CA3AF" />
                             <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}/>
                             <Legend />
                             <Line type="monotone" dataKey="budgeted" stroke="#8884d8" />
                             <Line type="monotone" dataKey="spent" stroke="#82ca9d" />
                        </LineChart>
                     </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
