import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Tabs from '../components/ui/Tabs';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import * as api from '../services/api';
import { Asset, Role, MaintenanceLog, PreventativeMaintenanceSchedule, AssetInspection, AssetPhoto, AssetDocument, User, Consumable } from '../types';
import { useInternalAuth } from '../hooks/useInternalAuth';
import { ArchiveIcon, ArrowLeftIcon, CalendarIcon, ClipboardListIcon, DollarSignIcon, EditIcon, FileTextIcon, ImageIcon, PlusIcon, SaveIcon, WandSparklesIcon, WrenchIcon, XIcon, ShieldCheckIcon } from '../components/icons/Icons';
import { summarizeDocument } from '../services/geminiService';

// --- Reusable Detail Components ---
const DetailItem: React.FC<{ label: string; value?: React.ReactNode; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div>
        <dt className="text-sm font-medium text-dark-text-secondary">{label}</dt>
        <dd className="mt-1 text-sm text-dark-text">{value || children || 'N/A'}</dd>
    </div>
);
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-dark-text-secondary mb-1">{label}</label>
        <input {...props} className="mt-1 block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-1.5 px-2 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:opacity-70" />
    </div>
);
const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-dark-text-secondary mb-1">{label}</label>
        <select {...props} className="mt-1 block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-1.5 px-2 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:opacity-70">{children}</select>
    </div>
);
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-dark-text-secondary mb-1">{label}</label>
        <textarea {...props} className="mt-1 block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-1.5 px-2 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:opacity-70" />
    </div>
);


// --- Tab Components ---
const DetailsTab: React.FC<{ asset: Asset, isEditing: boolean, formData: Partial<Asset>, onChange: (e: any) => void }> = ({ asset, isEditing, formData, onChange }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <Card title="Core Information">
                    <div className="grid grid-cols-2 gap-4">
                        {isEditing ? <Input label="Asset Name" name="name" value={formData.name || ''} onChange={onChange} /> : <DetailItem label="Asset Name" value={asset.name} />}
                        {isEditing ? <Input label="Asset Type" name="assetType" value={formData.assetType || ''} onChange={onChange} /> : <DetailItem label="Asset Type" value={asset.assetType} />}
                        {isEditing ? <Select label="Category" name="category" value={formData.category} onChange={onChange}><option>Equipment</option><option>PPE</option><option>Kit</option></Select> : <DetailItem label="Category" value={asset.category} />}
                        {isEditing ? <Select label="Status" name="status" value={formData.status} onChange={onChange}><option>In Use</option><option>In Storage</option><option>Needs Repair</option><option>Retired</option></Select> : <DetailItem label="Status" value={asset.status} />}
                        {isEditing ? <Input label="Serial Number" name="serialNumber" value={formData.serialNumber || ''} onChange={onChange} /> : <DetailItem label="Serial Number" value={asset.serialNumber} />}
                        {isEditing ? <Input label="Manufacturer" name="manufacturer" value={formData.manufacturer || ''} onChange={onChange} /> : <DetailItem label="Manufacturer" value={asset.manufacturer} />}
                        {isEditing ? <Input label="Model" name="model" value={formData.model || ''} onChange={onChange} /> : <DetailItem label="Model" value={asset.model} />}
                        <DetailItem label="Assigned To" value={asset.assignedToName || 'Storage'} />
                    </div>
                </Card>
                <Card title="Acquisition & Lifespan">
                    <div className="grid grid-cols-2 gap-4">
                        {isEditing ? <Input label="Purchase Date" name="purchaseDate" type="date" value={formData.purchaseDate?.split('T')[0] || ''} onChange={onChange} /> : <DetailItem label="Purchase Date" value={new Date(asset.purchaseDate).toLocaleDateString()} />}
                        {isEditing ? <Input label="Purchase Price ($)" name="purchasePrice" type="number" value={formData.purchasePrice || ''} onChange={onChange} /> : <DetailItem label="Purchase Price" value={`$${asset.purchasePrice.toLocaleString()}`} />}
                        {isEditing ? <Input label="Lifespan (Years)" name="lifespanYears" type="number" value={formData.lifespanYears || ''} onChange={onChange} /> : <DetailItem label="Lifespan (Years)" value={asset.lifespanYears} />}
                         {isEditing ? <Input label="Warranty Expiration" name="warrantyExpirationDate" type="date" value={formData.warrantyExpirationDate?.split('T')[0] || ''} onChange={onChange} /> : <DetailItem label="Warranty Expiration" value={asset.warrantyExpirationDate ? new Date(asset.warrantyExpirationDate).toLocaleDateString() : 'N/A'} />}
                    </div>
                </Card>
            </div>
            <div className="md:col-span-1">
                <Card title="Notes">
                    {isEditing ? <Textarea label="Notes" name="notes" value={formData.notes || ''} onChange={onChange} rows={10} /> : <p className="text-sm text-dark-text-secondary whitespace-pre-wrap">{asset.notes || 'No notes for this asset.'}</p>}
                </Card>
            </div>
        </div>
    );
};

