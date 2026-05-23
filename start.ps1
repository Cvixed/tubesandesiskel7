# ══════════════════════════════════════════════════════════════
#  Serial Bridge - Arduino Gateway (PowerShell)
#  Backend Lokal + Arduino Serial + Supabase
# ══════════════════════════════════════════════════════════════

$Host.UI.RawUI.WindowTitle = "Serial Bridge - Arduino Gateway"

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "       SERIAL BRIDGE - ARDUINO GATEWAY" -ForegroundColor Cyan
Write-Host "       Arduino + Backend Lokal + Supabase" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ProjectDir "backend"
$VenvPython = Join-Path $ProjectDir ".venv\Scripts\python.exe"

if (-Not (Test-Path $VenvPython)) {
    Write-Host "[X] Python venv tidak ditemukan!" -ForegroundColor Red
    Write-Host "    Jalankan: python -m venv .venv"
    Write-Host "    Lalu: .venv\Scripts\pip install -r backend\requirements.txt"
    Read-Host "Tekan Enter untuk keluar"
    exit 1
}

Write-Host "[OK] Virtual environment ditemukan!" -ForegroundColor Green
Write-Host ""

Set-Location $BackendDir

# === Jalankan Backend FastAPI di background ===
Write-Host "[1/2] Menjalankan Backend FastAPI di port 8000..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath $VenvPython -ArgumentList "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000" -WindowStyle Minimized -PassThru

Write-Host "      Menunggu backend siap..." -ForegroundColor Gray
Start-Sleep -Seconds 3
Write-Host "[OK] Backend berjalan di http://localhost:8000" -ForegroundColor Green
Write-Host ""

# === Jalankan Serial Bridge ===
Write-Host "[2/2] Menjalankan Serial Bridge (Arduino COM6)..." -ForegroundColor Yellow
Write-Host "      Tekan Ctrl+C untuk menghentikan" -ForegroundColor Gray
Write-Host ""

try {
    & $VenvPython serial_bridge.py
} finally {
    # Hentikan backend saat serial bridge berhenti
    Write-Host ""
    Write-Host "Menghentikan backend..." -ForegroundColor Yellow
    if ($backendProcess -and !$backendProcess.HasExited) {
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Semua servis dihentikan." -ForegroundColor Green
    Read-Host "Tekan Enter untuk keluar"
}
