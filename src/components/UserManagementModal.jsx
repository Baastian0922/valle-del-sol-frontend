import React, { useState } from 'react';
import { X, UserPlus, Users, Trash2, ToggleLeft, ToggleRight, Shield, ShieldAlert, HeartHandshake, Pencil, Loader2, CloudOff, Database, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserManagementModal = ({ mostrar, setMostrar }) => {
  const {
    usuarios, cargandoUsuarios,
    crearUsuario, editarUsuario, eliminarUsuario, alternarEstadoUsuario,
    traducirErrorFirebase
  } = useAuth();

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

  // Estado de carga para operaciones async
  const [cargandoAccion, setCargandoAccion] = useState(false);

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

  // ── Submit Handler (ahora async para Firebase) ─────────────────────────────
  const handleSubmit = async (e) => {
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
      u.username?.toLowerCase() === username.toLowerCase().trim() &&
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

    // Validar contraseña solo al crear usuario nuevo (obligatoria) o si se ingresa al editar
    if (!usuarioEditando && !password.trim()) {
      // Si no se ingresa contraseña al crear, se usará la por defecto
    }

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
      if (!/[!@#$%^&*(),.?"':{}|<>]/.test(password)) {
        setError('La contraseña debe incluir al menos un símbolo especial (ej: !, @, #, $, %, &, *).');
        return;
      }
    }

    setCargandoAccion(true);

    try {
      if (usuarioEditando) {
        // ── Modo Edición ─────────────────────────────────────────────────────
        const datosActualizados = {
          username: username.trim().toLowerCase(),
          fullName: fullName.trim(),
          role: role,
          email: email.trim().toLowerCase()
        };

        await editarUsuario(usuarioEditando.id, datosActualizados);
        setSuccess('¡Usuario actualizado exitosamente en Firebase!');

        // Limpiar y resetear formulario
        cancelarEdicion();
      } else {
        // ── Modo Creación ────────────────────────────────────────────────────
        await crearUsuario({
          username: username.trim().toLowerCase(),
          fullName: fullName.trim(),
          role: role,
          email: email.trim().toLowerCase(),
          password: password.trim() || 'ValleSol2026!'
        });
        setSuccess('¡Usuario creado exitosamente en Firebase! Ya puede iniciar sesión.');
        setUsername('');
        setFullName('');
        setEmail('');
        setPassword('');
        setRole('USER');
      }

      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error("Error en operación de usuario Firebase:", err);
      setError(traducirErrorFirebase(err));
    } finally {
      setCargandoAccion(false);
    }
  };

  // ── Handlers async para acciones de la lista ───────────────────────────────
  const handleEliminar = async (u) => {
    if (u.role === 'ADMIN') {
      alert("No puedes eliminar una cuenta de administrador.");
      return;
    }
    if (!confirm(`¿Eliminar permanentemente a @${u.username} de Firebase?`)) return;

    setCargandoAccion(true);
    try {
      await eliminarUsuario(u.id);
      setSuccess(`Usuario @${u.username} eliminado de Firebase.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      setError(traducirErrorFirebase(err));
    } finally {
      setCargandoAccion(false);
    }
  };

  const handleToggleEstado = async (u) => {
    setCargandoAccion(true);
    try {
      await alternarEstadoUsuario(u.id);
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      setError(traducirErrorFirebase(err));
    } finally {
      setCargandoAccion(false);
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
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest italic flex items-center gap-1.5">
                <Database size={10} className="text-amber-500" /> Conectado a Firebase Firestore — Datos en la Nube
              </p>
            </div>
          </div>
          <button onClick={() => setMostrar(false)} className="bg-slate-950 border border-slate-800 p-2.5 rounded-full text-slate-400 hover:text-white transition-all" disabled={cargandoAccion}>
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
                  disabled={cargandoAccion}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-red-600 transition-all font-bold disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2 italic">Nombre de Usuario * (Identificador)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej: seguridad.sol"
                  disabled={cargandoAccion}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-red-600 transition-all font-mono font-bold disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2 italic">Correo Electrónico * (Login Firebase)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ej: seguridad@valledelsol.cl"
                  disabled={cargandoAccion || !!usuarioEditando}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-red-600 transition-all font-bold disabled:opacity-50"
                />
                {usuarioEditando && (
                  <p className="text-[8px] text-amber-500/70 ml-2 mt-1 italic">
                    El correo de login no se puede cambiar desde el panel (limitación de Firebase Auth).
                  </p>
                )}
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2 italic">
                  {usuarioEditando
                    ? "Contraseña (No editable desde el panel)"
                    : "Contraseña (Por defecto: ValleSol2026!)"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={usuarioEditando ? "No editable desde el panel" : "••••••••"}
                  disabled={cargandoAccion || !!usuarioEditando}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-red-600 transition-all disabled:opacity-50"
                />
                {usuarioEditando && (
                  <p className="text-[8px] text-amber-500/70 ml-2 mt-1 italic">
                    Para cambiar la contraseña, el usuario debe usar "Olvidé mi contraseña" en el login.
                  </p>
                )}
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2 italic">Rol del Sistema</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={cargandoAccion}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-red-600 transition-all font-bold disabled:opacity-50"
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
                    disabled={cargandoAccion}
                    className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-amber-900 text-white font-black py-2.5 rounded-xl uppercase tracking-widest text-[9px] shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    {cargandoAccion ? <Loader2 size={14} className="animate-spin" /> : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelarEdicion}
                    disabled={cargandoAccion}
                    className="w-full bg-slate-950 hover:bg-slate-800 text-slate-400 font-black py-2.5 rounded-xl uppercase tracking-widest text-[9px] border border-slate-800 transition-all flex items-center justify-center"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={cargandoAccion}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-900 text-white font-black py-2.5 rounded-xl uppercase tracking-widest text-[9px] shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {cargandoAccion ? (
                    <><Loader2 size={14} className="animate-spin" /> Creando en Firebase...</>
                  ) : (
                    <><UserPlus size={14} /> Registrar Usuario</>
                  )}
                </button>
              )}
            </form>
          </div>

          {/* Listado de Usuarios Existentes (Col 3/5) */}
          <div className="md:col-span-3 flex flex-col overflow-hidden">

            <div className="flex border-b border-slate-800 mb-4 pb-2 shrink-0">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Users size={14} className="text-red-500" /> Todos los Usuarios Registrados ({usuarios.length})
              </span>
            </div>

            {cargandoUsuarios ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 size={32} className="animate-spin text-red-500 mx-auto mb-3" />
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Cargando usuarios desde Firestore...</p>
                </div>
              </div>
            ) : usuarios.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <CloudOff size={32} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">No hay usuarios registrados</p>
                  <p className="text-[9px] text-slate-600 mt-1">Crea un usuario desde la izquierda.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {usuarios.map((u) => {
                  return (
                    <div
                      key={u.id}
                      className={`bg-slate-950/60 border p-3.5 rounded-2xl flex items-center justify-between gap-4 transition-all ${
                        u.active
                          ? 'border-slate-800/80 hover:border-slate-700/50'
                          : 'border-red-500/10 bg-red-950/10 opacity-60'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white tracking-tight truncate">{u.fullName}</p>
                          {!u.active && (
                            <span className="text-[8px] font-black text-red-500 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded uppercase tracking-widest shrink-0">
                              Inactivo / Pendiente
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <p className="text-[10px] text-slate-500 font-mono">@{u.username}</p>
                          {u.email && <p className="text-[9px] text-slate-600 truncate font-sans">({u.email})</p>}
                          {getRoleBadge(u.role)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Button Editar */}
                        <button
                          type="button"
                          onClick={() => handleEditarClick(u)}
                          title="Editar Perfil"
                          disabled={cargandoAccion}
                          className="p-1.5 rounded-lg border border-slate-800 hover:border-amber-500/30 text-slate-500 hover:text-amber-500 bg-slate-950 transition-all disabled:opacity-30"
                        >
                          <Pencil size={14} />
                        </button>

                        {/* Toggle Active */}
                        <button
                          type="button"
                          onClick={() => handleToggleEstado(u)}
                          title={u.active ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                          disabled={cargandoAccion}
                          className={`p-1.5 rounded-lg border transition-all disabled:opacity-30 ${u.active ? 'text-emerald-500 border-emerald-500/10 bg-emerald-500/5' : 'text-slate-600 border-slate-800 bg-slate-950'}`}
                        >
                          {u.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleEliminar(u)}
                          disabled={cargandoAccion}
                          className="p-1.5 rounded-lg border border-slate-800 hover:border-red-500/30 text-slate-500 hover:text-red-500 bg-slate-950 transition-all disabled:opacity-30"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default UserManagementModal;
