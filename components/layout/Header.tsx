
import React, { useState, useRef, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useInternalAuth } from '../../hooks/useInternalAuth';
import { LogOutIcon, UserIcon, ChevronDownIcon, BellIcon, WifiOffIcon, PipetteIcon, ChevronRightIcon } from '../icons/Icons';
import * as api from '../../services/api';
import { Notification } from '../../types';

const getTitleFromPath = (path: string): string => {
    const cleanPath = path.startsWith('/app') ? path.substring(4) : path;
    const segments = cleanPath.split('/').filter(Boolean); // e.g., ['personnel', 'p-001']
    if (segments.length === 0) return 'Dashboard';

    const mainPath = segments[0];
    
    // Add specific titles for new top-level pages
    if (mainPath === 'gis') return 'GIS Dashboard';
    if (mainPath === 'profile') return 'User Profile';
    if (mainPath === 'analytics') return 'Analytics Dashboard';
    if (mainPath === 'internal-comms') return 'Internal Comms';
    if (mainPath === 'audit-log') return 'Audit Log';
    if (mainPath === 'settings') return 'System Settings';


    const capitalizedMainPath = mainPath.charAt(0).toUpperCase() + mainPath.slice(1).replace('-', ' ');


    if (segments.length > 1) {
        if (mainPath === 'incidents' && segments[1] === 'new') {
            return 'Create New Incident';
        }
        // For detail pages like /personnel/p-001
        return `${capitalizedMainPath} Detail`;
    }
    
    return capitalizedMainPath;
}

const THEMES = [
    { id: 'theme-code-red', name: 'Code Red' },
    { id: 'theme-ash', name: 'Ash & Embers' },
    { id: 'theme-wildland', name: 'Wildland Ops' },
    { id: 'theme-sar', name: 'SAR' },
];


const Header: React.FC = () => {
    const { user, logout } = useInternalAuth();
    const location = ReactRouterDOM.useLocation();
    const navigate = ReactRouterDOM.useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [themeMenuOpen, setThemeMenuOpen] = useState(false);
    
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    const pageTitle = getTitleFromPath(location.pathname);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
                setThemeMenuOpen(false); // also close submenu
            }
             if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        
        // Fetch notifications
        api.getNotifications().then(setNotifications);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/app/login');
    };
    
    const handleMarkAsRead = async () => {
        await api.markNotificationsAsRead();
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const handleThemeChange = (theme: string) => {
        document.body.className = theme;
        localStorage.setItem('fire-oms-theme', theme);
        setThemeMenuOpen(false);
        setDropdownOpen(false);
    };
    
    const unreadCount = notifications.filter(n => !n.read).length;

    if (!user) return null;

    return (
        <header className="flex justify-between items-center h-20 px-6 bg-dark-card border-b border-dark-border flex-shrink-0 no-print">
            <h1 className="text-2xl font-bold text-dark-text">{pageTitle}</h1>
            <div className="flex items-center space-x-4">
                {!isOnline && (
                    <div className="flex items-center space-x-2 text-yellow-400">
                        <WifiOffIcon className="h-5 w-5" />
                        <span className="text-sm font-semibold hidden md:inline">Offline Mode</span>
                    </div>
                )}
                 {/* Notifications Bell */}
                <div className="relative" ref={notificationsRef}>
                    <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-2 rounded-full hover:bg-dark-border relative">
                        <BellIcon className="h-6 w-6 text-dark-text-secondary" />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 h-4 w-4 bg-brand-primary text-white text-xs rounded-full flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                     {notificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-dark-card border border-dark-border rounded-lg shadow-lg z-20">
                           <div className="p-3 flex justify-between items-center border-b border-dark-border">
                                <h3 className="font-semibold text-dark-text">Notifications</h3>
                                {unreadCount > 0 && <button onClick={handleMarkAsRead} className="text-xs text-brand-secondary hover:underline">Mark all as read</button>}
                           </div>
                            <ul className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? notifications.map(n => (
                                    <li key={n.id} className={`border-b border-dark-border last:border-b-0 ${!n.read ? 'bg-blue-500/10' : ''}`}>
                                        <ReactRouterDOM.Link to={n.link} onClick={() => setNotificationsOpen(false)} className="block p-3 hover:bg-dark-border">
                                            <p className="text-sm text-dark-text">{n.message}</p>
                                            <p className="text-xs text-dark-text-secondary mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                                        </ReactRouterDOM.Link>
                                    </li>
                                )) : (
                                    <li className="p-4 text-center text-sm text-dark-text-secondary">No new notifications.</li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-dark-border transition-colors duration-200"
                    >
                        <img className="h-10 w-10 rounded-full object-cover" src={user.avatarUrl} alt="User avatar" />
                        <div className="hidden md:flex flex-col items-start">
                            <span className="font-semibold text-dark-text">{user.name}</span>
                            <span className="text-sm text-dark-text-secondary">{user.role}</span>
                        </div>
                        <ChevronDownIcon className="h-5 w-5 text-dark-text-secondary hidden md:block" />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-dark-card border border-dark-border rounded-lg shadow-lg z-20">
                             <div className="p-2 border-b border-dark-border">
                                <p className="text-sm font-semibold text-dark-text px-2">{user.name}</p>
                                <p className="text-xs text-dark-text-secondary px-2">{user.role}</p>
                            </div>
                            <ul>
                                <li>
                                    <ReactRouterDOM.Link to="/app/profile" onClick={() => setDropdownOpen(false)} className="flex items-center w-full px-4 py-3 text-sm text-dark-text-secondary hover:bg-dark-border hover:text-dark-text">
                                        <UserIcon className="h-5 w-5 mr-3" /> Profile
                                    </ReactRouterDOM.Link>
                                </li>
                                <li className="relative">
                                     <button
                                        onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                                        className="w-full text-left flex items-center justify-between px-4 py-3 text-sm text-dark-text-secondary hover:bg-dark-border hover:text-dark-text"
                                    >
                                        <span className="flex items-center"><PipetteIcon className="h-5 w-5 mr-3" /> Theme</span>
                                        <ChevronRightIcon className={`h-4 w-4 transition-transform ${themeMenuOpen ? 'rotate-90' : ''}`} />
                                    </button>
                                     {themeMenuOpen && (
                                        <div className="absolute top-0 right-full mr-2 w-48 bg-dark-card border border-dark-border rounded-lg shadow-lg">
                                            <ul>
                                                {THEMES.map(theme => (
                                                    <li key={theme.id}>
                                                        <button onClick={() => handleThemeChange(theme.id)} className="w-full text-left px-4 py-3 text-sm text-dark-text-secondary hover:bg-dark-border hover:text-dark-text">
                                                            {theme.name}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left flex items-center px-4 py-3 text-sm text-dark-text-secondary hover:bg-dark-border hover:text-dark-text"
                                    >
                                        <LogOutIcon className="h-5 w-5 mr-3" /> Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
