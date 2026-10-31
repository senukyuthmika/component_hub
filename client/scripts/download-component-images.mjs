import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'public', 'components');
const UA = 'ComponentHub/1.0 (campus electronics sharing app; educational use)';

const items = [
  { file: 'arduino-uno.jpg', names: ['Arduino_Uno_-_R3.jpg', 'Arduino_Uno_R3.jpg'] },
  { file: 'esp32.jpg', names: ['ESP32_DevkitC_board-En.JPG', 'ESP32_DevKitC_V4.jpg'] },
  { file: 'arduino-nano.jpg', names: ['Arduino_Nano.jpg', 'ArduinoNano.JPG'] },
  { file: 'stm32-bluepill.jpg', names: ['STM32_Blue_Pill.jpg', 'Blue_Pill_STM32F103.jpg', 'STM32F103C8T6.jpg'] },
  { file: 'arduino-mega.jpg', names: ['Arduino_Mega_2560.jpg', 'ArduinoMega2560.jpg', 'Arduino_Mega2560.jpg'] },
  { file: 'nodemcu.jpg', names: ['NodeMCU_DEVKIT_1.0.jpg', 'NodeMCU.jpg'] },
  { file: 'attiny85.jpg', names: ['Atmel_ATtiny85.jpg', 'ATtiny85.jpg', 'DIP-8.jpg'] },
  { file: 'teensy.jpg', names: ['Teensy_3.2.jpg', 'Teensy_USB_development_board.jpg'] },
  { file: 'dht22.jpg', names: ['DHT22_temperature_humidity_sensor.jpg', 'DHT22.jpg', 'DHT11.jpg'] },
  { file: 'hcsr04.jpg', names: ['HC-SR04.jpg', 'Ultrasonic_Sensor_HC-SR04.jpg', 'Hc-sr04.jpg'] },
  { file: 'mpu6050.jpg', names: ['MPU-6050.jpg', 'MPU6050.jpg'] },
  { file: 'bmp280.jpg', names: ['BMP280.jpg', 'Bosch_BMP280.jpg'] },
  { file: 'pir.jpg', names: ['PIR_motion_sensor.jpg', 'HC-SR501.jpg', 'Passive_infrared_sensor.jpg'] },
  { file: 'soil-moisture.jpg', names: ['Soil_moisture_sensor.jpg', 'Hygrometer.jpg'] },
  { file: 'max30102.jpg', names: ['MAX30102.jpg', 'Pulse_oximeter.jpg'] },
  { file: 'hx711.jpg', names: ['Load_cell.jpg', 'Strain_gauge.jpg', 'HX711.jpg'] },
  { file: 'lm7805.jpg', names: ['7805_voltage_regulator.jpg', 'LM7805.jpg', 'TO-220.jpg'] },
  { file: 'ne555.jpg', names: ['Signetics_NE555N.JPG', 'NE555.jpg', '555_timer_IC.jpg'] },
  { file: 'lm358.jpg', names: ['LM358.jpg', 'Operational_amplifier.jpg'] },
  { file: 'atmega328.jpg', names: ['ATmega328P.jpg', 'Atmel_ATmega328.jpg', 'DIP-28.jpg'] },
  { file: 'l293d.jpg', names: ['L293D.jpg', 'H-bridge.jpg'] },
  { file: 'cd4017.jpg', names: ['CD4017.jpg', 'CMOS_4017.jpg', 'DIP-16_IC.jpg'] },
  { file: 'rpi4.jpg', names: ['Raspberry_Pi_4_Model_B_-_Side.jpg', 'Raspberry_Pi_4.jpg'] },
  { file: 'pico.jpg', names: ['Raspberry_Pi_Pico.jpg', 'RP2040.jpg'] },
  { file: 'basys3.jpg', names: ['Basys3.jpg', 'Xilinx_Artix-7.jpg', 'FPGA_board.jpg'] },
  { file: 'beaglebone.jpg', names: ['BeagleBone_Black.jpg', 'BeagleBoneBlack.jpg'] },
  { file: 'jetson.jpg', names: ['NVIDIA_Jetson_Nano.jpg', 'Jetson_Nano.jpg'] },
  { file: 'resistors.jpg', names: ['Axial_lead_resistors.jpg', 'Resistors.jpg', 'Electronic_resistors.jpg'] },
  { file: 'ceramic-caps.jpg', names: ['Ceramic_capacitor.jpg', 'Ceramic_disc_capacitor.jpg'] },
  { file: 'electrolytic-caps.jpg', names: ['Electrolytic_capacitor.jpg', 'Electrolytic_capacitors.jpg'] },
  { file: 'leds.jpg', names: ['5mm_LED.jpg', 'Light-emitting_diode.jpg', 'LEDs.jpg'] },
  { file: 'jumpers.jpg', names: ['Jumper_wires.jpg', 'Dupont_wire.jpg', 'Breadboard_wires.jpg'] },
  { file: 'lm2596.jpg', names: ['LM2596.jpg', 'Buck_converter.jpg', 'DC-DC_converter.jpg'] },
  { file: '18650.jpg', names: ['18650_battery.jpg', 'Lithium-ion_battery_18650.jpg'] },
  { file: 'psu.jpg', names: ['Switched-mode_power_supply.jpg', 'Mean_Well_power_supply.jpg'] },
  { file: 'solar.jpg', names: ['Small_solar_panel.jpg', 'Photovoltaic_module.jpg', 'Solar_cell.jpg'] },
  { file: 'tp4056.jpg', names: ['TP4056.jpg', 'Lithium_battery_charger.jpg'] },
  { file: 'nrf24.jpg', names: ['NRF24L01.jpg', 'nRF24L01P.jpg'] },
  { file: 'hc05.jpg', names: ['HC-05.jpg', 'Bluetooth_module.jpg'] },
  { file: 'sim800l.jpg', names: ['SIM800L.jpg', 'GSM_module.jpg'] },
  { file: 'lora.jpg', names: ['LoRa_module.jpg', 'SX1278.jpg', 'RFM95.jpg'] },
  { file: 'w5500.jpg', names: ['W5500.jpg', 'Ethernet_module.jpg'] },
  { file: 'ads1115.jpg', names: ['ADS1115.jpg', 'ADC_module.jpg'] },
  { file: 'mcp4725.jpg', names: ['MCP4725.jpg', 'DAC_module.jpg'] },
  { file: 'tda2030.jpg', names: ['TDA2030.jpg', 'Audio_amplifier_module.jpg'] },
  { file: 'max7219.jpg', names: ['MAX7219.jpg', '8x8_LED_matrix.jpg'] },
  { file: 'oled.jpg', names: ['SSD1306.jpg', 'OLED_display.jpg', '0.96_OLED.jpg'] },
  { file: 'l298n.jpg', names: ['L298N.jpg', 'L298N_motor_driver.jpg'] },
  { file: 'relay.jpg', names: ['Relay_module.jpg', '4-channel_relay.jpg'] },
  { file: 'sg90.jpg', names: ['SG90_servo.jpg', 'Micro_servo.jpg', '9g_servo.jpg'] },
  { file: 'lcd1602.jpg', names: ['HD44780.jpg', '16x2_LCD.jpg', 'Character_LCD.jpg'] },
  { file: 'nema17.jpg', names: ['NEMA_17_stepper_motor.jpg', 'Stepper_motor.jpg'] },
  { file: 'mg996r.jpg', names: ['MG996R.jpg', 'Metal_gear_servo.jpg'] },
  { file: 'nextion.jpg', names: ['Nextion.jpg', 'TFT_LCD.jpg', 'Touchscreen_display.jpg'] },
  { file: 'logic-analyzer.jpg', names: ['Logic_analyzer.jpg', 'USB_logic_analyzer.jpg', 'Saleae.jpg'] },
  { file: 'multimeter.jpg', names: ['Digital_multimeter.jpg', 'Multimeter.jpg'] },
  { file: 'soldering.jpg', names: ['Soldering_station.jpg', 'Hakko_soldering_station.jpg'] },
  { file: 'breadboard.jpg', names: ['Breadboard.jpg', 'Solderless_breadboard.jpg'] },
  { file: 'wire-stripper.jpg', names: ['Wire_stripper.jpg', 'Wire_stripping_tool.jpg'] },
  { file: 'scope-probe.jpg', names: ['Oscilloscope_probe.jpg', 'Oscilloscope.jpg'] },
  { file: 'third-hand.jpg', names: ['Helping_hands.jpg', 'Third_hand_tool.jpg'] },
  { file: 'wemos.jpg', names: ['Wemos_D1_Mini.jpg', 'D1_Mini.jpg'] },
  { file: 'pro-mini.jpg', names: ['Arduino_Pro_Mini.jpg', 'ArduinoProMini.jpg'] },
  { file: 'mq2.jpg', names: ['MQ-2.jpg', 'Gas_sensor.jpg', 'MQ2_sensor.jpg'] },
  { file: 'water-flow.jpg', names: ['YF-S201.jpg', 'Water_flow_sensor.jpg'] },
  { file: 'ir-sensor.jpg', names: ['IR_sensor.jpg', 'Infrared_proximity_sensor.jpg'] },
  { file: 'tcs3200.jpg', names: ['TCS3200.jpg', 'Color_sensor.jpg'] },
  { file: 'orangepi.jpg', names: ['Orange_Pi.jpg', 'Orange_Pi_Zero.jpg'] },
  { file: 'xiao.jpg', names: ['Seeeduino_XIAO.jpg', 'Seeed_XIAO.jpg'] },
  { file: 'esp32cam.jpg', names: ['ESP32-CAM.jpg', 'ESP32_CAM.jpg'] },
  { file: 'rc522.jpg', names: ['RC522.jpg', 'MFRC522.jpg', 'RFID_reader.jpg'] },
  { file: 'hotair.jpg', names: ['Hot_air_gun.jpg', 'SMD_rework_station.jpg'] },
  { file: 'bench-psu.jpg', names: ['Bench_power_supply.jpg', 'Laboratory_power_supply.jpg'] },
  { file: 'a4988.jpg', names: ['A4988.jpg', 'A4988_stepper_driver.jpg', 'Pololu_A4988.jpg'] },
  { file: 'ws2812.jpg', names: ['WS2812B.jpg', 'NeoPixel.jpg', 'Addressable_LED_strip.jpg'] },
  { file: 'xl6009.jpg', names: ['XL6009.jpg', 'Boost_converter.jpg'] },
  { file: 'ina219.jpg', names: ['INA219.jpg', 'Current_sensor_module.jpg'] },
  { file: 'potentiometer.jpg', names: ['Potentiometer.jpg', 'Rotary_potentiometer.jpg'] },
  { file: 'buttons.jpg', names: ['Tactile_switch.jpg', 'Push_button.jpg'] },
  { file: 'electronics.jpg', names: ['Electronic_components.jpg', 'Printed_circuit_board.jpg'] },
];

