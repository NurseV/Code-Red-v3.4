
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Tabs from '../components/ui/Tabs';
import * as api from '../services/api';
import { Property, Owner, PreIncidentPlan, PropertyInspection } from '../types';
import { BuildingIcon, UsersIcon, FileTextIcon, ShieldCheckIcon, DropletIcon, WrenchIcon, HeartPulseIcon } from '../components/icons/Icons';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-dark-text-secondary">{label}</dt>
        <dd className="mt-1 text-sm text-dark-text">{value || 'N/A'}</dd>
    </div>
);

const TacticalSummaryCard: React.FC<{property: Property}> = ({ property }) => (
    <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <DetailItem label="Construction" value={property.constructionType} />
        <DetailItem label="Occupancy" value={property.occupancyType} />
        <DetailItem label="Stories" value={property.stories} />
        <DetailItem label="Sprinklers" value={property.fireProtection.sprinklerSystem} />
    </div>
);

const OverviewTab: React.FC<{ property: Property, owners: Owner[] }> = ({ property, owners }) => (
    <div className="space-y-6">
        <TacticalSummaryCard property={property} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="Building Details" icon={<BuildingIcon className="h-5 w-5"/>}>
                <DetailItem label="Square Footage" value={property.squareFootage?.toLocaleString()} />
                <DetailItem label="Owner(s)" value={owners.map(o => o.name).join(', ')} />
            </Card>
            <Card title="Fire Protection" icon={<ShieldCheckIcon className="h-5 w-5"/>}>
                 <DetailItem label="Standpipes" value={property.fireProtection.standpipes ? 'Yes' : 'No'} />
                 <DetailItem label="FACP Location" value={property.fireProtection.facpLocation} />
                 <DetailItem label="FDC Location" value={property.fireProtection.sprinklerFdcLocation} />
            </Card>
            <Card title="Utility Shutoffs" icon={<WrenchIcon className="h-5 w-5"/>}>
                 <DetailItem label="Gas" value={property.utilityShutoffs.gas} />
                 <DetailItem label="Water" value={property.utilityShutoffs.water} />
                 <DetailItem label="Electric" value={property.utilityShutoffs.electric} />
            </Card>
        </div>
        <Card title="Known Hazards" icon={<HeartPulseIcon className="h-5 w-5"/>}>
             {property.knownHazards.length > 0 ? (
                 <ul className="space-y-2">
                    {property.knownHazards.map(hazard => (
                        <li key={hazard.id} className="p-2 bg-dark-bg rounded-md">
                            <span className={`font-bold ${hazard.severity === 'High' ? 'text-red-400' : hazard.severity === 'Medium' ? 'text-yellow-400' : 'text-dark-text'}`}>{hazard.severity}: </span>
                            {hazard.description}
                        </li>
                    ))}
                 </ul>
             ) : (
                <p className="text-dark-text-secondary">No known hazards on file.</p>
             )}
        </Card>
    </div>
);

const InspectionsTab: React.FC<{ inspections: PropertyInspection[] }> = ({ inspections }) => (
    <div>
        <div className="flex justify-end mb-4">
            <Button>Schedule New Inspection</Button>
        </div>
        {inspections.length > 0 ? (
            <div className="space-y-4">
                {inspections.map(insp => (
                    <Card key={insp.id} title={`Inspection - ${new Date(insp.date).toLocaleDateString()}`}>
                        <div className="grid grid-cols-3 gap-4">
                            <DetailItem label="Inspector" value={insp.inspectorName} />
                            <DetailItem label="Result" value={<span className={`font-bold ${insp.result === 'Pass' ? 'text-green-400' : 'text-red-400'}`}>{insp.result}</span>} />
                        </div>
                        {insp.violations.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-dark-border">
                                <h4 className="font-semibold mb-2">Violations:</h4>
                                <ul className="list-disc ml-5 space-y-1 text-dark-text-secondary">
                                    {insp.violations.map((v, i) => <li key={i}>{v.description} (Code: {v.code})</li>)}
                                </ul>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        ) : (
            <p className="text-center py-8 text-dark-text-secondary">No inspection history for this property.</p>
        )}
    </div>
);

const PreIncidentPlanTab: React.FC<{ pip: PreIncidentPlan | null; propertyId: string; onUpdate: () => void }> = ({ pip, propertyId, onUpdate }) => {
    const navigate = ReactRouterDOM.useNavigate();
    const handleCreatePip = async () => {
        try {
            await api.createPIPForProperty(propertyId);
            onUpdate();
        } catch(e) {
            alert("Failed to create PIP");
        }
    };
    if (!pip) {
        return <div className="text-center py-8"><p className="text-dark-text-secondary mb-4">No PIP on file for this property.</p><Button onClick={handleCreatePip}>Create Pre-Incident Plan</Button></div>;
    }
    return <div className="space-y-4"><Card title="Tactical Notes"><pre className="whitespace-pre-wrap text-dark-text-secondary">{pip.tacticalSummary}</pre></Card></div>;
}

const DocsTab: React.FC<{ documents: any[] }> = ({ documents }) => (
    <div>{JSON.stringify(documents)}</div>
);

const PropertyDetail: React.FC = () => {
    const { id } = ReactRouterDOM.useParams<{ id: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const [property, setProperty] = useState<Property | null>(null);
    const [owners, setOwners] = useState<Owner[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = React.useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const propData = await api.getPropertyById(id);
            if (propData) {
                setProperty(propData);
                const ownerData = await Promise.all(propData.ownerIds.map(oid => api.getOwners().then(allOwners => allOwners.find(o => o.id === oid))));
                setOwners(ownerData.filter(Boolean) as Owner[]);
            }
        } catch (e) {
            console.error("Failed to load property details", e);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading) {
        return <div className="text-center p-8 text-dark-text-secondary">Loading property details...</div>;
    }

    if (!property) {
        return (
            <Card title="Not Found">
                <p className="text-center text-dark-text-secondary">Property not found.</p>
                <div className="text-center mt-4">
                    <ReactRouterDOM.Link to="/app/properties"><Button>Back to Properties</Button></ReactRouterDOM.Link>
                </div>
            </Card>
        );
    }

    const TABS = [
        { label: 'Overview', content: <OverviewTab property={property} owners={owners} /> },
        { label: 'Inspections', content: <InspectionsTab inspections={property.inspections} /> },
        { label: 'Pre-Incident Plan', content: <PreIncidentPlanTab pip={property.preIncidentPlan} propertyId={property.id} onUpdate={fetchData} /> },
        { label: 'Docs & History', content: <DocsTab documents={property.documents} /> },
    ];
    
    return (
        <div className="space-y-6">
            <Card>
                <div className="flex items-center">
                    <BuildingIcon className="h-10 w-10 text-brand-primary mr-4" />
                    <div>
                        <h2 className="text-2xl font-bold text-dark-text">{property.address}</h2>
                        <p className="text-lg text-dark-text-secondary">Parcel ID: {property.parcelId}</p>
                    </div>
                </div>
            </Card>
            
            <Card>
                <Tabs tabs={TABS} tabsContainerClassName="px-6" />
            </Card>
        </div>
    );
};

export default PropertyDetail;
