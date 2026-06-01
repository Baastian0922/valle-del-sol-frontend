import React from 'react';
import { useAuth } from '../context/AuthContext';
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

  // Switch de enrutamiento dinámico según el Rol del usuario
  switch (user?.role) {
    case 'ADMIN':
      return <AdminDashboard />;
      
    case 'STAFF':
      // Panel especial para guardias municipales (Seguridad Ciudadana) sin control de usuarios
      return <StaffDashboard />;
      
    case 'EMERGENCY_ENTITY':
      // Panel especial táctico para Bomberos, Carabineros, CONAF
      return <EntidadDashboard />;
      
    case 'USER':
    default:
      // Portal comunitario para Vecinos
      return <VecinoDashboard />;
  }
}

export default Dashboard;