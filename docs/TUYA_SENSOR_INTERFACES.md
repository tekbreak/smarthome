# Tuya Sensor Interfaces

Reference for Tuya device status codes (DP / data points) used in this project.

> See also: [smart-home/README.md](../smart-home/README.md) for device setup.

## Official docs

- [PIR Human Sensor (Motion)](https://developer.tuya.com/en/docs/iot/categorypir?id=Kaiuz3ss11b80)
- [Motion Sensor](https://developer.tuya.com/en/docs/iot-device-dev/tuya-pir-sensor?id=K9ik6zvn49x5m)
- [PIR Sensor Product Development Kit](https://developer.tuya.com/docs/iot-device-dev/tuyaos_zigbee_pir_sensor_product_development_kit?id=Kd6e31hjdlmxb)

## Known status codes

| Device type | Code | Description |
|-------------|------|-------------|
| Door sensor | `doorcontact_state` | `true` = open, `false` = closed |
| Door sensor | `battery_percentage` | Battery level |
| Temperature | `va_temperature` | Temperature (often ×10, e.g. 235 = 23.5°C) |
| Temperature | `temperature`, `temp` | Alternative codes |
| Motion (PIR) | `pir_state` | Motion detected (to confirm) |
| Motion (PIR) | `occupancy_state` | Occupancy (to confirm) |
| Motion (PIR) | `motion_state` | Motion (to confirm) |

## Discovering unknown codes

Enable debug logging to capture real status from Tuya:

```bash
DEVICE_STATUS_DEBUG=1 npm run start:server
```

Logs are written to `logs/device-status-debug.log`:

```
[2025-02-28T12:00:00.000Z] tuya-api | id=bfa386efa404748613xljg | name=Sensor Entrada | type=motion | status=[{"code":"pir_state","value":false}]
```

- **tuya-api** = status from Tuya Cloud API (polling)
- **device:status** = real-time update from smart-home (Zigbee gateway)

After triggering a motion sensor, check the log to see which `code` and `value` Tuya uses.
