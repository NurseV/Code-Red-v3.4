
import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Tabs from '../components/ui/Tabs';
import Table from '../components/ui/Table';
import * as api from '../services/api';
import { NfirsIncident, NfirsSectionKPerson, Personnel, Apparatus, Attachment } from '../types';
import { NFIRS_INCIDENT_TYPES } from '../constants/nfirs-codes';
import { EditIcon, PrinterIcon, ShieldAlertIcon, MapPinIcon, ClockIcon, CalendarIcon, BuildingIcon, DollarSignIcon, UsersIcon, TruckIcon, FileTextIcon } from '../components/icons/Icons';

const Redacted: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="bg-gray-400 text-gray-400 select-none rounded">{children}</span>

const DetailRow: React.FC<{ label: string; value?: React.ReactNode; className?: string; isRedacted?: boolean, icon?: React.ReactNode }> = ({ label, value, className = '', isRedacted = false, icon }) => (
    <div className={className}>
        <dt className="text-sm font-medium text-dark-text-secondary flex items-center">
            {icon && <span className="mr-2 h-4 w-4 inline-flex items-center justify-center">{icon}</span>}
            {label}
        </dt>
        <dd className="mt-1 text-base font-semibold text-dark-text">{isRedacted ? <Redacted>{value || '---'}</Redacted> : (value || '---')}</dd>
    </div>
);

const TimelineEvent: React.FC<{ label: string, time: string, isLast?: boolean }> = ({ label, time, isLast }) => (
  <div className="flex-1 flex items-start text-center">
    <div className="flex-1 flex flex-col items-center relative">
        <div className="w-4 h-4 rounded-full bg-brand-primary border-2 border-dark-card z-10"></div>
        <p className="text-xs font-semibold text-dark-text mt-2">{label}</p>
        <p className="text-xs text-dark-text-secondary">{time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
    </div>
    {!isLast && <div className="flex-1 h-0.5 bg-dark-border mt-1.5"></div>}
  </div>
);

const IncidentTimeline: React.FC<{ times: NfirsIncident['basicModule']['sectionE'] }> = ({ times }) => {
    const events = [
        { label: 'Alarm', time: times.alarmDateTime },
        { label: 'Arrival', time: times.arrivalDateTime },
        { label: 'Controlled', time: times.controlledDateTime },
        { label: 'Last Unit Cleared', time: times.lastUnitClearedDateTime },
    ].filter(e => e.time); // only show events that have a time

    return (
        <div className="border-t border-dark-border mt-6 pt-6">
            <h3 className="text-lg font-semibold text-brand-secondary mb-4">Incident Timeline</h3>
            <div className="flex items-start">
                {events.map((event, index) => (
                    <TimelineEvent key={event.label} {...event} isLast={index === events.length - 1} />
                ))}
            </div>
        </div>
    );
};


const OverviewTab: React.FC<{ incident: NfirsIncident, isRedacted: boolean }> = ({ incident, isRedacted }) => {
    const { basicModule, fireModule } = incident;
    const fullAddress = `${basicModule.sectionB.streetOrHighwayName}, ${basicModule.sectionB.city}, ${basicModule.sectionB.state} ${basicModule.sectionB.zipCode}`;
    const gisLink = `/app/gis?search=${encodeURIComponent(fullAddress)}`;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-brand-secondary mb-3">Identification & Location</h3>
                <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-4">
                    <DetailRow label="FDID" value={basicModule.sectionA.fdid} />
                    <DetailRow label="Station" value={basicModule.sectionA.station} />
                    <DetailRow label="Exposure" value={basicModule.sectionA.exposureNumber} />
                    <DetailRow label="Incident Date" value={new Date(basicModule.sectionA.incidentDate).toLocaleDateString()} icon={<CalendarIcon/>} />
                    <DetailRow label="Address" value={<ReactRouterDOM.Link to={gisLink} className="hover:underline">{fullAddress}</ReactRouterDOM.Link>} className="col-span-2 lg:col-span-4" icon={<MapPinIcon/>}/>
                    <DetailRow label="Location Type" value={basicModule.sectionB.locationType} icon={<BuildingIcon/>} />
                    <DetailRow label="Property Use" value={basicModule.propertyUse} />
                </dl>
            </div>

            <IncidentTimeline times={basicModule.sectionE} />
            
             <div className="border-t border-dark-border mt-6 pt-6">
                <h3 className="text-lg font-semibold text-brand-secondary mb-3">Financials & Impact</h3>
                 <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-4">
                    <DetailRow label="Property Loss" value={`$${basicModule.sectionG.propertyLoss.toLocaleString()}`} icon={<DollarSignIcon />} />
                    <DetailRow label="Contents Loss" value={`$${basicModule.sectionG.contentsLoss.toLocaleString()}`} icon={<DollarSignIcon />} />
                    <DetailRow label="Civilian Casualties" value={basicModule.sectionH.casualtiesCivilian} icon={<UsersIcon />} />
                    <DetailRow label="Fire Service Casualties" value={basicModule.sectionH.casualtiesFire} icon={<UsersIcon />} />
                </dl>
             </div>
        </div>
    );
};

