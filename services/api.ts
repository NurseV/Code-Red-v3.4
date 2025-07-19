
import { 
    MOCK_PERSONNEL, MOCK_APPARATUS, MOCK_INCIDENTS,
    MOCK_OWNERS, MOCK_PROPERTIES, MOCK_FIRE_DUES, MOCK_ANNOUNCEMENTS,
    MOCK_STORM_SHELTERS, MOCK_BURN_PERMITS, MOCK_CITIZENS, MOCK_BILL_FORGIVENESS_REQUESTS,
    MOCK_REPAIR_TICKETS, MOCK_APPLICANTS, MOCK_CHECKLIST_TEMPLATES, MOCK_ASSETS,
    MOCK_CONSUMABLES, MOCK_TRAINING_COURSES, MOCK_SCHEDULED_TRAININGS, MOCK_FOLDERS,
    MOCK_DOCUMENTS, MOCK_EVENTS, MOCK_BUDGET, MOCK_EXPOSURE_LOGS,
    MOCK_SDS_SHEETS, MOCK_PREBUILT_REPORTS, MOCK_GIS_HYDRANTS,
    MOCK_PRE_INCIDENT_PLANS, MOCK_BILLING_RATES, MOCK_INVOICES, MOCK_SHIFTS,
    MOCK_ABOUT_US_CONTENT, MOCK_PHOTO_ALBUMS, MOCK_PHOTOS, MOCK_RECORDS_REQUESTS,
    MOCK_NOTIFICATIONS, MOCK_AUDIT_LOGS, MOCK_CONFIGURATION, MOCK_INTERNAL_MESSAGES,
    MOCK_DEPARTMENT_INFO, MOCK_SECURITY_ROLES, MOCK_MAINTENANCE_LOGS, MOCK_PM_SCHEDULES, 
    MOCK_INSPECTION_HISTORY, MOCK_SAVED_ASSET_VIEWS, MOCK_SAVED_PERSONNEL_VIEWS, MOCK_SAVED_APPARATUS_VIEWS,
    MOCK_SAVED_INCIDENT_VIEWS, MOCK_CUSTOM_REPORTS, MOCK_ALERT_RULES, DATA_SOURCE_FIELDS,
    MOCK_TRANSACTIONS
} from '../constants';
import { NFIRS_INCIDENT_TYPES } from '../constants/nfirs-codes';
import { 
    User, Role, Personnel, Apparatus, Incident, FireDue, FireDueStatus, Announcement,
    StormShelter, BurnPermit, BurnPermitStatus, Citizen, CitizenStatus, CitizenUser,
    BillForgivenessRequest, Applicant, ApplicantStatus, ChecklistTemplate, Asset, 
    Consumable, TrainingCourse, ScheduledTraining, Folder, Document, Hydrant, Event, EventCategory,
    ApparatusChecklistItem, RepairTicket, PrebuiltReport, Budget,
    ExposureLog, SdsSheet, HydrantInspection, PreIncidentPlan, Owner, Property,
    BillingRate, Invoice, InvoiceLineItem, EmergencyContact, ExpiringCertification, TrainingRecord,
    Shift, LineItem, CustomReportConfig, ChecklistItemTemplate, ApparatusStatus, LeadershipMember,
    PhotoAlbum, Photo, RecordsRequest, RecordsRequestStatus, NfirsIncident, Attachment,
    Notification, SystemConfiguration, AuditLogEntry, InternalMessage, DepartmentInfo, SecurityRole, 
    Compartment, NfirsModuleSectionA, MaintenanceLog, PreventativeMaintenanceSchedule, AssetInspection, 
    AssetPhoto, AssetDocument, SavedAssetView, ConsumableUsageLog, NfirsFireModule, NfirsStructureFireModule, NfirsEmsModule, NfirsWildlandFireModule, NfirsHazmatModule, NfirsArsonModule,
    SavedPersonnelView, SavedApparatusView, VitalsLog, SavedIncidentView, CustomReport, AlertRule, DataSource, Transaction, AboutUsContent,
    DashboardLayout
} from '../types';

const SIMULATED_DELAY = 100;

// Helper to simulate an API call with a delay
const simulateApiCall = <T>(data: T, errorRate = 0): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < errorRate) {
        reject(new Error("A simulated network error occurred."));
      } else {
        // Return a deep copy to prevent direct mutation of the "database"
        if (typeof data === 'undefined') {
            resolve(undefined as T);
        } else {
            resolve(JSON.parse(JSON.stringify(data)));
        }
      }
    }, SIMULATED_DELAY);
  });
};

// --- In-memory stores for new features ---
let MOCK_ATTACHMENTS: Record<string, Attachment[]> = {};

export const createEmptyModule = (type: string): any => {
    switch (type) {
        case 'Fire': return { sectionA: {}, propertyDetails: {}, onSiteMaterials: {}, ignition: {}, causeOfIgnition: {}, equipmentInvolved: {}, fireSuppressionFactors: [], mobileProperty: {} };
        case 'Structure': return { sectionA: {}, structureType: '', buildingStatus: '', buildingHeight: 0, mainFloorSize: 0, fireOrigin: '', fireSpread: '', storiesDamaged: 0, itemContributingSpread: '', materialContributingSpread: '', detectors: { presence: '' }, extinguishingSystem: { presence: '' } };
        case 'EMS': return { sectionA: {}, patientCount: 1, patientNumber: 1, arrivedAtPatientDateTime: '', patientTransferDateTime: '', providerImpression: '', humanFactors: [], otherFactors: [], bodySiteOfInjury: '', injuryType: '', causeOfIllnessInjury: '', proceduresUsed: [], safetyEquipment: '', cardiacArrest: { when: '', initialRhythm: '' }, providerLevel: { initial: '', highestOnScene: '' }, patientStatus: '', emsDisposition: '' };
        case 'Hazmat': return { sectionA: {}, hazmatNumber: '', hazmatId: {}, container: {}, release: {}, releasedFrom: '', evacuation: {}, actionsTaken: [], releaseIgnitionSequence: '', causeOfRelease: '', factorsContributing: [], factorsAffectingMitigation: [], equipmentInvolved: {}, mobileProperty: {}, disposition: '', civilianCasualties: 0 };
        case 'Wildland': return { sectionA: {}, location: {}, areaType: '', wildlandFireCause: '', humanFactors: [], ignitionFactors: [], suppressionFactors: [], heatSource: '', weatherInfo: { windDirection: 'N', windSpeed: 0, temperature: 0, fuelMoisture: 0, dangerRating: '' }, ignitedBuildings: 0, threatenedBuildings: 0, totalAcresBurned: 0, propertyManagement: {}, personResponsible: {}, rightOfWay: {}, fireBehavior: {} };
        case 'Arson': return { sectionA: {}, agencyReferredTo: '', caseStatus: '', availabilityOfMaterial: '', motivationFactors: [], groupInvolvement: '', entryMethod: '', fireInvolvementOnArrival: '', incendiaryDevices: {}, otherInvestigativeInfo: [], propertyOwnership: '', initialObservations: [] };
        default: return null;
    }
};

let MOCK_NFIRS_INCIDENTS: NfirsIncident[] = MOCK_INCIDENTS.map(inc => ({
    ...inc,
    status: inc.status === 'Open' ? 'In Progress' : 'Locked',
    lockedBy: inc.status === 'Open' ? undefined : 'user-001',
    lockedAt: inc.status === 'Open' ? undefined : new Date().toISOString(),
    attachments: [], // Start with empty attachments
    basicModule: {
        sectionA: {
            fdid: 'FD123',
            incidentDate: new Date(inc.date).toISOString().split('T')[0],
            station: '01',
            incidentNumber: inc.incidentNumber,
            exposureNumber: '0',
        },
        sectionB: {
            locationType: '1',
            censusTract: '',
            numberMilepost: '123',
            streetPrefix: '',
            streetOrHighwayName: inc.address,
            streetType: 'St',
            streetSuffix: '',
            apartmentSuiteRoom: '',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345',
            crossStreetDirections: '',
        },
        incidentType: inc.type === 'Structure Fire' ? '111' : inc.type === 'MVA' ? '322' : '321',
        aidGivenOrReceived: 'N',
        sectionE: {
            alarmDateTime: new Date(inc.date).toISOString(),
            arrivalDateTime: new Date(new Date(inc.date).getTime() + 5 * 60000).toISOString(),
            controlledDateTime: new Date(new Date(inc.date).getTime() + 20 * 60000).toISOString(),
            lastUnitClearedDateTime: new Date(new Date(inc.date).getTime() + 60 * 60000).toISOString(),
            shiftOrPlatoon: 'A',
            alarms: '1',
            district: 'D1',
            specialStudies: '',
        },
        actionsTaken: ['Action 1', 'Action 2'],
        sectionG: {
            apparatusCount: inc.respondingApparatusIds.length,
            personnelSuppression: inc.respondingPersonnelIds.length,
            personnelEms: 0,
            personnelOther: 0,
            propertyLoss: 10000,
            contentsLoss: 5000,
            propertyValue: 100000,
            contentsValue: 50000,
            completedModules: ['Basic'],
        },
        sectionH: {
            casualtiesFire: 0,
            casualtiesCivilian: 0,
            detectorPresence: '1',
            detectorEffectiveness: '1',
            hazMatReleased: 'N'
        },
        mixedUseProperty: 'N',
        propertyUse: '419',
        sectionK_personEntity: {},
        sectionK_owner: {},
        remarks: inc.narrative || '',
        sectionM: {
            officerInCharge: 'p-001',
            memberMakingReport: 'p-001',
        },
    },
    fireModule: inc.type === 'Structure Fire' ? createEmptyModule('Fire') : null,
    structureFireModule: inc.type === 'Structure Fire' ? createEmptyModule('Structure') : null,
    emsModule: null,
    wildlandFireModule: null,
    hazmatModule: null,
    arsonModule: null,
    civilianCasualties: [],
    fireServiceCasualties: [],
}));


// --- AUTH ---

export const loginInternalUser = (username: string): Promise<Personnel | null> => {
    const lowerCaseUsername = username.toLowerCase();
    const user = MOCK_PERSONNEL.find(p => p.username.toLowerCase() === lowerCaseUsername) || null;
    return simulateApiCall(user);
};

export const loginCitizenUser = (email: string, password: string): Promise<{ user: CitizenUser | null; error: string | null }> => {
    const citizen = MOCK_CITIZENS.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (citizen && citizen.password === password) {
        if(citizen.status === CitizenStatus.PENDING_APPROVAL) return simulateApiCall({ user: null, error: "Your account is pending approval by an administrator."});
        if(citizen.status === CitizenStatus.SUSPENDED) return simulateApiCall({ user: null, error: "Your account has been suspended."});
        if (citizen.status === CitizenStatus.ACTIVE) {
            return simulateApiCall({ user: { id: citizen.id, name: citizen.name, email: citizen.email }, error: null });
        }
    }
    return simulateApiCall({ user: null, error: "Invalid email or password." });
};

export const registerCitizen = (name: string, email: string, password: string) => {
    const existing = MOCK_CITIZENS.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (existing) {
        return simulateApiCall({ success: false, error: 'An account with this email already exists.' });
    }
    const newCitizen: Citizen = {
        id: `citizen-${Date.now()}`,
        name, email, password,
        propertyIds: [],
        status: CitizenStatus.PENDING_APPROVAL,
    };
    MOCK_CITIZENS.push(newCitizen);
    return simulateApiCall({ success: true, error: null });
};

