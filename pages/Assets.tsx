import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import QRCode from 'qrcode';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import * as api from '../services/api';
import * as gemini from '../services/geminiService';
import { Asset, SavedAssetView, Personnel, Apparatus, User, Consumable, MaintenanceLog } from '../types';
import { useInternalAuth } from '../hooks/useInternalAuth';
import { PlusIcon, SearchIcon, XIcon, EditIcon, LayoutDashboardIcon, ListChecksIcon, SaveIcon, FilterIcon, MoreVerticalIcon, EyeIcon, WrenchIcon, Trash2Icon, ChevronDownIcon, DotIcon, ArrowLeftIcon, ArrowRightIcon, WandSparklesIcon, PrinterIcon, ShieldAlertIcon } from '../components/icons/Icons';
import { NFPA_RETIREMENT_YEARS } from '../constants';

type ViewState = { type: 'dashboard' } | { type: 'list', filters?: Partial<any> } | { type: 'new' };

// --- UTILITY & HELPER FUNCTIONS ---

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};

// --- DATA PROCESSING HELPERS ---

export const calculateTCO = (asset: Asset): number => {
    const maintenanceCost = (asset.maintenanceHistory || []).reduce((sum, log: MaintenanceLog) => sum + log.cost, 0);
    return asset.purchasePrice + maintenanceCost;
};

export const calculateCurrentValue = (asset: Asset): number | null => {
    if (!asset.lifespanYears || asset.lifespanYears <= 0 || !asset.purchaseDate) return null;
    const purchaseDate = new Date(asset.purchaseDate);
    const yearsInService = (new Date().getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (yearsInService >= asset.lifespanYears) return 0;
    const annualDepreciation = asset.purchasePrice / asset.lifespanYears;
    const totalDepreciation = annualDepreciation * yearsInService;
    return Math.max(0, asset.purchasePrice - totalDepreciation);
};

export const getKitSummary = (asset: Asset, allConsumables: Consumable[]): string | null => {
    if (asset.category !== 'Kit' || !asset.inventory) return null;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    let expiringCount = 0;
    let totalItems = 0;
    asset.inventory.forEach(itemInKit => {
        totalItems += itemInKit.quantity;
        const consumableDetails = allConsumables.find(c => c.id === itemInKit.consumableId);
        if (consumableDetails?.expirationDate && new Date(consumableDetails.expirationDate) <= thirtyDaysFromNow) {
            expiringCount += itemInKit.quantity;
        }
    });
    if (expiringCount > 0) return `${totalItems} items (${expiringCount} expiring soon)`;
    return `${totalItems} items`;
};

export const getComplianceStatus = (asset: Asset): Asset['complianceStatus'] | null => {
    if (asset.category !== 'PPE') return null;
    const now = new Date();
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(now.getDate() + 90);

    if (asset.manufactureDate) {
        const retirementDate = new Date(asset.manufactureDate);
        retirementDate.setFullYear(retirementDate.getFullYear() + NFPA_RETIREMENT_YEARS);
        if (retirementDate < now) return { name: 'Overdue', details: `Retired ${retirementDate.toLocaleDateString()}` };
        if (retirementDate < oneYearFromNow) return { name: 'Nearing Retirement', details: `Retires ${retirementDate.toLocaleDateString()}` };
    }
    if (asset.lastTestedDate) {
        const nextInspection = new Date(asset.lastTestedDate);
        nextInspection.setFullYear(nextInspection.getFullYear() + 1);
        if (nextInspection < now) return { name: 'Overdue', details: `Inspection due ${nextInspection.toLocaleDateString()}` };
        if (nextInspection < ninetyDaysFromNow) return { name: 'Due Soon', details: `Inspection due ${nextInspection.toLocaleDateString()}` };
    }
    if (asset.lastCleaningDate) {
        const nextCleaning = new Date(asset.lastCleaningDate);
        nextCleaning.setMonth(nextCleaning.getMonth() + 6);
        if (nextCleaning < now) return { name: 'Overdue', details: `Cleaning due ${nextCleaning.toLocaleDateString()}` };
        if (nextCleaning < ninetyDaysFromNow) return { name: 'Due Soon', details: `Cleaning due ${nextCleaning.toLocaleDateString()}` };
    }
    return { name: 'OK', details: 'In compliance' };
};

export interface ProcessedAsset extends Asset {
    tco?: number;
    currentValue?: number;
    kitSummaryText?: string | null;
    complianceStatus?: Asset['complianceStatus'] | null;
}

export const processAssets = (assets: Asset[], consumables: Consumable[]): ProcessedAsset[] => {
    return assets.map(asset => ({
        ...asset,
        tco: calculateTCO(asset),
        currentValue: calculateCurrentValue(asset),
        kitSummaryText: getKitSummary(asset, consumables),
        complianceStatus: getComplianceStatus(asset),
    }));
};


// --- REUSABLE COMPONENTS FOR THIS PAGE ---

const PrintLabelModal: React.FC<{ asset: Asset | null; onClose: () => void; }> = ({ asset, onClose }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        if (asset) {
            QRCode.toDataURL(asset.id, { errorCorrectionLevel: 'H', width: 200 })
                .then(url => setQrCodeUrl(url))
                .catch(err => console.error(err));
        }
    }, [asset]);

    if (!asset) return null;

    return (
        <Modal title="Print Asset Label" isOpen={!!asset} onClose={onClose}>
            <div className="printable-label-wrapper bg-white text-black p-4 rounded-lg">
                <div className="text-center">
                    <h3 className="text-2xl font-bold">{asset.name}</h3>
                    <p className="font-mono text-sm">{asset.serialNumber || asset.id}</p>
                    {qrCodeUrl && <img src={qrCodeUrl} alt={`QR Code for ${asset.id}`} className="mx-auto mt-4" />}
                </div>
            </div>
            <div className="mt-6 flex justify-end no-print">
                <Button onClick={() => window.print()} icon={<PrinterIcon className="h-4 w-4 mr-2" />}>Print</Button>
            </div>
        </Modal>
    );
};

