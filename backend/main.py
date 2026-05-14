import sqlite3
import serial
import threading
import time
import random
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import contextlib

DB_PATH = 'jemuran.db'
SERIAL_PORT = 'COM3'  # Change to your exact Arduino serial port
BAUD_RATE = 9600

# Global state to keep track of the current status
current_status_id = None
ser = None

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

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def read_serial_loop():
    global current_status_id, ser
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        print(f"Connected to Serial Port: {SERIAL_PORT}")
    except serial.SerialException as e:
        print(f"Failed to connect to Serial Port: {e}")
        print("Running in MOCK mode. API will work, but no real sensor data will be read.")
        ser = None

    while True:
        if ser and ser.is_open:
            try:
                line = ser.readline().decode('utf-8').strip()
                if line.isdigit():
                    value = int(line)
                    process_sensor_value(value)
            except Exception as e:
                print(f"Error reading serial: {e}")
                time.sleep(1)
        else:
            # Mock mode: wait
            time.sleep(2)

def process_sensor_value(value: int):
    global current_status_id

    # Classification Rule
    if value > 800:
        new_status = 1  # Cerah
    elif 400 <= value <= 800:
        new_status = 2  # Gerimis
    else:
        new_status = 3  # Hujan

    if current_status_id != new_status:
        print(f"Status changed to {new_status} (Value: {value})")

        # Insert to DB only on change
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO riwayat_cuaca (id_perangkat, id_status, nilai_analog_sensor)
            VALUES (1, ?, ?)
        ''', (new_status, value))
        conn.commit()
        conn.close()

        # Alarm Logic
        if new_status == 3:
            send_serial_command("ALARM_ON\\n")
        elif current_status_id == 3 and new_status in [1, 2]:
            send_serial_command("ALARM_OFF\\n")

        current_status_id = new_status

def send_serial_command(command: str):
    global ser
    if ser and ser.is_open:
        try:
            ser.write(command.encode('utf-8'))
            print(f"Sent to Arduino: {command.strip()}")
        except Exception as e:
            print(f"Failed to send command: {e}")
    else:
        print(f"[MOCK] Would send to Arduino: {command.strip()}")

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    thread = threading.Thread(target=read_serial_loop, daemon=True)
    thread.start()
    yield
    # Shutdown logic if any

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/status")
def get_status():
    conn = get_db_connection()
    cursor = conn.cursor()
    # Get the latest row
    cursor.execute('''
        SELECT r.waktu_kejadian, s.nama_kondisi, s.kode_warna, s.id_status
        FROM riwayat_cuaca r
        JOIN status_cuaca s ON r.id_status = s.id_status
        ORDER BY r.id_riwayat DESC
        LIMIT 1
    ''')
    row = cursor.fetchone()
    conn.close()

    if not row:
        return {
            "status": "No data",
            "cuaca": "-",
            "warna": "Abu-abu",
            "pesan_peringatan": "Belum ada data dari sensor",
            "waktu_update": "-"
        }

    status_id = row['id_status']
    pesan_peringatan = "Segera Angkat Pakaian!" if status_id == 3 else "Aman"

    return {
        "cuaca": row['nama_kondisi'],
        "warna": row['kode_warna'],
        "pesan_peringatan": pesan_peringatan,
        "waktu_update": row['waktu_kejadian']
    }

@app.get("/api/history")
def get_history():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT r.id_riwayat, r.nilai_analog_sensor, r.waktu_kejadian, s.nama_kondisi, s.kode_warna
        FROM riwayat_cuaca r
        JOIN status_cuaca s ON r.id_status = s.id_status
        ORDER BY r.waktu_kejadian DESC
        LIMIT 20
    ''')
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]

# ─── Mock Simulation Endpoints ────────────────────────────────────────────────

class MockData(BaseModel):
    value: int

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
