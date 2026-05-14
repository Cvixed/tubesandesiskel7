const int sensorPin = A0;   // Pin analog untuk Raindrop Sensor
const int buzzerPin = 8;    // Pin digital untuk Buzzer

String command = "";        // Variabel untuk menyimpan perintah dari Serial

void setup() {
  Serial.begin(9600);       // Inisialisasi komunikasi serial dengan baud rate 9600
  pinMode(buzzerPin, OUTPUT);
  digitalWrite(buzzerPin, LOW); // Pastikan buzzer mati di awal
}

void loop() {
  // 1. Membaca nilai dari sensor hujan
  int sensorValue = analogRead(sensorPin);
  
  // 2. Mengirimkan nilai sensor ke Serial (untuk dibaca oleh Python)
  Serial.println(sensorValue);
  
  // 3. Memeriksa apakah ada data (perintah) yang masuk dari Serial
  if (Serial.available() > 0) {
    command = Serial.readStringUntil('\n'); // Membaca string hingga karakter newline
    command.trim(); // Menghilangkan spasi ekstra atau karakter newline/carriage return
    
    // 4. Mengeksekusi perintah untuk mengendalikan buzzer
    if (command == "ALARM_ON") {
      digitalWrite(buzzerPin, HIGH); // Menyalakan buzzer
    } else if (command == "ALARM_OFF") {
      digitalWrite(buzzerPin, LOW);  // Mematikan buzzer
    }
  }
  
  // Delay sebentar sebelum membaca ulang agar tidak membanjiri serial port
  delay(1000); 
}
