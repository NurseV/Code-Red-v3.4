


import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Accordion from '../components/ui/Accordion';
import * as api from '../services/api';
import { 
    HomeIcon, FireExtinguisherIcon, AlertTriangleIcon, TruckIcon,
    RulerIcon, MousePointerIcon, PencilIcon, SatelliteIcon, TrafficConeIcon, 
    PrinterIcon, CheckIcon, PlusIcon, CommandPostIcon, StagingAreaIcon, MedicalTentIcon, LayersIcon, XIcon, MapIcon,
} from '../components/icons/Icons';
import { 
    Property, Hydrant, NfirsIncident, Apparatus, Coordinates, MapItem, MapItemType, GisEventPlan
} from '../types';

type ActiveTool = 'select' | 'measure' | 'draw-polygon';
type MapView = 'street' | 'satellite' | 'traffic';

const GisDashboard: React.FC = () => {
    const [allItems, setAllItems] = useState<{ type: string; data: any }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Map Interaction State
    const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
    const [infoPopupCoords, setInfoPopupCoords] = useState<Coordinates | null>(null);
    
    // UI State
    const [activeTool, setActiveTool] = useState<ActiveTool>('select');
    const [mapView, setMapView] = useState<MapView>('street');

    // Layer & Filter State
    const [layerVisibility, setLayerVisibility] = useState({
        properties: true,
        hydrants: true,
        incidents: true,
        apparatus: true,
    });
    const [layerFilters, setLayerFilters] = useState({
        hydrants: { status: 'All' },
        incidents: { type: 'All' },
        apparatus: { type: 'All', status: 'All' },
    });
    const [clusterPoints, setClusterPoints] = useState(false);

    // Event Planning State
    const [eventPlan, setEventPlan] = useState<GisEventPlan>({ name: 'New Event Plan', drawnShapes: [], placedIcons: [] });
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPolygonPoints, setCurrentPolygonPoints] = useState<Coordinates[]>([]);

    // Measurement State
    const [measurePoints, setMeasurePoints] = useState<Coordinates[]>([]);

    // --- Data Fetching ---
    const fetchData = useCallback(() => {
        setIsLoading(true);
        api.getGisMapItems().then(setAllItems).finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleItemClick = (item: MapItem, coords: Coordinates) => {
        setSelectedItem(item);
        setInfoPopupCoords(coords);
    };

    // --- Map Items Transformation ---
    const mapItems = useMemo(() => {
        const getHydrantIcon = (status: Hydrant['status']) => {
            if (status === 'Out of Service') return { Icon: FireExtinguisherIcon, color: 'text-red-500' };
            if (status === 'Needs Maintenance') return { Icon: FireExtinguisherIcon, color: 'text-yellow-400' };
            return { Icon: FireExtinguisherIcon, color: 'text-blue-400' };
        };
        const getApparatusIcon = (type: Apparatus['type'], status: Apparatus['status']) => {
            const color = status === 'Out of Service' ? 'text-gray-500' : status === 'Maintenance' ? 'text-yellow-600' : 'text-green-400';
            return { Icon: TruckIcon, color };
        };

        let items: MapItem[] = [];
        if (layerVisibility.properties) {
            items.push(...allItems.filter(i => i.type === 'property' && i.data.location).map(({data}: {data: Property}) => ({
                id: `prop-${data.id}`, location: data.location!, type: 'Property' as const, data,
                label: data.address, Icon: HomeIcon, color: data.preIncidentPlan ? 'text-pink-400' : 'text-gray-400', hasPip: !!data.preIncidentPlan
            })));
        }
        if (layerVisibility.hydrants) {
            items.push(...allItems.filter(i => i.type === 'hydrant' && i.data.location && (layerFilters.hydrants.status === 'All' || i.data.status === layerFilters.hydrants.status)).map(({data}: {data: Hydrant}) => ({
                id: `hyd-${data.id}`, location: data.location, type: 'Hydrant' as const, data,
                label: `Hydrant #${data.id} (${data.status})`, ...getHydrantIcon(data.status)
            })));
        }
        if (layerVisibility.incidents) {
            items.push(...allItems.filter(i => i.type === 'incident' && i.data.location && i.data.status !== 'Locked').map(({data}: {data: NfirsIncident}) => ({
                id: `inc-${data.id}`, location: data.location!, type: 'Incident' as const, data,
                label: `${data.type} - ${data.address}`, Icon: AlertTriangleIcon, color: 'text-red-500 animate-pulse'
            })));
        }
        if (layerVisibility.apparatus) {
             items.push(...allItems.filter(i => i.type === 'apparatus' && i.data.location && (layerFilters.apparatus.status === 'All' || i.data.status === layerFilters.apparatus.status) && (layerFilters.apparatus.type === 'All' || i.data.type === layerFilters.apparatus.type)).map(({data}: {data: Apparatus}) => ({
                id: `app-${data.id}`, location: data.location!, type: 'Apparatus' as const, data,
                label: data.unitId, ...getApparatusIcon(data.type, data.status)
            })));
        }
        return items;
    }, [layerVisibility, layerFilters, allItems]);

    const activeItemCounts = useMemo(() => ({
        properties: mapItems.filter(i => i.type === 'Property').length,
        hydrants: mapItems.filter(i => i.type === 'Hydrant').length,
        incidents: mapItems.filter(i => i.type === 'Incident').length,
        apparatus: mapItems.filter(i => i.type === 'Apparatus').length,
    }), [mapItems]);

    // --- Map Click Handler ---
    const handleMapClick = (coords: Coordinates) => {
        if (activeTool === 'measure') {
            setMeasurePoints(prev => prev.length === 2 ? [coords] : [...prev, coords]);
        }
        if (activeTool === 'draw-polygon') {
            if (!isDrawing) {
                setIsDrawing(true);
                setCurrentPolygonPoints([coords]);
            } else {
                setCurrentPolygonPoints(prev => [...prev, coords]);
            }
        }
    };
    
    // --- Pre-plan Event Handlers ---
    const handleAddEventIcon = (type: 'command_post' | 'staging_area' | 'medical_tent') => {
        // This is a simplified placement, a real implementation might use map center
        const location = { lat: 50, lng: 50 }; 
        const newIcon = { id: `eventicon-${Date.now()}`, type, location };
        setEventPlan(prev => ({ ...prev, placedIcons: [...prev.placedIcons, newIcon] }));
    };

    const finishDrawing = () => {
        if (currentPolygonPoints.length > 2) {
            const newShape = { id: `shape-${Date.now()}`, type: 'polygon' as const, points: currentPolygonPoints };
            setEventPlan(prev => ({ ...prev, drawnShapes: [...prev.drawnShapes, newShape] }));
        }
        setCurrentPolygonPoints([]);
        setIsDrawing(false);
        setActiveTool('select');
    };
    
    // --- Render ---
    return (
        <div className="flex flex-col md:flex-row gap-6 h-full">
            <main className="flex-1 h-full flex flex-col printable-map">
                <Card className="flex-1 flex flex-col" title="Situational Awareness Map">
                    <div className="flex-grow p-0 m-0">
                      {isLoading ? <div className="flex items-center justify-center h-full text-dark-text-secondary">Loading Map Data...</div> : 
                        <MapCanvas
                            items={mapItems}
                            onItemClick={handleItemClick}
                            onMapClick={handleMapClick}
                            view={mapView}
                            selectedItem={selectedItem}
                            infoPopupCoords={infoPopupCoords}
                            onClosePopup={() => setSelectedItem(null)}
                            measurePoints={measurePoints}
                            eventPlan={eventPlan}
                            currentPolygonPoints={isDrawing ? currentPolygonPoints : []}
                        />
                      }
                    </div>
                </Card>
            </main>

            <aside className="w-full md:w-80 flex-shrink-0 space-y-6 no-print">
                <Card title="Tools &amp; View">
                    <GisToolbar activeTool={activeTool} onToolSelect={setActiveTool} onMapViewChange={setMapView} currentMapView={mapView} onPrint={() => window.print()} />
                    {isDrawing && (
                        <div className="mt-4 flex justify-between items-center bg-blue-900/50 p-2 rounded-lg">
                            <p className="text-sm text-blue-200">Drawing polygon... ({currentPolygonPoints.length} points)</p>
                            <Button size="sm" onClick={finishDrawing}>Finish</Button>
                        </div>
                    )}
                </Card>
                <LayerControl 
                    visibility={layerVisibility} 
                    onVisibilityChange={setLayerVisibility}
                    filters={layerFilters}
                    onFilterChange={setLayerFilters}
                    counts={activeItemCounts}
                />
                 <Card title="Event Pre-Plan">
                    <EventPlanTools onAddIcon={handleAddEventIcon} onClearPlan={() => setEventPlan({ name: 'New', drawnShapes: [], placedIcons: []})} />
                </Card>
            </aside>
        </div>
    );
};


// --- Sub-components for GIS Dashboard ---

const GisToolbar: React.FC<{
    activeTool: ActiveTool;
    onToolSelect: (tool: ActiveTool) => void;
    currentMapView: MapView;
    onMapViewChange: (view: MapView) => void;
    onPrint: () => void;
}> = ({ activeTool, onToolSelect, currentMapView, onMapViewChange, onPrint }) => {
    const ToolButton: React.FC<{tool: ActiveTool, icon: React.ReactNode, label: string}> = ({ tool, icon, label }) => (
        <Button variant={activeTool === tool ? 'primary' : 'ghost'} onClick={() => onToolSelect(tool)} title={label} className="flex-1">{icon}</Button>
    );
     const ViewButton: React.FC<{view: MapView, icon: React.ReactNode, label: string}> = ({ view, icon, label }) => (
        <Button variant={currentMapView === view ? 'secondary' : 'ghost'} onClick={() => onMapViewChange(view)} title={label} className="flex-1">{icon}</Button>
    );
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-around bg-dark-bg p-1 rounded-lg border border-dark-border">
                <ToolButton tool="select" icon={<MousePointerIcon className="h-5 w-5"/>} label="Select"/>
                <ToolButton tool="measure" icon={<RulerIcon className="h-5 w-5"/>} label="Measure Distance"/>
                <ToolButton tool="draw-polygon" icon={<PencilIcon className="h-5 w-5"/>} label="Draw Polygon"/>
            </div>
             <div className="flex items-center justify-around bg-dark-bg p-1 rounded-lg border border-dark-border">
                <ViewButton view="street" icon={<MapIcon className="h-5 w-5"/>} label="Street"/>
                <ViewButton view="satellite" icon={<SatelliteIcon className="h-5 w-5"/>} label="Satellite"/>
                <ViewButton view="traffic" icon={<TrafficConeIcon className="h-5 w-5"/>} label="Traffic"/>
            </div>
            <Button onClick={onPrint} className="w-full" icon={<PrinterIcon className="h-5 w-5 mr-2"/>}>Print Map</Button>
        </div>
    );
};

