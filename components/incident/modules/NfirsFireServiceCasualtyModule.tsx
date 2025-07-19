import React from 'react';
import { NfirsFireServiceCasualty, NfirsModuleSectionA } from '../../../types';
import Button from '../../ui/Button';
import { PlusIcon, XIcon } from '../../icons/Icons';
import { FormRow, Label, Input, Select } from './SharedFormControls';

interface Props {
    casualties: NfirsFireServiceCasualty[];
    onUpdate: (data: NfirsFireServiceCasualty[]) => void;
    isLocked: boolean;
    basicInfo: NfirsModuleSectionA;
}

const CasualtyForm: React.FC<{ casualty: NfirsFireServiceCasualty, onUpdate: (data: NfirsFireServiceCasualty) => void, onDelete: () => void, isLocked: boolean }> = ({ casualty, onUpdate, onDelete, isLocked }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onUpdate({ ...casualty, [name]: value });
    };

    const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const [section, field] = name.split('.');
        if (section === 'protectiveEquipment') {
            onUpdate({ ...casualty, protectiveEquipment: { ...casualty.protectiveEquipment, [field]: value } });
        }
    };

    return (
        <div className="space-y-4 p-4 border border-dark-border rounded-lg relative">
            {!isLocked && (
                <Button variant="danger" className="absolute top-2 right-2 p-1 h-7 w-7" onClick={onDelete}>
                    <XIcon className="h-4 w-4" />
                </Button>
            )}
            <FormRow>
                <Label htmlFor={`personnelId-${casualty.id}`}>Personnel ID</Label>
                <Input id={`personnelId-${casualty.id}`} name="personnelId" value={casualty.personnelId} onChange={handleChange} disabled={isLocked} placeholder="e.g., p-001" />
            </FormRow>
             <FormRow>
                <Label htmlFor={`age-${casualty.id}`}>Age</Label>
                <Input id={`age-${casualty.id}`} name="age" type="number" value={casualty.age || ''} onChange={handleChange} disabled={isLocked} className="md:col-span-1" />
            </FormRow>
             <FormRow>
                <Label htmlFor={`gender-${casualty.id}`}>Gender</Label>
                <Select id={`gender-${casualty.id}`} name="gender" value={casualty.gender} onChange={handleChange} disabled={isLocked} className="md:col-span-1">
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                </Select>
            </FormRow>
             <FormRow>
                <Label htmlFor={`severity-${casualty.id}`}>Severity</Label>
                <Input id={`severity-${casualty.id}`} name="severity" value={casualty.severity} onChange={handleChange} disabled={isLocked} />
            </FormRow>
             <FormRow>
                <Label htmlFor={`causeOfInjury-${casualty.id}`}>Cause of Injury</Label>
                <Input id={`causeOfInjury-${casualty.id}`} name="causeOfInjury" value={casualty.causeOfInjury} onChange={handleChange} disabled={isLocked} />
            </FormRow>
            <FormRow>
                <Label htmlFor={`protectiveEquipment.problem-${casualty.id}`}>Protective Equip. Problem</Label>
                <Input id={`protectiveEquipment.problem-${casualty.id}`} name="protectiveEquipment.problem" value={casualty.protectiveEquipment?.problem || ''} onChange={handleNestedChange} disabled={isLocked} />
            </FormRow>
        </div>
    );
}

const NfirsFireServiceCasualtyModule: React.FC<Props> = ({ casualties, onUpdate, isLocked, basicInfo }) => {
    const handleAddCasualty = () => {
        const newCasualty: NfirsFireServiceCasualty = {
            id: `fs-cas-${Date.now()}`,
            sectionA: basicInfo,
            personnelId: '',
            casualtyNumber: casualties.length + 1,
            gender: 'M',
            age: 0,
            affiliation: '',
            injuryDateTime: '',
            priorResponses: 0,
            usualAssignment: '',
            physicalCondition: '',
            severity: '',
            takenTo: '',
            activityAtInjury: '',
            primarySymptom: '',
            primaryBodyPart: '',
            causeOfInjury: '',
            contributingFactors: [],
            objectInvolved: '',
            injuryLocation: { whereOccurred: '', story: '', specificLocation: '' },
            protectiveEquipment: { sequenceNumber: casualties.length + 1 },
        };
        onUpdate([...casualties, newCasualty]);
    };

    const handleUpdateCasualty = (updatedCasualty: NfirsFireServiceCasualty) => {
        const newCasualties = casualties.map(c => c.id === updatedCasualty.id ? updatedCasualty : c);
        onUpdate(newCasualties);
    };

    const handleDeleteCasualty = (id: string) => {
        if (window.confirm("Are you sure you want to remove this casualty report?")) {
            onUpdate(casualties.filter(c => c.id !== id));
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-dark-text">Fire Service Casualties</h2>
                 {!isLocked && (
                    <Button onClick={handleAddCasualty} icon={<PlusIcon className="h-4 w-4 mr-2" />}>
                        Add Casualty
                    </Button>
                 )}
            </div>
            {casualties.length === 0 ? (
                <p className="text-center text-dark-text-secondary py-8">No fire service casualties have been added.</p>
            ) : (
                casualties.map((casualty) => (
                    <CasualtyForm key={casualty.id} casualty={casualty} onUpdate={handleUpdateCasualty} onDelete={() => handleDeleteCasualty(casualty.id)} isLocked={isLocked}/>
                ))
            )}
        </div>
    );
};

export default NfirsFireServiceCasualtyModule;