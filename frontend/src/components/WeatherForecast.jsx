import React, { useState, useEffect } from 'react';
import { MapPin, CloudRain, Sun, Cloud, Loader2, Wind, Droplets, Clock, CalendarDays } from 'lucide-react';

const WeatherForecast = () => {
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
          
          // API request diperluas: current (temp, humidity, wind, code), hourly (temp, code, prob), daily (min/max temp, code)
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-gray-500 text-sm font-medium">Memuat data satelit & cuaca...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-orange-50 rounded-2xl border border-orange-100 p-6 flex items-start gap-3">
        <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-orange-800 font-semibold mb-1">Prakiraan Cuaca Tidak Aktif</h4>
          <p className="text-orange-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const getWeatherIcon = (code, className="w-10 h-10") => {
    if (code <= 3) return <Sun className={`${className} text-amber-500`} />;
    if (code >= 51 && code <= 67) return <CloudRain className={`${className} text-blue-400`} />;
    if (code >= 71) return <CloudRain className={`${className} text-indigo-500`} />;
    return <Cloud className={`${className} text-gray-300`} />;
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
  
  // Mencari index jam saat ini di array hourly
  const currentHourString = current.time.substring(0, 14) + "00";
  let hourIndex = weather.hourly.time.findIndex(t => t === currentHourString);
  if (hourIndex === -1) hourIndex = 0; // fallback

  // Ambil data 6 jam ke depan
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
    <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl shadow-lg p-6 text-white h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-blue-200 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wider">{locationName}</span>
            </div>
            <h3 className="text-2xl font-bold">Prakiraan Cuaca</h3>
          </div>
          <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-md">
            {getWeatherIcon(current.weather_code, "w-12 h-12")}
          </div>
        </div>

        {/* Current Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <p className="text-blue-200 text-xs font-semibold mb-1 uppercase tracking-wider">Saat Ini</p>
            <p className="text-xl font-bold truncate">{getDesc(current.weather_code)}</p>
            <div className="flex items-center gap-3 mt-2 text-sm opacity-90">
              <div className="flex items-center gap-1" title="Suhu"><Sun className="w-3.5 h-3.5" />{current.temperature_2m}°</div>
              <div className="flex items-center gap-1" title="Kelembapan"><Droplets className="w-3.5 h-3.5" />{current.relative_humidity_2m}%</div>
              <div className="flex items-center gap-1" title="Angin"><Wind className="w-3.5 h-3.5" />{current.wind_speed_10m}</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
            <p className="text-blue-200 text-xs font-semibold mb-1 uppercase tracking-wider">Peluang Hujan (1 Jam)</p>
            <div className="flex items-end gap-1">
              <p className="text-4xl font-bold">{next6Hours[0].prob}<span className="text-xl text-blue-200">%</span></p>
            </div>
          </div>
        </div>

        {/* 6 Hours Timeline */}
        <div className="bg-black/20 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-1.5 text-blue-200 mb-3 text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" /> Per Jam Ke Depan
          </div>
          <div className="flex justify-between items-center text-center overflow-x-auto pb-1 gap-2">
            {next6Hours.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 min-w-[3rem]">
                <span className="text-xs text-blue-100">{h.time}</span>
                {getWeatherIcon(h.code, "w-6 h-6")}
                <span className="text-sm font-semibold">{h.prob}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tomorrow Brief */}
      <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
        <div className="flex items-center gap-2 text-sm text-blue-100">
          <CalendarDays className="w-4 h-4" />
          <span>Besok: <strong className="text-white">{getDesc(tomorrow.code)}</strong></span>
        </div>
        <div className="text-sm font-medium">
          <span className="text-blue-200">{tomorrow.min}°</span> / <span>{tomorrow.max}°C</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherForecast;
