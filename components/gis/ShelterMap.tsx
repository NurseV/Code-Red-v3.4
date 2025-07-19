
import React, { useState } from 'react';
import { Coordinates } from '../../types';
import { HomeIcon } from '../icons/Icons';

interface ShelterMapProps {
    onLocationChange: (coords: Coordinates | null) => void;
}

const ShelterMap: React.FC<ShelterMapProps> = ({ onLocationChange }) => {
    const [pinPosition, setPinPosition] = useState<Coordinates | null>(null);

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const newCoords = { lat: y, lng: x };
        setPinPosition(newCoords);
        onLocationChange(newCoords);
    };

    const mapGridStyle = {
        backgroundImage: `
            linear-gradient(rgba(107, 114, 128, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(107, 114, 128, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: `25px 25px`,
    };

    return (
        <div 
            className="relative w-full h-full bg-dark-card rounded-b-lg overflow-hidden cursor-pointer" 
            style={mapGridStyle}
            onClick={handleMapClick}
        >
            {pinPosition && (
                 <div 
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ top: `${pinPosition.lat}%`, left: `${pinPosition.lng}%` }}
                >
                    <HomeIcon className="h-8 w-8 text-brand-primary drop-shadow-lg" />
                </div>
            )}
            {!pinPosition && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <p className="text-dark-text font-semibold">Click to place shelter pin</p>
                </div>
            )}
        </div>
    );
};

export default ShelterMap;
