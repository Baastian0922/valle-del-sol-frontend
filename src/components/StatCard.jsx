import React from 'react';

const StatCard = ({ label, value, icon, color, bg }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl group">
      <div className={`${bg} ${color} p-3 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-slate-500 font-bold text-[10px] uppercase mb-1 tracking-widest">{label}</p>
      <h3 className="text-3xl font-black text-white tracking-tighter">{value}</h3>
    </div>
  );
};

export default StatCard;