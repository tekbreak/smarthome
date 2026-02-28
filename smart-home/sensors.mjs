import {
    openDoorTimerStart,
    sendAlertToHomeDashboard,
    telegramNotify,
    twilioNotify
} from "./utils.mjs";

export const SENSORS = {
    salida: {
        cid: "a4c1384d5863dc36",
        id: "bfaea888e03b775351rwqm"
    },
    pasillo: {
        cid: "a4c1387d30bb67b9",
        id: "bf807d66c695d6109fh7hg"
    }
}

export const DEVICES = [
    {
        name: "Zigbee",
        config: {
            id: 'bf0229b38c4da9e7b1tzdl',
            key: "<sp[_~n)caHg)2oi",
            issueRefreshOnConnect: true,
            issueRefreshOnPing: true,
            issueGetOnConnect: false
        },
        sensors: [
            {
                id: SENSORS.pasillo.cid,
                deviceId: SENSORS.pasillo.id,
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
                    common: [
                        // (data) => sendAlertToHomeDashboard(data.message, 'medium')
                    ],
                    default: [],
                    critical: [
                        // (data) => telegramNotify(data.message),
                        () => twilioNotify(),
                        (data) => sendAlertToHomeDashboard(data.message, 'medium')
                    ]
                },
                onClose: {
                    common: [

                    ],
                    default: [],
                    critical: [
                        //(data) => sendAlertToHomeDashboard(data.message, 'medium')
                    ]

                }
            },
            {
                id: SENSORS.salida.cid,
                deviceId: SENSORS.salida.id,
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
                    common: [
                        (data) => telegramNotify(data.message),
                        (data) => openDoorTimerStart("Salida", SENSORS.salida.id, data),
                    ],
                    default: [
                        (data) => sendAlertToHomeDashboard(data.message, 'medium'),
                    ],
                    critical: [
                        () => twilioNotify(),
                        (data) => sendAlertToHomeDashboard(data.message, 'high'),
                    ]
                },
                onClose: {
                    common: [
                        (data) => telegramNotify(data.message),
                    ],
                    default: [
                    ],
                    critical: [
                    ]
                }
            }
        ]
    }
]
