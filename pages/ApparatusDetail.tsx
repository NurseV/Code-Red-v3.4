
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Tabs from '../components/ui/Tabs';
import * as api from '../services/api';
import { TruckIcon, EditIcon, SaveIcon, GaugeIcon, DollarSignIcon, ShieldCheckIcon, WrenchIcon, FileTextIcon, ImageIcon, CalendarIcon } from '../components/icons/Icons';
import { Apparatus, ApparatusStatus, VitalsLog, Role, RepairTicket, AuditLogEntry, Asset, User } from '../types';
import { useInternalAuth } from '../hooks/useInternalAuth';
import { CompartmentManager } from '../components/apparatus/CompartmentManager';
import Table from '../components/ui/Table';
import Accordion from '../components/ui/Accordion';
import Modal from '../components/ui/Modal';


const DetailItem: React.FC<{ label: string; value?: React.ReactNode; icon?: React.ReactNode; className?: string }> = ({ label, value, icon, className }) => (
    <div className={className}>
        <dt className="text-sm font-medium text-dark-text-secondary flex items-center">{icon && <span className="mr-2">{icon}</span>}{label}</dt>
        <dd className="mt-1 text-base font-semibold text-dark-text">{value || 'N/A'}</dd>
    </div>
);

const DetailInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-dark-text-secondary">{label}</label>
        <input {...props} className="mt-1 block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"/>
    </div>
);

const VitalsGauge: React.FC<{ label: string; value: number; }> = ({ label, value = 0 }) => (
    <div>
        <div className="flex justify-between text-xs text-dark-text-secondary">
            <span>{label}</span>
            <span>{value}%</span>
        </div>
        <div className="w-full bg-dark-bg rounded-full h-2 mt-1 border border-dark-border">
            <div className="bg-brand-secondary h-2 rounded-full" style={{ width: `${value}%` }}></div>
        </div>
    </div>
);

const getServiceDateStatus = (dateString?: string): { text: string; className: string } => {
    if (!dateString) return { text: 'N/A', className: 'text-dark-text' };
    
    const now = new Date();
    now.setHours(0,0,0,0);
    const expiryDate = new Date(dateString);
    const daysUntil = (expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24);

    if (daysUntil < 0) return { text: `Overdue`, className: 'text-red-400 font-bold' };
    if (daysUntil <= 30) return { text: `Expires in ${Math.ceil(daysUntil)} days`, className: 'text-yellow-400 font-bold' };
    return { text: new Date(dateString).toLocaleDateString(), className: 'text-dark-text' };
};

const RequestMaintenanceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    apparatus: Apparatus;
    user: User | null;
    onTicketCreated: () => void;
}> = ({ isOpen, onClose, apparatus, user, onTicketCreated }) => {
    const [itemDescription, setItemDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !itemDescription.trim()) return;

        setIsSubmitting(true);
        try {
            const ticketData = {
                apparatusId: apparatus.id,
                apparatusUnitId: apparatus.unitId,
                itemDescription: itemDescription,
            };
            await api.createRepairTicket(user, ticketData);
            alert('Maintenance ticket created successfully!');
            onTicketCreated();
            onClose();
        } catch (error) {
            alert('Failed to create maintenance ticket.');
        } finally {
            setIsSubmitting(false);
            setItemDescription('');
        }
    };
    
    return (
        <Modal title={`Request Maintenance for ${apparatus.unitId}`} isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="itemDescription" className="block text-sm font-medium text-dark-text-secondary mb-1">
                        Describe the issue
                    </label>
                    <textarea
                        id="itemDescription"
                        rows={4}
                        value={itemDescription}
                        onChange={(e) => setItemDescription(e.target.value)}
                        required
                        className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        placeholder="e.g., Driver side headlight is out, Pump is not engaging correctly."
                    />
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        Submit Ticket
                    </Button>
                </div>
            </form>
        </Modal>
    );
};


