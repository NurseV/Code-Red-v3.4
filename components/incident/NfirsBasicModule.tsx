

import React, { useState, useEffect } from 'react';
import { NfirsBasicModule as NfirsBasicModuleType } from '../../types';
import Accordion from '../ui/Accordion';
import { NFIRS_INCIDENT_TYPES } from '../../constants/nfirs-codes';
import { FormRow, Label, Input, Select, Textarea } from './modules/SharedFormControls';
import Combobox from '../ui/Combobox';
import { BookOpenIcon, MapPinIcon, AlertTriangleIcon, ClockIcon, DollarSignIcon, MessageSquareIcon } from '../icons/Icons';

interface NfirsBasicModuleProps {
    incidentData: NfirsBasicModuleType;
    onUpdate: (data: NfirsBasicModuleType) => void;
    isLocked: boolean;
    errors: Record<string, string>;
}

const NfirsBasicModule: React.FC<NfirsBasicModuleProps> = ({ incidentData, onUpdate, isLocked, errors }) => {
    
    const [data, setData] = useState(incidentData);
    
    useEffect(() => {
        setData(incidentData);
    }, [incidentData]);

    const handleChange = (section: keyof NfirsBasicModuleType, field: string, value: any) => {
        const sectionData = data[section];
        if (typeof sectionData === 'object' && sectionData !== null) {
            const updatedSection = { ...sectionData, [field]: value };
            const updatedData = { ...data, [section]: updatedSection };
            setData(updatedData);
            onUpdate(updatedData);
        }
    };
    
    const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // This handles both simple properties and nested section properties
        if (name.includes('.')) {
            const [section, field] = name.split('.');
            handleChange(section as keyof NfirsBasicModuleType, field, value);
        } else {
            const updatedData = { ...data, [name]: value };
            setData(updatedData);
            onUpdate(updatedData);
        }
    };

    const incidentTypeOptions = NFIRS_INCIDENT_TYPES.map(type => ({
        value: type.code,
        label: `${type.code} - ${type.description}`
    }));

    return (
        <div className="space-y-4">
            <Accordion title="A: Identification" defaultOpen={true} icon={<BookOpenIcon className="h-5 w-5" />}>
                <FormRow>
                    <Label htmlFor="sectionA.fdid">FDID</Label>
                    <Input id="sectionA.fdid" name="sectionA.fdid" value={data.sectionA.fdid || ''} onChange={handleSimpleChange} disabled={isLocked} error={errors['sectionA.fdid']} />
                </FormRow>
                <FormRow>
                     <Label htmlFor="sectionA.incidentNumber">Incident Number</Label>
                    <Input id="sectionA.incidentNumber" name="sectionA.incidentNumber" value={data.sectionA.incidentNumber || ''} readOnly className="bg-dark-bg/50" />
                </FormRow>
                 <FormRow>
                     <Label htmlFor="sectionA.incidentDate">Incident Date</Label>
                    <Input id="sectionA.incidentDate" name="sectionA.incidentDate" type="date" value={data.sectionA.incidentDate || ''} onChange={handleSimpleChange} disabled={isLocked} error={errors['sectionA.incidentDate']} />
                </FormRow>
            </Accordion>

            <Accordion title="B: Location" icon={<MapPinIcon className="h-5 w-5" />}>
                 <FormRow>
                    <Label htmlFor="sectionB.streetOrHighwayName">Street/Highway</Label>
                    <Input id="sectionB.streetOrHighwayName" name="sectionB.streetOrHighwayName" value={data.sectionB.streetOrHighwayName || ''} onChange={handleSimpleChange} disabled={isLocked} placeholder="e.g., Main St" error={errors['sectionB.streetOrHighwayName']} />
                </FormRow>
                 <FormRow>
                    <Label htmlFor="sectionB.city">City</Label>
                    <Input id="sectionB.city" name="sectionB.city" value={data.sectionB.city || ''} onChange={handleSimpleChange} disabled={isLocked} placeholder="e.g., Anytown" />
                </FormRow>
            </Accordion>
            
            <Accordion title="C: Incident Type" icon={<AlertTriangleIcon className="h-5 w-5" />}>
                 <FormRow>
                    <Label htmlFor="incidentType">Incident Type</Label>
                    <Combobox
                        options={incidentTypeOptions}
                        value={data.incidentType || ''}
                        onChange={(value) => handleSimpleChange({ target: { name: 'incidentType', value } } as any)}
                        disabled={isLocked}
                        error={errors['incidentType']}
                        placeholder="Search by code or description..."
                    />
                </FormRow>
            </Accordion>
            
            <Accordion title="E: Dates & Times" icon={<ClockIcon className="h-5 w-5" />}>
                <FormRow>
                    <Label htmlFor="sectionE.alarmDateTime">Alarm</Label>
                    <Input id="sectionE.alarmDateTime" name="sectionE.alarmDateTime" type="datetime-local" value={data.sectionE.alarmDateTime || ''} onChange={handleSimpleChange} disabled={isLocked} error={errors['sectionE.alarmDateTime']} />
                </FormRow>
                 <FormRow>
                    <Label htmlFor="sectionE.arrivalDateTime">Arrival</Label>
                    <Input id="sectionE.arrivalDateTime" name="sectionE.arrivalDateTime" type="datetime-local" value={data.sectionE.arrivalDateTime || ''} onChange={handleSimpleChange} disabled={isLocked} />
                </FormRow>
                <FormRow>
                    <Label htmlFor="sectionE.controlledDateTime">Controlled</Label>
                    <Input id="sectionE.controlledDateTime" name="sectionE.controlledDateTime" type="datetime-local" value={data.sectionE.controlledDateTime || ''} onChange={handleSimpleChange} disabled={isLocked} />
                </FormRow>
                 <FormRow>
                    <Label htmlFor="sectionE.lastUnitClearedDateTime">Last Unit Cleared</Label>
                    <Input id="sectionE.lastUnitClearedDateTime" name="sectionE.lastUnitClearedDateTime" type="datetime-local" value={data.sectionE.lastUnitClearedDateTime || ''} onChange={handleSimpleChange} disabled={isLocked} />
                </FormRow>
                 <FormRow>
                    <Label htmlFor="sectionE.specialStudies">Special Studies</Label>
                    <Input id="sectionE.specialStudies" name="sectionE.specialStudies" value={data.sectionE.specialStudies || ''} onChange={handleSimpleChange} disabled={isLocked} error={errors['sectionE.specialStudies']} />
                </FormRow>
            </Accordion>
            
             <Accordion title="G: Resources & Losses" icon={<DollarSignIcon className="h-5 w-5" />}>
                <FormRow>
                    <Label htmlFor="sectionG.apparatusCount">Apparatus Count</Label>
                    <Input id="sectionG.apparatusCount" name="sectionG.apparatusCount" type="number" value={data.sectionG.apparatusCount || 0} readOnly disabled className="bg-dark-bg/50" />
                </FormRow>
                <FormRow>
                    <Label htmlFor="sectionG.personnelSuppression">Personnel Count</Label>
                    <Input id="sectionG.personnelSuppression" name="sectionG.personnelSuppression" type="number" value={data.sectionG.personnelSuppression || 0} readOnly disabled className="bg-dark-bg/50" />
                </FormRow>
                <FormRow>
                    <Label htmlFor="sectionG.propertyLoss">Property Loss ($)</Label>
                    <Input id="sectionG.propertyLoss" name="sectionG.propertyLoss" type="number" value={data.sectionG.propertyLoss || ''} onChange={handleSimpleChange} disabled={isLocked} />
                </FormRow>
                <FormRow>
                    <Label htmlFor="sectionG.contentsLoss">Contents Loss ($)</Label>
                    <Input id="sectionG.contentsLoss" name="sectionG.contentsLoss" type="number" value={data.sectionG.contentsLoss || ''} onChange={handleSimpleChange} disabled={isLocked} />
                </FormRow>
                 <FormRow>
                    <Label htmlFor="sectionG.propertyValue">Pre-Incident Property Value ($)</Label>
                    <Input id="sectionG.propertyValue" name="sectionG.propertyValue" type="number" value={data.sectionG.propertyValue || ''} onChange={handleSimpleChange} disabled={isLocked} error={errors['sectionG.propertyValue']} />
                </FormRow>
                <FormRow>
                    <Label htmlFor="sectionG.contentsValue">Pre-Incident Contents Value ($)</Label>
                    <Input id="sectionG.contentsValue" name="sectionG.contentsValue" type="number" value={data.sectionG.contentsValue || ''} onChange={handleSimpleChange} disabled={isLocked} error={errors['sectionG.contentsValue']} />
                </FormRow>
                <FormRow>
                    <Label htmlFor="casualtiesCivilian">Civilian Casualties</Label>
                    <Input id="casualtiesCivilian" name="sectionH.casualtiesCivilian" type="number" value={data.sectionH?.casualtiesCivilian || 0} readOnly disabled className="bg-dark-bg/50" />
                </FormRow>
                <FormRow>
                    <Label htmlFor="casualtiesFire">Fire Service Casualties</Label>
                    <Input id="casualtiesFire" name="sectionH.casualtiesFire" type="number" value={data.sectionH?.casualtiesFire || 0} readOnly disabled className="bg-dark-bg/50" />
                </FormRow>
            </Accordion>

            <Accordion title="L: Remarks / Narrative" icon={<MessageSquareIcon className="h-5 w-5" />}>
                 <FormRow>
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea id="remarks" name="remarks" rows={6} value={data.remarks || ''} onChange={handleSimpleChange} disabled={isLocked} />
                </FormRow>
            </Accordion>

        </div>
    );
};

export default NfirsBasicModule;
