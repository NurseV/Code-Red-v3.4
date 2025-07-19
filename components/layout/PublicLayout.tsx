
import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import * as api from '../../services/api';
import { DepartmentInfo } from '../../types';
import { FacebookIcon, TwitterIcon, InstagramIcon } from '../icons/Icons';

const PublicLayout: React.FC = () => {
  const [departmentInfo, setDepartmentInfo] = useState<DepartmentInfo | null>(null);

  useEffect(() => {
    api.getDepartmentInfo().then(setDepartmentInfo);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-dark-text">
      <PublicNavbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="bg-dark-card border-t border-dark-border">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold text-dark-text">Anytown Fire Dept.</h3>
              {departmentInfo && (
                <address className="mt-2 text-dark-text-secondary not-italic text-sm">
                  {departmentInfo.address.street}<br />
                  {departmentInfo.address.city}, {departmentInfo.address.state} {departmentInfo.address.zip}<br />
                  <a href={`tel:${departmentInfo.phone}`} className="hover:text-dark-text">P: {departmentInfo.phone}</a>
                </address>
              )}
            </div>
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold text-dark-text">Quick Links</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li><Link to="/announcements" className="text-dark-text-secondary hover:text-dark-text">Announcements</Link></li>
                <li><Link to="/about" className="text-dark-text-secondary hover:text-dark-text">About Us</Link></li>
                <li><Link to="/community-calendar" className="text-dark-text-secondary hover:text-dark-text">Calendar</Link></li>
                <li><Link to="/burn-permit-application" className="text-dark-text-secondary hover:text-dark-text">Burn Permits</Link></li>
              </ul>
            </div>
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold text-dark-text">Connect With Us</h3>
              <div className="flex space-x-4 mt-2">
                 <a href="#" className="text-dark-text-secondary hover:text-white"><span className="sr-only">Facebook</span><FacebookIcon className="h-6 w-6"/></a>
                 <a href="#" className="text-dark-text-secondary hover:text-white"><span className="sr-only">Twitter</span><TwitterIcon className="h-6 w-6"/></a>
                 <a href="#" className="text-dark-text-secondary hover:text-white"><span className="sr-only">Instagram</span><InstagramIcon className="h-6 w-6"/></a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-dark-border pt-4 text-center text-dark-text-secondary text-sm">
            <span>&copy; {new Date().getFullYear()} Anytown Fire Department. All Rights Reserved.</span>
            <span className="mx-2">|</span>
            <Link to="/app/login" className="hover:text-dark-text hover:underline">Staff Login</Link>
         </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
