
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import * as api from '../services/api';
import { Apparatus, ApparatusStatus } from '../types';

// Helper for form inputs
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; helperText?: string }> = ({ label, error, helperText, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-dark-text-secondary mb-1">{label}</label>
        <input {...props} className={`block w-full bg-dark-bg border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none sm:text-sm ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-dark-border focus:ring-brand-primary focus:border-brand-primary'}`} />
        {helperText && <p className="mt-1 text-xs text-dark-text-secondary">{helperText}</p>}
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }> = ({ label, children, error, ...props }) => (
    <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-dark-text-secondary mb-1">{label}</label>
        <select {...props} className={`block w-full bg-dark-bg border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none sm:text-sm ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-dark-border focus:ring-brand-primary focus:border-brand-primary'}`}>
            {children}
        </select>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
);

const SectionCard: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="bg-dark-bg border border-dark-border/50 rounded-lg">
        <h3 className="text-lg font-semibold text-dark-text px-6 py-3 border-b border-dark-border/50">{title}</h3>
        <div className="p-6 space-y-4">
            {children}
        </div>
    </div>
);

// --- Wizard Steps ---

const Step1CoreDetails: React.FC<{ formData: Partial<Apparatus>; setFormData: React.Dispatch<React.SetStateAction<Partial<Apparatus>>>; errors: Record<string, string>; }> = ({ formData, setFormData, errors }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'number' && value !== '' ? Number(value) : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    return (
        <div className="space-y-6">
            <SectionCard title="Identification">
                <Input label="Unit ID" id="unitId" name="unitId" value={formData.unitId || ''} onChange={handleChange} required error={errors.unitId}/>
                <Select label="Type" id="type" name="type" value={formData.type} onChange={handleChange}>
                    <option>Engine</option>
                    <option>Ladder</option>
                    <option>Rescue</option>
                    <option>Tanker</option>
                    <option>Brush Truck</option>
                </Select>
                <Select label="Initial Status" id="status" name="status" value={formData.status} onChange={handleChange}>
                    {Object.values(ApparatusStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
            </SectionCard>

            <SectionCard title="Vehicle Details">
                <>
                    <Input label="Make" id="make" name="make" value={formData.make || ''} onChange={handleChange} list="makes" />
                     <datalist id="makes">
                        <option value="Pierce" />
                        <option value="E-One" />
                        <option value="Sutphen" />
                        <option value="Rosenbauer" />
                        <option value="Ferrara" />
                        <option value="KME" />
                        <option value="Ford" />
                        <option value="Freightliner" />
                    </datalist>
                </>
                <Input label="Model" id="model" name="model" value={formData.model || ''} onChange={handleChange} />
                <Input label="Year" id="year" name="year" type="number" min="1950" max={new Date().getFullYear() + 1} value={formData.year || ''} onChange={handleChange} />
                <Input label="VIN" id="vin" name="vin" value={formData.vin || ''} onChange={handleChange} error={errors.vin} helperText="Must be 17 characters." />
            </SectionCard>

             <SectionCard title="Acquisition">
                <Input label="Purchase Date" id="purchaseDate" name="purchaseDate" type="date" value={formData.purchaseDate || ''} onChange={handleChange} />
                <Input label="Purchase Price" id="purchasePrice" name="purchasePrice" type="number" step="0.01" placeholder="e.g., 750000.00" value={formData.purchasePrice ?? ''} onChange={handleChange}/>
             </SectionCard>
        </div>
    );
};

const Step2Specifications: React.FC<{ formData: Partial<Apparatus>; setFormData: React.Dispatch<React.SetStateAction<Partial<Apparatus>>>; }> = ({ formData, setFormData }) => {

    const handleSpecChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            specifications: {
                ...prev.specifications,
                [name]: value === '' ? undefined : Number(value)
            }
        }));
    };

    return (
        <SectionCard title="Technical Specifications">
            <Input label="Pump Capacity (GPM)" id="pumpCapacityGPM" name="pumpCapacityGPM" type="number" placeholder="e.g., 1500" value={formData.specifications?.pumpCapacityGPM ?? ''} onChange={handleSpecChange} />
            <Input label="Water Tank Size (Gallons)" id="waterTankSizeGallons" name="waterTankSizeGallons" type="number" placeholder="e.g., 750" value={formData.specifications?.waterTankSizeGallons ?? ''} onChange={handleSpecChange} />
            <Input label="Foam Tank Size (Gallons)" id="foamTankSizeGallons" name="foamTankSizeGallons" type="number" placeholder="e.g., 30" value={formData.specifications?.foamTankSizeGallons ?? ''} onChange={handleSpecChange} />
        </SectionCard>
    );
};

