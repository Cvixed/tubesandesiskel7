import axios from 'axios';
import { supabase } from './supabase';

// Di Vercel, frontend dan backend ada di domain yang sama.
// Jadi di production kita biarkan kosong agar URL-nya relatif (mengikuti domain saat ini).
const isProd = import.meta.env.PROD;
const API_BASE_URL = import.meta.env.VITE_API_URL || (isProd ? '' : 'http://localhost:8000');

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Helper untuk format waktu sesuai dengan Timezone otomatis dari Browser/Perangkat
const formatWaktu = (isoString) => {
  if (!isoString || isoString === '-') return '-';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  }).format(date);
};

// ─── Dashboard Endpoints (langsung ke Supabase) ───────────────

export const fetchStatus = async () => {
  const { data, error } = await supabase
    .from('riwayat_cuaca')
    .select('waktu_kejadian, nilai_analog_sensor, id_status, status_cuaca(nama_kondisi, kode_warna)')
    .order('id_riwayat', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return {
      cuaca: '-',
      warna: 'Abu-abu',
      pesan_peringatan: 'Belum ada data dari sensor',
      waktu_update: '-',
      nilai_sensor: 0,
    };
  }

  const statusCuaca = data.status_cuaca || {};
  const pesan = data.id_status === 3 ? 'Segera Angkat Pakaian!' : 'Aman';

  return {
    cuaca: statusCuaca.nama_kondisi || '-',
    warna: statusCuaca.kode_warna || 'Abu-abu',
    pesan_peringatan: pesan,
    waktu_update: formatWaktu(data.waktu_kejadian),
    nilai_sensor: data.nilai_analog_sensor || 0,
  };
};

export const fetchHistory = async () => {
  const { data, error } = await supabase
    .from('riwayat_cuaca')
    .select('id_riwayat, nilai_analog_sensor, waktu_kejadian, id_status, status_cuaca(nama_kondisi, kode_warna)')
    .order('waktu_kejadian', { ascending: false })
    .limit(20);

  if (error || !data) return [];

  return data.map((row) => ({
    id_riwayat: row.id_riwayat,
    nilai_analog_sensor: row.nilai_analog_sensor,
    waktu_iso: row.waktu_kejadian,
    waktu_kejadian: formatWaktu(row.waktu_kejadian),
    nama_kondisi: row.status_cuaca?.nama_kondisi || '-',
    kode_warna: row.status_cuaca?.kode_warna || 'Abu-abu',
  }));
};

// ─── Mock Simulation (butuh backend running) ──────────────────

export const getMockStatus = async () => {
  try {
    const response = await api.get('/api/mock/status');
    return response.data;
  } catch {
    return { running: false, error: true };
  }
};

export const startMock = async () => {
  const response = await api.post('/api/mock/start');
  return response.data;
};

export const stopMock = async () => {
  const response = await api.post('/api/mock/stop');
  return response.data;
};

// ─── Alarm Control (butuh backend running) ────────────────────

export const sendAlarmCommand = async (deviceId, command) => {
  const response = await api.post('/api/alarm', {
    device_id: deviceId,
    command: command,
  });
  return response.data;
};

export default api;
