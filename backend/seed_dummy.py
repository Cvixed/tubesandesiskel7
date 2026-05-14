"""
Script untuk mengisi database dengan data dummy testing.
Jalankan: python seed_dummy.py
"""
import sqlite3
from datetime import datetime, timedelta
import random

DB_PATH = 'jemuran.db'

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

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

now = datetime.now()
inserted = 0

for id_status, nilai_sensor, menit_lalu in dummy_data:
    waktu = now - timedelta(minutes=menit_lalu)
    waktu_str = waktu.strftime('%Y-%m-%d %H:%M:%S')
    cursor.execute('''
        INSERT INTO riwayat_cuaca (id_perangkat, id_status, nilai_analog_sensor, waktu_kejadian)
        VALUES (1, ?, ?, ?)
    ''', (id_status, nilai_sensor, waktu_str))
    inserted += 1

conn.commit()
conn.close()

print(f"✅ Berhasil insert {inserted} data dummy ke database.")
print("   Refresh dashboard frontend untuk melihat hasilnya!")
