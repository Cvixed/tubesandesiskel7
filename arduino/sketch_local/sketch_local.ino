// ============================================================
// SISTEM MONITORING JEMURAN - Arduino Local (Tanpa WiFi)
// ============================================================

// --- Pin Configuration ---
const int sensorPin   = A3;  // Raindrop Sensor (Analog)
const int ledHijau    = 2;   // LED Hijau - Cerah
const int ledKuning   = 3;   // LED Kuning - Gerimis
const int ledMerah    = 4;   // LED Merah - Hujan
const int buzzerPin   = A0;  // Buzzer (Analog pin sebagai Digital Out)

// --- State Variables ---
int currentStatus = 0;  // 0=unknown, 1=Cerah, 2=Gerimis, 3=Hujan

unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 2000; // Kirim data setiap 2 detik

// --- Variabel untuk Buzzer Blink (Gerimis) ---
unsigned long previousBuzzerMillis = 0;
const long buzzerInterval = 500; // Interval blink buzzer (500 ms)
int buzzerState = LOW;

// --- Manual Override dari Website ---
// true = buzzer dikontrol penuh oleh website, sensor tidak bisa mengubahnya
// hanya bisa diubah kembali oleh perintah dari website
bool manualOverride = false;
bool manualBuzzerState = false;    // true = ON, false = OFF

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(9600);
  Serial.println(F("=== Sistem Monitoring Jemuran ==="));
  Serial.println(F("Initializing..."));

  // Setup pin modes
  pinMode(ledMerah, OUTPUT);
  pinMode(ledKuning, OUTPUT);
  pinMode(ledHijau, OUTPUT);
  pinMode(buzzerPin, OUTPUT);

  // Matikan semua LED dan buzzer di awal
  digitalWrite(ledMerah, LOW);
  digitalWrite(ledKuning, LOW);
  digitalWrite(ledHijau, LOW);
  digitalWrite(buzzerPin, LOW);

  // Startup animation
  startupAnimation();
  
  Serial.println(F("SYSTEM_READY"));
}

// ============================================================
// MAIN LOOP
// ============================================================
void loop() {
  unsigned long currentTime = millis();

  // 1. Cek perintah masuk dari Laptop / Website
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    if (command == "ALARM_ON") {
      manualOverride = true;
      manualBuzzerState = true;
      digitalWrite(buzzerPin, HIGH);
      Serial.println(F("CMD_OK:ALARM_ON"));
    } else if (command == "ALARM_OFF") {
      manualOverride = true;
      manualBuzzerState = false;
      digitalWrite(buzzerPin, LOW);
      Serial.println(F("CMD_OK:ALARM_OFF"));
    } else if (command == "AUTO") {
      // Perintah untuk kembali ke mode otomatis (opsional)
      manualOverride = false;
      Serial.println(F("CMD_OK:AUTO"));
    }
  }

  // 2. Update Buzzer
  if (manualOverride) {
    // Mode Manual: buzzer sepenuhnya dikontrol oleh website
    // Tidak ada expiry, tetap manual sampai user kirim perintah lain
    digitalWrite(buzzerPin, manualBuzzerState ? HIGH : LOW);
  } else {
    // Mode Otomatis: buzzer dikontrol oleh sensor
    if (currentStatus == 2) {
      // Gerimis: Buzzer berkedip (Blink)
      if (currentTime - previousBuzzerMillis >= buzzerInterval) {
        previousBuzzerMillis = currentTime;
        buzzerState = (buzzerState == LOW) ? HIGH : LOW;
        digitalWrite(buzzerPin, buzzerState);
      }
    } else if (currentStatus == 3) {
      // Hujan: Buzzer menyala nyaring kontinu
      digitalWrite(buzzerPin, HIGH);
    } else {
      // Cerah: Buzzer mati
      digitalWrite(buzzerPin, LOW);
    }
  }

  // 3. Baca sensor & proses setiap SEND_INTERVAL (2 detik)
  if (currentTime - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = currentTime;

    // Baca sensor
    int sensorValue = analogRead(sensorPin);

    // Klasifikasi cuaca
    int newStatus = classifyWeather(sensorValue);

    // Update LED sesuai status (LED tetap mengikuti sensor, tidak terpengaruh override)
    updateLEDs(newStatus);

    // Update current status
    currentStatus = newStatus;

    // Kirim data ke Python Script di Laptop
    Serial.print("DATA:");
    Serial.print(sensorValue);
    Serial.print(",");
    Serial.println(newStatus);
  }
}

// ============================================================
// KLASIFIKASI CUACA
// ============================================================
int classifyWeather(int value) {
  if (value > 500) {
    return 1;  // Cerah
  } else if (value >= 300) {
    return 2;  // Gerimis
  } else {
    return 3;  // Hujan
  }
}

// ============================================================
// LED CONTROL
// ============================================================
void updateLEDs(int status) {
  digitalWrite(ledMerah, LOW);
  digitalWrite(ledKuning, LOW);
  digitalWrite(ledHijau, LOW);

  switch (status) {
    case 1: digitalWrite(ledHijau, HIGH); break;
    case 2: digitalWrite(ledKuning, HIGH); break;
    case 3: digitalWrite(ledMerah, HIGH); break;
  }
}

// ============================================================
// STARTUP ANIMATION
// ============================================================
void startupAnimation() {
  digitalWrite(ledHijau, HIGH); delay(300);
  digitalWrite(ledKuning, HIGH); delay(300);
  digitalWrite(ledMerah, HIGH); delay(300);

  digitalWrite(buzzerPin, HIGH); delay(100); digitalWrite(buzzerPin, LOW);
  delay(500);

  digitalWrite(ledMerah, LOW);
  digitalWrite(ledKuning, LOW);
  digitalWrite(ledHijau, LOW);

  Serial.println(F("Startup animation done."));
}