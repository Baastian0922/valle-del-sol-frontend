import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db, firebaseConfig } from '../services/firebase-config';
import { UserPlus, Shield, Trash2, Edit2, ToggleLeft, X } from 'lucide-react';

export default function UserManagement() {
  // Estados para la lista de usuarios de Firestore
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [loadingTabla, setLoadingTabla] = useState(true);

  // Estados para el formulario de creacion de acuerdo a la interfaz
  const [nombre, setNombre] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('VALLESOL2026!');
  const [rol, setRol] = useState('USER');
  
  const [errorForm, setErrorForm] = useState('');
  const [exitoForm, setExitoForm] = useState('');
  const [creando, setCreando] = useState(false);

  // Funcion secundaria para refrescar la lista despues de mutaciones directas
  const cargarUsuariosReal = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'usuarios'));
      const docs = [];
      querySnapshot.forEach((documento) => {
        docs.push({ uid: documento.id, ...documento.data() });
      });
      setListaUsuarios(docs);
    } catch (error) {
      console.error("Error al consultar usuarios en Firestore:", error);
    } finally {
      setLoadingTabla(false);
    }
  };

  // Solucion definitiva al warning del linter utilizando una rutina asincrona interna
  useEffect(() => {
    let mtDocActivo = true;

    const sincronizarGenteAlMontar = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'usuarios'));
        const docs = [];
        querySnapshot.forEach((documento) => {
          docs.push({ uid: documento.id, ...documento.data() });
        });
        
        if (mtDocActivo) {
          setListaUsuarios(docs);
        }
      } catch (error) {
        console.error("Error en la consulta inicial de perfiles:", error);
      } finally {
        if (mtDocActivo) {
          setLoadingTabla(false);
        }
      }
    };

    sincronizarGenteAlMontar();

    return () => {
      mtDocActivo = false;
    };
  }, []);

  // Handler para registrar nuevos usuarios sin interrumpir la sesion del administrador
  const handleRegistrarUsuario = async (e) => {
    e.preventDefault();
    setErrorForm('');
    setExitoForm('');

    if (!nombre || !username || !email || !password) {
      setErrorForm('Por favor, completa todos los campos obligatorios.');
      return;
    }

    setCreando(true);

    const appTemporal = initializeApp(firebaseConfig, "TemporalAdminApp");
    const authTemporal = getAuth(appTemporal);

    try {
      const credencial = await createUserWithEmailAndPassword(authTemporal, email.trim(), password);
      const nuevoUid = credencial.user.uid;

      const nuevoUsuarioDoc = {
        nombre: nombre.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim(),
        rol: rol,
        institucion: rol === 'EMERGENCY_ENTITY' ? 'bomberos' : 'general',
        fechaCreacion: new Date().toISOString()
      };

      await setDoc(doc(db, 'usuarios', nuevoUid), nuevoUsuarioDoc);

      setExitoForm('Usuario registrado y enlazado correctamente.');
      
      // Limpieza de estados del formulario
      setNombre('');
      setUsername('');
      setEmail('');
      setPassword('VALLESOL2026!');
      setRol('USER');

      await cargarUsuariosReal();

    } catch (error) {
      console.error("Error en el proceso de registro:", error);
      if (error.code === 'auth/email-already-in-use') {
        setErrorForm('Este correo electronico ya esta registrado.');
      } else {
        setErrorForm(error.message);
      }
    } finally {
      await appTemporal.delete();
      setCreando(false);
    }
  };

  const handleEliminarUsuario = async (uid, nombreUser) => {
    if (window.confirm(`¿Estas seguro de eliminar a ${nombreUser}?`)) {
      try {
        await deleteDoc(doc(db, 'usuarios', uid));
        setListaUsuarios(listaUsuarios.filter(u => u.uid !== uid));
      } catch (error) {
        console.error("Error al eliminar documento:", error);
      }
    }
  };

  // Helper para normalizar y pintar los Badges de acuerdo a tu base de datos
  const renderBadgeRol = (rolRaw) => {
    const r = rolRaw ? rolRaw.toUpperCase().trim() : 'USER';
    
    if (r === 'ADMIN' || r === 'ADMINISTRADOR') {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-black bg-red-950/60 text-red-400 border border-red-900/50 uppercase tracking-widest">
          ADMIN
        </span>
      );
    }
    if (r === 'EMERGENCY_ENTITY' || r === 'ENTIDAD' || r === 'ENTIDAD DE EMERGENCIA' || r === 'EMERGENCIAS') {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] font-black bg-blue-950/60 text-blue-400 border border-blue-900/50 uppercase tracking-widest">
          EMERGENCIAS
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-950/60 text-emerald-400 border border-emerald-900/50 uppercase tracking-widest">
        VECINO
      </span>
    );
  };

  return (
    <div className="bg-slate-950 p-4 flex items-center justify-center font-sans">
      <div className="w-full max-w-6xl bg-[#0f131c] border border-slate-900 rounded-[2rem] p-8 relative shadow-2xl">
        
        {/* Boton cerrar superior derecho */}
        <button className="absolute top-6 right-6 w-10 h-10 bg-slate-950 border border-slate-900 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <X size={18} />
        </button>

        {/* Encabezado del Modal */}
        <div className="flex items-center gap-4 mb-8 border-b border-slate-900 pb-6">
          <div className="w-12 h-12 bg-red-950/40 border border-red-900/30 rounded-2xl flex items-center justify-center text-red-500">
            <Shield size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white italic">Gestión de Usuarios</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-0.5">Administración de Perfiles y Seguridad RBAC</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUMNA IZQUIERDA: Formulario Crear Usuario */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">
              <UserPlus size={16} className="text-red-500" />
              <span>Crear Usuario</span>
            </div>

            {errorForm && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-semibold">{errorForm}</div>}
            {exitoForm && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs font-semibold">{exitoForm}</div>}

            <form onSubmit={handleRegistrarUsuario} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Completo *</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Juan Pérez o Seguridad Ciudadana 1" className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-red-600 transition-colors font-semibold" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre de Usuario * (Login)</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ej: seguridad.sol" className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-red-600 transition-colors font-semibold" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ej: seguridad@valledelsol.cl" className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-red-600 transition-colors font-semibold" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña (Por defecto: VALLESOL2026!)</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition-colors" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rol del Sistema</label>
                <select value={rol} onChange={(e) => setRol(e.target.value)} className="w-full bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition-colors font-bold uppercase tracking-wider">
                  <option value="USER">USER (Comunidad / Vecino)</option>
                  <option value="EMERGENCY_ENTITY">EMERGENCY_ENTITY (Bomberos / Emergencias)</option>
                  <option value="ADMIN">ADMIN (Administrador Maestro)</option>
                </select>
              </div>

              <button type="submit" disabled={creando} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-950 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all shadow-lg shadow-red-600/10 flex items-center justify-center gap-2 mt-2">
                <UserPlus size={16} />
                <span>{creando ? 'Registrando...' : 'Registrar Usuario'}</span>
              </button>
            </form>
          </div>

          {/* COLUMNA DERECHA: Lista de Usuarios en tiempo real */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">
              <Shield size={16} className="text-red-500" />
              <span>Usuarios Registrados ({listaUsuarios.length})</span>
            </div>

            {loadingTabla ? (
              <div className="text-center py-12 text-slate-600 text-xs font-bold uppercase tracking-widest animate-pulse">
                Sincronizando con base de datos...
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar">
                {listaUsuarios.map((u) => (
                  <div key={u.uid} className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl flex items-center justify-between transition-all hover:border-slate-800">
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-black text-white tracking-tight">
                        {u.nombre}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-600 font-mono text-xs">
                          @{u.username || (u.email ? u.email.split('@')[0] : 'usuario')}
                        </span>
                        <span className="text-slate-500 font-mono text-xs">
                          ({u.email})
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {renderBadgeRol(u.rol)}
                      
                      <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-900">
                        <button className="text-slate-600 hover:text-white p-2 rounded-lg transition-colors" title="Editar perfil">
                          <Edit2 size={15} />
                        </button>
                        <button className="text-emerald-600 hover:text-emerald-400 p-2 rounded-lg transition-colors" title="Estado activo">
                          <ToggleLeft size={18} />
                        </button>
                        <button onClick={() => handleEliminarUsuario(u.uid, u.nombre)} className="text-slate-600 hover:text-red-400 p-2 rounded-lg transition-colors" title="Eliminar de Firestore">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {listaUsuarios.length === 0 && (
                  <div className="text-center py-12 text-slate-600 text-xs font-bold uppercase tracking-widest">
                    No hay usuarios en la coleccion de Firestore.
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}