function filepathUrl(name) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=800`;
}

async function download(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'image/*' }, redirect: 'follow' });
  if (res.status === 429) {
    const err = new Error('429');
    err.retry = true;
    throw err;
  }
  if (!res.ok) throw new Error(String(res.status));
  const type = res.headers.get('content-type') || '';
  if (!type.startsWith('image/')) throw new Error(type || 'not image');
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2500) throw new Error('tiny');
  return buf;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

await mkdir(OUT, { recursive: true });

let delay = 800;
for (const item of items) {
  const dest = path.join(OUT, item.file);
  if (existsSync(dest)) {
    console.log('skip', item.file);
    continue;
  }
  let saved = false;
  for (const name of item.names) {
    try {
      const buf = await download(filepathUrl(name));
      await writeFile(dest, buf);
      console.log('ok', item.file, name);
      saved = true;
      break;
    } catch (err) {
      if (err.retry) {
        console.log('rate-limit, waiting');
        await sleep(8000);
        try {
          const buf = await download(filepathUrl(name));
          await writeFile(dest, buf);
          console.log('ok', item.file, name);
          saved = true;
          break;
        } catch (e2) {
          console.log('fail', item.file, name, e2.message);
        }
      } else {
        console.log('miss', item.file, name, err.message);
      }
    }
    await sleep(delay);
  }
  if (!saved) console.log('NONE', item.file);
  await sleep(delay);
}
