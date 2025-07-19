
import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { Announcement, Personnel } from '../../types';
import Card from '../../components/ui/Card';

const PublicAnnouncements: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.getAnnouncements(),
            api.getPersonnelList()
        ]).then(([announcementData, personnelData]) => {
            setAnnouncements(announcementData);
            setPersonnel(personnelData);
        }).finally(() => setIsLoading(false));
    }, []);

    const getAuthorName = (authorId: string) => {
        const author = personnel.find(p => p.id === authorId);
        return author?.name || 'Fire Dept. Staff';
    };

    if (isLoading) {
        return <div className="text-center p-8 text-dark-text-secondary">Loading announcements...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-dark-text mb-6">Community Announcements</h1>
            <div className="space-y-6">
                {announcements.length > 0 ? announcements.map(ann => (
                    <Card key={ann.id} title={ann.title}>
                        <p className="text-dark-text-secondary whitespace-pre-wrap">{ann.content}</p>
                        <div className="mt-4 pt-4 border-t border-dark-border">
                            <p className="text-sm text-dark-text-secondary">
                                Posted by {getAuthorName(ann.authorId)} on {new Date(ann.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </Card>
                )) : (
                    <Card>
                        <p className="text-center text-dark-text-secondary">There are no announcements at this time.</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default PublicAnnouncements;
