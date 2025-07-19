
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useInternalAuth } from '../../hooks/useInternalAuth';
import { Role } from '../../types';
import { 
    OPERATIONS_LINKS, 
    RESOURCES_LINKS, 
    COMMUNITY_LINKS, 
    PLANNING_ANALYTICS_LINKS, 
    ADMINISTRATION_LINKS 
} from '../../constants';
import { FireExtinguisherIcon } from '../icons/Icons';

const Sidebar: React.FC = () => {
  const { user, userRole } = useInternalAuth();

  if (!user || !userRole) return null;

  const renderNavSection = (title: string, links: typeof OPERATIONS_LINKS) => {
    const accessibleLinks = links.filter(link => 
        link.roles.includes(user.role) && userRole.visibleModules.includes(link.label)
    );
    if (accessibleLinks.length === 0) return null;
    
    return (
        <>
            <h3 className="px-4 mt-6 mb-2 text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">{title}</h3>
            {accessibleLinks.map((link) => (
              <ReactRouterDOM.NavLink
                key={link.label}
                to={link.href}
                end={link.href.includes('dashboard')}
                className={({ isActive }) =>
                  `flex items-center py-3 my-1 text-base rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-dark-bg text-dark-text font-semibold border-l-4 border-brand-primary pl-3 pr-4'
                      : 'text-dark-text-secondary hover:bg-dark-border hover:text-dark-text px-4'
                  }`
                }
              >
                <link.icon className="h-6 w-6 mr-3" />
                <span>{link.label}</span>
              </ReactRouterDOM.NavLink>
            ))}
        </>
    );
  };


  return (
    <div className="hidden md:flex flex-col w-64 bg-dark-card border-r border-dark-border no-print">
      <div className="flex items-center justify-center h-20 border-b border-dark-border">
        <FireExtinguisherIcon className="h-8 w-8 text-brand-primary" />
        <h1 className="text-xl font-bold ml-3 text-white">Fire OMS</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4">
          {renderNavSection("Operations", OPERATIONS_LINKS)}
          {renderNavSection("Resources", RESOURCES_LINKS)}
          {renderNavSection("Community", COMMUNITY_LINKS)}
          {renderNavSection("Planning & Analytics", PLANNING_ANALYTICS_LINKS)}
          {renderNavSection("Administration", ADMINISTRATION_LINKS)}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
