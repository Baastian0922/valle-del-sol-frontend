import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Flame, Lock, ArrowRight, AlertCircle, Mail, ShieldCheck } from 'lucide-react';

// ── Firebase ──────────────────────────────────────────────────────────────────
import { auth, db } from '../services/firebase-config';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// ── Constantes de validación ──────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// ── Traducción de errores Firebase → Español ──────────────────────────────────
const traducirErrorFirebase = (codigo) => {
  const errores = {
    'auth/user-not-found': 'No existe una cuenta con ese correo electrónico.',
    'auth/wrong-password': 'Contraseña incorrecta. Inténtalo de nuevo.',
    'auth/invalid-email': 'El formato del correo electrónico no es válido.',
    'auth/invalid-credential': 'Credenciales inválidas. Verifica tu correo y contraseña.',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada. Contacta al administrador.',
    'auth/too-many-requests': 'Demasiados intentos fallidos. Espera unos minutos e inténtalo de nuevo.',
    'auth/network-request-failed': 'Error de red. Verifica tu conexión a internet.',
    'auth/unauthorized-continue-uri': 'El dominio actual no está autorizado para enviar correos de recuperación.',
    'auth/missing-continue-uri': 'No se pudo preparar el enlace de recuperación. Inténtalo nuevamente.',
  };
  return errores[codigo] || 'Ocurrió un error inesperado. Inténtalo de nuevo.';
};

// ── Rutas por rol (Normalizadas en minúsculas) ────────────────────────────────
const rutaPorRol = {
  admin:         '/dashboard',
  bombero:       '/dashboard',
  vecino:        '/dashboard',
  entidad:       '/dashboard',
  comunidad:     '/dashboard',
  user:          '/dashboard',
  emergency_entity: '/dashboard'
};

