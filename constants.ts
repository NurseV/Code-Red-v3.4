

import { 
    HomeIcon, UsersIcon, TruckIcon, AlertTriangleIcon, FireExtinguisherIcon, DollarSignIcon, 
    ArchiveIcon, ShieldCheckIcon, ClipboardListIcon, GraduationCapIcon, FolderIcon, 
    MapIcon, CalendarIcon, PieChartIcon, BanknoteIcon, HeartPulseIcon, 
    DropletIcon, BuildingIcon, LandmarkIcon, WrenchIcon, CalendarDaysIcon,
    TrendingUpIcon, MessageSquareIcon, SettingsIcon, MailIcon, ListChecksIcon
} from './components/icons/Icons';

import { 
    Personnel, Apparatus, Incident, Role, User, ApparatusStatus,
    Owner, Property, FireDue, FireDueStatus, Announcement, StormShelter, BurnPermit, BurnPermitStatus, 
    Citizen, CitizenStatus, BillForgivenessRequest, EmergencyContact, ApparatusChecklistItem, ChecklistItemStatus, RepairTicket,
    Applicant, ApplicantStatus, ChecklistTemplate, Asset, Consumable, TrainingCourse, ScheduledTraining, TrainingRecord,
    Folder, Document, Hydrant, Event, EventCategory, EventStatus, HydrantInspection, PreIncidentPlan,
    Budget, LineItem, ExposureLog, SdsSheet, PrebuiltReport, BillingRate, Invoice, InvoiceLineItem, Shift,
    AboutUsContent, Photo, PhotoAlbum, RecordsRequest, RecordsRequestStatus,
    Notification, AuditLogEntry, SystemConfiguration, InternalMessage, DepartmentInfo, OptionalFieldConfig,
    SecurityRole, Certification, Award, MaintenanceLog, PreventativeMaintenanceSchedule, AssetInspection, SavedAssetView,
    SavedPersonnelView, SavedApparatusView, NfirsIncident, SavedIncidentView,
    DataSource, CustomReport, AlertRule, Transaction
} from './types';


// --- CENTRALIZED NAVIGATION ---

export const OPERATIONS_LINKS = [
    { href: '/app/dashboard', label: 'Dashboard', icon: HomeIcon, roles: [Role.FIREFIGHTER, Role.CHIEF, Role.ADMINISTRATOR] },
    { href: '/app/incidents', label: 'Incidents', icon: AlertTriangleIcon, roles: [Role.FIREFIGHTER, Role.CHIEF, Role.ADMINISTRATOR] },
    { href: '/app/personnel', label: 'Personnel', icon: UsersIcon, roles: [Role.FIREFIGHTER, Role.CHIEF, Role.ADMINISTRATOR] },
    { href: '/app/internal-comms', label: 'Internal Comms', icon: MessageSquareIcon, roles: [Role.FIREFIGHTER, Role.CHIEF, Role.ADMINISTRATOR] },
];

export const RESOURCES_LINKS = [
    { href: '/app/apparatus', label: 'Apparatus', icon: TruckIcon, roles: [Role.FIREFIGHTER, Role.CHIEF, Role.ADMINISTRATOR] },
    { href: '/app/maintenance', label: 'Maintenance', icon: WrenchIcon, roles: [Role.CHIEF, Role.ADMINISTRATOR] },
    { href: '/app/assets', label: 'Assets', icon: ArchiveIcon, roles: [Role.FIREFIGHTER, Role.CHIEF, Role.ADMINISTRATOR] },
    { href: '/app/inventory', label: 'Inventory', icon: ListChecksIcon, roles: [Role.FIREFIGHTER, Role.CHIEF, Role.ADMINISTRATOR] },
];

export const COMMUNITY_LINKS = [
    { href: '/app/properties', label: 'Properties', icon: BuildingIcon, roles: [Role.CHIEF, Role.ADMINISTRATOR] },
    { href: '/app/hydrants', label: 'Hydrants', icon: DropletIcon, roles: [Role.FIREFIGHTER, Role.CHIEF, Role.ADMINISTRATOR] },
    { href: '/app/public-portal', label: 'Public Portal', icon: ShieldCheckIcon, roles: [Role.CHIEF, Role.ADMINISTRATOR] },
];

export const PLANNING_ANALYTICS_LINKS = [
    { href: '/app/gis', label: 'GIS Dashboard', icon: MapIcon, roles: [Role.FIREFIGHTER, Role.CHIEF, Role.ADMINISTRATOR] },
    { href: '/app/calendar', label: 'Calendar', icon: CalendarIcon, roles: [Role.FIREFIGHTER, Role.CHIEF, Role.ADMINISTRATOR] },
    { href: '/app/reporting', label: 'Reporting', icon: PieChartIcon, roles: [Role.CHIEF, Role.ADMINISTRATOR] },
    { href: '/app/training', label: 'Training', icon: GraduationCapIcon, roles: [Role.FIREFIGHTER, Role.CHIEF, Role.ADMINISTRATOR] },
    { href: '/app/documents', label: 'Documents', icon: FolderIcon, roles: [Role.FIREFIGHTER, Role.CHIEF, Role.ADMINISTRATOR] },
];

export const ADMINISTRATION_LINKS = [
    { href: '/app/admin', label: 'Admin', icon: ClipboardListIcon, roles: [Role.CHIEF, Role.ADMINISTRATOR] },
    { href: '/app/health-safety', label: 'Health & Safety', icon: HeartPulseIcon, roles: [Role.FIREFIGHTER, Role.CHIEF, Role.ADMINISTRATOR] },
    { href: '/app/financials', label: 'Financials', icon: DollarSignIcon, roles: [Role.CHIEF, Role.ADMINISTRATOR] },
    { href: '/app/settings', label: 'Settings', icon: SettingsIcon, roles: [Role.ADMINISTRATOR] },
];

export const ALL_NAV_LINKS = [
    ...OPERATIONS_LINKS, ...RESOURCES_LINKS, ...COMMUNITY_LINKS, ...PLANNING_ANALYTICS_LINKS, ...ADMINISTRATION_LINKS
];

export const PERMISSION_GROUPS: Record<string, { id: string; label: string; description: string; dependency?: string }[]> = {
  'Personnel': [
    { id: 'view_personnel', label: 'View Personnel', description: 'Allows viewing of personnel profiles and the roster.' },
    { id: 'edit_personnel', label: 'Edit Personnel', description: 'Allows editing of personnel profiles.', dependency: 'view_personnel' },
  ],
  'Apparatus': [
    { id: 'view_apparatus', label: 'View Apparatus', description: 'Allows viewing of the apparatus fleet and details.' },
    { id: 'edit_apparatus', label: 'Edit Apparatus', description: 'Allows editing of apparatus details.', dependency: 'view_apparatus' },
  ],
  'Incidents': [
    { id: 'create_incident', label: 'Create Incident', description: 'Allows creating new incident reports.' },
    { id: 'lock_incident', label: 'Lock Incident', description: 'Allows locking a completed incident report, preventing further edits.', dependency: 'create_incident' },
    { id: 'delete_incident', label: 'Delete Incident', description: 'Allows deleting incident reports. This action is irreversible.' },
  ],
  'Administration': [
    { id: 'access_settings', label: 'Access Settings', description: 'Grants access to the main settings page.' },
    { id: 'view_users', label: 'View Users', description: 'Allows viewing the list of users and their roles.' },
    { id: 'invite_users', label: 'Invite/Create Users', description: 'Allows inviting new users to the system.', dependency: 'view_users' },
    { id: 'edit_user_profile', label: 'Edit User Profile', description: 'Allows editing user details, excluding security roles.', dependency: 'view_users' },
    { id: 'assign_roles', label: 'Assign Security Roles', description: 'Allows changing the security role assigned to a user.', dependency: 'view_users' }
  ],
};

export const ALL_PERMISSIONS = Object.values(PERMISSION_GROUPS).flat().map(p => p.id);

// --- END CENTRALIZED NAVIGATION ---


export const CONFIGURABLE_OPTIONAL_FIELDS = [
    { id: 'basicModule.sectionB.censusTract', label: 'Census Tract (Basic)' },
    { id: 'basicModule.sectionE.district', label: 'District (Basic)' },
    { id: 'basicModule.sectionE.specialStudies', label: 'Special Studies (Basic)' },
    { id: 'basicModule.sectionG.propertyValue', label: 'Pre-Incident Property Value (Basic)' },
    { id: 'basicModule.sectionG.contentsValue', label: 'Pre-Incident Contents Value (Basic)' },
    { id: 'fireModule.ignition.itemFirstIgnited', label: 'Item First Ignited (Fire)' },
    { id: 'fireModule.ignition.materialFirstIgnited', label: 'Material First Ignited (Fire)' },
    { id: 'structureFireModule.detectors.type', label: 'Detector Type (Structure Fire)' },
    { id: 'structureFireModule.detectors.powerSupply', label: 'Detector Power Supply (Structure Fire)' },
    { id: 'structureFireModule.detectors.operation', label: 'Detector Operation (Structure Fire)' },
    { id: 'structureFireModule.detectors.effectiveness', label: 'Detector Effectiveness (Structure Fire)' },
    { id: 'structureFireModule.detectors.failureReason', label: 'Detector Failure Reason (Structure Fire)' },
    { id: 'structureFireModule.extinguishingSystem.type', label: 'Extinguishing System Type (Structure Fire)' },
    { id: 'structureFireModule.extinguishingSystem.operation', label: 'Extinguishing System Operation (Structure Fire)' },
    { id: 'structureFireModule.extinguishingSystem.sprinklerHeads', label: 'Number of Sprinkler Heads (Structure Fire)' },
    { id: 'structureFireModule.extinguishingSystem.failureReason', label: 'Extinguishing System Failure Reason (Structure Fire)' },
    { id: 'wildlandFireModule.weatherInfo.fuelMoisture', label: 'Fuel Moisture % (Wildland)' },
    { id: 'wildlandFireModule.weatherInfo.dangerRating', label: 'Fire Danger Rating (Wildland)' },
];

export const MOCK_APPARATUS_SVG_PATHS = {
    'Engine': "M1,60 C1,55 5,50 10,50 L28,50 L35,30 L80,30 L88,50 L99,50 C101,50 103,52 103,55 L103,85 L1,85 Z M30,50 L30,85 M55,50 L55,85 M82,50 L82,85",
    'Brush Truck': "M1,65 C1,60 5,55 10,55 L38,55 L42,45 L50,45 L50,55 L100,55 C102,55 103,57 103,60 L103,85 L1,85 Z M55,55 L55,85 M75,55 L75,85"
};

