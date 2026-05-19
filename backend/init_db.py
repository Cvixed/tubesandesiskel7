"""
Script untuk setup tabel di Supabase.

CARA PAKAI:
1. Buat project di https://supabase.com
2. Buka Dashboard → SQL Editor
3. Copy-paste SQL di bawah → klik Run
4. Setelah tabel dibuat, jalankan script ini untuk seed data:
   set SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   set SUPABASE_KEY=YOUR_ANON_KEY
   python init_db.py
"""

import os
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

# ============================================================
# SQL untuk Supabase Dashboard → SQL Editor
# ============================================================
SETUP_SQL = """
-- ============================================================
-- SETUP DATABASE SUPABASE - Sistem Monitoring Jemuran
-- Jalankan SQL ini di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Table perangkat
CREATE TABLE IF NOT EXISTS perangkat (
    id_perangkat SERIAL PRIMARY KEY,
    nama_perangkat VARCHAR(255),
    lokasi_pemasangan VARCHAR(255)
);

-- 2. Table status_cuaca
CREATE TABLE IF NOT EXISTS status_cuaca (
    id_status INTEGER PRIMARY KEY,
    nama_kondisi VARCHAR(50),
    kode_warna VARCHAR(20)
);

-- 3. Table riwayat_cuaca
CREATE TABLE IF NOT EXISTS riwayat_cuaca (
    id_riwayat SERIAL PRIMARY KEY,
    id_perangkat INTEGER REFERENCES perangkat(id_perangkat),
    id_status INTEGER REFERENCES status_cuaca(id_status),
    nilai_analog_sensor INTEGER,
    waktu_kejadian TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Index untuk query performa
CREATE INDEX IF NOT EXISTS idx_riwayat_waktu ON riwayat_cuaca(waktu_kejadian DESC);
CREATE INDEX IF NOT EXISTS idx_riwayat_perangkat ON riwayat_cuaca(id_perangkat);

-- 5. Seed Data: status_cuaca
INSERT INTO status_cuaca (id_status, nama_kondisi, kode_warna)
VALUES 
    (1, 'Cerah', 'Hijau'),
    (2, 'Gerimis', 'Kuning'),
    (3, 'Hujan', 'Merah')
ON CONFLICT (id_status) DO NOTHING;

-- 6. Seed Data: perangkat
INSERT INTO perangkat (id_perangkat, nama_perangkat, lokasi_pemasangan)
VALUES (1, 'Sensor Jemuran Utama', 'Atap Rumah')
ON CONFLICT (id_perangkat) DO NOTHING;

-- 7. PENTING: Disable RLS atau tambahkan policy agar API bisa akses
-- Pilih SALAH SATU opsi di bawah:

-- Opsi A: Disable RLS (mudah untuk development)
ALTER TABLE riwayat_cuaca DISABLE ROW LEVEL SECURITY;
ALTER TABLE status_cuaca DISABLE ROW LEVEL SECURITY;
ALTER TABLE perangkat DISABLE ROW LEVEL SECURITY;

-- Opsi B: Enable RLS + Policy allow all (lebih aman)
-- ALTER TABLE riwayat_cuaca ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all on riwayat_cuaca" ON riwayat_cuaca FOR ALL USING (true) WITH CHECK (true);
-- ALTER TABLE status_cuaca ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all on status_cuaca" ON status_cuaca FOR ALL USING (true) WITH CHECK (true);
-- ALTER TABLE perangkat ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all on perangkat" ON perangkat FOR ALL USING (true) WITH CHECK (true);
"""


def seed_via_api():
    """Seed data via Supabase REST API (PostgREST)."""
    print("=== Seeding Database via REST API ===")
    print(f"URL: {SUPABASE_URL}")
    
    # Seed status_cuaca
    status_data = [
        {"id_status": 1, "nama_kondisi": "Cerah", "kode_warna": "Hijau"},
        {"id_status": 2, "nama_kondisi": "Gerimis", "kode_warna": "Kuning"},
        {"id_status": 3, "nama_kondisi": "Hujan", "kode_warna": "Merah"},
    ]
    
    headers_upsert = {**HEADERS, "Prefer": "resolution=merge-duplicates,return=representation"}
    
    for item in status_data:
        try:
            resp = httpx.post(f"{REST_URL}/status_cuaca", json=item, headers=headers_upsert)
            resp.raise_for_status()
            print(f"  ✅ Status '{item['nama_kondisi']}' inserted/updated")
        except Exception as e:
            print(f"  ⚠️ Status '{item['nama_kondisi']}': {e}")
    
    # Seed perangkat
    try:
        resp = httpx.post(f"{REST_URL}/perangkat", json={
            "id_perangkat": 1,
            "nama_perangkat": "Sensor Jemuran Utama",
            "lokasi_pemasangan": "Atap Rumah"
        }, headers=headers_upsert)
        resp.raise_for_status()
        print("  ✅ Perangkat 'Sensor Jemuran Utama' inserted/updated")
    except Exception as e:
        print(f"  ⚠️ Perangkat: {e}")
    
    # Verifikasi
    try:
        resp = httpx.get(f"{REST_URL}/status_cuaca", headers=HEADERS)
        resp.raise_for_status()
        result = resp.json()
        print(f"\n✅ Database seeded! Status cuaca records: {len(result)}")
        for row in result:
            print(f"   - {row['nama_kondisi']} ({row['kode_warna']})")
    except Exception as e:
        print(f"\n❌ Verifikasi gagal: {e}")


if __name__ == '__main__':
    print("\n📋 SQL untuk Supabase Dashboard (copy-paste ke SQL Editor):")
    print("=" * 60)
    print(SETUP_SQL)
    print("=" * 60)
    
    print("\n\nApakah tabel sudah dibuat di Supabase Dashboard?")
    response = input("Jika sudah, ketik 'y' untuk seed data via API (y/n): ").strip().lower()
    if response == 'y':
        seed_via_api()
    else:
        print("\n✅ Copy SQL di atas ke Supabase Dashboard → SQL Editor → Run")
        print("   Setelah itu, jalankan script ini lagi dan ketik 'y'")
