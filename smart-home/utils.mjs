import axios from "axios";
import { createRequire } from "module";
import {CONFIG} from "./config.mjs";
import WebSocket from 'ws';
import fs from 'fs';
import { exec } from 'child_process';

const require = createRequire(import.meta.url);
const { TuyaContext } = require("@tuya/tuya-connector-nodejs");


export const log = (...text) => {
    if (CONFIG.debug) {
        console.log(...text);
    }
}

export const telegramNotify = (message) => {
    log('Telegram Notify: ', message);

    if (CONFIG.debug) {
        return;
    }

    const url = 'https://smarthome.tekbreak.com/telegram.php?chatId=-712971518&message=' + encodeURIComponent(message);
    void axios.get(url);
}

export const gsmNotify = () => {
    log('GSM Notify');

    if (CONFIG.debug) {
        return;
    }

    // const command = '/usr/bin/python3 /home/tekbreak/smarthome/gsm/dial_borja.py';
    // exec(command);
    const command = '/usr/bin/python3 /home/tekbreak/smarthome/gsm/dial_borja.py';
    exec(command, (err) => {
        if (err) log('GSM exec error:', err);
    });
}

export const twilioNotify = () => {
    log('Twilio Notify');

    if (CONFIG.debug) {
        return;
    }

    const command = 'curl https://smarthome-4210.twil.io/call_borja';
    exec(command, (err) => {
        if (err) log('Twilio exec error:', err);
    });
}

export const openDoorTimerStart = (sensorName, sensorId, data) => {
    log('Initiated Time Control on ', sensorName, sensorId)

    let tries = 0;

    const check = () => {
        tries++;

        if (tries === CONFIG.timerMaximumTries) {
            telegramNotify('Maximum tries reached. Calling you')
            twilioNotify();
            return;
        }

        setTimeout(async () => {
            const status = await getDeviceInfo(sensorId);
            const state = (status.find(st => st.code === 'doorcontact_state'))?.value

            if (state !== undefined) {
                if (state === false && tries > 1) { // Ignore if the door is closed in less than a minute
                    // is closed
                    telegramNotify(`Puerta ${sensorName} CERRADA`)
                }
                if (state === true) {
                    telegramNotify(`Puerta ${sensorName} ABIERTA ${tries * CONFIG.openDoorInterval} min.`);
                    // keeps opened
                    check();
                }
            }
        }, CONFIG.openDoorInterval * (60 * 1000))
    }

    check();
}

// export const openDoorTimerStop = (intervalId) => intervalId && clearInterval(intervalId);

export const isCriticalTime = (sensor) => {
    const hours = (new Date()).getHours();
    const dayOfWeek = (new Date()).getDay();
    const defaultSchedule = sensor.schedule?.default;
    if (!defaultSchedule) return false;

    const start = sensor.schedule?.[dayOfWeek]?.start ?? defaultSchedule.start;
    const end = sensor.schedule?.[dayOfWeek]?.end ?? defaultSchedule.end;
    return hours >= start || hours <= end;
}

export const getMessage = (doorName, state) => {
    let stateMessage = 'desconocido';

    if (state === true) {
        stateMessage = 'ABIERTA';
    }

    if (state === false) {
        stateMessage = 'CERRADA';
    }

    return `Puerta ${doorName} ${stateMessage}`;
}

export const sendAlertToHomeDashboard = (message, level = 'high', duration) => {
    sendToHomeDashboard('alert', {
        title: 'Atención!!',
        message: message,
        level,
        duration
    });
}

export const sendToHomeDashboard = (type, payload) => {
    try {
        const ws = new WebSocket(CONFIG.wss);
        const wsMessage = { type, payload };

        if (CONFIG.debug) {
            console.log('WS_MESSAGE', wsMessage);
        }

        ws.on('open', function open() {
            ws.send(JSON.stringify(wsMessage));
            ws.close();
        });
        ws.on('error', (err) => console.error('WebSocket error:', err));
    } catch (error) {
        console.error('WebSocket connection error:', error);
    }
}

export const getDeviceInfo = async (deviceId) => {
    try {
        const baseUrl = CONFIG.host?.replace(/\/$/, "") || "https://openapi.tuyaeu.com";
        const api = new TuyaContext({
            baseUrl,
            accessKey: CONFIG.accessId,
            secretKey: CONFIG.accessSecret,
        });
        const res = await api.request({
            method: "GET",
            path: `/v1.0/devices/${deviceId}`,
        });
        return res?.result?.status ?? [];
    } catch (err) {
        log('getDeviceInfo error:', err);
        return [];
    }
}

export const skipEvent = () => {
    const skipFile = '/var/www/html/smart-home-skip/skip';

    if (fs.existsSync(skipFile)) {
        const data = fs.readFileSync(skipFile, { encoding: 'utf-8'})?.trim();

        log('skip value:', data, typeof data);

        return data === '1';
    } else {
        log('skip file not found')
    }

    return false;
}