export const NFPA_RETIREMENT_YEARS = 10;

const MOCK_EMERGENCY_CONTACTS: Record<string, EmergencyContact[]> = {
    'p-001': [{ id: 'ec-1', name: 'Mary Smith', relationship: 'Spouse', phone: '555-0111' }],
    'p-002': [{ id: 'ec-2', name: 'Tom Doe', relationship: 'Father', phone: '555-0112' }, { id: 'ec-3', name: 'EMT Supervisor', relationship: 'Work', phone: '555-0113' }],
    'p-003': [{ id: 'ec-4', name: 'Susan Johnson', relationship: 'Spouse', phone: '555-0114' }],
    'p-004': [],
    'p-005': [{ id: 'ec-5', name: 'Larry Green', relationship: 'Brother', phone: '555-0115' }]
};

const MOCK_AWARDS: Record<string, Award[]> = {
    'p-001': [
        { id: 'aw-1', name: 'Medal of Valor', dateReceived: '2022-05-10', description: 'For bravery during the downtown warehouse fire.' },
        { id: 'aw-2', name: '10 Years of Service', dateReceived: '2025-03-01', description: 'Commendation for a decade of dedicated service.' },
    ],
    'p-002': [],
    'p-003': [],
    'p-004': [],
    'p-005': [
         { id: 'aw-3', name: 'Lifesaving Award', dateReceived: '2021-11-20', description: 'For performing CPR and saving a civilian life at a medical call.' }
    ],
    'user-001': [],
    'user-003': [],
}

const MOCK_TRAINING_HISTORY: Record<string, TrainingRecord[]> = {
    'p-001': [
        { courseId: 'tc-1', courseName: 'Advanced First Aid', completedDate: '2023-11-10', expiresDate: '2025-11-10', documentUrl: '/docs/p001_first_aid.pdf'},
        { courseId: 'tc-3', courseName: 'EVOC', completedDate: '2024-02-20'},
    ],
    'p-002': [
        { courseId: 'tc-1', courseName: 'Advanced First Aid', completedDate: '2024-01-15', expiresDate: '2026-01-15'},
    ],
    'p-003': [
        { courseId: 'tc-3', courseName: 'EVOC', completedDate: '2023-08-01'},
    ],
    'p-004': [],
    'p-005': [
        { courseId: 'tc-2', courseName: 'Fire Officer I', completedDate: '2022-06-30', documentUrl: '/docs/p005_officer1.pdf'},
        { courseId: 'tc-3', courseName: 'EVOC', completedDate: '2024-02-20'},
    ]
}

