import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HistoryChart = ({ history }) => {
  if (!history || history.length === 0) return null;

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
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-xl">
          <p className="text-sm text-slate-500 mb-1">{payload[0].payload.fullTime}</p>
          <p className="font-bold text-slate-800">
            Nilai Sensor: <span className="text-indigo-600">{payload[0].value}</span>
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
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Grafik Intensitas Air</h3>
        <p className="text-sm text-slate-500">Nilai sensor analog (semakin rendah = semakin basah)</p>
      </div>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              domain={[0, 1024]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="nilai" 
              stroke="#6366f1" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoryChart;
