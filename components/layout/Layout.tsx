
import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import * as api from '../../services/api';

const Layout: React.FC = () => {
  useEffect(() => {
    // Generate asset notifications on load to simulate a background check
    api.generateAssetNotifications();

    const handleOnline = () => {
      console.log('App is back online. Checking for pending sync items...');
      api.syncPendingTickets().then(count => {
          if (count > 0) {
              alert(`${count} pending repair ticket(s) have been synced successfully.`);
              // Here you could use a state management library or event bus
              // to notify other components to refresh their data.
              // For now, a simple alert is sufficient.
          }
      }).catch(err => {
          console.error("Failed to sync pending tickets:", err);
          alert("An error occurred while trying to sync offline data. Please check your connection and try again.");
      });
    };

    window.addEventListener('online', handleOnline);

    // Initial check in case app loads while online
    if (navigator.onLine) {
        handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <div className="flex h-screen bg-dark-bg text-dark-text">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-dark-bg p-6 md:p-8">
            <ReactRouterDOM.Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
