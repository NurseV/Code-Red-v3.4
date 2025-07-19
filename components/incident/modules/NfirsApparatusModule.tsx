

import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../../services/api';
import { Apparatus } from '../../../types';
import Button from '../../ui/Button';
import { ArrowLeftIcon, ArrowRightIcon, SearchIcon, TruckIcon } from '../../icons/Icons';

interface Props {
    respondingApparatusIds: string[];
    onUpdate: (newIds: string[]) => void;
    isLocked: boolean;
}

const ApparatusCard: React.FC<{
    apparatus: Apparatus;
    action: 'add' | 'remove';
    onAction: (id: string) => void;
    isLocked: boolean;
}> = ({ apparatus, action, onAction, isLocked }) => (
    <div className="flex items-center justify-between p-3 bg-dark-card rounded-md border border-dark-border group">
        <div className="flex items-center">
            <TruckIcon className="h-6 w-6 mr-3 text-dark-text-secondary" />
            <div>
                <p className="font-semibold text-dark-text">{apparatus.unitId}</p>
                <p className="text-sm text-dark-text-secondary">{apparatus.type}</p>
            </div>
        </div>
        {!isLocked && (
            <Button
                variant="ghost"
                size="sm"
                className="p-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onAction(apparatus.id)}
                aria-label={action === 'add' ? 'Add Unit' : 'Remove Unit'}
            >
                {action === 'add' ? <ArrowLeftIcon className="h-5 w-5" /> : <ArrowRightIcon className="h-5 w-5" />}
            </Button>
        )}
    </div>
);

const NfirsApparatusModule: React.FC<Props> = ({ respondingApparatusIds, onUpdate, isLocked }) => {
    const [allApparatus, setAllApparatus] = useState<Apparatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setIsLoading(true);
        api.getApparatusList()
            .then(setAllApparatus)
            .finally(() => setIsLoading(false));
    }, []);

    const { assigned, available } = useMemo(() => {
        const assignedSet = new Set(respondingApparatusIds);
        const assignedList: Apparatus[] = [];
        const availableList: Apparatus[] = [];

        allApparatus.forEach(app => {
            if (assignedSet.has(app.id)) {
                assignedList.push(app);
            } else {
                availableList.push(app);
            }
        });
        
        return { assigned: assignedList, available: availableList };
    }, [allApparatus, respondingApparatusIds]);

    const filteredAvailable = useMemo(() => {
        if (!searchTerm) return available;
        const lowerTerm = searchTerm.toLowerCase();
        return available.filter(app =>
            app.unitId.toLowerCase().includes(lowerTerm) ||
            app.type.toLowerCase().includes(lowerTerm)
        );
    }, [available, searchTerm]);
    
    const handleAddUnit = (id: string) => {
        if (isLocked) return;
        const newIds = [...respondingApparatusIds, id];
        onUpdate(newIds);
    };

    const handleRemoveUnit = (id: string) => {
        if (isLocked) return;
        const newIds = respondingApparatusIds.filter(appId => appId !== id);
        onUpdate(newIds);
    };

    if (isLoading) {
        return <div className="text-center p-8 text-dark-text-secondary">Loading apparatus data...</div>;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-dark-text">Responding Apparatus</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assigned Column */}
                <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                    <h3 className="font-semibold text-dark-text mb-3">Assigned Units ({assigned.length})</h3>
                    <div className="space-y-2 h-96 overflow-y-auto">
                        {assigned.length > 0 ? assigned.map(app => (
                            <ApparatusCard key={app.id} apparatus={app} action="remove" onAction={handleRemoveUnit} isLocked={isLocked} />
                        )) : (
                            <div className="text-center pt-16">
                                <p className="text-dark-text-secondary">No units assigned.</p>
                                <p className="text-sm text-dark-text-secondary">Add units from the right.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Available Column */}
                <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                    <h3 className="font-semibold text-dark-text mb-3">Available Units ({available.length})</h3>
                    <div className="relative mb-3">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search available units..."
                            className="w-full bg-dark-card border border-dark-border rounded-md py-2 pl-10 pr-4 text-dark-text"
                            disabled={isLocked}
                        />
                    </div>
                     <div className="space-y-2 h-[22.5rem] overflow-y-auto">
                        {filteredAvailable.map(app => (
                            <ApparatusCard key={app.id} apparatus={app} action="add" onAction={handleAddUnit} isLocked={isLocked} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NfirsApparatusModule;