const MOCK_CERTIFICATIONS: Record<string, Certification[]> = {
    'p-001': [
        { id: 'cert-1', name: 'EMT-B', expires: '2025-12-31', documentUrl: '/docs/p001_emt.pdf' },
        { id: 'cert-2', name: 'Firefighter I/II', expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    'p-002': [
        { id: 'cert-3', name: 'EMT-B', expires: '2024-11-15' },
        { id: 'cert-4', name: 'HazMat Ops', expires: '2025-02-28', documentUrl: '/docs/p002_hazmat.pdf' }
    ],
    'p-003': [
        { id: 'cert-5', name: 'Driver Operator', expires: '2027-01-01' }
    ],
    'p-004': [],
    'p-005': [
        { id: 'cert-6', name: 'Fire Officer I', expires: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString() }
    ],
     'user-001': [],
     'user-003': [],
}

export let MOCK_PERSONNEL: Personnel[] = [
    { 
        id: 'p-001', nfirsId: 'NF-101', badgeNumber: 'B-2021', name: 'John Smith', rank: 'Captain', status: 'Active',
        assignment: 'Station 1 / A-Shift',
        phoneNumbers: [{ type: 'Work', number: '555-0101' }, { type: 'Mobile', number: '555-9101' }],
        emails: [{ type: 'Work', address: 'john.smith@anytownfd.gov' }],
        residentialAddress: '101 Pine St, Anytown',
        hireDate: '2015-03-01', dateOfBirth: '1985-05-15', ssn: '...-..-1234', gender: 'Male', citizenship: 'USA',
        certifications: MOCK_CERTIFICATIONS['p-001'], 
        emergencyContacts: MOCK_EMERGENCY_CONTACTS['p-001'], 
        trainingHistory: MOCK_TRAINING_HISTORY['p-001'],
        awards: MOCK_AWARDS['p-001'],
        positions: ['Training Officer', 'Safety Officer'],
        active911Code: 'A911-JS',
        spouse: { name: 'Mary Smith', phone: '555-0111' },
        payrollId: 'PY-101',
        username: 'captain', role: Role.TRAINING_OFFICER, avatarUrl: 'https://picsum.photos/seed/captain/100/100',
        notes: 'Experienced officer, excellent mentor for new recruits.\n\n*   Completed advanced rope rescue training.\n*   Is the point of contact for station maintenance.\n\n**Next Steps:** Should be considered for Battalion Chief training in the next cycle.',
        bloodType: 'O+',
        allergies: ['Penicillin'],
        medicalConditions: ['Hypertension (controlled)'],
        lastPhysicalDate: '2024-03-15',
        fitForDutyStatus: 'Fit for Full Duty'
    },
    { 
        id: 'p-002', nfirsId: 'NF-102', badgeNumber: 'B-2022', name: 'Jane Doe', rank: 'Firefighter', status: 'Active', 
        assignment: 'Station 2 / B-Shift',
        phoneNumbers: [{ type: 'Work', number: '555-0102' }],
        emails: [{ type: 'Work', address: 'jane.doe@anytownfd.gov' }],
        hireDate: '2020-07-15', dateOfBirth: '1992-11-20', ssn: '...-..-5678', gender: 'Female', citizenship: 'USA',
        certifications: MOCK_CERTIFICATIONS['p-002'], 
        emergencyContacts: MOCK_EMERGENCY_CONTACTS['p-002'], 
        trainingHistory: MOCK_TRAINING_HISTORY['p-002'],
        awards: MOCK_AWARDS['p-002'],
        positions: ['Paramedic'],
        payrollId: 'PY-102',
        username: 'firefighter', role: Role.FIREFIGHTER, avatarUrl: 'https://picsum.photos/seed/jane/100/100',
        bloodType: 'A-',
        allergies: [],
        medicalConditions: [],
        lastPhysicalDate: '2024-05-01',
        fitForDutyStatus: 'Fit for Full Duty'
    },
    { 
        id: 'p-003', nfirsId: 'NF-103', badgeNumber: 'B-2023', name: 'Mike Johnson', rank: 'Engineer', status: 'Active', 
        assignment: 'Station 1 / C-Shift',
        phoneNumbers: [{ type: 'Work', number: '555-0103' }],
        emails: [{ type: 'Work', address: 'mike.johnson@anytownfd.gov' }],
        hireDate: '2018-10-01',
        certifications: MOCK_CERTIFICATIONS['p-003'], 
        emergencyContacts: MOCK_EMERGENCY_CONTACTS['p-003'], 
        trainingHistory: MOCK_TRAINING_HISTORY['p-003'], 
        payrollId: 'PY-103',
        username: 'mike', role: Role.FIREFIGHTER, avatarUrl: 'https://picsum.photos/seed/mike/100/100',
        fitForDutyStatus: 'Fit for Full Duty'
    },
    { 
        id: 'p-004', nfirsId: 'NF-104', badgeNumber: 'B-2024', name: 'Emily White', rank: 'Probation', status: 'Probation', 
        assignment: 'Station 3 / A-Shift',
        phoneNumbers: [{ type: 'Work', number: '555-0104' }],
        emails: [{ type: 'Work', address: 'emily.white@anytownfd.gov' }],
        hireDate: '2024-05-20',
        certifications: MOCK_CERTIFICATIONS['p-004'], 
        emergencyContacts: MOCK_EMERGENCY_CONTACTS['p-004'], 
        trainingHistory: MOCK_TRAINING_HISTORY['p-004'],
        payrollId: 'PY-104',
        username: 'emily', role: Role.FIREFIGHTER, avatarUrl: 'https://picsum.photos/seed/emily/100/100',
        fitForDutyStatus: 'Fit for Full Duty'
    },
    { 
        id: 'p-005', nfirsId: 'NF-105', badgeNumber: 'B-2025', name: 'Chris Green', rank: 'Lieutenant', status: 'Active', 
        assignment: 'Station 2 / B-Shift',
        phoneNumbers: [{ type: 'Work', number: '555-0105' }],
        emails: [{ type: 'Work', address: 'chris.green@anytownfd.gov' }],
        hireDate: '2016-01-10',
        certifications: MOCK_CERTIFICATIONS['p-005'], 
        emergencyContacts: MOCK_EMERGENCY_CONTACTS['p-005'], 
        trainingHistory: MOCK_TRAINING_HISTORY['p-005'],
        awards: MOCK_AWARDS['p-005'],
        payrollId: 'PY-105',
        username: 'chris', role: Role.TRAINING_OFFICER, avatarUrl: 'https://picsum.photos/seed/chris/100/100',
        fitForDutyStatus: 'Fit for Light Duty',
        lastPhysicalDate: '2023-10-20',
        medicalConditions: ['Recovering from shoulder surgery']
    },
    { 
        id: 'user-001', nfirsId: 'NF-001', badgeNumber: 'B-2020', name: 'Chief Miller', rank: 'Chief', status: 'Active', 
        assignment: 'Headquarters',
        phoneNumbers: [{ type: 'Work', number: '555-0100' }],
        emails: [{ type: 'Work', address: 'chief.miller@anytownfd.gov' }],
        hireDate: '2005-08-20',
        certifications: MOCK_CERTIFICATIONS['user-001'], 
        emergencyContacts: [], 
        trainingHistory: [],
        payrollId: 'PY-001',
        username: 'chief', role: Role.CHIEF, avatarUrl: 'https://picsum.photos/seed/chief/100/100',
        bloodType: 'B+',
        allergies: ['None'],
        medicalConditions: ['None'],
        lastPhysicalDate: '2024-01-10',
        fitForDutyStatus: 'Fit for Full Duty'
    },
    { 
        id: 'user-003', nfirsId: 'NF-ADM', badgeNumber: 'B-ADMIN', name: 'Admin User', rank: 'Administrator', status: 'Active', 
        assignment: 'Headquarters',
        phoneNumbers: [{ type: 'Work', number: '555-0199' }],
        emails: [{ type: 'Work', address: 'admin@anytownfd.gov' }],
        hireDate: '2010-02-12',
        certifications: MOCK_CERTIFICATIONS['user-003'], 
        emergencyContacts: [], 
        trainingHistory: [],
        payrollId: 'PY-ADM',
        username: 'admin', role: Role.ADMINISTRATOR, avatarUrl: 'https://picsum.photos/seed/admin/100/100',
        fitForDutyStatus: 'Not Cleared'
    },
];

export let MOCK_APPARATUS: Apparatus[] = [
    { 
        id: 'a-001', unitId: 'Engine 1', type: 'Engine', status: ApparatusStatus.IN_SERVICE, lastCheck: '2024-07-28', mileage: 54321, engineHours: 2345.6, checklistTemplateId: 'ct-engine', location: { lat: 50, lng: 50 }, make: 'Pierce', model: 'Enforcer', year: 2020, vin: '1P9FRVAP2LA12345', purchaseDate: '2020-01-15',
        purchasePrice: 750000,
        currentAssignment: 'Station 1 / A-Shift',
        fuelLevel: 85,
        defLevel: 90,
        estimatedReplacementDate: '2040-01-15',
        insuranceInfo: { provider: 'FD Mutual', policyNumber: 'FDPOL-1234', expirationDate: '2025-01-01' },
        photos: [
            { id: 'photo-e1-1', url: 'https://picsum.photos/seed/engine1-side/800/600', caption: 'Engine 1 Side View' },
            { id: 'photo-e1-2', url: 'https://picsum.photos/seed/engine1-front/800/600', caption: 'Engine 1 Front View' },
        ],
        documents: [
            { id: 'doc-e1-1', name: 'Engine 1 - Registration.pdf', url: '#', summary: 'Vehicle Registration Document' },
            { id: 'doc-e1-2', name: 'Pump Test Certificate.pdf', url: '#', summary: 'Annual pump test certificate' },
        ],
        specifications: {
            pumpCapacityGPM: 1500,
            waterTankSizeGallons: 750,
            foamTankSizeGallons: 30,
        },
        serviceDates: {
            lastAnnualService: '2024-01-20',
            nextAnnualServiceDue: '2025-01-20',
            lastPumpTest: '2024-01-20',
            nextPumpTestDue: '2025-01-20',
        },
        vitalsHistory: [
            { id: 'vl-1', date: '2024-07-28', mileage: 54321, engineHours: 2345.6, userId: 'p-001' },
            { id: 'vl-2', date: '2024-07-27', mileage: 54290, engineHours: 2344.1, userId: 'p-003' },
        ],
        compartments: [
            // Driver Side
            { id: 'd1', name: 'Driver Side 1 (Pump Panel)', layout: { rows: 2, cols: 1 }, doorStatus: 'closed', photoUrl: 'https://picsum.photos/seed/comp-d1/400/300', schematic: { side: 'driver', x: 28, y: 55, width: 20, height: 40 },
                subCompartments: [
                    { id: 'sc-d1-1', name: 'Top Shelf', location: { row: 1, col: 1 }, assignedAssetIds: ['as-001'] },
                    { id: 'sc-d1-2', name: 'Bottom Pull-out', location: { row: 2, col: 1 }, assignedAssetIds: ['as-002'] }
                ]
            },
            { id: 'd2', name: 'Driver Side 2 (Rear)', layout: { rows: 1, cols: 2 }, doorStatus: 'open', photoUrl: 'https://picsum.photos/seed/comp-d2/400/300', schematic: { side: 'driver', x: 55, y: 55, width: 20, height: 40 },
                subCompartments: []
            },
            // Passenger Side
            { id: 'p1', name: 'Passenger Side 1 (EMS)', layout: { rows: 1, cols: 1 }, doorStatus: 'closed', photoUrl: 'https://picsum.photos/seed/comp-p1/400/300', schematic: { side: 'passenger', x: 28, y: 55, width: 20, height: 40 },
                subCompartments: [
                    { id: 'sc-p1-1', name: 'Main Compartment', location: { row: 1, col: 1 }, assignedAssetIds: ['as-003'] }
                ]
            },
            { id: 'p2', name: 'Passenger Side 2', layout: { rows: 1, cols: 1 }, doorStatus: 'closed', photoUrl: 'https://picsum.photos/seed/comp-p2/400/300', schematic: { side: 'passenger', x: 55, y: 55, width: 20, height: 40 },
                subCompartments: []
            },
            // Rear
            { id: 'r1', name: 'Rear Compartment', layout: { rows: 2, cols: 2 }, doorStatus: 'closed', photoUrl: 'https://picsum.photos/seed/comp-r1/400/300', schematic: { side: 'rear', x: 10, y: 10, width: 80, height: 80 },
                subCompartments: []
            }
        ]
    },
    { 
        id: 'a-002', unitId: 'Ladder 1', type: 'Ladder', status: ApparatusStatus.IN_SERVICE, lastCheck: '2024-07-28', mileage: 21987, engineHours: 1876.1, checklistTemplateId: 'ct-ladder', location: { lat: 48, lng: 52 }, make: 'E-One', model: 'Typhoon', year: 2018, vin: '1E9L...18', purchaseDate: '2018-03-20', vitalsHistory: [], compartments: [],
        serviceDates: {
            lastAnnualService: '2024-07-15',
            nextAnnualServiceDue: new Date(new Date().setDate(new Date().getDate() + 25)).toISOString(), // Expires soon
            lastPumpTest: '2024-07-15',
            nextPumpTestDue: '2025-07-15',
        }
    },
    { 
        id: 'a-003', unitId: 'Rescue 1', type: 'Rescue', status: ApparatusStatus.OUT_OF_SERVICE, lastCheck: '2024-07-27', mileage: 78012, engineHours: 3102.3, checklistTemplateId: 'ct-rescue', location: { lat: 55, lng: 55 }, make: 'Sutphen', model: 'Guardian', year: 2022, vin: '1S9R...22', purchaseDate: '2022-05-10', vitalsHistory: [], compartments: [],
        serviceDates: {
            lastAnnualService: '2023-01-01',
            nextAnnualServiceDue: '2024-01-01', // Overdue
            lastPumpTest: '2023-01-01',
            nextPumpTestDue: '2024-01-01',
        }
    },
    { id: 'a-004', unitId: 'Tanker 1', type: 'Tanker', status: ApparatusStatus.IN_SERVICE, lastCheck: '2024-07-28', mileage: 33210, engineHours: 1509.8, checklistTemplateId: 'ct-general', location: { lat: 52, lng: 48 }, make: 'Freightliner', model: 'M2', year: 2015, vin: '1F9T...15', purchaseDate: '2015-11-01', vitalsHistory: [], compartments: [] },
    { 
        id: 'a-005', unitId: 'Brush 1', type: 'Brush Truck', status: ApparatusStatus.MAINTENANCE, lastCheck: '2024-07-25', mileage: 12543, engineHours: 987.2, checklistTemplateId: 'ct-general', location: { lat: 45, lng: 45 }, make: 'Ford', model: 'F-550', year: 2021, vin: '1FDB...21', purchaseDate: '2021-08-11', vitalsHistory: [{id: 'vl-b1', date: '2024-07-25', mileage: 12543, engineHours: 987.2, userId: 'p-005'}], compartments: [],
        purchasePrice: 185000,
        currentAssignment: 'Station 3',
        fuelLevel: 45,
        defLevel: 70,
        specifications: {
            pumpCapacityGPM: 0,
            waterTankSizeGallons: 0,
            foamTankSizeGallons: 0,
        },
        serviceDates: {
            lastAnnualService: '',
            nextAnnualServiceDue: '',
            lastPumpTest: '',
            nextPumpTestDue: '',
        },
        photos: [
            { id: 'photo-b1-1', url: 'https://picsum.photos/seed/brush1-side/800/600', caption: 'Brush 1 Side View' }
        ]
    },
];

export let MOCK_INCIDENTS: Incident[] = [
    { id: 'i-001', incidentNumber: '2024-00123', type: 'Structure Fire', address: '123 Main St', date: '2024-07-27', status: 'Closed', respondingPersonnelIds: ['p-001', 'p-002', 'p-003', 'p-005'], respondingApparatusIds: ['a-001', 'a-002'], narrative: 'On arrival, heavy smoke showing from a two-story residential structure. Command was established and a primary search was initiated. Fire was knocked down within 20 minutes. All occupants were accounted for. Scene was turned over to the fire marshal.', location: { lat: 49, lng: 51 }, ownerName: 'Alice Property-Owner' },
    { id: 'i-002', incidentNumber: '2024-00124', type: 'MVA', address: '456 Oak Ave', date: '2024-07-28', status: 'Open', respondingPersonnelIds: ['p-002', 'p-003'], respondingApparatusIds: ['a-003'], narrative: 'Dispatched to a two-vehicle motor vehicle accident with reported injuries. On arrival, found two vehicles with moderate damage. One patient extricated and transported by EMS. Roadway cleared of debris.', location: { lat: 51, lng: 49 }, ownerName: 'Bob Builder' },
    { id: 'i-003', incidentNumber: '2024-00125', type: 'Medical Emergency', address: '789 Pine Ln', date: '2024-07-29', status: 'Closed', respondingPersonnelIds: ['p-002', 'p-004'], respondingApparatusIds: [], narrative: 'Provided medical assistance until arrival of ambulance.', suppliesUsed: [{ consumableId: 'con-001', quantity: 5 }], ownerName: 'Alice Property-Owner' },
];

export const MOCK_OWNERS: Owner[] = [
    { id: 'o-001', name: 'Alice Property-Owner', mailingAddress: '123 Main St, Anytown, USA 12345', phone: '555-123-4567', email: 'alice@example.com' },
    { id: 'o-002', name: 'Bob Builder', mailingAddress: '456 Oak Ave, Anytown, USA 12345', phone: '555-987-6543', email: 'bob@example.com' },
];

export let MOCK_PROPERTIES: Property[] = [
    { 
        id: 'prop-001', 
        parcelId: '001-002-003', 
        address: '123 Main St', 
        ownerIds: ['o-001'], 
        location: { lat: 49, lng: 51 }, 
        preIncidentPlan: { 
            id: 'pip-001', 
            propertyId: 'prop-001', 
            tacticalSummary: 'Two-story wood frame residential. No known hazards. Owner: Alice (555-123-4567). Utility Shutoffs: Gas meter on delta side.',
            accessNotes: 'Front door, back patio door.',
            floorPlans: [],
            photos: [],
            companyNotes: {
                engine: 'Standard residential fire attack.',
                truck: 'Place ladder on Alpha/Charlie corner.',
                command: 'Establish command on side Alpha.'
            }
        },
        constructionType: 'Wood-Frame',
        occupancyType: 'Residential - Single Family',
        stories: 2,
        squareFootage: 1800,
        fireProtection: { sprinklerSystem: 'None' },
        utilityShutoffs: { gas: 'Side D', water: 'Curb', electric: 'Pole' },
        knownHazards: [],
        inspections: [],
        documents: [],
        activityLog: []
    },
    { 
        id: 'prop-002', 
        parcelId: '004-005-006', 
        address: '456 Oak Ave', 
        ownerIds: ['o-002'], 
        location: { lat: 51, lng: 49 }, 
        preIncidentPlan: null,
        constructionType: 'Masonry',
        occupancyType: 'Commercial',
        stories: 1,
        squareFootage: 5000,
        fireProtection: { sprinklerSystem: 'Wet' },
        utilityShutoffs: { gas: 'Rear', water: 'Street', electric: 'Transformer' },
        knownHazards: [{id: 'hz-1', description: 'Forklift charging station', severity: 'Low'}],
        inspections: [],
        documents: [],
        activityLog: []
    },
    { 
        id: 'prop-003', 
        parcelId: '007-008-009', 
        address: '789 Pine Ln', 
        ownerIds: ['o-001'], 
        location: { lat: 53, lng: 53 }, 
        preIncidentPlan: null,
        constructionType: 'Wood-Frame',
        occupancyType: 'Residential - Single Family',
        stories: 1,
        squareFootage: 1200,
        fireProtection: { sprinklerSystem: 'None' },
        utilityShutoffs: { gas: 'Side B', water: 'Street', electric: 'Pole' },
        knownHazards: [],
        inspections: [],
        documents: [],
        activityLog: []
    },
];

export let MOCK_FIRE_DUES: FireDue[] = [
    { id: 'fd-001', propertyId: 'prop-001', year: 2024, amount: 150.00, status: FireDueStatus.PAID, dueDate: '2024-03-31', paymentDate: '2024-03-15' },
    { id: 'fd-002', propertyId: 'prop-002', year: 2024, amount: 150.00, status: FireDueStatus.UNPAID, dueDate: '2024-03-31' },
    { id: 'fd-003', propertyId: 'prop-003', year: 2023, amount: 125.00, status: FireDueStatus.OVERDUE, dueDate: '2023-03-31' },
    { id: 'fd-004', propertyId: 'prop-001', year: 2023, amount: 125.00, status: FireDueStatus.PAID, dueDate: '2023-03-31', paymentDate: '2023-03-20' },
    { id: 'fd-005', propertyId: 'prop-002', year: 2023, amount: 125.00, status: FireDueStatus.PAID, dueDate: '2023-03-31', paymentDate: '2023-03-22' },
    { id: 'fd-006', propertyId: 'prop-003', year: 2024, amount: 150.00, status: FireDueStatus.UNPAID, dueDate: '2024-03-31' },
    { id: 'fd-007', propertyId: 'prop-001', year: 2022, amount: 100.00, status: FireDueStatus.PAID, dueDate: '2022-03-31', paymentDate: '2022-01-10' },
    { id: 'fd-008', propertyId: 'prop-002', year: 2022, amount: 100.00, status: FireDueStatus.PAID, dueDate: '2022-03-31', paymentDate: '2022-02-15' },
    { id: 'fd-009', propertyId: 'prop-003', year: 2022, amount: 100.00, status: FireDueStatus.PAID, dueDate: '2022-03-31', paymentDate: '2022-03-01' },
    { id: 'fd-010', propertyId: 'prop-001', year: 2021, amount: 90.00, status: FireDueStatus.PAID, dueDate: '2021-03-31', paymentDate: '2021-02-01' },
    { id: 'fd-011', propertyId: 'prop-002', year: 2021, amount: 90.00, status: FireDueStatus.PAID, dueDate: '2021-03-31', paymentDate: '2021-02-01' },
    { id: 'fd-012', propertyId: 'prop-003', year: 2021, amount: 90.00, status: FireDueStatus.OVERDUE, dueDate: '2021-03-31' },
];

export let MOCK_ANNOUNCEMENTS: Announcement[] = [
    { id: 'ann-001', title: 'County-Wide Burn Ban in Effect', content: 'Due to dry conditions, a county-wide burn ban is in effect until further notice. All outdoor burning is prohibited.', authorId: 'user-001', createdAt: '2024-07-20' },
    { id: 'ann-002', title: 'Annual Pancake Breakfast', content: 'Join us for our annual pancake breakfast fundraiser on August 15th from 7am to 11am at Station 1!', authorId: 'user-003', createdAt: '2024-07-15' },
];

export let MOCK_STORM_SHELTERS: StormShelter[] = [
    { id: 'ss-001', propertyId: 'prop-001', ownerName: 'Alice Property-Owner', address: '123 Main St', locationOnProperty: 'Underground, accessible from back patio', contactPhone: '555-123-4567', registeredAt: '2023-05-10' },
];

export let MOCK_BURN_PERMITS: BurnPermit[] = [
    { id: 'bp-001', applicantName: 'Bob Builder', address: '456 Oak Ave', phone: '555-987-6543', burnType: 'Brush pile', requestedDate: '2024-07-25', status: BurnPermitStatus.APPROVED },
    { id: 'bp-002', applicantName: 'Alice Property-Owner', address: '789 Pine Ln', phone: '555-123-4567', burnType: 'Yard Debris', requestedDate: '2024-07-28', status: BurnPermitStatus.PENDING },
];

export let MOCK_CITIZENS: Citizen[] = [
    { id: 'citizen-001', name: 'Alice Property-Owner', email: 'alice@example.com', password: 'password123', propertyIds: ['prop-001', 'prop-003'], status: CitizenStatus.ACTIVE, phoneNumbers: [{ number: '555-123-4567', type: 'Mobile' }], notificationPreferences: { 'Emergency Alerts': true, 'General Announcements': true, 'Event Reminders': true } },
    { id: 'citizen-002', name: 'Bob Builder', email: 'bob@example.com', password: 'password123', propertyIds: ['prop-002'], status: CitizenStatus.PENDING_APPROVAL, phoneNumbers: [], notificationPreferences: { 'Emergency Alerts': true, 'General Announcements': false, 'Event Reminders': false } },
    { id: 'citizen-003', name: 'Charlie Suspended', email: 'charlie@example.com', password: 'password123', propertyIds: [], status: CitizenStatus.SUSPENDED, phoneNumbers: [] },
];

export let MOCK_BILL_FORGIVENESS_REQUESTS: BillForgivenessRequest[] = [
    { id: 'bfr-001', citizenId: 'citizen-001', fireDueId: 'fd-003', reason: 'I recently lost my job and am having trouble making ends meet. Any help would be appreciated.', submittedAt: '2024-07-22', status: 'Pending' },
];

export const MOCK_ABOUT_US_CONTENT: AboutUsContent = {
    mission: "The mission of the Anytown Fire Department is to protect the lives and property of the people of Anytown from fires, natural disasters, and hazardous materials incidents; to save lives by providing emergency medical services; to prevent fires through prevention and education programs; and to provide a work environment that values cultural diversity and is free of harassment and discrimination.",
    values: [
        { title: "Integrity", description: "We are honest and fair in our dealings with our members and the community we serve." },
        { title: "Service", description: "We are committed to providing the highest level of service to our community." },
        { title: "Courage", description: "We exhibit courage in the face of adversity, both physical and moral." },
        { title: "Respect", description: "We treat everyone with dignity and respect." },
        { title: "Teamwork", description: "We work together as a team to achieve our common goals." },
    ],
    history: "Founded in 1925, the Anytown Fire Department started as a small, all-volunteer force with a single horse-drawn pumper. Over the decades, we've grown alongside our community, transitioning to a full-time professional department in the 1960s and continuously adopting new technologies and strategies to provide the best possible service. Today, we stand as a modern, all-hazards department, proud of our heritage and committed to our future.",
    orgStructureDescription: "The Anytown Fire Department is led by the Fire Chief, who oversees all divisions. The department is structured into several key divisions: Operations, which handles emergency response; Fire Prevention, which includes inspections and public education; and Administration, which manages logistics, finance, and personnel. Assistant Chiefs manage the major divisions, with Captains and Lieutenants supervising individual stations and crews."
};

export let MOCK_PHOTO_ALBUMS: PhotoAlbum[] = [
    { id: 'album-1', title: 'Community Pancake Breakfast', description: 'A wonderful turnout for our annual fundraising breakfast.', coverPhotoUrl: 'https://picsum.photos/seed/pancakes/600/400' },
    { id: 'album-2', title: 'Live Fire Training', description: 'Crews practice their skills in a controlled live fire environment.', coverPhotoUrl: 'https://picsum.photos/seed/fire-training/600/400' },
    { id: 'album-3', title: 'Fire Prevention Week Open House', description: 'We welcomed the community to the station to learn about fire safety.', coverPhotoUrl: 'https://picsum.photos/seed/open-house/600/400' },
];

export let MOCK_PHOTOS: Photo[] = [
    // Album 1
    { id: 'p1-1', albumId: 'album-1', url: 'https://picsum.photos/seed/pancakes-1/1024/768', caption: 'Chief Miller serving up some fresh pancakes.', dateTaken: '2024-08-15' },
    { id: 'p1-2', albumId: 'album-1', url: 'https://picsum.photos/seed/pancakes-2/1024/768', caption: 'Kids getting a tour of Engine 1.', dateTaken: '2024-08-15' },
    { id: 'p1-3', albumId: 'album-1', url: 'https://picsum.photos/seed/pancakes-3/1024/768', caption: 'A great turnout from the community!', dateTaken: '2024-08-15' },
    // Album 2
    { id: 'p2-1', albumId: 'album-2', url: 'https://picsum.photos/seed/training-1/1024/768', caption: 'Crews make entry into the training structure.', dateTaken: '2024-07-20' },
    { id: 'p2-2', albumId: 'album-2', url: 'https://picsum.photos/seed/training-2/1024/768', caption: 'Practicing hose line advancement.', dateTaken: '2024-07-20' },
    { id: 'p2-3', albumId: 'album-2', url: 'https://picsum.photos/seed/training-3/1024/768', caption: 'Instructor providing feedback after an evolution.', dateTaken: '2024-07-20' },
    { id: 'p2-4', albumId: 'album-2', url: 'https://picsum.photos/seed/training-4/1024/768', caption: 'Ladder operations practice.', dateTaken: '2024-07-21' },
    // Album 3
    { id: 'p3-1', albumId: 'album-3', url: 'https://picsum.photos/seed/open-house-1/1024/768', caption: 'Demonstrating the jaws of life.', dateTaken: '2023-10-09' },
    { id: 'p3-2', albumId: 'album-3', url: 'https://picsum.photos/seed/open-house-2/1024/768', caption: 'Sparky the Fire Dog meeting the kids.', dateTaken: '2023-10-09' },
];

export let MOCK_RECORDS_REQUESTS: RecordsRequest[] = [
    {
        id: 'rr-001',
        requesterName: 'Valerie Citizen',
        requesterEmail: 'val@example.com',
        description: 'Incident report for the structure fire at 123 Main St on July 27, 2024.',
        dateRangeStart: '2024-07-27',
        dateRangeEnd: '2024-07-27',
        requestedFormat: 'Electronic',
        status: RecordsRequestStatus.PENDING,
        submittedAt: '2024-07-30T10:00:00Z',
    },
    {
        id: 'rr-002',
        requesterName: 'Investigative Reporter',
        requesterEmail: 'reporter@example.com',
        requesterPhone: '555-867-5309',
        description: 'All motor vehicle accident reports for the month of July 2024.',
        dateRangeStart: '2024-07-01',
        dateRangeEnd: '2024-07-31',
        requestedFormat: 'Paper',
        status: RecordsRequestStatus.IN_PROGRESS,
        submittedAt: '2024-07-29T14:30:00Z',
    }
];


export let MOCK_REPAIR_TICKETS: RepairTicket[] = [
    { id: 'rt-001', apparatusId: 'a-003', apparatusUnitId: 'Rescue 1', itemDescription: 'Driver side headlight out', createdAt: '2024-07-27', status: 'Open' },
    { id: 'rt-002', apparatusId: 'a-005', apparatusUnitId: 'Brush 1', itemDescription: 'Pump is not engaging correctly', createdAt: '2024-07-25', status: 'In Progress', assigneeId: 'p-003', resolutionNotes: 'Checking pump transmission.' },
];

export let MOCK_APPLICANTS: Applicant[] = [
    { id: 'app-001', name: 'Peter Parker', email: 'pete@example.com', phone: '555-111-2222', appliedDate: '2024-07-01', status: ApplicantStatus.APPLIED },
    { id: 'app-002', name: 'Steve Rogers', email: 'steve@example.com', phone: '555-222-3333', appliedDate: '2024-06-15', status: ApplicantStatus.INTERVIEW },
    { id: 'app-003', name: 'Tony Stark', email: 'tony@example.com', phone: '555-333-4444', appliedDate: '2024-06-20', status: ApplicantStatus.OFFER },
];

export let MOCK_CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
    { id: 'ct-engine', name: 'Engine Daily Checklist', apparatusType: 'Engine', items: [{ id: 'ci-1', text: 'Check fluid levels' }, { id: 'ci-2', text: 'Test pump and gauges' }] },
    { id: 'ct-ladder', name: 'Ladder Daily Checklist', apparatusType: 'Ladder', items: [{ id: 'ci-1', text: 'Check fluid levels' }, { id: 'ci-3', text: 'Test aerial hydraulics' }] },
    { id: 'ct-rescue', name: 'Rescue Daily Checklist', apparatusType: 'Rescue', items: [{ id: 'ci-4', text: 'Inventory rescue tools' }, { id: 'ci-5', text: 'Check generator' }] },
    { id: 'ct-general', name: 'General Apparatus Checklist', apparatusType: 'General', items: [{ id: 'ci-1', text: 'Check fluid levels' }, { id: 'ci-6', text: 'Test lights and siren' }] },
];

export let MOCK_MAINTENANCE_LOGS: Record<string, MaintenanceLog[]> = {
    'as-001': [
        { id: 'ml-1', assetId: 'as-001', date: '2023-11-15', description: 'Replaced battery.', cost: 150, performedBy: 'John Smith', laborHours: 0.5, type: 'Repair' },
        { id: 'ml-2', assetId: 'as-001', date: '2024-07-01', description: 'Annual function test and calibration.', cost: 75, performedBy: 'John Smith', laborHours: 1, type: 'Preventative' },
    ],
    'as-002': [],
    'as-003': [],
    'as-004': [ // SCBA Pack
        { id: 'ml-3', assetId: 'as-004', date: '2024-02-01', description: 'Annual flow test.', cost: 50, performedBy: 'Mike Johnson', laborHours: 0.5, type: 'Preventative' },
        { id: 'ml-4', assetId: 'as-004', date: '2024-06-10', description: 'Regulator freezing up, required replacement of valve.', cost: 250, performedBy: 'Mike Johnson', laborHours: 1.5, type: 'Repair' }
    ], 
    'as-005': [], // SCBA Bottle
};

export let MOCK_PM_SCHEDULES: Record<string, PreventativeMaintenanceSchedule[]> = {
    'as-001': [
        { id: 'pm-1', assetId: 'as-001', taskDescription: 'Annual Function Test & Calibration', frequencyType: 'time', frequencyInterval: 1, frequencyUnit: 'years', lastPerformedDate: '2024-07-01', nextDueDate: '2025-07-01' }
    ],
    'as-004': [
        { id: 'pm-2', assetId: 'as-004', taskDescription: 'Annual Flow Test', frequencyType: 'time', frequencyInterval: 1, frequencyUnit: 'years', nextDueDate: '2025-02-01', lastPerformedDate: '2024-02-01' }
    ],
    'as-005': [
        { id: 'pm-3', assetId: 'as-005', taskDescription: 'Hydrostatic Test', frequencyType: 'time', frequencyInterval: 5, frequencyUnit: 'years', lastPerformedDate: '2022-08-20', nextDueDate: '2027-08-20' }
    ],
};

export let MOCK_INSPECTION_HISTORY: Record<string, AssetInspection[]> = {
    'as-001': [
        { id: 'insp-1', assetId: 'as-001', date: '2024-07-01', performedBy: 'John Smith', notes: 'All functions pass.' }
    ],
    'as-007': [
        { id: 'insp-ppe-1', assetId: 'as-007', date: '2024-06-01', performedBy: 'John Smith', notes: 'Routine inspection passed.'}
    ]
};


export let MOCK_ASSETS: Asset[] = [
    { 
        id: 'as-001', 
        name: 'Thermal Imager', 
        assetType: 'Thermal Imager',
        category: 'Equipment', 
        serialNumber: 'TI-12345', 
        manufacturer: 'FLIR',
        model: 'K2',
        purchaseDate: '2022-01-10', 
        purchasePrice: 8000, 
        status: 'In Use', 
        assignedToId: 'sc-d1-1', 
        assignedToType: 'SubCompartment',
        assignedToName: 'Engine 1 / Driver Side 1 (Pump Panel) / Top Shelf',
        lastTestedDate: '2024-07-01',
        nextTestDueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // expires soon
        notes: 'Battery replaced in Q2 2024.',
        warrantyExpirationDate: '2025-01-10',
        insuranceInfo: { provider: 'FD Mutual', policyNumber: 'FDPOL-9876', expirationDate: '2025-12-31'},
        maintenanceHistory: MOCK_MAINTENANCE_LOGS['as-001'] || [],
        pmSchedules: MOCK_PM_SCHEDULES['as-001'] || [],
        inspectionHistory: MOCK_INSPECTION_HISTORY['as-001'] || [],
        parentId: null,
        lifespanYears: 10,
        photos: [
            { id: 'photo-1', url: 'https://picsum.photos/seed/ti-1/800/600', caption: 'Front view of the thermal imager.' },
            { id: 'photo-2', url: 'https://picsum.photos/seed/ti-2/800/600', caption: 'Close-up of the display screen.' }
        ],
        documents: [
            { id: 'doc-1', name: 'FLIR_K2_Manual.pdf', url: '/docs/FLIR_K2_Manual.pdf', mockContent: 'The FLIR K2 is a rugged, reliable thermal imaging camera... To turn on, press the red button. To change modes, use the green button. Ensure the battery is charged before use. Safety warning: Do not point the laser at eyes.' },
            { id: 'doc-2', name: 'TI-12345_Invoice.pdf', url: '/docs/TI-12345_Invoice.pdf' },
        ],
        weightLbs: 5,
        isCritical: true,
    },
    { 
        id: 'as-002', 
        name: 'Set of Irons', 
        assetType: 'Forcible Entry Tool',
        category: 'Equipment', 
        serialNumber: 'N/A', 
        manufacturer: 'Paratech',
        model: 'Hooligan Tool & Axe',
        purchaseDate: '2021-05-20', 
        purchasePrice: 500, 
        status: 'In Use', 
        assignedToId: 'sc-d1-2', 
        assignedToType: 'SubCompartment',
        assignedToName: 'Engine 1 / Driver Side 1 (Pump Panel) / Bottom Pull-out',
        lastTestedDate: '2024-06-15',
        nextTestDueDate: '2025-06-15',
        notes: '',
        maintenanceHistory: [],
        pmSchedules: [],
        inspectionHistory: [],
        parentId: null,
        photos: [],
        documents: [],
        weightLbs: 20,
        isCritical: true,
    },
    { 
        id: 'as-003', 
        name: 'Medical Bag', 
        assetType: 'Medical Kit',
        category: 'Kit', 
        serialNumber: 'MB-678', 
        manufacturer: '5.11 Tactical',
        model: 'ALS/BLS Duffel',
        purchaseDate: '2023-02-01', 
        purchasePrice: 1200, 
        status: 'In Use', 
        assignedToId: 'sc-p1-1', 
        assignedToType: 'SubCompartment',
        assignedToName: 'Engine 1 / Passenger Side 1 (EMS) / Main Compartment',
        lastTestedDate: '2024-07-20',
        nextTestDueDate: '2025-01-20',
        notes: 'Contents are inventoried weekly.',
        maintenanceHistory: [],
        pmSchedules: [],
        inspectionHistory: [],
        parentId: null,
        photos: [],
        documents: [],
        inventory: [
            { consumableId: 'con-001', quantity: 20 },
            { consumableId: 'con-003', quantity: 4 },
            { consumableId: 'con-005', quantity: 2 } // Rescue Flares expiring soon
        ],
        weightLbs: 25,
        isCritical: true,
    },
    {
        id: 'as-004',
        name: 'SCBA Pack 1',
        assetType: 'SCBA',
        category: 'Equipment',
        serialNumber: 'SCBA-P-001',
        manufacturer: 'Scott',
        model: 'Air-Pak X3 Pro',
        status: 'Needs Repair',
        assignedToId: 'a-001',
        assignedToType: 'Apparatus',
        assignedToName: 'Engine 1',
        purchaseDate: '2023-02-01',
        purchasePrice: 7500,
        maintenanceHistory: MOCK_MAINTENANCE_LOGS['as-004'] || [],
        pmSchedules: MOCK_PM_SCHEDULES['as-004'] || [],
        inspectionHistory: [],
        parentId: null,
        components: [], // This will be populated by the API call
        lifespanYears: 15,
        photos: [
            { id: 'photo-3', url: 'https://picsum.photos/seed/scba-1/800/600', caption: 'Full SCBA Pack with bottle attached.' }
        ],
        documents: [],
        weightLbs: 15,
        isCritical: true,
    },
    {
        id: 'as-005',
        name: 'SCBA Bottle A',
        assetType: 'SCBA Bottle',
        category: 'Equipment',
        serialNumber: 'SCBA-B-101',
        manufacturer: 'Scott',
        model: '45-Min Carbon Fiber',
        status: 'In Use',
        assignedToId: null,
        assignedToType: null,
        purchaseDate: '2022-08-20',
        purchasePrice: 1200,
        hydrostaticTestDate: '2022-08-20',
        nextTestDueDate: '2027-08-20',
        maintenanceHistory: [],
        pmSchedules: MOCK_PM_SCHEDULES['as-005'] || [],
        inspectionHistory: [],
        parentId: 'as-004', // Assigned to SCBA Pack 1
        photos: [],
        documents: [],
        weightLbs: 15,
        isCritical: true,
    },
    {
        id: 'as-006',
        name: 'SCBA Bottle B (Spare)',
        assetType: 'SCBA Bottle',
        category: 'Equipment',
        serialNumber: 'SCBA-B-102',
        manufacturer: 'Scott',
        model: '45-Min Carbon Fiber',
        status: 'In Storage',
        assignedToId: null,
        assignedToType: null,
        purchaseDate: '2022-08-20',
        purchasePrice: 1200,
        hydrostaticTestDate: '2022-08-20',
        nextTestDueDate: '2027-08-20',
        maintenanceHistory: [],
        pmSchedules: [],
        inspectionHistory: [],
        parentId: null, // Unassigned
        photos: [],
        documents: [],
        weightLbs: 15,
        isCritical: true,
    },
    {
        id: 'as-007',
        name: 'Turnout Coat - Smith',
        assetType: 'Turnout Gear',
        category: 'PPE',
        serialNumber: 'TCOAT-001',
        manufacturer: 'Globe',
        model: 'G-XTREME 3.0',
        status: 'In Use',
        assignedToId: 'p-001',
        assignedToType: 'Personnel',
        assignedToName: 'John Smith',
        purchaseDate: '2019-06-15',
        purchasePrice: 1800,
        lifespanYears: 10,
        maintenanceHistory: [],
        pmSchedules: [],
        inspectionHistory: MOCK_INSPECTION_HISTORY['as-007'] || [],
        parentId: null,
        manufactureDate: '2019-05-20',
        lastCleaningDate: '2024-06-01',
        retirementDate: '2029-05-20',
        nextTestDueDate: '2025-06-15',
        nfpaCategory: 'Turnout Gear',
        weightLbs: 10,
    },
     {
        id: 'as-008',
        name: 'SCBA Pack 2',
        assetType: 'SCBA',
        category: 'Equipment',
        serialNumber: 'SCBA-P-002',
        manufacturer: 'Scott',
        model: 'Air-Pak X3 Pro',
        status: 'In Storage',
        assignedToId: null,
        assignedToType: null,
        purchaseDate: '2023-02-01',
        purchasePrice: 7500,
        nextTestDueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Overdue
        maintenanceHistory: [],
        pmSchedules: [],
        inspectionHistory: [],
        parentId: null,
        components: [],
        lifespanYears: 15,
        photos: [],
        documents: [],
        weightLbs: 15,
        isCritical: true,
    }
];

export let MOCK_CONSUMABLES: Consumable[] = [
    { 
        id: 'con-001', name: '4x4 Gauze Pads', category: 'Medical', quantity: 85, reorderLevel: 100,
        expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
        usageHistory: [
            { id: 'log-1', date: new Date(Date.now() - 86400000 * 5).toISOString(), change: -15, reason: 'Used on Incident 2024-00121', userId: 'p-002', userName: 'Jane Doe' },
            { id: 'log-2', date: new Date(Date.now() - 86400000 * 2).toISOString(), change: -5, reason: 'Used on Incident 2024-00125', userId: 'p-002', userName: 'Jane Doe' },
        ]
    },
    { 
        id: 'con-002', name: 'Paper Towels', category: 'Station Supplies', quantity: 20, reorderLevel: 10,
        usageHistory: [
             { id: 'log-3', date: new Date(Date.now() - 86400000 * 7).toISOString(), change: 50, reason: 'Restock', userId: 'user-003', userName: 'Admin User' },
        ]
    },
    { 
        id: 'con-003', name: 'AAA Batteries', category: 'Station Supplies', quantity: 8, reorderLevel: 24,
        usageHistory: []
    },
    {
        id: 'con-004', name: 'EpiPen', category: 'Medical', quantity: 4, reorderLevel: 2,
        expirationDate: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(), // Expired
        usageHistory: []
    },
    {
        id: 'con-005', name: 'Rescue Flares', category: 'Rescue', quantity: 12, reorderLevel: 10,
        expirationDate: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString(), // Expires soon
        usageHistory: []
    },
];

export let MOCK_TRAINING_COURSES: TrainingCourse[] = [
    { id: 'tc-1', name: 'Advanced First Aid', description: 'CPR and advanced first aid techniques.', durationHours: 8, isRequired: true },
    { id: 'tc-2', name: 'Fire Officer I', description: 'Introductory course for company officers.', durationHours: 40 },
    { id: 'tc-3', name: 'EVOC', description: 'Emergency Vehicle Operator Course.', durationHours: 16, isRequired: true },
];

export let MOCK_SCHEDULED_TRAININGS: ScheduledTraining[] = [
    { id: 'st-1', courseId: 'tc-1', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), instructor: 'Chief Miller', attendeeIds: ['p-001', 'p-002'] },
    { id: 'st-2', courseId: 'tc-3', date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), instructor: 'John Smith', attendeeIds: [] },
    { id: 'st-3', courseId: 'tc-2', date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), instructor: 'Chris Green', attendeeIds: [] },
];

