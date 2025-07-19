import React from 'react';
import { NfirsHazmatModule as NfirsHazmatModuleType, NfirsModuleSectionA } from '../../../types';
import Accordion from '../../ui/Accordion';
import { FormRow, Label, Input } from './SharedFormControls';

interface Props {
    moduleData: NfirsHazmatModuleType;
    onUpdate: (data: NfirsHazmatModuleType) => void;
    isLocked: boolean;
    errors: Record<string, string>;
    basicInfo: NfirsModuleSectionA;
}

const ModuleHeader: React.FC<{info: NfirsModuleSectionA}> = ({info}) => (
    <div className="bg-dark-bg p-3 rounded-md border border-dark-border mb-4 flex justify-between text-sm">
        <div><span className="font-semibold text-dark-text-secondary">FDID:</span> {info.fdid}</div>
        <div><span className="font-semibold text-dark-text-secondary">Incident #:</span> {info.incidentNumber}</div>
        <div><span className="font-semibold text-dark-text-secondary">Date:</span> {info.incidentDate}</div>
    </div>
);


const NfirsHazmatModule: React.FC<Props> = ({ moduleData, onUpdate, isLocked, errors, basicInfo }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'actionsTaken') {
            onUpdate({ ...moduleData, actionsTaken: value.split(',').map(s => s.trim()) });
        } else {
            onUpdate({ ...moduleData, [name]: value });
        }
    };
    
    const handleNestedChange = (section: keyof NfirsHazmatModuleType, field: string, value: any) => {
        const sectionData = moduleData[section];
        if (typeof sectionData === 'object' && sectionData !== null && !Array.isArray(sectionData)) {
            const updatedSection = { ...sectionData, [field]: value };
            onUpdate({ ...moduleData, [section]: updatedSection });
        }
    };

    return (
        <div className="space-y-4">
            <ModuleHeader info={basicInfo} />
            <Accordion title="B: Hazardous Material ID" defaultOpen>
                <FormRow>
                    <Label htmlFor="unNumber">UN/NA ID Number</Label>
                    <Input id="unNumber" name="hazmatId.unNumber" value={moduleData.hazmatId?.unNumber || ''} onChange={e => handleNestedChange('hazmatId', 'unNumber', e.target.value)} disabled={isLocked} className="md:col-span-1" />
                </FormRow>
                <FormRow>
                    <Label htmlFor="chemicalName">Chemical Name</Label>
                    <Input id="chemicalName" name="hazmatId.chemicalName" value={moduleData.hazmatId?.chemicalName || ''} onChange={e => handleNestedChange('hazmatId', 'chemicalName', e.target.value)} disabled={isLocked} />
                </FormRow>
            </Accordion>
            <Accordion title="C: Container">
                <FormRow>
                    <Label htmlFor="containerType">Container Type</Label>
                    <Input id="containerType" name="container.type" value={moduleData.container?.type || ''} onChange={e => handleNestedChange('container', 'type', e.target.value)} disabled={isLocked} />
                </FormRow>
            </Accordion>
             <Accordion title="D: Amount Released">
                <FormRow>
                    <Label htmlFor="amountReleased">Estimated Amount Released</Label>
                    <Input id="amountReleased" name="release.amount" type="number" value={moduleData.release?.amount || ''} onChange={e => handleNestedChange('release', 'amount', Number(e.target.value))} disabled={isLocked} className="md:col-span-1" />
                </FormRow>
                 <FormRow>
                    <Label htmlFor="units">Units</Label>
                    <Input id="units" name="release.units" value={moduleData.release?.units || ''} onChange={e => handleNestedChange('release', 'units', e.target.value)} disabled={isLocked} className="md:col-span-1" placeholder="e.g., Gallons, Liters" />
                </FormRow>
            </Accordion>
             <Accordion title="H: Actions Taken">
                 <FormRow>
                    <Label htmlFor="actionsTaken">Actions Taken</Label>
                    <Input id="actionsTaken" name="actionsTaken" value={moduleData.actionsTaken?.join(', ') || ''} onChange={handleChange} disabled={isLocked} placeholder="e.g., Dike, Evacuate" />
                </FormRow>
            </Accordion>
        </div>
    );
};

export default NfirsHazmatModule;