const Step3Review: React.FC<{ formData: Partial<Apparatus> }> = ({ formData }) => {
    const DetailItem: React.FC<{label: string, value: React.ReactNode}> = ({label, value}) => (
        <div className="py-2 border-b border-dark-border/50">
            <p className="text-sm text-dark-text-secondary">{label}</p>
            <p className="font-semibold text-dark-text">{value || 'N/A'}</p>
        </div>
    );
    return (
        <SectionCard title="Review & Submit">
            <p className="text-dark-text-secondary mb-4">Please review the information below before creating the new apparatus.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <DetailItem label="Unit ID" value={formData.unitId} />
                <DetailItem label="Type" value={formData.type} />
                <DetailItem label="Make & Model" value={`${formData.make || ''} ${formData.model || ''}`} />
                <DetailItem label="Year" value={formData.year} />
                <DetailItem label="VIN" value={formData.vin} />
                <DetailItem label="Purchase Date" value={formData.purchaseDate} />
                <DetailItem label="Purchase Price" value={formData.purchasePrice ? `$${Number(formData.purchasePrice).toLocaleString()}` : 'N/A'} />
                <DetailItem label="Pump Capacity" value={formData.specifications?.pumpCapacityGPM ? `${formData.specifications.pumpCapacityGPM} GPM` : 'N/A'} />
                <DetailItem label="Water Tank" value={formData.specifications?.waterTankSizeGallons ? `${formData.specifications.waterTankSizeGallons} gal` : 'N/A'} />
            </div>
        </SectionCard>
    );
};

// --- Main Component ---

const NewApparatus: React.FC = () => {
    const navigate = ReactRouterDOM.useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<Partial<Apparatus>>({
        unitId: '',
        type: 'Engine',
        status: ApparatusStatus.IN_SERVICE,
        vin: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: undefined,
        specifications: {
            pumpCapacityGPM: undefined,
            waterTankSizeGallons: undefined,
            foamTankSizeGallons: undefined,
        }
    });

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.unitId) newErrors.unitId = "Unit ID is required.";
        if (formData.vin && formData.vin.length !== 17) newErrors.vin = "VIN must be 17 characters.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1) {
            if (validateStep1()) {
                setStep(2);
            }
        } else if (step < 3) {
            setStep(s => s + 1);
        }
    };

    const handleBack = () => {
        setStep(s => s - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.createApparatus(formData);
            alert("Apparatus created successfully!");
            navigate('/app/apparatus');
        } catch (error) {
            alert('Failed to create apparatus.');
            setIsSubmitting(false);
        }
    };
    
    const STEPS = [
        { title: "Core Details", component: <Step1CoreDetails formData={formData} setFormData={setFormData} errors={errors} /> },
        { title: "Specifications", component: <Step2Specifications formData={formData} setFormData={setFormData} /> },
        { title: "Review & Submit", component: <Step3Review formData={formData} /> }
    ];

    return (
        <Card title={`Add New Apparatus - Step ${step}: ${STEPS[step - 1].title}`}>
            <form onSubmit={handleSubmit}>
                <div className="py-6">
                    {STEPS[step - 1].component}
                </div>

                {/* Navigation Buttons */}
                <div className="pt-5 border-t border-dark-border">
                    {step < STEPS.length ? (
                        <div className="flex justify-between items-center">
                            <div>
                                {step > 1 && (
                                    <Button type="button" variant="ghost" onClick={handleBack}>
                                        Back
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center space-x-3">
                                <Button type="button" variant="ghost" onClick={() => navigate('/app/apparatus')}>
                                    Cancel
                                </Button>
                                <Button type="button" variant="primary" onClick={handleNext}>
                                    Next
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
                                Add Apparatus
                            </Button>
                            <div className="flex justify-between items-center">
                                 <Button type="button" variant="ghost" onClick={handleBack}>
                                    Back
                                </Button>
                                 <Button type="button" variant="ghost" onClick={() => navigate('/app/apparatus')}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </Card>
    );
};

export default NewApparatus;