export let MOCK_FOLDERS: Folder[] = [
    { id: 'f-1', name: 'SOPs', parentId: null },
    { id: 'f-2', name: 'Training Materials', parentId: null },
];

export let MOCK_DOCUMENTS: Document[] = [
    { id: 'd-1', name: 'Engine Operations.pdf', folderId: 'f-1', size: '2.5MB', version: 2, modifiedAt: '2024-06-01', type: 'PDF' },
    { id: 'd-2', name: 'EVOC Presentation.pptx', folderId: 'f-2', size: '5.1MB', version: 1, modifiedAt: '2024-07-10', type: 'Word' },
];

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

const nextMonthDate = new Date(currentYear, currentMonth + 1, 15);
const nextNextMonthDate = new Date(currentYear, currentMonth + 2, 10);

export let MOCK_EVENTS: Event[] = [
    { id: 'e-1', title: 'Station Maintenance', date: new Date(currentYear, currentMonth, 10, 9, 0).toISOString(), endDate: new Date(currentYear, currentMonth, 10, 12, 0).toISOString(), category: EventCategory.MAINTENANCE, description: 'Quarterly station deep clean', location: 'Station 1', isAllDay: false, assignedApparatusIds: ['a-001'], status: EventStatus.SCHEDULED },
    { id: 'e-2', title: 'Scheduled Training: EVOC', date: new Date(currentYear, currentMonth, 15, 13, 0).toISOString(), endDate: new Date(currentYear, currentMonth, 15, 17, 0).toISOString(), category: EventCategory.TRAINING, location: 'Training Grounds', isAllDay: false, assignedPersonnelIds: ['p-001', 'p-003'], status: EventStatus.SCHEDULED },
    { id: 'e-15-1', title: 'Driver Training', date: new Date(currentYear, currentMonth, 15, 8, 0).toISOString(), endDate: new Date(currentYear, currentMonth, 15, 12, 0).toISOString(), category: EventCategory.TRAINING, isAllDay: false, assignedPersonnelIds: ['p-003'], status: EventStatus.SCHEDULED, location: 'Training Track' },
    { id: 'e-15-2', title: 'Apparatus Check', date: new Date(currentYear, currentMonth, 15, 12, 0).toISOString(), endDate: new Date(currentYear, currentMonth, 15, 13, 0).toISOString(), category: EventCategory.MAINTENANCE, isAllDay: false, assignedApparatusIds: ['a-002'], status: EventStatus.SCHEDULED, description: 'Weekly check on Ladder 1' },
    { id: 'e-15-3', title: 'Public Demo Prep', date: new Date(currentYear, currentMonth, 15, 18, 0).toISOString(), endDate: new Date(currentYear, currentMonth, 15, 19, 0).toISOString(), category: EventCategory.PUBLIC_EVENT, isAllDay: false, status: EventStatus.SCHEDULED },
    
    // Public events with more robust dynamic dates
    { id: 'e-3', title: 'Annual Pancake Breakfast', date: new Date(currentYear, 7, 15, 7, 0).toISOString(), endDate: new Date(currentYear, 7, 15, 11, 0).toISOString(), category: EventCategory.PUBLIC_EVENT, description: 'Join us for our annual pancake breakfast fundraiser! All proceeds go to equipment upgrades.', location: 'Station 1', isAllDay: false, status: EventStatus.SCHEDULED },
    { id: 'e-4', title: 'Community CPR Class', date: new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), 18, 18, 0).toISOString(), endDate: new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), 18, 20, 0).toISOString(), category: EventCategory.PUBLIC_EVENT, description: 'Learn life-saving CPR skills. Free for all residents. Limited spots available.', location: 'Anytown Community Hall', isAllDay: false, status: EventStatus.SCHEDULED },
    { id: 'e-5', title: 'Public Meeting: Fire Safety', date: new Date(currentYear, currentMonth, 25, 19, 0).toISOString(), endDate: new Date(currentYear, currentMonth, 25, 20, 30).toISOString(), category: EventCategory.PUBLIC_EVENT, description: 'A public meeting to discuss fire safety tips for the upcoming dry season.', location: 'City Hall Auditorium', isAllDay: false, status: EventStatus.SCHEDULED },
    { id: 'e-7', title: 'Fire Prevention Week Open House', date: new Date(currentYear, 9, 9, 10, 0).toISOString(), endDate: new Date(currentYear, 9, 9, 14, 0).toISOString(), category: EventCategory.PUBLIC_EVENT, description: 'Come visit the station, see the trucks, and learn about fire safety!', location: 'Station 1', isAllDay: false, status: EventStatus.SCHEDULED },

    { id: 'e-6', title: 'Hydrant Testing', date: new Date(nextNextMonthDate.getFullYear(), nextNextMonthDate.getMonth(), 5, 9, 0).toISOString(), endDate: new Date(nextNextMonthDate.getFullYear(), nextNextMonthDate.getMonth(), 5, 15, 0).toISOString(), category: EventCategory.MAINTENANCE, description: 'Annual hydrant testing in the downtown area.', location: 'Downtown Anytown', isAllDay: false, status: EventStatus.SCHEDULED },
    { id: 'e-8', title: 'Full Day Department Meeting', date: new Date(currentYear, currentMonth, 20).toISOString(), isAllDay: true, category: EventCategory.MANUAL, description: 'Mandatory all-hands department meeting.', location: 'Headquarters' }
];

