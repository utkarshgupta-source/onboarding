import TelemetryPanel from "./TelemetryPanel";
import ControlPanel from "./ControlPanel";
import CesiumMap from "./CesiumMap";
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Menu, 
  Plus
} from 'lucide-react';
const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEcommerceOpen, setIsEcommerceOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleEcommerce = () => setIsEcommerceOpen(!isEcommerceOpen);

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        type="button"
        className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <aside
        id="cta-button-sidebar"
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } sm:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 border-r border-gray-200">
          <ul className="space-y-2 font-medium">
            <SidebarItem href="#" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          </ul>
            <TelemetryPanel />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="p-4 sm:ml-64">
            <CesiumMap />  
            <br/>        
        <ControlPanel />
        </div>
    </div>
  );
};

// --- Helper Sub-Components ---

const SidebarItem = ({ href, icon, label, badge, count }) => (
  <li>
    <a href={href} className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
      <span className="text-gray-500 group-hover:text-gray-900">{icon}</span>
      <span className="flex-1 ms-3 whitespace-nowrap">{label}</span>
      {badge && (
        <span className="inline-flex items-center justify-center px-2 ms-3 text-sm font-medium text-gray-800 bg-gray-200 rounded-full">
          {badge}
        </span>
      )}
      {count && (
        <span className="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
          {count}
        </span>
      )}
    </a>
  </li>
);


export default DashboardLayout;