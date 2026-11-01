const bcrypt = require('bcryptjs');
const path = require('path');
const Database = require('better-sqlite3');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'database.sqlite');

// Delete existing database
const fs = require('fs');
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, full_name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, avatar_url TEXT, phone TEXT, location TEXT, bio TEXT,
    role TEXT CHECK(role IN ('student','lab_admin','superadmin')) DEFAULT 'student',
    is_verified INTEGER DEFAULT 0, rating REAL DEFAULT 0.0,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, icon TEXT, description TEXT
  );
  CREATE TABLE IF NOT EXISTS components (
    id INTEGER PRIMARY KEY AUTOINCREMENT, owner_id INTEGER NOT NULL, category_id INTEGER NOT NULL,
    title TEXT NOT NULL, description TEXT, brand TEXT, model_number TEXT,
    condition TEXT CHECK(condition IN ('new','like_new','good','fair')) DEFAULT 'good',
    listing_type TEXT CHECK(listing_type IN ('lend','rent','trade','giveaway')) DEFAULT 'lend',
    price_per_day REAL, quantity INTEGER DEFAULT 1, available_quantity INTEGER DEFAULT 1,
    tags TEXT DEFAULT '[]', image_urls TEXT DEFAULT '[]', location TEXT, lab_name TEXT,
    status TEXT CHECK(status IN ('available','reserved','borrowed','unavailable')) DEFAULT 'available',
    views_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS borrow_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT, component_id INTEGER NOT NULL,
    requester_id INTEGER NOT NULL, lender_id INTEGER NOT NULL,
    status TEXT CHECK(status IN ('pending','approved','denied','returned','overdue','cancelled')) DEFAULT 'pending',
    request_message TEXT, response_message TEXT, borrow_date TEXT, return_date TEXT, actual_return_date TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lender_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT, reviewer_id INTEGER NOT NULL, reviewed_user_id INTEGER NOT NULL,
    request_id INTEGER NOT NULL, rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT, created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES borrow_requests(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
    type TEXT CHECK(type IN ('request_received','request_approved','request_denied','item_returned','new_review','system')) DEFAULT 'system',
    title TEXT NOT NULL, message TEXT, related_id INTEGER, is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT, sender_id INTEGER NOT NULL, receiver_id INTEGER NOT NULL,
    component_id INTEGER, content TEXT NOT NULL, is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE SET NULL
  );
  CREATE TABLE IF NOT EXISTS wishlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, component_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE,
    UNIQUE(user_id, component_id)
  );
  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, action TEXT NOT NULL,
    entity_type TEXT, entity_id INTEGER, details TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_components_owner ON components(owner_id);
  CREATE INDEX IF NOT EXISTS idx_components_category ON components(category_id);
  CREATE INDEX IF NOT EXISTS idx_components_status ON components(status);
  CREATE INDEX IF NOT EXISTS idx_borrow_requests_component ON borrow_requests(component_id);
  CREATE INDEX IF NOT EXISTS idx_borrow_requests_requester ON borrow_requests(requester_id);
  CREATE INDEX IF NOT EXISTS idx_borrow_requests_lender ON borrow_requests(lender_id);
  CREATE INDEX IF NOT EXISTS idx_borrow_requests_status ON borrow_requests(status);
  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
  CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
  CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
  CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`);

const hash = bcrypt.hashSync('password123', 10);

function randomDate(monthsBack) {
  const now = new Date();
  const past = new Date(now.getTime() - monthsBack * 30 * 24 * 60 * 60 * 1000);
  const diff = now.getTime() - past.getTime();
  return new Date(past.getTime() + Math.random() * diff).toISOString().replace('T', ' ').substring(0, 19);
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ── USERS ──
const users = [
  { full_name: 'Admin User', email: 'admin@componenthub.lk', role: 'superadmin', location: 'Main Office', bio: 'Platform administrator and superadmin.', is_verified: 1, phone: '077-1234567' },
  { full_name: 'Dr. Pradeep Weerasinghe', email: 'lab@componenthub.lk', role: 'lab_admin', location: 'Lab 1', bio: 'Senior Lecturer, Electronics Lab Coordinator. Managing Lab 1 and Lab 2 inventories.', is_verified: 1, phone: '071-9876543' },
  { full_name: 'Kavindu Perera', email: 'student@componenthub.lk', role: 'student', location: 'Hostel Block A', bio: '3rd year EE student. Works on embedded robotics and IoT projects. Always building something.', is_verified: 1, phone: '076-5551234' },
  { full_name: 'Nethmi Fernando', email: 'nethmi@uor.lk', role: 'student', location: 'Hostel Block B', bio: '2nd year CS undergraduate, interested in sensor networks and wearable tech.', is_verified: 1, phone: '077-2223344' },
  { full_name: 'Dinuka Rajapaksha', email: 'dinuka@uor.lk', role: 'student', location: 'Lab 3', bio: 'Final year project on autonomous drones. Loves FPGAs and signal processing.', is_verified: 1, phone: '075-9998877' },
  { full_name: 'Tharindu Silva', email: 'tharindu@uor.lk', role: 'student', location: 'Off-campus', bio: 'Part-time hardware hacker. Specializes in power electronics and motor control.', is_verified: 0, phone: '070-1112233' },
  { full_name: 'Imasha de Silva', email: 'imasha@uor.lk', role: 'student', location: 'Hostel Block C', bio: '3rd year EE, passionate about PCB design and analog circuits. Co-leads the robotics club.', is_verified: 1, phone: '076-4445566' },
  { full_name: 'Sandun Wickramasinghe', email: 'sandun@uor.lk', role: 'student', location: 'Hostel Block A', bio: 'Embedded systems enthusiast. Currently building a smart greenhouse controller.', is_verified: 1, phone: '071-7778899' },
  { full_name: 'Harini Jayawardena', email: 'harini@uor.lk', role: 'student', location: 'Lab 2', bio: 'Research assistant in Lab 2. Works on biomedical sensor interfaces.', is_verified: 1, phone: '077-3334455' },
  { full_name: 'Kavishka Bandara', email: 'kavishka@uor.lk', role: 'student', location: 'Hostel Block D', bio: '2nd year CS student building home automation systems with ESP32 boards.', is_verified: 0, phone: '076-6667788' },
  { full_name: 'Malith Gunasekara', email: 'malith@uor.lk', role: 'student', location: 'Lab 4', bio: 'Lab assistant. Manages the component shelves and keeps inventory updated.', is_verified: 1, phone: '075-1239876' },
  { full_name: 'Shanika Wijesinghe', email: 'shanika@uor.lk', role: 'lab_admin', location: 'Lab 5', bio: 'Instructor for digital electronics lab. Maintains Lab 5 equipment.', is_verified: 1, phone: '071-4567890' },
  { full_name: 'Ravindu Dissanayake', email: 'ravindu@uor.lk', role: 'student', location: 'Off-campus', bio: 'Freelance PCB designer. Has a collection of vintage ICs and dev boards.', is_verified: 1, phone: '070-9871234' },
  { full_name: 'Thisara Liyanage', email: 'thisara@uor.lk', role: 'student', location: 'Hostel Block E', bio: '1st year student, eager to learn microcontroller programming.', is_verified: 0, phone: '076-3216549' },
  { full_name: 'Dulani Senanayake', email: 'dulani@uor.lk', role: 'student', location: 'Hostel Block B', bio: '3rd year student working on wireless communication modules for her FYP.', is_verified: 1, phone: '077-6543210' },
  { full_name: 'Nuwan Pathirana', email: 'nuwan@uor.lk', role: 'student', location: 'Lab 1', bio: 'Teaching assistant. Runs the weekly Arduino workshops for freshers.', is_verified: 1, phone: '075-7894561' },
  { full_name: 'Lakshitha Herath', email: 'lakshitha@uor.lk', role: 'student', location: 'Hostel Block F', bio: '2nd year mechatronics. Building a 3D printer from scratch.', is_verified: 0, phone: '071-2583691' },
  { full_name: 'Amaya Kulathunga', email: 'amaya@uor.lk', role: 'student', location: 'Hostel Block C', bio: 'IoT enthusiast with a focus on LoRa and long-range sensor networks.', is_verified: 1, phone: '076-9517538' },
  { full_name: 'Pasindu Abeysekera', email: 'pasindu@uor.lk', role: 'student', location: 'Off-campus', bio: 'Final year. My FYP involves gesture-controlled robotics using flex sensors.', is_verified: 1, phone: '070-3571594' },
  { full_name: 'Rashmi Gunaratne', email: 'rashmi@uor.lk', role: 'student', location: 'Lab 2', bio: 'Analog IC design researcher. Collects op-amps like trading cards.', is_verified: 1, phone: '077-1473692' },
  { full_name: 'Yasith Mendis', email: 'yasith@uor.lk', role: 'student', location: 'Hostel Block D', bio: 'Robotics club secretary. Has spare motors, wheels, and chassis parts.', is_verified: 1, phone: '075-8529637' },
  { full_name: 'Hiruni Peris', email: 'hiruni@uor.lk', role: 'student', location: 'Hostel Block A', bio: '2nd year CS. Working on a smart campus lighting project.', is_verified: 0, phone: '071-9638527' },
  { full_name: 'Dhanushka Jayasuriya', email: 'dhanushka@uor.lk', role: 'student', location: 'Lab 3', bio: 'FPGA and VHDL programmer. Xilinx board collector.', is_verified: 1, phone: '076-7531598' },
  { full_name: 'Miyuru Amarasinghe', email: 'miyuru@uor.lk', role: 'student', location: 'Hostel Block E', bio: '3rd year EE, interested in power systems and solar energy converters.', is_verified: 1, phone: '070-4567891' },
  { full_name: 'Chamodi Wickramage', email: 'chamodi@uor.lk', role: 'student', location: 'Hostel Block F', bio: 'Hardware tinkerer. Currently debugging a custom STM32 breakout board.', is_verified: 0, phone: '077-8521473' },
  { full_name: 'Buddhika Rathnayake', email: 'buddhika@uor.lk', role: 'student', location: 'Off-campus', bio: 'Part-time embedded developer at a startup. Shares spare components.', is_verified: 1, phone: '075-3697412' },
  { full_name: 'Sithara Ranaweera', email: 'sithara@uor.lk', role: 'student', location: 'Hostel Block B', bio: 'Audio electronics hobbyist. Building guitar effect pedals.', is_verified: 1, phone: '071-7418529' },
];

const insertUser = db.prepare(
  'INSERT INTO users (full_name, email, password_hash, phone, location, bio, role, is_verified, rating, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)'
);

const userIds = [];
for (const u of users) {
  const result = insertUser.run(u.full_name, u.email, hash, u.phone, u.location, u.bio, u.role, u.is_verified, (Math.random() * 2 + 3).toFixed(1), randomDate(6));
  userIds.push(result.lastInsertRowid);
}

// ── CATEGORIES ──
const categories = [
  { name: 'Microcontrollers', icon: '🎛️', description: 'Arduino, ESP32, STM32, PIC, and other microcontroller boards' },
  { name: 'Sensors', icon: '📡', description: 'Temperature, humidity, motion, ultrasonic, and other sensors' },
  { name: 'ICs', icon: '🔲', description: 'Integrated circuits, voltage regulators, op-amps, timers' },
  { name: 'Dev Boards', icon: '🖥️', description: 'Raspberry Pi, FPGA boards, and development kits' },
  { name: 'Passive Components', icon: '⚡', description: 'Resistors, capacitors, inductors, diodes, transistors' },
  { name: 'Power Electronics', icon: '🔋', description: 'Power supplies, battery packs, solar panels, converters' },
  { name: 'Communication Modules', icon: '📶', description: 'WiFi, Bluetooth, LoRa, RF, GSM modules' },
  { name: 'Analog', icon: '🎚️', description: 'Op-amps, ADC/DAC, filters, audio circuits' },
  { name: 'Embedded', icon: '🤖', description: 'Motor drivers, displays, relays, actuators' },
  { name: 'Tools and Equipment', icon: '🔧', description: 'Multimeters, oscilloscopes, soldering stations, logic analyzers' },
];

const insertCat = db.prepare('INSERT INTO categories (name, icon, description) VALUES (?,?,?)');
const catIds = [];
for (const c of categories) {
  const r = insertCat.run(c.name, c.icon, c.description);
  catIds.push(r.lastInsertRowid);
}

// ── COMPONENTS ──
const locations = ['Lab 1', 'Lab 2', 'Lab 3', 'Lab 4', 'Lab 5', 'Hostel Block A', 'Hostel Block B', 'Hostel Block C', 'Hostel Block D', 'Off-campus'];
const conditions = ['new', 'like_new', 'good', 'fair'];
const listingTypes = ['lend', 'rent', 'trade', 'giveaway'];
const statuses = ['available', 'available', 'available', 'reserved', 'borrowed'];

const componentData = [
  // Microcontrollers (cat 1)
  { cat: 0, title: 'Arduino Uno R3 — barely used', desc: 'Original Arduino Uno R3 with ATmega328P. Used for one semester project, works perfectly. Comes with USB cable.', brand: 'Arduino', model: 'Uno R3', tags: ['arduino','atmega','beginner'] },
  { cat: 0, title: 'ESP32-WROOM-32 Dev Module', desc: 'ESP32 development board with WiFi and Bluetooth. Great for IoT projects. Includes pin headers soldered.', brand: 'Espressif', model: 'ESP32-WROOM-32', tags: ['esp32','wifi','bluetooth','iot'] },
  { cat: 0, title: 'Arduino Nano Every', desc: 'Compact Arduino Nano with ATMega4809. Perfect for breadboard projects. Tested and working.', brand: 'Arduino', model: 'Nano Every', tags: ['arduino','nano','compact'] },
  { cat: 0, title: 'STM32 Blue Pill Board', desc: 'STM32F103C8T6 minimum system board. 72MHz ARM Cortex-M3 processor. Includes ST-Link headers.', brand: 'STMicroelectronics', model: 'STM32F103C8T6', tags: ['stm32','arm','cortex'] },
  { cat: 0, title: 'Arduino Mega 2560 Rev3', desc: 'Arduino Mega with 54 digital I/O pins. Used in a robotics project last semester. All pins tested.', brand: 'Arduino', model: 'Mega 2560', tags: ['arduino','mega','pins'] },
  { cat: 0, title: 'ESP8266 NodeMCU v3', desc: 'NodeMCU WiFi development board based on ESP8266. Compact and cheap. 3 units available.', brand: 'Ai-Thinker', model: 'NodeMCU v3', tags: ['esp8266','wifi','nodemcu'] },
  { cat: 0, title: 'ATtiny85 DIP-8 x5', desc: 'Pack of 5 ATtiny85 microcontrollers. 8-pin DIP package. Programmed via Arduino as ISP.', brand: 'Atmel', model: 'ATtiny85', tags: ['attiny','tiny','dip'] },
  { cat: 0, title: 'Teensy 4.0 Board', desc: 'High-performance Teensy 4.0 with ARM Cortex-M7 at 600MHz. Great for audio and signal processing.', brand: 'PJRC', model: 'Teensy 4.0', tags: ['teensy','arm','fast'] },
  // Sensors (cat 2)
  { cat: 1, title: 'DHT22 Temperature & Humidity Sensor', desc: 'Digital temperature and humidity sensor. 0-100% RH, -40 to 80°C range. With pull-up resistor.', brand: 'AOSONG', model: 'DHT22', tags: ['temperature','humidity','digital'] },
  { cat: 1, title: 'HC-SR04 Ultrasonic Sensor', desc: 'Ultrasonic distance sensor. Range 2cm-400cm. Used for obstacle avoidance in robotics.', brand: 'Generic', model: 'HC-SR04', tags: ['ultrasonic','distance','robotics'] },
  { cat: 1, title: 'MPU-6050 Accelerometer Gyroscope', desc: '6-axis IMU module. I2C interface. Used it for a self-balancing robot project.', brand: 'InvenSense', model: 'MPU-6050', tags: ['imu','accelerometer','gyroscope','i2c'] },
  { cat: 1, title: 'BMP280 Barometric Pressure Sensor', desc: 'High precision barometric pressure and temperature sensor. I2C/SPI. Great for weather stations.', brand: 'Bosch', model: 'BMP280', tags: ['pressure','barometric','weather'] },
  { cat: 1, title: 'PIR Motion Sensor Module', desc: 'HC-SR501 PIR sensor for motion detection. Adjustable sensitivity and delay. Works at 5V.', brand: 'Generic', model: 'HC-SR501', tags: ['pir','motion','security'] },
  { cat: 1, title: 'Soil Moisture Sensor x3', desc: 'Set of 3 soil moisture sensors. Analog output. Used them for a smart garden project.', brand: 'Generic', model: 'YL-69', tags: ['soil','moisture','garden'] },
  { cat: 1, title: 'MAX30102 Heart Rate SpO2 Sensor', desc: 'Heart rate and blood oxygen sensor module. I2C interface. Used for biomedical electronics lab.', brand: 'Maxim', model: 'MAX30102', tags: ['heartrate','spo2','biomedical'] },
  { cat: 1, title: 'Load Cell 5kg + HX711 Module', desc: '5kg load cell with HX711 ADC amplifier. For weight measurement projects. Calibration data included.', brand: 'Generic', model: 'HX711', tags: ['loadcell','weight','adc'] },
  // ICs (cat 3)
  { cat: 2, title: 'LM7805 Voltage Regulator x10', desc: 'Pack of 10 LM7805 5V voltage regulators in TO-220 package. Brand new from Mouser order.', brand: 'Texas Instruments', model: 'LM7805', tags: ['regulator','5v','power'] },
  { cat: 2, title: 'NE555 Timer IC x8', desc: '8 pieces of the classic 555 timer IC. DIP-8 package. For oscillators, timers, PWM generation.', brand: 'Texas Instruments', model: 'NE555', tags: ['555','timer','oscillator'] },
  { cat: 2, title: 'LM358 Dual Op-Amp x5', desc: '5 units of LM358 dual operational amplifier. DIP-8. Good general-purpose op-amp.', brand: 'Texas Instruments', model: 'LM358', tags: ['opamp','analog','amplifier'] },
  { cat: 2, title: 'ATmega328P-PU DIP-28', desc: 'Standalone ATmega328P with Arduino bootloader pre-loaded. Ready for breadboard Arduino builds.', brand: 'Atmel', model: 'ATmega328P-PU', tags: ['atmega','bootloader','dip'] },
  { cat: 2, title: 'L293D Motor Driver IC x3', desc: '3 units of L293D dual H-bridge motor driver. DIP-16. Drive DC motors and stepper motors.', brand: 'STMicroelectronics', model: 'L293D', tags: ['motor','hbridge','driver'] },
  { cat: 2, title: 'CD4017 Decade Counter x5', desc: 'CMOS decade counter/divider. DIP-16. Good for LED chasers and sequential circuits.', brand: 'Texas Instruments', model: 'CD4017', tags: ['counter','cmos','logic'] },
  // Dev Boards (cat 4)
  { cat: 3, title: 'Raspberry Pi 4 Model B 4GB', desc: 'Raspberry Pi 4B with 4GB RAM. Runs Raspberry Pi OS. Comes with case and heatsink set.', brand: 'Raspberry Pi Foundation', model: 'Pi 4 Model B', tags: ['rpi','linux','sbc'] },
  { cat: 3, title: 'Raspberry Pi Pico W', desc: 'RP2040-based board with wireless. MicroPython ready. Great for IoT prototyping.', brand: 'Raspberry Pi Foundation', model: 'Pico W', tags: ['pico','rp2040','micropython'] },
  { cat: 3, title: 'Xilinx Basys 3 FPGA Board', desc: 'Artix-7 FPGA board for digital design coursework. Includes USB cable and Vivado license.', brand: 'Digilent', model: 'Basys 3', tags: ['fpga','xilinx','vhdl'] },
  { cat: 3, title: 'BeagleBone Black Rev C', desc: 'AM3358 Cortex-A8 single board computer. Good for real-time applications and PRU programming.', brand: 'BeagleBoard.org', model: 'BBB Rev C', tags: ['beaglebone','cortex','pru'] },
  { cat: 3, title: 'NVIDIA Jetson Nano 4GB', desc: 'AI computing dev board. Used for computer vision FYP. 128 CUDA cores. Includes fan.', brand: 'NVIDIA', model: 'Jetson Nano', tags: ['jetson','ai','cuda','gpu'] },
  // Passive Components (cat 5)
  { cat: 4, title: 'Resistor Assortment Kit 600pcs', desc: '30 values, 20 each. 1/4W metal film. 10Ω to 1MΩ. Organized in labeled compartments.', brand: 'Generic', model: null, tags: ['resistor','assortment','kit'] },
  { cat: 4, title: 'Ceramic Capacitor Kit 300pcs', desc: 'Ceramic disc capacitors. 10pF to 100nF range. 30 values. Labeled bags.', brand: 'Generic', model: null, tags: ['capacitor','ceramic','kit'] },
  { cat: 4, title: 'Electrolytic Capacitor Set 120pcs', desc: 'Electrolytic caps from 1µF to 1000µF. 12 values x 10. 16V and 25V ratings.', brand: 'Nichicon', model: null, tags: ['capacitor','electrolytic','nichicon'] },
  { cat: 4, title: 'LED Assortment 200pcs', desc: '5mm LEDs in 5 colors: red, green, blue, yellow, white. 40 each. With current limiting resistors.', brand: 'Generic', model: null, tags: ['led','assortment','5mm'] },
  { cat: 4, title: 'Breadboard Jumper Wire Kit', desc: '65 male-to-male wires and 40 each of M-F and F-F. Multiple lengths and colors.', brand: 'Generic', model: null, tags: ['jumper','wire','breadboard'] },
  // Power Electronics (cat 6)
  { cat: 5, title: 'LM2596 DC-DC Buck Converter x4', desc: 'Adjustable step-down converter. 3A output. Input 4-40V, output 1.25-37V. With potentiometer.', brand: 'Generic', model: 'LM2596', tags: ['buck','converter','dcdc'] },
  { cat: 5, title: '18650 Battery Holder 2-Cell', desc: '2-cell 18650 battery holder with leads. Series connection for 7.4V nominal. 5 available.', brand: 'Generic', model: null, tags: ['battery','18650','holder'] },
  { cat: 5, title: '5V 10A Power Supply Unit', desc: 'Switching PSU, 5V 10A output. Great for LED strips and high-current projects. IEC inlet.', brand: 'Mean Well', model: 'RS-50-5', tags: ['psu','5v','meanwell'] },
  { cat: 5, title: 'Solar Panel 6V 1W Mini', desc: 'Small polycrystalline solar panel. 110x60mm. For outdoor IoT sensor nodes.', brand: 'Generic', model: null, tags: ['solar','panel','6v'] },
  { cat: 5, title: 'TP4056 Li-Ion Charger Module x6', desc: '6 units of TP4056 with protection circuit. Micro USB charging for single-cell lithium batteries.', brand: 'Generic', model: 'TP4056', tags: ['charger','lithium','tp4056'] },
  // Communication Modules (cat 7)
  { cat: 6, title: 'nRF24L01+ Wireless Module x2', desc: 'Pair of 2.4GHz wireless transceiver modules. SPI interface. Range up to 100m with antenna.', brand: 'Nordic', model: 'nRF24L01+', tags: ['wireless','2.4ghz','spi'] },
  { cat: 6, title: 'HC-05 Bluetooth Module', desc: 'Serial Bluetooth module for wireless UART. Master/slave mode. Works with Arduino and ESP32.', brand: 'Generic', model: 'HC-05', tags: ['bluetooth','serial','hc05'] },
  { cat: 6, title: 'SIM800L GSM Module', desc: 'Quad-band GSM/GPRS module. Can send SMS and make calls. Needs 3.7-4.2V. With antenna.', brand: 'SIMCom', model: 'SIM800L', tags: ['gsm','gprs','sms'] },
  { cat: 6, title: 'LoRa Ra-02 SX1278 Module', desc: '433MHz LoRa module. Long range (10km+ LOS). SPI interface. For remote sensor networks.', brand: 'Ai-Thinker', model: 'Ra-02', tags: ['lora','433mhz','longrange'] },
  { cat: 6, title: 'W5500 Ethernet Module', desc: 'Hardwired TCP/IP ethernet module. SPI. For wired network connectivity in embedded systems.', brand: 'WIZnet', model: 'W5500', tags: ['ethernet','tcp','wired'] },
  // Analog (cat 8)
  { cat: 7, title: 'ADS1115 16-bit ADC Module', desc: '4-channel 16-bit ADC with programmable gain. I2C. Much better resolution than built-in Arduino ADC.', brand: 'Texas Instruments', model: 'ADS1115', tags: ['adc','16bit','precision'] },
  { cat: 7, title: 'MCP4725 DAC Breakout', desc: '12-bit DAC with I2C interface. Generate analog voltages from digital signals. 2 available.', brand: 'Microchip', model: 'MCP4725', tags: ['dac','12bit','i2c'] },
  { cat: 7, title: 'TDA2030 Audio Amplifier Module', desc: '18W mono audio amplifier module. Good for speaker projects. Heatsink included.', brand: 'STMicroelectronics', model: 'TDA2030', tags: ['audio','amplifier','speaker'] },
  { cat: 7, title: 'MAX7219 LED Matrix 8x8 x2', desc: '2 units of 8x8 LED matrix with MAX7219 driver. SPI. Cascadable for scrolling text displays.', brand: 'Maxim', model: 'MAX7219', tags: ['led','matrix','display'] },
  // Embedded (cat 9)
  { cat: 8, title: 'OLED 0.96 inch SSD1306 Display', desc: '128x64 OLED display module. I2C interface. Blue/white. Very crisp text and graphics.', brand: 'Generic', model: 'SSD1306', tags: ['oled','display','i2c'] },
  { cat: 8, title: 'L298N Motor Driver Module', desc: 'Dual H-bridge motor driver. Drives 2 DC motors or 1 stepper. With voltage regulator.', brand: 'STMicroelectronics', model: 'L298N', tags: ['motor','driver','hbridge'] },
  { cat: 8, title: '4-Channel Relay Module', desc: '4-channel relay module with optocoupler isolation. 5V coil, 250VAC/30VDC contacts.', brand: 'Generic', model: null, tags: ['relay','4channel','isolation'] },
  { cat: 8, title: 'SG90 Micro Servo Motor x4', desc: '4 units of SG90 9g servo motors. 180° rotation. With horn attachments and screws.', brand: 'Tower Pro', model: 'SG90', tags: ['servo','motor','sg90'] },
  { cat: 8, title: '16x2 LCD Display with I2C Backpack', desc: 'HD44780 LCD with I2C adapter soldered. Only needs 2 wires for data. Blue backlight.', brand: 'Generic', model: 'HD44780', tags: ['lcd','display','i2c'] },
  { cat: 8, title: 'NEMA 17 Stepper Motor', desc: '1.8° step angle stepper motor. 200 steps/rev. Used in my 3D printer project. With 4-pin cable.', brand: 'Generic', model: 'NEMA 17', tags: ['stepper','motor','nema17'] },
  { cat: 8, title: 'MG996R Servo Motor', desc: 'High-torque metal gear servo. 13kg/cm at 6V. For robotic arms and heavy-duty applications.', brand: 'Tower Pro', model: 'MG996R', tags: ['servo','high-torque','metal'] },
  { cat: 8, title: 'Nextion 3.2 inch TFT Touch Display', desc: 'Programmable HMI touchscreen. UART interface. Visual editor for creating GUIs without code.', brand: 'ITEAD', model: 'NX4024T032', tags: ['touchscreen','hmi','nextion'] },
  // Tools (cat 10)
  { cat: 9, title: 'Logic Analyzer 8-channel USB', desc: '24MHz 8-channel USB logic analyzer. Compatible with Sigrok/PulseView. Debug SPI, I2C, UART.', brand: 'Saleae Clone', model: null, tags: ['logic','analyzer','debug'] },
  { cat: 9, title: 'Digital Multimeter UT33D', desc: 'Handheld multimeter with auto-ranging. Measures voltage, current, resistance, continuity.', brand: 'UNI-T', model: 'UT33D', tags: ['multimeter','measurement','unit'] },
  { cat: 9, title: 'Soldering Station 60W', desc: 'Temperature-controlled soldering station. 200-480°C range. With extra tips and sponge.', brand: 'Hakko', model: '936 Clone', tags: ['soldering','station','hakko'] },
  { cat: 9, title: 'Breadboard 830 Points x3', desc: 'Set of 3 full-size solderless breadboards. 830 tie points each. With power rails.', brand: 'Generic', model: null, tags: ['breadboard','prototyping','830'] },
  { cat: 9, title: 'Wire Stripping Tool', desc: 'Automatic wire stripper for AWG 10-24 gauge. Adjustable. Saves hours of stripping by hand.', brand: 'Irwin', model: null, tags: ['wire','stripper','tool'] },
  { cat: 9, title: 'Oscilloscope Probe Set 100MHz', desc: 'Set of 2 oscilloscope probes. x1/x10 switchable. BNC connector. Fits most bench scopes.', brand: 'Rigol', model: 'RP2200', tags: ['oscilloscope','probe','100mhz'] },
  { cat: 9, title: 'PCB Holder & Third Hand', desc: 'Adjustable PCB holder with magnifying glass and alligator clips. Frees up both hands for soldering.', brand: 'Generic', model: null, tags: ['pcb','holder','soldering'] },
  // More Microcontrollers
  { cat: 0, title: 'Wemos D1 Mini x3', desc: 'Compact ESP8266 boards. WiFi enabled, Arduino IDE compatible. 3 units with headers.', brand: 'Wemos', model: 'D1 Mini', tags: ['wemos','esp8266','compact'] },
  { cat: 0, title: 'Arduino Pro Mini 3.3V', desc: '3.3V version of Pro Mini. 8MHz ATmega328. Needs FTDI adapter for programming.', brand: 'Arduino', model: 'Pro Mini', tags: ['arduino','promini','3.3v'] },
  // More Sensors
  { cat: 1, title: 'MQ-2 Gas Sensor Module', desc: 'Detects LPG, propane, methane, alcohol, hydrogen, smoke. Analog and digital output.', brand: 'Generic', model: 'MQ-2', tags: ['gas','smoke','sensor'] },
  { cat: 1, title: 'Water Flow Sensor YF-S201', desc: '1/2 inch water flow sensor. Hall effect. 1-30 L/min range. For irrigation monitoring.', brand: 'Generic', model: 'YF-S201', tags: ['water','flow','hall'] },
  { cat: 1, title: 'IR Obstacle Avoidance Sensor x5', desc: 'Infrared proximity sensors. Digital output. Adjustable range. For line-following robots.', brand: 'Generic', model: null, tags: ['ir','obstacle','proximity'] },
  { cat: 1, title: 'TCS3200 Color Sensor Module', desc: 'RGB color sensor with photodiode array. Can identify colors in front of it. For sorting projects.', brand: 'Generic', model: 'TCS3200', tags: ['color','rgb','sensor'] },
  // More Dev boards
  { cat: 3, title: 'Orange Pi Zero 2W', desc: 'Low-cost SBC with Allwinner H618. WiFi and BT built in. Linux support. Cheaper than RPi.', brand: 'Orange Pi', model: 'Zero 2W', tags: ['orangepi','sbc','linux'] },
  { cat: 3, title: 'Seeeduino XIAO', desc: 'Tiny SAMD21 board. ARM Cortex-M0+. Breadboard friendly. USB-C. Good for wearables.', brand: 'Seeed Studio', model: 'XIAO', tags: ['seeed','xiao','tiny'] },
  // More Communication
  { cat: 6, title: 'ESP32-CAM Module', desc: 'ESP32 with OV2640 camera. WiFi streaming and face detection. With external antenna connector.', brand: 'Ai-Thinker', model: 'ESP32-CAM', tags: ['camera','esp32','streaming'] },
  { cat: 6, title: 'RFID-RC522 Reader Module', desc: 'MFRC522 RFID reader/writer. 13.56MHz. Comes with card and keychain tag. SPI interface.', brand: 'NXP', model: 'MFRC522', tags: ['rfid','nfc','reader'] },
  // More Tools
  { cat: 9, title: 'Hot Air Rework Station', desc: 'SMD rework station with adjustable airflow and temperature. Good for removing SMD components.', brand: 'Quick', model: '861DW Clone', tags: ['hotair','rework','smd'] },
  { cat: 9, title: 'Bench Power Supply 30V 5A', desc: 'Variable bench power supply. 0-30V, 0-5A. CV/CC mode. LED display. Essential for testing.', brand: 'Korad', model: 'KA3005D', tags: ['power','supply','bench'] },
  // More Embedded
  { cat: 8, title: 'A4988 Stepper Driver x3', desc: '3 units of A4988 stepper motor drivers. Microstepping up to 1/16. With heatsinks.', brand: 'Allegro', model: 'A4988', tags: ['stepper','driver','microstepping'] },
  { cat: 8, title: 'WS2812B LED Strip 1m 60LED', desc: 'Addressable RGB LED strip. 60 LEDs per meter. NeoPixel compatible. IP30 (no waterproofing).', brand: 'Generic', model: 'WS2812B', tags: ['neopixel','rgb','addressable'] },
  // More Power
  { cat: 5, title: 'XL6009 Boost Converter x3', desc: 'Step-up DC-DC converter. Input 3-32V, output 5-35V. 4A max. Adjustable.', brand: 'Generic', model: 'XL6009', tags: ['boost','converter','stepup'] },
  { cat: 5, title: 'INA219 Current Sensor Module', desc: 'I2C current/voltage/power monitor. Bidirectional. High-side sensing. Great for battery monitoring.', brand: 'Texas Instruments', model: 'INA219', tags: ['current','power','monitor'] },
  // More Passive
  { cat: 4, title: 'Potentiometer 10K x10', desc: '10 units of 10K linear taper potentiometers. 3-pin. With knobs.', brand: 'Bourns', model: null, tags: ['pot','variable','resistor'] },
  { cat: 4, title: 'Push Button Switch Kit 50pcs', desc: 'Tactile push button switches. 6x6x5mm. Momentary. Various cap colors included.', brand: 'Generic', model: null, tags: ['button','switch','tactile'] },
];

const insertComp = db.prepare(
  `INSERT INTO components (owner_id, category_id, title, description, brand, model_number, condition, listing_type,
   price_per_day, quantity, available_quantity, tags, image_urls, location, lab_name, status, views_count, created_at)
   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
);

