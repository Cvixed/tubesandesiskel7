import serial
import time
import httpx
import threading
import sys

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

# Referensi global ke serial port
serial_port = None

def send_to_backend(payload):
    """Kirim data ke backend di thread terpisah (non-blocking)."""
    try:
        res = httpx.post(f"{BACKEND_URL}/api/sensor", json=payload, timeout=10)
        if res.status_code == 200:
            res_data = res.json()
            print(f"  [Backend] OK - Status: {res_data.get('processed_status')}")
        else:
            print(f"  [Backend] Error HTTP {res.status_code}")
    except Exception as e:
        print(f"  [Error] Gagal mengirim ke backend: {e}")

def check_alarm_commands():
    """Mengecek tabel perintah_perangkat di Supabase setiap 2 detik."""
    global serial_port
    rest_url = f"{SUPABASE_URL}/rest/v1"

    # Tes koneksi pertama
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
            print(f"❌ [Alarm] Error HTTP {test.status_code}: {test.text}")
            print("   Pastikan tabel 'perintah_perangkat' sudah dibuat!")
            return
    except Exception as e:
        print(f"❌ [Alarm] Gagal konek Supabase: {e}")
        return

    while True:
        try:
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
                    send_command_to_arduino(command_text)

                    # Update status jadi 'done'
                    httpx.patch(
                        f"{rest_url}/perintah_perangkat?id_perintah=eq.{command_id}",
                        json={"status": "done"},
                        headers=SUPABASE_HEADERS,
                        timeout=5
                    )
                    print(f"  [Supabase] Perintah ditandai 'done'\n")
            else:
                print(f"  [Alarm] Error HTTP {response.status_code}: {response.text}")
        except Exception as e:
            print(f"  [Alarm] Error: {e}")

        time.sleep(2)

def send_command_to_arduino(command_text):
    """Kirim perintah ke Arduino via serial."""
    global serial_port
    if serial_port and serial_port.is_open:
        serial_port.write(f"{command_text}\n".encode())
        time.sleep(0.1)
        serial_port.flush()
        print(f"  [Serial] >>> Mengirim '{command_text}' ke Arduino")
    else:
        print(f"  [Serial] ❌ Port serial tidak terbuka!")

def keyboard_input_thread():
    """Thread untuk membaca input keyboard agar user bisa mengetik perintah manual."""
    global serial_port
    while True:
        try:
            user_input = input()
            user_input = user_input.strip().upper()
            if user_input in ["ALARM_ON", "ALARM_OFF"]:
                print(f"\n⌨️  [Manual] Mengirim '{user_input}' ke Arduino...")
                send_command_to_arduino(user_input)
            elif user_input == "TEST":
                print("\n⌨️  [Test] Mengirim 'ALARM_OFF' ke Arduino...")
                send_command_to_arduino("ALARM_OFF")
                time.sleep(3)
                print("⌨️  [Test] Mengirim 'ALARM_ON' ke Arduino...")
                send_command_to_arduino("ALARM_ON")
            elif user_input:
                print(f"  Perintah tidak dikenal: '{user_input}'")
                print("  Ketik: ALARM_ON, ALARM_OFF, atau TEST")
        except EOFError:
            break

def main():
    global serial_port

    print("=" * 55)
    print("  Serial Bridge - Arduino ↔ Backend ↔ Supabase")
    print("=" * 55)
    print(f"  Port    : {SERIAL_PORT}")
    print(f"  Backend : {BACKEND_URL}")
    print(f"  Supabase: {SUPABASE_URL}")
    print("-" * 55)
    print("  Ketik ALARM_OFF / ALARM_ON untuk tes manual")
    print("  Ketik TEST untuk tes buzzer on/off otomatis")
    print("=" * 55)

    try:
        serial_port = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        time.sleep(2)  # Tunggu Arduino restart setelah serial connect
        print("✅ Berhasil tersambung ke Arduino!\n")
    except Exception as e:
        print(f"❌ Gagal membuka {SERIAL_PORT}.")
        print("   1. Cek port di Device Manager")
        print("   2. Tutup Serial Monitor Arduino IDE")
        print(f"   Error: {e}")
        return

    # Thread 1: Cek perintah alarm dari website (Supabase)
    alarm_thread = threading.Thread(target=check_alarm_commands, daemon=True)
    alarm_thread.start()

    # Thread 2: Input keyboard manual
    kb_thread = threading.Thread(target=keyboard_input_thread, daemon=True)
    kb_thread.start()

    print("🔔 Pengecek alarm dari website aktif.")
    print("⌨️  Input keyboard aktif.")
    print("📡 Mendengarkan data dari Arduino...\n")

    while True:
        try:
            if serial_port.in_waiting > 0:
                line = serial_port.readline().decode('utf-8', errors='ignore').strip()
                if line.startswith("DATA:"):
                    raw_data = line.replace("DATA:", "")
                    parts = raw_data.split(",")
                    if len(parts) == 2:
                        value = int(parts[0])
                        status = int(parts[1])
                        status_name = {1: "Cerah", 2: "Gerimis", 3: "Hujan"}.get(status, "?")
                        print(f"[Arduino] Sensor: {value} | Status: {status} ({status_name})")

                        payload = {
                            "device_id": 1,
                            "sensor_value": value,
                            "status_id": status
                        }
                        t = threading.Thread(target=send_to_backend, args=(payload,), daemon=True)
                        t.start()
                elif line.startswith("CMD_OK:"):
                    print(f"  [Arduino] ✅ Konfirmasi: {line}")
                elif line.startswith("OVERRIDE"):
                    print(f"  [Arduino] ⏱️  {line}")
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
