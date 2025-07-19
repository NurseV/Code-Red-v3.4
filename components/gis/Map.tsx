
import React from 'react';
import { Coordinates } from '../../types';
import { DotIcon } from '../icons/Icons';

interface MapItem {
    id: string;
    location: Coordinates;
    type: string;
    label: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    color: string;
}

interface MapProps {
    items: MapItem[];
}

const MapLegend: React.FC<{ items: MapItem[] }> = ({ items }) => {
    const uniqueTypes = items.reduce((acc, item) => {
        if (!acc.find(i => i.type === item.type)) {
            acc.push(item);
        }
        return acc;
    }, [] as MapItem[]);

    return (
        <div className="absolute bottom-2 left-2 bg-dark-card/80 border border-dark-border rounded-lg p-3 shadow-lg">
            <h4 className="font-bold text-sm mb-2 text-dark-text">Legend</h4>
            <ul className="space-y-1">
                {uniqueTypes.map(item => (
                    <li key={item.type} className="flex items-center">
                        <DotIcon className={`h-4 w-4 mr-2 ${item.color}`} />
                        <span className="text-xs text-dark-text-secondary">{item.type}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

const MapPoint: React.FC<{ item: MapItem }> = ({ item }) => {
    const { location, Icon, color, label } = item;
    
    return (
        <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ top: `${location.lat}%`, left: `${location.lng}%` }}
        >
            <Icon className={`h-6 w-6 ${color} transition-transform duration-200 group-hover:scale-150`} />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max hidden group-hover:block bg-dark-bg text-white text-xs rounded py-1 px-2 border border-dark-border shadow-lg z-10">
                {label}
            </div>
        </div>
    )
}

const Map: React.FC<MapProps> = ({ items }) => {
    const mapGridStyle = {
        backgroundImage: `
            linear-gradient(rgba(107, 114, 128, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(107, 114, 128, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: `25px 25px`,
    };

    return (
        <div className="relative w-full h-full bg-dark-card rounded-b-lg overflow-hidden" style={mapGridStyle}>
            {items.map(item => (
                <MapPoint key={item.id} item={item} />
            ))}
            <MapLegend items={items} />
        </div>
    );
};

export default Map;
