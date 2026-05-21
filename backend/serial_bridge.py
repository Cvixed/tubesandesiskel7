import serial
import time
import httpx
import threading

# Konfigurasi Port Serial
# GANTI "COM6" DENGAN PORT ARDUINO ANDA! (Misal: COM3, COM4, dsb)
SERIAL_PORT = "COM6" 
BAUD_RATE = 9600

# Konfigurasi Backend URL (Pastikan Backend FastAPI berjalan)
BACKEND_URL = "http://localhost:8000"

def send_to_backend(payload):
    """Kirim data ke backend di thread terpisah agar tidak memblokir pembacaan serial."""
    try:
        res = httpx.post(f"{BACKEND_URL}/api/sensor", json=payload, timeout=10)
        if res.status_code == 200:
            res_data = res.json()
            print(f"  [Backend] OK - Status diproses: {res_data.get('processed_status')}")
            cmd = res_data.get("command", "NONE")
            if cmd != "NONE":
                print(f"  [Backend] Command diterima: {cmd}")
        else:
            print(f"  [Backend] Error HTTP {res.status_code}")
    except Exception as e:
        print(f"  [Error] Gagal mengirim ke backend: {e}")

def main():
    print("=" * 50)
    print("  Serial Bridge - Arduino ke Backend")
    print("=" * 50)
    print(f"Port: {SERIAL_PORT} | Baud: {BAUD_RATE}")
    print(f"Backend: {BACKEND_URL}")
    print("-" * 50)

    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        print("✅ Berhasil tersambung ke Arduino!\n")
    except Exception as e:
        print(f"❌ Gagal membuka {SERIAL_PORT}.")
        print("   Pastikan:")
        print("   1. Port COM sudah benar (cek di Device Manager)")
        print("   2. Serial Monitor di Arduino IDE sudah DITUTUP")
        print(f"\n   Error: {e}")
        return

    print("Mendengarkan data dari Arduino...\n")
    while True:
        try:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                if line.startswith("DATA:"):
                    # Parse data: "DATA:450,2" -> value=450, status=2
                    raw_data = line.replace("DATA:", "")
                    parts = raw_data.split(",")
                    if len(parts) == 2:
                        value = int(parts[0])
                        status = int(parts[1])
                        
                        status_name = {1: "Cerah", 2: "Gerimis", 3: "Hujan"}.get(status, "?")
                        print(f"[Arduino] Sensor: {value} | Status: {status} ({status_name})")
                        
                        # Kirim ke backend di thread terpisah (NON-BLOCKING)
                        payload = {
                            "device_id": 1,
                            "sensor_value": value,
                            "status_id": status
                        }
                        t = threading.Thread(target=send_to_backend, args=(payload,), daemon=True)
                        t.start()
                elif line:
                    print(f"[Arduino] {line}")
        except KeyboardInterrupt:
            print("\nDihentikan oleh pengguna.")
            break
        except Exception as e:
            print(f"Terjadi kesalahan: {e}")
            break

    ser.close()
    print("Koneksi ditutup.")

if __name__ == "__main__":
    main()
