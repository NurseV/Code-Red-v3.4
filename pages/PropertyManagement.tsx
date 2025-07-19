

import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import * as api from '../services/api';
import { Property, Owner, Coordinates, MapItem } from '../types';
import { FileSpreadsheetIcon, MapIcon, ListChecksIcon, HomeIcon, BuildingIcon, ShieldCheckIcon, PlusIcon } from '../components/icons/Icons';

const MapView: React.FC<{properties: Property[]}> = ({ properties }) => {
    const navigate = ReactRouterDOM.useNavigate();
    const mapItems: MapItem[] = properties.filter(p => p.location).map(p => ({
        id: p.id,
        location: p.location!,
        type: 'Property',
        label: p.address,
        Icon: HomeIcon,
        color: p.preIncidentPlan ? 'text-pink-400' : 'text-gray-400',
        hasPip: !!p.preIncidentPlan,
        data: p,
    }));
    
    return (
        <div className="relative w-full h-[60vh] bg-dark-bg rounded-lg overflow-hidden border border-dark-border">
            {mapItems.map(item => (
                <div 
                    key={item.id} 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer" 
                    style={{ top: `${item.location.lat}%`, left: `${item.location.lng}%` }}
                    onClick={() => navigate(`/app/properties/${item.id}`)}
                >
                    <item.Icon className={`h-6 w-6 ${item.color} transition-transform duration-200 group-hover:scale-150 drop-shadow-lg`} />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max hidden group-hover:block bg-dark-bg text-white text-xs rounded py-1 px-2 border border-dark-border shadow-lg z-10">
                        {item.label}
                    </div>
                </div>
            ))}
        </div>
    );
};


const PropertiesTab: React.FC = () => {
    const navigate = ReactRouterDOM.useNavigate();
    const [properties, setProperties] = useState<(Property & { ownerNames: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    
    // Filters
    const [occupancyFilter, setOccupancyFilter] = useState<string>('All');
    const [pipFilter, setPipFilter] = useState<string>('All');

    const fetchProperties = () => {
        setIsLoading(true);
        api.getProperties({ occupancyType: occupancyFilter, hasPip: pipFilter === 'All' ? undefined : pipFilter === 'Yes' }).then(setProperties).finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchProperties();
    }, [occupancyFilter, pipFilter]);
    
    const handleImport = async () => {
        if(window.confirm("This is a mock import. It will add one pre-defined property to the list. Proceed?")) {
            await api.importProperties("mock_csv_data");
            fetchProperties();
        }
    }

    const columns = [
        { header: 'Address', accessor: (item: Property) => item.address },
        { header: 'Parcel ID', accessor: (item: Property) => item.parcelId },
        { header: 'Occupancy', accessor: (item: Property) => item.occupancyType },
        { header: 'Owner(s)', accessor: (item: Property & { ownerNames: string }) => item.ownerNames },
        { header: 'PIP Status', accessor: (item: Property) => item.preIncidentPlan ? <ShieldCheckIcon className="h-5 w-5 text-green-400" /> : <span className="text-gray-500">-</span> },
        {
            header: 'Actions',
            accessor: (item: Property) => (
                <Button variant="secondary" onClick={() => navigate(`/app/properties/${item.id}`)} className="py-1 px-2 text-xs">
                    View Details
                </Button>
            ),
        },
    ];

    if (isLoading) return <div className="text-center p-8 text-dark-text-secondary">Loading properties...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center space-x-4">
                    <select value={occupancyFilter} onChange={e => setOccupancyFilter(e.target.value)} className="bg-dark-bg border-dark-border rounded-md py-2 px-3 text-dark-text">
                        <option value="All">All Occupancy Types</option>
                        <option value="Residential - Single Family">Residential - Single Family</option>
                        <option value="Residential - Multi-Family">Residential - Multi-Family</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Industrial">Industrial</option>
                    </select>
                     <select value={pipFilter} onChange={e => setPipFilter(e.target.value)} className="bg-dark-bg border-dark-border rounded-md py-2 px-3 text-dark-text">
                        <option value="All">All PIP Statuses</option>
                        <option value="Yes">Has PIP</option>
                        <option value="No">No PIP</option>
                    </select>
                 </div>
                 <div className="flex items-center space-x-2">
                    <Button onClick={handleImport} icon={<FileSpreadsheetIcon className="h-4 w-4 mr-2" />}>
                        Import from CSV
                    </Button>
                    <Button onClick={() => navigate('/app/properties/new')} icon={<PlusIcon className="h-4 w-4 mr-2" />}>
                        New Property
                    </Button>
                    <div className="p-1 bg-dark-bg border border-dark-border rounded-lg flex items-center">
                        <Button variant={viewMode === 'list' ? 'primary' : 'ghost'} size="sm" className="!px-3 !py-1" onClick={() => setViewMode('list')} aria-label="List View"><ListChecksIcon className="h-5 w-5"/></Button>
                        <Button variant={viewMode === 'map' ? 'primary' : 'ghost'} size="sm" className="!px-3 !py-1" onClick={() => setViewMode('map')} aria-label="Map View"><MapIcon className="h-5 w-5"/></Button>
                    </div>
                 </div>
            </div>
            {viewMode === 'list' ? <Table columns={columns} data={properties} /> : <MapView properties={properties} />}
        </div>
    );
};

const OwnersTab: React.FC = () => {
    const [owners, setOwners] = useState<Owner[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.getOwners().then(setOwners).finally(() => setIsLoading(false));
    }, []);

    const columns = [
        { header: 'Name', accessor: (item: Owner) => item.name },
        { header: 'Mailing Address', accessor: (item: Owner) => item.mailingAddress },
        { header: 'Phone', accessor: (item: Owner) => item.phone },
        { header: 'Email', accessor: (item: Owner) => item.email },
    ];

    if (isLoading) return <div className="text-center p-8 text-dark-text-secondary">Loading owners...</div>;

    return <Table columns={columns} data={owners} />;
};


const PropertyManagement: React.FC = () => {
    const TABS = [
        { label: 'Properties', content: <PropertiesTab /> },
        { label: 'Owners', content: <OwnersTab /> },
    ];

    return (
        <Card title="Property & Owner Management">
            <Tabs tabs={TABS} />
        </Card>
    );
};

export default PropertyManagement;