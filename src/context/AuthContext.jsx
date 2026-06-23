import React, { createContext, useContext, useState, useEffect } from 'react';

// ── Firebase Real ─────────────────────────────────────────────────────────────
import { auth, db } from '../services/firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// ── Servicio de Administración de Usuarios Firebase ──────────────────────────
import {
  crearUsuarioFirebase,
  editarUsuarioFirebase,
  eliminarUsuarioFirebase,
  alternarEstadoUsuarioFirebase,
  escucharUsuariosFirebase,
  traducirErrorFirebase
} from '../services/firebase-admin-service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Lista de usuarios desde Firestore (reemplaza localStorage) ─────────────
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);

  // ── Escucha Activa de Firebase Auth (sesión del usuario actual) ─────────────
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

            // Bloquear e invalidar sesión si la cuenta está inactiva/pendiente
            if (datosAdicionales?.activo === false || datosAdicionales?.active === false) {
              await signOut(auth);
              setUser(null);
              setLoading(false);
              return;
            }

            const rawRole = datosAdicionales?.rol || datosAdicionales?.role || '';
            const rolNormalizado = rawRole.toLowerCase().trim();

            if (rolNormalizado !== 'staff' && rolNormalizado !== 'admin' && !currentUser.emailVerified) {
              // El usuario está en Firebase pero no ha verificado su correo.
              // No seteamos el user en el contexto para bloquear el acceso al dashboard.
              setUser(null);
              setLoading(false);
              return;
            }

            const diccionarioRoles = {
              admin: 'ADMIN',
              vecino: 'USER',
              user: 'USER',
              comunidad: 'USER',
              entidad: 'EMERGENCY_ENTITY',
              emergencia: 'EMERGENCY_ENTITY',
              bombero: 'EMERGENCY_ENTITY',
              carabinero: 'EMERGENCY_ENTITY',
              ambulancia: 'EMERGENCY_ENTITY',
              municipalidad: 'EMERGENCY_ENTITY',
              emergency_entity: 'EMERGENCY_ENTITY',
              staff: 'STAFF'
            };

            roleForDashboard = diccionarioRoles[rolNormalizado] || rawRole;
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

  // ── Listener en tiempo real de la colección 'usuarios' en Firestore ────────
  // Se activa cuando hay un usuario logueado (para el panel de administración)
  useEffect(() => {
    if (!user) {
      const resetTimer = setTimeout(() => {
        setUsuarios([]);
        setCargandoUsuarios(false);
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    const loadingTimer = setTimeout(() => {
      setCargandoUsuarios(true);
    }, 0);

    const unsubscribe = escucharUsuariosFirebase((listaUsuarios) => {
      setUsuarios(listaUsuarios);
      setCargandoUsuarios(false);
    });

    return () => {
      clearTimeout(loadingTimer);
      unsubscribe();
    };
  }, [user]);

  // ── Cierre de Sesión Real con Firebase ──────────────────────────────────────
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión en Firebase:", error);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // CRUD de Usuarios — Ahora conectado a Firebase Auth + Firestore
  // ══════════════════════════════════════════════════════════════════════════════

  /**
   * Crea un usuario nuevo en Firebase Auth y su perfil en Firestore.
   * @throws {Error} Si el correo ya existe o hay un error de Firebase.
   */
  const crearUsuario = async (nuevoUser) => {
    const email = nuevoUser.email?.trim().toLowerCase();
    const password = nuevoUser.password?.trim() || 'ValleSol2026!';

    const resultado = await crearUsuarioFirebase(email, password, {
      fullName: nuevoUser.fullName,
      username: nuevoUser.username,
      role: nuevoUser.role,
      institucion: nuevoUser.institucion || 'general'
    });

    // La lista se actualiza automáticamente via el listener onSnapshot
    return resultado;
  };

  /**
   * Edita el perfil de un usuario en Firestore.
   * Nota: No puede cambiar la contraseña de Auth desde el frontend.
   */
  const editarUsuario = async (uid, datosActualizados) => {
    await editarUsuarioFirebase(uid, datosActualizados);
    // La lista se actualiza automáticamente via el listener onSnapshot
  };

  /**
   * Elimina el perfil de un usuario de Firestore.
   * La cuenta de Auth sigue existiendo pero sin perfil no puede usar el sistema.
   */
  const eliminarUsuario = async (uid) => {
    await eliminarUsuarioFirebase(uid);
    // La lista se actualiza automáticamente via el listener onSnapshot
  };

  /**
   * Alterna el estado activo/inactivo de un usuario en Firestore.
   */
  const alternarEstadoUsuario = async (uid) => {
    const usuario = usuarios.find(u => u.id === uid);
    if (!usuario) return;
    await alternarEstadoUsuarioFirebase(uid, usuario.active);
    // La lista se actualiza automáticamente via el listener onSnapshot
  };

  return (
    <AuthContext.Provider value={{
      user,
      usuarios,
      loading,
      cargando: loading,
      cargandoUsuarios,
      logout,
      crearUsuario,
      editarUsuario,
      eliminarUsuario,
      alternarEstadoUsuario,
      traducirErrorFirebase
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
