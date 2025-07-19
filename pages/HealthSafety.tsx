
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useInternalAuth } from '../hooks/useInternalAuth';
import * as api from '../services/api';
import { ExposureLog, SdsSheet, Role } from '../types';
import { SearchIcon, UploadIcon, FileDownIcon } from '../components/icons/Icons';

interface DetailedExposureLog extends ExposureLog {
    personnelName?: string;
}

const ExposureLogTab: React.FC = () => {
    const { user } = useInternalAuth();
    const [logs, setLogs] = useState<DetailedExposureLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setIsLoading(true);
        api.getExposureLogs(user.id, user.role)
            .then(setLogs)
            .finally(() => setIsLoading(false));
    }, [user]);

    const columns = [
        ...(user?.role !== Role.FIREFIGHTER ? [{ 
            header: 'Personnel', 
            accessor: (item: DetailedExposureLog) => item.personnelName || 'N/A' 
        }] : []),
        { header: 'Incident #', accessor: (item: DetailedExposureLog) => item.incidentNumber },
        { header: 'Exposure Date', accessor: (item: DetailedExposureLog) => new Date(item.exposureDate).toLocaleDateString() },
        { header: 'Exposure Type', accessor: (item: DetailedExposureLog) => item.exposureType },
        { header: 'Details', accessor: (item: DetailedExposureLog) => <p className="text-sm max-w-md whitespace-normal">{item.details}</p> },
    ];
    
    if (isLoading) return <div className="text-center p-8 text-dark-text-secondary">Loading exposure logs...</div>;

    return (
        <div>
            <p className="text-sm text-dark-text-secondary mb-4">
                This log is for documenting workplace exposures for health and safety compliance. It is not a medical file.
            </p>
            <Table columns={columns} data={logs} />
        </div>
    );
};

const SdsLibraryTab: React.FC = () => {
    const [sheets, setSheets] = useState<SdsSheet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSdsModalOpen, setIsSdsModalOpen] = useState(false);
    const [newSdsData, setNewSdsData] = useState({ productName: '', manufacturer: '' });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchSheets = (term: string) => {
        setIsLoading(true);
        api.getSdsSheets(term)
            .then(setSheets)
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchSheets(searchTerm);
    }, [searchTerm]);

    const handleOpenModal = () => {
        setNewSdsData({ productName: '', manufacturer: '' });
        setSelectedFile(null);
        setIsSdsModalOpen(true);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !newSdsData.productName || !newSdsData.manufacturer) {
            alert("All fields are required.");
            return;
        }

        const dataToUpload = {
            ...newSdsData,
            filePath: `/files/sds/${selectedFile.name}` // Mock file path
        };

        try {
            await api.createSdsSheet(dataToUpload);
            setIsSdsModalOpen(false);
            fetchSheets(searchTerm); // Refresh the list
        } catch (error) {
            alert("Failed to upload SDS sheet.");
        }
    };
    
    const handleDownload = (sheet: SdsSheet) => {
        const content = `This is a mock PDF document for the SDS of ${sheet.productName}, manufactured by ${sheet.manufacturer}.`;
        const blob = new Blob([content], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sheet.productName.replace(/ /g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    };

    const columns = [
        { header: 'Product Name', accessor: (item: SdsSheet) => item.productName },
        { header: 'Manufacturer', accessor: (item: SdsSheet) => item.manufacturer },
        { header: 'Uploaded', accessor: (item: SdsSheet) => new Date(item.uploadedAt).toLocaleDateString() },
        { header: 'Actions', accessor: (item: SdsSheet) => <Button onClick={() => handleDownload(item)} icon={<FileDownIcon className="h-4 w-4 mr-2" />}>Download</Button> },
    ];

    return (
        <>
            <div>
                <div className="flex justify-between items-center mb-4">
                    <div className="relative flex-grow max-w-md">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                        <input 
                            type="text"
                            placeholder="Search by product or manufacturer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 pl-10 pr-4 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        />
                    </div>
                    <Button variant="secondary" icon={<UploadIcon className="h-4 w-4 mr-2"/>} onClick={handleOpenModal}>Upload SDS</Button>
                </div>
                {isLoading ? <div className="text-center p-8 text-dark-text-secondary">Searching...</div> : <Table columns={columns} data={sheets} />}
            </div>

            <Modal title="Upload New SDS Sheet" isOpen={isSdsModalOpen} onClose={() => setIsSdsModalOpen(false)}>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label htmlFor="productName" className="block text-sm font-medium text-dark-text-secondary mb-1">Product Name</label>
                        <input id="productName" type="text" value={newSdsData.productName} onChange={e => setNewSdsData({...newSdsData, productName: e.target.value})} required className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text"/>
                    </div>
                     <div>
                        <label htmlFor="manufacturer" className="block text-sm font-medium text-dark-text-secondary mb-1">Manufacturer</label>
                        <input id="manufacturer" type="text" value={newSdsData.manufacturer} onChange={e => setNewSdsData({...newSdsData, manufacturer: e.target.value})} required className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">File</label>
                        <input id="file-upload" type="file" onChange={handleFileSelect} required className="block w-full text-sm text-dark-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-red-700"/>
                        {selectedFile && <p className="text-xs mt-1 text-dark-text-secondary">{selectedFile.name}</p>}
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <Button type="button" variant="ghost" onClick={() => setIsSdsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Upload Sheet</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

const HealthSafety: React.FC = () => {
    const { user } = useInternalAuth();

    if (!user) return null;

    const TABS = [
        { label: 'My Exposure Log', content: <ExposureLogTab /> },
        ...(user.role !== Role.FIREFIGHTER ? [{ label: 'All Exposure Logs', content: <ExposureLogTab /> }] : []),
        { label: 'SDS Library', content: <SdsLibraryTab /> },
    ];

    // Adjust tabs based on role
    const tabsForRole = user.role === Role.FIREFIGHTER ?
        [
            { label: 'My Exposure Log', content: <ExposureLogTab /> },
            { label: 'SDS Library', content: <SdsLibraryTab /> },
        ] :
        [
            { label: 'All Exposure Logs', content: <ExposureLogTab /> },
            { label: 'SDS Library', content: <SdsLibraryTab /> },
        ];


    return (
        <Card title="Health & Safety">
            <Tabs tabs={tabsForRole} />
        </Card>
    );
};

export default HealthSafety;