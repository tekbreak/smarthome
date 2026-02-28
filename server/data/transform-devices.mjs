// Import from smart-home (path from server/data/)
const { DEVICES: RAW_DEVICES } = await import("../../smart-home/devices.mjs");

/**
 * Device type mapping: Sensores vs Controles
 * - Sensores: smart-home (doors), sensor (temp), motion (motion)
 * - Controles: switch, ir-trigger
 */
const MOTION_SENSOR_NAMES = new Set([
  "Sensor Entrada",
  "Juegos Mov",
  "Niños Mov",
  "Oficina Mov",
]);

const CONTROLES_BY_NAME = new Set([
  "Botón Oficina",
  "Botón Casa",
  "AireAcondicionado",
]);

const TEMP_SENSORS = [
  { name: "Temp Salon", type: "sensor", id: "bfe96af25b20f764810chc", code: ["va_temperature"] },
  { name: "Temp Cuarto Juegos", type: "sensor", id: "bf20bd833e527e8585svre", code: ["va_temperature"] },
  { name: "Temp Cocina", type: "sensor", id: "bf89c2f8f5862b24fbh2tc", code: ["va_temperature"] },
  { name: "Temp Dormitorio Niños", type: "sensor", id: "bfed17d82ad9b2be3enhwc", code: ["va_temperature"] },
];

const DOOR_SENSOR_NAMES = new Set([
  "Puerta Pasillo",
  "Puerta Salida",
]);

/**
 * Transform smart-home/devices.json (via devices.mjs) into server device format.
 * Flattens subDevices and assigns types based on device-type map.
 */
export function transformDevices() {
  const result = [];

  for (const device of RAW_DEVICES) {
    if (device.subDevices) {
      if (device.name.includes("Zigbee")) {
        for (const sub of device.subDevices) {
          if (CONTROLES_BY_NAME.has(sub.name)) {
            result.push({
              name: sub.name,
              type: "ir-trigger",
              id: sub.id,
              code: ["switch_1"],
            });
          } else if (DOOR_SENSOR_NAMES.has(sub.name)) {
            result.push({
              name: sub.name,
              type: "smart-home",
              id: sub.id,
              code: ["doorcontact_state", "battery_percentage"],
            });
          } else if (MOTION_SENSOR_NAMES.has(sub.name)) {
            result.push({
              name: sub.name,
              type: "motion",
              id: sub.id,
              code: ["pir_state", "occupancy_state", "motion_state"],
            });
          } else if (sub.name.includes("Temp ")) {
            // Handled by TEMP_SENSORS below
            continue;
          } else if (sub.name.includes("Aire") || sub.name.includes("AC")) {
            result.push({
              name: sub.name,
              type: "switch",
              id: sub.id,
              code: ["switch"],
              iconSize: 80,
            });
          } else {
            result.push({
              name: sub.name,
              type: "switch",
              id: sub.id,
              code: ["switch_1"],
            });
          }
        }
      } else if (device.name.includes("IR")) {
        for (const sub of device.subDevices) {
          result.push({
            name: sub.name,
            type: "ir-trigger",
            id: sub.id,
            code: ["switch_1"],
          });
        }
      }
    } else {
      const name = device.name.toLowerCase();
      if (name.includes("aire") || name.includes("ac")) {
        result.push({
          name: device.name,
          type: "switch",
          id: device.id,
          code: ["switch"],
          iconSize: 80,
        });
      } else if (
        name.includes("contact sensor") ||
        name.includes("puerta multimodal")
      ) {
        result.push({
          name: device.name,
          type: "smart-home",
          id: device.id,
          code: ["doorcontact_state", "battery_percentage"],
        });
      } else {
        result.push({
          name: device.name,
          type: "switch",
          id: device.id,
          code: ["switch_1"],
        });
      }
    }
  }

  // Navidad alias (same as Mosquitos Salón)
  const mosquitosSalon = result.find((d) => d.id === "bfcee4c8d26f86586bhhhu");
  if (mosquitosSalon) {
    result.push({
      name: "Navidad",
      type: "switch",
      id: mosquitosSalon.id,
      code: ["switch_1"],
    });
  }

  return [...result, ...TEMP_SENSORS];
}
