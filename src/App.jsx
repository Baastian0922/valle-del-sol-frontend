import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* 1. La portada principal: Siempre se muestra al entrar a la raiz de la app */}
          <Route path="/" element={<LandingPage />} />
          
          {/* 2. Rutas de autenticacion y registro */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 3. El panel operativo: Recibe tanto a invitados como a usuarios logueados */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* 4. Redireccion de seguridad: Si alguien escribe una URL que no existe, vuelve a la portada */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}