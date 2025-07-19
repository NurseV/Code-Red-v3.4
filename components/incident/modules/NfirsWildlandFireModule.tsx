

import React from 'react';
import { NfirsWildlandFireModule as NfirsWildlandFireModuleType, NfirsModuleSectionA } from '../../../types';
import Accordion from '../../ui/Accordion';
import { FormRow, Label, Input, Select } from './SharedFormControls';

interface Props {
    moduleData: NfirsWildlandFireModuleType;
    onUpdate: (data: NfirsWildlandFireModuleType) => void;
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

const NfirsWildlandFireModule: React.FC<Props> = ({ moduleData, onUpdate, isLocked, errors, basicInfo }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onUpdate({ ...moduleData, [name]: value });
    };

    const handleWeatherChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onUpdate({ ...moduleData, weatherInfo: { ...moduleData.weatherInfo, [name]: value }});
    };

    return (
        <div className="space-y-4">
            <ModuleHeader info={basicInfo} />
            <Accordion title="C: Area Type & Cause" defaultOpen>
                <FormRow>
                    <Label htmlFor="areaType">Area Type</Label>
                    <Input id="areaType" name="areaType" value={moduleData.areaType || ''} onChange={handleChange} disabled={isLocked} />
                </FormRow>
                 <FormRow>
                    <Label htmlFor="wildlandFireCause">Wildland Fire Cause</Label>
                    <Input id="wildlandFireCause" name="wildlandFireCause" value={moduleData.wildlandFireCause || ''} onChange={handleChange} disabled={isLocked} />
                </FormRow>
            </Accordion>
            <Accordion title="I: Acres Burned">
                 <FormRow>
                    <Label htmlFor="totalAcresBurned">Total Acres Burned</Label>
                    <Input id="totalAcresBurned" name="totalAcresBurned" type="number" step="0.1" value={moduleData.totalAcresBurned || ''} onChange={handleChange} disabled={isLocked} className="md:col-span-1" error={errors['totalAcresBurned']} />
                </FormRow>
            </Accordion>
            <Accordion title="H: Weather Information">
                 <FormRow>
                    <Label htmlFor="windDirection">Wind Direction From</Label>
                     <Select id="windDirection" name="windDirection" value={moduleData.weatherInfo.windDirection || ''} onChange={handleWeatherChange} disabled={isLocked} className="md:col-span-1">
                        <option>N</option><option>NE</option><option>E</option><option>SE</option>
                        <option>S</option><option>SW</option><option>W</option><option>NW</option>
                    </Select>
                </FormRow>
                <FormRow>
                    <Label htmlFor="windSpeed">Wind Speed (mph)</Label>
                    <Input id="windSpeed" name="windSpeed" type="number" value={moduleData.weatherInfo.windSpeed || ''} onChange={handleWeatherChange} disabled={isLocked} className="md:col-span-1" />
                </FormRow>
                <FormRow>
                    <Label htmlFor="temperature">Temperature (°F)</Label>
                    <Input id="temperature" name="temperature" type="number" value={moduleData.weatherInfo.temperature || ''} onChange={handleWeatherChange} disabled={isLocked} className="md:col-span-1" />
                </FormRow>
                 <FormRow>
                    <Label htmlFor="fuelMoisture">Fuel Moisture (%)</Label>
                    <Input id="fuelMoisture" name="fuelMoisture" type="number" value={moduleData.weatherInfo.fuelMoisture || ''} onChange={handleWeatherChange} disabled={isLocked} className="md:col-span-1" error={errors['weatherInfo.fuelMoisture']} />
                </FormRow>
                 <FormRow>
                    <Label htmlFor="dangerRating">Fire Danger Rating</Label>
                    <Input id="dangerRating" name="dangerRating" value={moduleData.weatherInfo.dangerRating || ''} onChange={handleWeatherChange} disabled={isLocked} className="md:col-span-1" error={errors['weatherInfo.dangerRating']} />
                </FormRow>
            </Accordion>
        </div>
    );
};

export default NfirsWildlandFireModule;
