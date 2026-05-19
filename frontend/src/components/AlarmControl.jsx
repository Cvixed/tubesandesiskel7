import React, { useState } from 'react';
import { sendAlarmCommand } from '../services/api';
import { Bell, BellOff, Loader2 } from 'lucide-react';

const AlarmControl = () => {
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null); // 'on' or 'off'

  const handleCommand = async (cmd) => {
    setLoading(true);
    try {
      await sendAlarmCommand(1, cmd);
      setLastAction(cmd === 'ALARM_ON' ? 'on' : 'off');
      setTimeout(() => setLastAction(null), 3000);
    } catch (err) {
      console.error('Failed to send alarm command', err);
      alert('Gagal mengirim perintah. Pastikan backend online.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800">Kontrol Alarm Manual</h3>
        <p className="text-sm text-slate-500">Kendalikan buzzer di Arduino dari jarak jauh</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => handleCommand('ALARM_ON')}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-3 px-4 rounded-xl font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bell className="w-5 h-5" />}
          Bunyikan Alarm
        </button>
        
        <button
          onClick={() => handleCommand('ALARM_OFF')}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 py-3 px-4 rounded-xl font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BellOff className="w-5 h-5" />}
          Matikan Alarm
        </button>
      </div>

      {lastAction && (
        <p className={`mt-3 text-sm text-center font-medium ${lastAction === 'on' ? 'text-red-500' : 'text-slate-500'}`}>
          ✓ Perintah {lastAction === 'on' ? 'Bunyikan' : 'Matikan'} berhasil dikirim ke perangkat!
        </p>
      )}
    </div>
  );
};

export default AlarmControl;
