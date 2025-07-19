
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { InternalAuthProvider, useInternalAuth } from './hooks/useInternalAuth';
import { CitizenAuthProvider, useCitizenAuth } from './hooks/useCitizenAuth';

// Layouts
import Layout from './components/layout/Layout';
import PublicLayout from './components/layout/PublicLayout';

// Internal Pages
import Dashboard from './pages/Dashboard';
import Personnel from './pages/Personnel';
import Apparatus from './pages/Apparatus';
import Incidents from './pages/Incidents';
import CreateIncident from './pages/CreateIncident';
import InternalLogin from './pages/InternalLogin';
import NotFound from './pages/NotFound';
import PersonnelDetail from './pages/PersonnelDetail';
import ApparatusDetail from './pages/ApparatusDetail';
import NewApparatus from './pages/NewApparatus';
import IncidentDetail from './pages/IncidentDetail';
import PublicPortalAdmin from './pages/PublicPortalAdmin';
import Admin from './pages/Admin';
import ApparatusChecklist from './pages/ApparatusChecklist';
import Assets from './pages/Assets';
import AssetDetail from './pages/AssetDetail';
import Inventory from './pages/Inventory';
import Training from './pages/Training';
import Documents from './pages/Documents';
import GisDashboard from './pages/GisDashboard';
import Calendar from './pages/Calendar';
import Reporting from './pages/Reporting';
import HealthSafety from './pages/HealthSafety';
import LogExposure from './pages/LogExposure';
import HydrantManagement from './pages/HydrantManagement';
import PropertyManagement from './pages/PropertyManagement';
import PropertyDetail from './pages/PropertyDetail';
import NewProperty from './pages/NewProperty';
import Financials from './pages/Financials';
import Maintenance from './pages/Maintenance';
import Profile from './pages/Profile';
import InternalComms from './pages/InternalComms';
import Settings from './pages/Settings';


// Public Pages
import PublicHome from './pages/public/PublicHome';
import PublicAnnouncements from './pages/public/PublicAnnouncements';
import StormShelterRegistry from './pages/public/StormShelterRegistry';
import BurnPermitApplication from './pages/public/BurnPermitApplication';
import CommunityCalendar from './pages/public/CommunityCalendar';
import AboutUs from './pages/public/AboutUs';
import PhotoGallery from './pages/public/PhotoGallery';
import AlbumDetail from './pages/public/AlbumDetail';
import RecordsRequest from './pages/public/RecordsRequest';


// Citizen Portal Pages
import CitizenLogin from './pages/portal/CitizenLogin';
import CitizenRegister from './pages/portal/CitizenRegister';
import CitizenDashboard from './pages/portal/CitizenDashboard';
import AccountSettings from './pages/portal/AccountSettings';
import BillForgiveness from './pages/portal/BillForgiveness';


