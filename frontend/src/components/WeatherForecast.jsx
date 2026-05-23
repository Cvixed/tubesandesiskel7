import React, { useState, useEffect } from 'react';
import { MapPin, CloudRain, Sun, Cloud, Loader2, Wind, Droplets, Clock, CalendarDays } from 'lucide-react';

const WeatherForecast = ({ cuaca }) => {
  const isDark = cuaca?.toLowerCase() === 'hujan';
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState('Mencari lokasi...');

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolokasi tidak didukung oleh browser Anda');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
          );
          const data = await res.json();
          
          try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const geoData = await geoRes.json();
            setLocationName(geoData.address?.city || geoData.address?.town || geoData.address?.village || 'Lokasi Anda');
          } catch (e) {
            setLocationName('Lokasi Anda');
          }

          setWeather(data);
          setLoading(false);
        } catch (err) {
          setError('Gagal mengambil data cuaca');
          setLoading(false);
        }
      },
      (err) => {
        setError('Akses lokasi ditolak. Izinkan akses GPS untuk melihat prediksi cuaca.');
        setLoading(false);
      }
    );
  }, []);

  if (loading) {
    return (
      <div className={`rounded-3xl p-6 flex flex-col items-center justify-center min-h-[250px] sm:min-h-[300px] ${isDark ? 'glass-panel-dark' : 'glass-panel'}`}>
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className={`text-sm font-medium ${isDark ? 'text-blue-200' : 'text-slate-500'}`}>Memuat data cuaca...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-3xl p-4 sm:p-6 flex items-start gap-3 ${isDark ? 'glass-panel-dark' : 'glass-panel'}`}>
        <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-orange-600 font-semibold mb-1 text-sm sm:text-base">Prakiraan Cuaca Tidak Aktif</h4>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-white/70' : 'text-slate-600'}`}>{error}</p>
        </div>
      </div>
    );
  }

  const getWeatherIcon = (code, className="w-8 h-8 sm:w-10 sm:h-10") => {
    if (code <= 3) return <Sun className={`${className} text-amber-500`} />;
    if (code >= 51 && code <= 67) return <CloudRain className={`${className} text-blue-400`} />;
    if (code >= 71) return <CloudRain className={`${className} text-indigo-500`} />;
    return <Cloud className={`${className} text-gray-400`} />;
  };

  const getDesc = (code) => {
    if (code === 0) return 'Cerah';
    if (code >= 1 && code <= 3) return 'Berawan';
    if (code >= 51 && code <= 55) return 'Gerimis';
    if (code >= 61 && code <= 65) return 'Hujan Sedang';
    if (code >= 95) return 'Badai Petir';
    return 'Mendung';
  };

  const current = weather.current;
  
  const currentHourString = current.time.substring(0, 14) + "00";
  let hourIndex = weather.hourly.time.findIndex(t => t === currentHourString);
  if (hourIndex === -1) hourIndex = 0;

  const next6Hours = [1, 2, 3, 4, 5, 6].map(offset => {
    const idx = hourIndex + offset;
    const timeStr = weather.hourly.time[idx];
    const hourOnly = timeStr ? timeStr.substring(11, 16) : '--:--';
    return {
      time: hourOnly,
      temp: weather.hourly.temperature_2m[idx],
      prob: weather.hourly.precipitation_probability[idx],
      code: weather.hourly.weather_code[idx]
    };
  });

  const tomorrow = {
    max: weather.daily.temperature_2m_max[1],
    min: weather.daily.temperature_2m_min[1],
    code: weather.daily.weather_code[1]
  };

  return (
    <div className={`rounded-3xl p-4 sm:p-6 h-full flex flex-col justify-between transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl group
      ${isDark ? 'glass-panel-dark text-white' : 'glass-panel text-slate-800'}`}>
      <div>
        <div className="flex justify-between items-start mb-4 sm:mb-6">
          <div>
            <div className={`flex items-center gap-1.5 mb-1 ${isDark ? 'text-blue-200' : 'text-slate-500'}`}>
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium uppercase tracking-wider truncate max-w-[150px] sm:max-w-none">{locationName}</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold">Prakiraan Cuaca</h3>
          </div>
          <div className={`p-1.5 sm:p-2 rounded-xl sm:rounded-2xl backdrop-blur-md flex-shrink-0 ${isDark ? 'bg-white/10' : 'bg-white/50 shadow-sm border border-white'}`}>
            {getWeatherIcon(current.weather_code, "w-8 h-8 sm:w-12 sm:h-12")}
          </div>
        </div>

        {/* Current Info Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className={`backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border 
            ${isDark ? 'bg-white/10 border-white/10' : 'bg-white/40 border-white/50 shadow-sm'}`}>
            <p className={`text-[10px] sm:text-xs font-semibold mb-1 uppercase tracking-wider ${isDark ? 'text-blue-200' : 'text-slate-500'}`}>Saat Ini</p>
            <p className="text-base sm:text-xl font-bold truncate">{getDesc(current.weather_code)}</p>
            <div className={`flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 text-xs sm:text-sm opacity-90 flex-wrap ${isDark ? '' : 'text-slate-600'}`}>
              <div className="flex items-center gap-0.5 sm:gap-1" title="Suhu"><Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{current.temperature_2m}°</div>
              <div className="flex items-center gap-0.5 sm:gap-1" title="Kelembapan"><Droplets className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{current.relative_humidity_2m}%</div>
              <div className="flex items-center gap-0.5 sm:gap-1" title="Angin"><Wind className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{current.wind_speed_10m}</div>
            </div>
          </div>
          <div className={`backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border flex flex-col justify-between
            ${isDark ? 'bg-white/10 border-white/10' : 'bg-white/40 border-white/50 shadow-sm'}`}>
            <p className={`text-[10px] sm:text-xs font-semibold mb-1 uppercase tracking-wider ${isDark ? 'text-blue-200' : 'text-slate-500'}`}>Peluang Hujan</p>
            <div className="flex items-end gap-1">
              <p className="text-2xl sm:text-4xl font-bold">{next6Hours[0].prob}<span className={`text-base sm:text-xl ${isDark ? 'text-blue-200' : 'text-slate-500'}`}>%</span></p>
            </div>
          </div>
        </div>

        {/* 6 Hours Timeline */}
        <div className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4 border
          ${isDark ? 'bg-black/20 border-transparent' : 'bg-white/30 border-white/40 shadow-inner'}`}>
          <div className={`flex items-center gap-1.5 mb-2 sm:mb-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider
            ${isDark ? 'text-blue-200' : 'text-slate-500'}`}>
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Per Jam Ke Depan
          </div>
          <div className="flex justify-between items-center text-center overflow-x-auto pb-1 gap-1 sm:gap-2">
            {next6Hours.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-1 sm:gap-1.5 min-w-[2.5rem] sm:min-w-[3rem]">
                <span className={`text-[10px] sm:text-xs ${isDark ? 'text-blue-100' : 'text-slate-600'}`}>{h.time}</span>
                {getWeatherIcon(h.code, "w-5 h-5 sm:w-6 sm:h-6")}
                <span className="text-xs sm:text-sm font-semibold">{h.prob}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tomorrow Brief */}
      <div className={`flex items-center justify-between border-t pt-3 sm:pt-4 mt-auto
        ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <div className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${isDark ? 'text-blue-100' : 'text-slate-600'}`}>
          <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>Besok: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{getDesc(tomorrow.code)}</strong></span>
        </div>
        <div className="text-xs sm:text-sm font-medium">
          <span className={isDark ? 'text-blue-200' : 'text-slate-500'}>{tomorrow.min}°</span> / <span>{tomorrow.max}°C</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherForecast;