const MaintenanceTab: React.FC<{ asset: Asset, user: User, onUpdate: () => void, isLocked: boolean }> = ({ asset, user, onUpdate, isLocked }) => {
    const [modalType, setModalType] = useState<'log' | 'pm' | 'inspection' | null>(null);
    const [formData, setFormData] = useState<any>({});
    
    const handleOpenModal = (type: 'log' | 'pm' | 'inspection') => {
        setFormData({});
        setModalType(type);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataWithAssetId = { ...formData, assetId: asset.id, date: new Date().toISOString() };
        
        try {
            if (modalType === 'log') {
                await api.createMaintenanceLog({ ...dataWithAssetId, performedBy: user.name });
            } else if (modalType === 'pm') {
                await api.createPMSchedule(dataWithAssetId);
            } else if (modalType === 'inspection') {
                await api.createAssetInspection({ ...dataWithAssetId, performedBy: user.name });
            }
            onUpdate();
            setModalType(null);
        } catch(err) {
            alert(`Failed to save ${modalType} record.`);
        }
    };
    
    return (
        <div className="space-y-6">
            <Card title="Maintenance Logs" actions={!isLocked && <Button onClick={() => handleOpenModal('log')} icon={<PlusIcon className="h-4 w-4 mr-2"/>}>Log Maintenance</Button>}>
                <Table<MaintenanceLog> columns={[{header: "Date", accessor: (item) => new Date(item.date).toLocaleDateString()}, {header: "Description", accessor: (item) => item.description}, {header: "Cost", accessor: (item) => `$${item.cost.toLocaleString()}`}, {header: "Performed By", accessor: (item) => item.performedBy}]} data={asset.maintenanceHistory} />
            </Card>
            <Card title="Preventative Maintenance Schedules" actions={!isLocked && <Button onClick={() => handleOpenModal('pm')} icon={<PlusIcon className="h-4 w-4 mr-2"/>}>Add Schedule</Button>}>
                <Table<PreventativeMaintenanceSchedule> columns={[{header: "Task", accessor: (item) => item.taskDescription}, {header: "Frequency", accessor: (item) => `${item.frequencyInterval} ${item.frequencyUnit}`}, {header: "Next Due", accessor: (item) => new Date(item.nextDueDate).toLocaleDateString()}]} data={asset.pmSchedules} />
            </Card>
            <Card title="Inspection & Testing History" actions={!isLocked && <Button onClick={() => handleOpenModal('inspection')} icon={<PlusIcon className="h-4 w-4 mr-2"/>}>Log Inspection</Button>}>
                <Table<AssetInspection> columns={[{header: "Date", accessor: (item) => new Date(item.date).toLocaleDateString()}, {header: "Performed By", accessor: (item) => item.performedBy}, {header: "Notes", accessor: (item) => item.notes}]} data={asset.inspectionHistory} />
            </Card>
            
            <Modal title={modalType === 'log' ? "Add Maintenance Log" : modalType === 'pm' ? "Add PM Schedule" : "Add Inspection Record"} isOpen={!!modalType} onClose={() => setModalType(null)}>
                <form onSubmit={handleSave} className="space-y-4">
                    {modalType === 'log' && <>
                        <Input label="Description" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} required/>
                        <Input label="Cost ($)" type="number" value={formData.cost || ''} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} required/>
                        <Select label="Type" value={formData.type || 'Repair'} onChange={e => setFormData({...formData, type: e.target.value})}><option>Repair</option><option>Preventative</option></Select>
                    </>}
                    {modalType === 'pm' && <>
                        <Input label="Task Description" value={formData.taskDescription || ''} onChange={e => setFormData({...formData, taskDescription: e.target.value})} required/>
                        <Input label="Frequency Interval" type="number" value={formData.frequencyInterval || ''} onChange={e => setFormData({...formData, frequencyInterval: Number(e.target.value)})} required/>
                        <Select label="Frequency Unit" value={formData.frequencyUnit || 'months'} onChange={e => setFormData({...formData, frequencyUnit: e.target.value})}><option>months</option><option>years</option><option>hours</option></Select>
                        <Input label="Next Due Date" type="date" value={formData.nextDueDate || ''} onChange={e => setFormData({...formData, nextDueDate: e.target.value})} required/>
                    </>}
                    {modalType === 'inspection' && <>
                         <Textarea label="Notes" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} required rows={4}/>
                    </>}
                    <div className="flex justify-end pt-4 space-x-2"><Button variant="ghost" onClick={() => setModalType(null)}>Cancel</Button><Button type="submit">Save</Button></div>
                </form>
            </Modal>
        </div>
    );
};

