import os
import threading
import time
import random
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import contextlib
import httpx

# ============================================================
# CONFIGURATION
# ============================================================

# Supabase Configuration
# ⚠️ Ganti dengan credentials Supabase Anda, atau set environment variables
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://cwymyrcgpannbvxsyvza.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "sb_publishable_aRfmN_3UXOEgB3VntEW8RA_AMH9Wqen")

# Supabase REST API headers
SUPABASE_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "8989165701:AAFooOwzsx9YbTDA7pF_nYxxsbXbPvuCYIU")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "5863934219")

# Base REST URL untuk PostgREST
REST_URL = f"{SUPABASE_URL}/rest/v1"

# --- Global State ---
current_status_id = None
pending_commands = {}  # device_id -> command string

# --- Mock Simulation State ---
mock_running = False
mock_thread = None
mock_lock = threading.Lock()

# Skenario loop: (id_status, range_nilai_min, range_nilai_max, durasi_detik)
MOCK_SCENARIO = [
    (1, 850, 1000, 8),   # Cerah
    (2, 450, 799,  6),   # Gerimis
    (3, 50,  350,  8),   # Hujan
    (2, 400, 700,  5),   # Gerimis
    (1, 800, 990,  7),   # Cerah
]

# ============================================================
# SUPABASE HELPER FUNCTIONS (via httpx + PostgREST)
# ============================================================

def db_insert(table: str, data: dict):
    """Insert data ke Supabase table."""
    url = f"{REST_URL}/{table}"
    response = httpx.post(url, json=data, headers=SUPABASE_HEADERS)
    response.raise_for_status()
    return response.json()

def db_select(table: str, select: str = "*", order: str = None, limit: int = None, filters: dict = None):
    """Select data dari Supabase table."""
    url = f"{REST_URL}/{table}"
    params = {"select": select}
    
    if order:
        params["order"] = order
    if limit:
        params["limit"] = str(limit)
    if filters:
        params.update(filters)
    
    response = httpx.get(url, params=params, headers=SUPABASE_HEADERS)
    response.raise_for_status()
    return response.json()

def send_telegram_alert(message: str):
    """Mengirim pesan notifikasi ke Telegram"""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("[Telegram] Bot token atau Chat ID tidak diatur, melewati notifikasi.")
        return
        
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "HTML"
    }
    
    try:
        # Kirim secara asynchronous fire-and-forget (atau dalam thread terpisah)
        # Di sini kita gunakan sinkronisasi sederhana untuk kemudahan karena ini contoh lokal
        threading.Thread(target=lambda: httpx.post(url, json=payload), daemon=True).start()
        print(f"[Telegram] Notifikasi dikirim: {message}")
    except Exception as e:
        print(f"[Telegram] Error: {e}")

# ============================================================
# SENSOR DATA PROCESSING
# ============================================================

def process_sensor_value(value: int, device_id: int = 1):
    """Proses nilai sensor, simpan ke database."""
    global current_status_id

    # Classification Rule - HARUS SAMA dengan Arduino sketch_local.ino
    if value > 500:
        new_status = 1  # Cerah
    elif value >= 300:
        new_status = 2  # Gerimis
    else:
        new_status = 3  # Hujan

    print(f"Sensor value={value}, Status={new_status}")

    # Selalu insert data terbaru ke Supabase
    try:
        db_insert("riwayat_cuaca", {
            "id_perangkat": device_id,
            "id_status": new_status,
            "nilai_analog_sensor": value,
            "waktu_kejadian": datetime.now().isoformat()
        })
        print(f"[DB] Data inserted: value={value}, status={new_status}")
    except Exception as e:
        print(f"[DB] Error inserting data: {e}")

    # Alarm Logic - kirim notifikasi Telegram saat status BERUBAH
    if current_status_id != new_status:
        if new_status == 3:
            pending_commands[device_id] = "ALARM_ON"
            send_telegram_alert("🌧️ <b>HUJAN TERDETEKSI!</b> 🌧️\n\n⚠️ Segera angkat jemuran Anda sekarang!\n\n📊 Nilai Sensor: " + str(value))
        elif new_status == 2:
            send_telegram_alert("🌦️ <b>GERIMIS TERDETEKSI!</b> 🌦️\n\n⚠️ Segera angkat jemuran Anda!\nGerimis bisa berubah menjadi hujan kapan saja.\n\n📊 Nilai Sensor: " + str(value))
        elif new_status == 1 and current_status_id in [2, 3]:
            pending_commands[device_id] = "ALARM_OFF"
            send_telegram_alert("☀️ <b>Cuaca Kembali Cerah</b> ☀️\n\n✅ Aman untuk menjemur kembali.\n\n📊 Nilai Sensor: " + str(value))

        current_status_id = new_status

    return new_status