// =============================================================================
function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const typeParam = queryParams.get('type') || 'comunidad';
  const [mensajeExito, setMensajeExito] = useState(location.state?.mensajeExito || '');

  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviandoRecuperacion, setEnviandoRecuperacion] = useState(false);
  const [modoRecuperacion, setModoRecuperacion] = useState(false);

  const formularioBloqueado = cargando || enviandoRecuperacion;

  const abrirRecuperacion = () => {
    setError('');
    setMensajeExito('');
    setPassword('');
    setModoRecuperacion(true);
  };

  const volverLogin = () => {
    setError('');
    setMensajeExito('');
    setModoRecuperacion(false);
  };

  // ── Handler principal de Login ─────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');

    if (!email.trim()) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('El correo electrónico no tiene un formato válido (ej: usuario@dominio.com).');
      return;
    }
    if (!password) {
      setError('Por favor, ingresa tu contraseña.');
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      setError(
        'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&).'
      );
      return;
    }

    setCargando(true);

    try {
      const credencial = await signInWithEmailAndPassword(auth, email.trim(), password);
      const uid = credencial.user.uid;

      const docRef = doc(db, 'usuarios', uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError('Tu cuenta no tiene un perfil asociado. Contacta al administrador municipal.');
        await auth.signOut();
        return;
      }

      const datos = docSnap.data();

      if (datos?.active === false) {
        setError('Tu cuenta de respondedor oficial se encuentra en revisión. El Administrador de la Municipalidad debe validar y aprobar tu solicitud antes de ingresar.');
        await auth.signOut();
        return;
      }
      const rawRol = datos?.rol || datos?.role || '';
      const rolNormalizado = rawRol.toLowerCase().trim();

      if (!rolNormalizado || !rutaPorRol[rolNormalizado]) {
        setError('Rol de usuario no reconocido. Contacta al administrador municipal.');
        await auth.signOut();
        return;
      }

      navigate(rutaPorRol[rolNormalizado], {
        state: { uid, rol: rolNormalizado, nombre: datos?.nombre || datos?.displayName || '' },
        replace: true,
      });

    } catch (err) {
      console.error(">>> ERROR EXACTO DE FIREBASE:", err.code, err.message);
      const codigoError = err?.code || '';
      setError(traducirErrorFirebase(codigoError));
    } finally {
      setCargando(false);
    }
  };

  // ── Recuperación de contraseña por correo ─────────────────────────────────
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');

    const emailNormalizado = email.trim();

    if (!emailNormalizado) {
      setError('Ingresa tu correo electrónico para enviarte el enlace de recuperación.');
      return;
    }

    if (!EMAIL_REGEX.test(emailNormalizado)) {
      setError('El correo electrónico no tiene un formato válido (ej: usuario@dominio.com).');
      return;
    }

    setEnviandoRecuperacion(true);

    try {
      auth.languageCode = 'es';

      await sendPasswordResetEmail(auth, emailNormalizado, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });

      setMensajeExito(
        `Enviamos un enlace de recuperación a ${emailNormalizado}. Revisa tu bandeja de entrada y spam.`
      );
    } catch (err) {
      console.error(">>> ERROR RECUPERACIÓN FIREBASE:", err.code, err.message);
      const codigoError = err?.code || '';
      setError(traducirErrorFirebase(codigoError));
    } finally {
      setEnviandoRecuperacion(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">

      {/* Decoración de fondo (Glow) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-red-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* Logo / Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/10 border border-red-600/20 rounded-2xl text-red-500 mb-4 animate-pulse">
            <Flame size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            Valle del Sol
          </h1>
          <p className="text-slate-500 mt-1 text-xs font-bold uppercase tracking-widest">
            {typeParam === 'entidad' ? 'Consola de Acceso Entidades' : 'Consola de Acceso Comunidad'}
          </p>
        </div>

        {/* Tarjeta de Formulario */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-[2rem] shadow-2xl">

          {/* Mensaje de Éxito */}
          {mensajeExito && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-start gap-3 text-xs font-semibold mb-6">
              <ShieldCheck size={16} className="mt-0.5 shrink-0" />
              <span>{mensajeExito}</span>
            </div>
          )}

          {/* Mensaje de Error */}
          {error && (
            <div
              role="alert"
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3 text-xs font-semibold mb-6"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {modoRecuperacion ? (
            <form onSubmit={handlePasswordReset} className="space-y-5" noValidate>
              <div className="space-y-2">
                <label htmlFor="reset-email" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-red-500 transition-colors pointer-events-none">
                    <Mail size={18} />
                  </div>
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@municipalidad.cl"
                    disabled={formularioBloqueado}
                    className="w-full bg-slate-950 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-600/60 focus:ring-1 focus:ring-red-600/40 transition-all placeholder:text-slate-700 font-semibold text-sm disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={formularioBloqueado}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20 group uppercase tracking-widest text-xs mt-2"
              >
                {enviandoRecuperacion ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Enviando enlace...
                  </>
                ) : (
                  <>
                    Enviar enlace
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center mt-5 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={volverLogin}
                  disabled={formularioBloqueado}
                  className="text-xs text-red-500/80 hover:text-red-400 hover:underline font-bold uppercase tracking-tight transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-5" noValidate>

              {/* Correo Electrónico */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-red-500 transition-colors pointer-events-none">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@municipalidad.cl"
                    disabled={formularioBloqueado}
                    className="w-full bg-slate-950 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-600/60 focus:ring-1 focus:ring-red-600/40 transition-all placeholder:text-slate-700 font-semibold text-sm disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-red-500 transition-colors pointer-events-none">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={formularioBloqueado}
                    className="w-full bg-slate-950 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-600/60 focus:ring-1 focus:ring-red-600/40 transition-all placeholder:text-slate-700 disabled:opacity-50"
                  />
                </div>
                <p className="text-[10px] text-slate-600 ml-1 mt-1">
                  Mín. 8 caracteres · Mayúscula · Minúscula · Número · Símbolo (@$!%*?&amp;)
                </p>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={abrirRecuperacion}
                    disabled={formularioBloqueado}
                    className="text-xs text-red-500/80 hover:text-red-400 hover:underline font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>

              {/* Botón Iniciar Sesión */}
              <button
                id="btn-login"
                type="submit"
                disabled={formularioBloqueado}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20 group uppercase tracking-widest text-xs mt-2"
              >
                {cargando ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Autenticando...
                  </>
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* 🔥 EL ACCESO INTEGRADO: Dentro de la tarjeta para visibilidad total */}
              <div className="text-center mt-5 pt-4 border-t border-slate-800/60">
                {typeParam === 'entidad' ? (
                  <p className="text-slate-400 text-xs font-medium">
                    ¿Tu institución no está registrada?{' '}
                    <Link to="/register?type=entidad" className="text-red-500 hover:text-red-400 font-bold underline transition-colors block mt-1">
                      Inscribe tu entidad de emergencia aquí
                    </Link>
                  </p>
                ) : (
                  <p className="text-slate-400 text-xs font-medium">
                    ¿Eres vecino de la comuna y no tienes cuenta?{' '}
                    <Link to="/register?type=comunidad" className="text-red-500 hover:text-red-400 font-bold underline transition-colors block mt-1">
                      Regístrate aquí
                    </Link>
                  </p>
                )}
              </div>

            </form>
          )}
        </div>

        {/* Footer de Seguridad */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <ShieldCheck size={12} className="text-slate-600" />
          <p className="text-center text-[10px] text-slate-600 uppercase tracking-[0.2em] font-medium">
            Conexión cifrada · Departamento IT Municipal
          </p>
        </div>

        {/* Volver al inicio */}
        <div className="text-center mt-3">
          <Link
            to="/"
            className="text-xs text-red-500/70 hover:text-red-400 hover:underline font-bold uppercase tracking-tight transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Login;
