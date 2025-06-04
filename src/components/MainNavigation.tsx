import React from 'react';
import { Building, Mail, Users, Calendar, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface TabButtonProps {
  tab: string;
  label: string;
  icon: React.ElementType;
  count?: number;
  to?: string;
}

const TabButton = ({ tab, label, icon: Icon, count, to }: TabButtonProps) => {
  const location = useLocation();
  const isActive = to ? location.pathname === to : false;
  const buttonContent = (
    <>
      <Icon size={18} />
      {label}
      {count && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{count}</span>}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          isActive 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {buttonContent}
    </button>
  );
};

interface MainNavigationProps {
  propertiesCount?: number;
  leadsCount?: number;
  clientsCount?: number;
  followUpsCount?: number;
}

const MainNavigation = ({ 
  propertiesCount = 0, 
  leadsCount = 0, 
  clientsCount = 0, 
  followUpsCount = 0 
}: MainNavigationProps) => {
  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">CRE Agent Dashboard</h1>
            <div className="flex items-center gap-4">
              <Bell className="text-gray-500 cursor-pointer hover:text-gray-700" size={20} />
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                A
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 py-4 bg-white border-b">
        <div className="flex gap-2 overflow-x-auto">
          <TabButton tab="overview" label="Overview" icon={Building} to="/" />
          <TabButton tab="properties" label="Properties" icon={Building} count={propertiesCount} to="/properties" />
          <TabButton tab="leads" label="Email Leads" icon={Mail} count={leadsCount} to="/leads" />
          <TabButton tab="clients" label="Clients" icon={Users} count={clientsCount} to="/clients" />
          <TabButton tab="followups" label="Follow-ups" icon={Calendar} count={followUpsCount} to="/followups" />
        </div>
      </div>
    </>
  );
};

export default MainNavigation; 