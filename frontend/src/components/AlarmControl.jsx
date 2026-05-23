import React, { useState } from 'react';
import { sendAlarmCommand } from '../services/api';
import { Bell, BellOff, Loader2 } from 'lucide-react';

const AlarmControl = ({ cuaca, isNightMode }) => {
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null); // 'on' or 'off'
  const isDark = isNightMode || cuaca?.toLowerCase() === 'hujan';

  const handleCommand = async (cmd) => {
    setLoading(true);
    try {
      await sendAlarmCommand(1, cmd);
      setLastAction(cmd === 'ALARM_ON' ? 'on' : 'off');
      setTimeout(() => setLastAction(null), 3000);
    } catch (err) {
      console.error('Failed to send alarm command', err);
      alert('Gagal mengirim perintah ke database. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${isDark ? 'glass-panel-dark text-white' : 'glass-panel text-slate-800'}`}>
      <div className="mb-4">
        <h3 className="text-lg font-bold">Kontrol Buzzer</h3>
        <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-slate-500'}`}>Nyalakan atau matikan buzzer di Arduino dari jarak jauh</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => handleCommand('ALARM_ON')}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100
            ${isDark ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30' : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'}`}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bell className="w-5 h-5" />}
          Nyalakan Buzzer
        </button>
        
        <button
          onClick={() => handleCommand('ALARM_OFF')}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100
            ${isDark ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'}`}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BellOff className="w-5 h-5" />}
          Matikan Buzzer
        </button>
      </div>

      {lastAction && (
        <p className={`mt-3 text-sm text-center font-medium ${lastAction === 'on' ? 'text-red-500' : 'text-slate-500'}`}>
          ✓ Buzzer berhasil {lastAction === 'on' ? 'dinyalakan' : 'dimatikan'}!
        </p>
      )}
    </div>
  );
};

export default AlarmControl;
