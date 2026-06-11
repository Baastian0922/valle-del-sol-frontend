import React, { createContext, useContext, useState, useEffect } from 'react';

// ── Firebase Real ─────────────────────────────────────────────────────────────
import { auth, db } from '../services/firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

// Mantenemos tu base de datos simulada para tus tablas internas
const DEFAULT_USERS = [
  { id: 1, username: 'admin', email: 'admin@valledelsol.cl', password: '123', fullName: 'Bastián Mauricio (Admin)', role: 'ADMIN', active: true },
  { id: 2, username: 'bombero', email: 'bomberos@valledelsol.cl', password: '123', fullName: 'Cuerpo Bomberos Linares', role: 'EMERGENCY_ENTITY', active: true },
  { id: 3, username: 'vecino', email: 'vecino@gmail.com', password: '123', fullName: 'Juan Vecino - Comunidad', role: 'USER', active: true }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inicializamos el estado directamente desde LocalStorage
  const [usuarios, setUsuarios] = useState(() => {
    const storedUsers = localStorage.getItem('valle_sol_usuarios');
    if (storedUsers) {
      try {
        return JSON.parse(storedUsers);
      } catch (errorStorage) {
        console.warn("Aviso: Cargando usuarios por defecto debido a:", errorStorage.message);
        return DEFAULT_USERS;
      }
    } else {
      localStorage.setItem('valle_sol_usuarios', JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
  });

  // ── Escucha Activa de Firebase ─────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, 'usuarios', currentUser.uid);
          const docSnap = await getDoc(docRef);

          let roleForDashboard = null;
          let datosAdicionales = {};

          if (docSnap.exists()) {
            datosAdicionales = docSnap.data();
            const rawRole = datosAdicionales?.rol || datosAdicionales?.role || '';

            const diccionarioRoles = {
              admin: 'ADMIN',
              vecino: 'USER',
              comunidad: 'USER',
              entidad: 'EMERGENCY_ENTITY',
              emergencia: 'EMERGENCY_ENTITY',
              bombero: 'EMERGENCY_ENTITY',
              carabinero: 'EMERGENCY_ENTITY',
              ambulancia: 'EMERGENCY_ENTITY',
              municipalidad: 'EMERGENCY_ENTITY'
            };

            roleForDashboard = diccionarioRoles[rawRole.toLowerCase()] || rawRole;
          }

          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            role: roleForDashboard,
            fullName: datosAdicionales?.nombre || currentUser.displayName || 'Usuario Municipal',
            institucion: datosAdicionales?.institucion || 'general',
            ...datosAdicionales
          });
        } catch (error) {
          console.error("Error al obtener el rol de Firestore:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Guardar usuarios locales ───────────────────────────────────────────────
  const guardarUsuarios = (nuevosUsuarios) => {
    setUsuarios(nuevosUsuarios);
    localStorage.setItem('valle_sol_usuarios', JSON.stringify(nuevosUsuarios));
  };

  // ── Cierre de Sesión Real con Firebase ──────────────────────────────────────
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión en Firebase:", error);
    }
  };

  // ── Tu CRUD de Usuarios Local ──────────────────────────────────────────────
  const crearUsuario = (nuevoUser) => {
    const userObj = {
      id: usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1,
      ...nuevoUser,
      active: true
    };
    const actualizados = [...usuarios, userObj];
    guardarUsuarios(actualizados);
    return userObj;
  };

  const eliminarUsuario = (id) => {
    const actualizados = usuarios.filter(u => u.id !== id);
    guardarUsuarios(actualizados);
  };

  const editarUsuario = (id, datosActualizados) => {
    const actualizados = usuarios.map(u =>
      u.id === id ? { ...u, ...datosActualizados } : u
    );
    guardarUsuarios(actualizados);
  };

  const alternarEstadoUsuario = (id) => {
    const actualizados = usuarios.map(u =>
      u.id === id ? { ...u, active: !u.active } : u
    );
    guardarUsuarios(actualizados);
  };

  return (
    <AuthContext.Provider value={{
      user,
      usuarios,
      loading,
      cargando: loading,
      logout,
      crearUsuario,
      editarUsuario,
      eliminarUsuario,
      alternarEstadoUsuario
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// 🔥 LA SOLUCIÓN AQUÍ: Esta línea le dice a Vite que ignore la advertencia de HMR en esta función específica
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}