const MediaTab: React.FC<{ asset: Asset, onUpdate: () => void, isLocked: boolean }> = ({ asset, onUpdate, isLocked }) => {
    const [isSummarizing, setIsSummarizing] = useState<string | null>(null);

    const handleSummarize = async (doc: AssetDocument) => {
        if (!doc.mockContent) {
            alert("No content available to summarize for this mock document.");
            return;
        }
        setIsSummarizing(doc.id);
        try {
            const summary = await summarizeDocument(doc.mockContent);
            await api.updateAssetDocumentSummary(asset.id, doc.id, summary);
            onUpdate();
        } catch (error) {
            alert("Failed to generate summary.");
        } finally {
            setIsSummarizing(null);
        }
    };
    
    return (
        <div className="space-y-6">
            <Card title="Photos" actions={!isLocked && <Button size="sm" icon={<PlusIcon className="h-4 w-4 mr-2"/>}>Upload Photo</Button>}>
                {(asset.photos || []).length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {asset.photos?.map(p => <div key={p.id} className="group relative"><img src={p.url} alt={p.caption} className="w-full h-32 object-cover rounded-md"/><p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">{p.caption}</p></div>)}
                    </div>
                ) : <p className="text-dark-text-secondary text-center">No photos uploaded.</p>}
            </Card>
             <Card title="Documents" actions={!isLocked && <Button size="sm" icon={<PlusIcon className="h-4 w-4 mr-2"/>}>Upload Document</Button>}>
                {(asset.documents || []).length > 0 ? (
                    <ul className="divide-y divide-dark-border">
                        {asset.documents?.map(doc => (
                            <li key={doc.id} className="py-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start">
                                        <FileTextIcon className="h-6 w-6 mr-3 mt-1 text-blue-400 flex-shrink-0"/>
                                        <div>
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-dark-text hover:underline">{doc.name}</a>
                                            {doc.summary && <p className="text-xs text-dark-text-secondary italic mt-1 whitespace-pre-wrap">"{doc.summary}"</p>}
                                        </div>
                                    </div>
                                    <Button size="sm" variant="secondary" onClick={() => handleSummarize(doc)} isLoading={isSummarizing === doc.id} icon={<WandSparklesIcon className="h-4 w-4 mr-2"/>}>Summarize</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-dark-text-secondary text-center">No documents uploaded.</p>}
            </Card>
        </div>
    );
};

const KitContentsTab: React.FC<{ asset: Asset; onUpdate: () => void; isLocked: boolean }> = ({ asset, onUpdate, isLocked }) => {
    const [allConsumables, setAllConsumables] = useState<Consumable[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({ consumableId: '', quantity: 1 });

    useEffect(() => {
        api.getConsumables().then(data => {
            setAllConsumables(data);
            if (data.length > 0) {
                setNewItem(prev => ({ ...prev, consumableId: data.filter(c => !(asset.inventory || []).some(i => i.consumableId === c.id))[0]?.id || '' }));
            }
        }).finally(() => setIsLoading(false));
    }, [asset.inventory]);
    
    const handleUpdateInventory = async (newInventory: Asset['inventory']) => {
        try {
            await api.updateAsset(asset.id, { inventory: newInventory });
            onUpdate();
        } catch (e) {
            alert("Failed to update kit contents.");
        }
    };

    const handleAddItem = () => {
        if (!newItem.consumableId || newItem.quantity <= 0) {
            alert("Please select an item and enter a valid quantity.");
            return;
        }
        const currentInventory = asset.inventory || [];
        const existingIndex = currentInventory.findIndex(i => i.consumableId === newItem.consumableId);

        let newInventory;
        if (existingIndex > -1) {
            newInventory = currentInventory.map((item, index) => 
                index === existingIndex ? { ...item, quantity: item.quantity + newItem.quantity } : item
            );
        } else {
            newInventory = [...currentInventory, newItem];
        }
        
        handleUpdateInventory(newInventory);
        setIsModalOpen(false);
    };

    const handleRemoveItem = (consumableId: string) => {
        if (window.confirm("Are you sure you want to remove this item from the kit?")) {
            const newInventory = (asset.inventory || []).filter(i => i.consumableId !== consumableId);
            handleUpdateInventory(newInventory);
        }
    };

    const kitContents = useMemo(() => {
        if (!asset.inventory) return [];
        return asset.inventory.map(item => {
            const consumableDetails = allConsumables.find(c => c.id === item.consumableId);
            return {
                ...item,
                name: consumableDetails?.name || 'Unknown Item',
                expirationDate: consumableDetails?.expirationDate,
            };
        });
    }, [asset.inventory, allConsumables]);

    const getStatus = (expDate?: string): { text: string; color: string } => {
        if (!expDate) return { text: 'OK', color: 'text-green-400' };
        const now = new Date();
        const expiry = new Date(expDate);
        if (expiry < now) return { text: 'Expired', color: 'text-red-400' };
        const thirtyDays = new Date();
        thirtyDays.setDate(now.getDate() + 30);
        if (expiry <= thirtyDays) return { text: 'Expiring Soon', color: 'text-yellow-400' };
        return { text: 'OK', color: 'text-green-400' };
    };

    const columns = [
        { header: "Item Name", accessor: (item: any) => item.name },
        { header: "Quantity in Kit", accessor: (item: any) => item.quantity },
        {
            header: "Status", accessor: (item: any) => {
                const status = getStatus(item.expirationDate);
                return <span className={status.color}>{status.text}</span>;
            }
        },
        {
            header: "Actions", accessor: (item: any) => !isLocked && (
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6" onClick={() => handleRemoveItem(item.consumableId)}>
                    <XIcon className="h-4 w-4 text-red-500" />
                </Button>
            )
        }
    ];

    if (isLoading) return <p className="p-4 text-dark-text-secondary">Loading consumables...</p>;

    return (
        <>
            <div className="flex justify-end mb-4">
                {!isLocked && <Button onClick={() => setIsModalOpen(true)} icon={<PlusIcon className="h-4 w-4 mr-2"/>}>Add Item</Button>}
            </div>
            <Table columns={columns} data={kitContents} />
            <Modal title="Add Item to Kit" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Consumable</label>
                        <select
                            value={newItem.consumableId}
                            onChange={e => setNewItem({...newItem, consumableId: e.target.value})}
                            className="w-full bg-dark-bg border-dark-border rounded p-2 text-dark-text"
                        >
                             <option value="">Select an item...</option>
                            {allConsumables
                                .filter(c => !(asset.inventory || []).some(i => i.consumableId === c.id))
                                .map(c => <option key={c.id} value={c.id}>{c.name}</option>
                            )}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Quantity</label>
                        <input
                            type="number"
                            min="1"
                            value={newItem.quantity}
                            onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                            className="w-full bg-dark-bg border-dark-border rounded p-2 text-dark-text"
                        />
                    </div>
                    <div className="flex justify-end pt-4 space-x-2">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddItem}>Add Item</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};


// --- Main Component ---
const AssetDetail: React.FC = () => {
    const { id } = ReactRouterDOM.useParams<{ id: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const { user } = useInternalAuth();

    const [asset, setAsset] = useState<Asset | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Asset>>({});

    const canEdit = user?.role === Role.ADMINISTRATOR || user?.role === Role.CHIEF;
    const isLocked = !canEdit || !isEditing;

    const fetchAsset = useCallback(() => {
        if (id) {
            setIsLoading(true);
            api.getAssetById(id)
                .then(data => {
                    setAsset(data);
                    setFormData(data || {});
                })
                .finally(() => setIsLoading(false));
        }
    }, [id]);

    useEffect(() => { fetchAsset(); }, [fetchAsset]);

    const handleSave = async () => {
        if (!id || !user) return;
        setIsLoading(true);
        try {
            await api.updateAsset(id, formData);
            setIsEditing(false);
            fetchAsset();
        } catch (e) {
            alert("Failed to save asset data.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData(asset || {});
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (isLoading || !asset || !user) {
        return <div className="text-center text-dark-text-secondary p-8">Loading asset details...</div>;
    }
    
    const TABS = [
        { label: 'Details', content: <DetailsTab asset={asset} isEditing={isEditing} formData={formData} onChange={handleChange} /> },
        { label: 'Maintenance & Testing', content: <MaintenanceTab asset={asset} user={user} onUpdate={fetchAsset} isLocked={isLocked} /> },
        { label: 'Media', content: <MediaTab asset={asset} onUpdate={fetchAsset} isLocked={isLocked} /> },
    ];
    
    if (asset.category === 'Kit') {
        TABS.push({
            label: 'Kit Contents',
            content: <KitContentsTab asset={asset} onUpdate={fetchAsset} isLocked={isLocked} />
        });
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => navigate('/app/assets')} className="mb-4" icon={<ArrowLeftIcon className="h-4 w-4 mr-2"/>}>Back to Asset List</Button>
            <Card>
                <div className="flex justify-between items-start">
                    <div className="flex items-center">
                        <ArchiveIcon className="h-10 w-10 text-brand-primary mr-4" />
                        <div>
                            <h2 className="text-2xl font-bold text-dark-text">{asset.name}</h2>
                            <p className="text-lg text-dark-text-secondary">{asset.assetType}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                         {canEdit && (isEditing ? (
                            <>
                                <Button onClick={handleCancel} variant="ghost">Cancel</Button>
                                <Button onClick={handleSave} icon={<SaveIcon className="h-4 w-4 mr-2"/>}>Save</Button>
                            </>
                        ) : (
                             <Button onClick={() => setIsEditing(true)} icon={<EditIcon className="h-4 w-4 mr-2"/>}>Edit Asset</Button>
                        ))}
                    </div>
                </div>
            </Card>

            <Tabs tabs={TABS} />
        </div>
    );
};

export default AssetDetail;