const compIds = [];
for (const c of componentData) {
  const owner = pick(userIds);
  const loc = pick(locations);
  const cond = pick(conditions);
  const lt = pick(listingTypes);
  const price = lt === 'rent' ? randInt(10, 200) : lt === 'giveaway' ? null : randInt(0, 50) || null;
  const qty = randInt(1, 5);
  const avail = randInt(0, qty);
  const st = avail === 0 ? pick(['borrowed', 'unavailable']) : pick(statuses);
  const views = randInt(2, 450);

  const r = insertComp.run(
    owner, catIds[c.cat], c.title, c.desc, c.brand, c.model || null, cond, lt,
    price, qty, avail, JSON.stringify(c.tags), JSON.stringify([]),
    loc, loc.startsWith('Lab') ? loc : null, st, views, randomDate(6)
  );
  compIds.push(r.lastInsertRowid);
}

// ── BORROW REQUESTS ──
const reqStatuses = ['pending', 'approved', 'denied', 'returned', 'overdue', 'cancelled'];
const requestMessages = [
  'Hi, I need this for my FYP prototype. Can I borrow it for a week?',
  'Working on a robotics project and need this component. Will return in good condition.',
  'For the electronics lab assignment due next Friday. Will take good care of it.',
  'Building a weather station for my IoT coursework. Would really appreciate it!',
  'Need this for the upcoming hackathon this weekend. Will return Monday.',
  'My group project needs this sensor. We are in Lab 3 most afternoons.',
  'Can I rent this for 3 days? Working on a demo for our presentation.',
  'This is perfect for my smart home project. Available to pick up from Hostel Block A.',
  'Urgent: need for tomorrow\'s lab exam practice. Will return same day.',
  'Planning to use this in the IEEE robotics competition next month.',
];