export let MOCK_BUDGET: Budget = {
    id: 'b-2024',
    fiscalYear: 2024,
    totalBudget: 500000,
    totalSpent: 375000,
    lastYearTotalBudget: 480000,
    lastYearTotalSpent: 390000,
    monthlySpending: [
        { month: 'Jan', spent: 30000 }, { month: 'Feb', spent: 28000 },
        { month: 'Mar', spent: 32000 }, { month: 'Apr', spent: 35000 },
        { month: 'May', spent: 40000 }, { month: 'Jun', spent: 55000 },
        { month: 'Jul', spent: 60000 }, { month: 'Aug', spent: 45000 },
        { month: 'Sep', spent: 25000 }, { month: 'Oct', spent: 15000 },
        { month: 'Nov', spent: 5000 }, { month: 'Dec', spent: 5000 },
    ],
    lineItems: [
        { id: 'li-1', category: 'Personnel', budgetedAmount: 300000, actualAmount: 280000, lastYearAmount: 290000, lastExpenseDate: '2024-07-15' },
        { id: 'li-2', category: 'Apparatus Maintenance', budgetedAmount: 100000, actualAmount: 110000, lastYearAmount: 95000, lastExpenseDate: '2024-07-10' },
        { id: 'li-3', category: 'Equipment', budgetedAmount: 75000, actualAmount: 60000, lastYearAmount: 70000, lastExpenseDate: '2024-05-18' },
        { id: 'li-4', category: 'Station Supplies', budgetedAmount: 25000, actualAmount: 25000, lastYearAmount: 35000, lastExpenseDate: '2024-07-01' },
    ]
};