const ApparatusDetailsTab: React.FC<{ apparatus: Apparatus, onUpdate: (updatedApparatus: Apparatus) => void, canEdit: boolean, openRepairTickets: number, lastCheckedBy: string }> = ({ apparatus, onUpdate, canEdit, openRepairTickets, lastCheckedBy }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(apparatus);
    const { user } = useInternalAuth();

    useEffect(() => {
        setFormData(apparatus);
    }, [apparatus]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' && value !== '' ? Number(value) : value;
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleNestedChange = (section: 'specifications' | 'serviceDates' | 'insuranceInfo', field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        try {
            const updatedApparatus = await api.updateApparatus(apparatus.id, formData, user);
            onUpdate(updatedApparatus);
            setIsEditing(false);
        } catch(e) {
            alert('Failed to update apparatus details.');
        }
    }
    
    const handleCancel = () => {
        setFormData(apparatus);
        setIsEditing(false);
    }
    
    const ServiceDateItem: React.FC<{label: string, dateString?: string}> = ({label, dateString}) => {
        const status = getServiceDateStatus(dateString);
        return <DetailItem label={label} value={<span className={status.className}>{status.text}</span>} />
    }

    return (
      <div className="space-y-8">
        <div className="flex justify-end">
            {canEdit && (
                isEditing ? (
                    <div className="flex space-x-2">
                        <Button onClick={handleCancel} variant="ghost">Cancel</Button>
                        <Button onClick={handleSave} icon={<SaveIcon className="h-4 w-4 mr-2"/>}>Save Changes</Button>
                    </div>
                ) : (
                    <Button onClick={() => setIsEditing(true)} icon={<EditIcon className="h-4 w-4 mr-2"/>}>Edit Details</Button>
                )
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Column 1 */}
            <div className="space-y-6">
                <h4 className="text-lg font-semibold text-dark-text border-b border-dark-border pb-2">General Information</h4>
                {isEditing ? <DetailInput label="Unit ID" name="unitId" value={formData.unitId} onChange={handleChange} /> : <DetailItem label="Unit ID" value={apparatus.unitId} />}
                {isEditing ? <DetailInput label="Make" name="make" value={formData.make || ''} onChange={handleChange} /> : <DetailItem label="Make" value={apparatus.make} />}
                {isEditing ? <DetailInput label="Model" name="model" value={formData.model || ''} onChange={handleChange} /> : <DetailItem label="Model" value={apparatus.model} />}
                {isEditing ? <DetailInput label="Year" name="year" type="number" value={formData.year || ''} onChange={handleChange} /> : <DetailItem label="Year" value={apparatus.year} />}
                {isEditing ? <DetailInput label="VIN" name="vin" value={formData.vin || ''} onChange={handleChange} /> : <DetailItem label="VIN" value={apparatus.vin} />}
                 <DetailItem label="Last Check" value={apparatus.lastCheck ? `${new Date(apparatus.lastCheck).toLocaleDateString()} by ${lastCheckedBy}` : 'N/A'} />
            </div>
            
             {/* Column 2 */}
            <div className="space-y-6">
                 <h4 className="text-lg font-semibold text-dark-text border-b border-dark-border pb-2">Specifications</h4>
                 {isEditing ? <DetailInput label="Pump Capacity (GPM)" type="number" value={formData.specifications?.pumpCapacityGPM || ''} onChange={e => handleNestedChange('specifications', 'pumpCapacityGPM', Number(e.target.value))} /> : <DetailItem label="Pump Capacity (GPM)" value={apparatus.specifications?.pumpCapacityGPM?.toLocaleString() || 'N/A'} />}
                 {isEditing ? <DetailInput label="Water Tank (Gal)" type="number" value={formData.specifications?.waterTankSizeGallons || ''} onChange={e => handleNestedChange('specifications', 'waterTankSizeGallons', Number(e.target.value))} /> : <DetailItem label="Water Tank Size (Gallons)" value={apparatus.specifications?.waterTankSizeGallons?.toLocaleString() || 'N/A'} />}
                 
                 <h4 className="text-lg font-semibold text-dark-text border-b border-dark-border pb-2 mt-8">Maintenance & Financials</h4>
                 <DetailItem label="Open Repair Tickets" icon={<WrenchIcon className="h-4 w-4 text-yellow-400"/>} value={openRepairTickets} />
                 {isEditing ? <DetailInput label="Purchase Price" type="number" value={formData.purchasePrice || ''} onChange={(e) => setFormData(p => ({...p, purchasePrice: Number(e.target.value)}))} /> : <DetailItem label="Purchase Price" icon={<DollarSignIcon className="h-4 w-4" />} value={apparatus.purchasePrice ? `$${apparatus.purchasePrice.toLocaleString()}` : 'N/A'} />}
                 <DetailItem label="Est. Replacement Date" icon={<CalendarIcon className="h-4 w-4" />} value={apparatus.estimatedReplacementDate ? new Date(apparatus.estimatedReplacementDate).toLocaleDateString() : 'N/A'} />
                 <DetailItem label="Insurance Policy" icon={<ShieldCheckIcon className="h-4 w-4" />} value={apparatus.insuranceInfo?.policyNumber || 'N/A'} />
            </div>

            {/* Column 3 */}
            <div className="space-y-6">
                <h4 className="text-lg font-semibold text-dark-text border-b border-dark-border pb-2">Service Dates</h4>
                <ServiceDateItem label="Last Annual Service" dateString={apparatus.serviceDates?.lastAnnualService} />
                <ServiceDateItem label="Next Annual Service Due" dateString={apparatus.serviceDates?.nextAnnualServiceDue} />
                <ServiceDateItem label="Last Pump Test" dateString={apparatus.serviceDates?.lastPumpTest} />
                <ServiceDateItem label="Next Pump Test Due" dateString={apparatus.serviceDates?.nextPumpTestDue} />
            </div>
        </div>
      </div>
    );
}

const HistoryTab: React.FC<{ apparatusId: string, repairTickets: RepairTicket[] }> = ({ apparatusId, repairTickets }) => {
    const [history, setHistory] = useState<VitalsLog[]>([]);
    
    useEffect(() => {
        api.getApparatusById(apparatusId).then(app => {
            if(app) setHistory(app.vitalsHistory || []);
        });
    }, [apparatusId]);
    
    const vitalsColumns = [
        { header: "Date", accessor: (item: VitalsLog) => new Date(item.date).toLocaleString()},
        { header: "Mileage", accessor: (item: VitalsLog) => item.mileage.toLocaleString() },
        { header: "Engine Hours", accessor: (item: VitalsLog) => item.engineHours.toFixed(1) },
        { header: "Logged By", accessor: (item: VitalsLog) => "Mock User" }
    ];

     const ticketColumns = [
        { header: "Date", accessor: (item: RepairTicket) => new Date(item.createdAt).toLocaleString()},
        { header: "Item", accessor: (item: RepairTicket) => item.itemDescription, className: "whitespace-normal max-w-sm" },
        { header: "Status", accessor: (item: RepairTicket) => item.status },
    ];

    return (
        <div className="space-y-8">
            <Accordion title="Repair Ticket History" defaultOpen>
                <Table columns={ticketColumns} data={repairTickets} />
            </Accordion>
            <Accordion title="Vitals History" defaultOpen>
                <Table columns={vitalsColumns} data={history} />
            </Accordion>
        </div>
    );
};

const AssetLogTab: React.FC<{ apparatusId: string }> = ({ apparatusId }) => {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        api.getAuditLogs({ targetId: apparatusId })
            .then(allLogs => {
                const assetLogs = allLogs.filter(log => log.action === 'ASSET_TRANSFER');
                setLogs(assetLogs);
            })
            .finally(() => setIsLoading(false));
    }, [apparatusId]);

    const columns = [
        { header: "Timestamp", accessor: (item: AuditLogEntry) => new Date(item.timestamp).toLocaleString() },
        { header: "User", accessor: (item: AuditLogEntry) => item.userName },
        { header: "Asset", accessor: (item: AuditLogEntry) => item.details.assetName },
        { header: "From", accessor: (item: AuditLogEntry) => item.details.from },
        { header: "To", accessor: (item: AuditLogEntry) => item.details.to },
    ];

    if(isLoading) return <div className="text-center text-dark-text-secondary p-8">Loading asset log...</div>;

    return <Table columns={columns} data={logs} />;
};

