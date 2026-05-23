import React from 'react';

import { Activity, Moon, Sun } from 'lucide-react';

const Header = ({ isFetching, cuaca, isOffline, isNightMode, setIsNightMode }) => {
  const isDark = isNightMode || cuaca?.toLowerCase() === 'hujan';
  
  return (
    <header className={`backdrop-blur-md border-b mb-6 sm:mb-8 sticky top-0 z-50 transition-colors duration-1000 ${isDark ? 'bg-black/20 border-white/10' : 'bg-white/40 border-white/40 shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 flex justify-between items-center">
        <div>
          <h1 className={`text-lg sm:text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            SISTEM MONITORING JEMURAN
          </h1>
          <p className={`mt-0.5 sm:mt-1 text-[10px] sm:text-xs font-medium ${isDark ? 'text-blue-200' : 'text-gray-600'}`}>
            IoT Edge-to-Web Berbasis Arduino
          </p>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Night Mode Toggle */}
          <button 
            onClick={() => setIsNightMode(!isNightMode)}
            className={`p-1.5 sm:p-2 rounded-full transition-colors ${isDark ? 'bg-white/10 text-yellow-300 hover:bg-white/20' : 'bg-black/5 text-slate-700 hover:bg-black/10'}`}
            title="Toggle Night Mode"
          >
            {isNightMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Live / Offline Heartbeat Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
            {isFetching && !isOffline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 ${isOffline ? 'bg-red-500' : (isFetching ? 'bg-green-500' : 'bg-emerald-500')}`}></span>
          </div>
          <span className={`text-[10px] sm:text-xs font-bold tracking-wider uppercase ${isDark ? 'text-white' : 'text-gray-700'}`}>
            {isOffline ? (
              <span className="text-red-500 flex items-center gap-1">OFFLINE</span>
            ) : isFetching ? (
              <span className="flex items-center gap-1"><Activity className="w-3 h-3 animate-pulse" /> Syncing...</span>
            ) : (
              'Live'
            )}
          </span>
        </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