export const MOCK_TRANSACTIONS: Record<string, Transaction[]> = {
    'li-1': [
        { id: 't-1-1', date: '2024-07-15', vendor: 'Payroll Run', amount: 23333 },
        { id: 't-1-2', date: '2024-06-30', vendor: 'Payroll Run', amount: 23333 },
        { id: 't-1-3', date: '2024-06-15', vendor: 'Payroll Run', amount: 23333 },
    ],
    'li-2': [
        { id: 't-2-1', date: '2024-07-10', vendor: 'Fleet Services Inc.', amount: 5400 },
        { id: 't-2-2', date: '2024-06-22', vendor: 'NAPA Auto Parts', amount: 1250 },
    ],
    'li-3': [
        { id: 't-3-1', date: '2024-05-18', vendor: 'Fire-Dex', amount: 12000 },
        { id: 't-3-2', date: '2024-04-02', vendor: 'MSA Safety', amount: 25000 },
    ],
    'li-4': [
        { id: 't-4-1', date: '2024-07-01', vendor: 'Station Supply Co.', amount: 1500 },
    ]
};

export let MOCK_EXPOSURE_LOGS: ExposureLog[] = [
    { id: 'exp-1', personnelId: 'p-002', incidentId: 'i-001', incidentNumber: '2024-00123', exposureDate: '2024-07-27', exposureType: 'Smoke', details: 'Prolonged exposure to heavy smoke during interior operations.' },
];

