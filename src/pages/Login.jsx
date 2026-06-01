import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Flame, User, Lock, ArrowRight, AlertCircle, Mail, Briefcase, HeartHandshake, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login, crearUsuario, usuarios } = useAuth();
  const navigate = useNavigate();

  // Estados generales
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cargando, setCargando] = useState(false);

  // Campos de Login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Campos de Registro
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [registerRole, setRegisterRole] = useState('USER'); // 'USER' (Vecino) o 'EMERGENCY_ENTITY' (Entidad)
  const [entitySubtype, setEntitySubtype] = useState('BOMBEROS'); // BOMBEROS, CARABINEROS, AMBULANCIA, etc.

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Por favor, ingresa tu usuario/correo y contraseña.');
      return;
    }
    setCargando(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Credenciales inválidas.');
    } finally {
      setCargando(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim() || !email.trim() || !regUsername.trim() || !regPassword.trim()) {
      setError('Por favor, completa todos los campos de registro.');
      return;
    }

    // Validar formato de correo básico
    if (!email.includes('@') || !email.includes('.')) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    // Validar contraseña fuerte (mínimo 8 caracteres, mayúscula, minúscula, número y símbolo especial)
    if (regPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!/[A-Z]/.test(regPassword)) {
      setError('La contraseña debe incluir al menos una letra mayúscula.');
      return;
    }
    if (!/[a-z]/.test(regPassword)) {
      setError('La contraseña debe incluir al menos una letra minúscula.');
      return;
    }
    if (!/[0-9]/.test(regPassword)) {
      setError('La contraseña debe incluir al menos un número.');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(regPassword)) {
      setError('La contraseña debe incluir al menos un símbolo especial (ej: !, @, #, $, %, &, *).');
      return;
    }

    // Validar si el correo ya existe
    const emailExiste = usuarios.some(u => u.email && u.email.toLowerCase() === email.toLowerCase().trim());
    if (emailExiste) {
      setError('El correo electrónico ya está registrado.');
      return;
    }

    // Validar si el username ya existe
    const userExiste = usuarios.some(u => u.username.toLowerCase() === regUsername.toLowerCase().trim());
    if (userExiste) {
      setError('El nombre de usuario ya está tomado.');
      return;
    }

    setCargando(true);
    try {
      let finalFullName = fullName.trim();
      
      // Personalizar el nombre completo para las entidades de emergencia
      if (registerRole === 'EMERGENCY_ENTITY') {
        const subtypeLabels = {
          BOMBEROS: 'Bomberos',
          CARABINEROS: 'Carabineros',
          AMBULANCIA: 'Ambulancia (SAMU)',
          CONAF: 'CONAF Forestal'
        };
        finalFullName = `${subtypeLabels[entitySubtype] || 'Entidad'} - ${fullName.trim()}`;
      }

      crearUsuario({
        username: regUsername.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password: regPassword,
        fullName: finalFullName,
        role: registerRole,
        entitySubtype: registerRole === 'EMERGENCY_ENTITY' ? entitySubtype : null
      });

      setSuccess('¡Registro completado con éxito! Inicia sesión ahora.');
      
      // Auto-rellenar campos en el formulario de Login
      setUsername(regUsername.trim().toLowerCase());
      setPassword(regPassword);

      // Limpiar campos de registro
      setFullName('');
      setEmail('');
      setRegUsername('');
      setRegPassword('');
      setRegisterRole('USER');

      // Cambiar a vista login después de 2 segundos
      setTimeout(() => {
        setIsRegister(false);
        setSuccess('');
      }, 2000);

    } catch (err) {
      setError('Error al registrar la cuenta.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decoración de fondo (Glow) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-red-600/10 blur-[130px] rounded-full"></div>

      <div className="w-full max-w-lg relative z-10">
        
        {/* Logo / Título */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/10 border border-red-600/20 rounded-2xl text-red-600 mb-3 animate-pulse">
            <Flame size={32} />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Valle del Sol</h2>
          <p className="text-slate-500 mt-1 text-xs font-bold uppercase tracking-widest">
            {isRegister ? 'Registro de Vecinos y Entidades' : 'Consola de Acceso Municipal'}
          </p>
        </div>

        {/* Tarjeta de Formulario */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-[2rem] shadow-2xl transition-all duration-300">
          
          {/* Mensajes de Alerta/Éxito */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-wider mb-6">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-wider mb-6">
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          {!isRegister ? (
            /* ================= FORMULARIO LOGIN ================= */
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {/* Input Usuario o Email */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Usuario o Correo</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-red-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej: vecino@gmail.com o bombero" 
                    className="w-full bg-slate-950 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/50 transition-all placeholder:text-slate-700 font-semibold"
                  />
                </div>
              </div>

              {/* Input Contraseña */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-red-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full bg-slate-950 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/50 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              {/* Botón de Entrada */}
              <button 
                type="submit"
                disabled={cargando}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20 group uppercase tracking-widest text-xs"
              >
                {cargando ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Enlace para ir al Registro */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  ¿Eres un nuevo vecino o entidad?{' '}
                  <button 
                    type="button" 
                    onClick={() => { setIsRegister(true); setError(''); setSuccess(''); }} 
                    className="text-red-500 hover:underline font-bold"
                  >
                    Regístrate aquí
                  </button>
                </p>
              </div>

              {/* Sugerencias de Prueba */}
              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Cuentas maestra (Clave: 123):</p>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => { setUsername('admin'); setPassword('123'); }} className="bg-slate-950 border border-slate-800 text-[9px] font-black uppercase text-red-400 hover:bg-slate-800 p-2 rounded-lg transition-all">Admin</button>
                  <button type="button" onClick={() => { setUsername('bombero'); setPassword('123'); }} className="bg-slate-950 border border-slate-800 text-[9px] font-black uppercase text-blue-400 hover:bg-slate-800 p-2 rounded-lg transition-all">Bombero</button>
                  <button type="button" onClick={() => { setUsername('vecino'); setPassword('123'); }} className="bg-slate-950 border border-slate-800 text-[9px] font-black uppercase text-emerald-400 hover:bg-slate-800 p-2 rounded-lg transition-all">Vecino</button>
                </div>
              </div>
            </form>
          ) : (
            /* ================= FORMULARIO REGISTRO ================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              
              {/* Selector de Tipo de Cuenta */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => setRegisterRole('USER')}
                  className={`py-3 rounded-xl border font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${registerRole === 'USER' ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                >
                  <HeartHandshake size={16} /> Vecino
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterRole('EMERGENCY_ENTITY')}
                  className={`py-3 rounded-xl border font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${registerRole === 'EMERGENCY_ENTITY' ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                >
                  <Briefcase size={16} /> Entidad
                </button>
              </div>

              {/* Nombre Completo u Organización */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  {registerRole === 'USER' ? 'Nombre Completo' : 'Nombre de la Unidad/Organización'}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-red-500 transition-colors">
                    <User size={16} />
                  </div>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={registerRole === 'USER' ? 'Ej: Juan Pérez Muñoz' : 'Ej: Primera Compañía Oriente'} 
                    className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-red-650 transition-all text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Correo Electrónico */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-red-500 transition-colors">
                    <Mail size={16} />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ej: juan.perez@correo.com" 
                    className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-red-650 transition-all text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Condicional: Selector de Subtipo de Entidad */}
              {registerRole === 'EMERGENCY_ENTITY' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tipo de Entidad</label>
                  <select
                    value={entitySubtype}
                    onChange={(e) => setEntitySubtype(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-red-650 transition-all text-xs font-bold"
                  >
                    <option value="BOMBEROS">Cuerpo de Bomberos</option>
                    <option value="CARABINEROS">Carabineros de Chile</option>
                    <option value="AMBULANCIA">Ambulancia / SAMU</option>
                    <option value="CONAF">CONAF (Brigada Forestal)</option>
                  </select>
                </div>
              )}

              {/* Nombre de Usuario */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Usuario de Acceso (Nickname)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-red-500 transition-colors">
                    <User size={16} />
                  </div>
                  <input 
                    type="text" 
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Ej: juan.perez o bombero.oriente" 
                    className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-red-650 transition-all text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-red-500 transition-colors">
                    <Lock size={16} />
                  </div>
                  <input 
                    type="password" 
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres" 
                    className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-red-650 transition-all text-xs"
                  />
                </div>
              </div>

              {/* Botón Registrar */}
              <button 
                type="submit"
                disabled={cargando}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20 group uppercase tracking-widest text-[10px] mt-4"
              >
                {cargando ? 'Creando Cuenta...' : 'Crear Cuenta'}
                <CheckCircle2 size={16} />
              </button>

              {/* Volver a Login */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  ¿Ya tienes una cuenta?{' '}
                  <button 
                    type="button" 
                    onClick={() => { setIsRegister(false); setError(''); setSuccess(''); }} 
                    className="text-red-500 hover:underline font-bold"
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Ayuda / Volver */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col gap-2 text-center">
            <Link to="/" className="text-xs text-red-500 hover:underline font-bold uppercase tracking-tight">
              Volver al inicio
            </Link>
          </div>
        </div>

        {/* Footer Seguridad */}
        <p className="text-center mt-6 text-[10px] text-slate-600 uppercase tracking-[0.2em] font-medium leading-relaxed">
          Esta conexión está cifrada y monitoreada <br /> por el departamento de IT municipal
        </p>
      </div>
    </div>
  );
}

export default Login;