const LayerControl: React.FC<{
    visibility: any, onVisibilityChange: (v: any) => void,
    filters: any, onFilterChange: (f: any) => void,
    counts: any
}> = ({ visibility, onVisibilityChange, filters, onFilterChange, counts }) => (
    <Card title="Map Layers">
        <Accordion title={`Properties (${counts.properties})`} defaultOpen={visibility.properties} icon={<HomeIcon className="h-5 w-5" />}>
            <div className="flex items-center justify-between">
                <span>Show on map</span>
                <input type="checkbox" checked={visibility.properties} onChange={() => onVisibilityChange({...visibility, properties: !visibility.properties})} />
            </div>
        </Accordion>
        <Accordion title={`Hydrants (${counts.hydrants})`} defaultOpen={visibility.hydrants} icon={<FireExtinguisherIcon className="h-5 w-5" />}>
            <div className="space-y-2">
                 <div className="flex items-center justify-between"><span>Show on map</span><input type="checkbox" checked={visibility.hydrants} onChange={() => onVisibilityChange({...visibility, hydrants: !visibility.hydrants})} /></div>
                 <select value={filters.hydrants.status} onChange={e => onFilterChange({...filters, hydrants: {...filters.hydrants, status: e.target.value}})} className="w-full bg-dark-bg border border-dark-border p-1 rounded text-sm"><option value="All">All Statuses</option><option value="In Service">In Service</option><option value="Needs Maintenance">Needs Maintenance</option><option value="Out of Service">Out of Service</option></select>
            </div>
        </Accordion>
         <Accordion title={`Incidents (${counts.incidents})`} defaultOpen={visibility.incidents} icon={<AlertTriangleIcon className="h-5 w-5" />}>
             <div className="flex items-center justify-between"><span>Show on map</span><input type="checkbox" checked={visibility.incidents} onChange={() => onVisibilityChange({...visibility, incidents: !visibility.incidents})} /></div>
        </Accordion>
         <Accordion title={`Apparatus (${counts.apparatus})`} defaultOpen={visibility.apparatus} icon={<TruckIcon className="h-5 w-5" />}>
             <div className="space-y-2">
                <div className="flex items-center justify-between"><span>Show on map</span><input type="checkbox" checked={visibility.apparatus} onChange={() => onVisibilityChange({...visibility, apparatus: !visibility.apparatus})} /></div>
                <select value={filters.apparatus.status} onChange={e => onFilterChange({...filters, apparatus: {...filters.apparatus, status: e.target.value}})} className="w-full bg-dark-bg border border-dark-border p-1 rounded text-sm"><option value="All">All Statuses</option><option value="In Service">In Service</option><option value="Maintenance">Maintenance</option><option value="Out of Service">Out of Service</option></select>
                <select value={filters.apparatus.type} onChange={e => onFilterChange({...filters, apparatus: {...filters.apparatus, type: e.target.value}})} className="w-full bg-dark-bg border border-dark-border p-1 rounded text-sm"><option value="All">All Types</option><option>Engine</option><option>Ladder</option><option>Rescue</option><option>Tanker</option><option>Brush Truck</option></select>
            </div>
        </Accordion>
    </Card>
);