export let MOCK_SDS_SHEETS: SdsSheet[] = [
    { id: 'sds-1', productName: 'Class A Foam Concentrate', manufacturer: 'FoamCo', filePath: '/files/sds1.pdf', uploadedAt: '2023-01-15' },
];

export const MOCK_PREBUILT_REPORTS: PrebuiltReport[] = [
    { id: 'rep-1', title: 'Incident Summary by Month', description: 'A report of all incidents categorized by type and month.' },
    { id: 'rep-2', title: 'Personnel Roster & Certifications', description: 'A full list of all personnel and their current certifications.' },
    { id: 'rep-3', title: 'Training Compliance Report', description: 'Lists personnel who are missing required training courses.' },
    { id: 'rep-asset-eol', title: 'Assets Nearing End-of-Life', description: 'Lists assets that are within one year of their expected end-of-life date.' },
    { id: 'rep-upcoming-pm', title: 'Upcoming PM Schedule', description: 'A schedule of all preventative maintenance due in the next 90 days.' },
    { id: 'rep-failure-rate', title: 'Asset Failure Rates', description: 'A report on repair frequencies by manufacturer and model to inform purchasing.' },
    { id: 'rep-nfpa-compliance', title: 'NFPA 1851 Compliance', description: 'Shows PPE items that are non-compliant with cleaning, inspection, or retirement standards.' },
];

export const DATA_SOURCE_FIELDS: Record<DataSource, {id: string, label: string}[]> = {
    incidents: [
        { id: 'incidentNumber', label: 'Incident #' },
        { id: 'type', label: 'Type' },
        { id: 'address', label: 'Address' },
        { id: 'date', label: 'Date' },
        { id: 'status', label: 'Status' },
        { id: 'propertyLoss', label: 'Property Loss' },
        { id: 'contentsLoss', label: 'Contents Loss' },
    ],
    personnel: [
        { id: 'name', label: 'Name' },
        { id: 'rank', label: 'Rank' },
        { id: 'status', label: 'Status' },
        { id: 'badgeNumber', label: 'Badge #' },
        { id: 'hireDate', label: 'Hire Date' },
    ],
    apparatus: [
        { id: 'unitId', label: 'Unit ID' },
        { id: 'type', label: 'Type' },
        { id: 'status', label: 'Status' },
        { id: 'mileage', label: 'Mileage' },
        { id: 'engineHours', label: 'Engine Hours' },
        { id: 'year', label: 'Year' },
    ],
    assets: [
        { id: 'name', label: 'Asset Name' },
        { id: 'assetType', label: 'Asset Type' },
        { id: 'category', label: 'Category' },
        { id: 'status', label: 'Status' },
        { id: 'manufacturer', label: 'Manufacturer' },
        { id: 'purchasePrice', label: 'Purchase Price' },
    ],
};

export let MOCK_CUSTOM_REPORTS: CustomReport[] = [];
export let MOCK_ALERT_RULES: AlertRule[] = [];

export let MOCK_GIS_HYDRANTS: Hydrant[] = [
    { 
        id: 'hyd-001', 
        address: '123 Main St',
        location: { lat: 50, lng: 50.5 }, 
        status: 'In Service', 
        lastInspectionDate: '2024-05-10', 
        nextInspectionDueDate: '2025-05-10',
        inspections: [{ id: 'insp-1', hydrantId: 'hyd-001', date: '2024-05-10', inspectorName: 'John Smith', staticPressure: 65, residualPressure: 55, flowGpm: 1250, notes: 'Good condition' }],
        type: 'Dry Barrel',
        manufacturer: 'Mueller',
        zone: 'Downtown',
    },
    { 
        id: 'hyd-002', 
        address: '456 Oak Ave',
        location: { lat: 48, lng: 51.5 }, 
        status: 'Needs Maintenance', 
        lastInspectionDate: '2024-04-20',
        nextInspectionDueDate: '2025-04-20',
        inspections: [{ id: 'insp-2', hydrantId: 'hyd-002', date: '2024-04-20', inspectorName: 'Mike Johnson', staticPressure: 60, residualPressure: 40, flowGpm: 800, notes: 'Stem is hard to turn' }],
        type: 'Wet Barrel',
        manufacturer: 'Kennedy',
        zone: 'Residential North',
    },
    { 
        id: 'hyd-003', 
        address: '789 Pine Ln',
        location: { lat: 52, lng: 48 }, 
        status: 'Out of Service', 
        lastInspectionDate: '2023-11-01',
        nextInspectionDueDate: new Date(new Date().setDate(new Date().getDate() - 90)).toISOString(), // Overdue
        inspections: [{ id: 'insp-3', hydrantId: 'hyd-003', date: '2023-11-01', inspectorName: 'Chris Green', staticPressure: 0, residualPressure: 0, flowGpm: 0, notes: 'Broken nozzle, cannot operate.' }],
        type: 'Dry Barrel',
        manufacturer: 'Mueller',
        zone: 'Industrial',
    },
    { 
        id: 'hyd-004', 
        address: '101 Industrial Way',
        location: { lat: 53, lng: 46 }, 
        status: 'In Service', 
        lastInspectionDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(), // Inspected recently
        nextInspectionDueDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // Due next year
        inspections: [{ id: 'insp-4', hydrantId: 'hyd-004', date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(), inspectorName: 'Jane Doe', staticPressure: 70, residualPressure: 60, flowGpm: 1500, notes: 'Excellent flow.' }],
        type: 'Dry Barrel',
        manufacturer: 'Waterous',
        zone: 'Industrial',
    },
     { 
        id: 'hyd-005', 
        address: '222 Park Rd',
        location: { lat: 47, lng: 54 }, 
        status: 'In Service', 
        lastInspectionDate: '2024-06-15',
        nextInspectionDueDate: new Date(new Date().setDate(new Date().getDate() + 25)).toISOString(), // Due soon
        inspections: [{ id: 'insp-5', hydrantId: 'hyd-005', date: '2024-06-15', inspectorName: 'John Smith', staticPressure: 68, residualPressure: 58, flowGpm: 1350, notes: 'Normal operation.' }],
        type: 'Wet Barrel',
        manufacturer: 'Kennedy',
        zone: 'Residential North',
    },
];

