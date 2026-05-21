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

  const getBgColor = (warna) => {
    switch (warna?.toLowerCase()) {
      case 'hijau':
        return 'bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-green-200';
      case 'kuning':
        return 'bg-gradient-to-br from-yellow-300 to-amber-500 text-slate-800 shadow-yellow-100';
      case 'merah':
        return 'bg-gradient-to-br from-red-500 to-rose-700 text-white shadow-red-200';
      default:
        return 'bg-gray-200 text-gray-800';
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

  return (
    <div className={`relative overflow-hidden rounded-3xl shadow-xl transition-all duration-500 p-6 sm:p-8 h-full flex flex-col justify-center ${getBgColor(warna)}`}>
      <div className="absolute -top-10 -right-10 opacity-20 transform rotate-12 scale-150">
        {getIcon(cuaca)}
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <h2 className="text-base sm:text-xl font-bold uppercase tracking-wider mb-2 opacity-90">Status Cuaca</h2>
        <div className="text-4xl sm:text-6xl font-extrabold mb-4 sm:mb-6 drop-shadow-md">
          {cuaca?.toUpperCase() || 'UNKNOWN'}
        </div>
        
        <div className="bg-white/20 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-3 sm:py-4 w-full max-w-md border border-white/30 shadow-sm">
          <p className="text-sm sm:text-lg font-semibold mb-1">Peringatan:</p>
          <p className="text-base sm:text-xl font-bold">{pesan_peringatan}</p>
        </div>
        
        <div className="mt-4 sm:mt-8 text-xs sm:text-sm font-medium opacity-80 flex items-center bg-black/10 px-3 sm:px-4 py-2 rounded-full">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="truncate">Update: {waktu_update}</span>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
