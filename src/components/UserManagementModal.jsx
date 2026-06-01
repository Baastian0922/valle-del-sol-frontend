import React, { useState } from 'react';
import { X, UserPlus, Users, Trash2, ToggleLeft, ToggleRight, Shield, ShieldAlert, HeartHandshake, Pencil } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserManagementModal = ({ mostrar, setMostrar }) => {
  const { usuarios, crearUsuario, editarUsuario, eliminarUsuario, alternarEstadoUsuario } = useAuth();
  
  // Modos de formulario
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  // Campos de formulario
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('USER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!mostrar) return null;

  const handleEditarClick = (u) => {
    setUsuarioEditando(u);
    setFullName(u.fullName);
    setUsername(u.username);
    setEmail(u.email || '');
    setRole(u.role);
    setPassword(''); // dejar en blanco para conservar contraseña anterior
    setError('');
    setSuccess('');
  };

  const cancelarEdicion = () => {
    setUsuarioEditando(null);
    setFullName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('USER');
    setError('');
    setSuccess('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim() || !fullName.trim() || !email.trim()) {
      setError('Por favor completa todos los campos obligatorios (Nombre, Usuario y Correo).');
      return;
    }

    // Validar formato de correo básico
    if (!email.includes('@') || !email.includes('.')) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    // Validar si el usuario ya existe (excluyendo al usuario editado)
    const existe = usuarios.some(u => 
      u.username.toLowerCase() === username.toLowerCase().trim() && 
      (!usuarioEditando || u.id !== usuarioEditando.id)
    );
    if (existe) {
      setError('El nombre de usuario ya está tomado.');
      return;
    }

    // Validar si el correo ya existe (excluyendo al usuario editado)
    const emailExiste = usuarios.some(u => 
      u.email && u.email.toLowerCase() === email.toLowerCase().trim() && 
      (!usuarioEditando || u.id !== usuarioEditando.id)
    );
    if (emailExiste) {
      setError('El correo electrónico ya está registrado.');
      return;
    }

    // Validar contraseña si se ingresa una
    if (password.trim()) {
      if (password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres.');
        return;
      }
      if (!/[A-Z]/.test(password)) {
        setError('La contraseña debe incluir al menos una letra mayúscula.');
        return;
      }
      if (!/[a-z]/.test(password)) {
        setError('La contraseña debe incluir al menos una letra minúscula.');
        return;
      }
      if (!/[0-9]/.test(password)) {
        setError('La contraseña debe incluir al menos un número.');
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        setError('La contraseña debe incluir al menos un símbolo especial (ej: !, @, #, $, %, &, *).');
        return;
      }
    }

    try {
      if (usuarioEditando) {
        // Modo Edición
        const datosActualizados = {
          username: username.trim().toLowerCase(),
          fullName: fullName.trim(),
          role: role,
          email: email.trim().toLowerCase()
        };
        
        // Si ingresó contraseña nueva, la actualizamos
        if (password.trim()) {
          datosActualizados.password = password.trim();
        }

        editarUsuario(usuarioEditando.id, datosActualizados);
        setSuccess('¡Usuario actualizado exitosamente!');
        
        // Limpiar y resetear formulario
        cancelarEdicion();
      } else {
        // Modo Creación
        crearUsuario({
          username: username.trim().toLowerCase(),
          fullName: fullName.trim(),
          role: role,
          email: email.trim().toLowerCase(),
          password: password.trim() || 'ValleSol2026!'
        });
        setSuccess('¡Usuario creado exitosamente!');
        setUsername('');
        setFullName('');
        setEmail('');
        setPassword('');
        setRole('USER');
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(usuarioEditando ? 'Error al actualizar usuario.' : 'Error al crear usuario.');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="flex items-center gap-1 text-[9px] font-black text-red-500 border border-red-500/20 bg-red-500/10 px-2.5 py-1 rounded-full uppercase tracking-widest shrink-0">
            <ShieldAlert size={10} /> Admin
          </span>
        );
      case 'STAFF':
        return (
          <span className="flex items-center gap-1 text-[9px] font-black text-amber-500 border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 rounded-full uppercase tracking-widest shrink-0">
            <Shield size={10} /> Staff / Seguridad
          </span>
        );
      case 'EMERGENCY_ENTITY':
        return (
          <span className="flex items-center gap-1 text-[9px] font-black text-blue-400 border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 rounded-full uppercase tracking-widest shrink-0">
            <Shield size={10} /> Emergencias
          </span>
        );
      case 'USER':
      default:
        return (
          <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 rounded-full uppercase tracking-widest shrink-0">
            <HeartHandshake size={10} /> Vecino
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-[2.5rem] p-8 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-red-600/10 text-red-500 p-2.5 rounded-2xl border border-red-500/20">
              <Users size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Gestión de Usuarios</h2>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest italic">Administración de perfiles y seguridad RBAC</p>
            </div>
          </div>
          <button onClick={() => setMostrar(false)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-full text-slate-400 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Contenido dividido en 2 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 overflow-hidden flex-1">
          
          {/* Formulario de Creación / Edición (Col 2/5) */}
          <div className="md:col-span-2 space-y-3 border-r border-slate-800/50 pr-6 flex flex-col overflow-y-auto">
            <h3 className="font-bold text-white uppercase tracking-widest text-xs flex items-center gap-2 italic">
              {usuarioEditando ? (
                <>
                  <Pencil size={14} className="text-amber-500" /> Editar Usuario: @{usuarioEditando.username}
                </>
              ) : (
                <>
                  <UserPlus size={14} className="text-red-500" /> Crear Usuario
                </>
              )}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 flex-1 pr-1">
              {error && <div className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl uppercase font-black tracking-wider">{error}</div>}
              {success && <div className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl uppercase font-black tracking-wider">{success}</div>}

              <div>
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2 italic">Nombre Completo *</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Juan Pérez o Seguridad Ciudadana 1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-red-600 transition-all font-bold"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2 italic">Nombre de Usuario * (Login)</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej: seguridad.sol"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-red-600 transition-all font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2 italic">Correo Electrónico *</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ej: seguridad@valledelsol.cl"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-red-600 transition-all font-bold"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2 italic">
                  {usuarioEditando 
                    ? "Contraseña (Vacío para conservar actual)" 
                    : "Contraseña (Por defecto: ValleSol2026!)"}
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={usuarioEditando ? "Dejar vacío para no cambiar" : "••••••••"}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-red-650 transition-all"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2 italic">Rol del Sistema</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-red-650 transition-all font-bold"
                >
                  <option value="USER">USER (Comunidad / Vecino)</option>
                  <option value="STAFF">STAFF (Seguridad Ciudadana Municipal)</option>
                  <option value="EMERGENCY_ENTITY">EMERGENCY_ENTITY (Bomberos, Carabineros, etc.)</option>
                  <option value="ADMIN">ADMIN (Acceso Total)</option>
                </select>
              </div>

              {usuarioEditando ? (
                <div className="grid grid-cols-2 gap-2 mt-4 pt-2">
                  <button 
                    type="submit" 
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-2.5 rounded-xl uppercase tracking-widest text-[9px] shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    Guardar
                  </button>
                  <button 
                    type="button" 
                    onClick={cancelarEdicion}
                    className="w-full bg-slate-950 hover:bg-slate-800 text-slate-400 font-black py-2.5 rounded-xl uppercase tracking-widest text-[9px] border border-slate-800 transition-all flex items-center justify-center"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-2.5 rounded-xl uppercase tracking-widest text-[9px] shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <UserPlus size={14} /> Registrar Usuario
                </button>
              )}
            </form>
          </div>

          {/* Listado de Usuarios Existentes (Col 3/5) */}
          <div className="md:col-span-3 flex flex-col overflow-hidden">
            <h3 className="font-bold text-white uppercase tracking-widest text-xs mb-4 flex items-center gap-2 italic">
              <Users size={14} className="text-red-500" /> Usuarios Registrados ({usuarios.length})
            </h3>

            <div className="space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {usuarios.map((u) => (
                <div 
                  key={u.id}
                  className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl flex items-center justify-between gap-4 hover:border-slate-700/50 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white tracking-tight truncate">{u.fullName}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <p className="text-[10px] text-slate-500 font-mono">@{u.username}</p>
                      {u.email && <p className="text-[9px] text-slate-600 truncate font-sans">({u.email})</p>}
                      {getRoleBadge(u.role)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Button Editar */}
                    <button 
                      onClick={() => handleEditarClick(u)}
                      title="Editar Perfil"
                      className="p-1.5 rounded-lg border border-slate-800 hover:border-amber-500/30 text-slate-500 hover:text-amber-500 bg-slate-950 transition-all"
                    >
                      <Pencil size={14} />
                    </button>

                    {/* Toggle Active */}
                    <button 
                      onClick={() => alternarEstadoUsuario(u.id)}
                      title={u.active ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                      className={`p-1.5 rounded-lg border transition-all ${u.active ? 'text-emerald-500 border-emerald-500/10 bg-emerald-500/5' : 'text-slate-600 border-slate-800 bg-slate-950'}`}
                    >
                      {u.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>

                    {/* Delete */}
                    <button 
                      onClick={() => {
                        if (u.username === 'admin') {
                          alert("No puedes eliminar la cuenta de administrador maestra.");
                          return;
                        }
                        if (confirm(`¿Eliminar permanentemente a @${u.username}?`)) {
                          eliminarUsuario(u.id);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-slate-800 hover:border-red-500/30 text-slate-500 hover:text-red-500 bg-slate-950 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default UserManagementModal;
