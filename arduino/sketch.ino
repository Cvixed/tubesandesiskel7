// ============================================================
// SISTEM MONITORING JEMURAN - Arduino + ESP-01 WiFi
// ============================================================
// Komponen:
//   - Raindrop Sensor  → Pin A0 (Analog)
//   - LED Merah (Hujan) → Pin 2
//   - LED Kuning (Gerimis) → Pin 3
//   - LED Hijau (Cerah) → Pin 4
//   - Buzzer            → Pin 5 (Digital)
//   - ESP-01 TX         → Pin 6 (SoftwareSerial RX)
//   - ESP-01 RX         → Pin 7 (SoftwareSerial TX) via voltage divider 5V→3.3V
// ============================================================

#include <SoftwareSerial.h>

// --- Pin Configuration ---
const int sensorPin   = A0;  // Raindrop Sensor (Analog)
const int ledMerah    = 2;   // LED Merah - Hujan
const int ledKuning   = 3;   // LED Kuning - Gerimis
const int ledHijau    = 4;   // LED Hijau - Cerah
const int buzzerPin   = 5;   // Buzzer
const int espRxPin    = 6;   // ESP-01 TX → Arduino Pin 6 (RX)
const int espTxPin    = 7;   // ESP-01 RX → Arduino Pin 7 (TX) via voltage divider

// --- WiFi Configuration ---
// ⚠️ GANTI SESUAI JARINGAN ANDA
const char* WIFI_SSID = "NAMA_WIFI_ANDA";
const char* WIFI_PASS = "PASSWORD_WIFI_ANDA";

// ⚠️ GANTI SESUAI URL BACKEND ANDA (setelah deploy)
// Contoh: "api-jemuran.railway.app" atau IP lokal "192.168.1.100"
const char* SERVER_HOST = "YOUR_BACKEND_HOST";
const int   SERVER_PORT = 80;  // 80 untuk HTTP, 443 untuk HTTPS (ESP-01 tidak support HTTPS native)

// --- Software Serial untuk ESP-01 ---
SoftwareSerial espSerial(espRxPin, espTxPin); // RX, TX

// --- State Variables ---
int currentStatus = 0;  // 0=unknown, 1=Cerah, 2=Gerimis, 3=Hujan
bool wifiConnected = false;
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 3000; // Kirim data setiap 3 detik

// ============================================================
// SETUP
// ============================================================
void setup() {
  // Serial Monitor untuk debugging
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

  // Inisialisasi komunikasi dengan ESP-01
  espSerial.begin(9600);
  delay(1000);

  // Setup WiFi via ESP-01
  setupWiFi();
}

// ============================================================
// MAIN LOOP
// ============================================================
void loop() {
  unsigned long currentTime = millis();

  // Baca sensor
  int sensorValue = analogRead(sensorPin);

  // Klasifikasi cuaca
  int newStatus = classifyWeather(sensorValue);

  // Update LED sesuai status
  updateLEDs(newStatus);

  // Update buzzer (alarm jika hujan)
  updateBuzzer(newStatus);

  // Update current status
  currentStatus = newStatus;

  // Kirim data ke server setiap SEND_INTERVAL
  if (currentTime - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = currentTime;

    Serial.print(F("Sensor: "));
    Serial.print(sensorValue);
    Serial.print(F(" | Status: "));
    Serial.println(getStatusName(newStatus));

    if (wifiConnected) {
      sendDataToServer(sensorValue, newStatus);
    } else {
      Serial.println(F("[WARN] WiFi not connected. Retrying..."));
      setupWiFi();
    }
  }

  delay(100); // Small delay untuk stabilitas
}

// ============================================================
// KLASIFIKASI CUACA
// ============================================================
int classifyWeather(int value) {
  if (value > 800) {
    return 1;  // Cerah
  } else if (value >= 400) {
    return 2;  // Gerimis
  } else {
    return 3;  // Hujan
  }
}