export let MOCK_PRE_INCIDENT_PLANS: PreIncidentPlan[] = [
    { 
        id: 'pip-001', 
        propertyId: 'prop-001', 
        tacticalSummary: 'Two-story wood frame residential. No known hazards. Owner: Alice (555-123-4567). Utility Shutoffs: Gas meter on delta side.',
        accessNotes: 'Front door, back patio door.',
        floorPlans: [],
        photos: [],
        companyNotes: {
            engine: 'Standard residential fire attack.',
            truck: 'Place ladder on Alpha/Charlie corner.',
            command: 'Establish command on side Alpha.'
        }
    }
];

export let MOCK_BILLING_RATES: BillingRate[] = [
    { id: 'rate-1', item: 'Personnel', rate: 100, unit: 'per_hour' },
    { id: 'rate-2', item: 'Engine', rate: 300, unit: 'per_hour' },
    { id: 'rate-3', item: 'Ladder', rate: 500, unit: 'per_hour' },
];

export let MOCK_INVOICES: Invoice[] = [
    { id: 'inv-001', incidentId: 'i-002', incidentNumber: '2024-00124', propertyId: 'prop-002', propertyAddress: '456 Oak Ave', date: '2024-07-29', dueDate: '2024-08-28', sentDate: '2024-07-29', lineItems: [{ description: 'MVA Response', quantity: 1, rate: 450, total: 450 }], totalAmount: 450.00, status: 'Sent' },
    { id: 'inv-002', incidentId: 'i-001', incidentNumber: '2024-00123', propertyId: 'prop-001', propertyAddress: '123 Main St', date: '2024-07-28', dueDate: '2024-08-27', sentDate: '2024-07-28', paidDate: '2024-08-05', lineItems: [], totalAmount: 1250.00, status: 'Paid' },
    { id: 'inv-003', incidentId: 'i-003', incidentNumber: '2024-00125', propertyId: 'prop-003', propertyAddress: '789 Pine Ln', date: '2024-06-15', dueDate: '2024-07-15', sentDate: '2024-06-15', lineItems: [], totalAmount: 200.00, status: 'Overdue' },
    { id: 'inv-004', incidentId: 'i-004', incidentNumber: '2024-00126', propertyId: 'prop-001', propertyAddress: '123 Main St', date: '2024-08-01', dueDate: '2024-08-31', lineItems: [], totalAmount: 300.00, status: 'Draft' },
];

export let MOCK_SHIFTS: Shift[] = [
    { id: 'shift-1', personnelId: 'p-001', personnelName: 'John Smith', date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), shiftType: 'A Shift' },
    { id: 'shift-2', personnelId: 'p-002', personnelName: 'Jane Doe', date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), shiftType: 'A Shift' },
    { id: 'shift-3', personnelId: 'p-003', personnelName: 'Mike Johnson', date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), shiftType: 'B Shift' },
];

// --- V3.0 New Feature Mocks ---

export let MOCK_NOTIFICATIONS: Notification[] = [
    { id: 'notif-1', type: 'warning', message: '4x4 Gauze Pads are below reorder level.', link: '/app/inventory', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false },
    { id: 'notif-2', type: 'alert', message: 'New repair ticket opened for Rescue 1.', link: '/app/maintenance', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), read: false },
    { id: 'notif-3', type: 'info', message: 'New public records request submitted.', link: '/app/public-portal', timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), read: true },
];

export let MOCK_DEPARTMENT_INFO: DepartmentInfo = {
    name: 'Anytown Fire Department',
    fdid: 'FD123',
    address: { street: '123 Public Safety Way', city: 'Anytown', state: 'CA', zip: '12345' },
    phone: '555-0100',
    fax: '555-0109',
    email: 'contact@anytownfd.gov',
    fipsCode: '06-001',
    stationCount: 3,
    numberOfPaidFirefighters: 20,
    numberOfVolunteerFirefighters: 15,
    numberOfVolunteerPaidPerCallFirefighters: 10,
    medicalDirector: { name: 'Dr. Eve Sampson', role: 'Medical Director', phone: '555-0150', email: 'esampson@anytownhealth.org' },
    primaryContact: { name: 'Chief Miller', role: 'Fire Chief', phone: '555-0100', email: 'chief.miller@anytownfd.gov' },
    secondaryContact: { name: 'Deputy Chief Adams', role: 'Deputy Chief', phone: '555-0102', email: 'dcadams@anytownfd.gov' },
    frequencyStatus: 'Combination',
    servicesProvided: ['Fire Suppression', 'EMS (First Responder)', 'Rescue', 'HazMat'],
    annualDispatches: 2150,
    emsStatus: 'Does not provide transport'
};

export let MOCK_OPTIONAL_FIELDS: OptionalFieldConfig = {
    'basicModule.sectionB.censusTract': false,
    'basicModule.sectionE.district': true,
    'fireModule.ignition.itemFirstIgnited': false,
    'structureFireModule.detectors.type': false,
    'basicModule.sectionE.specialStudies': false,
    'basicModule.sectionG.propertyValue': false,
    'basicModule.sectionG.contentsValue': false,
    'fireModule.ignition.materialFirstIgnited': false,
    'structureFireModule.detectors.powerSupply': false,
    'structureFireModule.detectors.operation': false,
    'structureFireModule.detectors.effectiveness': false,
    'structureFireModule.detectors.failureReason': false,
    'structureFireModule.extinguishingSystem.type': false,
    'structureFireModule.extinguishingSystem.operation': false,
    'structureFireModule.extinguishingSystem.sprinklerHeads': false,
    'structureFireModule.extinguishingSystem.failureReason': false,
    'wildlandFireModule.weatherInfo.fuelMoisture': false,
    'wildlandFireModule.weatherInfo.dangerRating': false,
};

export let MOCK_AUDIT_LOGS: AuditLogEntry[] = [
    { id: 'al-1', userId: 'user-001', userName: 'Chief Miller', action: 'CREATE', target: 'Incident', targetId: 'i-003', timestamp: new Date(Date.now() - 10 * 3600000).toISOString() },
    { id: 'al-2', userId: 'user-003', userName: 'Admin User', action: 'UPDATE', target: 'Personnel Role', targetId: 'p-001', timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), details: { from: 'Chief', to: 'Training Officer' } },
    { id: 'al-3', userId: 'user-003', userName: 'Admin User', action: 'ASSET_TRANSFER', target: 'Apparatus', targetId: 'a-001', timestamp: new Date(Date.now() - 14 * 3600000).toISOString(), details: { assetId: 'as-001', assetName: 'Thermal Imager', from: 'Storage', to: 'Engine 1 > Driver Side 1 > Top Shelf' } },
];

export let MOCK_SAVED_ASSET_VIEWS: SavedAssetView[] = [];
export let MOCK_SAVED_APPARATUS_VIEWS: SavedApparatusView[] = [];
export let MOCK_SAVED_INCIDENT_VIEWS: SavedIncidentView[] = [];

export let MOCK_SAVED_PERSONNEL_VIEWS: SavedPersonnelView[] = [
    {
        id: 'view-1',
        name: 'Active Firefighters (A-Z)',
        filters: {
            searchTerm: '',
            rank: 'Firefighter',
            status: 'Active',
        },
        sortConfig: {
            key: 'name',
            direction: 'ascending',
        }
    },
    {
        id: 'view-2',
        name: 'Probationary Members',
        filters: {
            searchTerm: '',
            rank: 'All',
            status: 'Probation',
        },
        sortConfig: null
    }
];

export let MOCK_CONFIGURATION: SystemConfiguration = {
    incidentTypes: ['Structure Fire', 'MVA', 'Medical Emergency', 'Brush Fire', 'HazMat', 'Public Assist'],
    budgetCategories: ['Personnel', 'Apparatus Maintenance', 'Equipment', 'Station Supplies', 'Training', 'Capital Projects'],
    optionalFields: MOCK_OPTIONAL_FIELDS,
    assetViews: MOCK_SAVED_ASSET_VIEWS,
};

export let MOCK_INTERNAL_MESSAGES: InternalMessage[] = [
    { id: 'im-1', authorId: 'p-001', authorName: 'John Smith', authorAvatar: 'https://picsum.photos/seed/captain/100/100', content: 'Reminder: A-shift, quarterly hose testing is this Thursday. Make sure all apparatus are ready.', timestamp: new Date(Date.now() - 8 * 3600000).toISOString() },
    { id: 'im-2', authorId: 'p-005', authorName: 'Chris Green', authorAvatar: 'https://picsum.photos/seed/chris/100/100', content: 'There are leftover sandwiches in the fridge from the training class today. Help yourselves.', timestamp: new Date(Date.now() - 4 * 3600000).toISOString() },
];

export let MOCK_SECURITY_ROLES: SecurityRole[] = [
    {
        id: 'role-ff',
        name: 'Firefighter',
        description: 'Standard access for firefighters. Can view records and create incidents.',
        scope: 'Station',
        permissions: ['view_personnel', 'view_apparatus', 'create_incident'],
        parentId: null,
        visibleModules: ['Dashboard', 'Personnel', 'Apparatus', 'Incidents', 'Assets', 'Inventory', 'Comms', 'Hydrants', 'GIS Dashboard', 'Calendar', 'Training', 'Documents', 'Health & Safety']
    },
    {
        id: 'role-officer',
        name: 'Company Officer',
        description: 'Access for company-level officers (Captains, Lieutenants). Can lock incidents.',
        scope: 'Shift/Platoon',
        permissions: ['lock_incident'],
        parentId: 'role-ff',
        visibleModules: []
    },
    {
        id: 'role-chief',
        name: 'Chief',
        description: 'High-level command staff access. Can manage users and view most modules.',
        scope: 'Global',
        permissions: ['edit_personnel', 'edit_apparatus', 'view_users', 'invite_users', 'edit_user_profile'],
        parentId: 'role-officer',
        visibleModules: ALL_NAV_LINKS.map(l => l.label).filter(l => l !== 'Settings')
    },
    {
        id: 'role-admin',
        name: 'Administrator',
        description: 'Full system access. Unrestricted permissions.',
        scope: 'Global',
        permissions: ['delete_incident', 'access_settings', 'assign_roles'],
        parentId: 'role-chief',
        visibleModules: ALL_NAV_LINKS.map(l => l.label)
    }
];