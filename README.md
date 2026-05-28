# ☁️ Sistem Monitoring Jemuran Pintar IoT

<div align="center">

**Sistem IoT Terpadu untuk Monitoring Cuaca & Perlindungan Jemuran Otomatis**

[![Arduino](https://img.shields.io/badge/Arduino-00979D?style=for-the-badge&logo=arduino&logoColor=white)](https://www.arduino.cc/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Telegram](https://img.shields.io/badge/Telegram_Bot-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://core.telegram.org/bots)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

</div>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Cara Kerja Data Flow (Arduino → Website)](#-cara-kerja-data-flow-arduino--website)
- [Tech Stack](#-tech-stack)
- [Struktur Folder Proyek](#-struktur-folder-proyek)
- [Prasyarat](#-prasyarat)
- [Setup Telegram Bot (BotFather)](#-setup-telegram-bot-botfather)
- [Setup Supabase (Database Cloud)](#-setup-supabase-database-cloud)
- [Konfigurasi Environment Variables](#-konfigurasi-environment-variables)
- [Instalasi & Menjalankan Lokal](#-instalasi--menjalankan-lokal)
- [Deploy ke Vercel](#-deploy-ke-vercel)
- [Konfigurasi Environment Variables di Vercel](#-konfigurasi-environment-variables-di-vercel)
- [PWA (Progressive Web App)](#-pwa-progressive-web-app)
- [API Endpoints](#-api-endpoints)
- [Skema Database Lengkap](#-skema-database-lengkap)
- [Troubleshooting](#-troubleshooting)

---

## 🌟 Tentang Proyek

Proyek ini adalah **Tugas Besar mata kuliah Arsitektur & Desain Sistem Komputer** berupa sistem IoT terpadu untuk memonitor kondisi cuaca (**Cerah**, **Gerimis**, **Hujan**) secara real-time guna membantu pengguna menjaga jemuran pakaian mereka.

Sistem mengintegrasikan:
- **Perangkat Keras Arduino** dengan Raindrop Sensor, LED Indikator, dan Buzzer
- **Backend Lokal** (Python/FastAPI) sebagai Serial Bridge antara Arduino dan Database Cloud
- **Database Cloud** (Supabase PostgreSQL) untuk penyimpanan data persisten
- **Web Dashboard** (React + Vite + TailwindCSS) yang modern, responsif, dan interaktif
- **Notifikasi Instan** via Telegram Bot

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🌦️ **Monitoring Cuaca Real-time** | Mendeteksi 3 kondisi cuaca (Cerah, Gerimis, Hujan) berdasarkan pembacaan sensor analog raindrop |
| 🔔 **Smart Alert via Telegram** | Bot Telegram otomatis mengirim peringatan saat gerimis/hujan terdeteksi dan notifikasi saat cuaca cerah kembali |
| 📊 **Web Dashboard Interaktif** | Antarmuka responsif dengan status cuaca, grafik sensor (Recharts), tabel riwayat, dan gauge animasi |
| 📱 **PWA (Progressive Web App)** | Dashboard web bisa di-install layaknya aplikasi native di handphone (Add to Home Screen) |
| 🌙 **Night Mode / Dark Mode** | Toggle mode gelap untuk kenyamanan penggunaan malam hari |
| 🔊 **Kontrol Buzzer Jarak Jauh** | Nyalakan/matikan buzzer Arduino dari website melalui Supabase (real-time command) |
| 📈 **Grafik Intensitas Air** | Visualisasi chart sensor analog menggunakan Recharts dengan custom tooltip |
| 🌍 **Prakiraan Cuaca Lokasi** | Integrasi Open-Meteo API + Geolocation untuk prediksi cuaca 6 jam ke depan & besok |
| 📋 **Data Logging Terpusat** | Seluruh riwayat perubahan cuaca tercatat secara persisten di Supabase PostgreSQL |
| 🔴 **Live/Offline Indicator** | Header menampilkan status koneksi live dengan animasi heartbeat |
| 🌧️ **Dynamic Background Animation** | Background berubah sesuai cuaca: animasi hujan, gerimis, atau efek matahari |
| 🔊 **Web Audio Alert** | Beep alert pada browser saat status cuaca berubah ke hujan |
| 📬 **Browser Push Notification** | Notifikasi native browser saat cuaca berubah |
| ⏰ **Auto-Cleanup (pg_cron)** | Otomatis membersihkan data sensor lama (>7 hari) menggunakan pg_cron Supabase |

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ARSITEKTUR SISTEM LENGKAP                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────┐        Serial USB         ┌──────────────────┐  │
│   │   ARDUINO     │  ──── (COM Port) ────►   │  PYTHON SCRIPT   │  │
│   │  Raindrop     │   DATA:value,status      │  serial_bridge   │  │
│   │  Sensor       │  ◄── ALARM_ON/OFF ────   │     .py          │  │
│   │  + LED (3x)   │                          │                  │  │
│   │  + Buzzer     │                          │  Membaca data    │  │
│   └──────────────┘                           │  serial dan      │  │
│                                              │  forward ke      │  │
│                                              │  Backend API     │  │
│                                              └────────┬─────────┘  │
│                                                       │            │
│                                              HTTP POST │            │
│                                              /api/sensor            │
│                                                       │            │
│                                                       ▼            │
│                                              ┌──────────────────┐  │
│                                              │  FASTAPI BACKEND │  │
│                                              │    (main.py)     │  │
│                                              │                  │  │
│                                              │  • Process Data  │  │
│                                              │  • Classify Cuaca│  │
│                                              │  • Send Telegram │  │
│                                              │  • REST API      │  │
│                                              └────────┬─────────┘  │
│                                                       │            │
│                                              PostgREST │            │
│                                              (HTTP)    │            │
│                                                       ▼            │
│   ┌──────────────┐                           ┌──────────────────┐  │
│   │   REACT WEB  │  ◄──── Supabase JS ────► │    SUPABASE      │  │
│   │  DASHBOARD   │       (Real-time)         │   PostgreSQL     │  │
│   │  (Vite+PWA)  │                           │                  │  │
│   │              │                           │  • riwayat_cuaca │  │
│   │  • StatusCard│                           │  • status_cuaca  │  │
│   │  • Chart     │                           │  • perangkat     │  │
│   │  • History   │                           │  • perintah_     │  │
│   │  • Alarm Ctrl│                           │    perangkat     │  │
│   └──────────────┘                           └──────────────────┘  │
│         │                                             │            │
│         │              ┌──────────────┐               │            │
│         └──────────────│  TELEGRAM    │◄──────────────┘            │
│          (Notifikasi)  │  BOT API    │  (Alert dari Backend)      │
│                        └──────────────┘                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Cara Kerja Data Flow (Arduino → Website)

Berikut adalah alur lengkap bagaimana data sensor dari Arduino sampai ke website:

### Tahap 1: Arduino Membaca Sensor & Mengirim Data Serial

```
Arduino (sketch_local.ino)
│
├── 1. analogRead(A3) → membaca Raindrop Sensor
├── 2. classifyWeather(value):
│       • value > 500  → Status 1 (Cerah)   → LED Hijau ON
│       • value >= 300 → Status 2 (Gerimis)  → LED Kuning ON
│       • value < 300  → Status 3 (Hujan)    → LED Merah ON
├── 3. Serial.print("DATA:") + value + "," + status
│       Contoh output: "DATA:750,1" (Cerah) atau "DATA:200,3" (Hujan)
└── 4. Mengirim setiap 2 detik (SEND_INTERVAL = 2000ms)
```

Arduino juga menerima perintah dari laptop:
- `ALARM_ON` → Kembali ke mode otomatis (buzzer mengikuti sensor)
- `ALARM_OFF` → Matikan buzzer total (manual override dari website)
- `AUTO` → Kembali ke mode otomatis

### Tahap 2: Python Serial Bridge Menangkap Data

```
serial_bridge.py (Berjalan di PC/Laptop)
│
├── 1. Membuka koneksi Serial: serial.Serial("COM6", 9600)
├── 2. Membaca line dari serial port:
│       line = serial_port.readline().decode('utf-8').strip()
├── 3. Parsing format "DATA:value,status":
│       parts = raw_data.split(",")
│       value = int(parts[0])    → 750
│       status = int(parts[1])   → 1
├── 4. Membuat payload JSON:
│       {
│         "device_id": 1,
│         "sensor_value": 750,
│         "status_id": 1
│       }
├── 5. HTTP POST ke Backend: /api/sensor
│       (Thread terpisah agar non-blocking)
└── 6. [Parallel Thread] Cek tabel 'perintah_perangkat' di Supabase
        → Jika ada command pending → Kirim ke Arduino via serial
        → Update status command jadi 'done'
```

### Tahap 3: Backend FastAPI Memproses Data

```
main.py (FastAPI Server - port 8000)
│
├── 1. Menerima POST /api/sensor dengan payload JSON
├── 2. process_sensor_value(value, device_id):
│       • Re-classify cuaca (value > 500 = Cerah, >= 300 = Gerimis, < 300 = Hujan)
│       • INSERT ke tabel riwayat_cuaca di Supabase via PostgREST
│       • Jika status BERUBAH:
│           ├── Hujan → Kirim Telegram "🌧️ HUJAN TERDETEKSI!"
│           ├── Gerimis → Kirim Telegram "🌦️ GERIMIS TERDETEKSI!"
│           └── Cerah (dari hujan/gerimis) → Kirim Telegram "☀️ Cuaca Kembali Cerah"
├── 3. Mengembalikan response + command pending (jika ada)
└── 4. Menyediakan REST API untuk Frontend Dashboard
```

### Tahap 4: Frontend Menampilkan Data di Website

```
React Dashboard (Vite + TailwindCSS)
│
├── 1. Supabase Client SDK → langsung query database
│       fetchStatus(): SELECT riwayat_cuaca ORDER BY id_riwayat DESC LIMIT 1
│       fetchHistory(): SELECT riwayat_cuaca ORDER BY waktu_kejadian DESC LIMIT 20
├── 2. Polling setiap 15 detik (setInterval)
├── 3. Menampilkan komponen:
│       ├── StatusCard     → Status cuaca terkini + sensor gauge
│       ├── WeatherForecast → Prakiraan cuaca API (Open-Meteo)
│       ├── AlarmControl   → Tombol ON/OFF buzzer Arduino
│       ├── HistoryChart   → Grafik intensitas air (Recharts)
│       └── HistoryTable   → Tabel riwayat 20 data terakhir
├── 4. Notifikasi saat status berubah:
│       ├── Toast notification (react-hot-toast)
│       ├── Web Audio beep (880Hz)
│       └── Browser Push Notification
└── 5. Dynamic background animation sesuai cuaca
```

### Tahap 5: Kontrol Buzzer dari Website ke Arduino

```
Website → Supabase → serial_bridge.py → Arduino
│
├── 1. User klik "Nyalakan Buzzer" / "Matikan Buzzer"
├── 2. INSERT ke tabel perintah_perangkat:
│       { id_perangkat: 1, command: "ALARM_ON", status: "pending" }
├── 3. serial_bridge.py polling tabel setiap 2 detik
├── 4. Menemukan command pending → kirim via serial ke Arduino:
│       serial_port.write("ALARM_ON\n".encode())
├── 5. Arduino menerima & respond: "CMD_OK:ALARM_ON"
└── 6. serial_bridge.py update status command jadi "done"
```

---

## 🛠️ Tech Stack

| Layer | Teknologi | Versi | Fungsi |
|-------|-----------|-------|--------|
| **Hardware** | Arduino UNO/Nano | - | Mikrokontroler + Raindrop Sensor + LED + Buzzer |
| **Serial Bridge** | Python + PySerial | 3.x | Menghubungkan Arduino (Serial) ke Backend (HTTP) |
| **Backend API** | FastAPI + Uvicorn | 2.0.0 | REST API, proses data, kirim notifikasi Telegram |
| **Database** | Supabase (PostgreSQL) | - | Cloud database + PostgREST API + Auto-cleanup |
| **Frontend** | React + Vite | React 19 / Vite 8 | Web Dashboard SPA interaktif |
| **Styling** | TailwindCSS | v4.3 | Utility-first CSS framework |
| **Charts** | Recharts | v3.8 | Grafik visualisasi data sensor |
| **PWA** | vite-plugin-pwa | v1.3 | Progressive Web App (installable) |
| **Notifications** | react-hot-toast | v2.6 | Toast notifications di browser |
| **Icons** | Lucide React | v1.16 | Icon library |
| **HTTP Client** | httpx (Python) / Supabase JS | - | Komunikasi API |
| **Telegram** | Telegram Bot API | - | Push notification ke HP |
| **Weather API** | Open-Meteo | - | Prakiraan cuaca berdasarkan GPS |
| **Deploy** | Vercel | - | Hosting frontend + serverless backend |

---

## 📁 Struktur Folder Proyek

```
TUBESANDESISKEL7/
│
├── 📁 arduino/                         # Kode Arduino
│   ├── compile_flags.txt               # Flag kompilasi C++
│   └── 📁 sketch_local/
│       └── sketch_local.ino            # Program utama Arduino
│
├── 📁 backend/                         # Backend Python FastAPI
│   ├── main.py                         # Server FastAPI (API + proses data + Telegram)
│   ├── serial_bridge.py                # Penghubung Arduino Serial ↔ Backend
│   ├── init_db.py                      # Script setup & seed database Supabase
│   ├── requirements.txt                # Dependensi Python
│   ├── .env.example                    # Template environment variables
│   ├── vercel.json                     # Konfigurasi deploy backend ke Vercel
│   └── Procfile                        # Konfigurasi proses (Railway/Heroku)
│
├── 📁 frontend/                        # Frontend React + Vite
│   ├── index.html                      # Entry point HTML
│   ├── package.json                    # Dependensi Node.js
│   ├── vite.config.js                  # Konfigurasi Vite + PWA
│   ├── tailwind.config.js              # Konfigurasi TailwindCSS
│   ├── postcss.config.js               # PostCSS config
│   ├── eslint.config.js                # ESLint config
│   ├── .env.example                    # Template environment variables frontend
│   ├── .gitignore                      # Git ignore frontend
│   ├── 📁 public/                      # Aset statis
│   │   ├── favicon.svg                 # Favicon
│   │   ├── icons.svg                   # Icon set
│   │   ├── pwa-192x192.png             # PWA icon 192px
│   │   └── pwa-512x512.png             # PWA icon 512px
│   └── 📁 src/                         # Source code React
│       ├── main.jsx                    # Entry point React
│       ├── App.jsx                     # Komponen utama + routing
│       ├── App.css                     # Styles aplikasi
│       ├── index.css                   # TailwindCSS + custom animations
│       ├── 📁 components/              # UI Components
│       │   ├── Header.jsx              # Header + Live/Offline indicator + Night Mode
│       │   ├── StatusCard.jsx          # Kartu status cuaca + animated gauge
│       │   ├── WeatherForecast.jsx     # Prakiraan cuaca (Open-Meteo API)
│       │   ├── AlarmControl.jsx        # Kontrol buzzer ON/OFF jarak jauh
│       │   ├── HistoryChart.jsx        # Grafik LineChart (Recharts)
│       │   ├── HistoryTable.jsx        # Tabel riwayat cuaca (responsive)
│       └── 📁 services/               # API & Services
│           ├── api.js                  # Fetch data, alarm command
│           └── supabase.js             # Supabase client configuration
│
├── start.ps1                           # PowerShell script start backend + serial bridge
├── vercel.json                         # Konfigurasi deploy monorepo ke Vercel
├── .gitignore                          # Git ignore root
├── .clangd                             # Clangd config untuk Arduino IDE
└── README.md                           # Dokumentasi (file ini)
```

---

## 📋 Prasyarat

Sebelum memulai, pastikan Anda sudah menginstall:

| Software | Versi Minimum | Link Download |
|----------|--------------|---------------|
| **Python** | 3.8+ | [python.org](https://www.python.org/downloads/) |
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |
| **Arduino IDE** | 2.0+ | [arduino.cc](https://www.arduino.cc/en/software) |
| **Git** | 2.x | [git-scm.com](https://git-scm.com/) |

### Hardware yang Dibutuhkan
| Komponen | Jumlah | Keterangan |
|----------|--------|------------|
| Arduino UNO / Nano | 1 | Mikrokontroler utama |
| Raindrop Sensor (MH-RD) | 1 | Sensor curah hujan analog |
| LED Hijau | 1 | Indikator Cerah |
| LED Kuning | 1 | Indikator Gerimis |
| LED Merah | 1 | Indikator Hujan |
| Buzzer Aktif | 1 | Alarm audio |
| Resistor 220Ω | 3 | Untuk setiap LED |
| Breadboard + Kabel Jumper | 1 set | Koneksi komponen |
| Kabel USB A-B | 1 | Koneksi Arduino ke PC |

### Konfigurasi Pin Arduino

| Pin | Komponen | Keterangan |
|-----|----------|------------|
| `A3` | Raindrop Sensor | Input Analog |
| `D2` | LED Hijau | Output Digital (Cerah) |
| `D3` | LED Kuning | Output Digital (Gerimis) |
| `D4` | LED Merah | Output Digital (Hujan) |
| `A0` | Buzzer | Output Digital (dipakai sebagai digital out) |

---

## 🤖 Setup Telegram Bot (BotFather)

Telegram Bot digunakan untuk mengirim **notifikasi peringatan otomatis** ke HP pengguna saat cuaca berubah.

### Langkah 1: Buat Bot Baru di Telegram

1. Buka aplikasi **Telegram** di HP atau Desktop
2. Cari user **`@BotFather`** di Telegram (bot resmi Telegram)
3. Klik **Start** atau ketik `/start`
4. Ketik perintah:
   ```
   /newbot
   ```
5. BotFather akan bertanya **nama bot**. Masukkan nama, contoh:
   ```
   Jemuran Alert Bot
   ```
6. BotFather akan bertanya **username bot** (harus berakhir `bot`). Masukkan, contoh:
   ```
   jemuran_alert_bot
   ```
7. ✅ BotFather akan memberikan **Bot Token** seperti ini:
   ```
   8989165701:AAFooOwzsx9YbTDA7pF_nYxxsbXbPvuCYIU
   ```
   > ⚠️ **Simpan token ini!** Token ini yang akan digunakan di environment variable `TELEGRAM_BOT_TOKEN`

### Langkah 2: Dapatkan Chat ID Anda

1. Buka bot yang baru dibuat di Telegram
2. Klik **Start** atau ketik `/start` agar bot bisa mengirim pesan kepada Anda
3. Buka browser dan akses URL ini (ganti `YOUR_BOT_TOKEN`):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
4. Anda akan melihat JSON response. Cari bagian `"chat":{"id":...}`:
   ```json
   {
     "result": [{
       "message": {
         "chat": {
           "id": 5863934219,
           "first_name": "Nama Anda",
           "type": "private"
         }
       }
     }]
   }
   ```
5. ✅ Angka `5863934219` adalah **Chat ID** Anda → gunakan untuk `TELEGRAM_CHAT_ID`

### Langkah 3: Test Bot

Kirim pesan test via browser:
```
https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage?chat_id=YOUR_CHAT_ID&text=Hello%20dari%20Jemuran%20Bot!
```

Jika sukses, Anda akan menerima pesan "Hello dari Jemuran Bot!" di Telegram.

### Kapan Bot Mengirim Notifikasi?

| Kondisi | Pesan yang Dikirim |
|---------|-------------------|
| Status berubah ke **Hujan** | 🌧️ **HUJAN TERDETEKSI!** ⚠️ Segera angkat jemuran Anda sekarang! |
| Status berubah ke **Gerimis** | 🌦️ **GERIMIS TERDETEKSI!** ⚠️ Segera angkat jemuran Anda! |
| Status kembali ke **Cerah** (dari hujan/gerimis) | ☀️ **Cuaca Kembali Cerah** ✅ Aman untuk menjemur kembali |

---

## 🗄️ Setup Supabase (Database Cloud)

Supabase adalah Backend-as-a-Service berbasis PostgreSQL yang digunakan sebagai database cloud untuk menyimpan semua data sensor dan perintah perangkat.

### Langkah 1: Buat Akun & Project

1. Buka [https://supabase.com](https://supabase.com) dan daftar/login
2. Klik **"New Project"**
3. Isi detail project:
   - **Name**: `monitoring-jemuran` (atau nama lain)
   - **Database Password**: Buat password yang kuat (simpan!)
   - **Region**: Pilih yang terdekat (contoh: `Southeast Asia (Singapore)`)
4. Klik **"Create new project"** dan tunggu sampai selesai

### Langkah 2: Dapatkan API Credentials

1. Buka **Project Settings** (ikon gear ⚙️ di sidebar)
2. Klik **API** di menu kiri
3. Catat 2 hal penting:

   | Credential | Contoh Nilai | Keterangan |
   |------------|-------------|------------|
   | **Project URL** | `https://cwymyrcgpannbvxsyvza.supabase.co` | Digunakan sebagai `SUPABASE_URL` |
   | **anon/public key** | `eyJhbGciOi...` atau `sb_publishable_...` | Digunakan sebagai `SUPABASE_KEY` |

### Langkah 3: Buat Tabel Database

1. Buka **SQL Editor** di sidebar Supabase Dashboard
2. Klik **"New Query"**
3. Copy-paste SQL berikut dan klik **Run**:

```sql
-- ============================================================
-- SETUP DATABASE - Sistem Monitoring Jemuran
-- ============================================================

-- 1. Table perangkat (data perangkat IoT)
CREATE TABLE IF NOT EXISTS perangkat (
    id_perangkat SERIAL PRIMARY KEY,
    nama_perangkat VARCHAR(255),
    lokasi_pemasangan VARCHAR(255)
);

-- 2. Table status_cuaca (referensi status)
CREATE TABLE IF NOT EXISTS status_cuaca (
    id_status INTEGER PRIMARY KEY,
    nama_kondisi VARCHAR(50),
    kode_warna VARCHAR(20)
);

-- 3. Table riwayat_cuaca (data sensor utama)
CREATE TABLE IF NOT EXISTS riwayat_cuaca (
    id_riwayat SERIAL PRIMARY KEY,
    id_perangkat INTEGER REFERENCES perangkat(id_perangkat),
    id_status INTEGER REFERENCES status_cuaca(id_status),
    nilai_analog_sensor INTEGER,
    waktu_kejadian TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table perintah_perangkat (command dari website ke Arduino)
CREATE TABLE IF NOT EXISTS perintah_perangkat (
    id_perintah SERIAL PRIMARY KEY,
    id_perangkat INTEGER REFERENCES perangkat(id_perangkat),
    command VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    waktu_dibuat TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_riwayat_waktu ON riwayat_cuaca(waktu_kejadian DESC);
CREATE INDEX IF NOT EXISTS idx_riwayat_perangkat ON riwayat_cuaca(id_perangkat);

-- 6. Seed Data: status_cuaca
INSERT INTO status_cuaca (id_status, nama_kondisi, kode_warna)
VALUES 
    (1, 'Cerah', 'Hijau'),
    (2, 'Gerimis', 'Kuning'),
    (3, 'Hujan', 'Merah')
ON CONFLICT (id_status) DO NOTHING;

-- 7. Seed Data: perangkat
INSERT INTO perangkat (id_perangkat, nama_perangkat, lokasi_pemasangan)
VALUES (1, 'Sensor Jemuran Utama', 'Atap Rumah')
ON CONFLICT (id_perangkat) DO NOTHING;

-- 8. PENTING: Disable RLS agar API bisa akses tanpa auth
ALTER TABLE riwayat_cuaca DISABLE ROW LEVEL SECURITY;
ALTER TABLE status_cuaca DISABLE ROW LEVEL SECURITY;
ALTER TABLE perangkat DISABLE ROW LEVEL SECURITY;
ALTER TABLE perintah_perangkat DISABLE ROW LEVEL SECURITY;
```

### Langkah 4: (Opsional) Setup Auto-Cleanup dengan pg_cron

Untuk otomatis menghapus data sensor lama (>7 hari), jalankan SQL ini:

```sql
-- Aktifkan extension pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Jadwalkan cleanup setiap hari jam 00:00
SELECT cron.schedule(
    'cleanup_old_sensor_data',
    '0 0 * * *',
    $$ DELETE FROM riwayat_cuaca WHERE waktu_kejadian < NOW() - INTERVAL '7 days' $$
);
```

### Langkah 5: Verifikasi Setup

Setelah menjalankan SQL di atas, verifikasi tabel sudah dibuat:
1. Buka **Table Editor** di sidebar
2. Pastikan ada 4 tabel: `perangkat`, `status_cuaca`, `riwayat_cuaca`, `perintah_perangkat`
3. Cek tabel `status_cuaca` memiliki 3 baris (Cerah, Gerimis, Hujan)
4. Cek tabel `perangkat` memiliki 1 baris (Sensor Jemuran Utama)

### Diagram Relasi Tabel

```
┌───────────────────┐     ┌───────────────────┐
│    perangkat       │     │   status_cuaca     │
├───────────────────┤     ├───────────────────┤
│ id_perangkat (PK) │     │ id_status (PK)    │
│ nama_perangkat     │     │ nama_kondisi      │
│ lokasi_pemasangan  │     │ kode_warna        │
└────────┬──────────┘     └────────┬──────────┘
         │                         │
         │    ┌────────────────────┘
         │    │
         ▼    ▼
┌───────────────────────┐
│    riwayat_cuaca       │
├───────────────────────┤
│ id_riwayat (PK)       │
│ id_perangkat (FK) ────►│ perangkat
│ id_status (FK) ───────►│ status_cuaca
│ nilai_analog_sensor    │
│ waktu_kejadian         │
└───────────────────────┘

┌───────────────────────┐
│  perintah_perangkat    │
├───────────────────────┤
│ id_perintah (PK)      │
│ id_perangkat (FK) ────►│ perangkat
│ command (VARCHAR)      │  "ALARM_ON" / "ALARM_OFF"
│ status (VARCHAR)       │  "pending" / "done"
│ waktu_dibuat           │
└───────────────────────┘
```

---

## 🔐 Konfigurasi Environment Variables

### Backend (`backend/.env`)

Buat file `backend/.env` berdasarkan `backend/.env.example`:

```env
# Supabase Configuration
# Dapatkan dari: https://supabase.com → Project Settings → API
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY

# Telegram Bot Configuration
# Dapatkan dari: @BotFather di Telegram
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID=YOUR_TELEGRAM_CHAT_ID

# Server Configuration (opsional)
PORT=8000
HOST=0.0.0.0
```

### Frontend (`frontend/.env`)

Buat file `frontend/.env` berdasarkan `frontend/.env.example`:

```env
# Supabase Configuration (frontend langsung query Supabase)
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY

# Backend API URL (hanya untuk mode lokal dengan Arduino)
VITE_API_URL=http://localhost:8000
```

### Tabel Ringkasan Environment Variables

| Variable | Digunakan Di | Wajib? | Keterangan |
|----------|-------------|--------|------------|
| `SUPABASE_URL` | Backend, Frontend, Vercel | ✅ Ya | URL project Supabase |
| `SUPABASE_KEY` | Backend, Frontend, Vercel | ✅ Ya | Anon/public key Supabase |
| `TELEGRAM_BOT_TOKEN` | Backend, Vercel | ✅ Ya | Token dari @BotFather |
| `TELEGRAM_CHAT_ID` | Backend, Vercel | ✅ Ya | Chat ID tujuan notifikasi |
| `PORT` | Backend | ❌ Opsional | Port server (default: 8000) |
| `VITE_SUPABASE_URL` | Frontend | ✅ Ya | Sama dengan SUPABASE_URL |
| `VITE_SUPABASE_KEY` | Frontend | ✅ Ya | Sama dengan SUPABASE_KEY |
| `VITE_API_URL` | Frontend | ❌ Opsional | URL backend lokal |

---

## 💻 Instalasi & Menjalankan Lokal

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/tubesandesiskel7.git
cd tubesandesiskel7
```

### 2. Setup Arduino

1. Buka `arduino/sketch_local/sketch_local.ino` di **Arduino IDE**
2. Rangkai komponen sesuai [Konfigurasi Pin](#konfigurasi-pin-arduino)
3. Pilih Board & Port yang sesuai di Arduino IDE
4. Klik **Upload** ✅
5. Buka **Serial Monitor** untuk verifikasi output:
   ```
   === Sistem Monitoring Jemuran ===
   Initializing...
   Startup animation done.
   SYSTEM_READY
   DATA:850,1
   DATA:745,1
   ```
6. **Tutup Serial Monitor** sebelum menjalankan `serial_bridge.py`

### 3. Setup Python Backend

```bash
# Buat virtual environment
python -m venv .venv

# Aktifkan virtual environment (Windows)
.venv\Scripts\activate

# Install dependensi
pip install -r backend\requirements.txt
```

### 4. Setup Frontend

```bash
cd frontend
npm install
cd ..
```

### 5. Konfigurasi Environment

```bash
# Backend
copy backend\.env.example backend\.env
# Edit backend\.env dan isi credentials Supabase & Telegram

# Frontend
copy frontend\.env.example frontend\.env
# Edit frontend\.env dan isi credentials Supabase
```

### 6. Sesuaikan COM Port

Edit file `backend/serial_bridge.py` atau `start.ps1`, ubah `SERIAL_PORT` sesuai Arduino Anda:

```python
# Di serial_bridge.py, baris 9
SERIAL_PORT = "COM6"  # Ganti sesuai port Arduino Anda (cek Device Manager)
```

### 7. Menjalankan Aplikasi

Anda membutuhkan **2 tab terminal**:

#### Terminal 1: Backend + Serial Bridge

```powershell
# Cara cepat menggunakan script PowerShell:
.\start.ps1

# Atau jalankan manual:
cd backend
..\.venv\Scripts\python -m uvicorn main:app --host 0.0.0.0 --port 8000
# (buka tab baru)
..\.venv\Scripts\python serial_bridge.py
```

Script `start.ps1` secara otomatis:
1. Menjalankan **FastAPI server** (port 8000) di background
2. Menjalankan **Serial Bridge** (membaca Arduino COM port)
3. Menghentikan semua proses saat Ctrl+C

#### Terminal 2: Frontend Web Dashboard

```bash
cd frontend
npm run dev -- --host
```

### 8. Akses Aplikasi

| Alamat | Keterangan |
|--------|------------|
| `http://localhost:5173` | Web Dashboard (dari PC) |
| `http://<IP_PC>:5173` | Web Dashboard (dari HP di jaringan yang sama) |
| `http://localhost:8000/docs` | Swagger API Documentation |
| `http://localhost:8000/api/health` | Health check endpoint |

---

## 🚀 Deploy ke Vercel

Proyek ini dapat di-deploy ke **Vercel** sebagai serverless application. Frontend akan di-host sebagai static site, dan backend sebagai serverless Python function.

### Langkah 1: Persiapkan Repository

1. Pastikan semua kode sudah di-push ke GitHub:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

### Langkah 2: Import Project di Vercel

1. Buka [https://vercel.com](https://vercel.com) dan login dengan akun GitHub
2. Klik **"Add New..."** → **"Project"**
3. Pilih repository `tubesandesiskel7` dari GitHub
4. Di halaman konfigurasi:
   - **Framework Preset**: Pilih `Vite`
   - **Root Directory**: Isi `frontend` (karena frontend adalah yang akan di-deploy sebagai web)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Klik **"Deploy"**

### Langkah 3: Konfigurasi Backend (Opsional)

Jika ingin deploy backend FastAPI juga ke Vercel:

File `backend/vercel.json` sudah dikonfigurasi:
```json
{
  "builds": [
    {
      "src": "main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "main.py"
    }
  ]
}
```

> ⚠️ **Catatan**: Backend Vercel bersifat serverless, sehingga fitur yang membutuhkan state persisten (Serial Bridge) **tidak akan berjalan** di Vercel. Backend Vercel hanya untuk endpoint API stateless (status, history, health check). Untuk fitur Arduino Serial Bridge, jalankan backend secara lokal.

---

## ⚙️ Konfigurasi Environment Variables di Vercel

Setelah project di-deploy, Anda perlu menambahkan environment variables agar aplikasi bisa terkoneksi ke Supabase dan Telegram.

### Cara Menambahkan:

1. Buka **Vercel Dashboard** → Pilih project Anda
2. Klik **Settings** → **Environment Variables**
3. Tambahkan variabel berikut satu per satu:

| Variable Name | Environments | Keterangan |
|--------------|-------------|------------|
| `SUPABASE_URL` | Production, Preview | URL project Supabase Anda (contoh: `https://xxxx.supabase.co`) |
| `SUPABASE_KEY` | Production, Preview | Anon/public key Supabase |
| `TELEGRAM_BOT_TOKEN` | Production, Preview | Token bot dari @BotFather |
| `TELEGRAM_CHAT_ID` | Production, Preview | Chat ID tujuan notifikasi |

> Untuk frontend Vite, gunakan prefix `VITE_`:

| Variable Name | Environments | Keterangan |
|--------------|-------------|------------|
| `VITE_SUPABASE_URL` | Production, Preview | Sama dengan SUPABASE_URL |
| `VITE_SUPABASE_KEY` | Production, Preview | Sama dengan SUPABASE_KEY |

4. Klik **Save** untuk setiap variabel
5. **Redeploy** project agar perubahan aktif:
   - Klik **Deployments** → pilih deployment terbaru → **Redeploy**

### Screenshot Referensi Environment Variables

Environment variables yang perlu diisi di Vercel Dashboard:

```
┌────────────────────────────────────────────────────────────────┐
│ Environment Variables                                          │
├────────────────────────┬───────────────────┬──────────────────┤
│ Name                   │ Environments      │ Last Updated     │
├────────────────────────┼───────────────────┼──────────────────┤
│ SUPABASE_URL           │ Production,Preview│ Sensitive 🟢     │
│ SUPABASE_KEY           │ Production,Preview│ Sensitive 🟢     │
│ TELEGRAM_BOT_TOKEN     │ Production,Preview│ Sensitive 🟢     │
│ TELEGRAM_CHAT_ID       │ Production,Preview│ Sensitive 🟢     │
│ VITE_SUPABASE_URL      │ Production,Preview│ Sensitive 🟢     │
│ VITE_SUPABASE_KEY      │ Production,Preview│ Sensitive 🟢     │
└────────────────────────┴───────────────────┴──────────────────┘
```

---

## 📱 PWA (Progressive Web App)

Dashboard ini menggunakan **Vite PWA Plugin** sehingga bisa di-install sebagai aplikasi native di handphone.

### Cara Install PWA di Handphone

1. Buka URL dashboard di browser HP (Chrome/Safari):
   - **Lokal**: `http://<IP_ADDRESS_PC>:5173`
   - **Online**: URL Vercel deployment
2. Browser akan menampilkan banner **"Add to Home Screen"** atau akses menu (titik tiga `⋮`)
3. Pilih **"Install App"** atau **"Add to Home Screen"**
4. ✅ Aplikasi kini muncul di home screen HP Anda layaknya aplikasi native!

### Fitur PWA

| Fitur | Status |
|-------|--------|
| Install to Home Screen | ✅ |
| Standalone Display (fullscreen) | ✅ |
| Custom App Icon (192x192, 512x512) | ✅ |
| Auto Update (registerType: autoUpdate) | ✅ |
| Offline Support | ⚠️ Partial (perlu koneksi untuk data) |
| Push Notification (Browser) | ✅ |

### Konfigurasi PWA

PWA dikonfigurasi di `frontend/vite.config.js`:
```javascript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Sistem Monitoring Jemuran',
    short_name: 'Jemuran IoT',
    description: 'IoT Edge-to-Web Berbasis Arduino',
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
    icons: [
      { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
    ]
  }
})
```

---


## 📡 API Endpoints

### Endpoints yang Tersedia

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/sensor` | Arduino mengirim data sensor |
| `GET` | `/api/status` | Ambil status cuaca terbaru |
| `GET` | `/api/history` | Ambil riwayat 20 data terakhir |
| `GET` | `/api/command/{device_id}` | Arduino mengambil command pending |
| `POST` | `/api/alarm` | Kirim command ALARM_ON/ALARM_OFF |
| `GET` | `/api/health` | Health check (DB status, version) |

### Contoh Request & Response

#### POST `/api/sensor` (dari Arduino/Serial Bridge)
```json
// Request Body
{
  "device_id": 1,
  "sensor_value": 750,
  "status_id": 1
}

// Response
{
  "status": "ok",
  "processed_status": 1,
  "command": "NONE"
}
```

#### GET `/api/status` (untuk Dashboard)
```json
// Response
{
  "cuaca": "Cerah",
  "warna": "Hijau",
  "pesan_peringatan": "Aman",
  "waktu_update": "2026-05-28T18:30:00",
  "nilai_sensor": 750
}
```

#### GET `/api/health`
```json
// Response
{
  "status": "ok",
  "database": "connected",
  "version": "2.0.0"
}
```

---

## 🗃️ Skema Database Lengkap

### Tabel `perangkat`

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|-----------|------------|
| `id_perangkat` | SERIAL | PRIMARY KEY | ID unik perangkat |
| `nama_perangkat` | VARCHAR(255) | - | Nama perangkat (contoh: "Sensor Jemuran Utama") |
| `lokasi_pemasangan` | VARCHAR(255) | - | Lokasi (contoh: "Atap Rumah") |

### Tabel `status_cuaca`

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|-----------|------------|
| `id_status` | INTEGER | PRIMARY KEY | 1=Cerah, 2=Gerimis, 3=Hujan |
| `nama_kondisi` | VARCHAR(50) | - | Nama kondisi cuaca |
| `kode_warna` | VARCHAR(20) | - | Warna indikator (Hijau/Kuning/Merah) |

### Tabel `riwayat_cuaca`

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|-----------|------------|
| `id_riwayat` | SERIAL | PRIMARY KEY | ID unik riwayat |
| `id_perangkat` | INTEGER | FK → perangkat | Perangkat pengirim |
| `id_status` | INTEGER | FK → status_cuaca | Status cuaca |
| `nilai_analog_sensor` | INTEGER | - | Nilai analog 0-1024 |
| `waktu_kejadian` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp kejadian |

### Tabel `perintah_perangkat`

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|-----------|------------|
| `id_perintah` | SERIAL | PRIMARY KEY | ID unik perintah |
| `id_perangkat` | INTEGER | FK → perangkat | Target perangkat |
| `command` | VARCHAR(50) | - | "ALARM_ON" atau "ALARM_OFF" |
| `status` | VARCHAR(20) | DEFAULT 'pending' | "pending" atau "done" |
| `waktu_dibuat` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp perintah |

### Klasifikasi Nilai Sensor

| Nilai Sensor Analog | Status | Warna | Keterangan |
|---------------------|--------|-------|------------|
| `> 500` | 1 - Cerah | 🟢 Hijau | Permukaan sensor kering |
| `300 - 500` | 2 - Gerimis | 🟡 Kuning | Sedikit air terdeteksi |
| `< 300` | 3 - Hujan | 🔴 Merah | Banyak air terdeteksi |

---

## ❓ Troubleshooting

### Serial Bridge tidak bisa konek ke Arduino

```
❌ Gagal membuka COM6.
   1. Cek port di Device Manager
   2. Tutup Serial Monitor Arduino IDE
```

**Solusi:**
1. Buka **Device Manager** → **Ports (COM & LPT)** → Catat port Arduino (misal COM3)
2. **Tutup Serial Monitor** di Arduino IDE (hanya 1 program bisa akses serial port)
3. Edit `SERIAL_PORT` di `backend/serial_bridge.py`:
   ```python
   SERIAL_PORT = "COM3"  # Sesuaikan
   ```

### Frontend tidak bisa ambil data

**Solusi:**
1. Pastikan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_KEY` sudah benar di `frontend/.env`
2. Pastikan tabel sudah dibuat di Supabase dan RLS di-disable
3. Cek console browser (F12) untuk error message

### Telegram Bot tidak mengirim notifikasi

**Solusi:**
1. Pastikan Anda sudah ketik `/start` di bot Telegram
2. Verifikasi `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` sudah benar
3. Test manual via browser:
   ```
   https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>&text=Test
   ```

### Supabase RLS Error (403 Forbidden)

**Solusi:**
Jalankan SQL ini di Supabase SQL Editor:
```sql
ALTER TABLE riwayat_cuaca DISABLE ROW LEVEL SECURITY;
ALTER TABLE status_cuaca DISABLE ROW LEVEL SECURITY;
ALTER TABLE perangkat DISABLE ROW LEVEL SECURITY;
ALTER TABLE perintah_perangkat DISABLE ROW LEVEL SECURITY;
```

### Vercel Deployment gagal build

**Solusi:**
1. Pastikan **Root Directory** di-set ke `frontend`
2. Pastikan **Node.js version** >= 18 di Vercel settings
3. Cek apakah semua environment variables sudah diisi di Vercel Dashboard

---

## 📝 Catatan Penting

- ⚠️ **Jangan commit credentials asli** ke repository publik. Gunakan `.env` file dan `.gitignore`.
- 🔒 Supabase `anon key` bersifat publik dan aman digunakan di frontend selama RLS dikonfigurasi dengan benar.
- 🔌 Serial Bridge (`serial_bridge.py`) hanya bisa berjalan di PC/Laptop yang terhubung langsung ke Arduino via USB.
- 🌐 Frontend di Vercel dapat berjalan tanpa backend lokal karena langsung query Supabase menggunakan Supabase JS Client.
- 🔄 Polling dashboard setiap 15 detik untuk data terbaru, bukan real-time websocket.

---

## 👥 Kelompok 7 — Arsitektur & Desain Sistem Komputer

Tugas Besar Mata Kuliah **Arsitektur & Desain Sistem Komputer**

---

<div align="center">

**⭐ Jika proyek ini membantu, berikan bintang di repository! ⭐**

</div>
