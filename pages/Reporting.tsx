

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Tabs from '../components/ui/Tabs';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
import * as api from '../services/api';
import { DATA_SOURCE_FIELDS } from '../constants';
import { CustomReport, CustomReportConfig, DataSource, ReportFilter, FilterCondition, PrebuiltReport, AlertRule } from '../types';
import { FileSpreadsheetIcon, PieChartIcon, PlusIcon, XIcon, TrendingUpIcon, BanknoteIcon, PrinterIcon, BarChartIcon, DownloadIcon, SaveIcon, LayoutGridIcon, BellPlusIcon } from '../components/icons/Icons';
import { ResponsiveContainer, Bar, XAxis, YAxis, Tooltip, Legend, Pie, Cell, Line, ComposedChart, LineChart, PieChart } from 'recharts';

const COLORS = ['#16A34A', '#EF4444', '#F97316', '#3B82F6', '#8B5CF6'];

// --- Utility Functions ---
const exportToCsv = (filename: string, data: any[], headers: string[]) => {
    const processRow = (row) => {
        return headers.map(header => {
            const value = row[header] ?? '';
            const stringValue = String(value).replace(/"/g, '""');
            return `"${stringValue}"`;
        }).join(',');
    };
    const csvContent = [
        headers.join(','),
        ...data.map(row => processRow(row))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

const CustomTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
        return (
            <div className="bg-dark-bg p-2 border border-dark-border rounded-md shadow-lg">
                <p className="label font-bold">{`${label}`}</p>
                {payload.map((pld: any, index: number) => (
                     <p key={index} style={{ color: pld.color }}>{`${pld.name}: ${pld.value}`}</p>
                ))}
            </div>
        );
    }
    return null;
};

// --- Chart Components ---
const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
     <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
        <p className="text-sm font-medium text-dark-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-dark-text">{value}</p>
    </div>
)

const ChartCard: React.FC<{ title: string; children: React.ReactNode; data: any[]; headers: string[]; className?: string; onAlertClick?: () => void; }> = ({ title, children, data, headers, className = '', onAlertClick }) => (
    <Card className={`flex flex-col ${className}`} title={
        <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-bold">{title}</h3>
            <div className="flex items-center space-x-2">
                 {onAlertClick && (
                    <Button variant="ghost" size="sm" className="p-1 text-yellow-400 hover:bg-yellow-400/10" onClick={onAlertClick}>
                        <BellPlusIcon className="h-4 w-4"/>
                    </Button>
                 )}
                 <Button variant="ghost" size="sm" className="p-1" onClick={() => exportToCsv(title.replace(/ /g, '_'), data, headers)}>
                    <DownloadIcon className="h-4 w-4"/>
                </Button>
            </div>
        </div>
    }>
        {children}
    </Card>
);

