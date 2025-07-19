

import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import * as api from '../services/api';
import { PhotoAlbum, Photo } from '../types';
import { PlusIcon, CameraIcon, UploadIcon } from '../components/icons/Icons';
import Announcements from './Announcements';
import PublicServices from './PublicServices';
import AdminRecordsRequests from './AdminRecordsRequests';
import MassCommunication from './MassCommunication';

const PhotoGalleryAdminTab: React.FC = () => {
    const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
    const [newAlbum, setNewAlbum] = useState({ title: '', description: '' });

    const fetchAlbums = () => {
        api.getPhotoAlbums().then(setAlbums).finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchAlbums();
    }, []);

    const handleCreateAlbum = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createPhotoAlbum(newAlbum);
            setIsAlbumModalOpen(false);
            setNewAlbum({ title: '', description: '' });
            fetchAlbums();
        } catch (error) {
            alert('Failed to create album.');
        }
    };

    const handleUploadPhoto = async (albumId: string) => {
        // This is a mock implementation
        const caption = prompt("Enter a caption for the new photo:");
        if (caption) {
            try {
                await api.uploadPhoto(albumId, caption);
                alert(`Mock photo uploaded to album ID ${albumId}.`);
            } catch (error) {
                alert('Failed to upload photo.');
            }
        }
    };

    if (isLoading) {
        return <div className="text-center p-8 text-dark-text-secondary">Loading photo albums...</div>;
    }

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={() => setIsAlbumModalOpen(true)} icon={<PlusIcon className="h-4 w-4 mr-2" />}>New Album</Button>
            </div>
            <div className="space-y-4">
                {albums.map(album => (
                    <div key={album.id} className="bg-dark-bg p-4 rounded-lg border border-dark-border flex justify-between items-center">
                        <div>
                            <p className="font-bold text-dark-text">{album.title}</p>
                            <p className="text-sm text-dark-text-secondary">{album.description}</p>
                        </div>
                        <Button onClick={() => handleUploadPhoto(album.id)} variant="secondary" icon={<UploadIcon className="h-4 w-4 mr-2" />}>Upload Photo</Button>
                    </div>
                ))}
            </div>
            <Modal title="Create New Photo Album" isOpen={isAlbumModalOpen} onClose={() => setIsAlbumModalOpen(false)}>
                <form onSubmit={handleCreateAlbum} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Album Title</label>
                        <input type="text" value={newAlbum.title} onChange={e => setNewAlbum({...newAlbum, title: e.target.value})} required className="block w-full bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-text-secondary mb-1">Description</label>
                        <textarea value={newAlbum.description} onChange={e => setNewAlbum({...newAlbum, description: e.target.value})} required rows={3} className="block w-full bg-dark-bg border border-dark-border rounded-md py-2 px-3 text-dark-text" />
                    </div>
                    <div className="flex justify-end pt-4 space-x-2">
                        <Button type="button" variant="ghost" onClick={() => setIsAlbumModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Album</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};


const PublicPortalAdmin: React.FC = () => {
    const TABS = [
        { label: 'Announcements', content: <Announcements /> },
        { label: 'Mass Communication', content: <MassCommunication /> },
        { label: 'Public Services', content: <PublicServices /> },
        { label: 'Records Requests', content: <AdminRecordsRequests /> },
        { label: 'Photo Gallery', content: <PhotoGalleryAdminTab /> },
    ];

    return (
        <Card title="Public Portal Management">
            <p className="text-sm text-dark-text-secondary mb-6">
                Manage all public-facing content and requests from this centralized dashboard.
            </p>
            <Tabs tabs={TABS} />
        </Card>
    );
};

export default PublicPortalAdmin;