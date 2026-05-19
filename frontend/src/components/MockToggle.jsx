import React, { useState, useEffect } from 'react';
import { getMockStatus, startMock, stopMock } from '../services/api';

const MockToggle = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);

  // Cek status saat komponen mount
  useEffect(() => {
    getMockStatus()
      .then(data => {
        if (data.error) {
          setBackendOnline(false);
        } else {
          setIsRunning(data.running);
          setBackendOnline(true);
        }
      })
      .catch(() => setBackendOnline(false));
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isRunning) {
        await stopMock();
        setIsRunning(false);
      } else {
        await startMock();
        setIsRunning(true);
      }
      setBackendOnline(true);
    } catch (err) {
      console.error('Gagal toggle mock:', err);
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  };

  // Jika backend offline, tampilkan versi minimal
  if (!backendOnline) {
    return (
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl shadow-sm px-5 py-3 opacity-60">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Simulasi Sensor
          </span>
          <span className="text-sm font-bold text-amber-500">
            ⚠ Backend offline
          </span>
        </div>
        <button
          disabled
          className="relative inline-flex h-7 w-14 items-center rounded-full bg-gray-300 opacity-50 cursor-not-allowed"
          aria-label="Backend offline"
        >
          <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow-md translate-x-1" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl shadow-sm px-5 py-3">
      {/* Label */}
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Simulasi Sensor
        </span>
        <span className={`text-sm font-bold ${isRunning ? 'text-emerald-600' : 'text-gray-400'}`}>
          {loading ? 'Memproses...' : isRunning ? '● Berjalan' : '○ Berhenti'}
        </span>
      </div>

      {/* Toggle Switch */}
      <button
        id="mock-toggle-btn"
        onClick={handleToggle}
        disabled={loading}
        className={`
          relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none
          ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isRunning ? 'bg-emerald-500' : 'bg-gray-300'}
        `}
        aria-label="Toggle simulasi sensor dummy"
      >
        <span
          className={`
            inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300
            ${isRunning ? 'translate-x-8' : 'translate-x-1'}
          `}
        />
      </button>

      {/* Animated dot when running */}
      {isRunning && (
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      )}
    </div>
  );
};

export default MockToggle;
