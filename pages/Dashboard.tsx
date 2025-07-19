

import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import * as api from '../services/api';
import { Apparatus, NfirsIncident, ApparatusStatus, ExpiringCertification, ScheduledTraining, TrainingCourse, DashboardWidget, DashboardLayout } from '../types';
import { UsersIcon, TruckIcon, AlertTriangleIcon, TrendingUpIcon, TrendingDownIcon, ClockIcon, CheckCircle2Icon, LayoutDashboardIcon, ChevronDownIcon, ChevronUpIcon } from '../components/icons/Icons';
import { ResponsiveContainer, BarChart, Bar } from 'recharts';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

// --- Reusable Components for this Dashboard ---

const Sparkline = ({ data, color }: { data: {value: number}[], color: string }) => (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 5, bottom: 5, left: 5 }}>
            <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} />
        </BarChart>
    </ResponsiveContainer>
);

const StatCards = ({ stats }: { stats: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
            icon={<UsersIcon className="h-7 w-7 text-brand-primary" />}
            title="Active Personnel"
            value={stats.activePersonnel}
            data={stats.personnelHistory}
            trend={stats.personnelHistory[stats.personnelHistory.length - 1].value >= stats.personnelHistory[0].value ? 'up' : 'down'}
            linkTo="/app/personnel?status=Active"
        />
        <StatCard
            icon={<TruckIcon className="h-7 w-7 text-brand-secondary" />}
            title="Apparatus In Service"
            value={stats.apparatusInService}
            data={stats.apparatusHistory}
            trend={stats.apparatusHistory[stats.apparatusHistory.length - 1].value >= stats.apparatusHistory[0].value ? 'up' : 'down'}
            linkTo="/app/apparatus?status=In%20Service"
        />
        <StatCard
            icon={<AlertTriangleIcon className="h-7 w-7 text-red-500" />}
            title="Open Incidents"
            value={stats.openIncidents}
            data={stats.incidentsHistory}
            trend={stats.incidentsHistory[stats.incidentsHistory.length - 1].value >= stats.incidentsHistory[0].value ? 'down' : 'up'}
            linkTo="/app/incidents?status=In Progress"
        />
    </div>
);

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number; data: {value: number}[]; trend: 'up' | 'down'; linkTo: string; }> = ({ icon, title, value, data, trend, linkTo }) => {
    const trendColor = trend === 'up' ? 'text-green-400' : 'text-red-400';
    const TrendIcon = trend === 'up' ? TrendingUpIcon : TrendingDownIcon;
    const trendValue = data[data.length - 1].value - data[0].value;
    return (
        <ReactRouterDOM.Link to={linkTo} className="block group">
            <div className="bg-dark-card border border-dark-border rounded-lg shadow-lg p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-brand-primary/50">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-dark-bg">{icon}</div>
                        <div>
                            <p className="text-sm font-medium text-dark-text-secondary">{title}</p>
                            <p className="text-3xl font-bold text-dark-text">{value}</p>
                        </div>
                    </div>
                    <div className={`flex items-center text-lg font-bold ${trendColor}`}>
                        <TrendIcon className="h-5 w-5 mr-1" />
                        <span>{trendValue > 0 ? `+${trendValue}` : trendValue}</span>
                    </div>
                </div>
                <div className="h-16 mt-4 -mx-5 -mb-5">
                    <Sparkline data={data} color={trend === 'up' ? '#10B981' : '#DC2626'} />
                </div>
            </div>
        </ReactRouterDOM.Link>
    );
};

const DashboardCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-dark-card border border-dark-border rounded-lg shadow-lg ${className}`}>
        <h2 className="text-lg font-bold text-dark-text px-6 py-4 border-b border-dark-border">{title}</h2>
        <div className="p-6">{children}</div>
    </div>
);

// --- Widget Definitions ---
const ALL_WIDGETS: DashboardWidget[] = [
    { id: 'stats', title: 'Quick Stats', gridSpan: 3 },
    { id: 'recent-incidents', title: 'Recent Incidents', gridSpan: 2 },
    { id: 'apparatus-status', title: 'Apparatus Status', gridSpan: 1 },
    { id: 'certification-expirations', title: 'Certification Expirations', gridSpan: 1 },
    { id: 'upcoming-trainings', title: 'Upcoming Trainings', gridSpan: 2 },
];

// --- Main Dashboard Component ---

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [courses, setCourses] = useState<TrainingCourse[]>([]);
    
    // Customization state
    const [layout, setLayout] = useState<DashboardLayout>({ widgetOrder: [], hiddenWidgets: [] });
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const [statsData, coursesData, layoutData] = await Promise.all([
                    api.getDashboardStats(),
                    api.getTrainingCourses(),
                    api.getDashboardLayout(),
                ]);
                setStats(statsData);
                setCourses(coursesData);
                setLayout(layoutData);
            } catch (e) {
                setError("Failed to load dashboard data.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);
    
    const handleSaveLayout = async (newLayout: DashboardLayout) => {
        await api.saveDashboardLayout(newLayout);
        setLayout(newLayout);
        setIsCustomizeModalOpen(false);
    };

    const getCourseName = (courseId: string) => courses.find(c => c.id === courseId)?.name || 'Unknown Course';
    const getCertStatus = (expires: string) => {
        const now = new Date();
        const expiryDate = new Date(expires);
        const daysUntil = (expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24);

        if (daysUntil <= 0) return { icon: <AlertTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0"/>, label: `Expired` };
        if (daysUntil <= 90) return { icon: <ClockIcon className="h-5 w-5 text-yellow-400 flex-shrink-0"/>, label: `Expires in ${Math.floor(daysUntil)} days` };
        return { icon: <CheckCircle2Icon className="h-5 w-5 text-green-400 flex-shrink-0" />, label: 'OK' };
    };
    const getApparatusStatusClass = (status: ApparatusStatus) => {
        switch(status) {
            case ApparatusStatus.IN_SERVICE: return 'bg-green-500/10 text-green-400';
            case ApparatusStatus.OUT_OF_SERVICE: return 'bg-red-500/10 text-red-400';
            case ApparatusStatus.MAINTENANCE: return 'bg-yellow-500/10 text-yellow-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };
    const incidentStatusStyles: Record<NfirsIncident['status'], string> = {
        'Locked': 'bg-green-500/10 text-green-400',
        'Review Needed': 'bg-blue-500/10 text-blue-400',
        'In Progress': 'bg-yellow-500/10 text-yellow-400',
    };

    const WIDGET_COMPONENTS: { [key: string]: React.ReactNode } = {
        'stats': <StatCards stats={stats} />,
        'recent-incidents': (
             <DashboardCard title="Recent Incidents">
                <ul className="space-y-3">
                    {stats?.recentIncidents.map((incident: NfirsIncident) => (
                        <li key={incident.id}><ReactRouterDOM.Link to={`/app/incidents/${incident.id}`} className="block p-3 bg-dark-bg rounded-md hover:bg-dark-border transition-all duration-200 hover:shadow-md hover:-translate-y-px"><div className="flex justify-between items-center"><div><p className="font-semibold text-dark-text">{incident.type}</p><p className="text-sm text-dark-text-secondary">{incident.address}</p></div><span className={`text-xs font-bold py-1 px-3 rounded-full ${incidentStatusStyles[incident.status] || 'bg-gray-500 text-white'}`}>{incident.status}</span></div></ReactRouterDOM.Link></li>
                    ))}
                </ul>
            </DashboardCard>
        ),
        'apparatus-status': (
             <DashboardCard title="Apparatus Status">
                <ul className="divide-y divide-dark-border -m-6"><div className="px-6 py-2">{stats?.apparatusStatus.map((unit: Apparatus) => { let borderClass = ''; if (unit.status === ApparatusStatus.OUT_OF_SERVICE) borderClass = 'border-l-4 border-red-500'; else if (unit.status === ApparatusStatus.MAINTENANCE) borderClass = 'border-l-4 border-yellow-500'; else borderClass = 'border-l-4 border-transparent'; return (<li key={unit.id} className={`group ${borderClass} transition-colors duration-200 hover:bg-dark-border/50 -mx-6`}><ReactRouterDOM.Link to={`/app/apparatus/${unit.id}`} className="flex justify-between items-center p-4"><div className="pr-4"><div><p className="font-semibold text-dark-text">{unit.unitId}</p><p className="text-sm text-dark-text-secondary">{unit.type}</p></div></div><div className="flex items-center space-x-4"> {[ApparatusStatus.OUT_OF_SERVICE, ApparatusStatus.MAINTENANCE].includes(unit.status) && (<ReactRouterDOM.Link to="/app/maintenance" onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="secondary" size="sm">View Ticket</Button></ReactRouterDOM.Link>)}<span className={`text-xs font-bold py-1 px-3 rounded-full ${getApparatusStatusClass(unit.status)}`}>{unit.status}</span></div></ReactRouterDOM.Link></li>) })}</div></ul>
            </DashboardCard>
        ),
        'certification-expirations': (
             <DashboardCard title="Certification Expirations">
                 <ul className="space-y-3">{stats?.expiringCerts.length > 0 ? stats.expiringCerts.map((cert: ExpiringCertification) => { const status = getCertStatus(cert.expires); return (<li key={`${cert.personnelId}-${cert.certificationName}`}><ReactRouterDOM.Link to={`/app/personnel/${cert.personnelId}`} className="flex items-center p-3 bg-dark-bg rounded-md hover:bg-dark-border transition-all duration-200 hover:shadow-md hover:-translate-y-px">{status.icon}<div className="ml-3"><p className="font-semibold text-dark-text hover:underline">{cert.personnelName}</p><p className="text-sm text-dark-text-secondary">{cert.certificationName} - <span className="font-medium">{status.label}</span></p></div></ReactRouterDOM.Link></li>)}) : (<p className="text-center text-dark-text-secondary py-4">No certifications expiring in the next 90 days.</p>)}</ul>
            </DashboardCard>
        ),
        'upcoming-trainings': (
            <DashboardCard title="Upcoming Trainings">
                <ul className="space-y-3">{stats?.upcomingTrainings.length > 0 ? stats.upcomingTrainings.map((training: ScheduledTraining) => { const totalSlots = 12; const registered = training.attendeeIds.length; const percentage = Math.min(100, (registered / totalSlots) * 100); return (<li key={training.id} className="p-3 bg-dark-bg rounded-md transition-all duration-200 hover:shadow-md hover:-translate-y-px hover:bg-dark-border"><div className="flex justify-between items-center"><div><p className="font-semibold text-dark-text">{getCourseName(training.courseId)}</p><p className="text-sm text-dark-text-secondary">Instructor: {training.instructor}</p></div><div className="text-right w-32"><p className="font-semibold text-dark-text-secondary">{new Date(training.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p><p className="text-sm text-dark-text-secondary">{registered} / {totalSlots} registered</p><div className="w-full bg-dark-card rounded-full h-1.5 mt-1 border border-dark-border/50"><div className="bg-brand-primary h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div></div></div></div></li>);}) : (<p className="text-center text-dark-text-secondary py-4">No trainings scheduled in the near future.</p>)}</ul>
            </DashboardCard>
        )
    };

    const orderedVisibleWidgets = useMemo(() => layout.widgetOrder
        .map(id => ALL_WIDGETS.find(w => w.id === id))
        .filter((w): w is DashboardWidget => !!w)
        .filter(w => !layout.hiddenWidgets.includes(w.id)), 
    [layout]);

    if (isLoading || !stats) {
        return <div className="text-center text-dark-text-secondary">Loading Dashboard...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-end -mb-4">
                <Button variant="ghost" onClick={() => setIsCustomizeModalOpen(true)} icon={<LayoutDashboardIcon className="h-6 w-6 mr-2"/>}>Customize</Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                {orderedVisibleWidgets.map(widget => (
                    <div key={widget.id} className={`lg:col-span-${widget.gridSpan || 1}`}>
                        {WIDGET_COMPONENTS[widget.id]}
                    </div>
                ))}
            </div>

            <CustomizeLayoutModal 
                isOpen={isCustomizeModalOpen}
                onClose={() => setIsCustomizeModalOpen(false)}
                currentLayout={layout}
                onSaveLayout={handleSaveLayout}
            />
        </div>
    );
};

// --- Customization Modal Component ---
const CustomizeLayoutModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    currentLayout: DashboardLayout;
    onSaveLayout: (newLayout: DashboardLayout) => void;
}> = ({ isOpen, onClose, currentLayout, onSaveLayout }) => {
    const [order, setOrder] = useState(currentLayout.widgetOrder);
    const [hidden, setHidden] = useState(currentLayout.hiddenWidgets);

    useEffect(() => {
        setOrder(currentLayout.widgetOrder);
        setHidden(currentLayout.hiddenWidgets);
    }, [currentLayout]);

    const moveWidget = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...order];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newOrder.length) return;
        [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
        setOrder(newOrder);
    };

    const toggleVisibility = (widgetId: string) => {
        setHidden(prev => prev.includes(widgetId) ? prev.filter(id => id !== widgetId) : [...prev, widgetId]);
    };

    const handleSave = () => {
        onSaveLayout({ widgetOrder: order, hiddenWidgets: hidden });
    };

    return (
        <Modal title="Customize Dashboard Layout" isOpen={isOpen} onClose={onClose}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-dark-text mb-2">Widget Order</h3>
                    <ul className="space-y-2 p-2 bg-dark-bg border border-dark-border rounded-md">
                        {order.map((widgetId, index) => {
                             const widget = ALL_WIDGETS.find(w => w.id === widgetId);
                             return (
                                <li key={widgetId} className="flex items-center justify-between p-2 bg-dark-card rounded-md">
                                    <span className="text-dark-text">{widget?.title}</span>
                                    <div className="flex flex-col space-y-1">
                                        <Button variant="primary" className="!p-0 h-6 w-6" onClick={() => moveWidget(index, 'up')} disabled={index === 0} aria-label="Move Up">
                                            <ChevronUpIcon className="h-4 w-4" />
                                        </Button>
                                        <Button variant="primary" className="!p-0 h-6 w-6" onClick={() => moveWidget(index, 'down')} disabled={index === order.length - 1} aria-label="Move Down">
                                            <ChevronDownIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </li>
                             )
                        })}
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-dark-text mb-2">Widget Visibility</h3>
                     <ul className="space-y-2 p-2 bg-dark-bg border border-dark-border rounded-md">
                        {ALL_WIDGETS.map(widget => (
                            <li key={widget.id}>
                                <label className="flex items-center space-x-2 p-2 bg-dark-card rounded-md cursor-pointer">
                                    <input type="checkbox" checked={!hidden.includes(widget.id)} onChange={() => toggleVisibility(widget.id)} className="h-4 w-4 rounded border-gray-500 text-brand-primary focus:ring-transparent"/>
                                    <span className="text-dark-text">{widget.title}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save Layout</Button>
            </div>
        </Modal>
    );
};

export default Dashboard;