import sqlite3
import os

DB_PATH = 'jemuran.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Table perangkat
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS perangkat (
        id_perangkat INTEGER PRIMARY KEY AUTOINCREMENT,
        nama_perangkat VARCHAR(255),
        lokasi_pemasangan VARCHAR(255)
    )
    ''')

    # 2. Table status_cuaca
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS status_cuaca (
        id_status INTEGER PRIMARY KEY,
        nama_kondisi VARCHAR(50),
        kode_warna VARCHAR(20)
    )
    ''')

    # 3. Table riwayat_cuaca
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS riwayat_cuaca (
        id_riwayat INTEGER PRIMARY KEY AUTOINCREMENT,
        id_perangkat INTEGER,
        id_status INTEGER,
        nilai_analog_sensor INTEGER,
        waktu_kejadian DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_perangkat) REFERENCES perangkat(id_perangkat),
        FOREIGN KEY (id_status) REFERENCES status_cuaca(id_status)
    )
    ''')

    # Seed Data: status_cuaca
    cursor.execute("SELECT COUNT(*) FROM status_cuaca")
    if cursor.fetchone()[0] == 0:
        cursor.executemany('''
        INSERT INTO status_cuaca (id_status, nama_kondisi, kode_warna) 
        VALUES (?, ?, ?)
        ''', [
            (1, 'Cerah', 'Hijau'),
            (2, 'Gerimis', 'Kuning'),
            (3, 'Hujan', 'Merah')
        ])

    # Seed Data: perangkat
    cursor.execute("SELECT COUNT(*) FROM perangkat")
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
        INSERT INTO perangkat (id_perangkat, nama_perangkat, lokasi_pemasangan) 
        VALUES (1, 'Sensor Jemuran Utama', 'Atap Rumah')
        ''')

    conn.commit()
    conn.close()
    print(f"Database initialized successfully at {DB_PATH}")

if __name__ == '__main__':
    init_db()