# ============================================================
# MOCK SIMULATION
# ============================================================

def mock_simulation_loop():
    """Loop simulasi sensor dummy yang bisa dihentikan via toggle."""
    global mock_running
    scenario_index = 0
    print("[MOCK] Simulasi loop dimulai.")

    while True:
        with mock_lock:
            if not mock_running:
                break

        id_status, val_min, val_max, durasi = MOCK_SCENARIO[scenario_index]
        elapsed = 0
        interval = 2  # kirim data setiap 2 detik

        while elapsed < durasi:
            with mock_lock:
                if not mock_running:
                    print("[MOCK] Simulasi loop dihentikan.")
                    return

            value = random.randint(val_min, val_max)
            process_sensor_value(value)
            print(f"[MOCK] Kirim nilai={value} (skenario {scenario_index+1}/{len(MOCK_SCENARIO)})")
            time.sleep(interval)
            elapsed += interval

        scenario_index = (scenario_index + 1) % len(MOCK_SCENARIO)

    print("[MOCK] Simulasi loop selesai.")

# ============================================================
# FASTAPI APP
# ============================================================

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup - cek koneksi Supabase
    print("[Server] Starting up...")
    try:
        result = db_select("status_cuaca")
        print(f"[DB] Connected to Supabase. Status cuaca records: {len(result)}")
    except Exception as e:
        print(f"[DB] WARNING: Could not connect to Supabase: {e}")
    yield
    # Shutdown
    print("[Server] Shutting down...")