const responseMessages = [
  'Sure, pick it up from my lab bench anytime.',
  'Approved! Please handle with care and return on time.',
  'Sorry, already promised to someone else this week. Try again next week?',
  'No problem, I\'ll leave it at the lab reception for you.',
  'Please return it by the date. I need it for my own project after that.',
];

const insertReq = db.prepare(
  `INSERT INTO borrow_requests (component_id, requester_id, lender_id, status, request_message, response_message,
   borrow_date, return_date, actual_return_date, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)`
);

const reqIds = [];
for (let i = 0; i < 48; i++) {
  const compId = pick(compIds);
  const comp = db.prepare('SELECT owner_id FROM components WHERE id = ?').get(compId);
  let reqUser = pick(userIds);
  while (reqUser === comp.owner_id) reqUser = pick(userIds);

  const st = pick(reqStatuses);
  const createdAt = randomDate(6);
  const borrowDate = randomDate(4);
  const returnDate = new Date(new Date(borrowDate).getTime() + randInt(3, 21) * 86400000).toISOString().substring(0, 10);
  const actualReturn = (st === 'returned') ? randomDate(2) : null;
  const respMsg = (st !== 'pending' && st !== 'cancelled') ? pick(responseMessages) : null;

  const r = insertReq.run(compId, reqUser, comp.owner_id, st, pick(requestMessages), respMsg, borrowDate, returnDate, actualReturn, createdAt);
  reqIds.push(r.lastInsertRowid);
}

