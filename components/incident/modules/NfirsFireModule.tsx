
import React from 'react';
import { NfirsFireModule as NfirsFireModuleType, NfirsModuleSectionA } from '../../../types';
import Accordion from '../../ui/Accordion';
import { FormRow, Label, Input, Select, Textarea } from './SharedFormControls';

interface Props {
    moduleData: NfirsFireModuleType;
    onUpdate: (data: NfirsFireModuleType) => void;
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

const NfirsFireModule: React.FC<Props> = ({ moduleData, onUpdate, isLocked, errors, basicInfo }) => {
    
    const handleChange = (section: keyof NfirsFireModuleType, field: string, value: any) => {
        const updatedSection = { ...moduleData[section], [field]: value };
        const updatedData = { ...moduleData, [section]: updatedSection };
        onUpdate(updatedData);
    };

    const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const [section, field] = name.split('.');
        handleChange(section as keyof NfirsFireModuleType, field, value);
    };

    return (
        <div className="space-y-4">
            <ModuleHeader info={basicInfo} />
            <Accordion title="B: Property Details" defaultOpen>
                 <FormRow>
                    <Label htmlFor="propertyDetails.residentialUnits"># of Residential Units</Label>
                    <Input id="propertyDetails.residentialUnits" name="propertyDetails.residentialUnits" type="number" value={moduleData.propertyDetails.residentialUnits || ''} onChange={handleSimpleChange} disabled={isLocked} className="md:col-span-1" />
                </FormRow>
                <FormRow>
                    <Label htmlFor="propertyDetails.buildingsInvolved"># of Buildings Involved</Label>
                    <Input id="propertyDetails.buildingsInvolved" name="propertyDetails.buildingsInvolved" type="number" value={moduleData.propertyDetails.buildingsInvolved || ''} onChange={handleSimpleChange} disabled={isLocked} className="md:col-span-1" />
                </FormRow>
                <FormRow>
                    <Label htmlFor="propertyDetails.acresBurned"># of Acres Burned</Label>
                    <Input id="propertyDetails.acresBurned" name="propertyDetails.acresBurned" type="number" step="0.1" value={moduleData.propertyDetails.acresBurned || ''} onChange={handleSimpleChange} disabled={isLocked} className="md:col-span-1" />
                </FormRow>
            </Accordion>
             <Accordion title="D: Ignition">
                 <FormRow>
                    <Label htmlFor="ignition.areaOfOrigin">Area of Fire Origin</Label>
                    <Input id="ignition.areaOfOrigin" name="ignition.areaOfOrigin" value={moduleData.ignition.areaOfOrigin || ''} onChange={handleSimpleChange} disabled={isLocked} error={errors['ignition.areaOfOrigin']} />
                </FormRow>
                 <FormRow>
                    <Label htmlFor="ignition.heatSource">Heat Source</Label>
                    <Input id="ignition.heatSource" name="ignition.heatSource" value={moduleData.ignition.heatSource || ''} onChange={handleSimpleChange} disabled={isLocked} error={errors['ignition.heatSource']} />
                </FormRow>
                 <FormRow>
                    <Label htmlFor="ignition.itemFirstIgnited">Item First Ignited</Label>
                    <Input id="ignition.itemFirstIgnited" name="ignition.itemFirstIgnited" value={moduleData.ignition.itemFirstIgnited || ''} onChange={handleSimpleChange} disabled={isLocked} error={errors['ignition.itemFirstIgnited']} />
                </FormRow>
            </Accordion>
             <Accordion title="E: Cause of Ignition">
                 <FormRow>
                    <Label htmlFor="causeOfIgnition.cause">Cause of Ignition</Label>
                    <Input id="causeOfIgnition.cause" name="causeOfIgnition.cause" value={moduleData.causeOfIgnition.cause || ''} onChange={handleSimpleChange} disabled={isLocked} />
                </FormRow>
                 <FormRow>
                    <Label>Human Factors</Label>
                    <Input id="causeOfIgnition.humanFactors" name="causeOfIgnition.humanFactors" value={moduleData.causeOfIgnition.humanFactors?.join(', ') || ''} onChange={e => handleChange('causeOfIgnition', 'humanFactors', e.target.value.split(',').map(s => s.trim()))} disabled={isLocked} placeholder="e.g., Asleep, Unattended person" />
                </FormRow>
            </Accordion>
        </div>
    );
};

export default NfirsFireModule;
