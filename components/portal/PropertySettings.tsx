
import React, { useState, useEffect } from 'react';
import { useCitizenAuth } from '../../hooks/useCitizenAuth';
import * as api from '../../services/api';
import { Property } from '../../types';
import { BuildingIcon } from '../icons/Icons';

const PropertySettings: React.FC = () => {
    const { citizenUser } = useCitizenAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (citizenUser) {
            api.getCitizenDashboardData(citizenUser.id)
                .then(({ properties }) => setProperties(properties))
                .finally(() => setIsLoading(false));
        }
    }, [citizenUser]);

    if (isLoading) {
        return <p className="text-dark-text-secondary">Loading properties...</p>;
    }
    
    return (
        <div className="space-y-4">
             <h3 className="text-lg font-semibold text-dark-text">Linked Properties</h3>
             {properties.length > 0 ? (
                <ul className="space-y-3">
                    {properties.map(prop => (
                        <li key={prop.id} className="p-4 bg-dark-bg rounded-md border border-dark-border flex items-center">
                            <BuildingIcon className="h-6 w-6 mr-4 text-dark-text-secondary" />
                            <div>
                                <p className="font-semibold text-dark-text">{prop.address}</p>
                                <p className="text-sm text-dark-text-secondary">Parcel ID: {prop.parcelId}</p>
                            </div>
                        </li>
                    ))}
                </ul>
             ) : (
                <p className="text-dark-text-secondary">You have no properties linked to your account. Please contact us to get your properties linked.</p>
             )}
        </div>
    );
};

export default PropertySettings;