// ── REVIEWS ──
const reviewComments = [
  'Component was in great condition. Smooth transaction, would borrow again.',
  'Returned on time and in perfect condition. Reliable borrower!',
  'Very responsive and easy to work with. The sensor worked perfectly for my project.',
  'Good experience overall. Component had a minor scratch but functioned fine.',
  'Excellent lender, very helpful and even gave me tips on using the module.',
  'Took good care of my board. Would lend to them again anytime.',
  'Fast response, picked up same day. Professional and courteous.',
  'The component was well-packaged. Great communication throughout.',
  'Returned the item a day late but in good shape. Communication could be better.',
  'Top-notch experience. Also helped me debug my circuit when I was stuck.',
  'Average experience. Component worked but was missing the data cable.',
  'Really helpful person. Lent me extra jumper wires along with the module.',
  'Would definitely recommend. The board was as described.',
  'Quick and hassle-free. Met at the lab and exchanged in 5 minutes.',
  'Solid transaction. The sensor needed calibration but otherwise great.',
];

const insertReview = db.prepare(
  'INSERT INTO reviews (reviewer_id, reviewed_user_id, request_id, rating, comment, created_at) VALUES (?,?,?,?,?,?)'
);

const returnedReqs = db.prepare("SELECT * FROM borrow_requests WHERE status = 'returned'").all();
for (let i = 0; i < Math.min(35, returnedReqs.length); i++) {
  const req = returnedReqs[i];
  const isRequesterReviewing = Math.random() > 0.5;
  const reviewerId = isRequesterReviewing ? req.requester_id : req.lender_id;
  const reviewedId = isRequesterReviewing ? req.lender_id : req.requester_id;

  insertReview.run(reviewerId, reviewedId, req.id, randInt(3, 5), pick(reviewComments), randomDate(3));
}

