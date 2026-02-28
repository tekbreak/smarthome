// https://github.com/codetheweb/tuyapi

import TuyAPI from 'tuyapi';
import axios from 'axios';
//import { Modem } from './modem.mjs';
import { exec } from 'child_process'

import * as dotenv from 'dotenv'
dotenv.config();
const isDebug = process.env.DEBUG === '1';

const log = (text) => console.log(text);

log('============================');
log('============================');
log('======== DEBUG MODE ========');
log('============================');
log('============================');

const doors = {
  main: "a4c1384d5863dc36",
  corridor: "a4c1387d30bb67b9"
}

const sensors = {
  [doors.corridor]: {
    name: 'Pasillo',
    schedule: {
      default: {
        start: 21,
        end: 8
      },
      6: {
        end: 11
      },
      0: {
        end: 11
      },
    }
  },
  [doors.main]: {
    name: 'Salida',
    schedule: {
      default: {
        start: 23,
        end: 9
      },
      6: {
        end: 11
      },
      0: {
        end: 11
      }
    },
  },
}

const telegramNotify = (message) => {
  if (isDebug) {
    return;
  }

  log('Telegram Notify: ', message);
  const url = 'https://smarthome.tekbreak.com/telegram.php?chatId=-712971518&message=' + encodeURIComponent(message);
  axios.get(url);
}

const gsmNotify = () => {
  if (isDebug) {
    return;
  }

  // const command = '/usr/bin/python3 /home/tekbreak/smarthome/gsm/dial_borja.py';
  // exec(command);
  log('GSM Notify');
  try {
    //const modem = new Modem();
    //modem.dial(610200425);
    const command = '/usr/bin/python3 /home/tekbreak/smarthome/gsm/dial_borja.py';
    exec(command);
  } catch (e) {
    log('Error:', e)
  }
}

const twilioNotify = () => {
  if (isDebug) {
    return;
  }

  const command = 'curl https://smarthome-4210.twil.io/call_borja';
    exec(command);
}

let openDoorMinutesCount = 0;
let openDoorInterval;
const openDoorTimerStart = () => {
  openDoorInterval = setInterval(() => {
    telegramNotify(`Puerda SALIDA abierta ${count + 1} minutos.`);
    openDoorMinutesCount++;

    if (openDoorMinutesCount === 3) {
      twilioNotify();
      clearInterval(openDoorInterval);
    }
  }, 60 * 1000)
}
const openDoorTimerStop = () => clearInterval(openDoorInterval);

let device;
try {
  // Connection to the Zigbee gateway
  device = new TuyAPI({
    id: 'bf0229b38c4da9e7b1tzdl',
    key: "<sp[_~n)caHg)2oi",
    version: '3.4',
    // issueRefreshOnConnect: false,
    // issueRefreshOnPing: false
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
  exit();
}
console.log('PASAS')

device.on('data', data => {
  if (![doors.main, doors.corridor].includes(data?.cid)) {
    return;
  }

  const hours = (new Date()).getHours();
  log('Hours', hours);
  const dayOfWeek = (new Date()).getDay();
  log('dayOfWeek', dayOfWeek);

  log('Data', data);

  const sensor = sensors[data.cid];
  const newState = data.dps?.['1'];
  log('NewState/Sensor', newState, sensor);

  const getMessage = () => {
    let stateMessage = 'desconocido';

    if (newState === true) {
      stateMessage = 'ABIERTA';
    }

    if (newState === false) {
      stateMessage = 'CERRADA';
    }

    return `Puerta ${sensors[data.cid].name} ${stateMessage}`;
  }

  const isCritical = () => {
    const start = sensor.schedule?.[dayOfWeek]?.start || sensor.schedule.default.start;
    const end =  sensor.schedule?.[dayOfWeek]?.end || sensor.schedule.default.end;
    return hours >= start || hours <= end;
  }

  const message = getMessage();

  const isDoorOpen = newState === true;

  switch (data.cid) {
    case doors.main: {

      if (isCritical()) {
        log('Critical', message)

        if (isDoorOpen) {
          twilioNotify();
          openDoorTimerStart();
        }else {
          openDoorTimerStop();
        }
      } else {
        log('Regular', message)
      }

      telegramNotify(message)

      break;
    }

    case doors.corridor: {
      if (isCritical()) {
        log('Critical', message)

        if (isDoorOpen) {
          telegramNotify(message)
        }
      } else {
        log('Regular', message)
      }
    
      break;
    }
  }
});


log('\n\nSmart-home armed (OK)\n\n');
log('Listening for data (debug mode):\n\n');
telegramNotify('Sistema de Puertas REACTIVADO');
