
import React, { useState, useEffect } from 'react';
import * as api from '../../../services/api';
import { Consumable } from '../../../types';
import Button from '../../ui/Button';
import { PlusIcon, XIcon, ArchiveIcon } from '../../icons/Icons';

interface SupplyUsed {
    consumableId: string;
    quantity: number;
}

interface Props {
    suppliesUsed: SupplyUsed[];
    onUpdate: (data: SupplyUsed[]) => void;
    isLocked: boolean;
}

const NfirsSuppliesModule: React.FC<Props> = ({ suppliesUsed, onUpdate, isLocked }) => {
    const [allConsumables, setAllConsumables] = useState<Consumable[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newItem, setNewItem] = useState({ consumableId: '', quantity: 1 });

    useEffect(() => {
        api.getConsumables().then(data => {
            setAllConsumables(data);
            if (data.length > 0) {
                setNewItem(prev => ({ ...prev, consumableId: data[0].id }));
            }
        }).finally(() => setIsLoading(false));
    }, []);

    const handleAddItem = () => {
        if (!newItem.consumableId || newItem.quantity <= 0) {
            alert("Please select an item and enter a valid quantity.");
            return;
        }
        // Check if item already exists, if so, update quantity
        const existingItemIndex = suppliesUsed.findIndex(s => s.consumableId === newItem.consumableId);
        if (existingItemIndex > -1) {
            const updatedSupplies = [...suppliesUsed];
            updatedSupplies[existingItemIndex].quantity += newItem.quantity;
            onUpdate(updatedSupplies);
        } else {
            onUpdate([...suppliesUsed, { ...newItem }]);
        }
        // Reset form
        setNewItem({ consumableId: allConsumables[0]?.id || '', quantity: 1 });
    };

    const handleRemoveItem = (consumableId: string) => {
        onUpdate(suppliesUsed.filter(s => s.consumableId !== consumableId));
    };

    const getConsumableName = (id: string) => {
        return allConsumables.find(c => c.id === id)?.name || 'Unknown Item';
    };

    if (isLoading) {
        return <p className="text-dark-text-secondary">Loading supplies...</p>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-dark-text flex items-center">
                    <ArchiveIcon className="h-6 w-6 mr-3 text-brand-secondary" />
                    Supplies Used
                </h2>
            </div>

            {/* Add new item form */}
            {!isLocked && (
                <div className="flex items-end space-x-2 p-4 bg-dark-bg rounded-lg border border-dark-border">
                    <div className="flex-grow">
                        <label htmlFor="consumableId" className="block text-sm font-medium text-dark-text-secondary mb-1">Supply Item</label>
                        <select
                            id="consumableId"
                            value={newItem.consumableId}
                            onChange={e => setNewItem({...newItem, consumableId: e.target.value})}
                            className="block w-full bg-dark-card border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        >
                            {allConsumables.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="w-24">
                        <label htmlFor="quantity" className="block text-sm font-medium text-dark-text-secondary mb-1">Quantity</label>
                        <input
                            id="quantity"
                            type="number"
                            min="1"
                            value={newItem.quantity}
                            onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                            className="block w-full bg-dark-card border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        />
                    </div>
                    <Button onClick={handleAddItem} icon={<PlusIcon className="h-5 w-5"/>} />
                </div>
            )}

            {/* List of used supplies */}
            <div className="bg-dark-bg p-3 rounded-md border border-dark-border">
                {suppliesUsed.length === 0 ? (
                    <p className="text-center text-dark-text-secondary py-4">No supplies have been logged for this incident.</p>
                ) : (
                    <ul className="divide-y divide-dark-border">
                        {suppliesUsed.map(supply => (
                            <li key={supply.consumableId} className="py-2 flex items-center justify-between group">
                                <p className="text-dark-text">{getConsumableName(supply.consumableId)}</p>
                                <div className="flex items-center space-x-4">
                                    <p className="text-dark-text-secondary">Qty: {supply.quantity}</p>
                                    {!isLocked && (
                                        <Button
                                            variant="danger"
                                            className="p-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleRemoveItem(supply.consumableId)}
                                        >
                                            <XIcon className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default NfirsSuppliesModule;
