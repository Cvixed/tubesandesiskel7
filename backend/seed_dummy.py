"""
Script untuk mengisi database Supabase dengan data dummy testing.
Jalankan:
  set SUPABASE_URL=https://YOUR_PROJECT.supabase.co
  set SUPABASE_KEY=YOUR_ANON_KEY
  python seed_dummy.py
"""
import os
from datetime import datetime, timedelta
import httpx

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://cwymyrcgpannbvxsyvza.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "sb_publishable_aRfmN_3UXOEgB3VntEW8RA_AMH9Wqen")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

REST_URL = f"{SUPABASE_URL}/rest/v1"

# Data dummy: (id_status, nilai_sensor, menit_lalu)
dummy_data = [
    (1, 920, 60),   # Cerah, 60 menit lalu
    (1, 880, 50),   # Cerah, 50 menit lalu
    (2, 650, 40),   # Gerimis, 40 menit lalu
    (2, 520, 35),   # Gerimis, 35 menit lalu
    (3, 150, 25),   # Hujan, 25 menit lalu
    (3, 200, 20),   # Hujan, 20 menit lalu
    (2, 450, 15),   # Gerimis, 15 menit lalu
    (1, 870, 10),   # Cerah, 10 menit lalu
    (1, 950, 5),    # Cerah, 5 menit lalu
    (1, 990, 1),    # Cerah (status terbaru)
]

now = datetime.now()
inserted = 0

for id_status, nilai_sensor, menit_lalu in dummy_data:
    waktu = now - timedelta(minutes=menit_lalu)
    waktu_str = waktu.isoformat()
    
    try:
        resp = httpx.post(f"{REST_URL}/riwayat_cuaca", json={
            "id_perangkat": 1,
            "id_status": id_status,
            "nilai_analog_sensor": nilai_sensor,
            "waktu_kejadian": waktu_str
        }, headers=HEADERS)
        resp.raise_for_status()
        inserted += 1
        print(f"  ✅ Inserted: status={id_status}, sensor={nilai_sensor}, waktu={waktu_str}")
    except Exception as e:
        print(f"  ❌ Error: {e}")

print(f"\n✅ Berhasil insert {inserted} data dummy ke Supabase.")
print("   Refresh dashboard frontend untuk melihat hasilnya!")