// --- AUDIT LOG ---
export const logAuditEvent = (userId: string, action: string, target: string, targetId: string, details?: any): Promise<AuditLogEntry> => {
    const user = MOCK_PERSONNEL.find(p => p.id === userId);
    const newLog: AuditLogEntry = {
        id: `al-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId,
        userName: user?.name || 'Unknown User',
        action,
        target,
        targetId,
        details,
    };
    MOCK_AUDIT_LOGS.unshift(newLog); // Add to beginning
    return simulateApiCall(newLog);
}
export const getAuditLogs = (filters?: { targetId?: string, userId?: string, date?: string }) => simulateApiCall(MOCK_AUDIT_LOGS.filter(log => {
    const targetMatch = !filters?.targetId || log.targetId === filters.targetId;
    const userMatch = !filters?.userId || filters.userId === 'all' || log.userId === filters.userId;
    const dateMatch = !filters?.date || log.timestamp.startsWith(filters.date);
    return targetMatch && userMatch && dateMatch;
}));


// --- INCIDENTS ---
export const getIncidentsList = (filters?: { searchTerm?: string; type?: string; status?: NfirsIncident['status'] | 'All'; dateStart?: string, dateEnd?: string }) => {
    let results = [...MOCK_NFIRS_INCIDENTS];
    if (filters) {
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            results = results.filter(i => i.address.toLowerCase().includes(term) || i.incidentNumber.toLowerCase().includes(term));
        }
        if (filters.type && filters.type !== 'All') {
            const typeCode = NFIRS_INCIDENT_TYPES.find(t => t.description === filters.type)?.code;
            if(typeCode) {
                 results = results.filter(i => i.basicModule.incidentType === typeCode);
            } else {
                 results = results.filter(i => i.type === filters.type);
            }
        }
        if (filters.status && filters.status !== 'All') {
            results = results.filter(i => i.status === filters.status);
        }
        if (filters.dateStart) {
            results = results.filter(i => new Date(i.date) >= new Date(filters.dateStart!));
        }
        if (filters.dateEnd) {
            results = results.filter(i => new Date(i.date) <= new Date(filters.dateEnd!));
        }
    }
    return simulateApiCall(results.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
};

export const getIncidentById = (id: string): Promise<NfirsIncident | null> => {
    const incident = MOCK_NFIRS_INCIDENTS.find(inc => inc.id === id) || null;
    return simulateApiCall(incident);
};

export const createIncident = async (user: User, incidentData: Partial<Incident>): Promise<NfirsIncident> => {
    const newIncidentNumber = `2024-${String(MOCK_NFIRS_INCIDENTS.length + 1000).slice(1)}`;
    const newIncident: NfirsIncident = {
        id: `inc-${Date.now()}`,
        incidentNumber: newIncidentNumber,
        type: incidentData.type || 'New Incident',
        address: incidentData.address || 'TBD',
        date: incidentData.date || new Date().toISOString(),
        status: 'In Progress',
        respondingPersonnelIds: [],
        respondingApparatusIds: [],
        basicModule: {
            sectionA: {
                fdid: 'FD123',
                incidentDate: new Date().toISOString().split('T')[0],
                station: '01',
                incidentNumber: newIncidentNumber,
                exposureNumber: '0',
            },
            sectionB: { locationType: '', censusTract: '', numberMilepost: '', streetPrefix: '', streetOrHighwayName: '', streetType: '', streetSuffix: '', apartmentSuiteRoom: '', city: '', state: '', zipCode: '', crossStreetDirections: '' },
            incidentType: '',
            aidGivenOrReceived: 'N',
            sectionE: { alarmDateTime: new Date().toISOString(), arrivalDateTime: '', controlledDateTime: '', lastUnitClearedDateTime: '', shiftOrPlatoon: 'A', alarms: '1', district: 'D1', specialStudies: '' },
            actionsTaken: [],
            sectionG: { apparatusCount: 0, personnelSuppression: 0, personnelEms: 0, personnelOther: 0, propertyLoss: 0, contentsLoss: 0, propertyValue: 0, contentsValue: 0, completedModules: ['Basic'] },
            sectionH: { casualtiesFire: 0, casualtiesCivilian: 0, detectorPresence: '', hazMatReleased: 'N' },
            mixedUseProperty: '',
            propertyUse: '',
            sectionK_personEntity: {},
            sectionK_owner: {},
            remarks: 'New incident created.',
            sectionM: { officerInCharge: user.id, memberMakingReport: user.id }
        },
    };
    MOCK_NFIRS_INCIDENTS.unshift(newIncident);
    logAuditEvent(user.id, 'CREATE', 'Incident', newIncident.id, { incidentNumber: newIncident.incidentNumber });
    return simulateApiCall(newIncident);
};

export const updateIncident = async (id: string, updatedData: NfirsIncident, user: User | null) => {
    const index = MOCK_NFIRS_INCIDENTS.findIndex(inc => inc.id === id);
    if (index > -1) {
        MOCK_NFIRS_INCIDENTS[index] = { ...MOCK_NFIRS_INCIDENTS[index], ...updatedData };
        if (user) {
            logAuditEvent(user.id, 'UPDATE', 'Incident', id, { fields: Object.keys(updatedData) });
        }
        return simulateApiCall(MOCK_NFIRS_INCIDENTS[index]);
    }
    throw new Error("Incident not found");
};

export const updateMultipleIncidentStatus = (ids: string[], status: 'Locked') => {
    MOCK_NFIRS_INCIDENTS.forEach(i => {
        if (ids.includes(i.id)) {
            i.status = status;
        }
    });
    return simulateApiCall(undefined);
};

export const getIncidentViews = () => simulateApiCall(MOCK_SAVED_INCIDENT_VIEWS);
export const saveIncidentView = (view: any) => {
    const newView = { ...view, id: `inc-view-${Date.now()}` };
    MOCK_SAVED_INCIDENT_VIEWS.push(newView);
    return simulateApiCall(newView);
};

export const syncWithActive911 = async (): Promise<NfirsIncident> => {
    const newIncidentNumber = `2024-${String(MOCK_NFIRS_INCIDENTS.length + 1000).slice(1)}`;
    const newIncident: NfirsIncident = {
        ...createEmptyNfirsShellFrom({
            id: `inc-${Date.now()}`,
            incidentNumber: newIncidentNumber,
            type: 'MVA',
            address: 'Hwy 5 & Elm St',
            date: new Date().toISOString(),
            status: 'In Progress',
            respondingPersonnelIds: ['p-001', 'p-003'],
            respondingApparatusIds: ['a-001'],
            narrative: 'Synced from Active911: Two-vehicle MVA.',
        }),
        isNew: true, // Mark as new for UI highlight
    };
    MOCK_NFIRS_INCIDENTS.unshift(newIncident);
    return simulateApiCall(newIncident);
}

export const createEmptyNfirsShellFrom = (incident: Partial<NfirsIncident>): NfirsIncident => {
    const incidentNumber = incident.incidentNumber || `2024-${String(MOCK_NFIRS_INCIDENTS.length + 1000).slice(1)}`;
    const newShell: NfirsIncident = {
        id: incident.id || `inc-${Date.now()}`,
        incidentNumber,
        type: incident.type || 'New Incident',
        address: incident.address || 'TBD',
        date: incident.date || new Date().toISOString(),
        status: 'In Progress',
        respondingPersonnelIds: incident.respondingPersonnelIds || [],
        respondingApparatusIds: incident.respondingApparatusIds || [],
        narrative: incident.narrative || '',
        basicModule: {
            sectionA: {
                fdid: 'FD123',
                incidentDate: new Date().toISOString().split('T')[0],
                station: '01',
                incidentNumber,
                exposureNumber: '0',
            },
            sectionB: { locationType: '', censusTract: '', numberMilepost: '', streetPrefix: '', streetOrHighwayName: incident.address || '', streetType: '', streetSuffix: '', apartmentSuiteRoom: '', city: 'Anytown', state: 'CA', zipCode: '12345', crossStreetDirections: '' },
            incidentType: '',
            aidGivenOrReceived: 'N',
            sectionE: { alarmDateTime: new Date().toISOString(), arrivalDateTime: '', controlledDateTime: '', lastUnitClearedDateTime: '', shiftOrPlatoon: 'A', alarms: '1', district: 'D1', specialStudies: '' },
            actionsTaken: [],
            sectionG: { apparatusCount: incident.respondingApparatusIds?.length || 0, personnelSuppression: incident.respondingPersonnelIds?.length || 0, personnelEms: 0, personnelOther: 0, propertyLoss: 0, contentsLoss: 0, propertyValue: 0, contentsValue: 0, completedModules: ['Basic'] },
            sectionH: { casualtiesFire: 0, casualtiesCivilian: 0, detectorPresence: '', hazMatReleased: 'N' },
            mixedUseProperty: '',
            propertyUse: '',
            sectionK_personEntity: {},
            sectionK_owner: {},
            remarks: incident.narrative || '',
            sectionM: { officerInCharge: '', memberMakingReport: '' }
        },
        fireModule: null,
        structureFireModule: null,
        emsModule: null,
        wildlandFireModule: null,
        hazmatModule: null,
        arsonModule: null,
        civilianCasualties: [],
        fireServiceCasualties: [],
        attachments: [],
    };
    return newShell;
};


// --- Notifications and Dashboard ---

export const getNotifications = (): Promise<Notification[]> => simulateApiCall(MOCK_NOTIFICATIONS);

export const markNotificationsAsRead = (): Promise<void> => {
    MOCK_NOTIFICATIONS.forEach(n => n.read = true);
    return simulateApiCall(undefined);
}

export const generateAssetNotifications = (): Promise<void> => {
    const lowStock = MOCK_CONSUMABLES.find(c => c.quantity < c.reorderLevel);
    if(lowStock && !MOCK_NOTIFICATIONS.some(n => n.message.includes(lowStock.name))) {
        MOCK_NOTIFICATIONS.unshift({
            id: `notif-${Date.now()}`,
            type: 'warning',
            message: `${lowStock.name} are below reorder level.`,
            link: '/app/inventory',
            timestamp: new Date().toISOString(),
            read: false,
        });
    }
     const newTicket = MOCK_REPAIR_TICKETS.find(t => t.status === 'Open');
     if(newTicket && !MOCK_NOTIFICATIONS.some(n => n.message.includes(newTicket.apparatusUnitId))) {
          MOCK_NOTIFICATIONS.unshift({
            id: `notif-${Date.now()}`,
            type: 'alert',
            message: `New repair ticket opened for ${newTicket.apparatusUnitId}.`,
            link: '/app/maintenance',
            timestamp: new Date().toISOString(),
            read: false,
        });
     }
    return simulateApiCall(undefined);
};

export const getDashboardStats = async () => {
    const incidents = await getIncidentsList();
    const apparatus = await getApparatusList();
    const personnel = await getPersonnelList();
    const expiringCerts = await getExpiringCertifications();
    const upcomingTrainings = await getScheduledTrainings();

    const generateHistory = (base: number) => Array.from({ length: 7 }, (_, i) => ({ name: `Day ${i + 1}`, value: base + Math.floor(Math.random() * (i + 1) * 2 - (i+1))}));

    const stats = {
        activePersonnel: personnel.filter(p => p.status === 'Active').length,
        apparatusInService: apparatus.filter(a => a.status === ApparatusStatus.IN_SERVICE).length,
        openIncidents: incidents.filter(i => i.status === 'In Progress').length,
        personnelHistory: generateHistory(personnel.length),
        apparatusHistory: generateHistory(apparatus.length),
        incidentsHistory: generateHistory(incidents.length),
        recentIncidents: incidents.slice(0, 3),
        apparatusStatus: apparatus.slice(0, 5),
        expiringCerts: expiringCerts.slice(0, 5),
        upcomingTrainings: upcomingTrainings.slice(0, 3)
    };
    return simulateApiCall(stats);
};

let MOCK_DASHBOARD_LAYOUT: DashboardLayout = {
    widgetOrder: ['stats', 'recent-incidents', 'apparatus-status', 'certification-expirations', 'upcoming-trainings'],
    hiddenWidgets: [],
};

export const getDashboardLayout = (): Promise<DashboardLayout> => {
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout) {
        try {
            const parsed = JSON.parse(savedLayout);
            // Basic validation
            if (Array.isArray(parsed.widgetOrder) && Array.isArray(parsed.hiddenWidgets)) {
                 return simulateApiCall(parsed);
            }
        } catch (e) {
            console.error("Failed to parse dashboard layout from localStorage", e);
        }
    }
    return simulateApiCall(MOCK_DASHBOARD_LAYOUT);
};

export const saveDashboardLayout = (layout: DashboardLayout): Promise<void> => {
    MOCK_DASHBOARD_LAYOUT = layout;
    localStorage.setItem('dashboardLayout', JSON.stringify(layout));
    return simulateApiCall(undefined);
};


// --- Personnel & Applicants ---

export const getPersonnelList = (filters?: { searchTerm?: string; rank?: string; status?: string; trainingCompliance?: 'non-compliant' }) => {
    let results = [...MOCK_PERSONNEL];
     if (filters) {
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            results = results.filter(p => p.name.toLowerCase().includes(term) || p.badgeNumber.toLowerCase().includes(term));
        }
        if (filters.rank && filters.rank !== 'All') {
            results = results.filter(p => p.rank === filters.rank);
        }
        if (filters.status && filters.status !== 'All') {
            results = results.filter(p => p.status === filters.status);
        }
        if (filters.trainingCompliance === 'non-compliant') {
            const requiredCourses = ['tc-1', 'tc-3'];
            results = results.filter(p => {
                const completedCourses = new Set(p.trainingHistory.map(t => t.courseId));
                return !requiredCourses.every(rc => completedCourses.has(rc));
            });
        }
    }
    return simulateApiCall(results);
};
export const getPersonnelById = (id: string): Promise<Personnel | undefined> => simulateApiCall(MOCK_PERSONNEL.find(p => p.id === id));
export const getPersonnelViews = () => simulateApiCall(MOCK_SAVED_PERSONNEL_VIEWS);
export const savePersonnelView = (view: any) => {
    const newView = { ...view, id: `view-${Date.now()}` };
    MOCK_SAVED_PERSONNEL_VIEWS.push(newView);
    return simulateApiCall(newView);
};
export const deletePersonnelView = (id: string) => {
    const index = MOCK_SAVED_PERSONNEL_VIEWS.findIndex(v => v.id === id);
    if (index > -1) MOCK_SAVED_PERSONNEL_VIEWS.splice(index, 1);
    return simulateApiCall(undefined);
}
export const createPersonnelDirectly = (employeeData: any, user: User) => {
    const newPersonnel: Personnel = {
        id: `p-${Date.now()}`,
        name: employeeData.name,
        rank: employeeData.rank,
        status: employeeData.status,
        nfirsId: '',
        badgeNumber: `B-${new Date().getFullYear()}-${Math.floor(Math.random() * 100)}`,
        phoneNumbers: [],
        emails: [{type: 'Work', address: employeeData.email}],
        certifications: [],
        emergencyContacts: [],
        trainingHistory: [],
        username: employeeData.name.toLowerCase().replace(' ', ''),
        role: Role.FIREFIGHTER,
        avatarUrl: `https://picsum.photos/seed/${Date.now()}/100/100`,
    };
    MOCK_PERSONNEL.push(newPersonnel);
    logAuditEvent(user.id, 'CREATE', 'Personnel', newPersonnel.id);
    return simulateApiCall(newPersonnel);
};
export const updateMultiplePersonnelStatus = (ids: string[], status: 'Inactive') => {
    MOCK_PERSONNEL.forEach(p => {
        if (ids.includes(p.id)) {
            p.status = status;
        }
    });
    return simulateApiCall(undefined);
}
export const updatePersonnel = (id: string, data: Partial<Personnel>, user: User) => {
    const index = MOCK_PERSONNEL.findIndex(p => p.id === id);
    if (index > -1) {
        MOCK_PERSONNEL[index] = { ...MOCK_PERSONNEL[index], ...data };
        logAuditEvent(user.id, 'UPDATE', 'Personnel', id);
        return simulateApiCall(MOCK_PERSONNEL[index]);
    }
    throw new Error('Personnel not found');
}
export const updateUserProfile = (id: string, data: Partial<Personnel>) => {
    const index = MOCK_PERSONNEL.findIndex(p => p.id === id);
    if (index > -1) {
        MOCK_PERSONNEL[index] = { ...MOCK_PERSONNEL[index], ...data };
        return simulateApiCall(MOCK_PERSONNEL[index]);
    }
    throw new Error('Personnel not found');
};

