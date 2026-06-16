import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Flame, Lock, ArrowRight, AlertCircle, Mail, User, ShieldCheck } from 'lucide-react';

// ── Firebase ──────────────────────────────────────────────────────────────────
import { auth, db } from '../services/firebase-config';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// ── Constantes de Validación ──────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const typeParam = queryParams.get('type') || 'comunidad';

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Estados para registro de entidad de emergencia
  const [esEntidad, setEsEntidad] = useState(typeParam === 'entidad');
  const [rolEntidad, setRolEntidad] = useState('bombero');
  const [institucion, setInstitucion] = useState('');
  const [rutCodigo, setRutCodigo] = useState('');
  const [sectorComuna, setSectorComuna] = useState('');
  const [codigoValidacion, setCodigoValidacion] = useState('');

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!esEntidad) {
      if (!nombre.trim()) {
        setError('Por favor, ingresa tu nombre completo.');
        return;
      }
    } else {
      if (!institucion.trim()) {
        setError('Por favor, ingresa el nombre de tu institución.');
        return;
      }
      if (!rutCodigo.trim()) {
        setError('Por favor, ingresa el RUT del establecimiento o código.');
        return;
      }
      if (!sectorComuna.trim()) {
        setError('Por favor, ingresa el sector o comuna.');
        return;
      }
      if (codigoValidacion.trim() !== 'VALLESOL_EMERGENCIA_2026') {
        setError('El código de validación comunal institucional es incorrecto.');
        return;
      }
    }

    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      setError(esEntidad ? 'Por favor, ingresa un correo de institución válido.' : 'Por favor, ingresa un correo electrónico válido.');
      return;
    }
    if (!password) {
      setError('Por favor, define una contraseña.');
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      setError('La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.');
      return;
    }

    setCargando(true);

    try {
      // Crear usuario en Firebase Auth
      const credencial = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = credencial.user.uid;

      // Traducir rolEntidad a rol/role compatible con AuthContext
      let dbRol = 'vecino';
      let dbRole = 'USER';
      if (esEntidad) {
        dbRol = rolEntidad; // 'bombero', 'carabinero', 'ambulancia', 'staff'
        dbRole = rolEntidad === 'staff' ? 'STAFF' : 'EMERGENCY_ENTITY';
      }

      // Insertar la ficha en Firestore
      await setDoc(doc(db, 'usuarios', uid), {
        nombre: esEntidad ? institucion.trim() : nombre.trim(),
        email: email.trim(),
        username: email.trim().split('@')[0],
        rol: dbRol,
        role: dbRole,
        institucion: esEntidad ? institucion.trim() : 'general',
        rutCodigo: esEntidad ? rutCodigo.trim() : '',
        sectorComuna: esEntidad ? sectorComuna.trim() : '',
        activo: !esEntidad, // Para firebase-admin-service
        active: !esEntidad, // Para compatibilidad general
        fechaCreacion: new Date().toISOString()
      });

      if (esEntidad) {
        // Desconectar sesión automática del registro para esperar aprobación
        await signOut(auth);
        navigate('/login', {
          state: {
            mensajeExito: '¡Solicitud de registro institucional enviada con éxito! Tu cuenta de respondedor oficial se encuentra en revisión. El Administrador de la Municipalidad debe validar y aprobar tu solicitud.'
          },
          replace: true
        });
      } else {
        // Redirigir directamente al dashboard operativo del vecino
        navigate('/dashboard', { replace: true });
      }

    } catch (err) {
      console.error("Error en auto-registro:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya se encuentra registrado en el portal comunal.');
      } else {
        setError('Ocurrió un error al procesar el registro. Inténtalo de nuevo.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden text-white">

      {/* Glow de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-red-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className={`w-full ${esEntidad ? 'max-w-4xl' : 'max-w-md'} relative z-10 transition-all duration-500`}>

        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/10 border border-red-600/20 rounded-2xl text-red-500 mb-4">
            <Flame size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            Valle del Sol
          </h1>
          <p className="text-slate-500 mt-1 text-xs font-bold uppercase tracking-widest">
            {esEntidad ? 'Portal de Registro de Entidad' : 'Portal de Registro Ciudadano'}
          </p>
        </div>

        {/* Tarjeta */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl transition-all duration-500">

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3 text-xs font-semibold mb-6">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-6" noValidate>

            {/* Toggle de Entidad de Emergencia */}
            {!queryParams.get('type') && (
              <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between hover:border-red-500/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/10 text-red-500 p-2 rounded-xl border border-red-500/15">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-white tracking-wide">¿Entidad de Emergencia?</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Inscríbete como respondedor oficial</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={esEntidad}
                    onChange={(e) => {
                      setEsEntidad(e.target.checked);
                      setError('');
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600 peer-checked:after:bg-white"></div>
                </label>
              </div>
            )}

            {esEntidad ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-in fade-in duration-300">
                {/* Columna Izquierda: Datos Institucionales */}
                <div className="space-y-4 p-5 bg-red-950/5 border border-red-500/10 rounded-[2rem]">
                  <p className="text-[10px] text-red-400 font-black uppercase tracking-wider italic flex items-center gap-1.5 mb-2">
                    <AlertCircle size={14} className="shrink-0" /> Datos de la Institución
                  </p>

                  {/* Tipo de Organización */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Tipo de Organización
                    </label>
                    <select
                      value={rolEntidad}
                      onChange={(e) => setRolEntidad(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-red-600/60 transition-all font-semibold text-xs"
                    >
                      <option value="bombero">Bomberos (Cuerpo de Rescate)</option>
                      <option value="carabinero">Carabineros / Control de Orden</option>
                      <option value="ambulancia">Ambulancia / Atención de Salud</option>
                      <option value="staff">Seguridad Ciudadana / Municipalidad</option>
                    </select>
                  </div>

                  {/* Nombre de la Institución */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Nombre de la Institución
                    </label>
                    <input
                      type="text"
                      value={institucion}
                      onChange={(e) => setInstitucion(e.target.value)}
                      placeholder="Ej: Primera Compañía Valle del Sol"
                      className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-red-600/60 transition-all font-semibold text-xs"
                    />
                  </div>

                  {/* Rut establecimiento o codigo */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Rut Establecimiento o Código
                    </label>
                    <input
                      type="text"
                      value={rutCodigo}
                      onChange={(e) => setRutCodigo(e.target.value)}
                      placeholder="Ej: 77.123.456-K o COD-112"
                      className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-red-600/60 transition-all font-semibold text-xs"
                    />
                  </div>

                  {/* Sector/comuna */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Sector/Comuna
                    </label>
                    <input
                      type="text"
                      value={sectorComuna}
                      onChange={(e) => setSectorComuna(e.target.value)}
                      placeholder="Ej: Valle del Sol Oriente / Comuna Centro"
                      className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-red-600/60 transition-all font-semibold text-xs"
                    />
                  </div>

                  {/* Código de Validación */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Credencial Comunal
                      </label>
                      <span className="text-[8px] text-amber-500 font-black uppercase tracking-wider">
                        Demo: VALLESOL_EMERGENCIA_2026
                      </span>
                    </div>
                    <input
                      type="password"
                      value={codigoValidacion}
                      onChange={(e) => setCodigoValidacion(e.target.value)}
                      placeholder="Ingrese código de validación"
                      className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-red-600/60 transition-all font-semibold text-xs"
                    />
                  </div>
                </div>

                {/* Columna Derecha: Credenciales de Cuenta */}
                <div className="space-y-5">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider italic flex items-center gap-1.5 mb-2">
                    <Lock size={14} className="shrink-0" /> Credenciales de Acceso
                  </p>

                  {/* Campo Correo */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Correo Institución
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-red-500 transition-colors pointer-events-none">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ejemplo@institucion.cl"
                        disabled={cargando}
                        className="w-full bg-slate-950 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-600/60 focus:ring-1 focus:ring-red-600/40 transition-all font-semibold text-sm placeholder:text-slate-700"
                      />
                    </div>
                  </div>

                  {/* Campo Contraseña */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Contraseña de Acceso
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-red-500 transition-colors pointer-events-none">
                        <Lock size={18} />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={cargando}
                        className="w-full bg-slate-950 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-650/60 focus:ring-1 focus:ring-red-600/40 transition-all disabled:opacity-50 text-sm"
                      />
                    </div>
                    <p className="text-[10px] text-slate-600 ml-1 mt-1 leading-relaxed">
                      Mín. 8 caracteres · Mayúscula · Minúscula · Número · Símbolo
                    </p>
                  </div>

                  {/* Botón de Enviar */}
                  <button
                    type="submit"
                    disabled={cargando}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed text-white py-4.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20 group uppercase tracking-widest text-xs mt-4"
                  >
                    {cargando ? 'Procesando Registro...' : (
                      <>
                        Inscribir Entidad de Emergencia
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Formulario Simple Ciudadano (Una columna) */
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Nombre Completo
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-red-500 transition-colors pointer-events-none">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Juan Vecino"
                      disabled={cargando}
                      className="w-full bg-slate-950 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-600/60 focus:ring-1 focus:ring-red-600/40 transition-all font-semibold text-sm placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Correo Electrónico
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-red-500 transition-colors pointer-events-none">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu-correo@gmail.com"
                      disabled={cargando}
                      className="w-full bg-slate-950 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-600/60 focus:ring-1 focus:ring-red-600/40 transition-all font-semibold text-sm placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Contraseña
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-red-500 transition-colors pointer-events-none">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={cargando}
                      className="w-full bg-slate-950 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-600/60 focus:ring-1 focus:ring-red-600/40 transition-all disabled:opacity-50 text-sm"
                    />
                  </div>
                  <p className="text-[10px] text-slate-600 ml-1 mt-1 leading-relaxed">
                    Mín. 8 caracteres · Mayúscula · Minúscula · Número · Símbolo
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20 group uppercase tracking-widest text-xs mt-2"
                >
                  {cargando ? 'Procesando Registro...' : (
                    <>
                      Crear Mi Cuenta Ciudadana
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </>
            )}

          </form>
        </div>

        {/* Enlace para volver */}
        <div className="text-center mt-6">
          <p className="text-slate-500 text-xs font-medium">
            ¿Ya tienes una cuenta registrada?{' '}
            <Link to={esEntidad ? "/login?type=entidad" : "/login?type=comunidad"} className="text-red-500 hover:text-red-400 font-bold underline transition-colors">
              Inicia Sesión Aquí
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

// 🔥 AQUÍ ESTÁ LA LÍNEA CLAVE QUE LE HACÍA FALTA A TU COMPONENTE:
export default Register;