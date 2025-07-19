
import React, { useState, useEffect } from 'react';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import * as api from '../services/api';
import { Announcement, Personnel } from '../types';
import { useInternalAuth } from '../hooks/useInternalAuth';
import { PlusIcon, EditIcon } from '../components/icons/Icons';

const Announcements: React.FC = () => {
    const { user } = useInternalAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [modalData, setModalData] = useState({ title: '', content: '' });

    const fetchAnnouncements = () => {
        setIsLoading(true);
        Promise.all([
            api.getAnnouncements(),
            api.getPersonnelList()
        ]).then(([announcementData, personnelData]) => {
            setAnnouncements(announcementData);
            setPersonnel(personnelData);
        }).finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const getAuthorName = (authorId: string) => {
        const author = personnel.find(p => p.id === authorId);
        return author?.name || 'Unknown';
    };

    const openCreateModal = () => {
        setEditingAnnouncement(null);
        setModalData({ title: '', content: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (ann: Announcement) => {
        setEditingAnnouncement(ann);
        setModalData({ title: ann.title, content: ann.content });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            try {
                await api.deleteAnnouncement(id);
                setAnnouncements(announcements.filter(ann => ann.id !== id));
            } catch (error) {
                alert("Failed to delete announcement.");
            }
        }
    };
    
    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalData.title || !modalData.content || !user) return;

        try {
            if (editingAnnouncement) {
                await api.updateAnnouncement(editingAnnouncement.id, modalData);
            } else {
                await api.createAnnouncement({ ...modalData, authorId: user.id });
            }
            setIsModalOpen(false);
            fetchAnnouncements();
        } catch (error) {
            alert(`Failed to ${editingAnnouncement ? 'update' : 'create'} announcement.`);
        }
    };

    const columns = [
        { header: 'Title', accessor: (item: Announcement) => item.title },
        { header: 'Author', accessor: (item: Announcement) => getAuthorName(item.authorId) },
        { header: 'Created At', accessor: (item: Announcement) => new Date(item.createdAt).toLocaleDateString() },
        {
            header: 'Actions',
            accessor: (item: Announcement) => (
                <div className="flex space-x-2">
                    <Button variant="ghost" onClick={() => openEditModal(item)} className="p-1 h-7 w-7"><EditIcon className="h-4 w-4" /></Button>
                    <Button variant="danger" onClick={() => handleDelete(item.id)} className="py-1 px-2 text-xs">
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Manage Announcements</h2>
                <Button onClick={openCreateModal} icon={<PlusIcon className="h-5 w-5 mr-2" />}>
                    New Announcement
                </Button>
            </div>
            {isLoading ? (
                <div className="text-center p-8 text-dark-text-secondary">Loading announcements...</div>
            ) : (
                <Table columns={columns} data={announcements} />
            )}

            <Modal title={editingAnnouncement ? "Edit Announcement" : "Create New Announcement"} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleModalSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-dark-text-secondary mb-1">Title</label>
                        <input
                            id="title"
                            type="text"
                            value={modalData.title}
                            onChange={(e) => setModalData({...modalData, title: e.target.value})}
                            className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-dark-text-secondary mb-1">Content</label>
                        <textarea
                            id="content"
                            rows={4}
                            value={modalData.content}
                            onChange={(e) => setModalData({...modalData, content: e.target.value})}
                            className="block w-full bg-dark-bg border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                            required
                        />
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary">{editingAnnouncement ? "Save Changes" : "Create"}</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default Announcements;