const LifespanIndicator: React.FC<{ asset: Asset }> = ({ asset }) => {
    if (!asset.lifespanYears || !asset.purchaseDate) return <div className="text-sm text-dark-text-secondary">N/A</div>;
    const startMs = new Date(asset.purchaseDate).getTime();
    const totalMs = asset.lifespanYears * 365.25 * 24 * 60 * 60 * 1000;
    const elapsedMs = Date.now() - startMs;
    const percentage = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
    const colorClass = percentage > 85 ? 'bg-red-500' : percentage > 65 ? 'bg-yellow-500' : 'bg-green-500';
    return (
        <div className="w-full bg-dark-bg rounded-full h-2.5 border border-dark-border/50" title={`${percentage.toFixed(0)}% of service life used`}>
            <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const CheckoutModal: React.FC<{
    isOpen: boolean; onClose: () => void; onSave: (assignedToId: string, assignedToType: 'Personnel' | 'Apparatus') => void;
    personnel: Personnel[]; apparatus: Apparatus[];
}> = ({ isOpen, onClose, onSave, personnel, apparatus }) => {
    const [assignType, setAssignType] = useState<'Personnel' | 'Apparatus'>('Personnel');
    const [selectedId, setSelectedId] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (assignType === 'Personnel' && personnel.length > 0) setSelectedId(personnel[0].id);
            else if (assignType === 'Apparatus' && apparatus.length > 0) setSelectedId(apparatus[0].id);
            else setSelectedId('');
        }
    }, [isOpen, assignType, personnel, apparatus]);

    const handleSave = () => { if (selectedId) { onSave(selectedId, assignType); } };
    const options = assignType === 'Personnel' ? personnel : apparatus;
    const valueProp = assignType === 'Personnel' ? 'id' : 'id';
    const labelProp = assignType === 'Personnel' ? 'name' : 'unitId';

    return (
        <Modal title="Checkout Asset" isOpen={isOpen} onClose={onClose}>
            <div className="space-y-4">
                <Select label="Assign To" value={assignType} onChange={(e) => setAssignType(e.target.value as any)}>
                    <option>Personnel</option><option>Apparatus</option>
                </Select>
                <Select label={assignType} value={selectedId} onChange={e => setSelectedId(e.target.value)}>
                    {options.map((opt: any) => <option key={opt[valueProp]} value={opt[valueProp]}>{opt[labelProp]}</option>)}
                </Select>
                <div className="flex justify-end pt-4 space-x-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Assign Asset</Button>
                </div>
            </div>
        </Modal>
    );
};

// --- VIEWS ---

