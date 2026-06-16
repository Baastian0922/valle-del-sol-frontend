import React from 'react';

const StatCard = ({ label, value, icon, color, bg, secondaryText, onClick, renderFooter, compact = false }) => {
  const isClickable = typeof onClick === 'function';

  return (
    <div
      onClick={onClick}
      className={`bg-slate-900 border border-slate-800 shadow-xl group transition-all duration-300 ${
        compact
          ? 'p-4 rounded-2xl flex items-center gap-4'
          : 'p-6 rounded-[2rem] flex flex-col justify-between'
      } ${
        isClickable
          ? 'cursor-pointer hover:border-slate-700/80 hover:bg-slate-900/80 hover:shadow-2xl hover:shadow-slate-950 active:scale-98'
          : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className={`${bg} ${color} ${compact ? 'p-2.5 rounded-xl' : 'p-3 rounded-2xl mb-4'} w-fit group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        {isClickable && (
          <span className="text-[8px] font-black text-blue-500 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Ver Detalles
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-500 font-bold text-[10px] uppercase mb-1 tracking-widest">{label}</p>
        <h3 className={`${compact ? 'text-xl' : 'text-3xl'} font-black text-white tracking-tighter truncate max-w-full`}>{value}</h3>
        {secondaryText && (
          <p className="text-[9px] text-slate-400 mt-1 font-medium italic truncate">{secondaryText}</p>
        )}
        {typeof renderFooter === 'function' && renderFooter()}
      </div>
    </div>
  );
};

export default StatCard;
