
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { MegaphoneIcon, ShieldCheckIcon, FlameIcon, ShieldAlertIcon } from '../../components/icons/Icons';
import * as api from '../../services/api';
import { Announcement, Personnel, Role } from '../../types';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; buttonText: string; linkTo: string; }> = ({ icon, title, description, buttonText, linkTo }) => {
    const navigate = useNavigate();
    return (
        <div className="bg-dark-card border border-dark-border rounded-lg p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-brand-secondary/50">
            <div className="text-brand-primary mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-dark-text mb-2">{title}</h3>
            <p className="text-dark-text-secondary flex-grow mb-6">{description}</p>
            <Button variant="secondary" onClick={() => navigate(linkTo)}>{buttonText}</Button>
        </div>
    );
}

const BurnBanStatus: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    if (!isActive) {
        return (
             <div className="bg-green-600/80 border-t border-b border-green-500 text-white py-2 px-4 text-center text-sm font-semibold">
                No Burn Ban is currently in effect.
            </div>
        )
    }
    return (
        <div className="bg-red-700/90 border-t border-b border-red-600 text-white py-2 px-4 text-center font-semibold flex items-center justify-center animate-pulse">
            <ShieldAlertIcon className="h-5 w-5 mr-2" /> A COUNTY-WIDE BURN BAN IS IN EFFECT.
        </div>
    )
}

const PublicHome: React.FC = () => {
    const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null);
    const [isBurnBanActive, setIsBurnBanActive] = useState(false);
    const [fireChief, setFireChief] = useState<Personnel | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [announcements, personnel] = await Promise.all([
                    api.getAnnouncements(),
                    api.getPersonnelList()
                ]);

                // Set latest announcement
                if (announcements.length > 0) {
                    setLatestAnnouncement(announcements[0]);
                }

                // Check for burn ban
                const ban = announcements.some(ann => ann.title.toLowerCase().includes('burn ban'));
                setIsBurnBanActive(ban);
                
                // Find the Chief
                const chief = personnel.find(p => p.role === Role.CHIEF);
                setFireChief(chief || null);

            } catch (error) {
                console.error("Failed to fetch homepage data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-12">
            <div 
                className="text-center py-24 px-4 bg-cover bg-center rounded-lg relative overflow-hidden border border-dark-border" 
                style={{backgroundImage: `url(https://picsum.photos/seed/fire-station/1200/400)`}}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl drop-shadow-lg">
                        Welcome to the Anytown Fire Department Portal
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-300 drop-shadow-md">
                        Your community resource for safety information, services, and announcements.
                    </p>
                </div>
            </div>
            
            {/* Live Status Banner */}
            <BurnBanStatus isActive={isBurnBanActive} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={<MegaphoneIcon className="h-12 w-12" />}
                    title="Latest Announcements"
                    description="Stay up-to-date with the latest news, burn bans, and community events from the fire department."
                    buttonText="View Announcements"
                    linkTo="/announcements"
                />
                <FeatureCard 
                    icon={<ShieldCheckIcon className="h-12 w-12" />}
                    title="Storm Shelter Registry"
                    description="Register your storm shelter with us to help first responders locate you quickly during an emergency."
                    buttonText="Register a Shelter"
                    linkTo="/storm-shelter-registry"
                />
                <FeatureCard 
                    icon={<FlameIcon className="h-12 w-12" />}
                    title="Burn Permits"
                    description="Planning a controlled burn? Apply for a burn permit online to ensure you're following local safety guidelines."
                    buttonText="Apply for a Permit"
                    linkTo="/burn-permit-application"
                />
            </div>
            
             {/* Latest Announcement & Message from the Chief */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {latestAnnouncement && (
                    <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-lg p-6">
                         <h3 className="text-2xl font-bold text-dark-text mb-3">Latest News</h3>
                         <div className="border-t border-dark-border pt-4">
                            <h4 className="text-xl font-semibold text-brand-secondary">{latestAnnouncement.title}</h4>
                            <p className="text-dark-text-secondary mt-2 text-ellipsis overflow-hidden h-24">{latestAnnouncement.content}</p>
                            <Link to="/announcements">
                                <Button variant="ghost" className="mt-4">Read More &raquo;</Button>
                            </Link>
                         </div>
                    </div>
                )}
                {fireChief && (
                    <div className="lg:col-span-1 bg-dark-card border border-dark-border rounded-lg p-6 text-center">
                        <img src={fireChief.avatarUrl} alt={`Portrait of ${fireChief.name}`} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-dark-border" />
                        <h3 className="text-xl font-bold text-dark-text">A Message from the Chief</h3>
                        <p className="text-sm text-dark-text-secondary font-semibold mt-1">{fireChief.name}, {fireChief.rank}</p>
                        <p className="text-dark-text-secondary mt-3 text-sm italic">"On behalf of the dedicated members of the Anytown Fire Department, welcome to our community portal. We are committed to your safety."</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default PublicHome;