const PPEComplianceView: React.FC<{ assets: ProcessedAsset[], onPrint: (asset: Asset) => void }> = ({ assets, onPrint }) => {
    const statusStyles: Record<string, string> = {
        'OK': 'bg-green-500/20 text-green-300',
        'Due Soon': 'bg-yellow-500/20 text-yellow-300',
        'Overdue': 'bg-red-500/20 text-red-300',
        'Nearing Retirement': 'bg-orange-500/20 text-orange-400',
    };

    const columns = [
        { header: 'Asset Name', accessor: (item: ProcessedAsset) => <ReactRouterDOM.Link to={`/app/assets/${item.id}`} className="font-medium text-dark-text hover:text-brand-primary hover:underline">{item.name}</ReactRouterDOM.Link> },
        { header: 'Assigned To', accessor: (item: ProcessedAsset) => item.assignedToName || 'Storage' },
        { header: 'Manufacture Date', accessor: (item: ProcessedAsset) => item.manufactureDate ? new Date(item.manufactureDate).toLocaleDateString() : 'N/A' },
        { header: 'Retirement Date', accessor: (item: ProcessedAsset) => item.retirementDate ? new Date(item.retirementDate).toLocaleDateString() : 'N/A' },
        { header: 'Compliance Status', accessor: (item: ProcessedAsset) => (
            <div className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[item.complianceStatus?.name || '']}`} title={item.complianceStatus?.details}>
                {item.complianceStatus?.name || 'N/A'}
            </div>
        ) },
        { header: 'Actions', accessor: (item: ProcessedAsset) => <Button size="sm" variant="ghost" onClick={() => onPrint(item)}>Print Label</Button> }
    ];
    return <Table columns={columns} data={assets} />;
};

const AssetListView: React.FC<{ onNavigate: (view: ViewState) => void; initialFilters?: Partial<any> }> = ({ onNavigate, initialFilters }) => {
    const { user } = useInternalAuth();
    const navigate = ReactRouterDOM.useNavigate();
    const [allAssets, setAllAssets] = useState<ProcessedAsset[]>([]);
    const [allPersonnel, setAllPersonnel] = useState<Personnel[]>([]);
    const [allApparatus, setAllApparatus] = useState<Apparatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({ searchTerm: '', searchField: 'all', category: '', status: '', ...(initialFilters || {}) });
    const [sortConfig, setSortConfig] = useState<{ key: keyof Asset, direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
    const [assetForModal, setAssetForModal] = useState<Asset | null>(null);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

    const fetchData = useCallback(() => {
        setIsLoading(true);
        Promise.all([api.getAssets(), api.getPersonnelList(), api.getApparatusList(), api.getConsumables()])
            .then(([assetsData, personnelData, apparatusData, consumablesData]) => {
                setAllAssets(processAssets(assetsData, consumablesData));
                setAllPersonnel(personnelData);
                setAllApparatus(apparatusData);
            }).finally(() => setIsLoading(false));
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const requestSort = (key: keyof Asset) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') { direction = 'descending'; }
        setSortConfig({ key, direction });
    };

    const handleOpenCheckoutModal = (asset: Asset) => {
        setAssetForModal(asset);
        setIsCheckoutModalOpen(true);
    };

    const handleCheckoutSave = async (assignedToId: string, assignedToType: 'Personnel' | 'Apparatus') => {
        if (!assetForModal || !user) return;
        await api.updateAssetAssignment(assetForModal.id, assignedToId, assignedToType, user);
        fetchData();
        setIsCheckoutModalOpen(false);
        setAssetForModal(null);
    };

    const handleCheckin = async (asset: Asset) => {
        if (!user || !window.confirm(`Are you sure you want to check in "${asset.name}" and return it to storage?`)) return;
        await api.updateAssetAssignment(asset.id, null, null, user);
        fetchData();
    };

    const processedAssets = useMemo(() => {
        let filtered = allAssets.filter(asset => {
            const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
            const termMatch = !debouncedSearchTerm ||
                (filters.searchField === 'all' && (asset.name.toLowerCase().includes(lowerSearchTerm) || (asset.serialNumber || '').toLowerCase().includes(lowerSearchTerm) || asset.assetType.toLowerCase().includes(lowerSearchTerm))) ||
                (filters.searchField === 'name' && asset.name.toLowerCase().includes(lowerSearchTerm)) ||
                (filters.searchField === 'serialNumber' && (asset.serialNumber || '').toLowerCase().includes(lowerSearchTerm)) ||
                (filters.searchField === 'assetType' && asset.assetType.toLowerCase().includes(lowerSearchTerm));
            return termMatch && (!filters.category || asset.category === filters.category) && (!filters.status || asset.status === filters.status);
        });
        if (sortConfig) { /* sorting logic */ }
        return filtered;
    }, [allAssets, debouncedSearchTerm, filters, sortConfig]);

    const columns = [
        { header: 'Asset Name', sortKey: 'name' as const, accessor: (item: ProcessedAsset) => (
            <div>
                 <ReactRouterDOM.Link to={`/app/assets/${item.id}`} className="font-medium text-dark-text hover:text-brand-primary hover:underline">{item.name}</ReactRouterDOM.Link>
                 <p className="text-xs text-dark-text-secondary font-mono">{item.serialNumber}</p>
                 {item.kitSummaryText && <p className="text-xs text-blue-300">{item.kitSummaryText}</p>}
            </div>
        )},
        { header: 'TCO', accessor: (item: ProcessedAsset) => item.tco ? currencyFormatter.format(item.tco) : 'N/A' },
        { header: 'Current Value', accessor: (item: ProcessedAsset) => item.currentValue !== null && item.currentValue !== undefined ? currencyFormatter.format(item.currentValue) : 'N/A' },
        { header: 'Service Life', accessor: (item: ProcessedAsset) => <LifespanIndicator asset={item} /> },
        { header: 'Status', sortKey: 'status' as const, accessor: (item: ProcessedAsset) => item.status },
        { header: 'Assigned To', sortKey: 'assignedToName' as const, accessor: (item: ProcessedAsset) => item.assignedToName || 'Storage' },
        { header: 'Actions', accessor: (item: ProcessedAsset) => (
            <div className="flex items-center space-x-1">
                {item.assignedToId 
                    ? <Button size="sm" onClick={() => handleCheckin(item)}>Check-in</Button>
                    : <Button size="sm" variant="secondary" onClick={() => handleOpenCheckoutModal(item)}>Checkout</Button>
                }
                 <Button size="sm" variant="ghost" onClick={() => setAssetForModal(item)}>Print Label</Button>
            </div>
        )}
    ];

    return (
        <Card>
            <div className="p-4 flex flex-wrap gap-4 items-center border-b border-dark-border">
                <div className="flex-grow flex items-center bg-dark-bg border border-dark-border rounded-md">
                    <select name="searchField" onChange={handleFilterChange} value={filters.searchField} className="bg-transparent border-0 rounded-l-md py-2 pl-3 pr-1 text-dark-text-secondary sm:text-sm focus:ring-0">
                        <option value="all">All Fields</option><option value="name">Name</option><option value="serialNumber">Serial Number</option><option value="assetType">Asset Type</option>
                    </select>
                    <div className="relative flex-grow border-l border-dark-border">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                        <input type="text" name="searchTerm" placeholder="Search..." value={filters.searchTerm} onChange={handleFilterChange} className="w-full bg-transparent border-0 rounded-r-md py-2 pl-10 pr-4 text-dark-text focus:ring-0"/>
                    </div>
                </div>
                <select name="category" onChange={handleFilterChange} value={filters.category} className="bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text sm:text-sm"><option value="">All Categories</option><option>Equipment</option><option>PPE</option><option>Kit</option></select>
                <select name="status" onChange={handleFilterChange} value={filters.status} className="bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text sm:text-sm"><option value="">All Statuses</option><option>In Use</option><option>In Storage</option><option>Needs Repair</option><option>Retired</option></select>
            </div>
            {isLoading ? <div className="text-center p-8 text-dark-text-secondary">Loading Assets...</div> :
                <Table columns={columns} data={processedAssets} sortConfig={sortConfig} requestSort={requestSort} />
            }
             <CheckoutModal isOpen={isCheckoutModalOpen} onClose={() => setIsCheckoutModalOpen(false)} onSave={handleCheckoutSave} personnel={allPersonnel} apparatus={allApparatus} />
             <PrintLabelModal asset={assetForModal} onClose={() => setAssetForModal(null)} />
        </Card>
    );
};

// --- Form Input helpers ---
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; helperText?: string }> = ({ label, error, helperText, ...props }) => (
    <div><label htmlFor={props.id} className="block text-sm font-medium text-dark-text-secondary mb-1">{label}</label><input {...props} className={`block w-full bg-dark-bg border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none sm:text-sm ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-dark-border focus:ring-brand-primary focus:border-brand-primary'}`} /><p className="mt-1 text-xs text-dark-text-secondary">{helperText}</p>{error && <p className="mt-1 text-xs text-red-400">{error}</p>}</div>
);
const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }> = ({ label, children, error, ...props }) => (
    <div><label htmlFor={props.id} className="block text-sm font-medium text-dark-text-secondary mb-1">{label}</label><select {...props} className={`block w-full bg-dark-bg border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none sm:text-sm ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-dark-border focus:ring-brand-primary focus:border-brand-primary'}`}>{children}</select>{error && <p className="mt-1 text-xs text-red-400">{error}</p>}</div>
);

// --- New Asset View (Wizard) ---
const NewAssetView: React.FC<{ onNavigate: (view: ViewState) => void }> = ({ onNavigate }) => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<Partial<Asset>>({ name: '', assetType: '', category: 'Equipment', serialNumber: '', manufacturer: '', model: '', status: 'In Storage', purchaseDate: new Date().toISOString().split('T')[0], purchasePrice: 0 });
    const [isSuggesting, setIsSuggesting] = useState(false);
    const debouncedSerial = useDebounce(formData.serialNumber || '', 500);
    const [serialExists, setSerialExists] = useState(false);
    
    useEffect(() => { if (debouncedSerial) { api.checkDuplicateSerialNumber(debouncedSerial).then(setSerialExists); } else { setSerialExists(false); } }, [debouncedSerial]);
    const handleNameBlur = async () => { if (formData.name && !formData.assetType) { setIsSuggesting(true); try { const suggestions = await gemini.suggestAssetDetails(formData.name); setFormData(prev => ({ ...prev, ...suggestions })); } catch (e) { /* fail silently */ } finally { setIsSuggesting(false); } } };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const validateStep1 = () => { const newErrors: Record<string, string> = {}; if (!formData.name) newErrors.name = "Asset Name is required."; if (!formData.assetType) newErrors.assetType = "Asset Type is required."; if (formData.serialNumber && serialExists) newErrors.serialNumber = "This serial number already exists."; setErrors(newErrors); return Object.keys(newErrors).length === 0; };
    const handleNext = () => { if (step === 1 && validateStep1()) { setStep(s => s + 1); } else if (step < 3) { setStep(s => s + 1); } };
    const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setIsSubmitting(true); try { await api.createAsset(formData); alert('Asset created successfully!'); onNavigate({ type: 'list' }); } catch(e) { alert('Failed to create asset'); } finally { setIsSubmitting(false); } };
    const STEPS = ["Core Information", "Financials & Lifespan", "Review & Create"];

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <div className="border-b border-dark-border pb-4 mb-6"><h2 className="text-xl font-bold">Add New Asset</h2><div className="flex items-center space-x-4 mt-2">{STEPS.map((title, index) => (<React.Fragment key={index}><div className="flex items-center"><div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step > index ? 'bg-brand-primary text-white' : 'bg-dark-bg border-2 border-dark-border text-dark-text-secondary'}`}>{step > index ? '✓' : index + 1}</div><span className={`ml-3 ${step >= index + 1 ? 'text-dark-text' : 'text-dark-text-secondary'}`}>{title}</span></div>{index < STEPS.length - 1 && <div className="flex-grow h-px bg-dark-border"></div>}</React.Fragment>))}</div></div>
                <div className="py-6 min-h-[300px]">
                    {step === 1 && (<div className="space-y-4"><Input label="Asset Name" name="name" value={formData.name || ''} onChange={handleChange} onBlur={handleNameBlur} error={errors.name} required /><Input label="Asset Type" name="assetType" value={formData.assetType || ''} onChange={handleChange} error={errors.assetType} helperText="e.g., SCBA, Thermal Imager" required /><Select label="Category" name="category" value={formData.category} onChange={handleChange}><option>Equipment</option><option>PPE</option><option>Kit</option></Select><Input label="Serial Number" name="serialNumber" value={formData.serialNumber || ''} onChange={handleChange} error={errors.serialNumber} /><Input label="Manufacturer" name="manufacturer" value={formData.manufacturer || ''} onChange={handleChange} /><Input label="Model" name="model" value={formData.model || ''} onChange={handleChange} /></div>)}
                    {step === 2 && (<div className="space-y-4"><Input label="Purchase Date" name="purchaseDate" type="date" value={formData.purchaseDate || ''} onChange={handleChange} /><Input label="Purchase Price ($)" name="purchasePrice" type="number" step="0.01" value={formData.purchasePrice || ''} onChange={handleChange} /><Input label="Expected Lifespan (Years)" name="lifespanYears" type="number" value={formData.lifespanYears || ''} onChange={handleChange} /><Input label="Warranty Expiration Date" name="warrantyExpirationDate" type="date" value={formData.warrantyExpirationDate || ''} onChange={handleChange} /></div>)}
                    {step === 3 && (<div><h3 className="text-lg font-semibold mb-4">Review Details</h3><div className="space-y-2 text-sm bg-dark-bg p-4 rounded-md border border-dark-border">{Object.entries(formData).map(([key, value]) => value && <p key={key}><strong className="text-dark-text-secondary capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong> <span className="text-dark-text">{String(value)}</span></p>)}</div></div>)}
                </div>
                <div className="pt-5 border-t border-dark-border flex justify-between"><Button type="button" variant="ghost" onClick={() => step > 1 ? setStep(s => s - 1) : onNavigate({type: 'list'})}>{step > 1 ? 'Back' : 'Cancel'}</Button>{step < STEPS.length ? (<Button type="button" onClick={handleNext}>Next <ArrowRightIcon className="h-4 w-4 ml-2"/></Button>) : (<Button type="submit" isLoading={isSubmitting}>Create Asset</Button>)}</div>
            </form>
        </Card>
    );
};


// --- MAIN ASSET COMPONENT ---
const Assets: React.FC = () => {
    const [view, setView] = useState<'all' | 'ppe' | 'new'>('all');
    const { search } = ReactRouterDOM.useLocation();
    
    useEffect(() => {
        const params = new URLSearchParams(search);
        if (params.get('id')) {
            setView('all'); // Go to list view if deep-linking
        }
    }, [search]);

    const renderView = () => {
        if (view === 'new') return <NewAssetView onNavigate={() => setView('all')} />;

        return <AssetListAndPPEView initialView={view} onNavigate={setView} />;
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Asset Management</h1>
                <div className="flex space-x-2">
                     <Button variant={view !== 'new' ? 'primary' : 'ghost'} onClick={() => setView('all')} icon={<ListChecksIcon className="h-4 w-4" />}>Asset List</Button>
                     {view !== 'new' && <Button onClick={() => setView('new')} icon={<PlusIcon className="h-4 w-4 mr-2" />}>New Asset</Button>}
                </div>
            </div>
            {renderView()}
        </div>
    );
};

const AssetListAndPPEView: React.FC<{ initialView: 'all' | 'ppe'; onNavigate: (view: 'all' | 'ppe' | 'new') => void }> = ({ initialView, onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'all' | 'ppe'>(initialView);
    // This component will contain the logic for both lists and just switch between them.
    // To keep it simpler, let's reuse the AssetListView and create a PPE view.
    const [allAssets, setAllAssets] = useState<ProcessedAsset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [assetForPrint, setAssetForPrint] = useState<Asset|null>(null);

    const fetchData = useCallback(() => {
        setIsLoading(true);
        Promise.all([api.getAssets(), api.getConsumables()])
            .then(([assetsData, consumablesData]) => {
                setAllAssets(processAssets(assetsData, consumablesData));
            }).finally(() => setIsLoading(false));
    }, []);

    useEffect(() => { fetchData() }, [fetchData]);

    const ppeAssets = useMemo(() => allAssets.filter(a => a.category === 'PPE'), [allAssets]);
    
    if (isLoading) {
        return <Card><div className="text-center p-8 text-dark-text-secondary">Loading Assets...</div></Card>;
    }

    return (
        <div>
            <div className="mb-4">
                 <Button variant={activeTab === 'all' ? 'primary' : 'ghost'} onClick={() => setActiveTab('all')} className="rounded-r-none">All Assets</Button>
                 <Button variant={activeTab === 'ppe' ? 'primary' : 'ghost'} onClick={() => setActiveTab('ppe')} className="rounded-l-none">PPE Compliance</Button>
            </div>
            {activeTab === 'all' && <AssetListView onNavigate={() => {}} />}
            {activeTab === 'ppe' && <Card><PPEComplianceView assets={ppeAssets} onPrint={setAssetForPrint} /></Card>}
            <PrintLabelModal asset={assetForPrint} onClose={() => setAssetForPrint(null)} />
        </div>
    );
};

export default Assets;