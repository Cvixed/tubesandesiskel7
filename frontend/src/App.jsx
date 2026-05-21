import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import StatusCard from './components/StatusCard';
import HistoryTable from './components/HistoryTable';
import WeatherForecast from './components/WeatherForecast';
import AlarmControl from './components/AlarmControl';

import HistoryChart from './components/HistoryChart';
import { fetchStatus, fetchHistory } from './services/api';

// Helper for Audio Alert (Web Audio API)
const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Beep pattern: beep-beep-beep
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.05);
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime + 0.2);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.25);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime + 0.3);
    gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.35);
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime + 0.5);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.55);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.6);
  } catch (e) {
    console.log("Audio not supported or blocked");
  }
};

function App() {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const previousStatusRef = useRef(null);

  useEffect(() => {
    // Meminta izin Notifikasi saat pertama kali render
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const loadData = async () => {
      try {
        const statusData = await fetchStatus();
        setStatus(statusData);
        
        const historyData = await fetchHistory();
        setHistory(historyData);
        
        setError(null);

        // Logic Notifikasi Hujan Baru
        if (statusData && previousStatusRef.current) {
          if (previousStatusRef.current !== 'Hujan' && statusData.cuaca === 'Hujan') {
            // Mainkan Suara
            playBeep();
            
            // Tampilkan Browser Notification
            if (Notification.permission === 'granted') {
              new Notification('Peringatan Jemuran!', {
                body: 'Hujan terdeteksi! Segera angkat jemuran Anda sekarang.',
                icon: 'https://cdn-icons-png.flaticon.com/512/1163/1163624.png' // Icon awan hujan
              });
            }
          }
        }
        previousStatusRef.current = statusData?.cuaca;

      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Gagal mengambil data dari database. Periksa koneksi internet Anda.');
      }
    };

    // Initial load
    loadData();

    // Polling every 15 seconds
    const intervalId = setInterval(loadData, 15000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Top Grid: Status Card & Weather Forecast */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatusCard status={status} />
          <WeatherForecast />
        </div>

        {/* Middle Grid: Mock & Alarm Control */}
        <div className="mb-8 grid grid-cols-1 gap-6">

          <AlarmControl />
        </div>
        
        {/* Chart Section */}
        <div className="mb-8">
          <HistoryChart history={history} />
        </div>

        {/* Table Section */}
        <div>
          <HistoryTable history={history} />
        </div>
      </main>
    </div>
  );
}

export default App;
