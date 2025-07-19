import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_ASSETS } from '../../constants';
import { Apparatus, Asset, Compartment } from '../../types';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Table from '../ui/Table';
import { EditIcon, SaveIcon, XIcon, ArchiveIcon, SearchIcon, PrinterIcon, WeightIcon, PlusIcon, Trash2Icon } from '../icons/Icons';
import * as api from '../../services/api';

const getAssetDetails = (assetId: string): Asset | undefined => MOCK_ASSETS.find(a => a.id === assetId);

// Sub-component for the printable load-out sheet
const PrintLoadout: React.FC<{ apparatus: Apparatus }> = ({ apparatus }) => (
    <div>
        <h2 className="text-2xl font-bold mb-2 text-dark-text">{apparatus.unitId} - Load-Out Sheet</h2>
        <p className="text-dark-text-secondary mb-4">Date: {new Date().toLocaleDateString()}</p>
        <div className="space-y-4">
            {apparatus.compartments.map(comp => (
                <div key={comp.id}>
                    <h3 className="font-bold text-lg border-b-2 border-dark-border pb-1 mb-2 text-dark-text">{comp.name}</h3>
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-dark-text-secondary">
                                <th className="w-1/2 py-1">Asset Name</th>
                                <th className="w-1/4 py-1">S/N</th>
                                <th className="w-1/4 py-1">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {comp.subCompartments.flatMap(sc => sc.assignedAssetIds).map(assetId => {
                                const asset = getAssetDetails(assetId);
                                return asset ? (
                                    <tr key={assetId} className="text-dark-text">
                                        <td className="py-2">{asset.name}</td>
                                        <td className="py-2">{asset.serialNumber}</td>
                                        <td className="py-2 border-b-2 border-dotted border-gray-400"></td>
                                    </tr>
                                ) : null;
                            })}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    </div>
);


export const CompartmentManager: React.FC<{ apparatus: Apparatus, onUpdate: (updatedApparatus: Apparatus) => void, initialSearchTerm?: string; }> = ({ apparatus, onUpdate, initialSearchTerm }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [compartments, setCompartments] = useState<Compartment[]>(apparatus.compartments);
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
    const [showWeights, setShowWeights] = useState(false);
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [editingCompartment, setEditingCompartment] = useState<Compartment | null>(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [unassignedAssets, setUnassignedAssets] = useState<Asset[]>([]);
    const [isNewCompartmentModalOpen, setIsNewCompartmentModalOpen] = useState(false);
    const [newCompartmentData, setNewCompartmentData] = useState({ name: '', side: 'driver' as 'driver' | 'passenger' | 'rear' });

    useEffect(() => {
        setCompartments(apparatus.compartments);
    }, [apparatus]);

    useEffect(() => {
        if (editingCompartment) {
            api.getUnassignedAssets().then(setUnassignedAssets);
        }
    }, [editingCompartment]);
    
    useEffect(() => {
        if (initialSearchTerm) {
            setSearchTerm(initialSearchTerm);
        }
    }, [initialSearchTerm]);

    const filteredCompartments = useMemo(() => {
        if (!searchTerm) return compartments;

        const lowerSearchTerm = searchTerm.toLowerCase();
        
        return compartments.filter(comp => {
            if (comp.name.toLowerCase().includes(lowerSearchTerm)) {
                return true;
            }
            const assetIds = comp.subCompartments.flatMap(sc => sc.assignedAssetIds);
            return assetIds.some(id => {
                const asset = getAssetDetails(id);
                return asset?.name.toLowerCase().includes(lowerSearchTerm);
            });
        });
    }, [searchTerm, compartments]);

    const handleSaveLayout = async () => {
        try {
            const updatedApparatus = { ...apparatus, compartments };
            await api.updateApparatusCompartments(apparatus.id, compartments);
            onUpdate(updatedApparatus);
            setIsEditMode(false);
        } catch (e) {
            alert("Failed to save compartment layout.");
        }
    };

    const handleCancelEdit = () => {
        setCompartments(apparatus.compartments);
        setIsEditMode(false);
        setEditingCompartment(null);
    };
    
    const handleOpenEditModal = (compartment: Compartment) => {
        setEditingCompartment(compartment);
    };
    
    const handleCloseEditModal = () => {
        setEditingCompartment(null);
    };

    const handleAssignAsset = (assetId: string) => {
        if (!editingCompartment) return;

        setUnassignedAssets(prev => prev.filter(a => a.id !== assetId));

        const updatedCompartments = compartments.map(c => {
            if (c.id === editingCompartment.id) {
                const updatedSubs = c.subCompartments.length > 0 ? c.subCompartments : [{ id: `sc-${c.id}-1`, name: 'Default', location: {row: 1, col: 1}, assignedAssetIds: [] }];
                updatedSubs[0].assignedAssetIds.push(assetId);
                return { ...c, subCompartments: updatedSubs };
            }
            return c;
        });
        setCompartments(updatedCompartments);
        setEditingCompartment(prev => updatedCompartments.find(c => c.id === prev!.id)!);
    };

    const handleUnassignAsset = (assetId: string) => {
        if (!editingCompartment) return;
        
        const asset = getAssetDetails(assetId);
        if (asset) setUnassignedAssets(prev => [...prev, asset].sort((a,b) => a.name.localeCompare(b.name)));

        const updatedCompartments = compartments.map(c => {
            if (c.id === editingCompartment.id) {
                const updatedSubs = c.subCompartments.map(sc => ({
                    ...sc,
                    assignedAssetIds: sc.assignedAssetIds.filter(id => id !== assetId)
                }));
                return { ...c, subCompartments: updatedSubs };
            }
            return c;
        });
        setCompartments(updatedCompartments);
        setEditingCompartment(prev => updatedCompartments.find(c => c.id === prev!.id)!);
    };
    
    const handleAddNewCompartment = () => {
        if (!newCompartmentData.name) {
            alert("Compartment name is required.");
            return;
        }

        const newCompartment: Compartment = {
            id: `comp-${Date.now()}`,
            name: newCompartmentData.name,
            layout: { rows: 1, cols: 1 },
            subCompartments: [],
            schematic: {
                side: newCompartmentData.side,
                x: 20,
                y: 55,
                width: 20,
                height: 40,
            },
        };
        
        setCompartments(prev => [...prev, newCompartment]);
        setIsNewCompartmentModalOpen(false);
        setNewCompartmentData({ name: '', side: 'driver' });
    };

    const handleDeleteCompartment = (compartmentId: string) => {
        if (window.confirm("Are you sure you want to delete this compartment? This cannot be undone.")) {
            setCompartments(prev => prev.filter(c => c.id !== compartmentId));
        }
    };
    
    const columns = [
        { header: 'Compartment', accessor: (c: Compartment) => c.name },
        { header: 'Side', accessor: (c: Compartment) => c.schematic.side.charAt(0).toUpperCase() + c.schematic.side.slice(1) },
        { header: '# of Items', accessor: (c: Compartment) => c.subCompartments.flatMap(sc => sc.assignedAssetIds).length },
        ...(showWeights ? [{ header: 'Weight (lbs)', accessor: (c: Compartment) => c.subCompartments.flatMap(sc => sc.assignedAssetIds).reduce((sum, id) => sum + (getAssetDetails(id)?.weightLbs || 0), 0).toFixed(1) }] : []),
        { header: 'Actions', accessor: (c: Compartment) => (
            isEditMode ? 
            <div className="flex space-x-1">
                <Button size="sm" onClick={() => handleOpenEditModal(c)}>Edit Contents</Button>
                <Button size="sm" variant="danger" className="p-1" onClick={() => handleDeleteCompartment(c.id)}>
                    <Trash2Icon className="h-4 w-4"/>
                </Button>
            </div>
            : <span></span>
        )}
    ];

    const renderExpandedRow = (compartment: Compartment) => {
        const assetIds = compartment.subCompartments.flatMap(sc => sc.assignedAssetIds);
        if (assetIds.length === 0) {
            return <div className="p-4 text-center text-dark-text-secondary bg-dark-bg">This compartment is empty.</div>;
        }
        return (
            <div className="p-4 bg-dark-bg">
                <h4 className="font-semibold text-dark-text mb-2">Assets in {compartment.name}</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {assetIds.map(id => {
                        const asset = getAssetDetails(id);
                        return asset ? (
                            <li key={id} className="flex items-center p-2 bg-dark-card rounded-md border border-dark-border">
                                <ArchiveIcon className="h-5 w-5 mr-3 text-dark-text-secondary"/>
                                <div>
                                    <p className="font-medium text-dark-text">{asset.name}</p>
                                    <p className="text-xs text-dark-text-secondary font-mono">{asset.serialNumber}</p>
                                </div>
                            </li>
                        ) : null;
                    })}
                </ul>
            </div>
        );
    };

    return (
        <>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="relative md:col-span-1">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search for an asset or compartment..." className="w-full bg-dark-card border border-dark-border rounded-lg py-2 pl-10 pr-4 text-dark-text"/>
                    </div>
                    <div className="flex items-center space-x-4 md:col-span-2 justify-end">
                        <label className="flex items-center cursor-pointer">
                            <WeightIcon className="h-5 w-5 mr-2 text-dark-text-secondary"/>
                            <span className="text-sm font-medium text-dark-text-secondary mr-2">Show Weights</span>
                            <input type="checkbox" checked={showWeights} onChange={() => setShowWeights(!showWeights)} className="h-4 w-4 rounded border-gray-500 text-brand-primary focus:ring-transparent bg-dark-bg"/>
                        </label>
                        <Button variant="secondary" onClick={() => setIsPrintModalOpen(true)} icon={<PrinterIcon className="h-4 w-4 mr-2"/>}>Print Load-Out</Button>
                        <div className="flex space-x-1">
                            {isEditMode ? (
                                <>
                                    <Button variant="secondary" onClick={() => setIsNewCompartmentModalOpen(true)} icon={<PlusIcon className="h-4 w-4 mr-2" />}>New Compartment</Button>
                                    <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                                    <Button onClick={handleSaveLayout} icon={<SaveIcon className="h-4 w-4 mr-2" />}>Save Layout</Button>
                                </>
                            ) : (
                                <Button onClick={() => setIsEditMode(true)} icon={<EditIcon className="h-4 w-4 mr-2" />}>Edit Layout</Button>
                            )}
                        </div>
                    </div>
                </div>

                <Table 
                    columns={columns}
                    data={filteredCompartments}
                    onRowClick={(item) => !isEditMode && setExpandedRowId(prevId => prevId === item.id ? null : item.id)}
                    expandedRowId={expandedRowId}
                    renderExpandedRow={renderExpandedRow}
                />
            </div>
            
            <Modal title="Print Load-Out" isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} containerClassName="printable-content max-w-4xl">
                <PrintLoadout apparatus={apparatus} />
                <div className="mt-6 flex justify-end space-x-2 no-print">
                    <Button variant="ghost" onClick={() => setIsPrintModalOpen(false)}>Cancel</Button>
                    <Button onClick={() => window.print()}>Print</Button>
                </div>
            </Modal>
            
            <Modal title="Add New Compartment" isOpen={isNewCompartmentModalOpen} onClose={() => setIsNewCompartmentModalOpen(false)}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Compartment Name</label>
                        <input type="text" value={newCompartmentData.name} onChange={e => setNewCompartmentData({...newCompartmentData, name: e.target.value})} placeholder="e.g., Driver Side 1" className="w-full bg-dark-bg border-dark-border rounded-md p-2 text-dark-text"/>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-dark-text-secondary mb-1">Apparatus Side</label>
                         <select value={newCompartmentData.side} onChange={e => setNewCompartmentData({...newCompartmentData, side: e.target.value as any})} className="w-full bg-dark-bg border-dark-border rounded-md p-2 text-dark-text">
                            <option value="driver">Driver</option>
                            <option value="passenger">Passenger</option>
                            <option value="rear">Rear</option>
                         </select>
                    </div>
                    <div className="flex justify-end pt-4 space-x-2">
                        <Button variant="ghost" onClick={() => setIsNewCompartmentModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddNewCompartment}>Add Compartment</Button>
                    </div>
                </div>
            </Modal>
            
            {editingCompartment && (
                <Modal title={`Edit Contents: ${editingCompartment.name}`} isOpen={!!editingCompartment} onClose={handleCloseEditModal} containerClassName="max-w-4xl">
                    <div className="grid grid-cols-2 gap-6 h-[60vh]">
                        <div className="flex flex-col">
                            <h4 className="font-bold text-dark-text mb-2">Assets in Compartment</h4>
                            <div className="flex-grow space-y-2 overflow-y-auto p-2 border border-dark-border rounded-md bg-dark-bg">
                                {(editingCompartment.subCompartments.flatMap(sc => sc.assignedAssetIds).map(id => getAssetDetails(id)).filter(Boolean) as Asset[]).map(asset => (
                                    <div key={asset.id} className="flex items-center justify-between p-2 bg-dark-card rounded-md">
                                        <span>{asset.name}</span>
                                        <Button size="sm" variant="danger" className="p-1 h-6 w-6" onClick={() => handleUnassignAsset(asset.id)}>&larr;</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h4 className="font-bold text-dark-text mb-2">Unassigned Assets</h4>
                            <div className="flex-grow space-y-2 overflow-y-auto p-2 border border-dark-border rounded-md bg-dark-bg">
                                {unassignedAssets.map(asset => (
                                    <div key={asset.id} className="flex items-center justify-between p-2 bg-dark-card rounded-md">
                                        <span>{asset.name}</span>
                                        <Button size="sm" variant="secondary" className="p-1 h-6 w-6" onClick={() => handleAssignAsset(asset.id)}>&rarr;</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 mt-4 border-t border-dark-border">
                        <Button onClick={handleCloseEditModal}>Done</Button>
                    </div>
                </Modal>
            )}
        </>
    );
};
