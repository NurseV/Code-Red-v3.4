

import React from 'react';
import { NfirsStructureFireModule as NfirsStructureFireModuleType, NfirsModuleSectionA } from '../../../types';
import Accordion from '../../ui/Accordion';
import { FormRow, Label, Input, Select } from './SharedFormControls';

interface Props {
    moduleData: NfirsStructureFireModuleType;
    onUpdate: (data: NfirsStructureFireModuleType) => void;
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

const NfirsStructureFireModule: React.FC<Props> = ({ moduleData, onUpdate, isLocked, errors, basicInfo }) => {
    
    const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onUpdate({ ...moduleData, [name]: value });
    };

    const handleNestedChange = (section: 'detectors' | 'extinguishingSystem', field: string, value: any) => {
        const updatedSection = { ...moduleData[section], [field]: value };
        onUpdate({ ...moduleData, [section]: updatedSection });
    };

    return (
        <div className="space-y-4">
            <ModuleHeader info={basicInfo} />
            <Accordion title="I: Structure Type" defaultOpen>
                 <FormRow>
                    <Label htmlFor="structureType">Structure Type</Label>
                    <Input id="structureType" name="structureType" value={moduleData.structureType || ''} onChange={handleSimpleChange} disabled={isLocked} error={errors['structureType']} />
                </FormRow>
                 <FormRow>
                    <Label htmlFor="buildingStatus">Building Status</Label>
                    <Input id="buildingStatus" name="buildingStatus" value={moduleData.buildingStatus || ''} onChange={handleSimpleChange} disabled={isLocked} />
                </FormRow>
            </Accordion>
            <Accordion title="L: Detectors">
                 <FormRow>
                    <Label htmlFor="detectors.presence">Detector Presence</Label>
                    <Select id="detectors.presence" value={moduleData.detectors.presence || ''} onChange={e => handleNestedChange('detectors', 'presence', e.target.value)} disabled={isLocked}>
                        <option value="">Select...</option>
                        <option value="1">Present</option>
                        <option value="2">Not Present</option>
                    </Select>
                </FormRow>
                 <FormRow>
                    <Label htmlFor="detectors.type">Detector Type</Label>
                    <Input id="detectors.type" value={moduleData.detectors.type || ''} onChange={e => handleNestedChange('detectors', 'type', e.target.value)} disabled={isLocked} error={errors['detectors.type']}/>
                </FormRow>
                 <FormRow>
                    <Label htmlFor="detectors.powerSupply">Power Supply</Label>
                    <Input id="detectors.powerSupply" value={moduleData.detectors.powerSupply || ''} onChange={e => handleNestedChange('detectors', 'powerSupply', e.target.value)} disabled={isLocked} error={errors['detectors.powerSupply']}/>
                </FormRow>
                 <FormRow>
                    <Label htmlFor="detectors.operation">Detector Operation</Label>
                    <Input id="detectors.operation" value={moduleData.detectors.operation || ''} onChange={e => handleNestedChange('detectors', 'operation', e.target.value)} disabled={isLocked} error={errors['detectors.operation']}/>
                </FormRow>
                 <FormRow>
                    <Label htmlFor="detectors.effectiveness">Effectiveness</Label>
                    <Input id="detectors.effectiveness" value={moduleData.detectors.effectiveness || ''} onChange={e => handleNestedChange('detectors', 'effectiveness', e.target.value)} disabled={isLocked} error={errors['detectors.effectiveness']}/>
                </FormRow>
                 <FormRow>
                    <Label htmlFor="detectors.failureReason">Failure Reason</Label>
                    <Input id="detectors.failureReason" value={moduleData.detectors.failureReason || ''} onChange={e => handleNestedChange('detectors', 'failureReason', e.target.value)} disabled={isLocked} error={errors['detectors.failureReason']}/>
                </FormRow>
            </Accordion>
             <Accordion title="M: Automatic Extinguishing System">
                 <FormRow>
                    <Label htmlFor="extinguishingSystem.presence">System Presence</Label>
                    <Select id="extinguishingSystem.presence" value={moduleData.extinguishingSystem.presence || ''} onChange={e => handleNestedChange('extinguishingSystem', 'presence', e.target.value)} disabled={isLocked}>
                         <option value="">Select...</option>
                        <option value="1">Present</option>
                        <option value="2">Not Present</option>
                    </Select>
                </FormRow>
                 <FormRow>
                    <Label htmlFor="extinguishingSystem.type">System Type</Label>
                    <Input id="extinguishingSystem.type" value={moduleData.extinguishingSystem.type || ''} onChange={e => handleNestedChange('extinguishingSystem', 'type', e.target.value)} disabled={isLocked} error={errors['extinguishingSystem.type']}/>
                </FormRow>
                 <FormRow>
                    <Label htmlFor="extinguishingSystem.operation">System Operation</Label>
                    <Input id="extinguishingSystem.operation" value={moduleData.extinguishingSystem.operation || ''} onChange={e => handleNestedChange('extinguishingSystem', 'operation', e.target.value)} disabled={isLocked} error={errors['extinguishingSystem.operation']}/>
                </FormRow>
                 <FormRow>
                    <Label htmlFor="extinguishingSystem.sprinklerHeads">Sprinkler Heads Operating</Label>
                    <Input id="extinguishingSystem.sprinklerHeads" type="number" value={moduleData.extinguishingSystem.sprinklerHeads || ''} onChange={e => handleNestedChange('extinguishingSystem', 'sprinklerHeads', Number(e.target.value))} disabled={isLocked} error={errors['extinguishingSystem.sprinklerHeads']}/>
                </FormRow>
                 <FormRow>
                    <Label htmlFor="extinguishingSystem.failureReason">Failure Reason</Label>
                    <Input id="extinguishingSystem.failureReason" value={moduleData.extinguishingSystem.failureReason || ''} onChange={e => handleNestedChange('extinguishingSystem', 'failureReason', e.target.value)} disabled={isLocked} error={errors['extinguishingSystem.failureReason']}/>
                </FormRow>
            </Accordion>
        </div>
    );
};

export default NfirsStructureFireModule;