app = FastAPI(
    title="Sistem Monitoring Jemuran API",
    description="IoT Edge-to-Web Monitoring System with Arduino + ESP-01 WiFi",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# PYDANTIC MODELS
# ============================================================

class SensorData(BaseModel):
    device_id: int = 1
    sensor_value: int
    status_id: int

class MockData(BaseModel):
    value: int

class CommandData(BaseModel):
    device_id: int
    command: str

# ============================================================
# API ENDPOINTS - SENSOR (untuk Arduino)
# ============================================================

@app.post("/api/sensor")
def receive_sensor_data(data: SensorData):
    """
    Endpoint untuk Arduino mengirim data sensor via HTTP POST.
    Arduino mengirim: { device_id, sensor_value, status_id }
    Server memproses dan mengembalikan command jika ada.
    """
    new_status = process_sensor_value(data.sensor_value, data.device_id)

    # Cek apakah ada command pending untuk device ini
    command = pending_commands.pop(data.device_id, "NONE")

    return {
        "status": "ok",
        "processed_status": new_status,
        "command": command
    }

@app.get("/api/command/{device_id}")
def get_command(device_id: int):
    """
    Endpoint alternatif untuk Arduino mengambil command.
    """
    command = pending_commands.pop(device_id, "NONE")
    return {"command": command}

# ============================================================
# API ENDPOINTS - DASHBOARD (untuk Frontend)
# ============================================================

@app.get("/api/status")
def get_status():
    """Ambil status cuaca terbaru untuk dashboard."""
    try:
        # Query riwayat_cuaca JOIN status_cuaca, order by id_riwayat DESC, limit 1
        result = db_select(
            "riwayat_cuaca",
            select="waktu_kejadian,nilai_analog_sensor,id_status,status_cuaca(nama_kondisi,kode_warna)",
            order="id_riwayat.desc",
            limit=1
        )

        if not result:
            return {
                "status": "No data",
                "cuaca": "-",
                "warna": "Abu-abu",
                "pesan_peringatan": "Belum ada data dari sensor",
                "waktu_update": "-",
                "nilai_sensor": 0
            }

        row = result[0]
        status_cuaca = row.get("status_cuaca", {})
        status_id = row.get("id_status")
        pesan_peringatan = "Segera Angkat Pakaian!" if status_id == 3 else "Aman"

        return {
            "cuaca": status_cuaca.get("nama_kondisi", "-"),
            "warna": status_cuaca.get("kode_warna", "Abu-abu"),
            "pesan_peringatan": pesan_peringatan,
            "waktu_update": row.get("waktu_kejadian", "-"),
            "nilai_sensor": row.get("nilai_analog_sensor", 0)
        }
    except Exception as e:
        print(f"[API] Error getting status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
def get_history():
    """Ambil riwayat perubahan cuaca untuk tabel history."""
    try:
        result = db_select(
            "riwayat_cuaca",
            select="id_riwayat,nilai_analog_sensor,waktu_kejadian,id_status,status_cuaca(nama_kondisi,kode_warna)",
            order="waktu_kejadian.desc",
            limit=20
        )

        history = []
        for row in result:
            status_cuaca = row.get("status_cuaca", {})
            history.append({
                "id_riwayat": row.get("id_riwayat"),
                "nilai_analog_sensor": row.get("nilai_analog_sensor"),
                "waktu_kejadian": row.get("waktu_kejadian"),
                "nama_kondisi": status_cuaca.get("nama_kondisi", "-"),
                "kode_warna": status_cuaca.get("kode_warna", "Abu-abu"),
            })

        return history
    except Exception as e:
        print(f"[API] Error getting history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================
# API ENDPOINTS - ALARM CONTROL (untuk Frontend manual control)
# ============================================================

@app.post("/api/alarm")
def set_alarm(data: CommandData):
    """
    Frontend bisa mengirim command ke Arduino secara manual.
    Contoh: { "device_id": 1, "command": "ALARM_ON" }
    """
    if data.command not in ["ALARM_ON", "ALARM_OFF"]:
        raise HTTPException(status_code=400, detail="Command harus ALARM_ON atau ALARM_OFF")

    pending_commands[data.device_id] = data.command
    return {"status": "ok", "message": f"Command '{data.command}' queued for device {data.device_id}"}

# ============================================================
# API ENDPOINTS - MOCK SIMULATION
# ============================================================

@app.post("/api/mock_sensor")
def mock_sensor(data: MockData):
    """Kirim satu nilai sensor dummy secara manual."""
    process_sensor_value(data.value)
    return {"message": f"Processed mock value: {data.value}"}

@app.post("/api/mock/start")
def start_mock():
    """Mulai loop simulasi sensor dummy."""
    global mock_running, mock_thread
    with mock_lock:
        if mock_running:
            return {"status": "already_running", "message": "Simulasi sudah berjalan"}
        mock_running = True

    mock_thread = threading.Thread(target=mock_simulation_loop, daemon=True)
    mock_thread.start()
    return {"status": "started", "message": "Simulasi dummy dimulai"}

@app.post("/api/mock/stop")
def stop_mock():
    """Hentikan loop simulasi sensor dummy."""
    global mock_running
    with mock_lock:
        if not mock_running:
            return {"status": "already_stopped", "message": "Simulasi sudah berhenti"}
        mock_running = False
    return {"status": "stopped", "message": "Simulasi dummy dihentikan"}

@app.get("/api/mock/status")
def get_mock_status():
    """Cek apakah loop simulasi sedang berjalan."""
    return {"running": mock_running}

# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health_check():
    """Health check endpoint untuk monitoring."""
    try:
        result = db_select("status_cuaca")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return {
        "status": "ok",
        "database": db_status,
        "mock_running": mock_running,
        "version": "2.0.0"
    }
