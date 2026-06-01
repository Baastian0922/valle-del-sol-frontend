import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Base de datos de usuarios por defecto (en caso de que localstorage esté vacío)
const DEFAULT_USERS = [
  { id: 1, username: 'admin', email: 'admin@valledelsol.cl', password: '123', fullName: 'Bastián Mauricio (Admin)', role: 'ADMIN', active: true },
  { id: 2, username: 'bombero', email: 'bomberos@valledelsol.cl', password: '123', fullName: 'Cuerpo Bomberos Linares', role: 'EMERGENCY_ENTITY', active: true },
  { id: 3, username: 'vecino', email: 'vecino@gmail.com', password: '123', fullName: 'Juan Vecino - Comunidad', role: 'USER', active: true }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [usuarios, setUsuarios] = useState([]);

  // Cargar sesión y lista de usuarios del LocalStorage al iniciar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          setUser(payload);
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        localStorage.removeItem('token');
      }
    }

    const storedUsers = localStorage.getItem('valle_sol_usuarios');
    if (storedUsers) {
      setUsuarios(JSON.parse(storedUsers));
    } else {
      setUsuarios(DEFAULT_USERS);
      localStorage.setItem('valle_sol_usuarios', JSON.stringify(DEFAULT_USERS));
    }

    setCargando(false);
  }, []);

  // Guardar usuarios en LocalStorage cuando cambien
  const guardarUsuarios = (nuevosUsuarios) => {
    setUsuarios(nuevosUsuarios);
    localStorage.setItem('valle_sol_usuarios', JSON.stringify(nuevosUsuarios));
  };

  // Simulación de Login inteligente con token JWT simulado
  const login = async (usernameOrEmail, password) => {
    // Buscar usuario en la lista por username o email
    const uFound = usuarios.find(u => 
      (u.username.toLowerCase() === usernameOrEmail.toLowerCase() || 
       (u.email && u.email.toLowerCase() === usernameOrEmail.toLowerCase())) 
      && u.active
    );
    
    if (!uFound) {
      throw new Error("Usuario no encontrado o inactivo");
    }

    // Validar contraseña
    if (uFound.password && uFound.password !== password) {
      throw new Error("Contraseña incorrecta");
    }

    // Crear un JWT simulado
    const payload = {
      id: uFound.id,
      username: uFound.username,
      email: uFound.email,
      fullName: uFound.fullName,
      role: uFound.role,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 horas
    };

    const tokenHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const tokenPayload = btoa(JSON.stringify(payload));
    const tokenSignature = 'simulated_signature';
    const jwt = `${tokenHeader}.${tokenPayload}.${tokenSignature}`;

    localStorage.setItem('token', jwt);
    setUser(payload);
    return payload;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // CRUD de Usuarios por Admin
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
      cargando, 
      login, 
      logout,
      crearUsuario,
      editarUsuario,
      eliminarUsuario,
      alternarEstadoUsuario
    }}>
      {!cargando && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
