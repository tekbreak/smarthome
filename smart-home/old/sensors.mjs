import {
    openDoorTimerStart,
    openDoorTimerStop,
    sendAlertToHomeDashboard,
    telegramNotify,
    twilioNotify
} from "./utils.mjs";

export const SENSORS = {
    main: "a4c1384d5863dc36",
    corridor: "a4c1387d30bb67b9"
}

export const SENSORS_CONFIGURATION = {
    [SENSORS.corridor]: {
        name: 'Pasillo',
        schedule: {
            default: {
                start: 21,
                end: 8
            },
            6: { // Saturday
                end: 11 // ends on saturday at 11am instead of 8am as default
            },
            0: { // Monday
                end: 11
            },
        },
        onOpen: {
            default: [
                (data) => telegramNotify(data.message, data.debug),
                (data) => sendAlertToHomeDashboard(data.message, 'medium', data.debug)
            ],
        },
        onClose: {
            default: [
                (data) => telegramNotify(data.message, data.debug),
            ],
        }
    },
    [SENSORS.main]: {
        name: 'Salida',
        schedule: {
            default: {
                start: 23,
                end: 9
            },
            6: { // Saturday
                end: 11
            },
            0: { // Monday
                end: 11
            }
        },
        onOpen: {
            default: [
                (data) => telegramNotify(data.message, data.debug),
                () => openDoorTimerStart(SENSORS.main),
                (data) => sendAlertToHomeDashboard(data.message, 'medium', data.debug)
            ],
            critical: [
                (data) => telegramNotify(data.message, data.debug),
                (data) => twilioNotify(data.debug),
                (data) => sendAlertToHomeDashboard(data.message, 'high', data.debug)
            ]
        },
        onClose: {
            default: [
                (data) => telegramNotify(data.message, data.debug),
                (data) => openDoorTimerStop(data[SENSORS.main].timerId)
            ]
        }
    },
}