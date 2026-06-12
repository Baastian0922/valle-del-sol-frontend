import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Flame, Lock, ArrowRight, AlertCircle, Mail, User, ShieldCheck } from 'lucide-react';

// ── Firebase ──────────────────────────────────────────────────────────────────
import { auth, db } from '../services/firebase-config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// ── Constantes de Validación ──────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function Register() {
  const navigate = useNavigate();

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nombre.trim()) {
      setError('Por favor, ingresa tu nombre completo.');
      return;
    }
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      setError('Por favor, ingresa un correo electrónico válido.');
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

      // Insertar la ficha en Firestore forzando el rol "vecino"
      await setDoc(doc(db, 'usuarios', uid), {
        nombre: nombre.trim(),
        email: email.trim(),
        rol: 'vecino',
        institucion: 'general',
        fechaCreacion: new Date().toISOString()
      });

      // Redirigir directamente al dashboard operativo
      navigate('/dashboard', { replace: true });

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

      <div className="w-full max-w-md relative z-10">
        
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/10 border border-red-600/20 rounded-2xl text-red-500 mb-4">
            <Flame size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            Valle del Sol
          </h1>
          <p className="text-slate-500 mt-1 text-xs font-bold uppercase tracking-widest">
            Portal de Registro Ciudadano
          </p>
        </div>

        {/* Tarjeta */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-[2rem] shadow-2xl">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3 text-xs font-semibold mb-6">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-5" noValidate>
            
            {/* Campo Nombre */}
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

            {/* Campo Correo */}
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
                  className="w-full bg-slate-950 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-600/60 focus:ring-1 focus:ring-red-600/40 transition-all disabled:opacity-50 text-sm"
                />
              </div>
              <p className="text-[10px] text-slate-600 ml-1 mt-1">
                Mín. 8 caracteres · Mayúscula · Minúscula · Número · Símbolo
              </p>
            </div>

            {/* Botón de Enviar */}
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

          </form>
        </div>

        {/* Enlace para volver */}
        <div className="text-center mt-6">
          <p className="text-slate-500 text-xs font-medium">
            ¿Ya tienes una cuenta registrada?{' '}
            <Link to="/login" className="text-red-500 hover:text-red-400 font-bold underline transition-colors">
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