const char* getStatusName(int status) {
  switch (status) {
    case 1: return "Cerah";
    case 2: return "Gerimis";
    case 3: return "Hujan";
    default: return "Unknown";
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
// BUZZER CONTROL
// ============================================================
void updateBuzzer(int status) {
  if (status == 3) {
    // Hujan → Buzzer ON
    digitalWrite(buzzerPin, HIGH);
  } else {
    // Cerah/Gerimis → Buzzer OFF
    digitalWrite(buzzerPin, LOW);
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

// ============================================================
// ESP-01 WiFi SETUP
// ============================================================
void setupWiFi() {
  Serial.println(F("[WiFi] Setting up ESP-01..."));

  // Reset ESP-01
  sendATCommand("AT+RST", 2000);

  // Set mode Station (client)
  sendATCommand("AT+CWMODE=1", 1000);

  // Connect to WiFi
  String connectCmd = "AT+CWJAP=\"";
  connectCmd += WIFI_SSID;
  connectCmd += "\",\"";
  connectCmd += WIFI_PASS;
  connectCmd += "\"";

  Serial.print(F("[WiFi] Connecting to: "));
  Serial.println(WIFI_SSID);

  espSerial.println(connectCmd);

  // Wait for connection (max 15 seconds)
  unsigned long startTime = millis();
  bool connected = false;

  while (millis() - startTime < 15000) {
    if (espSerial.available()) {
      String response = espSerial.readString();
      Serial.print(response);

      if (response.indexOf("OK") != -1 || response.indexOf("WIFI GOT IP") != -1) {
        connected = true;
        break;
      }
      if (response.indexOf("FAIL") != -1 || response.indexOf("ERROR") != -1) {
        break;
      }
    }
    delay(100);
  }

  if (connected) {
    wifiConnected = true;
    Serial.println(F("[WiFi] ✅ Connected!"));

    // Get IP address
    sendATCommand("AT+CIFSR", 2000);

    // Blink hijau 3x untuk indikasi sukses
    for (int i = 0; i < 3; i++) {
      digitalWrite(ledHijau, HIGH);
      delay(150);
      digitalWrite(ledHijau, LOW);
      delay(150);
    }
  } else {
    wifiConnected = false;
    Serial.println(F("[WiFi] ❌ Connection failed!"));

    // Blink merah 3x untuk indikasi gagal
    for (int i = 0; i < 3; i++) {
      digitalWrite(ledMerah, HIGH);
      delay(150);
      digitalWrite(ledMerah, LOW);
      delay(150);
    }
  }
}

// ============================================================
// KIRIM DATA KE SERVER via HTTP POST
// ============================================================
void sendDataToServer(int sensorValue, int statusId) {
  // Buat JSON body
  String jsonBody = "{\"device_id\":1,\"sensor_value\":";
  jsonBody += sensorValue;
  jsonBody += ",\"status_id\":";
  jsonBody += statusId;
  jsonBody += "}";

  // Buat HTTP POST request
  String httpRequest = "POST /api/sensor HTTP/1.1\r\n";
  httpRequest += "Host: ";
  httpRequest += SERVER_HOST;
  httpRequest += "\r\n";
  httpRequest += "Content-Type: application/json\r\n";
  httpRequest += "Content-Length: ";
  httpRequest += jsonBody.length();
  httpRequest += "\r\n";
  httpRequest += "Connection: close\r\n\r\n";
  httpRequest += jsonBody;

  // Start TCP connection
  String cipStart = "AT+CIPSTART=\"TCP\",\"";
  cipStart += SERVER_HOST;
  cipStart += "\",";
  cipStart += SERVER_PORT;

  espSerial.println(cipStart);

  if (!waitForResponse("OK", 5000)) {
    Serial.println(F("[HTTP] Failed to connect to server"));
    return;
  }

  // Send data length
  String cipSend = "AT+CIPSEND=";
  cipSend += httpRequest.length();
  espSerial.println(cipSend);

  if (!waitForResponse(">", 3000)) {
    Serial.println(F("[HTTP] Failed to get send prompt"));
    return;
  }

  // Send HTTP request
  espSerial.print(httpRequest);

  // Read response
  String response = "";
  unsigned long startTime = millis();

  while (millis() - startTime < 5000) {
    if (espSerial.available()) {
      char c = espSerial.read();
      response += c;
    }
  }

  Serial.print(F("[HTTP] Response: "));
  Serial.println(response);

  // Parse command dari response (jika ada)
  parseServerCommand(response);

  // Close connection
  espSerial.println("AT+CIPCLOSE");
  delay(200);
}

// ============================================================
// PARSE COMMAND DARI SERVER
// ============================================================
void parseServerCommand(String response) {
  // Server mengirim command dalam response JSON
  // Contoh: {"status":"ok","command":"ALARM_ON"}
  if (response.indexOf("ALARM_ON") != -1) {
    Serial.println(F("[CMD] Alarm ON dari server"));
    digitalWrite(buzzerPin, HIGH);
  } else if (response.indexOf("ALARM_OFF") != -1) {
    Serial.println(F("[CMD] Alarm OFF dari server"));
    digitalWrite(buzzerPin, LOW);
  }
}

// ============================================================
// HELPER: Send AT Command
// ============================================================
void sendATCommand(const char* cmd, unsigned long timeout) {
  espSerial.println(cmd);

  unsigned long startTime = millis();
  while (millis() - startTime < timeout) {
    if (espSerial.available()) {
      String response = espSerial.readString();
      Serial.print(response);
    }
    delay(10);
  }
}

// ============================================================
// HELPER: Wait for specific response
// ============================================================
bool waitForResponse(const char* expected, unsigned long timeout) {
  unsigned long startTime = millis();
  String response = "";

  while (millis() - startTime < timeout) {
    if (espSerial.available()) {
      char c = espSerial.read();
      response += c;

      if (response.indexOf(expected) != -1) {
        return true;
      }
    }
    delay(10);
  }

  Serial.print(F("[ESP] Timeout waiting for: "));
  Serial.println(expected);
  return false;
}
