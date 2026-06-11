import React from 'react';

const StatCard = ({ label, value, icon, color, bg, compact = false }) => {
  return (
    <div className={`bg-slate-900 border border-slate-800 shadow-xl group ${compact ? 'p-4 rounded-2xl flex items-center gap-4' : 'p-6 rounded-[2rem]'}`}>
      <div className={`${bg} ${color} ${compact ? 'p-2.5 rounded-xl' : 'p-3 rounded-2xl mb-4'} w-fit group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 font-bold text-[10px] uppercase mb-1 tracking-widest">{label}</p>
        <h3 className={`${compact ? 'text-xl' : 'text-3xl'} font-black text-white tracking-tighter`}>{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