// A wrapper for PROTECTED INTERNAL routes that redirects to login if not authenticated.
const InternalProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useInternalAuth();
  const location = ReactRouterDOM.useLocation();

  if (!isAuthenticated) {
    return <ReactRouterDOM.Navigate to="/app/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// A wrapper for PROTECTED CITIZEN routes that redirects to login if not authenticated.
const CitizenProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useCitizenAuth();
  const location = ReactRouterDOM.useLocation();

  if (!isAuthenticated) {
    return <ReactRouterDOM.Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};


const AppRoutes: React.FC = () => {
    return (
        <ReactRouterDOM.Routes>
            {/* --- Public Facing Portal --- */}
            <ReactRouterDOM.Route element={<PublicLayout />}>
              <ReactRouterDOM.Route path="/" element={<PublicHome />} />
              <ReactRouterDOM.Route path="/announcements" element={<PublicAnnouncements />} />
              <ReactRouterDOM.Route path="/about" element={<AboutUs />} />
              <ReactRouterDOM.Route path="/community-calendar" element={<CommunityCalendar />} />
              <ReactRouterDOM.Route path="/photo-gallery" element={<PhotoGallery />} />
              <ReactRouterDOM.Route path="/photo-gallery/:albumId" element={<AlbumDetail />} />
              <ReactRouterDOM.Route path="/storm-shelter-registry" element={<StormShelterRegistry />} />
              <ReactRouterDOM.Route path="/burn-permit-application" element={<BurnPermitApplication />} />
              <ReactRouterDOM.Route path="/records-request" element={<RecordsRequest />} />
              <ReactRouterDOM.Route path="/login" element={<CitizenLogin />} />
              <ReactRouterDOM.Route path="/register" element={<CitizenRegister />} />

              {/* Secure Citizen Portal */}
              <ReactRouterDOM.Route path="/portal/dashboard" element={<CitizenProtectedRoute><CitizenDashboard /></CitizenProtectedRoute>} />
              <ReactRouterDOM.Route path="/portal/settings" element={<CitizenProtectedRoute><AccountSettings /></CitizenProtectedRoute>} />
              <ReactRouterDOM.Route path="/portal/bill-forgiveness" element={<CitizenProtectedRoute><BillForgiveness /></CitizenProtectedRoute>} />
            </ReactRouterDOM.Route>
            
            {/* --- Internal Admin Portal --- */}
            <ReactRouterDOM.Route path="/app/login" element={<InternalLogin />} />
            
            <ReactRouterDOM.Route path="/app" element={
                <InternalProtectedRoute>
                    <Layout />
                </InternalProtectedRoute>
            }>
                <ReactRouterDOM.Route index element={<ReactRouterDOM.Navigate to="/app/dashboard" replace />} />
                <ReactRouterDOM.Route path="dashboard" element={<Dashboard />} />
                <ReactRouterDOM.Route path="profile" element={<Profile />} />
                
                {/* Core Modules */}
                <ReactRouterDOM.Route path="personnel" element={<Personnel />} />
                <ReactRouterDOM.Route path="personnel/:id" element={<PersonnelDetail />} />
                <ReactRouterDOM.Route path="apparatus" element={<Apparatus />} />
                <ReactRouterDOM.Route path="apparatus/new" element={<NewApparatus />} />
                <ReactRouterDOM.Route path="apparatus/:id" element={<ApparatusDetail />} />
                <ReactRouterDOM.Route path="apparatus/:id/checklist" element={<ApparatusChecklist />} />
                <ReactRouterDOM.Route path="incidents" element={<Incidents />} />
                <ReactRouterDOM.Route path="incidents/new" element={<CreateIncident />} />
                <ReactRouterDOM.Route path="incidents/:id" element={<IncidentDetail />} />
                <ReactRouterDOM.Route path="incidents/:id/edit" element={<CreateIncident />} />
                <ReactRouterDOM.Route path="incidents/:id/log-exposure" element={<LogExposure />} />
                <ReactRouterDOM.Route path="internal-comms" element={<InternalComms />} />
                <ReactRouterDOM.Route path="assets" element={<Assets />} />
                <ReactRouterDOM.Route path="assets/:id" element={<AssetDetail />} />
                <ReactRouterDOM.Route path="inventory" element={<Inventory />} />

                {/* Infrastructure Modules */}
                <ReactRouterDOM.Route path="hydrants" element={<HydrantManagement />} />
                <ReactRouterDOM.Route path="properties" element={<PropertyManagement />} />
                <ReactRouterDOM.Route path="properties/new" element={<NewProperty />} />
                <ReactRouterDOM.Route path="properties/:id" element={<PropertyDetail />} />

                {/* Financial Modules */}
                <ReactRouterDOM.Route path="financials" element={<Financials />} />


                {/* Admin & Management */}
                <ReactRouterDOM.Route path="admin" element={<Admin />} />
                <ReactRouterDOM.Route path="training" element={<Training />} />
                <ReactRouterDOM.Route path="documents" element={<Documents />} />
                <ReactRouterDOM.Route path="public-portal" element={<PublicPortalAdmin />} />
                <ReactRouterDOM.Route path="maintenance" element={<Maintenance />} />
                <ReactRouterDOM.Route path="settings" element={<Settings />} />

                {/* Advanced Features */}
                <ReactRouterDOM.Route path="gis" element={<GisDashboard />} />
                <ReactRouterDOM.Route path="calendar" element={<Calendar />} />
                <ReactRouterDOM.Route path="reporting" element={<Reporting />} />
                <ReactRouterDOM.Route path="health-safety" element={<HealthSafety />} />
            </ReactRouterDOM.Route>

            <ReactRouterDOM.Route path="*" element={<NotFound />} />
        </ReactRouterDOM.Routes>
    );
};


const App: React.FC = () => {
  return (
    <InternalAuthProvider>
      <CitizenAuthProvider>
        <ReactRouterDOM.HashRouter>
            <AppRoutes />
        </ReactRouterDOM.HashRouter>
      </CitizenAuthProvider>
    </InternalAuthProvider>
  );
};

export default App;
