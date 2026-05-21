import serial
import time
import httpx
import threading

# Konfigurasi Port Serial
# GANTI "COM3" DENGAN PORT ARDUINO ANDA! (Misal: COM3, COM4, dsb)
SERIAL_PORT = "COM6" 
BAUD_RATE = 9600

# Konfigurasi Backend URL (Pastikan Backend FastAPI berjalan)
BACKEND_URL = "http://localhost:8000"

def get_command_loop(ser):
    """Fungsi ini terus-menerus mengecek apakah ada command (seperti Alarm) dari Backend."""
    while True:
        try:
            # Ambil command untuk device 1 dari backend
            response = httpx.get(f"{BACKEND_URL}/api/command/1", timeout=5)
            if response.status_code == 200:
                data = response.json()
                command = data.get("command", "NONE")
                if command != "NONE":
                    print(f"[Backend] Menerima command: {command}")
                    # Kirim command ke Arduino melalui serial
                    ser.write(f"{command}\n".encode())
        except Exception as e:
            # Mengabaikan error koneksi (misal jika backend sedang mati)
            pass
        time.sleep(2) # Cek setiap 2 detik

def main():
    print(f"Mencoba menyambung ke {SERIAL_PORT}...")
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        print("Berhasil tersambung ke Arduino!")
    except Exception as e:
        print(f"Gagal membuka serial port {SERIAL_PORT}. Pastikan port benar dan Serial Monitor Arduino IDE sedang tertutup.")
        print(f"Error: {e}")
        return

    # Mulai thread untuk mengecek command dari backend
    cmd_thread = threading.Thread(target=get_command_loop, args=(ser,), daemon=True)
    cmd_thread.start()

    print("Mendengarkan data dari Arduino...\n")
    while True:
        try:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8').strip()
                if line.startswith("DATA:"):
                    # Parse data: "DATA:450,2" -> value=450, status=2
                    raw_data = line.replace("DATA:", "")
                    parts = raw_data.split(",")
                    if len(parts) == 2:
                        value = int(parts[0])
                        status = int(parts[1])
                        print(f"[Arduino] Menerima Sensor: {value}, Status: {status}")
                        
                        # Kirim ke backend
                        payload = {
                            "device_id": 1,
                            "sensor_value": value,
                            "status_id": status
                        }
                        
                        try:
                            # Forward data ke FastAPI
                            res = httpx.post(f"{BACKEND_URL}/api/sensor", json=payload, timeout=5)
                            if res.status_code == 200:
                                res_data = res.json()
                                cmd = res_data.get("command", "NONE")
                                if cmd != "NONE":
                                    print(f"[Backend] Menerima command: {cmd}")
                                    ser.write(f"{cmd}\n".encode())
                        except Exception as e:
                            print(f"[Error] Gagal mengirim data ke backend: {e}")
                else:
                    if line:
                        print(f"[Arduino Debug] {line}")
        except KeyboardInterrupt:
            print("Dihentikan oleh pengguna.")
            break
        except Exception as e:
            print(f"Terjadi kesalahan: {e}")
            break

    ser.close()
    print("Koneksi ditutup.")

if __name__ == "__main__":
    main()
