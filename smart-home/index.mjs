// https://github.com/codetheweb/tuyapi

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
import TuyAPI from 'tuyapi';
import _ from 'lodash'
import {log, getMessage, isCriticalTime, telegramNotify, skipEvent, sendToHomeDashboard} from "./utils.mjs";
import {DEVICES} from "./sensors.mjs";
import {CONFIG} from "./config.mjs";

if (CONFIG.debug) {
    log(`
============================
======== DEBUG MODE ========
============================
`);
}

let dataForCommands = {
    timer: {},
    message: ''
}

for (let i = 0; i < DEVICES.length; i++) {
    const device = DEVICES[i];

    let connectedDevice;
    log(`${device.name} :: Connecting device...`);
    try {
        connectedDevice = new TuyAPI(device.config);

        await connectedDevice.find();
        await connectedDevice.connect();
    } catch (e) {
        log('ERROR: ', e);
        process.exit();
    }

    log(`${device.name} :: Connection successful`);
    log(`${device.name} :: Sensors: ${device.sensors.map(sensor => sensor.name).join(', ')}`);
    // Initial data for commands

    try {

        connectedDevice.on('data', (data) => {
            if (skipEvent()) {
                log('Skipping event')
                return;
            }

            if (device.sensors) {
                const sensor = device.sensors.find(sensor => {
                    return sensor.id === data.cid
                });

                if (!sensor) {
                    return;
                }

                const newState = data.dps?.['1'];
                dataForCommands.message = getMessage(sensor.name, newState);
                const isDoorOpen = newState === true;

                if (sensor.deviceId) {
                    sendToHomeDashboard('device:status', {
                        id: sensor.deviceId,
                        status: [{ code: 'doorcontact_state', value: newState }]
                    });
                }
                const action = isDoorOpen ? 'onOpen' : 'onClose';
                const mode = isCriticalTime(sensor) ? 'critical' : 'default';

                const commandsToRun = [
                    ...sensor?.[action].common,
                    ...sensor?.[action]?.[mode],
                ];
                // Run common commands

                // Run all commands in this mode
                for (let c = 0; c < commandsToRun.length; c++) {
                    const command = commandsToRun[c];

                    const result = command(dataForCommands);

                    if (result) {
                        dataForCommands = _.merge(dataForCommands, result);
                    }
                }
            }
        });

    } catch (error) {
        console.error(error);
        telegramNotify(`Error in smart-home service ${new Date()}`);
    }

    log('\n! All systems up and running.');
    //telegramNotify('Sistema de Puertas REACTIVADO', CONFIG.debug);

    log('\nListening for data >>\n\n');
}
