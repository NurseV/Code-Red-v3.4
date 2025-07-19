
import React from 'react';
import { NfirsArsonModule as NfirsArsonModuleType, NfirsModuleSectionA } from '../../../types';
import Accordion from '../../ui/Accordion';
import { FormRow, Label, Input, Select } from './SharedFormControls';

interface Props {
    moduleData: NfirsArsonModuleType;
    onUpdate: (data: NfirsArsonModuleType) => void;
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

const NfirsArsonModule: React.FC<Props> = ({ moduleData, onUpdate, isLocked, errors, basicInfo }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'motivationFactors') {
            onUpdate({ ...moduleData, motivationFactors: value.split(',').map(s => s.trim()) });
        } else {
             onUpdate({ ...moduleData, [name]: value });
        }
    };

    return (
        <div className="space-y-4">
            <ModuleHeader info={basicInfo} />
            <Accordion title="C: Case Status" defaultOpen>
                <FormRow>
                    <Label htmlFor="caseStatus">Case Status</Label>
                    <Select id="caseStatus" name="caseStatus" value={moduleData.caseStatus || ''} onChange={handleChange} disabled={isLocked} className="md:col-span-1">
                        <option value="">Select...</option>
                        <option value="Open">Open/Under Investigation</option>
                        <option value="Closed">Closed</option>
                    </Select>
                </FormRow>
            </Accordion>
            <Accordion title="D/E: Material & Motivation">
                 <FormRow>
                    <Label htmlFor="availabilityOfMaterial">Availability of Material First Ignited</Label>
                    <Input id="availabilityOfMaterial" name="availabilityOfMaterial" value={moduleData.availabilityOfMaterial || ''} onChange={handleChange} disabled={isLocked} />
                </FormRow>
                 <FormRow>
                    <Label htmlFor="motivationFactors">Suspected Motivation Factors</Label>
                    <Input id="motivationFactors" name="motivationFactors" value={moduleData.motivationFactors?.join(', ') || ''} onChange={handleChange} disabled={isLocked} placeholder="e.g., Revenge, Vandalism" />
                </FormRow>
            </Accordion>
             <Accordion title="J: Property Ownership">
                <FormRow>
                    <Label htmlFor="propertyOwnership">Property Ownership</Label>
                    <Input id="propertyOwnership" name="propertyOwnership" value={moduleData.propertyOwnership || ''} onChange={handleChange} disabled={isLocked} />
                </FormRow>
            </Accordion>
        </div>
    );
};

export default NfirsArsonModule;
