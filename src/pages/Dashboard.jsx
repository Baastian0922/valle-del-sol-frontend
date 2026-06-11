import React from 'react';
import { useAuth } from '../context/AuthContext'; // ◄ Un solo nivel hacia atrás
import AdminDashboard from './dashboards/AdminDashboard';
import StaffDashboard from './dashboards/StaffDashboard';
import EntidadDashboard from './dashboards/EntidadDashboard';
import VecinoDashboard from './dashboards/VecinoDashboard';

function Dashboard() {
  const { user, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500 font-bold uppercase tracking-widest animate-pulse">
        Cargando Consola Operativa...
      </div>
    );
  }

  // Switch de enrutamiento dinámico según el Rol real del usuario
  switch (user?.role) {
    case 'ADMIN':
      return <AdminDashboard />;
      
    case 'STAFF':
      return <StaffDashboard />;
      
    case 'EMERGENCY_ENTITY':
      return <EntidadDashboard />;
      
    case 'USER':
    default:
      return <VecinoDashboard />;
  }
}

export default Dashboard;