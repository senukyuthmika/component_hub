const RULES = [
  { file: 'arduino-uno.jpg', keys: ['arduino uno', 'uno r3'] },
  { file: 'arduino-nano.jpg', keys: ['arduino nano', 'nano every'] },
  { file: 'arduino-mega.jpg', keys: ['arduino mega', 'mega 2560'] },
  { file: 'pro-mini.jpg', keys: ['pro mini'] },
  { file: 'esp32cam.jpg', keys: ['esp32-cam', 'esp32 cam'] },
  { file: 'esp32.jpg', keys: ['esp32'] },
  { file: 'wemos.jpg', keys: ['wemos', 'd1 mini'] },
  { file: 'nodemcu.jpg', keys: ['nodemcu', 'esp8266'] },
  { file: 'stm32-bluepill.jpg', keys: ['stm32', 'blue pill'] },
  { file: 'attiny85.jpg', keys: ['attiny'] },
  { file: 'teensy.jpg', keys: ['teensy'] },
  { file: 'atmega328.jpg', keys: ['atmega328'] },
  { file: 'pico.jpg', keys: ['pico'] },
  { file: 'rpi4.jpg', keys: ['raspberry pi 4', 'raspberry pi', 'rpi'] },
  { file: 'jetson.jpg', keys: ['jetson'] },
  { file: 'beaglebone.jpg', keys: ['beagle'] },
  { file: 'basys3.jpg', keys: ['basys', 'fpga', 'xilinx'] },
  { file: 'orangepi.jpg', keys: ['orange pi'] },
  { file: 'xiao.jpg', keys: ['xiao', 'seeeduino'] },
  { file: 'dht22.jpg', keys: ['dht22', 'dht11', 'humidity'] },
  { file: 'hcsr04.jpg', keys: ['hc-sr04', 'ultrasonic'] },
  { file: 'mpu6050.jpg', keys: ['mpu-6050', 'mpu6050', 'gyroscope', 'accelerometer'] },
  { file: 'bmp280.jpg', keys: ['bmp280', 'barometric'] },
  { file: 'pir.jpg', keys: ['pir', 'motion sensor'] },
  { file: 'soil-moisture.jpg', keys: ['soil moisture', 'yl-69'] },
  { file: 'max30102.jpg', keys: ['max30102', 'heart rate', 'spo2'] },
  { file: 'hx711.jpg', keys: ['hx711', 'load cell', 'loadcell'] },
  { file: 'tcs3200.jpg', keys: ['tcs3200', 'color sensor'] },
  { file: 'mq2.jpg', keys: ['mq-2', 'mq2', 'gas sensor'] },
  { file: 'water-flow.jpg', keys: ['yf-s201', 'water flow'] },
  { file: 'ir-sensor.jpg', keys: ['ir obstacle', 'infrared'] },
  { file: 'lm7805.jpg', keys: ['7805', 'voltage regulator'] },
  { file: 'ne555.jpg', keys: ['ne555', '555 timer'] },
  { file: 'lm358.jpg', keys: ['lm358', 'op-amp', 'opamp'] },
  { file: 'l293d.jpg', keys: ['l293'] },
  { file: 'cd4017.jpg', keys: ['cd4017', '4017', 'decade counter'] },
  { file: 'resistors.jpg', keys: ['resistor'] },
  { file: 'ceramic-caps.jpg', keys: ['ceramic capacitor', 'ceramic cap'] },
  { file: 'electrolytic-caps.jpg', keys: ['electrolytic'] },
  { file: 'leds.jpg', keys: ['led assortment', '5mm led'] },
  { file: 'ws2812.jpg', keys: ['ws2812', 'neopixel'] },
  { file: 'jumpers.jpg', keys: ['jumper'] },
  { file: 'lm2596.jpg', keys: ['lm2596', 'buck'] },
  { file: 'xl6009.jpg', keys: ['xl6009', 'boost'] },
  { file: '18650.jpg', keys: ['18650'] },
  { file: 'tp4056.jpg', keys: ['tp4056'] },
  { file: 'psu.jpg', keys: ['10a power', 'rs-50', 'mean well'] },
  { file: 'bench-psu.jpg', keys: ['bench power', 'ka3005'] },
  { file: 'solar.jpg', keys: ['solar'] },
  { file: 'ina219.jpg', keys: ['ina219'] },
  { file: 'nrf24.jpg', keys: ['nrf24'] },
  { file: 'hc05.jpg', keys: ['hc-05', 'hc05', 'bluetooth'] },
  { file: 'sim800l.jpg', keys: ['sim800', 'gsm'] },
  { file: 'lora.jpg', keys: ['lora', 'sx1278', 'ra-02'] },
  { file: 'w5500.jpg', keys: ['w5500', 'ethernet'] },
  { file: 'rc522.jpg', keys: ['rc522', 'rfid', 'mfrc522'] },
  { file: 'ads1115.jpg', keys: ['ads1115'] },
  { file: 'mcp4725.jpg', keys: ['mcp4725', 'dac'] },
  { file: 'tda2030.jpg', keys: ['tda2030'] },
  { file: 'max7219.jpg', keys: ['max7219', 'led matrix'] },
  { file: 'oled.jpg', keys: ['oled', 'ssd1306'] },
  { file: 'lcd1602.jpg', keys: ['16x2', 'hd44780', 'lcd'] },
  { file: 'nextion.jpg', keys: ['nextion', 'tft'] },
  { file: 'l298n.jpg', keys: ['l298'] },
  { file: 'a4988.jpg', keys: ['a4988'] },
  { file: 'relay.jpg', keys: ['relay'] },
  { file: 'sg90.jpg', keys: ['sg90'] },
  { file: 'mg996r.jpg', keys: ['mg996'] },
  { file: 'nema17.jpg', keys: ['nema 17', 'nema17', 'stepper motor'] },
  { file: 'logic-analyzer.jpg', keys: ['logic analyzer'] },
  { file: 'multimeter.jpg', keys: ['multimeter', 'ut33'] },
  { file: 'soldering.jpg', keys: ['soldering station'] },
  { file: 'hotair.jpg', keys: ['hot air', 'rework'] },
  { file: 'breadboard.jpg', keys: ['breadboard'] },
  { file: 'wire-stripper.jpg', keys: ['stripping', 'stripper'] },
  { file: 'scope-probe.jpg', keys: ['oscilloscope', 'probe'] },
  { file: 'third-hand.jpg', keys: ['third hand', 'pcb holder'] },
  { file: 'potentiometer.jpg', keys: ['potentiometer', '10k'] },
  { file: 'buttons.jpg', keys: ['push button', 'tactile'] },
];