// Update user ratings
const allUsers = db.prepare('SELECT id FROM users').all();
for (const u of allUsers) {
  const avg = db.prepare('SELECT AVG(rating) as avg FROM reviews WHERE reviewed_user_id = ?').get(u.id);
  if (avg.avg) {
    db.prepare('UPDATE users SET rating = ? WHERE id = ?').run(Math.round(avg.avg * 10) / 10, u.id);
  }
}

// ── NOTIFICATIONS ──
const notifTypes = ['request_received', 'request_approved', 'request_denied', 'item_returned', 'new_review', 'system'];
const notifTitles = {
  request_received: 'New Borrow Request',
  request_approved: 'Request Approved',
  request_denied: 'Request Denied',
  item_returned: 'Item Returned',
  new_review: 'New Review Received',
  system: 'System Notification',
};
const notifMessages = {
  request_received: 'Someone wants to borrow your component',
  request_approved: 'Your borrow request has been approved',
  request_denied: 'Your borrow request was denied',
  item_returned: 'A borrowed item has been returned',
  new_review: 'You received a new rating',
  system: 'Welcome to ComponentHub! Start by listing your spare components.',
};

const insertNotif = db.prepare(
  'INSERT INTO notifications (user_id, type, title, message, is_read, created_at) VALUES (?,?,?,?,?,?)'
);

