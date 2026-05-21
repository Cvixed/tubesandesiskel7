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
bool manualOverride = false;       // true = buzzer dikontrol manual dari website
bool manualBuzzerState = false;    // true = ON, false = OFF
unsigned long manualOverrideTime = 0;
const unsigned long OVERRIDE_DURATION = 30000; // Override berlaku 30 detik, lalu kembali otomatis

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

  // Startup animation - nyalakan LED satu per satu
  startupAnimation();
  
  Serial.println(F("SYSTEM_READY"));
}

// ============================================================
// MAIN LOOP
// ============================================================
void loop() {
  unsigned long currentTime = millis();

  // 1. Cek perintah masuk dari Laptop (perintah alarm dari website)
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    if (command == "ALARM_ON") {
      manualOverride = true;
      manualBuzzerState = true;
      manualOverrideTime = currentTime;
      digitalWrite(buzzerPin, HIGH);
      Serial.println(F("CMD_OK:ALARM_ON"));
    } else if (command == "ALARM_OFF") {
      manualOverride = true;
      manualBuzzerState = false;
      manualOverrideTime = currentTime;
      digitalWrite(buzzerPin, LOW);
      Serial.println(F("CMD_OK:ALARM_OFF"));
    }
  }

  // 2. Cek apakah manual override sudah expired (kembali ke otomatis setelah 30 detik)
  if (manualOverride && (currentTime - manualOverrideTime >= OVERRIDE_DURATION)) {
    manualOverride = false;
    Serial.println(F("OVERRIDE_EXPIRED"));
  }

  // 3. Update Buzzer
  if (manualOverride) {
    // Mode Manual: buzzer dikontrol oleh perintah website
    digitalWrite(buzzerPin, manualBuzzerState ? HIGH : LOW);
  } else {
    // Mode Otomatis: buzzer dikontrol oleh sensor
    if (currentStatus == 2) {
      // Gerimis: Buzzer berkedip (Blink)
      if (currentTime - previousBuzzerMillis >= buzzerInterval) {
        previousBuzzerMillis = currentTime;
        if (buzzerState == LOW) {
          buzzerState = HIGH;
        } else {
          buzzerState = LOW;
        }
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

  // 4. Baca sensor & proses setiap SEND_INTERVAL (2 detik)
  if (currentTime - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = currentTime;

    // Baca sensor
    int sensorValue = analogRead(sensorPin);

    // Klasifikasi cuaca
    int newStatus = classifyWeather(sensorValue);

    // Update LED sesuai status (LED tetap mengikuti sensor, tidak terpengaruh override)
    updateLEDs(newStatus);

    // Jika status cuaca berubah, reset manual override
    if (newStatus != currentStatus) {
      manualOverride = false;
    }

    // Update current status
    currentStatus = newStatus;

    // Kirim data ke Python Script di Laptop (Format: DATA:nilai,status)
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
  // Matikan semua LED dulu
  digitalWrite(ledMerah, LOW);
  digitalWrite(ledKuning, LOW);
  digitalWrite(ledHijau, LOW);

  // Nyalakan LED sesuai status
  switch (status) {
    case 1:  // Cerah → Hijau
      digitalWrite(ledHijau, HIGH);
      break;
    case 2:  // Gerimis → Kuning
      digitalWrite(ledKuning, HIGH);
      break;
    case 3:  // Hujan → Merah
      digitalWrite(ledMerah, HIGH);
      break;
  }
}

// ============================================================
// STARTUP ANIMATION
// ============================================================
void startupAnimation() {
  // Nyalakan LED satu per satu untuk indikasi startup
  digitalWrite(ledHijau, HIGH);
  delay(300);
  digitalWrite(ledKuning, HIGH);
  delay(300);
  digitalWrite(ledMerah, HIGH);
  delay(300);

  // Buzzer beep singkat
  digitalWrite(buzzerPin, HIGH);
  delay(100);
  digitalWrite(buzzerPin, LOW);

  delay(500);

  // Matikan semua
  digitalWrite(ledMerah, LOW);
  digitalWrite(ledKuning, LOW);
  digitalWrite(ledHijau, LOW);

  Serial.println(F("Startup animation done."));
}