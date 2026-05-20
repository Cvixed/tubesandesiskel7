import { supabase } from './supabase';

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

// ─── Dashboard Endpoints ───────────────

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

// ─── Mock Simulation (Full Serverless) ──────────────────

let mockInterval = null;
const MOCK_SCENARIO = [
    { id_status: 1, val_min: 850, val_max: 1000 }, // Cerah
    { id_status: 2, val_min: 450, val_max: 799 },  // Gerimis
    { id_status: 3, val_min: 50, val_max: 350 },   // Hujan
    { id_status: 2, val_min: 400, val_max: 700 },  // Gerimis
];

export const getMockStatus = async () => {
  return { running: mockInterval !== null };
};

export const startMock = async () => {
  if (mockInterval) return { status: 'already_running' };
  
  let scenarioIndex = 0;
  let counter = 0;
  
  // Jalan setiap 3 detik
  mockInterval = setInterval(async () => {
      const scenario = MOCK_SCENARIO[scenarioIndex];
      const value = Math.floor(Math.random() * (scenario.val_max - scenario.val_min + 1)) + scenario.val_min;
      
      try {
          await supabase.from('riwayat_cuaca').insert([{
              id_perangkat: 1,
              id_status: scenario.id_status,
              nilai_analog_sensor: value
          }]);
      } catch (err) {
          console.error("Mock insert failed", err);
      }
      
      counter++;
      // Ganti cuaca setiap 3 kali kirim
      if (counter >= 3) {
          counter = 0;
          scenarioIndex = (scenarioIndex + 1) % MOCK_SCENARIO.length;
      }
  }, 3000);
  
  return { status: 'started' };
};

export const stopMock = async () => {
  if (mockInterval) {
      clearInterval(mockInterval);
      mockInterval = null;
  }
  return { status: 'stopped' };
};

// ─── Alarm Control (Serverless Supabase) ────────────────────

export const sendAlarmCommand = async (deviceId, command) => {
  const { data, error } = await supabase
    .from('perintah_perangkat')
    .insert([{ id_perangkat: deviceId, command: command, status: 'pending' }]);
    
  if (error) {
    console.error("Failed to insert command to Supabase", error);
    throw error;
  }
  
  return data;
};

