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

# Konfigurasi Supabase (untuk membaca perintah alarm dari website)
SUPABASE_URL = "https://cwymyrcgpannbvxsyvza.supabase.co"
SUPABASE_KEY = "sb_publishable_aRfmN_3UXOEgB3VntEW8RA_AMH9Wqen"
SUPABASE_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Referensi global ke serial port agar bisa diakses dari thread lain
serial_port = None

def send_to_backend(payload):
    """Kirim data ke backend di thread terpisah agar tidak memblokir pembacaan serial."""
    try:
        res = httpx.post(f"{BACKEND_URL}/api/sensor", json=payload, timeout=10)
        if res.status_code == 200:
            res_data = res.json()
            print(f"  [Backend] OK - Status diproses: {res_data.get('processed_status')}")
        else:
            print(f"  [Backend] Error HTTP {res.status_code}")
    except Exception as e:
        print(f"  [Error] Gagal mengirim ke backend: {e}")

def check_alarm_commands():
    """
    Thread yang terus-menerus mengecek tabel 'perintah_perangkat' di Supabase
    untuk perintah alarm dari website (ALARM_ON / ALARM_OFF).
    Jika ditemukan perintah 'pending', kirim ke Arduino via serial lalu tandai 'done'.
    """
    global serial_port
    rest_url = f"{SUPABASE_URL}/rest/v1"

    # Tes koneksi pertama kali
    try:
        test = httpx.get(
            f"{rest_url}/perintah_perangkat",
            params={"select": "id_perintah", "limit": "1"},
            headers=SUPABASE_HEADERS,
            timeout=5
        )
        if test.status_code == 200:
            print("✅ [Alarm] Tabel 'perintah_perangkat' ditemukan di Supabase.")
        else:
            print(f"❌ [Alarm] Tabel 'perintah_perangkat' TIDAK ditemukan! HTTP {test.status_code}")
            print(f"   Response: {test.text}")
            print("   Buat tabel ini di Supabase SQL Editor terlebih dahulu!")
            return
    except Exception as e:
        print(f"❌ [Alarm] Gagal konek ke Supabase: {e}")
        return

    while True:
        try:
            # Cari perintah dengan status 'pending'
            response = httpx.get(
                f"{rest_url}/perintah_perangkat",
                params={
                    "select": "id_perintah,command",
                    "status": "eq.pending",
                    "order": "waktu_dibuat.asc",
                    "limit": "1"
                },
                headers=SUPABASE_HEADERS,
                timeout=5
            )

            if response.status_code == 200:
                commands = response.json()
                if commands and len(commands) > 0:
                    cmd = commands[0]
                    command_text = cmd.get("command", "")
                    command_id = cmd.get("id_perintah")

                    print(f"\n🔔 [Website] Perintah diterima: {command_text}")

                    # Kirim ke Arduino via serial
                    if serial_port and serial_port.is_open:
                        serial_port.write(f"{command_text}\n".encode())
                        print(f"  [Arduino] Perintah '{command_text}' dikirim ke Arduino!")

                    # Update status jadi 'done' di Supabase
                    httpx.patch(
                        f"{rest_url}/perintah_perangkat?id_perintah=eq.{command_id}",
                        json={"status": "done"},
                        headers=SUPABASE_HEADERS,
                        timeout=5
                    )
                    print(f"  [Supabase] Status perintah diupdate ke 'done'\n")
            else:
                print(f"  [Alarm] Error HTTP {response.status_code}: {response.text}")

        except Exception as e:
            print(f"  [Alarm] Error: {e}")

        time.sleep(2)  # Cek setiap 2 detik

def main():
    global serial_port

    print("=" * 50)
    print("  Serial Bridge - Arduino ke Backend + Supabase")
    print("=" * 50)
    print(f"Port: {SERIAL_PORT} | Baud: {BAUD_RATE}")
    print(f"Backend: {BACKEND_URL}")
    print(f"Supabase: {SUPABASE_URL}")
    print("-" * 50)

    try:
        serial_port = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        print("✅ Berhasil tersambung ke Arduino!\n")
    except Exception as e:
        print(f"❌ Gagal membuka {SERIAL_PORT}.")
        print("   Pastikan:")
        print("   1. Port COM sudah benar (cek di Device Manager)")
        print("   2. Serial Monitor di Arduino IDE sudah DITUTUP")
        print(f"\n   Error: {e}")
        return

    # Mulai thread untuk mengecek perintah alarm dari website
    alarm_thread = threading.Thread(target=check_alarm_commands, daemon=True)
    alarm_thread.start()
    print("🔔 Thread pengecek perintah alarm dari website aktif.")
    print("Mendengarkan data dari Arduino...\n")

    while True:
        try:
            if serial_port.in_waiting > 0:
                line = serial_port.readline().decode('utf-8', errors='ignore').strip()
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

    serial_port.close()
    print("Koneksi ditutup.")

if __name__ == "__main__":
    main()