export const getApplicants = () => simulateApiCall(MOCK_APPLICANTS);
export const updateApplicantStatus = (id: string, status: ApplicantStatus) => {
    const index = MOCK_APPLICANTS.findIndex(a => a.id === id);
    if (index > -1) MOCK_APPLICANTS[index].status = status;
    return simulateApiCall(undefined);
};
export const promoteApplicantToPersonnel = (id: string) => {
    const applicantIndex = MOCK_APPLICANTS.findIndex(a => a.id === id);
    if (applicantIndex > -1) {
        const applicant = MOCK_APPLICANTS[applicantIndex];
        const newPersonnel: Personnel = {
            id: `p-${Date.now()}`,
            name: applicant.name,
            rank: 'Probation',
            status: 'Probation',
            hireDate: new Date().toISOString(),
            // ... fill in other required fields with defaults
            nfirsId: '', badgeNumber: '', phoneNumbers: [], emails: [{type: 'Work', address: applicant.email}], certifications: [], emergencyContacts: [], trainingHistory: [],
            username: applicant.name.split(' ')[0].toLowerCase(), role: Role.FIREFIGHTER, avatarUrl: 'https://picsum.photos/seed/newhire/100/100'
        };
        MOCK_PERSONNEL.push(newPersonnel);
        MOCK_APPLICANTS.splice(applicantIndex, 1);
        return simulateApiCall(undefined);
    }
    throw new Error('Applicant not found');
};


// --- Apparatus ---

export const getApparatusList = () => simulateApiCall(MOCK_APPARATUS);
export const getApparatusById = (id: string) => simulateApiCall(MOCK_APPARATUS.find(a => a.id === id));
export const createApparatus = (data: Partial<Apparatus>) => {
    const newApparatus: Apparatus = {
        id: `a-${Date.now()}`,
        lastCheck: new Date().toISOString(),
        mileage: 0,
        engineHours: 0,
        checklistTemplateId: 'ct-general',
        location: { lat: 50, lng: 50},
        vitalsHistory: [],
        compartments: [],
        ...data,
    } as Apparatus;
    MOCK_APPARATUS.push(newApparatus);
    return simulateApiCall(newApparatus);
};
export const updateApparatus = (id: string, data: Partial<Apparatus>, user: User | null) => {
    const index = MOCK_APPARATUS.findIndex(a => a.id === id);
    if(index > -1) {
        const updatedApparatus = { ...MOCK_APPARATUS[index], ...data };
        MOCK_APPARATUS[index] = updatedApparatus;
        if (user) logAuditEvent(user.id, 'UPDATE', 'Apparatus', id);
        return simulateApiCall(updatedApparatus);
    }
    throw new Error("Apparatus not found");
};
export const logApparatusVitals = (apparatusId: string, vitals: { mileage: number, engineHours: number }, user: User): Promise<Apparatus> => {
    const index = MOCK_APPARATUS.findIndex(a => a.id === apparatusId);
    if (index > -1) {
        const apparatus = MOCK_APPARATUS[index];
        
        // Update vitals
        apparatus.mileage = vitals.mileage;
        apparatus.engineHours = vitals.engineHours;

        // Update last check date
        apparatus.lastCheck = new Date().toISOString();

        // Create new history entry
        const newLogEntry: VitalsLog = {
            id: `vl-${Date.now()}`,
            date: apparatus.lastCheck,
            mileage: vitals.mileage,
            engineHours: vitals.engineHours,
            userId: user.id,
        };
        
        // Prepend to history
        apparatus.vitalsHistory.unshift(newLogEntry);

        // Audit log
        logAuditEvent(user.id, 'LOG_VITALS', 'Apparatus', apparatusId, vitals);

        return simulateApiCall(apparatus);
    }
    throw new Error("Apparatus not found");
};
export const updateMultipleApparatusStatus = (ids: string[], status: ApparatusStatus) => {
    MOCK_APPARATUS.forEach(a => {
        if(ids.includes(a.id)) {
            a.status = status;
        }
    });
    return simulateApiCall(undefined);
};
export const updateApparatusCompartments = (id: string, compartments: Compartment[]) => {
    const index = MOCK_APPARATUS.findIndex(a => a.id === id);
    if(index > -1) {
        MOCK_APPARATUS[index].compartments = compartments;
        return simulateApiCall(MOCK_APPARATUS[index]);
    }
    throw new Error("Apparatus not found");
}

export const getApparatusViews = () => simulateApiCall(MOCK_SAVED_APPARATUS_VIEWS);

export const saveApparatusView = (view: any) => {
    const newView = { ...view, id: `app-view-${Date.now()}` };
    MOCK_SAVED_APPARATUS_VIEWS.push(newView);
    return simulateApiCall(newView);
};

export const deleteApparatusView = (id: string) => {
    const index = MOCK_SAVED_APPARATUS_VIEWS.findIndex(v => v.id === id);
    if (index > -1) MOCK_SAVED_APPARATUS_VIEWS.splice(index, 1);
    return simulateApiCall(undefined);
};

// --- Checklists & Maintenance ---
export const getChecklistTemplates = () => simulateApiCall(MOCK_CHECKLIST_TEMPLATES);
export const getChecklistTemplateById = (id: string) => simulateApiCall(MOCK_CHECKLIST_TEMPLATES.find(t => t.id === id));
export const createChecklistTemplate = (data: Omit<ChecklistTemplate, 'id'>) => {
    const newTemplate: ChecklistTemplate = { ...data, id: `ct-${Date.now()}`, items: data.items.map((item, i) => ({...item, id: `ci-${Date.now()}-${i}`})) };
    MOCK_CHECKLIST_TEMPLATES.push(newTemplate);
    return simulateApiCall(newTemplate);
};
export const updateChecklistTemplate = (id: string, data: Partial<ChecklistTemplate>) => {
    const index = MOCK_CHECKLIST_TEMPLATES.findIndex(t => t.id === id);
    if (index > -1) {
        MOCK_CHECKLIST_TEMPLATES[index] = { ...MOCK_CHECKLIST_TEMPLATES[index], ...data };
        return simulateApiCall(MOCK_CHECKLIST_TEMPLATES[index]);
    }
    throw new Error('Template not found');
};
export const deleteChecklistTemplate = (id: string) => {
    const index = MOCK_CHECKLIST_TEMPLATES.findIndex(t => t.id === id);
    if (index > -1) MOCK_CHECKLIST_TEMPLATES.splice(index, 1);
    return simulateApiCall(undefined);
}

