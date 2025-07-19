
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import * as api from '../services/api';
import { Folder, Document } from '../types';
import { FolderIcon, FileTextIcon, SearchIcon, UploadIcon, FolderPlusIcon, ArrowLeftIcon, XIcon } from '../components/icons/Icons';

type DisplayItem = Folder | Document;

const Documents: React.FC = () => {
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [breadcrumbs, setBreadcrumbs] = useState<Folder[]>([]);
    const [displayedItems, setDisplayedItems] = useState<DisplayItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [folders, documents, breadcrumbData] = await Promise.all([
                api.getFolders(currentFolderId),
                api.getDocuments(currentFolderId),
                api.getFolderBreadcrumbs(currentFolderId)
            ]);

            const allItems: DisplayItem[] = [...folders, ...documents];
            const filteredItems = searchTerm
                ? allItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                : allItems;
            
            setDisplayedItems(filteredItems);
            setBreadcrumbs(breadcrumbData);
        } catch (error) {
            console.error("Failed to fetch documents", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentFolderId, searchTerm]);


    const handleNavigate = (folderId: string | null) => {
        setCurrentFolderId(folderId);
        setSearchTerm(''); // Reset search on navigation
    };

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName) return;

        try {
            await api.createFolder({ name: newFolderName, parentId: currentFolderId });
            setNewFolderName('');
            setIsFolderModalOpen(false);
            fetchData(); // Refresh list
        } catch (error) {
            alert("Failed to create folder.");
        }
    };
    
    const handleOpenUploadModal = () => {
        setSelectedFile(null);
        setIsUploadModalOpen(true);
    };
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };
    
    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
        let docType: Document['type'] = 'Image';
        if (fileType === 'pdf') docType = 'PDF';
        if (fileType === 'docx' || fileType === 'doc') docType = 'Word';
        if (fileType === 'xlsx' || fileType === 'xls') docType = 'Excel';

        const newDocData = {
            name: selectedFile.name,
            folderId: currentFolderId,
            size: `${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`,
            type: docType,
        };

        try {
            await api.createDocument(newDocData);
            setIsUploadModalOpen(false);
            fetchData();
        } catch (error) {
            alert("Failed to upload document.");
        }
    };

    const handleDelete = async (item: DisplayItem) => {
        const isFolder = 'parentId' in item;
        const confirmText = isFolder
            ? `Are you sure you want to delete the folder "${item.name}" and all its contents? This cannot be undone.`
            : `Are you sure you want to delete the document "${item.name}"?`;

        if (window.confirm(confirmText)) {
            try {
                if (isFolder) {
                    await api.deleteFolder(item.id);
                } else {
                    await api.deleteDocument(item.id);
                }
                fetchData();
            } catch (e) {
                alert(`Failed to delete ${isFolder ? 'folder' : 'document'}.`);
            }
        }
    };

    const getIcon = (item: Folder | Document) => {
      if ('parentId' in item) { // It's a Folder
        return <FolderIcon className="h-6 w-6 text-yellow-400" />;
      }
      // It's a Document
      switch(item.type) {
        case 'PDF': return <FileTextIcon className="h-6 w-6 text-red-400" />;
        case 'Word': return <FileTextIcon className="h-6 w-6 text-blue-400" />;
        case 'Excel': return <FileTextIcon className="h-6 w-6 text-green-400" />;
        default: return <FileTextIcon className="h-6 w-6 text-gray-400" />;
      }
    };

    return (
        <>
            <Card>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div className="flex items-center text-sm text-dark-text-secondary mb-3 md:mb-0">
                        <button onClick={() => handleNavigate(null)} className="hover:text-dark-text">Root</button>
                        {breadcrumbs.map(b => (
                            <React.Fragment key={b.id}>
                                <span className="mx-2">/</span>
                                <button onClick={() => handleNavigate(b.id)} className="hover:text-dark-text">{b.name}</button>
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="flex items-center space-x-2 w-full md:w-auto">
                        <div className="relative flex-grow">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                            <input 
                                type="text"
                                placeholder="Search in folder..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 pl-10 pr-4 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                            />
                        </div>
                        <Button variant="ghost" onClick={() => setIsFolderModalOpen(true)}><FolderPlusIcon className="h-5 w-5" /></Button>
                        <Button onClick={handleOpenUploadModal}><UploadIcon className="h-5 w-5" /></Button>
                    </div>
                </div>
                
                {isLoading ? <div className="text-center py-12 text-dark-text-secondary">Loading...</div> : (
                    <div className="overflow-x-auto">
                    <table className="min-w-full bg-dark-card text-dark-text">
                        <thead className="bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider w-3/5">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Version</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Size</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Last Modified</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Delete</span></th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                        {currentFolderId && (
                            <tr className="hover:bg-dark-border/50 transition-colors duration-150 cursor-pointer" onClick={() => handleNavigate(breadcrumbs[breadcrumbs.length - 2]?.id || null)}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm flex items-center">
                                <ArrowLeftIcon className="h-5 w-5 mr-3 text-dark-text-secondary" />..
                                </td>
                                <td></td><td></td><td></td><td></td>
                            </tr>
                        )}
                        {displayedItems.map(item => (
                            <tr key={item.id} className="hover:bg-dark-border/50 transition-colors duration-150 group">
                            <td 
                                className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-text flex items-center cursor-pointer"
                                onClick={() => 'parentId' in item && handleNavigate(item.id)}
                            >
                                {getIcon(item)}
                                <span className="ml-3">
                                {item.name}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{'version' in item ? `v${item.version}` : '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{'size' in item ? item.size : '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{'modifiedAt' in item ? new Date(item.modifiedAt).toLocaleDateString() : '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button onClick={() => handleDelete(item)} variant="ghost" className="p-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <XIcon className="h-4 w-4 text-red-500"/>
                                </Button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    {displayedItems.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-dark-text-secondary">{searchTerm ? 'No items match your search.' : 'This folder is empty.'}</p>
                        </div>
                    )}
                    </div>
                )}
            </Card>

            <Modal title="Create New Folder" isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)}>
                <form onSubmit={handleCreateFolder} className="space-y-4">
                    <div>
                        <label htmlFor="folderName" className="block text-sm font-medium text-dark-text-secondary mb-1">Folder Name</label>
                        <input
                            id="folderName"
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                            required
                        />
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <Button type="button" variant="ghost" onClick={() => setIsFolderModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Folder</Button>
                    </div>
                </form>
            </Modal>

            <Modal title="Upload Document" isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)}>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium text-dark-text-secondary mb-1">Select File</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dark-border border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <FileTextIcon className="mx-auto h-12 w-12 text-dark-text-secondary" />
                                <div className="flex text-sm text-dark-text-secondary">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-dark-bg rounded-md font-medium text-brand-primary hover:text-brand-secondary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-primary">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileSelect} />
                                    </label>
                                </div>
                                <p className="text-xs text-dark-text-secondary">{selectedFile ? selectedFile.name : 'PDF, DOCX, XLSX, PNG, JPG up to 10MB'}</p>
                            </div>
                        </div>
                    </div>
                    {selectedFile && (
                         <div className="pt-4 flex justify-end space-x-3">
                            <Button type="button" variant="ghost" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Upload</Button>
                        </div>
                    )}
                </form>
            </Modal>
        </>
    );
};

export default Documents;