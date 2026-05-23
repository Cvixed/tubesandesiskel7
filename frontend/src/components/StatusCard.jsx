import React from 'react';

const StatusCard = ({ status }) => {
  if (!status) {
    return (
      <div className="flex justify-center items-center h-48 bg-gray-100 rounded-2xl shadow-inner animate-pulse">
        <p className="text-gray-500 font-medium">Memuat data sensor...</p>
      </div>
    );
  }

  const { cuaca, warna, pesan_peringatan, waktu_update } = status;

  const getGaugeColor = (warna) => {
    switch (warna?.toLowerCase()) {
      case 'hijau': return '#10B981'; // emerald-500
      case 'kuning': return '#F59E0B'; // amber-500
      case 'merah': return '#EF4444'; // red-500
      default: return '#60A5FA';
    }
  };

  const getIcon = (kondisi) => {
    switch (kondisi?.toLowerCase()) {
      case 'cerah':
        return (
          <svg className="w-16 h-16 sm:w-20 sm:h-20 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'gerimis':
        return (
          <svg className="w-16 h-16 sm:w-20 sm:h-20 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19v2m4-2v2" />
          </svg>
        );
      case 'hujan':
        return (
          <svg className="w-16 h-16 sm:w-20 sm:h-20 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19v2m-3-2v2m6-2v2" />
          </svg>
        );
      default:
        return null;
    }
  };

  const isDark = cuaca?.toLowerCase() === 'hujan';
  
  // Calculate Gauge (Max 1024 for Arduino analog)
  const sensorValue = status?.nilai_sensor || 0;
  const radius = 45;
  const circumference = Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (sensorValue / 1024) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative overflow-hidden rounded-3xl transition-all duration-500 p-6 sm:p-8 h-full flex flex-col justify-between group 
      ${isDark ? 'glass-panel-dark text-white' : 'glass-panel text-slate-800'} 
      hover:-translate-y-1 hover:shadow-2xl`}>
      
      {/* Background Icon Watermark */}
      <div className="absolute -top-10 -right-10 opacity-10 transform rotate-12 scale-150 transition-transform duration-1000 group-hover:scale-110">
        {getIcon(cuaca)}
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <h2 className="text-sm sm:text-lg font-bold uppercase tracking-widest mb-1 opacity-80">Status Cuaca</h2>
        <div className="text-4xl sm:text-6xl font-extrabold mb-6 sm:mb-8 drop-shadow-sm tracking-tight">
          {cuaca?.toUpperCase() || 'UNKNOWN'}
        </div>

        {/* Animated Sensor Gauge */}
        <div className="relative w-48 h-24 sm:w-56 sm:h-28 flex justify-center mb-6">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50">
            {/* Background Arch */}
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} strokeWidth="8" strokeLinecap="round" />
            {/* Animated Arch */}
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={getGaugeColor(warna)} strokeWidth="8" strokeLinecap="round" 
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out" />
            
            {/* Text inside gauge */}
            <text x="50" y="45" textAnchor="middle" className={`text-xl sm:text-2xl font-bold fill-current`}>
              {sensorValue}
            </text>
            <text x="50" y="55" textAnchor="middle" className={`text-[8px] sm:text-[10px] uppercase font-semibold fill-current opacity-70`}>
              Nilai Sensor
            </text>
          </svg>
        </div>
        
        <div className={`rounded-2xl px-4 sm:px-6 py-3 sm:py-4 w-full border backdrop-blur-md
          ${isDark ? 'bg-white/10 border-white/20' : 'bg-white/50 border-white/50'}`}>
          <p className="text-xs sm:text-sm font-semibold mb-0.5 opacity-80 uppercase tracking-wider">Peringatan:</p>
          <p className="text-sm sm:text-lg font-bold">{pesan_peringatan}</p>
        </div>
        
        <div className={`mt-6 text-[10px] sm:text-xs font-medium px-4 py-2 rounded-full inline-flex items-center
          ${isDark ? 'bg-black/20' : 'bg-black/5 text-slate-600'}`}>
          <svg className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="truncate">Update: {waktu_update}</span>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
