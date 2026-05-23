import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HistoryChart = ({ history, cuaca, isNightMode }) => {
  if (!history || history.length === 0) return null;

  const isDark = isNightMode || cuaca?.toLowerCase() === 'hujan';

  // Siapkan data untuk chart (balik urutan agar data terlama di kiri, terbaru di kanan)
  const chartData = [...history].reverse().map(item => {
    // Parse waktu dari waktu_iso yang formatnya valid
    const date = new Date(item.waktu_iso || new Date().toISOString()); 
    // WAJIB tambahkan detik agar setiap titik pada sumbu X menjadi UNIK! 
    // Jika hanya menit, data di menit yang sama akan menumpuk dan merusak garis/tooltip.
    const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    
    return {
      time: timeStr,
      nilai: item.nilai_analog_sensor,
      kondisi: item.nama_kondisi,
      fullTime: item.waktu_kejadian // untuk tooltip
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 border shadow-xl rounded-xl backdrop-blur-md ${isDark ? 'bg-black/60 border-white/20 text-white' : 'bg-white/90 border-slate-100'}`}>
          <p className={`text-sm mb-1 ${isDark ? 'text-blue-200' : 'text-slate-500'}`}>{payload[0].payload.fullTime}</p>
          <p className="font-bold">
            Nilai Sensor: <span className={isDark ? 'text-blue-400' : 'text-indigo-600'}>{payload[0].value}</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Status: {payload[0].payload.kondisi}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`rounded-3xl p-6 mb-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${isDark ? 'glass-panel-dark text-white' : 'glass-panel text-slate-800'}`}>
      <div className="mb-6">
        <h3 className="text-lg font-bold">Grafik Intensitas Air</h3>
        <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-slate-500'}`}>Nilai sensor analog (semakin rendah = semakin basah)</p>
      </div>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.1)" : "#f1f5f9"} vertical={false} />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#bfdbfe' : '#94a3b8', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              domain={[0, 1024]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#bfdbfe' : '#94a3b8', fontSize: 12 }}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="nilai" 
              stroke={isDark ? "#60A5FA" : "#6366f1"} 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: isDark ? '#1e293b' : '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0, fill: isDark ? '#93c5fd' : '#4f46e5' }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoryChart;
