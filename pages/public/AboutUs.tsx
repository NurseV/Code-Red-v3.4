import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { AboutUsContent, LeadershipMember } from '../../types';
import Card from '../../components/ui/Card';
import { ShieldCheckIcon, BookOpenIcon, UsersIcon } from '../../components/icons/Icons';

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className }) => (
    <Card className={className}>
        <div className="flex items-center mb-4">
            <span className="p-2 bg-dark-bg rounded-full mr-3">{icon}</span>
            <h2 className="text-2xl font-bold text-dark-text">{title}</h2>
        </div>
        <div className="text-dark-text-secondary leading-relaxed space-y-4">
            {children}
        </div>
    </Card>
);

const AboutUs: React.FC = () => {
    const [content, setContent] = useState<AboutUsContent | null>(null);
    const [leadership, setLeadership] = useState<LeadershipMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contentData, leadershipData] = await Promise.all([
                    api.getAboutUsContent(),
                    api.getLeadershipTeam()
                ]);
                setContent(contentData);
                setLeadership(leadershipData);
            } catch (error) {
                console.error("Failed to load About Us page content", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return <div className="text-center p-8 text-dark-text-secondary">Loading page content...</div>;
    }

    if (!content) {
        return <div className="text-center p-8 text-red-500">Failed to load page content.</div>;
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-white sm:text-5xl">About the Anytown Fire Department</h1>
                <p className="mt-4 max-w-2xl mx-auto text-xl text-dark-text-secondary">
                    Serving our community with courage, integrity, and respect since 1925.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Section title="Our Mission" icon={<ShieldCheckIcon className="h-6 w-6 text-brand-primary" />}>
                    <p>{content.mission}</p>
                </Section>
                <Section title="Our History" icon={<BookOpenIcon className="h-6 w-6 text-brand-secondary" />}>
                    <p>{content.history}</p>
                </Section>
            </div>

            <Card>
                 <h2 className="text-2xl font-bold text-dark-text text-center mb-6">Our Core Values</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 text-center">
                    {content.values.map(value => (
                        <div key={value.title} className="bg-dark-bg p-4 rounded-lg border border-dark-border">
                            <h3 className="font-bold text-lg text-dark-text">{value.title}</h3>
                            <p className="text-sm text-dark-text-secondary mt-1">{value.description}</p>
                        </div>
                    ))}
                 </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Section title="Leadership Team" icon={<UsersIcon className="h-6 w-6 text-blue-400" />} className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {leadership.map(leader => (
                             <div key={leader.id} className="text-center bg-dark-bg p-4 rounded-lg border border-dark-border">
                                <img src={leader.avatarUrl} alt={leader.name} className="w-24 h-24 rounded-full mx-auto mb-3 border-2 border-dark-border" />
                                <h4 className="font-bold text-dark-text">{leader.name}</h4>
                                <p className="text-sm text-brand-secondary">{leader.rank}</p>
                                <p className="text-xs text-dark-text-secondary mt-2">{leader.bio}</p>
                            </div>
                        ))}
                    </div>
                </Section>
                 <Section title="Organizational Structure" icon={<UsersIcon className="h-6 w-6 text-green-400" />} className="lg:col-span-1">
                    <p>{content.orgStructureDescription}</p>
                </Section>
            </div>
        </div>
    );
};

export default AboutUs;