export const getRepairTickets = () => simulateApiCall(MOCK_REPAIR_TICKETS);
export const createRepairTicket = (user: User, data: any) => {
    const newTicket: RepairTicket = { ...data, id: `rt-${Date.now()}`, createdAt: new Date().toISOString(), status: 'Open' };
    MOCK_REPAIR_TICKETS.unshift(newTicket);
    logAuditEvent(user.id, 'CREATE_TICKET', 'Apparatus', data.apparatusId, { item: data.itemDescription });
    return simulateApiCall(newTicket);
};
export const updateRepairTicket = (id: string, data: Partial<RepairTicket>) => {
    const index = MOCK_REPAIR_TICKETS.findIndex(t => t.id === id);
    if (index > -1) {
        const updatedTicket = { ...MOCK_REPAIR_TICKETS[index], ...data };
        MOCK_REPAIR_TICKETS[index] = updatedTicket;
        return simulateApiCall(updatedTicket);
    }
    throw new Error('Ticket not found');
};
export const deleteRepairTicket = (id: string) => {
    const index = MOCK_REPAIR_TICKETS.findIndex(t => t.id === id);
    if(index > -1) MOCK_REPAIR_TICKETS.splice(index, 1);
    return simulateApiCall(undefined);
};
export const syncPendingTickets = async () => {
    const pendingTickets = JSON.parse(localStorage.getItem('pendingTickets') || '[]');
    if (pendingTickets.length === 0) return 0;

    const user = MOCK_PERSONNEL[0]; // mock user for audit
    for(const ticket of pendingTickets) {
        await createRepairTicket(user, ticket);
    }
    localStorage.removeItem('pendingTickets');
    return simulateApiCall(pendingTickets.length);
};

// --- Training ---
export const getTrainingCourses = () => simulateApiCall(MOCK_TRAINING_COURSES);
export const createTrainingCourse = (data: Omit<TrainingCourse, 'id'>) => {
    const newCourse = { ...data, id: `tc-${Date.now()}` };
    MOCK_TRAINING_COURSES.push(newCourse);
    return simulateApiCall(newCourse);
};
export const updateTrainingCourse = (id: string, data: Partial<TrainingCourse>) => {
    const index = MOCK_TRAINING_COURSES.findIndex(c => c.id === id);
    if (index > -1) {
        const updatedCourse = { ...MOCK_TRAINING_COURSES[index], ...data };
        MOCK_TRAINING_COURSES[index] = updatedCourse;
        return simulateApiCall(updatedCourse);
    }
    throw new Error('Course not found');
};
export const deleteTrainingCourse = (id: string) => {
    const index = MOCK_TRAINING_COURSES.findIndex(c => c.id === id);
    if (index > -1) MOCK_TRAINING_COURSES.splice(index, 1);
    return simulateApiCall(undefined);
};

export const getScheduledTrainings = () => simulateApiCall(MOCK_SCHEDULED_TRAININGS);
export const logTrainingAttendance = (trainingId: string, attendeeIds: string[]) => {
    const training = MOCK_SCHEDULED_TRAININGS.find(t => t.id === trainingId);
    const course = MOCK_TRAINING_COURSES.find(c => c.id === training?.courseId);

    if (training && course) {
        attendeeIds.forEach(personnelId => {
            const personnel = MOCK_PERSONNEL.find(p => p.id === personnelId);
            if (personnel && !personnel.trainingHistory.some(h => h.courseId === course.id)) {
                personnel.trainingHistory.push({
                    courseId: course.id,
                    courseName: course.name,
                    completedDate: training.date,
                });
            }
        });
        training.attendeeIds = [...new Set([...training.attendeeIds, ...attendeeIds])];
    }
    return simulateApiCall(undefined);
};


// --- Assets & Inventory ---
export const getAssets = (filters?: any) => {
    let results = [...MOCK_ASSETS];
    if (filters) {
        if (filters.searchTerm) {
             const term = filters.searchTerm.toLowerCase();
             results = results.filter(a => a.name.toLowerCase().includes(term) || a.serialNumber.toLowerCase().includes(term) || a.assetType.toLowerCase().includes(term));
        }
        if (filters.status) {
            results = results.filter(a => a.status === filters.status);
        }
         if (filters.category) {
            results = results.filter(a => a.category === filters.category);
        }
    }
    return simulateApiCall(results);
};

export const createAsset = (data: Partial<Asset>) => {
    const newAsset: Asset = {
        id: `as-${Date.now()}`,
        name: data.name || 'Unnamed Asset',
        assetType: data.assetType || 'Equipment',
        category: data.category || 'Equipment',
        serialNumber: data.serialNumber || `SN-${Date.now()}`,
        manufacturer: data.manufacturer || 'Unknown',
        model: data.model || 'N/A',
        purchaseDate: data.purchaseDate || new Date().toISOString(),
        purchasePrice: data.purchasePrice || 0,
        status: data.status || 'In Storage',
        assignedToId: null,
        assignedToType: null,
        maintenanceHistory: [],
        pmSchedules: [],
        inspectionHistory: [],
        parentId: null,
    };
    MOCK_ASSETS.push(newAsset);
    return simulateApiCall(newAsset);
};

export const checkDuplicateSerialNumber = (serialNumber: string): Promise<boolean> => {
    if (!serialNumber) return simulateApiCall(false);
    const exists = MOCK_ASSETS.some(a => a.serialNumber.toLowerCase() === serialNumber.toLowerCase());
    return simulateApiCall(exists);
};

export const getAssetById = (id: string): Promise<Asset | null> => {
    const asset = MOCK_ASSETS.find(a => a.id === id) || null;
    if (asset) {
        asset.components = MOCK_ASSETS.filter(a => a.parentId === id);
        asset.maintenanceHistory = MOCK_MAINTENANCE_LOGS[id] || [];
        asset.pmSchedules = MOCK_PM_SCHEDULES[id] || [];
        asset.inspectionHistory = MOCK_INSPECTION_HISTORY[id] || [];
    }
    return simulateApiCall(asset);
};
export const getUnassignedAssets = () => simulateApiCall(MOCK_ASSETS.filter(a => !a.assignedToId));

export const updateAssetAssignment = (assetId: string, assignedToId: string | null, assignedToType: 'Personnel' | 'Apparatus' | 'SubCompartment' | null, user: User) => {
    const asset = MOCK_ASSETS.find(a => a.id === assetId);
    if (asset) {
        const fromTarget = asset.assignedToType ? `${asset.assignedToType} '${asset.assignedToName}'` : 'Storage';
        
        asset.assignedToId = assignedToId;
        asset.assignedToType = assignedToType;
        asset.status = assignedToId ? 'In Use' : 'In Storage';

        let toTarget = 'Storage';
        if (assignedToType === 'Personnel' && assignedToId) {
            const personnel = MOCK_PERSONNEL.find(p => p.id === assignedToId);
            asset.assignedToName = personnel?.name;
            toTarget = `Personnel '${personnel?.name}'`;
        } else if (assignedToType === 'Apparatus' && assignedToId) {
            const apparatus = MOCK_APPARATUS.find(a => a.id === assignedToId);
            asset.assignedToName = apparatus?.unitId;
            toTarget = `Apparatus '${apparatus?.unitId}'`;
        } else if (assignedToType === 'SubCompartment' && assignedToId) {
            // This is a more complex look up, skipping name assignment for mock simplicity
            asset.assignedToName = 'Compartment';
            toTarget = `A compartment`;
        } else {
            asset.assignedToName = undefined;
        }

        logAuditEvent(user.id, 'ASSET_TRANSFER', 'Asset', assetId, { assetName: asset.name, from: fromTarget, to: toTarget });
        return simulateApiCall(asset);
    }
    throw new Error("Asset not found");
};

export const updateAsset = async (id: string, data: Partial<Asset>) => {
    const index = MOCK_ASSETS.findIndex(a => a.id === id);
    if (index > -1) {
        const updatedAsset = { ...MOCK_ASSETS[index], ...data };
        MOCK_ASSETS[index] = updatedAsset;
        return simulateApiCall(updatedAsset);
    }
    throw new Error('Asset not found');
}
export const updateAssetsStatus = (ids: string[], status: string) => {
    MOCK_ASSETS.forEach(a => {
        if (ids.includes(a.id)) {
            a.status = status as Asset['status'];
        }
    });
    return simulateApiCall(undefined);
}
export const deleteAsset = (id: string) => {
    const index = MOCK_ASSETS.findIndex(a => a.id !== id);
    if(index > -1) MOCK_ASSETS.splice(index, 1);
    return simulateApiCall(undefined);
}
export const assignComponent = (componentId: string, parentId: string) => {
    const component = MOCK_ASSETS.find(a => a.id === componentId);
    if(component) component.parentId = parentId;
    return simulateApiCall(undefined);
}
export const unassignComponent = (componentId: string) => {
    const component = MOCK_ASSETS.find(a => a.id === componentId);
    if(component) component.parentId = null;
    return simulateApiCall(undefined);
};
export const swapAssetComponent = (newComponentId: string, oldComponentId: string, parentId: string) => {
    const newComp = MOCK_ASSETS.find(a => a.id === newComponentId);
    const oldComp = MOCK_ASSETS.find(a => a.id === oldComponentId);
    if(newComp) newComp.parentId = parentId;
    if(oldComp) oldComp.parentId = null;
    return simulateApiCall(undefined);
}
export const getAssetViews = () => simulateApiCall(MOCK_SAVED_ASSET_VIEWS);
export const saveAssetView = (view: any) => {
    const newView = { ...view, id: `av-${Date.now()}` };
    MOCK_SAVED_ASSET_VIEWS.push(newView);
    return simulateApiCall(newView);
};
export const deleteAssetView = (id: string) => {
    const index = MOCK_SAVED_ASSET_VIEWS.findIndex(v => v.id === id);
    if (index > -1) MOCK_SAVED_ASSET_VIEWS.splice(index, 1);
    return simulateApiCall(undefined);
};