// --- Analytics View ---
const AnalyticsDashboardView: React.FC = () => {
    const navigate = ReactRouterDOM.useNavigate();
    const [data, setData] = useState<any | null>(null);
    const [customReports, setCustomReports] = useState<CustomReport[]>([]);
    const [prebuiltReports, setPrebuiltReports] = useState<PrebuiltReport[]>([]);
    const [allWidgets, setAllWidgets] = useState<(PrebuiltReport | CustomReport)[]>([]);
    const [widgetVisibility, setWidgetVisibility] = useState<Record<string, boolean>>({});
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertRule, setAlertRule] = useState<Partial<AlertRule>>({});
    const [isLoading, setIsLoading] = useState(true);
    
    const fetchData = useCallback(() => {
        setIsLoading(true);
        Promise.all([
            api.getAnalyticsData(),
            api.getCustomReports(),
            api.getPrebuiltReports(),
        ]).then(([analyticsData, custom, prebuilt]) => {
            setData(analyticsData);
            setCustomReports(custom);
            setPrebuiltReports(prebuilt);
            
            const all = [...prebuilt, ...custom];
            setAllWidgets(all);
            
            const initialVisibility = all.reduce((acc, widget) => {
                acc[widget.id] = true; // Default to visible
                return acc;
            }, {} as Record<string, boolean>);
            setWidgetVisibility(initialVisibility);
            
        }).finally(() => setIsLoading(false));
    }, []);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleIncidentDrilldown = (payload: any) => {
        if (!payload || !payload.activePayload) return;
        const { name } = payload.activePayload[0].payload;
        navigate(`/app/incidents?month=${name}&year=${new Date().getFullYear()}`);
    }
    
    const handleComplianceDrilldown = (payload: any) => {
         if (payload.name === 'Non-Compliant') {
            navigate('/app/personnel?filter=non-compliant');
        }
    }
    
    const handleOpenAlertModal = async () => {
        const rules = await api.getAlertRules();
        const rule = rules.find(r => r.metric === 'training_compliance') || { metric: 'training_compliance', condition: 'less_than', threshold: 85 };
        setAlertRule(rule);
        setIsAlertModalOpen(true);
    };

    const handleSaveAlert = async () => {
        await api.saveAlertRule(alertRule);
        setIsAlertModalOpen(false);
    };

    const handleDeleteCustomReport = async (reportId: string) => {
        if (window.confirm("Are you sure you want to delete this custom report widget?")) {
            await api.deleteCustomReport(reportId);
            fetchData();
        }
    };

    if (isLoading || !data) {
        return <div className="text-center p-8 text-dark-text-secondary">Loading analytics data...</div>;
    }
    
    const budgetRemaining = data.budgetOverview.totalBudget - data.budgetOverview.totalSpent;
    const budgetOver = budgetRemaining < 0;
    
    const StandardWidgets = {
        'incidents-by-month': {
            title: "Incidents by Month",
            component: <ChartCard title="Incidents by Month" data={data.incidentsByMonth} headers={['name', 'count']} className="xl:col-span-2">
                <ResponsiveContainer width="100%" height={300}><ComposedChart data={data.incidentsByMonth}><XAxis dataKey="name" stroke="#9CA3AF" /><YAxis stroke="#9CA3AF" /><Tooltip content={<CustomTooltip />} /><Legend /><Bar dataKey="count" fill="#DC2626" onClick={handleIncidentDrilldown} className="cursor-pointer" /></ComposedChart></ResponsiveContainer>
            </ChartCard>
        },
        'training-compliance': {
            title: "Training Compliance",
            component: <ChartCard title="Training Compliance" data={data.trainingCompliance} headers={['name', 'value']} onAlertClick={handleOpenAlertModal}>
                 <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={data.trainingCompliance} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{data.trainingCompliance.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className={entry.name === 'Non-Compliant' ? 'cursor-pointer' : ''} onClick={() => handleComplianceDrilldown(entry)} />))}</Pie><Tooltip content={<CustomTooltip />} /><Legend formatter={(value, entry: any) => `${value} (${(data.trainingComplianceAbs[value.toLowerCase()] / data.trainingComplianceAbs.total * 100).toFixed(0)}%) - ${data.trainingComplianceAbs[value.toLowerCase()]} staff`} /></PieChart></ResponsiveContainer>
            </ChartCard>
        },
        'budget-overview': {
             title: "Budget Overview",
             component: <ChartCard title="Budget Overview" data={data.budgetPerformance} headers={['name', 'budgeted', 'spent']} className={`transition-all ${budgetOver ? 'border-2 border-red-500 shadow-lg shadow-red-500/20' : ''}`}>
                 <ResponsiveContainer width="100%" height={300}><LineChart data={data.budgetPerformance}><XAxis dataKey="name" stroke="#9CA3AF" angle={-30} textAnchor="end" height={50} /><YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(value/1000)}k`}/><Tooltip content={<CustomTooltip />} /><Legend /><Line type="monotone" dataKey="budgeted" stroke="#8884d8" name="Budgeted" /><Line type="monotone" dataKey="spent" stroke="#82ca9d" name="Spent" /></LineChart></ResponsiveContainer>
            </ChartCard>
        }
    };
    
    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Analytics Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" onClick={() => setIsCustomizeModalOpen(true)} icon={<LayoutGridIcon className="h-4 w-4 mr-2" />}>Customize</Button>
                    <Button variant="secondary" onClick={() => window.print()} icon={<PrinterIcon className="h-4 w-4 mr-2" />}>Print / Export PDF</Button>
                </div>
            </div>
            <div className="reporting-dashboard-print-container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 no-print">
                    <StatCard title="Upcoming Inspections" value={data.assetOverview.inspectionsDue} />
                    <StatCard title="Assets Nearing EOL" value={data.assetOverview.nearingEol} />
                    <StatCard title="Total Budget" value={`$${data.budgetOverview.totalBudget.toLocaleString()}`} />
                    <StatCard title="Budget Remaining" value={budgetOver ? `-$${Math.abs(budgetRemaining).toLocaleString()}` : `$${budgetRemaining.toLocaleString()}`} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 reporting-dashboard-print-grid">
                    {Object.entries(StandardWidgets).map(([key, widget]) => (
                        widgetVisibility[key] ? <React.Fragment key={key}>{widget.component}</React.Fragment> : null
                    ))}
                    {customReports.map(report => (
                        widgetVisibility[report.id] ? <Card key={report.id} title={report.title} actions={<Button variant="ghost" size="sm" className="p-1" onClick={() => handleDeleteCustomReport(report.id)}><XIcon className="h-4 w-4 text-red-500" /></Button>}>
                            <p className="text-center p-8 text-dark-text-secondary">Custom report widget - data would be rendered here.</p>
                        </Card> : null
                    ))}
                </div>
            </div>
             <Modal title="Customize Dashboard" isOpen={isCustomizeModalOpen} onClose={() => setIsCustomizeModalOpen(false)}>
                <div className="space-y-2">
                    <h3 className="font-semibold text-dark-text">Standard Widgets</h3>
                    {Object.entries(StandardWidgets).map(([key, widget]) => (
                         <label key={key} className="flex items-center space-x-3 p-2 hover:bg-dark-border rounded-md"><input type="checkbox" checked={widgetVisibility[key] || false} onChange={() => setWidgetVisibility(prev => ({...prev, [key]: !prev[key]}))} className="h-4 w-4 rounded" /><span>{widget.title}</span></label>
                    ))}
                     <h3 className="font-semibold text-dark-text pt-4">Custom Reports</h3>
                     {customReports.map(report => (
                         <label key={report.id} className="flex items-center space-x-3 p-2 hover:bg-dark-border rounded-md"><input type="checkbox" checked={widgetVisibility[report.id] || false} onChange={() => setWidgetVisibility(prev => ({...prev, [report.id]: !prev[report.id]}))} className="h-4 w-4 rounded" /><span>{report.title}</span></label>
                     ))}
                </div>
            </Modal>
            <Modal title="Set Alert for Training Compliance" isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)}>
                <div className="space-y-4">
                    <p className="text-sm text-dark-text-secondary">Get a notification if the training compliance percentage falls below a certain threshold.</p>
                     <div className="flex items-center space-x-2">
                        <span className="text-dark-text">Alert if compliance is</span>
                         <select value={alertRule.condition} onChange={e => setAlertRule({...alertRule, condition: e.target.value as any})} className="bg-dark-bg border-dark-border rounded-md p-2">
                            <option value="less_than">less than</option>
                            <option value="greater_than">greater than</option>
                         </select>
                         <input type="number" value={alertRule.threshold || ''} onChange={e => setAlertRule({...alertRule, threshold: Number(e.target.value)})} className="w-20 bg-dark-bg border-dark-border rounded-md p-2" />
                        <span className="text-dark-text">%</span>
                    </div>
                    <div className="flex justify-end pt-4 space-x-2">
                        <Button variant="ghost" onClick={() => setIsAlertModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveAlert}>Save Alert Rule</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// --- Report Builder View ---
const ReportBuilderView: React.FC = () => {
    const [config, setConfig] = useState<CustomReportConfig>({ dataSource: 'incidents', fields: [], filters: [] });
    const [reportResult, setReportResult] = useState<{ data: any[], columns: any[] } | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [reportName, setReportName] = useState('');
    
    const handleDataSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setConfig({ dataSource: e.target.value as DataSource, fields: [], filters: [] });
        setReportResult(null);
    };

    const handleFieldToggle = (field: string) => {
        setConfig(prev => ({ ...prev, fields: prev.fields.includes(field) ? prev.fields.filter(f => f !== field) : [...prev.fields, field]}));
    };

    const handleAddFilter = () => {
        setConfig(prev => ({...prev, filters: [...prev.filters, { id: Date.now(), field: '', condition: 'is', value: '' }]}));
    };
    
    const handleFilterChange = (index: number, updatedFilter: ReportFilter) => {
        setConfig(prev => ({...prev, filters: prev.filters.map((f, i) => i === index ? updatedFilter : f)}));
    };
    
    const handleRemoveFilter = (id: number) => {
        setConfig(prev => ({...prev, filters: prev.filters.filter(f => f.id !== id)}));
    };
    
    const handleGenerateReport = async () => {
        if (config.fields.length === 0) {
            alert("Please select at least one field to display.");
            return;
        }
        setIsGenerating(true);
        const result = await api.generateCustomReport(config);
        setReportResult(result);
        setIsGenerating(false);
    };

    const handleSaveReport = async () => {
        if (!reportName) { alert("Please enter a name for the report."); return; }
        await api.saveCustomReport({ title: reportName, config });
        alert("Report saved! It's now available as a widget on the dashboard.");
        setIsSaveModalOpen(false);
        setReportName('');
    }
    
    const availableFields = DATA_SOURCE_FIELDS[config.dataSource];
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
                <Card title="1. Select Data Source">
                     <select value={config.dataSource} onChange={handleDataSourceChange} className="w-full bg-dark-bg border-dark-border rounded-md p-2">
                        <option value="incidents">Incidents</option>
                        <option value="personnel">Personnel</option>
                        <option value="apparatus">Apparatus</option>
                        <option value="assets">Assets</option>
                    </select>
                </Card>
                 <Card title="2. Select Fields">
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {availableFields.map(field => (
                            <label key={field.id} className="flex items-center space-x-2 p-1"><input type="checkbox" checked={config.fields.includes(field.id)} onChange={() => handleFieldToggle(field.id)} className="h-4 w-4 rounded" /><span>{field.label}</span></label>
                        ))}
                    </div>
                </Card>
                 <Card title="3. Apply Filters">
                    <div className="space-y-3">
                        {config.filters.map((filter, index) => (
                             <div key={filter.id} className="p-2 border border-dark-border rounded-md space-y-2">
                                 <div className="flex items-center space-x-2">
                                     <select value={filter.field} onChange={e => handleFilterChange(index, {...filter, field: e.target.value})} className="flex-1 bg-dark-bg border-dark-border rounded p-1 text-sm"><option value="">Select Field</option>{availableFields.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}</select>
                                     <select value={filter.condition} onChange={e => handleFilterChange(index, {...filter, condition: e.target.value as FilterCondition})} className="flex-1 bg-dark-bg border-dark-border rounded p-1 text-sm"><option value="is">is</option><option value="is_not">is not</option><option value="contains">contains</option><option value="does_not_contain">does not contain</option><option value="is_greater_than">&gt;</option><option value="is_less_than">&lt;</option></select>
                                     <Button variant="danger" className="p-1 h-7 w-7" onClick={() => handleRemoveFilter(filter.id)}><XIcon className="h-4 w-4"/></Button>
                                 </div>
                                 <input type="text" placeholder="Value" value={filter.value} onChange={e => handleFilterChange(index, {...filter, value: e.target.value})} className="w-full bg-dark-bg border-dark-border rounded p-1 text-sm" />
                             </div>
                        ))}
                        <Button variant="secondary" size="sm" onClick={handleAddFilter}>Add Filter</Button>
                    </div>
                </Card>
                <Button onClick={handleGenerateReport} isLoading={isGenerating} className="w-full" size="lg">Generate Report</Button>
            </div>
            <div className="lg:col-span-2">
                <Card title="Report Results">
                    {reportResult ? (
                        <>
                         <div className="flex justify-end mb-4"><Button onClick={() => setIsSaveModalOpen(true)} icon={<SaveIcon className="h-4 w-4 mr-2" />}>Save as Dashboard Widget</Button></div>
                         <Table columns={reportResult.columns} data={reportResult.data} />
                        </>
                    ) : <p className="text-center p-8 text-dark-text-secondary">Configure and generate a report to see results.</p>}
                </Card>
            </div>
            <Modal title="Save Report" isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)}>
                <input type="text" placeholder="Enter report name..." value={reportName} onChange={e => setReportName(e.target.value)} className="w-full p-2 rounded-md bg-dark-bg border-dark-border mb-4"/>
                <div className="flex justify-end space-x-2"><Button variant="ghost" onClick={() => setIsSaveModalOpen(false)}>Cancel</Button><Button onClick={handleSaveReport}>Save</Button></div>
            </Modal>
        </div>
    );
};


// --- Main Combined Page ---
const Reporting: React.FC = () => {
    const TABS = [
        { label: 'Analytics Dashboard', content: <AnalyticsDashboardView /> },
        { label: 'Report Builder', content: <ReportBuilderView /> },
    ];
    
    return <Tabs tabs={TABS} />;
};

export default Reporting;