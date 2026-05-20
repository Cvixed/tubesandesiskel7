import React, { useState, useEffect } from 'react';
import { getMockStatus, startMock, stopMock } from '../services/api';
import { Play, Square, Activity, Loader2 } from 'lucide-react';

const MockControl = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    try {
      const status = await getMockStatus();
      setIsRunning(status.running);
    } catch (err) {
      console.error("Gagal mengecek status mock", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000); // Check setiap 15 detik
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isRunning) {
        await stopMock();
      } else {
        await startMock();
      }
      await checkStatus();
    } catch (err) {
      console.error("Gagal mengubah status mock", err);
      alert("Gagal mengirim perintah ke backend. Pastikan backend FastAPI Anda sedang berjalan lokal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl transition-colors ${isRunning ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
          <Activity className={`w-7 h-7 ${isRunning ? 'animate-pulse' : ''}`} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Simulasi Sensor</h3>
          <p className="text-sm text-slate-500">
            Status: {loading ? (
              "Mengecek..."
            ) : isRunning ? (
              <span className="text-indigo-600 font-semibold animate-pulse">Berjalan Aktif</span>
            ) : (
              "Berhenti"
            )}
          </p>
        </div>
      </div>
      
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 ${
          isRunning 
            ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-sm' 
            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 shadow-sm'
        }`}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isRunning ? (
          <><Square className="w-5 h-5 fill-current" /> Matikan Simulasi</>
        ) : (
          <><Play className="w-5 h-5 fill-current" /> Mulai Simulasi</>
        )}
      </button>
    </div>
  );
};

export default MockControl;
