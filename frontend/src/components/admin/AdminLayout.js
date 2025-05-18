import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarExpanded(prev => !prev);
  };
  
  return (
    <div className={`admin-layout ${sidebarExpanded ? '' : 'sidebar-collapsed'}`}>
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader toggleSidebar={toggleSidebar} />
        <div className="admin-content">
          {children}
        </div>
      </div>
      
      {/* Overlay for mobile sidebar */}
      <div 
        className={`admin-sidebar-overlay ${sidebarExpanded ? 'visible' : ''}`} 
        onClick={toggleSidebar}
      />
    </div>
  );
};

export default AdminLayout; 