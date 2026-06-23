import React from 'react';

const StatCard = ({ label, value, icon, color, bg, secondaryText, onClick, renderFooter, compact = false, customClass = '', pulseBorder = false }) => {
  const isClickable = typeof onClick === 'function';

  return (
    <div
      onClick={onClick}
      className={`bg-slate-900 border border-slate-800 shadow-xl group transition-all duration-300 relative overflow-hidden ${
        compact
          ? 'p-3 rounded-2xl flex items-center gap-4'
          : 'p-4 rounded-3xl flex flex-col justify-between h-full'
      } ${
        isClickable
          ? 'cursor-pointer hover:border-slate-700/80 hover:bg-slate-800/80 hover:shadow-2xl hover:shadow-slate-950 active:scale-[0.98]'
          : ''
      } ${customClass}`}
    >
      {pulseBorder && (
        <div className={`absolute inset-0 border-2 border-red-500 shadow-[inset_0_0_15px_rgba(239,68,68,0.5),0_0_15px_rgba(239,68,68,0.8)] animate-pulse pointer-events-none z-20 ${compact ? 'rounded-2xl' : 'rounded-3xl'}`}></div>
      )}
      {/* Icon Container */}
      <div className="flex justify-between items-start shrink-0 z-10 relative">
        <div className={`${bg} ${color} ${compact ? 'p-2.5 rounded-xl' : 'p-3 rounded-2xl mb-3'} w-fit group-hover:scale-110 transition-transform duration-300 flex items-center justify-center`}>
          {icon}
        </div>
        {isClickable && !compact && (
          <span className="text-[8px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0 ml-2">
            Ver Detalles
          </span>
        )}
      </div>

      {/* Text Container */}
      <div className={`flex-1 min-w-0 z-10 flex flex-col justify-center ${isClickable && compact ? 'pr-8' : ''}`}>
        <p className="text-slate-500 font-bold text-[9px] uppercase mb-0.5 tracking-widest truncate w-full">{label}</p>
        <h3 className={`${compact ? 'text-[15px]' : 'text-xl'} font-black text-white tracking-tighter truncate w-full`} title={typeof value === 'string' ? value : undefined}>
          {value}
        </h3>
        {secondaryText && (
          <p className="text-[9px] text-slate-400 mt-0.5 font-medium italic truncate w-full" title={typeof secondaryText === 'string' ? secondaryText : undefined}>
            {secondaryText}
          </p>
        )}
        {typeof renderFooter === 'function' && renderFooter()}
      </div>

      {/* Hover "Ver" label for compact mode */}
      {isClickable && compact && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <span className="text-[8px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1.5 rounded-lg uppercase tracking-widest flex items-center shadow-lg">
            Ver
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
