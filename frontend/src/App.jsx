import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import StatusCard from './components/StatusCard';
import HistoryTable from './components/HistoryTable';
import WeatherForecast from './components/WeatherForecast';
import AlarmControl from './components/AlarmControl';
import HistoryChart from './components/HistoryChart';
import { fetchStatus, fetchHistory } from './services/api';
import { Toaster, toast } from 'react-hot-toast';

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
  const [isFetching, setIsFetching] = useState(false);
  const previousStatusRef = useRef(null);

  useEffect(() => {
    // Meminta izin Notifikasi saat pertama kali render
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const loadData = async () => {
      setIsFetching(true);
      try {
        const statusData = await fetchStatus();
        setStatus(statusData);
        
        const historyData = await fetchHistory();
        setHistory(historyData);
        
        setError(null);

        // Logic Notifikasi Perubahan Cuaca
        if (statusData && previousStatusRef.current && statusData.cuaca !== previousStatusRef.current) {
          if (statusData.cuaca?.toLowerCase() === 'hujan') {
            playBeep();
            toast.error('Hujan terdeteksi! Segera angkat jemuran Anda sekarang.', {
              duration: 8000,
              icon: '🌧️',
              style: { borderRadius: '10px', background: '#333', color: '#fff' }
            });
            if (Notification.permission === 'granted') {
              new Notification('Peringatan Jemuran!', { body: 'Hujan terdeteksi! Segera angkat jemuran.', icon: 'https://cdn-icons-png.flaticon.com/512/1163/1163624.png' });
            }
          } else if (statusData.cuaca?.toLowerCase() === 'cerah') {
            toast.success('Cuaca kembali cerah. Aman untuk menjemur.', {
              duration: 5000,
              icon: '☀️',
              style: { borderRadius: '10px', background: '#fff', color: '#333' }
            });
          } else if (statusData.cuaca?.toLowerCase() === 'gerimis') {
            toast('Gerimis mulai turun. Waspada!', {
              duration: 6000,
              icon: '🌦️',
            });
          }
        }
        previousStatusRef.current = statusData?.cuaca;

      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Gagal mengambil data dari database. Periksa koneksi internet Anda.');
      } finally {
        setIsFetching(false);
      }
    };

    // Initial load
    loadData();

    // Polling every 15 seconds
    const intervalId = setInterval(loadData, 15000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const getBgClass = (cuaca) => {
    switch (cuaca?.toLowerCase()) {
      case 'cerah': return 'bg-gradient-to-br from-amber-100 to-orange-200';
      case 'gerimis': return 'bg-gradient-to-br from-blue-100 to-slate-300';
      case 'hujan': return 'bg-gradient-to-br from-slate-700 to-slate-900 text-white';
      default: return 'bg-gray-50';
    }
  };

  const bgClass = getBgClass(status?.cuaca);

  return (
    <div className={`min-h-screen font-sans pb-8 sm:pb-12 transition-colors duration-1000 ${bgClass} relative overflow-hidden`}>
      {/* Dynamic Weather Background Animations */}
      {status?.cuaca?.toLowerCase() === 'hujan' && (
        <div className="absolute inset-0 pointer-events-none opacity-30">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute w-0.5 h-10 bg-blue-300 animate-raindrop" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 1}s`, animationDuration: `${0.5 + Math.random() * 0.5}s` }} />
          ))}
        </div>
      )}
      {status?.cuaca?.toLowerCase() === 'cerah' && (
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse pointer-events-none" />
      )}

      <Toaster position="top-right" />
      
      <div className="relative z-10">
        <Header isFetching={isFetching} cuaca={status?.cuaca} />

      <main className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-6">
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

          <AlarmControl cuaca={status?.cuaca} />
        </div>
        
        {/* Chart Section */}
        <div className="mb-8">
          <HistoryChart history={history} cuaca={status?.cuaca} />
        </div>

        {/* Table Section */}
        <div>
          <HistoryTable history={history} cuaca={status?.cuaca} />
        </div>
      </main>
      </div>
    </div>
  );
}

export default App;
