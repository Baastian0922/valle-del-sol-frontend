import React, { useState } from 'react';
import { ArrowLeft, Flame, MessageCircle, Send } from 'lucide-react';

export default function EmergencyChat({ reporte, user, onBack }) {
  const storageKey = `valle_sol_chat_${reporte.id}`;
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [
      {
        id: 'system',
        autor: 'Central de alertas',
        texto: 'Canal comunitario abierto. Comparte informacion util y evita acercarte a la emergencia.',
        fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        system: true
      }
    ];
  });

  const enviarMensaje = (event) => {
    event.preventDefault();
    const texto = mensaje.trim();
    if (!texto) return;

    const nuevosMensajes = [...mensajes, {
      id: Date.now(),
      autor: user?.fullName || 'Vecino registrado',
      texto,
      fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];

    setMensajes(nuevosMensajes);
    localStorage.setItem(storageKey, JSON.stringify(nuevosMensajes));
    setMensaje('');
  };

  return (
    <aside className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-5 shadow-2xl flex flex-col h-[564px]">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <button onClick={onBack} className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white transition-colors" aria-label="Volver al historial">
          <ArrowLeft size={16} />
        </button>
        <div className="min-w-0">
          <p className="text-[9px] text-red-400 font-black uppercase tracking-widest flex items-center gap-1">
            <Flame size={12} /> Chat de emergencia
          </p>
          <h3 className="text-sm text-white font-bold truncate mt-1">{reporte.titulo}</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-3">
        {mensajes.map((item) => (
          <div key={item.id} className={`rounded-2xl p-3 border ${item.system ? 'bg-amber-500/5 border-amber-500/20' : 'bg-slate-950/60 border-slate-800'}`}>
            <div className="flex justify-between gap-2 mb-1">
              <p className={`text-[9px] font-black uppercase ${item.system ? 'text-amber-400' : 'text-blue-400'}`}>{item.autor}</p>
              <span className="text-[8px] text-slate-600">{item.fecha}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{item.texto}</p>
          </div>
        ))}
      </div>

      <form onSubmit={enviarMensaje} className="pt-3 border-t border-slate-800">
        <div className="flex gap-2">
          <input
            value={mensaje}
            onChange={(event) => setMensaje(event.target.value)}
            placeholder="Escribe una actualizacion..."
            className="min-w-0 flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors" aria-label="Enviar mensaje">
            <Send size={16} />
          </button>
        </div>
        <p className="text-[8px] text-slate-600 uppercase font-bold mt-2 flex items-center gap-1">
          <MessageCircle size={10} /> Canal visible para vecinos registrados
        </p>
      </form>
    </aside>
  );
}