for (let i = 0; i < 60; i++) {
  const type = pick(notifTypes);
  insertNotif.run(pick(userIds), type, notifTitles[type], notifMessages[type], Math.random() > 0.4 ? 1 : 0, randomDate(4));
}

// ── MESSAGES ──
const msgContents = [
  'Hey, is that Arduino still available? I need it for my project.',
  'Sure, you can pick it up from Lab 2 tomorrow morning.',
  'Thanks! What time works best for you?',
  'Around 10 AM would be great. My lab session ends at 9:30.',
  'Perfect, see you then. I\'ll bring it in the original box.',
  'Hi, do you have any extra jumper wires? I ran out during my prototype.',
  'Yeah I have a spare set. Meet me at the canteen?',
  'Can you hold the ESP32 for me until Friday? I\'m getting paid then.',
  'No problem, I\'ll reserve it. Just let me know when you\'re ready.',
  'Is the soldering station working properly? The tip looks worn in the photo.',
  'It works great, I just replaced the tip last month. The photo is old.',
  'Would you consider trading the Raspberry Pi for my Arduino Mega?',
  'Hmm, I need the Pi for my FYP. Maybe after December?',
  'The sensor you lent me worked perfectly. Thanks a lot!',
  'Glad to hear it! Good luck with your project presentation.',
  'Hey, I accidentally left the USB cable. I\'ll bring it to Lab 3 tomorrow.',
  'No worries, I have extras. Keep it if you need one.',
  'Can you teach me how to program the STM32? I\'m new to ARM.',
  'Sure, come to the robotics club meeting this Thursday. We\'re doing a workshop.',
  'Is the FPGA board compatible with Vivado 2023? I have the latest version.',
  'Yes, it works with Vivado 2023.2. I can share my constraint file too.',
];

