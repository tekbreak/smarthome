// https://github.com/codetheweb/tuyapi

import TuyAPI from 'tuyapi';
import _ from 'lodash'
import {log, getMessage, isCriticalTime, telegramNotify} from "./utils.mjs";
import {SENSORS, SENSORS_CONFIGURATION} from "./sensors.mjs";
import { CONFIG } from "./config.mjs";

if (CONFIG.debug) {
  log('============================');
  log('============================');
  log('======== DEBUG MODE ========');
  log('============================');
  log('============================');
}

let device;
try {
  // Connection to the Zigbee gateway
  device = new TuyAPI({
    id: 'bf0229b38c4da9e7b1tzdl',
    key: "<sp[_~n)caHg)2oi",
    version: '3.4',
    // issueRefreshOnConnect: true,
    issueRefreshOnPing: true,
    issueGetOnConnect: false
  });

  await device.find();
  await device.connect();
} catch (e) {
  console.log('Device', device);
  console.log('ERROR: ', e);
  process.exit();
}



if (!device) {
  console.log('fin')
  process.exit();
}


device.on('data', data => {
  if (!Object.values(SENSORS).includes(data?.cid)) {
    return;
  }

  const sensor = SENSORS_CONFIGURATION[data.cid];
  const newState = data.dps?.['1'];

  const message = getMessage(sensor.name, newState);
  const isDoorOpen = newState === true;
  const action = isDoorOpen ? 'onOpen' : 'onClose';
  const mode = isCriticalTime() ? 'critical' : 'default';

  log('Sensor: Action and mode: ', sensor.name, action, mode);

  // Run Sensors configurations
  // Initial data for commands
  let dataForCommands = {
    debug: CONFIG.debug,
    timer: {},
    message
  }

  // Run all commands in this mode
  sensor[action][mode].forEach(command => {
    log('Running ', command.name)
    const result = command(dataForCommands);

    if (result) {
      dataForCommands = _.merge(dataForCommands, result);
    }
  });
});

log('\n\nSmart-home armed (OK)\n\n');
log('Listening for data:\n\n');
telegramNotify('Sistema de Puertas REACTIVADO', CONFIG.debug);
