
import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../../services/api';
import { Personnel } from '../../../types';
import Button from '../../ui/Button';
import { ArrowLeftIcon, ArrowRightIcon, SearchIcon, UsersIcon } from '../../icons/Icons';

interface Props {
    respondingPersonnelIds: string[];
    onUpdate: (newIds: string[]) => void;
    isLocked: boolean;
}

const PersonnelCard: React.FC<{
    personnel: Personnel;
    action: 'add' | 'remove';
    onAction: (id: string) => void;
    isLocked: boolean;
}> = ({ personnel, action, onAction, isLocked }) => (
    <div className="flex items-center justify-between p-3 bg-dark-card rounded-md border border-dark-border group">
        <div className="flex items-center">
            <img src={personnel.avatarUrl} alt={personnel.name} className="h-10 w-10 rounded-full mr-3" />
            <div>
                <p className="font-semibold text-dark-text">{personnel.name}</p>
                <p className="text-sm text-dark-text-secondary">{personnel.rank}</p>
            </div>
        </div>
        {!isLocked && (
            <Button
                variant="ghost"
                size="sm"
                className="p-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onAction(personnel.id)}
                aria-label={action === 'add' ? 'Add Personnel' : 'Remove Personnel'}
            >
                {action === 'add' ? <ArrowLeftIcon className="h-5 w-5" /> : <ArrowRightIcon className="h-5 w-5" />}
            </Button>
        )}
    </div>
);

const NfirsPersonnelModule: React.FC<Props> = ({ respondingPersonnelIds, onUpdate, isLocked }) => {
    const [allPersonnel, setAllPersonnel] = useState<Personnel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setIsLoading(true);
        api.getPersonnelList()
            .then(setAllPersonnel)
            .finally(() => setIsLoading(false));
    }, []);

    const { assigned, available } = useMemo(() => {
        const assignedSet = new Set(respondingPersonnelIds);
        const assignedList: Personnel[] = [];
        const availableList: Personnel[] = [];

        allPersonnel.forEach(person => {
            if (assignedSet.has(person.id)) {
                assignedList.push(person);
            } else {
                availableList.push(person);
            }
        });
        
        return { assigned: assignedList, available: availableList };
    }, [allPersonnel, respondingPersonnelIds]);

    const filteredAvailable = useMemo(() => {
        if (!searchTerm) return available;
        const lowerTerm = searchTerm.toLowerCase();
        return available.filter(person =>
            person.name.toLowerCase().includes(lowerTerm) ||
            person.rank.toLowerCase().includes(lowerTerm)
        );
    }, [available, searchTerm]);
    
    const handleAddPersonnel = (id: string) => {
        if (isLocked) return;
        const newIds = [...respondingPersonnelIds, id];
        onUpdate(newIds);
    };

    const handleRemovePersonnel = (id: string) => {
        if (isLocked) return;
        const newIds = respondingPersonnelIds.filter(personId => personId !== id);
        onUpdate(newIds);
    };

    if (isLoading) {
        return <div className="text-center p-8 text-dark-text-secondary">Loading personnel data...</div>;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-dark-text">NFIRS-10: Responding Personnel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assigned Column */}
                <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                    <h3 className="font-semibold text-dark-text mb-3">Assigned Personnel ({assigned.length})</h3>
                    <div className="space-y-2 h-96 overflow-y-auto">
                        {assigned.length > 0 ? assigned.map(person => (
                            <PersonnelCard key={person.id} personnel={person} action="remove" onAction={handleRemovePersonnel} isLocked={isLocked} />
                        )) : (
                            <div className="text-center pt-16">
                                <UsersIcon className="h-12 w-12 mx-auto text-dark-text-secondary" />
                                <p className="mt-2 text-dark-text-secondary">No personnel assigned.</p>
                                <p className="text-sm text-dark-text-secondary">Add personnel from the right.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Available Column */}
                <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                    <h3 className="font-semibold text-dark-text mb-3">Available Personnel ({available.length})</h3>
                    <div className="relative mb-3">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or rank..."
                            className="w-full bg-dark-card border border-dark-border rounded-md py-2 pl-10 pr-4 text-dark-text"
                            disabled={isLocked}
                        />
                    </div>
                     <div className="space-y-2 h-[22.5rem] overflow-y-auto">
                        {filteredAvailable.map(person => (
                            <PersonnelCard key={person.id} personnel={person} action="add" onAction={handleAddPersonnel} isLocked={isLocked} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NfirsPersonnelModule;