const CATEGORY_FILES = {
  microcontrollers: 'arduino-uno.jpg',
  sensors: 'hcsr04.jpg',
  ics: 'ne555.jpg',
  'dev boards': 'rpi4.jpg',
  'passive components': 'resistors.jpg',
  'power electronics': 'lm2596.jpg',
  'communication modules': 'hc05.jpg',
  analog: 'oled.jpg',
  embedded: 'sg90.jpg',
  'tools and equipment': 'multimeter.jpg',
};

function haystack(component = {}) {
  const tags = Array.isArray(component.tags) ? component.tags.join(' ') : (component.tags || '');
  return [
    component.title,
    component.model_number,
    component.brand,
    component.category_name,
    tags,
  ].filter(Boolean).join(' ').toLowerCase();
}

export function getMappedComponentImage(component) {
  const text = haystack(component);
  const match = RULES.find((rule) => rule.keys.some((key) => text.includes(key)));
  if (match) return `/components/${match.file}`;

  const cat = (component.category_name || '').toLowerCase();
  return `/components/${CATEGORY_FILES[cat] || 'electronics.jpg'}`;
}

export function getComponentImageSources(component) {
  const uploaded = (component?.image_urls || []).filter((url) => typeof url === 'string' && url.length > 2 && url !== '[]');
  const mapped = getMappedComponentImage(component);
  return [...new Set([...uploaded, mapped])];
}

export function getComponentImage(component) {
  return getComponentImageSources(component)[0];
}
