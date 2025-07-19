
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import * as api from '../services/api';
import { Apparatus, Asset } from '../types';
import { useInternalAuth } from '../hooks/useInternalAuth';
import CameraScanner from '../components/ui/CameraScanner';
import { SearchIcon } from '../components/icons/Icons';

const ApparatusChecklist: React.FC = () => {
    const { id: apparatusId } = ReactRouterDOM.useParams<{ id: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const { user } = useInternalAuth();
    const [apparatus, setApparatus] = useState<Apparatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [vitals, setVitals] = useState({ mileage: '', engineHours: '' });
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [verifyingAsset, setVerifyingAsset] = useState<Asset | null>(null);
    const [verifiedAssets, setVerifiedAssets] = useState<string[]>([]);
    const [assignedAssets, setAssignedAssets] = useState<Asset[]>([]);

    useEffect(() => {
        const fetchChecklistData = async () => {
            if (!apparatusId) return;
            try {
                const app = await api.getApparatusById(apparatusId);
                setApparatus(app);
                if (app) {
                    setVitals({ mileage: String(app.mileage), engineHours: String(app.engineHours) });
                    
                    const allAssets = await api.getAssets();
                    const assetsOnTruck = allAssets.filter(asset => app.compartments.some(c => c.subCompartments.some(sc => sc.assignedAssetIds.includes(asset.id))));
                    setAssignedAssets(assetsOnTruck);
                }
            } catch (e) {
                console.error("Failed to load checklist data", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchChecklistData();
    }, [apparatusId]);
    
    const handleVitalsUpdate = async () => {
        if (!apparatusId || !user) return;
        try {
            await api.updateApparatus(apparatusId, { 
                mileage: Number(vitals.mileage), 
                engineHours: Number(vitals.engineHours) 
            }, user);
            alert('Vitals updated!');
        } catch (e) {
            alert('Failed to update vitals.');
        }
    };
    
    const openScanner = (asset: Asset) => {
        setVerifyingAsset(asset);
        setIsScannerOpen(true);
    };

    const handleScan = (scanResult: string) => {
        if (verifyingAsset && scanResult === verifyingAsset.id) {
            setVerifiedAssets(prev => [...prev, verifyingAsset.id]);
            alert(`${verifyingAsset.name} verified successfully!`);
        } else {
            alert("Scanned asset does not match the expected item.");
        }
        setIsScannerOpen(false);
        setVerifyingAsset(null);
    };

    if (isLoading || !apparatus) {
        return <Card title="Loading..."><p>Loading checklist data...</p></Card>;
    }
    
    const allAssetsVerified = assignedAssets.every(asset => verifiedAssets.includes(asset.id));
    const isChecklistComplete = allAssetsVerified;

    return (
        <>
            <Card title={`Daily Checklist: ${apparatus.unitId}`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div>
                         <h3 className="text-lg font-semibold text-dark-text mb-3">Update Vitals</h3>
                         <div className="space-y-4 p-4 bg-dark-bg rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-dark-text-secondary mb-1">Current Mileage</label>
                                <input type="number" value={vitals.mileage} onChange={e => setVitals({...vitals, mileage: e.target.value})} className="w-full bg-dark-card border border-dark-border rounded-md py-2 px-3"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-text-secondary mb-1">Current Engine Hours</label>
                                <input type="number" step="0.1" value={vitals.engineHours} onChange={e => setVitals({...vitals, engineHours: e.target.value})} className="w-full bg-dark-card border border-dark-border rounded-md py-2 px-3"/>
                            </div>
                            <Button onClick={handleVitalsUpdate} className="w-full">Log Vitals</Button>
                         </div>
                    </div>
                    <div>
                         <h3 className="text-lg font-semibold text-dark-text mb-3">Asset Verification</h3>
                         <ul className="divide-y divide-dark-border">
                            {assignedAssets.map(asset => (
                                <li key={asset.id} className="py-3 flex items-center justify-between group">
                                    <span>{asset.name}</span>
                                    <div className="flex items-center space-x-2">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="p-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Find on Apparatus"
                                            onClick={() => navigate(`/app/apparatus/${apparatusId}?highlightAsset=${asset.id}`)}
                                        >
                                            <SearchIcon className="h-4 w-4" />
                                        </Button>
                                        {verifiedAssets.includes(asset.id) ? 
                                            <span className="text-green-400 font-bold px-2">Verified</span> : 
                                            <Button onClick={() => openScanner(asset)}>Scan to Verify</Button>
                                        }
                                    </div>
                                </li>
                            ))}
                         </ul>
                    </div>
                </div>

                {isChecklistComplete && (
                    <div className="mt-6 pt-4 border-t border-dark-border text-center">
                        <p className="text-xl text-green-400 font-bold mb-4">Checklist Complete!</p>
                        <Button onClick={() => navigate(`/app/apparatus/${apparatusId}`)}>Finish and Return</Button>
                    </div>
                )}
            </Card>

            <Modal title={`Scan Asset: ${verifyingAsset?.name}`} isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)}>
                <CameraScanner onScan={handleScan} onCancel={() => setIsScannerOpen(false)} />
            </Modal>
        </>
    );
};

export default ApparatusChecklist;