export const getAssetDashboardData = async () => {
    const assets = await getAssets();
    const pmSchedules = MOCK_PM_SCHEDULES;

    const statusCounts = assets.reduce((acc, asset) => {
        acc[asset.status] = (acc[asset.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const categoryCounts = assets.reduce((acc, asset) => {
        acc[asset.category] = (acc[asset.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    
    let allPms: PreventativeMaintenanceSchedule[] = [];
    Object.values(pmSchedules).forEach(scheduleList => {
        allPms = allPms.concat(scheduleList);
    });

    const upcomingPms = allPms.filter(pm => {
        const dueDate = new Date(pm.nextDueDate);
        return dueDate <= ninetyDaysFromNow && dueDate >= new Date();
    }).map(pm => {
        const asset = assets.find(a => a.id === pm.assetId);
        return {
            'Asset Name': asset?.name || 'Unknown Asset',
            'Asset S/N': asset?.serialNumber || 'N/A',
            'Task': pm.taskDescription,
            'Due Date': new Date(pm.nextDueDate).toLocaleDateString(),
        };
    }).sort((a,b) => new Date(a['Due Date']).getTime() - new Date(b['Due Date']).getTime());

    const data = {
        statusCounts: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
        categoryCounts: Object.entries(categoryCounts).map(([name, count]) => ({ name, count })),
        upcomingPms: upcomingPms.slice(0, 5)
    };

    return simulateApiCall(data);
};

export const createMaintenanceLog = (logData: Omit<MaintenanceLog, 'id'>) => {
    const newLog = { ...logData, id: `ml-${Date.now()}`};
    if(!MOCK_MAINTENANCE_LOGS[logData.assetId]) MOCK_MAINTENANCE_LOGS[logData.assetId] = [];
    MOCK_MAINTENANCE_LOGS[logData.assetId].push(newLog);
    return simulateApiCall(newLog);
};
export const createPMSchedule = (pmData: Omit<PreventativeMaintenanceSchedule, 'id'>) => {
    const newPm = { ...pmData, id: `pm-${Date.now()}`};
    if(!MOCK_PM_SCHEDULES[pmData.assetId]) MOCK_PM_SCHEDULES[pmData.assetId] = [];
    MOCK_PM_SCHEDULES[pmData.assetId].push(newPm);
    return simulateApiCall(newPm);
};
export const createAssetInspection = (inspectionData: Omit<AssetInspection, 'id'>): Promise<AssetInspection> => {
    const newInspection = { ...inspectionData, id: `insp-${Date.now()}` };
    if(!MOCK_INSPECTION_HISTORY[inspectionData.assetId]) MOCK_INSPECTION_HISTORY[inspectionData.assetId] = [];
    MOCK_INSPECTION_HISTORY[inspectionData.assetId].push(newInspection);
    
    const asset = MOCK_ASSETS.find(a => a.id === inspectionData.assetId);
    if (asset) {
        asset.lastTestedDate = newInspection.date;
    }

    return simulateApiCall(newInspection);
};
export const uploadAssetPhoto = (assetId: string, file: File) => {
    const asset = MOCK_ASSETS.find(a => a.id === assetId);
    if (asset) {
        const newPhoto: AssetPhoto = { id: `photo-${Date.now()}`, url: `https://picsum.photos/seed/${Date.now()}/800/600`, caption: file.name };
        if(!asset.photos) asset.photos = [];
        asset.photos.push(newPhoto);
        return simulateApiCall(newPhoto);
    }
    throw new Error('Asset not found');
};
export const uploadAssetDocument = (assetId: string, file: File) => {
     const asset = MOCK_ASSETS.find(a => a.id === assetId);
    if (asset) {
        const newDoc: AssetDocument = { id: `doc-${Date.now()}`, url: `/docs/${file.name}`, name: file.name };
        if(!asset.documents) asset.documents = [];
        asset.documents.push(newDoc);
        return simulateApiCall(newDoc);
    }
    throw new Error('Asset not found');
};
export const deleteAssetPhoto = (assetId: string, photoId: string) => {
     const asset = MOCK_ASSETS.find(a => a.id === assetId);
    if (asset && asset.photos) {
        asset.photos = asset.photos.filter(p => p.id !== photoId);
    }
    return simulateApiCall(undefined);
};
export const deleteAssetDocument = (assetId: string, docId: string) => {
      const asset = MOCK_ASSETS.find(a => a.id === assetId);
    if (asset && asset.documents) {
        asset.documents = asset.documents.filter(d => d.id !== docId);
    }
    return simulateApiCall(undefined);
};
export const updateAssetDocumentSummary = async (assetId: string, docId: string, summary: string) => {
    const asset = MOCK_ASSETS.find(a => a.id === assetId);
    if(asset?.documents) {
        const doc = asset.documents.find(d => d.id === docId);
        if (doc) doc.summary = summary;
    }
    return simulateApiCall(undefined);
};

export const getConsumables = () => simulateApiCall(MOCK_CONSUMABLES);
export const createConsumable = (data: Partial<Consumable>) => {
    const newConsumable: Consumable = { id: `con-${Date.now()}`, quantity: 0, usageHistory: [], ...data } as Consumable;
    MOCK_CONSUMABLES.push(newConsumable);
    return simulateApiCall(newConsumable);
};
export const updateConsumable = (id: string, data: Partial<Consumable>) => {
    const index = MOCK_CONSUMABLES.findIndex(c => c.id === id);
    if(index > -1) {
        const updatedItem = { ...MOCK_CONSUMABLES[index], ...data };
        MOCK_CONSUMABLES[index] = updatedItem;
        return simulateApiCall(updatedItem);
    }
    throw new Error('Consumable not found');
};
export const deleteConsumable = (id: string) => {
    const index = MOCK_CONSUMABLES.findIndex(c => c.id === id);
    if (index > -1) MOCK_CONSUMABLES.splice(index, 1);
    return simulateApiCall(undefined);
}
export const logConsumableUsage = (id: string, change: number, reason: string, userId: string) => {
    const item = MOCK_CONSUMABLES.find(c => c.id === id);
    const user = MOCK_PERSONNEL.find(p => p.id === userId);
    if (item && user) {
        item.quantity += change;
        if(!item.usageHistory) item.usageHistory = [];
        item.usageHistory.unshift({ id: `log-${Date.now()}`, date: new Date().toISOString(), change, reason, userId, userName: user.name });
    }
    return simulateApiCall(undefined);
}


// --- Documents ---
export const getFolders = (parentId: string | null) => simulateApiCall(MOCK_FOLDERS.filter(f => f.parentId === parentId));
export const getDocuments = (folderId: string | null) => simulateApiCall(MOCK_DOCUMENTS.filter(d => d.folderId === folderId));
export const getFolderBreadcrumbs = (folderId: string | null): Promise<Folder[]> => {
    if (!folderId) return simulateApiCall([]);
    const breadcrumbs: Folder[] = [];
    let currentId: string | null = folderId;
    while(currentId) {
        const folder = MOCK_FOLDERS.find(f => f.id === currentId);
        if (folder) {
            breadcrumbs.unshift(folder);
            currentId = folder.parentId;
        } else {
            currentId = null;
        }
    }
    return simulateApiCall(breadcrumbs);
};
export const createFolder = (data: { name: string; parentId: string | null }) => {
    const newFolder: Folder = { ...data, id: `f-${Date.now()}` };
    MOCK_FOLDERS.push(newFolder);
    return simulateApiCall(newFolder);
};
export const createDocument = (data: any) => {
     const newDoc: Document = { ...data, id: `d-${Date.now()}`, version: 1, modifiedAt: new Date().toISOString() };
    MOCK_DOCUMENTS.push(newDoc);
    return simulateApiCall(newDoc);
};
export const deleteFolder = (id: string) => {
    const index = MOCK_FOLDERS.findIndex(f => f.id === id);
    if(index > -1) MOCK_FOLDERS.splice(index, 1);
    return simulateApiCall(undefined);
};
export const deleteDocument = (id: string) => {
    const index = MOCK_DOCUMENTS.findIndex(d => d.id === id);
    if(index > -1) MOCK_DOCUMENTS.splice(index, 1);
    return simulateApiCall(undefined);
};

// --- Calendar & Scheduling ---
export const getEvents = () => simulateApiCall(MOCK_EVENTS);
export const getPublicEvents = () => simulateApiCall(MOCK_EVENTS.filter(e => e.category === EventCategory.PUBLIC_EVENT));
export const getShifts = () => simulateApiCall(MOCK_SHIFTS);
export const createEvent = (data: Omit<Event, 'id'>) => {
    const newEvent: Event = { ...data, id: `e-${Date.now()}` };
    MOCK_EVENTS.push(newEvent);
    return simulateApiCall(newEvent);
};
export const updateEvent = (id: string, data: Partial<Event>) => {
    const index = MOCK_EVENTS.findIndex(e => e.id === id);
    if (index > -1) {
        MOCK_EVENTS[index] = { ...MOCK_EVENTS[index], ...data };
        return simulateApiCall(MOCK_EVENTS[index]);
    }
    throw new Error("Event not found");
};
export const createShift = (data: any) => {
    const personnel = MOCK_PERSONNEL.find(p => p.id === data.personnelId);
    if(personnel) {
        const newShift: Shift = { ...data, id: `shift-${Date.now()}`, personnelName: personnel.name };
        MOCK_SHIFTS.push(newShift);
        return simulateApiCall(newShift);
    }
    throw new Error('Personnel not found');
};


// --- GIS / Infrastructure ---
export const getGisMapItems = () => simulateApiCall([
    ...MOCK_PROPERTIES.map(p => ({type: 'property', data: p})),
    ...MOCK_GIS_HYDRANTS.map(h => ({type: 'hydrant', data: h})),
    ...MOCK_NFIRS_INCIDENTS.filter(i => i.status === 'In Progress').map(i => ({type: 'incident', data: i})),
    ...MOCK_APPARATUS.map(a => ({type: 'apparatus', data: a})),
].filter(item => item.data.location));
export const getHydrants = () => simulateApiCall(MOCK_GIS_HYDRANTS);
export const createHydrant = (data: Partial<Hydrant>) => {
    const newHydrant: Hydrant = {
        id: `hyd-${Date.now()}`,
        location: { lat: 50, lng: 50 },
        status: 'In Service',
        lastInspectionDate: new Date().toISOString(),
        inspections: [],
        address: 'New Hydrant Address',
        type: 'Dry Barrel',
        manufacturer: 'Unknown',
        zone: 'Uncategorized',
        nextInspectionDueDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        ...data,
    };
    MOCK_GIS_HYDRANTS.push(newHydrant);
    return simulateApiCall(newHydrant);
};
export const updateHydrant = (id: string, data: Partial<Hydrant>) => {
    const index = MOCK_GIS_HYDRANTS.findIndex(h => h.id === id);
    if (index > -1) {
        MOCK_GIS_HYDRANTS[index] = { ...MOCK_GIS_HYDRANTS[index], ...data };
        return simulateApiCall(MOCK_GIS_HYDRANTS[index]);
    }
    throw new Error('Hydrant not found');
};
export const createHydrantInspection = (data: Omit<HydrantInspection, 'id'>) => {
    const hydrant = MOCK_GIS_HYDRANTS.find(h => h.id === data.hydrantId);
    if (hydrant) {
        const newInspection = { ...data, id: `insp-${Date.now()}` };
        hydrant.inspections.unshift(newInspection);
        hydrant.lastInspectionDate = newInspection.date;
        return simulateApiCall(newInspection);
    }
    throw new Error('Hydrant not found');
};
export const getProperties = async (filters?: { occupancyType?: string; hasPip?: boolean }) => {
    const owners = await getOwners();
    const ownerMap = new Map(owners.map(o => [o.id, o.name]));
    let propertiesWithOwners = MOCK_PROPERTIES.map(p => ({
        ...p,
        ownerNames: p.ownerIds.map(id => ownerMap.get(id) || 'Unknown').join(', ')
    }));
    
    if (filters) {
        if (filters.occupancyType && filters.occupancyType !== 'All') {
            propertiesWithOwners = propertiesWithOwners.filter(p => p.occupancyType === filters.occupancyType);
        }
        if (filters.hasPip !== undefined) {
            propertiesWithOwners = propertiesWithOwners.filter(p => !!p.preIncidentPlan === filters.hasPip);
        }
    }
    
    return simulateApiCall(propertiesWithOwners);
};
export const getPropertyById = (id: string) => simulateApiCall(MOCK_PROPERTIES.find(p => p.id === id) || null);
export const createProperty = (data: Partial<Property>): Promise<Property> => {
    const newProperty: Property = {
        id: `prop-${Date.now()}`,
        parcelId: 'N/A',
        address: 'New Property Address',
        ownerIds: [],
        location: { lat: 48 + Math.random() * 5, lng: 48 + Math.random() * 5 },
        preIncidentPlan: null,
        fireProtection: { sprinklerSystem: 'None' },
        utilityShutoffs: { gas: '', water: '', electric: '' },
        knownHazards: [],
        inspections: [],
        documents: [],
        activityLog: [],
        ...data,
    };
    MOCK_PROPERTIES.push(newProperty);
    return simulateApiCall(newProperty);
};
export const importProperties = (data: string) => {
    const newProp: Property = {
        id: `prop-${Date.now()}`,
        parcelId: '010-011-012',
        address: '999 Imported Ave',
        ownerIds: ['o-002'],
        location: { lat: 45, lng: 55 },
        preIncidentPlan: null,
        constructionType: 'Wood-Frame',
        occupancyType: 'Residential - Single Family',
        stories: 1,
        fireProtection: { sprinklerSystem: 'None' },
        utilityShutoffs: { gas: '', water: '', electric: '' },
        knownHazards: [],
        inspections: [],
        documents: [],
        activityLog: [],
    };
    MOCK_PROPERTIES.push(newProp);
    return simulateApiCall(undefined);
};
export const getOwners = () => simulateApiCall(MOCK_OWNERS);
export const getPIPByPropertyId = (id: string) => simulateApiCall(MOCK_PRE_INCIDENT_PLANS.find(p => p.propertyId === id) || null);
export const createPIPForProperty = (propertyId: string) => {
    const newPip: PreIncidentPlan = {
        id: `pip-${Date.now()}`,
        propertyId,
        tacticalSummary: '',
        accessNotes: '',
        floorPlans: [],
        photos: [],
        companyNotes: {
            engine: '',
            truck: '',
            command: ''
        }
    };
    MOCK_PRE_INCIDENT_PLANS.push(newPip);
    const prop = MOCK_PROPERTIES.find(p => p.id === propertyId);
    if(prop) prop.preIncidentPlan = newPip;
    return simulateApiCall(newPip);
}
export const updatePIP = (id: string, data: Partial<PreIncidentPlan>) => {
    const index = MOCK_PRE_INCIDENT_PLANS.findIndex(p => p.id === id);
    if (index > -1) {
        const updatedPip = { ...MOCK_PRE_INCIDENT_PLANS[index], ...data };
        MOCK_PRE_INCIDENT_PLANS[index] = updatedPip;
        return simulateApiCall(updatedPip);
    }
    throw new Error('PIP not found');
};


// --- Financials ---
export const getBudgetData = () => simulateApiCall(MOCK_BUDGET);
export const addLineItemToBudget = (data: any) => {
    const newItem: LineItem = { ...data, id: `li-${Date.now()}`, actualAmount: 0 };
    MOCK_BUDGET.lineItems.push(newItem);
    MOCK_BUDGET.totalBudget += newItem.budgetedAmount;
    return simulateApiCall(newItem);
};
export const updateLineItem = (id: string, data: Partial<LineItem>) => {
     const index = MOCK_BUDGET.lineItems.findIndex(li => li.id === id);
     if(index > -1) {
        const updatedItem = {...MOCK_BUDGET.lineItems[index], ...data};
        MOCK_BUDGET.lineItems[index] = updatedItem;
        return simulateApiCall(updatedItem);
     }
     throw new Error('Line item not found');
};
export const deleteLineItem = (id: string) => {
    const index = MOCK_BUDGET.lineItems.findIndex(li => li.id === id);
    if (index > -1) {
      const deletedItem = MOCK_BUDGET.lineItems.splice(index, 1)[0];
      MOCK_BUDGET.totalBudget -= deletedItem.budgetedAmount;
      MOCK_BUDGET.totalSpent -= deletedItem.actualAmount;
    }
    return simulateApiCall(undefined);
};

export const getTransactionsForLineItem = (lineItemId: string) => {
    return simulateApiCall(MOCK_TRANSACTIONS[lineItemId] || []);
};

export const getFireDuesWithDetails = async (): Promise<(FireDue & { address: string; ownerName: string; parcelId: string; })[]> => {
    const owners = await getOwners();
    const props = MOCK_PROPERTIES;
    const ownerMap = new Map(owners.map(o => [o.id, o.name]));
    const propMap = new Map(props.map(p => [p.id, { address: p.address, parcelId: p.parcelId }]));

    const detailedDues = MOCK_FIRE_DUES.map(due => {
        const propDetails = propMap.get(due.propertyId);
        const property = props.find(p => p.id === due.propertyId);
        
        return {
            ...due,
            address: propDetails?.address || 'N/A',
            parcelId: propDetails?.parcelId || 'N/A',
            ownerName: property?.ownerIds.map(id => ownerMap.get(id) || 'Unknown').join(', ') || 'N/A',
        }
    });
    return simulateApiCall(detailedDues);
};

export const updateFireDueStatus = (id: string, status: FireDueStatus) => {
    const due = MOCK_FIRE_DUES.find(d => d.id === id);
    if (due) {
        due.status = status;
        if (status === FireDueStatus.PAID) {
            due.paymentDate = new Date().toISOString();
        } else {
            delete due.paymentDate;
        }
    }
    return simulateApiCall(undefined);
};

export const updateMultipleFireDueStatus = (ids: string[], status: FireDueStatus) => {
    MOCK_FIRE_DUES.forEach(due => {
        if (ids.includes(due.id)) {
            due.status = status;
            if (status === FireDueStatus.PAID) {
                due.paymentDate = new Date().toISOString();
            } else {
                delete due.paymentDate;
            }
        }
    });
    return simulateApiCall(undefined);
};

export const createFireDue = (data: Partial<FireDue>) => {
    const newDue: FireDue = {
        id: `fd-${Date.now()}`,
        status: FireDueStatus.UNPAID,
        ...data,
    } as FireDue;
    MOCK_FIRE_DUES.unshift(newDue);
    return simulateApiCall(newDue);
};

export const updateFireDue = (id: string, data: Partial<FireDue>) => {
    const index = MOCK_FIRE_DUES.findIndex(d => d.id === id);
    if (index > -1) {
        MOCK_FIRE_DUES[index] = { ...MOCK_FIRE_DUES[index], ...data };
        return simulateApiCall(MOCK_FIRE_DUES[index]);
    }
    throw new Error('Fire Due not found');
};

export const deleteFireDue = (id: string) => {
    const index = MOCK_FIRE_DUES.findIndex(d => d.id === id);
    if (index > -1) {
        MOCK_FIRE_DUES.splice(index, 1);
    }
    return simulateApiCall(undefined);
};


export const payFireDue = (id: string) => updateFireDueStatus(id, FireDueStatus.PAID);

export const getBillingRates = () => simulateApiCall(MOCK_BILLING_RATES);
export const updateBillingRates = (rates: BillingRate[]) => {
    MOCK_BILLING_RATES.splice(0, MOCK_BILLING_RATES.length, ...rates);
    return simulateApiCall(undefined);
};
export const setAnnualFireDue = (amount: number, year: number) => {
    let updatedCount = 0;
    MOCK_FIRE_DUES.forEach(due => {
        if(due.year === year && due.status === FireDueStatus.UNPAID) {
            due.amount = amount;
            updatedCount++;
        }
    });
    return simulateApiCall({ updatedCount });
};

export const getFinancialsDashboardStats = async () => {
    const invoices = await getInvoices();
    const billableIncidents = await getBillableIncidents();
    const currentYear = new Date().getFullYear();

    const totalOutstanding = invoices
        .filter(i => i.status === 'Sent' || i.status === 'Overdue')
        .reduce((sum, i) => sum + i.totalAmount, 0);

    const totalOverdue = invoices
        .filter(i => i.status === 'Overdue')
        .reduce((sum, i) => sum + i.totalAmount, 0);

    const collectedYTD = invoices
        .filter(i => i.status === 'Paid' && i.paidDate && new Date(i.paidDate).getFullYear() === currentYear)
        .reduce((sum, i) => sum + i.totalAmount, 0);
        
    const invoiceStatusCounts = invoices.reduce((acc, inv) => {
        acc[inv.status] = (acc[inv.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const month = new Date(currentYear, i, 1);
        const revenue = invoices
            .filter(inv => inv.status === 'Paid' && inv.paidDate && new Date(inv.paidDate).getMonth() === i && new Date(inv.paidDate).getFullYear() === currentYear)
            .reduce((sum, inv) => sum + inv.totalAmount, 0);
        return {
            name: month.toLocaleString('default', { month: 'short' }),
            amount: revenue
        };
    });

    const stats = {
        totalOutstanding,
        totalOverdue,
        collectedYTD,
        pendingIncidents: billableIncidents.length,
        invoiceStatusCounts,
        monthlyRevenue
    };

    return simulateApiCall(stats);
};

// --- Invoicing ---
export const getBillableIncidents = () => simulateApiCall(MOCK_INCIDENTS.filter(i => i.type === 'MVA' && !MOCK_INVOICES.some(inv => inv.incidentId === i.id)));
export const getInvoices = () => simulateApiCall(MOCK_INVOICES);
export const generateInvoiceForIncident = (id: string) => {
    const incident = MOCK_INCIDENTS.find(i => i.id === id);
    const property = MOCK_PROPERTIES.find(p => p.address === incident?.address);
    if(incident && property) {
        const issueDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(issueDate.getDate() + 30);
        const newInvoice: Invoice = {
            id: `inv-${Date.now()}`,
            incidentId: incident.id,
            incidentNumber: incident.incidentNumber,
            propertyId: property.id,
            propertyAddress: property.address,
            date: issueDate.toISOString(),
            dueDate: dueDate.toISOString(),
            lineItems: [{description: 'MVA Response', quantity: 1, rate: 450, total: 450}],
            totalAmount: 450,
            status: 'Draft'
        };
        MOCK_INVOICES.push(newInvoice);
        return simulateApiCall(newInvoice);
    }
    throw new Error('Could not generate invoice');
};
export const generateMultipleInvoices = async (incidentIds: string[]) => {
    for (const id of incidentIds) {
        await generateInvoiceForIncident(id);
    }
    return simulateApiCall(undefined);
};
export const updateMultipleInvoiceStatus = (invoiceIds: string[], status: Invoice['status']) => {
    MOCK_INVOICES.forEach(inv => {
        if (invoiceIds.includes(inv.id)) {
            inv.status = status;
            if (status === 'Paid') {
                inv.paidDate = new Date().toISOString();
            }
             if (status === 'Sent') {
                inv.sentDate = new Date().toISOString();
            }
        }
    });
    return simulateApiCall(undefined);
};



// --- Health & Safety ---
export const getExposureLogs = async (userId: string, role: Role) => {
    let logs = MOCK_EXPOSURE_LOGS;
    if (role === Role.FIREFIGHTER) {
        logs = logs.filter(log => log.personnelId === userId);
    }
    const personnel = await getPersonnelList();
    const logsWithNames = logs.map(log => ({
        ...log,
        personnelName: personnel.find(p => p.id === log.personnelId)?.name || 'Unknown'
    }));
    return simulateApiCall(logsWithNames);
};
export const createExposureLog = (data: Omit<ExposureLog, 'id'>) => {
    const newLog: ExposureLog = { ...data, id: `exp-${Date.now()}` };
    MOCK_EXPOSURE_LOGS.push(newLog);
    return simulateApiCall(newLog);
};
export const getSdsSheets = (term: string) => {
    if(!term) return simulateApiCall(MOCK_SDS_SHEETS);
    const lowerTerm = term.toLowerCase();
    return simulateApiCall(MOCK_SDS_SHEETS.filter(s => s.productName.toLowerCase().includes(lowerTerm) || s.manufacturer.toLowerCase().includes(lowerTerm)));
};
export const createSdsSheet = (data: Omit<SdsSheet, 'id' | 'uploadedAt'>) => {
    const newSheet: SdsSheet = { ...data, id: `sds-${Date.now()}`, uploadedAt: new Date().toISOString() };
    MOCK_SDS_SHEETS.push(newSheet);
    return simulateApiCall(newSheet);
};
export const getExpiringCertifications = (): Promise<ExpiringCertification[]> => {
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const expiring: ExpiringCertification[] = [];
    MOCK_PERSONNEL.forEach(p => {
        p.certifications.forEach(cert => {
            const expiryDate = new Date(cert.expires);
            if (expiryDate <= ninetyDaysFromNow) {
                expiring.push({
                    personnelId: p.id,
                    personnelName: p.name,
                    certificationName: cert.name,
                    expires: cert.expires,
                });
            }
        });
    });
    return simulateApiCall(expiring.sort((a,b) => new Date(a.expires).getTime() - new Date(b.expires).getTime()));
};

// --- Public Portal Admin ---
export const getAnnouncements = () => simulateApiCall([...MOCK_ANNOUNCEMENTS].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
export const createAnnouncement = (data: { title: string, content: string, authorId: string }) => {
    const newAnnouncement: Announcement = { ...data, id: `ann-${Date.now()}`, createdAt: new Date().toISOString() };
    MOCK_ANNOUNCEMENTS.push(newAnnouncement);
    return simulateApiCall(newAnnouncement);
};
export const updateAnnouncement = (id: string, data: Partial<Announcement>) => {
    const index = MOCK_ANNOUNCEMENTS.findIndex(a => a.id === id);
    if(index > -1) {
        const updatedAnn = { ...MOCK_ANNOUNCEMENTS[index], ...data };
        MOCK_ANNOUNCEMENTS[index] = updatedAnn;
        return simulateApiCall(updatedAnn);
    }
    throw new Error('Announcement not found');
};
export const deleteAnnouncement = (id: string) => {
    const index = MOCK_ANNOUNCEMENTS.findIndex(a => a.id === id);
    if (index > -1) MOCK_ANNOUNCEMENTS.splice(index, 1);
    return simulateApiCall(undefined);
};

export const getStormShelters = () => simulateApiCall(MOCK_STORM_SHELTERS);
export const createStormShelter = (data: any) => {
    const newShelter = { ...data, id: `ss-${Date.now()}`, registeredAt: new Date().toISOString() };
    MOCK_STORM_SHELTERS.push(newShelter);
    return simulateApiCall(newShelter);
};

export const getBurnPermits = () => simulateApiCall(MOCK_BURN_PERMITS);
export const createBurnPermit = (data: any) => {
    const newPermit = { ...data, id: `bp-${Date.now()}`, status: BurnPermitStatus.PENDING };
    MOCK_BURN_PERMITS.push(newPermit);
    return simulateApiCall(newPermit);
};
export const updateBurnPermitStatus = (id: string, status: BurnPermitStatus) => {
    const permit = MOCK_BURN_PERMITS.find(p => p.id === id);
    if(permit) permit.status = status;
    return simulateApiCall(permit);
};

// --- Reporting ---
export const getPrebuiltReports = () => simulateApiCall(MOCK_PREBUILT_REPORTS);
export const getReportData = async (reportId: string): Promise<{ data: any[], columns: any[] }> => {
    if (reportId === 'rep-1') {
        const data = await getIncidentsList();
        return {
            data,
            columns: [
                { header: 'Incident #', accessor: (item: Incident) => item.incidentNumber },
                { header: 'Type', accessor: (item: Incident) => item.type },
                { header: 'Date', accessor: (item: Incident) => new Date(item.date).toLocaleDateString() },
            ]
        };
    }
    return simulateApiCall({ data: [], columns: [] });
};
export const generateCustomReport = async (config: CustomReportConfig): Promise<{ data: any[], columns: any[] }> => {
    let sourceData: any[] = [];
    if (config.dataSource === 'incidents') sourceData = await getIncidentsList().then(incidents => incidents.map(i => ({...i, ...i.basicModule, ...i.basicModule.sectionG, ...i.basicModule.sectionA})));
    if (config.dataSource === 'personnel') sourceData = await getPersonnelList();
    if (config.dataSource === 'apparatus') sourceData = await getApparatusList();
    if (config.dataSource === 'assets') sourceData = await getAssets();
    
    const columns = config.fields.map(fieldId => {
        const allFields = DATA_SOURCE_FIELDS[config.dataSource];
        const fieldConfig = allFields.find(f => f.id === fieldId);
        return {
            header: fieldConfig ? fieldConfig.label : fieldId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
            accessor: (item: any) => item[fieldId]
        }
    });
    
    // basic filtering
    const filteredData = sourceData.filter(item => {
        return config.filters.every(filter => {
            if(!item[filter.field]) return false;
            const itemValue = String(item[filter.field]).toLowerCase();
            const filterValue = filter.value.toLowerCase();
            if (filter.condition === 'is') return itemValue === filterValue;
            if (filter.condition === 'contains') return itemValue.includes(filterValue);
            if (filter.condition === 'is_not') return itemValue !== filterValue;
            if (filter.condition === 'does_not_contain') return !itemValue.includes(filterValue);
            const numItemValue = parseFloat(itemValue);
            const numFilterValue = parseFloat(filterValue);
            if(isNaN(numItemValue) || isNaN(numFilterValue)) return true;
            if(filter.condition === 'is_greater_than') return numItemValue > numFilterValue;
            if(filter.condition === 'is_less_than') return numItemValue < numFilterValue;
            return true;
        });
    });

    const data = filteredData.map(item => {
        const row = {};
        config.fields.forEach(field => {
            row[field] = item[field];
        });
        return row;
    });

    return simulateApiCall({ data, columns });
};
export const getCustomReports = () => simulateApiCall(MOCK_CUSTOM_REPORTS);
export const saveCustomReport = (report: Omit<CustomReport, 'id'>) => {
    const newReport: CustomReport = { ...report, id: `crep-${Date.now()}` };
    MOCK_CUSTOM_REPORTS.push(newReport);
    return simulateApiCall(newReport);
};
export const deleteCustomReport = (reportId: string) => {
    const index = MOCK_CUSTOM_REPORTS.findIndex(r => r.id === reportId);
    if (index > -1) {
        MOCK_CUSTOM_REPORTS.splice(index, 1);
    }
    return simulateApiCall(undefined);
};
export const getAlertRules = () => simulateApiCall(MOCK_ALERT_RULES);
export const saveAlertRule = (rule: Partial<AlertRule>) => {
    const index = MOCK_ALERT_RULES.findIndex(r => r.metric === rule.metric);
    if (index > -1) {
        MOCK_ALERT_RULES[index] = { ...MOCK_ALERT_RULES[index], ...rule };
        return simulateApiCall(MOCK_ALERT_RULES[index]);
    } else {
        const newRule: AlertRule = { ...rule, id: `alert-${Date.now()}` } as AlertRule;
        MOCK_ALERT_RULES.push(newRule);
        return simulateApiCall(newRule);
    }
};


export const getAnalyticsData = async (dateRange?: {start: Date, end: Date}) => {
    const incidents = MOCK_NFIRS_INCIDENTS;
    const apparatusReadiness = {
        inService: MOCK_APPARATUS.filter(a => a.status === ApparatusStatus.IN_SERVICE).length,
        outOfService: MOCK_APPARATUS.filter(a => a.status === ApparatusStatus.OUT_OF_SERVICE).length,
        maintenance: MOCK_APPARATUS.filter(a => a.status === ApparatusStatus.MAINTENANCE).length,
    };
    const incidentTypes = incidents.reduce((acc, inc) => {
        const typeName = NFIRS_INCIDENT_TYPES.find(t => t.code === inc.basicModule.incidentType)?.description || 'Unknown';
        acc[typeName] = (acc[typeName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const incidentTypeBreakdown = Object.entries(incidentTypes).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);

    const responseTimes = Array.from({length: 12}, (_, i) => ({
        month: new Date(2025, i, 1).toLocaleString('default', { month: 'short' }),
        avgTime: 5.5 + Math.random() * 2 - 1
    }));
    
    const assetOverview = {
        nearingEol: MOCK_ASSETS.filter(a => a.retirementDate && new Date(a.retirementDate) < new Date(new Date().setFullYear(new Date().getFullYear() + 1))).length,
        inspectionsDue: MOCK_ASSETS.filter(a => a.nextTestDueDate && new Date(a.nextTestDueDate) < new Date(new Date().setDate(new Date().getDate() + 90))).length,
    };

    const requiredCourses = ['tc-1', 'tc-3'];
    const nonCompliantPersonnel = MOCK_PERSONNEL.filter(p => {
        const completedCourses = new Set(p.trainingHistory.map(t => t.courseId));
        return !requiredCourses.every(rc => completedCourses.has(rc));
    });
    const trainingCompliance = {
        compliant: MOCK_PERSONNEL.length - nonCompliantPersonnel.length,
        nonCompliant: nonCompliantPersonnel.length,
        total: MOCK_PERSONNEL.length,
    };

    const data = {
        incidentsByMonth: [
            { name: 'Jan', count: 40 }, { name: 'Feb', count: 30 }, { name: 'Mar', count: 50 },
            { name: 'Apr', count: 45 }, { name: 'May', count: 60 }, { name: 'Jun', count: 55 },
        ],
        trainingCompliance: [ { name: 'Compliant', value: trainingCompliance.compliant }, { name: 'Non-Compliant', value: trainingCompliance.nonCompliant }],
        trainingComplianceAbs: trainingCompliance,
        budgetPerformance: MOCK_BUDGET.lineItems.map(li => ({ name: li.category, budgeted: li.budgetedAmount, spent: li.actualAmount })),
        budgetOverview: {
            totalBudget: MOCK_BUDGET.totalBudget,
            totalSpent: MOCK_BUDGET.totalSpent
        },
        apparatusReadiness: [
            { name: 'In Service', value: apparatusReadiness.inService },
            { name: 'Out of Service', value: apparatusReadiness.outOfService },
            { name: 'Maintenance', value: apparatusReadiness.maintenance }
        ],
        incidentTypeBreakdown,
        responseTimes,
        assetOverview
    };

    // Check for alerts
    const rules = await getAlertRules();
    rules.forEach(rule => {
        let metricValue: number | null = null;
        let message = '';
        if (rule.metric === 'training_compliance') {
            const compliancePercentage = (trainingCompliance.compliant / trainingCompliance.total) * 100;
            metricValue = compliancePercentage;
            if (rule.condition === 'less_than' && metricValue < rule.threshold) {
                message = `Training compliance has dropped to ${metricValue.toFixed(1)}%, below the ${rule.threshold}% threshold.`;
            }
        }
        
        if(message) {
            const oneHourAgo = new Date(Date.now() - 3600 * 1000);
            if (!rule.lastTriggered || new Date(rule.lastTriggered) < oneHourAgo) {
                 if(!MOCK_NOTIFICATIONS.some(n => n.message === message)) {
                     MOCK_NOTIFICATIONS.unshift({
                        id: `notif-alert-${Date.now()}`,
                        type: 'alert',
                        message,
                        link: '/app/reporting',
                        timestamp: new Date().toISOString(),
                        read: false,
                    });
                 }
                rule.lastTriggered = new Date().toISOString();
            }
        }
    });

    return simulateApiCall(data);
};


// --- Settings ---
export const getConfiguration = () => simulateApiCall(MOCK_CONFIGURATION);
export const updateConfiguration = (config: SystemConfiguration) => {
    Object.assign(MOCK_CONFIGURATION, config);
    return simulateApiCall(MOCK_CONFIGURATION);
};
export const getDepartmentInfo = () => simulateApiCall(MOCK_DEPARTMENT_INFO);
export const updateDepartmentInfo = (info: DepartmentInfo) => {
    Object.assign(MOCK_DEPARTMENT_INFO, info);
    return simulateApiCall(MOCK_DEPARTMENT_INFO);
};
export const getSecurityRoles = () => simulateApiCall(MOCK_SECURITY_ROLES);
export const updateSecurityRole = (role: SecurityRole) => {
    const index = MOCK_SECURITY_ROLES.findIndex(r => r.id === role.id);
    if(index > -1) {
        MOCK_SECURITY_ROLES[index] = role;
    } else {
        role.id = `role-${Date.now()}`;
        MOCK_SECURITY_ROLES.push(role);
    }
    return simulateApiCall(role);
};


// --- Citizen Admin ---
export const getPendingCitizens = () => simulateApiCall(MOCK_CITIZENS.filter(c => c.status === CitizenStatus.PENDING_APPROVAL));
export const updateCitizenStatus = (id: string, newStatus: CitizenStatus) => {
    const citizen = MOCK_CITIZENS.find(c => c.id === id);
    if (citizen) {
        citizen.status = newStatus;
        return simulateApiCall(citizen);
    }
    throw new Error('Citizen not found');
};
export const getPendingForgivenessRequests = async () => {
    const pending = MOCK_BILL_FORGIVENESS_REQUESTS.filter(r => r.status === 'Pending');
    const citizens = await getCitizenDetails(null);
    const dues = await getFireDuesWithDetails();
    const detailed = pending.map(req => ({
        ...req,
        citizenName: citizens.find(c => c.id === req.citizenId)?.name || 'Unknown',
        fireDueInfo: `${dues.find(d => d.id === req.fireDueId)?.year} Bill` || 'Unknown Bill'
    }));
    return simulateApiCall(detailed);
};
export const updateForgivenessRequestStatus = (id: string, newStatus: 'Approved' | 'Denied') => {
    const request = MOCK_BILL_FORGIVENESS_REQUESTS.find(r => r.id === id);
    if(request) {
        request.status = newStatus;
        if(newStatus === 'Approved') {
            const due = MOCK_FIRE_DUES.find(d => d.id === request.fireDueId);
            if(due) due.status = FireDueStatus.PAID;
        }
        return simulateApiCall(request);
    }
     throw new Error('Request not found');
};
export const createBillForgivenessRequest = (citizenId: string, fireDueId: string, reason: string) => {
    const newRequest: BillForgivenessRequest = {
        id: `bfr-${Date.now()}`,
        citizenId, fireDueId, reason,
        submittedAt: new Date().toISOString(),
        status: 'Pending'
    };
    MOCK_BILL_FORGIVENESS_REQUESTS.push(newRequest);
    return simulateApiCall(newRequest);
}


// --- Citizen Portal ---
export const getCitizenDashboardData = async (citizenId: string) => {
    const citizen = MOCK_CITIZENS.find(c => c.id === citizenId);
    if (citizen) {
        const properties = MOCK_PROPERTIES.filter(p => citizen.propertyIds.includes(p.id));
        const dues = MOCK_FIRE_DUES.filter(d => citizen.propertyIds.includes(d.propertyId));
        return simulateApiCall({ properties, dues });
    }
    return { properties: [], dues: [] };
};
export const getOverdueDuesForCitizen = (citizenId: string) => {
    const citizen = MOCK_CITIZENS.find(c => c.id === citizenId);
    if(citizen) {
        return simulateApiCall(MOCK_FIRE_DUES.filter(d => citizen.propertyIds.includes(d.propertyId) && d.status === FireDueStatus.OVERDUE));
    }
    return simulateApiCall([]);
};

export function getCitizenDetails(id: string): Promise<Citizen | null>;
export function getCitizenDetails(id: null): Promise<Citizen[]>;
export function getCitizenDetails(id: string | null): Promise<Citizen | Citizen[] | null> {
    if (id) {
        return simulateApiCall(MOCK_CITIZENS.find(c => c.id === id) || null);
    }
    return simulateApiCall(MOCK_CITIZENS);
};

export const updateCitizenDetails = (id: string, data: Partial<Citizen>) => {
    const index = MOCK_CITIZENS.findIndex(c => c.id === id);
    if(index > -1) {
        const updatedCitizen = {...MOCK_CITIZENS[index], ...data };
        MOCK_CITIZENS[index] = updatedCitizen;
        return simulateApiCall(updatedCitizen);
    }
    throw new Error('Citizen not found');
};
export const addPhoneNumber = (citizenId: string, phone: { number: string, type: 'Mobile' | 'Home' | 'Work'}) => {
    const citizen = MOCK_CITIZENS.find(c => c.id === citizenId);
    if (citizen) {
        if (!citizen.phoneNumbers) citizen.phoneNumbers = [];
        citizen.phoneNumbers.push(phone);
    }
    return simulateApiCall(undefined);
};

export const deletePhoneNumber = (citizenId: string, numberToDelete: string): Promise<void> => {
    const citizen = MOCK_CITIZENS.find(c => c.id === citizenId);
    if (citizen) {
        citizen.phoneNumbers = (citizen.phoneNumbers || []).filter(p => p.number !== numberToDelete);
    }
    return simulateApiCall(undefined);
};

export const updateNotificationPreferences = (citizenId: string, preferences: Record<string, boolean>): Promise<void> => {
    const citizen = MOCK_CITIZENS.find(c => c.id === citizenId);
    if (citizen) {
        citizen.notificationPreferences = preferences;
    }
    return simulateApiCall(undefined);
};

// --- Public Content ---
export const getAboutUsContent = (): Promise<AboutUsContent> => simulateApiCall(MOCK_ABOUT_US_CONTENT);
export const getLeadershipTeam = (): Promise<LeadershipMember[]> => {
    const leaders: LeadershipMember[] = MOCK_PERSONNEL
      .filter(p => [Role.CHIEF, Role.TRAINING_OFFICER].includes(p.role) || p.rank === 'Captain' || p.rank === 'Lieutenant')
      .map(p => ({
          id: p.id,
          name: p.name,
          rank: p.rank,
          avatarUrl: p.avatarUrl,
          bio: `A dedicated member of the Anytown Fire Department serving as ${p.rank}.`
      }));
    return simulateApiCall(leaders);
  };
export const getPhotoAlbums = (): Promise<PhotoAlbum[]> => simulateApiCall(MOCK_PHOTO_ALBUMS);
export const getAlbumWithPhotos = async (albumId: string): Promise<{album: PhotoAlbum, photos: Photo[]} | null> => {
    const album = MOCK_PHOTO_ALBUMS.find(a => a.id === albumId);
    if (!album) return simulateApiCall(null);
    const photos = MOCK_PHOTOS.filter(p => p.albumId === albumId);
    return simulateApiCall({ album, photos });
};
export const createPhotoAlbum = (data: { title: string, description: string }): Promise<PhotoAlbum> => {
    const newAlbum: PhotoAlbum = {
        id: `album-${Date.now()}`,
        title: data.title,
        description: data.description,
        coverPhotoUrl: `https://picsum.photos/seed/${Date.now()}/600/400`
    };
    MOCK_PHOTO_ALBUMS.push(newAlbum);
    return simulateApiCall(newAlbum);
};
export const uploadPhoto = (albumId: string, caption: string): Promise<Photo> => {
    const newPhoto: Photo = {
        id: `p-${albumId}-${Date.now()}`,
        albumId,
        caption,
        url: `https://picsum.photos/seed/photo-${Date.now()}/1024/768`,
        dateTaken: new Date().toISOString(),
    };
    MOCK_PHOTOS.push(newPhoto);
    return simulateApiCall(newPhoto);
};
export const getRecordsRequests = () => simulateApiCall(MOCK_RECORDS_REQUESTS);
export const createRecordsRequest = (data: Omit<RecordsRequest, 'id' | 'status' | 'submittedAt'>) => {
    const newRequest: RecordsRequest = {
        ...data,
        id: `rr-${Date.now()}`,
        status: RecordsRequestStatus.PENDING,
        submittedAt: new Date().toISOString()
    };
    MOCK_RECORDS_REQUESTS.push(newRequest);
    return simulateApiCall(newRequest);
};
export const updateRecordsRequestStatus = (id: string, status: RecordsRequestStatus) => {
    const request = MOCK_RECORDS_REQUESTS.find(r => r.id === id);
    if (request) request.status = status;
    return simulateApiCall(undefined);
};

// --- Mass Communication ---
export const sendMassNotification = (data: { subject: string, message: string, targetAudience: string[], deliveryChannels: string[] }) => {
    console.log("Sending notification:", data);
    return simulateApiCall(undefined);
};

// --- Internal Comms ---
export const getInternalMessages = () => simulateApiCall(MOCK_INTERNAL_MESSAGES);
export const createInternalMessage = (authorId: string, content: string) => {
    const author = MOCK_PERSONNEL.find(p => p.id === authorId);
    if (!author) throw new Error("Author not found");
    const newMessage: InternalMessage = {
        id: `im-${Date.now()}`,
        authorId,
        authorName: author.name,
        authorAvatar: author.avatarUrl,
        content,
        timestamp: new Date().toISOString(),
    };
    MOCK_INTERNAL_MESSAGES.unshift(newMessage);
    return simulateApiCall(newMessage);
};

// --- Attachments ---
export const uploadAttachment = (incidentId: string, file: File): Promise<Attachment> => {
    const newAttachment: Attachment = {
        id: `att-${Date.now()}`,
        fileName: file.name,
        fileType: file.type,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        url: URL.createObjectURL(file), // Mock URL
    };

    if (!MOCK_ATTACHMENTS[incidentId]) {
        MOCK_ATTACHMENTS[incidentId] = [];
    }
    MOCK_ATTACHMENTS[incidentId].push(newAttachment);
    
    const incident = MOCK_NFIRS_INCIDENTS.find(i => i.id === incidentId);
    if (incident) {
        if (!incident.attachments) incident.attachments = [];
        incident.attachments.push(newAttachment);
    }

    return simulateApiCall(newAttachment);
};

export const deleteAttachment = (incidentId: string, attachmentId: string): Promise<void> => {
    if (MOCK_ATTACHMENTS[incidentId]) {
        MOCK_ATTACHMENTS[incidentId] = MOCK_ATTACHMENTS[incidentId].filter(a => a.id !== attachmentId);
    }
    const incident = MOCK_NFIRS_INCIDENTS.find(i => i.id === incidentId);
    if (incident && incident.attachments) {
        incident.attachments = incident.attachments.filter(a => a.id !== attachmentId);
    }
    return simulateApiCall(undefined);
};
