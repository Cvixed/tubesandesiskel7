# Sistem Monitoring Jemuran Pintar IoT (Serial Bridge - Arduino Gateway)

Proyek ini adalah sistem IoT terpadu untuk memonitor kondisi cuaca (Cerah, Gerimis, Hujan) guna membantu pengguna menjaga jemuran pakaian mereka. Sistem mengintegrasikan perangkat keras Arduino, Backend lokal (Python/FastAPI) yang menjembatani komunikasi serial dengan database cloud (Supabase), serta Web Dashboard (React/Vite) yang modern dan responsif. Aplikasi ini juga dilengkapi dengan notifikasi instan via Telegram!

---

## ✨ Fitur Utama

- **Monitoring Cuaca Real-time**: Mendeteksi 3 kondisi cuaca (Cerah, Gerimis, Hujan) berdasarkan pembacaan sensor analog.
- **Smart Alert via Telegram**: Bot Telegram akan secara otomatis mengirim peringatan untuk segera mengangkat jemuran jika terdeteksi gerimis atau hujan, serta memberitahu jika cuaca kembali cerah.
- **Web Dashboard Interaktif**: Antarmuka responsif untuk melihat status cuaca terkini dan riwayat perubahan cuaca.
- **PWA (Progressive Web App) Ready**: Dashboard web dapat di-install layaknya aplikasi native di handphone Anda!
- **Data Logging Terpusat**: Seluruh riwayat perubahan cuaca dicatat secara persisten menggunakan Supabase PostgreSQL.
- **Fitur Simulasi (Mock Sensor)**: Ingin mendemokan sistem tanpa menyambungkan hardware Arduino? Sistem memiliki fitur *Mock Simulation Loop* bawaan yang bisa diaktifkan kapan saja dari dashboard.

---

## 📱 Cara Penggunaan di Handphone

Sistem ini didesain agar sangat mudah diakses dari perangkat genggam (handphone).

1. **Akses Dashboard PWA:**
   - Pastikan handphone Anda berada di jaringan WiFi/LAN yang sama dengan komputer server, atau akses melalui URL *hosting* (jika frontend sudah di-deploy).
   - Jika berjalan lokal, buka browser di HP Anda (Chrome/Safari) dan ketikkan IP lokal dari PC Anda beserta port Vite: `http://<IP_ADDRESS_KOMPUTER>:5173`.
   - **Install App (Add to Home Screen)**: Karena menggunakan Vite PWA, akan muncul prompt "Add to Home Screen" atau "Install App" di browser (biasanya di menu opsi browser titik tiga). Klik opsi tersebut agar aplikasi muncul di *home screen* HP layaknya aplikasi biasa. Anda kini bisa membukanya dengan layar penuh layaknya aplikasi native!
2. **Notifikasi Peringatan di HP:**
   - Buka aplikasi **Telegram** di handphone Anda.
   - Pastikan Anda sudah memulai chat (`/start`) dengan bot Telegram proyek ini.
   - Saat sensor mendeteksi gerimis atau hujan, handphone Anda akan langsung bergetar dan menerima pesan *push notification* dari bot untuk segera mengangkat jemuran!

---

## 💻 Cara Start pada Terminal

Proyek ini menggunakan script PowerShell (`start.ps1`) untuk mempermudah eksekusi backend dan *Serial Bridge*. 

### Persiapan (Hanya Pertama Kali)
1. Buka Terminal/PowerShell di direktori proyek (`TUBESANDESISKEL7`).
2. Buat Python Virtual Environment:
   ```bash
   python -m venv .venv
   ```
3. Install dependensi Backend:
   ```bash
   .venv\Scripts\pip install -r backend\requirements.txt
   ```
4. Install dependensi Frontend:
   ```bash
   cd frontend
   npm install
   cd ..
   ```
5. Sesuaikan konfigurasi `COM Port` Arduino di dalam file `start.ps1` atau `backend/serial_bridge.py` jika Anda menggunakan port selain yang dikonfigurasi (misal port `COM6`).

### 🚀 Cara Menjalankan Aplikasi

Anda membutuhkan 2 buah tab terminal untuk menjalankan keseluruhan sistem secara lokal.

**Terminal 1: Menjalankan Backend & Arduino Serial Bridge**
1. Buka PowerShell.
2. Jalankan script start di folder utama:
   ```powershell
   .\start.ps1
   ```
   *Script ini secara otomatis akan menyalakan server FastAPI (port 8000) di background dan menjalankan script penjembatan komunikasi serial dengan Arduino (serial_bridge.py).*

**Terminal 2: Menjalankan Frontend Web Dashboard**
1. Buka tab Terminal/PowerShell baru.
2. Masuk ke folder frontend dan jalankan mode development (gunakan flag `--host` agar bisa diakses device lain dalam 1 jaringan):
   ```bash
   cd frontend
   npm run dev -- --host
   ```
3. Web dashboard kini bisa diakses di browser PC: `http://localhost:5173` atau di IP Address yang muncul pada terminal tersebut.

---

## 📁 Struktur Folder Proyek

- `/arduino/`: Berisi kode program (`.ino`) yang akan di-upload ke mikrokontroler Arduino. Bertugas membaca data dari sensor dan berkomunikasi serial.
- `/backend/`: Dibangun menggunakan **Python FastAPI**. Mengurus routing, logika bisnis, integrasi ke Supabase via PostgREST, peringatan Bot Telegram, serta memuat `serial_bridge.py` untuk menangkap *stream* data dari port Serial Arduino.
- `/frontend/`: Dibangun dengan **React, Vite, Recharts, & TailwindCSS**. Antarmuka visual dashboard yang interaktif lengkap dengan fitur PWA, visualisasi grafik riwayat sensor, dan tombol untuk menyalakan/mematikan simulasi.
