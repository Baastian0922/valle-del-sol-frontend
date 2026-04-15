import { Link } from 'react-router-dom';
import { Flame, User, Lock, ArrowRight } from 'lucide-react';

function Login() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decoración de fondo (Glow) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Título */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/10 border border-red-600/20 rounded-2xl text-red-600 mb-4">
            <Flame size={32} />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Acceso Restringido</h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">Personal Municipal - Valle del Sol</p>
        </div>

        {/* Tarjeta de Formulario */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <form className="space-y-6">
            
            {/* Input Usuario */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Usuario</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-red-500 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Ej: b.gonzalez" 
                  className="w-full bg-slate-950 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/50 transition-all placeholder:text-slate-700"
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
                  placeholder="••••••••" 
                  className="w-full bg-slate-950 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/50 transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            {/* Botón de Entrada */}
            <Link 
              to="/dashboard" 
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20 group"
            >
              Iniciar Sesión
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </form>

          {/* Ayuda / Recuperación */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col gap-2 text-center">
            <button className="text-xs text-slate-500 hover:text-white transition uppercase font-bold tracking-tight">
              ¿Olvidaste tu contraseña?
            </button>
            <Link to="/" className="text-xs text-red-500 hover:underline font-bold uppercase tracking-tight">
              Volver al inicio
            </Link>
          </div>
        </div>

        {/* Footer Seguridad */}
        <p className="text-center mt-10 text-[10px] text-slate-600 uppercase tracking-[0.2em] font-medium leading-relaxed">
          Esta conexión está cifrada y monitoreada <br /> por el departamento de IT municipal
        </p>
      </div>
    </div>
  );
}

export default Login;