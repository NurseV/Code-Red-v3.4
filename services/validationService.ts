
import { NfirsIncident, OptionalFieldConfig } from '../types';

export interface ValidationError {
    moduleId: string;
    fieldId: string;
    message: string;
}

const isRequired = (value: any): boolean => {
    return value !== null && value !== undefined && value !== '';
}

export const validateNfirsIncident = (incident: NfirsIncident, optionalFieldsConfig: OptionalFieldConfig): ValidationError[] => {
    const errors: ValidationError[] = [];
    const { basicModule, fireModule, structureFireModule, emsModule, hazmatModule, wildlandFireModule, arsonModule } = incident;

    // --- Basic Module Validation ---
    if (!isRequired(basicModule.incidentType)) {
        errors.push({ moduleId: 'basic', fieldId: 'incidentType', message: 'Incident Type is required.' });
    }
    if (!isRequired(basicModule.sectionA.fdid)) {
        errors.push({ moduleId: 'basic', fieldId: 'sectionA.fdid', message: 'FDID is required.' });
    }
     if (!isRequired(basicModule.sectionA.incidentDate)) {
        errors.push({ moduleId: 'basic', fieldId: 'sectionA.incidentDate', message: 'Incident Date is required.' });
    }
     if (!isRequired(basicModule.sectionB.streetOrHighwayName)) {
        errors.push({ moduleId: 'basic', fieldId: 'sectionB.streetOrHighwayName', message: 'Street/Highway is required.' });
    }
     if (!isRequired(basicModule.sectionE.alarmDateTime)) {
        errors.push({ moduleId: 'basic', fieldId: 'sectionE.alarmDateTime', message: 'Alarm Date/Time is required.' });
    }
    
    // --- Fire Module Validation ---
    if (fireModule) {
        if (!isRequired(fireModule.ignition.areaOfOrigin)) {
            errors.push({ moduleId: 'fire', fieldId: 'ignition.areaOfOrigin', message: 'Area of Origin is required.' });
        }
        if (!isRequired(fireModule.ignition.heatSource)) {
            errors.push({ moduleId: 'fire', fieldId: 'ignition.heatSource', message: 'Heat Source is required.' });
        }
    }
    
    // --- Structure Fire Module Validation ---
    if (structureFireModule) {
        if (!isRequired(structureFireModule.structureType)) {
            errors.push({ moduleId: 'structureFire', fieldId: 'structureType', message: 'Structure Type is required.' });
        }
    }

    // --- Wildland Module Validation ---
    if (wildlandFireModule) {
        if (!isRequired(wildlandFireModule.totalAcresBurned)) {
            errors.push({ moduleId: 'wildland', fieldId: 'totalAcresBurned', message: 'Total Acres Burned is required.' });
        }
    }

    // --- EMS Module Validation ---
    if (emsModule) {
        if (!isRequired(emsModule.patientCount) || emsModule.patientCount < 0) {
            errors.push({ moduleId: 'ems', fieldId: 'patientCount', message: 'Number of Patients is required.' });
        }
    }
    
    // --- Cross-Module Consistency Validation (INC13.6) ---
    const allModules = [fireModule, structureFireModule, emsModule, hazmatModule, wildlandFireModule, arsonModule];
    allModules.forEach((mod, index) => {
        if (mod) {
            const moduleName = ['Fire', 'Structure Fire', 'EMS', 'Hazmat', 'Wildland', 'Arson'][index];
            if (mod.sectionA.fdid !== basicModule.sectionA.fdid || 
                mod.sectionA.incidentNumber !== basicModule.sectionA.incidentNumber ||
                mod.sectionA.incidentDate !== basicModule.sectionA.incidentDate) {
                    errors.push({
                        moduleId: 'basic',
                        fieldId: 'incidentType', // General error points to incident type
                        message: `Data inconsistency found between Basic Module and ${moduleName} Module. Please review Section A fields.`
                    });
            }
        }
    });


    return errors;
};