const insertMsg = db.prepare(
  'INSERT INTO messages (sender_id, receiver_id, component_id, content, is_read, created_at) VALUES (?,?,?,?,?,?)'
);

for (let i = 0; i < 25; i++) {
  let sender = pick(userIds);
  let receiver = pick(userIds);
  while (receiver === sender) receiver = pick(userIds);
  const compRef = Math.random() > 0.5 ? pick(compIds) : null;
  insertMsg.run(sender, receiver, compRef, msgContents[i % msgContents.length], Math.random() > 0.3 ? 1 : 0, randomDate(3));
}

// ── WISHLISTS ──
const insertWish = db.prepare('INSERT OR IGNORE INTO wishlists (user_id, component_id, created_at) VALUES (?,?,?)');
for (let i = 0; i < 20; i++) {
  insertWish.run(pick(userIds), pick(compIds), randomDate(2));
}

// ── ACTIVITY LOG ──
const actions = ['create_component', 'update_component', 'delete_component', 'create_request', 'approve_request', 'deny_request', 'return_item', 'register', 'login', 'update_profile', 'add_review', 'add_to_wishlist'];
const insertLog = db.prepare(
  'INSERT INTO activity_log (user_id, action, entity_type, entity_id, details, created_at) VALUES (?,?,?,?,?,?)'
);

for (let i = 0; i < 120; i++) {
  const action = pick(actions);
  const entityType = action.includes('component') ? 'component' : action.includes('request') ? 'borrow_request' : 'user';
  const entityId = entityType === 'component' ? pick(compIds) : entityType === 'borrow_request' ? pick(reqIds) : pick(userIds);
  insertLog.run(pick(userIds), action, entityType, entityId, JSON.stringify({ action }), randomDate(6));
}

db.close();
console.log('\n✅ Database seeded successfully!');
console.log('📊 Created:');
console.log(`   ${users.length} users`);
console.log(`   ${categories.length} categories`);
console.log(`   ${componentData.length} components`);
console.log(`   48 borrow requests`);
console.log(`   35+ reviews`);
console.log(`   60 notifications`);
console.log(`   25 messages`);
console.log(`   20 wishlist items`);
console.log(`   120 activity log entries`);
console.log('\n🔑 Default credentials:');
console.log('   Superadmin: admin@componenthub.lk / password123');
console.log('   Lab Admin:  lab@componenthub.lk / password123');
console.log('   Student:    student@componenthub.lk / password123\n');