const UnitsTab: React.FC<{ apparatusIds: string[] }> = ({ apparatusIds }) => {
    const [apparatus, setApparatus] = useState<Apparatus[]>([]);
    useEffect(() => {
        api.getApparatusList().then(all => setApparatus(all.filter(a => apparatusIds.includes(a.id))));
    }, [apparatusIds]);
    
    const columns = [
        { header: 'Unit ID', accessor: (item: Apparatus) => <ReactRouterDOM.Link to={`/app/apparatus/${item.id}`} className="hover:underline text-brand-secondary">{item.unitId}</ReactRouterDOM.Link> },
        { header: 'Type', accessor: (item: Apparatus) => item.type },
        { header: 'Status', accessor: (item: Apparatus) => item.status },
    ];
    
    return <Table columns={columns} data={apparatus} />
};

const PersonnelTab: React.FC<{ personnelIds: string[] }> = ({ personnelIds }) => {
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    useEffect(() => {
        api.getPersonnelList().then(all => setPersonnel(all.filter(p => personnelIds.includes(p.id))));
    }, [personnelIds]);
    
     const columns = [
        { header: 'Name', accessor: (item: Personnel) => <ReactRouterDOM.Link to={`/app/personnel/${item.id}`} className="hover:underline text-brand-secondary">{item.name}</ReactRouterDOM.Link> },
        { header: 'Rank', accessor: (item: Personnel) => item.rank },
        { header: 'Badge #', accessor: (item: Personnel) => item.badgeNumber },
    ];

    return <Table columns={columns} data={personnel} />
};

const NarrativeTab: React.FC<{ narrative: string, isRedacted: boolean }> = ({ narrative, isRedacted }) => (
    <div className="prose prose-invert max-w-none prose-p:text-dark-text-secondary">
        {isRedacted ? <Redacted>{narrative || 'No remarks provided.'}</Redacted> : 
            <p className="whitespace-pre-wrap">{narrative || 'No remarks provided.'}</p>
        }
    </div>
);

const AttachmentsTab: React.FC<{ attachments: Attachment[] }> = ({ attachments }) => (
    <ul className="divide-y divide-dark-border">
        {attachments.map(att => (
            <li key={att.id} className="py-3 flex justify-between items-center">
                <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-brand-secondary">
                    <FileTextIcon className="h-5 w-5 mr-3"/>
                    <div>
                        <p className="font-medium">{att.fileName}</p>
                        <p className="text-sm text-dark-text-secondary">{att.size}</p>
                    </div>
                </a>
            </li>
        ))}
        {attachments.length === 0 && <p className="text-center py-4 text-dark-text-secondary">No attachments for this incident.</p>}
    </ul>
);

