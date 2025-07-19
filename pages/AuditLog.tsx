
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import * as api from '../services/api';
import { AuditLogEntry, Personnel } from '../types';

const AuditLog: React.FC = () => {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({ userId: 'all', date: '' });

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            api.getAuditLogs(filters),
            api.getPersonnelList()
        ]).then(([logData, personnelData]) => {
            setLogs(logData);
            setPersonnel(personnelData);
        }).finally(() => setIsLoading(false));
    }, [filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const columns = [
        { header: 'Timestamp', accessor: (item: AuditLogEntry) => new Date(item.timestamp).toLocaleString() },
        { header: 'User', accessor: (item: AuditLogEntry) => item.userName },
        { header: 'Action', accessor: (item: AuditLogEntry) => item.action },
        { header: 'Target Area', accessor: (item: AuditLogEntry) => item.target },
        { header: 'Target ID', accessor: (item: AuditLogEntry) => item.targetId },
        { header: 'Details', accessor: (item: AuditLogEntry) => item.details ? JSON.stringify(item.details) : 'N/A' },
    ];

    return (
        <Card title="System Audit Log">
            <div className="p-4 bg-dark-card mb-4 rounded-lg flex items-center space-x-4">
                <div className="flex-grow">
                    <label htmlFor="userId" className="text-sm font-medium text-dark-text-secondary mr-2">Filter by User:</label>
                    <select
                        name="userId"
                        id="userId"
                        onChange={handleFilterChange}
                        value={filters.userId}
                        className="bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text sm:text-sm"
                    >
                        <option value="all">All Users</option>
                        {personnel.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                 <div className="flex-grow">
                    <label htmlFor="date" className="text-sm font-medium text-dark-text-secondary mr-2">Filter by Date:</label>
                     <input
                        type="date"
                        name="date"
                        id="date"
                        value={filters.date}
                        onChange={handleFilterChange}
                        className="bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text sm:text-sm"
                    />
                </div>
            </div>
            {isLoading ? (
                <div className="text-center p-8 text-dark-text-secondary">Loading audit logs...</div>
            ) : (
                <Table columns={columns} data={logs} />
            )}
        </Card>
    );
};

export default AuditLog;