const EventPlanTools: React.FC<{onAddIcon: any, onClearPlan: any}> = ({ onAddIcon, onClearPlan }) => (
    <div className="space-y-3">
        <p className="text-xs text-dark-text-secondary">Place tactical icons on the map.</p>
        <div className="grid grid-cols-3 gap-2">
            <Button variant="ghost" className="flex-col h-16" onClick={() => onAddIcon('command_post')}><CommandPostIcon className="h-6 w-6"/><span className="text-xs mt-1">Command</span></Button>
            <Button variant="ghost" className="flex-col h-16" onClick={() => onAddIcon('staging_area')}><StagingAreaIcon className="h-6 w-6"/><span className="text-xs mt-1">Staging</span></Button>
            <Button variant="ghost" className="flex-col h-16" onClick={() => onAddIcon('medical_tent')}><MedicalTentIcon className="h-6 w-6"/><span className="text-xs mt-1">Medical</span></Button>
        </div>
        <Button variant="danger" size="sm" className="w-full" onClick={onClearPlan}>Clear Event Plan</Button>
    </div>
);

const MapCanvas: React.FC<{
    items: MapItem[],
    onItemClick: (item: MapItem, coords: Coordinates) => void,
    onMapClick: (coords: Coordinates) => void,
    view: MapView,
    selectedItem: MapItem | null,
    infoPopupCoords: Coordinates | null,
    onClosePopup: () => void,
    measurePoints: Coordinates[],
    eventPlan: GisEventPlan,
    currentPolygonPoints: Coordinates[]
}> = ({ items, onItemClick, onMapClick, view, selectedItem, infoPopupCoords, onClosePopup, measurePoints, eventPlan, currentPolygonPoints }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapBackgrounds: Record<MapView, React.CSSProperties> = {
        street: { backgroundImage: `linear-gradient(rgba(107, 114, 128, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(107, 114, 128, 0.1) 1px, transparent 1px)`, backgroundSize: `25px 25px`},
        satellite: { backgroundColor: '#1a202c', backgroundImage: 'radial-gradient(hsla(0,0%,100%,.02) 2px,transparent 0),radial-gradient(hsla(0,0%,100%,.02) 2px,transparent 0)', backgroundSize: '32px 32px', backgroundPosition: '0 0,16px 16px' },
        traffic: { backgroundImage: `linear-gradient(rgba(107, 114, 128, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(107, 114, 128, 0.1) 1px, transparent 1px), linear-gradient(rgba(239, 68, 68, 0.3) 2px, transparent 2px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 2px, transparent 2px)`, backgroundSize: `25px 25px, 25px 25px, 100px 100px, 100px 100px`, backgroundPosition: '0 0, 0 0, 50px 0, 0 50px' },
    };

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (mapRef.current) {
            const rect = mapRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            onMapClick({ lat: y, lng: x });
        }
    };
    
    const eventIcons: Record<string, React.FC<any>> = {
        command_post: CommandPostIcon,
        staging_area: StagingAreaIcon,
        medical_tent: MedicalTentIcon,
    };

    return (
        <div ref={mapRef} className="relative w-full h-full bg-dark-bg rounded-b-lg overflow-hidden cursor-crosshair" style={mapBackgrounds[view]} onClick={handleMapClick}>
            {/* Render items */}
            {items.map(item => (
                <div key={item.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group" style={{ top: `${item.location.lat}%`, left: `${item.location.lng}%` }} onClick={(e) => { e.stopPropagation(); onItemClick(item, item.location);}}>
                    <item.Icon className={`h-6 w-6 ${item.color} transition-transform duration-200 group-hover:scale-150 drop-shadow-lg`} />
                    {item.hasPip && <CheckIcon className="absolute -top-1 -right-1 h-3 w-3 bg-pink-400 text-white rounded-full p-0.5" />}
                </div>
            ))}
            {/* Render event plan icons */}
            {eventPlan.placedIcons.map(icon => {
                const IconComponent = eventIcons[icon.type];
                return <div key={icon.id} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ top: `${icon.location.lat}%`, left: `${icon.location.lng}%` }}><IconComponent className="h-8 w-8 text-white bg-black/50 p-1 rounded-md" /></div>
            })}
            
            {/* Render info popup */}
            {selectedItem && infoPopupCoords && (
                <div className="absolute p-3 bg-dark-card border border-dark-border rounded-lg shadow-xl" style={{ top: `${infoPopupCoords.lat + 2}%`, left: `${infoPopupCoords.lng + 2}%`, transform: 'translate(-50%, 0)' }}>
                    <h4 className="font-bold text-dark-text">{selectedItem.label}</h4>
                    <button onClick={onClosePopup} className="absolute top-1 right-1"><XIcon className="h-4 w-4"/></button>
                    {/* Add more details based on item.type */}
                </div>
            )}
        </div>
    );
};

export default GisDashboard;