const IncidentDetail: React.FC = () => {
    const { id } = ReactRouterDOM.useParams<{ id: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const [incident, setIncident] = useState<NfirsIncident | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRedacted, setIsRedacted] = useState(false);

    useEffect(() => {
        if (!id) return;
        
        setIsLoading(true);
        api.getIncidentById(id)
            .then(data => {
                if (data) setIncident(data);
                else {
                    alert("Incident not found.");
                    navigate('/app/incidents');
                }
            })
            .finally(() => setIsLoading(false));
    }, [id, navigate]);
    
    const handlePrint = () => { window.print(); }
    
    if (isLoading) return <div className="text-center text-dark-text-secondary">Loading incident details...</div>;

    if (!incident) return (
        <div className="text-center">
            <h2 className="text-2xl font-bold text-dark-text">Incident Not Found</h2>
            <ReactRouterDOM.Link to="/app/incidents" className="mt-4 inline-block"><Button>Back to Incident Log</Button></ReactRouterDOM.Link>
        </div>
    );
                           
    const statusColorClass = incident.status === 'Locked' ? 'bg-green-500/20 text-green-300' :
                           incident.status === 'Review Needed' ? 'bg-yellow-500/20 text-yellow-400' :
                           'bg-blue-500/20 text-blue-400';
                           
    const incidentTypeDescription = NFIRS_INCIDENT_TYPES.find(t => t.code === incident.basicModule.incidentType)?.description;
    
    const TABS = [
        { label: 'Overview', content: <OverviewTab incident={incident} isRedacted={isRedacted} /> },
        { label: 'Narrative', content: <NarrativeTab narrative={incident.basicModule.remarks} isRedacted={isRedacted} /> },
        { label: `Units (${(incident.respondingApparatusIds || []).length})`, content: <UnitsTab apparatusIds={incident.respondingApparatusIds || []} /> },
        { label: `Personnel (${(incident.respondingPersonnelIds || []).length})`, content: <PersonnelTab personnelIds={incident.respondingPersonnelIds || []} /> },
        { label: `Attachments (${(incident.attachments || []).length})`, content: <AttachmentsTab attachments={incident.attachments || []} /> },
    ];

    return (
        <div>
             <div className="flex justify-between items-center mb-4 no-print">
                <div className="flex items-center space-x-2">
                    <Button variant="secondary" onClick={() => navigate(`/app/incidents/${id}/edit`)} icon={<EditIcon className="h-4 w-4 mr-2"/>}>Edit Report</Button>
                    <Button variant="ghost" onClick={handlePrint} icon={<PrinterIcon className="h-4 w-4 mr-2"/>}>Print / Export PDF</Button>
                </div>
                <div className="flex items-center">
                    <label htmlFor="redacted-mode" className="mr-3 text-sm font-medium text-dark-text-secondary flex items-center">
                        <ShieldAlertIcon className="h-5 w-5 mr-2 text-yellow-400"/>Redacted Mode
                    </label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="redacted-mode" id="redacted-mode" checked={isRedacted} onChange={() => setIsRedacted(!isRedacted)} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                         <label htmlFor="redacted-mode" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-500 cursor-pointer"></label>
                    </div>
                     <style>{`.toggle-checkbox:checked { right: 0; border-color: #DC2626; } .toggle-checkbox:checked + .toggle-label { background-color: #DC2626; }`}</style>
                </div>
            </div>

            <Card className="printable-content">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-dark-text">{incident.basicModule.sectionA.incidentNumber}</h2>
                        <p className="text-lg text-dark-text-secondary">{incidentTypeDescription || 'Unknown Incident Type'}</p>
                    </div>
                    <div className="text-right">
                        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${statusColorClass}`}>
                          {incident.status}
                        </span>
                    </div>
                </div>
                <Tabs tabs={TABS} />
            </Card>
        </div>
    );
};

export default IncidentDetail;