const PhysicalMediaTab: React.FC<{ apparatus: Apparatus }> = ({ apparatus }) => (
    <div className="space-y-8">
        <Accordion title={`Photos (${(apparatus.photos || []).length})`} defaultOpen>
            {(apparatus.photos || []).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {apparatus.photos?.map(photo => (
                        <div key={photo.id} className="group relative border border-dark-border rounded-lg overflow-hidden">
                            <img src={photo.url} alt={photo.caption} className="aspect-video w-full object-cover"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2">
                                <p className="text-white text-xs font-semibold truncate">{photo.caption}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : <p className="text-dark-text-secondary text-center py-4">No photos available for this apparatus.</p>}
        </Accordion>
        <Accordion title={`Documents (${(apparatus.documents || []).length})`} defaultOpen>
            {(apparatus.documents || []).length > 0 ? (
                <div className="divide-y divide-dark-border bg-dark-bg p-2 rounded-md">
                    {apparatus.documents?.map(doc => (
                        <div key={doc.id} className="py-3 px-2 flex items-center justify-between group">
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-medium text-dark-text hover:underline flex items-center"><FileTextIcon className="h-5 w-5 mr-3"/>{doc.name}</a>
                            {doc.summary && <p className="text-sm text-dark-text-secondary">{doc.summary}</p>}
                        </div>
                    ))}
                </div>
            ) : <p className="text-dark-text-secondary text-center py-4">No documents available for this apparatus.</p>}
        </Accordion>
    </div>
);


const ApparatusDetail: React.FC = () => {
    const { id } = ReactRouterDOM.useParams<{ id: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const { user } = useInternalAuth();
    const [apparatus, setApparatus] = useState<Apparatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [repairTickets, setRepairTickets] = useState<RepairTicket[]>([]);
    const [lastCheckedBy, setLastCheckedBy] = useState<string>('N/A');
    const [quickVitals, setQuickVitals] = useState({ mileage: '', engineHours: '' });
    const [isSubmittingVitals, setIsSubmittingVitals] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    
    // State for checklist integration
    const [searchParams] = ReactRouterDOM.useSearchParams();
    const [allAssets, setAllAssets] = useState<Asset[]>([]);
    const [activeTab, setActiveTab] = useState(0);

    const highlightAssetId = searchParams.get('highlightAsset');
    const highlightAssetName = useMemo(() => {
        if (!highlightAssetId || allAssets.length === 0) return '';
        return allAssets.find(a => a.id === highlightAssetId)?.name || '';
    }, [highlightAssetId, allAssets]);

    const canEdit = user?.role === Role.ADMINISTRATOR || user?.role === Role.CHIEF;
    
    const fetchApparatusData = useCallback(() => {
        if (!id) return;
        setIsLoading(true);
        Promise.all([
            api.getApparatusById(id),
            api.getRepairTickets(),
            api.getAssets() // fetch all assets for name lookup
        ]).then(([appData, ticketData, assetData]) => {
            setApparatus(appData);
            setAllAssets(assetData);
            setQuickVitals({ mileage: String(appData?.mileage || ''), engineHours: String(appData?.engineHours || '') });
            const openTickets = ticketData.filter(t => t.apparatusId === id && t.status !== 'Resolved');
            setRepairTickets(openTickets);

            if (appData?.vitalsHistory?.[0]?.userId) {
                api.getPersonnelById(appData.vitalsHistory[0].userId)
                  .then(user => setLastCheckedBy(user?.name || 'Unknown'));
            }
        }).finally(() => setIsLoading(false));
    }, [id]);

    useEffect(() => {
        fetchApparatusData();
    }, [fetchApparatusData]);

    useEffect(() => {
        if (highlightAssetId) {
            setActiveTab(1); // Switch to Compartments tab
        }
    }, [highlightAssetId]);

    useEffect(() => {
        if (apparatus) {
            setQuickVitals({ mileage: String(apparatus.mileage), engineHours: String(apparatus.engineHours) });
        }
    }, [apparatus]);
    
    const handleUpdate = (updatedApparatus: Apparatus) => {
        setApparatus(updatedApparatus);
    };

    const handleQuickVitalsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !apparatus) return;

        const newMileage = Number(quickVitals.mileage);
        const newEngineHours = Number(quickVitals.engineHours);

        if (newMileage < apparatus.mileage || newEngineHours < apparatus.engineHours) {
            if (!window.confirm("The entered values are less than the current vitals. This is unusual. Are you sure you want to proceed?")) {
                return;
            }
        }
        
        setIsSubmittingVitals(true);
        try {
            const updatedApparatus = await api.logApparatusVitals(
                apparatus.id,
                { mileage: newMileage, engineHours: newEngineHours },
                user
            );
            setApparatus(updatedApparatus);
            alert('Vitals logged successfully!');
        } catch (err) {
            alert('Failed to log vitals.');
        } finally {
            setIsSubmittingVitals(false);
        }
    };

    const onTicketCreated = () => {
        fetchApparatusData();
    };


    if (isLoading) {
        return <div className="text-center text-dark-text-secondary p-8">Loading apparatus details...</div>;
    }

    if (!apparatus) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-dark-text">Apparatus Not Found</h2>
                <p className="mt-2 text-dark-text-secondary">The requested apparatus could not be found.</p>
                <ReactRouterDOM.Link to="/app/apparatus" className="mt-4 inline-block">
                    <Button>Back to Fleet</Button>
                </ReactRouterDOM.Link>
            </div>
        );
    }
    
    const statusColorClass = apparatus.status === ApparatusStatus.IN_SERVICE ? 'bg-green-500/20 text-green-400' :
                             apparatus.status === ApparatusStatus.OUT_OF_SERVICE ? 'bg-red-500/20 text-red-400' :
                             'bg-yellow-500/20 text-yellow-400';
                             
    const TABS = [
        { label: 'Details', content: <ApparatusDetailsTab apparatus={apparatus} onUpdate={handleUpdate} canEdit={canEdit} openRepairTickets={repairTickets.length} lastCheckedBy={lastCheckedBy} /> },
        { label: 'Compartments', content: <CompartmentManager apparatus={apparatus} onUpdate={handleUpdate} initialSearchTerm={highlightAssetName} /> },
        { label: 'History', content: <HistoryTab apparatusId={apparatus.id} repairTickets={repairTickets} /> },
        { label: 'Asset Log', content: <AssetLogTab apparatusId={apparatus.id} /> },
        { label: 'Physical Media', content: <PhysicalMediaTab apparatus={apparatus} /> }
    ];

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <img src={apparatus.photos?.[0]?.url || 'https://picsum.photos/seed/default-truck/400/300'} className="w-full md:w-1/3 h-48 object-cover rounded-lg border border-dark-border" alt={apparatus.unitId} />
                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-start">
                             <div>
                                <h2 className="text-3xl font-bold text-dark-text">{apparatus.unitId}</h2>
                                <p className="text-xl text-dark-text-secondary">{apparatus.type}</p>
                                <span className={`mt-2 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${statusColorClass}`}>
                                {apparatus.status}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button variant="secondary" onClick={() => setIsMaintenanceModalOpen(true)}>Request Maintenance</Button>
                                <Button onClick={() => navigate(`/app/apparatus/${apparatus.id}/checklist`)}>Perform Daily Check</Button>
                            </div>
                        </div>
                         <div className="mt-4 pt-4 border-t border-dark-border grid grid-cols-2 md:grid-cols-3 gap-6">
                            <DetailItem label="Assignment" value={apparatus.currentAssignment || 'N/A'} />
                            <DetailItem label="Mileage" icon={<GaugeIcon className="h-4 w-4"/>} value={apparatus.mileage.toLocaleString()} />
                            <DetailItem label="Engine Hours" icon={<GaugeIcon className="h-4 w-4"/>} value={apparatus.engineHours.toLocaleString()} />
                            <VitalsGauge label="Fuel Level" value={apparatus.fuelLevel || 0} />
                            <VitalsGauge label="DEF Level" value={apparatus.defLevel || 0} />
                         </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card title="Quick Vitals Log">
                        <form onSubmit={handleQuickVitalsSubmit} className="space-y-4">
                            <p className="text-sm text-dark-text-secondary">Quickly log current mileage and engine hours. This will be added to the vitals history.</p>
                             <DetailInput label="Mileage" id="mileage" name="mileage" type="number" value={quickVitals.mileage} onChange={e => setQuickVitals(prev => ({...prev, mileage: e.target.value}))} />
                             <DetailInput label="Engine Hours" id="engineHours" name="engineHours" type="number" step="0.1" value={quickVitals.engineHours} onChange={e => setQuickVitals(prev => ({...prev, engineHours: e.target.value}))} />
                             <Button type="submit" className="w-full" isLoading={isSubmittingVitals}>Log Vitals</Button>
                        </form>
                    </Card>
                </div>
            </div>
            <RequestMaintenanceModal
                isOpen={isMaintenanceModalOpen}
                onClose={() => setIsMaintenanceModalOpen(false)}
                apparatus={apparatus}
                user={user}
                onTicketCreated={onTicketCreated}
            />
        </div>
    );
};

export default ApparatusDetail;
