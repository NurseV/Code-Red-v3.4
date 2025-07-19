
import React from 'react';
import { NfirsEmsModule as NfirsEmsModuleType, NfirsModuleSectionA } from '../../../types';
import Accordion from '../../ui/Accordion';
import { FormRow, Label, Input } from './SharedFormControls';

interface Props {
    moduleData: NfirsEmsModuleType;
    onUpdate: (data: NfirsEmsModuleType) => void;
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

const NfirsEmsModule: React.FC<Props> = ({ moduleData, onUpdate, isLocked, errors, basicInfo }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (name === 'proceduresUsed') {
            const currentProcedures = moduleData.proceduresUsed || [];
            const newProcedures = checked ? [...currentProcedures, value] : currentProcedures.filter(p => p !== value);
            onUpdate({ ...moduleData, proceduresUsed: newProcedures });
        } else {
            onUpdate({ ...moduleData, [name]: value });
        }
    };

    return (
        <div className="space-y-4">
             <ModuleHeader info={basicInfo} />
            <Accordion title="B: Patient Information" defaultOpen>
                <FormRow>
                    <Label htmlFor="patientCount">Number of Patients</Label>
                    <Input id="patientCount" name="patientCount" type="number" value={moduleData.patientCount || ''} onChange={handleChange} disabled={isLocked} className="md:col-span-1" error={errors['patientCount']} />
                </FormRow>
            </Accordion>
            <Accordion title="D: Provider Impression/Assessment">
                <FormRow>
                    <Label htmlFor="providerImpression">Provider's Primary Impression</Label>
                    <Input id="providerImpression" name="providerImpression" value={moduleData.providerImpression || ''} onChange={handleChange} disabled={isLocked} error={errors['providerImpression']} />
                </FormRow>
            </Accordion>
             <Accordion title="I: Procedures Used">
                <FormRow>
                    <Label>Procedures</Label>
                    <div className="md:col-span-2 space-y-2">
                        {['Airway', 'IV', 'Medication', 'Splinting'].map(proc => (
                            <label key={proc} className="flex items-center">
                                <input type="checkbox" name="proceduresUsed" value={proc} checked={moduleData.proceduresUsed?.includes(proc)} onChange={handleChange} disabled={isLocked} className="h-4 w-4 rounded mr-2 text-brand-primary focus:ring-transparent"/>
                                {proc}
                            </label>
                        ))}
                    </div>
                </FormRow>
            </Accordion>
             <Accordion title="N: EMS Disposition">
                <FormRow>
                    <Label htmlFor="emsDisposition">Patient Disposition</Label>
                    <Input id="emsDisposition" name="emsDisposition" value={moduleData.emsDisposition || ''} onChange={handleChange} disabled={isLocked} />
                </FormRow>
            </Accordion>
        </div>
    );
};

export default NfirsEmsModule;
