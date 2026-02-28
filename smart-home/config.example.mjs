// Copy to config.mjs and fill in your values.
// Prefer environment variables for secrets (see .env.example).

export const CONFIG = {
    debug: false,
    timerMaximumTries: 3,
    openDoorInterval: 1,
    wss: process.env.WSS_URL || 'wss://your-dashboard.example.com:8001',

    host: process.env.TUYA_HOST || 'https://openapi.tuyaeu.com',
    accessId: process.env.TUYA_ACCESS_ID || 'your-access-id',
    accessSecret: process.env.TUYA_ACCESS_SECRET || 'your-access-secret',
    testDevice: process.env.TUYA_TEST_DEVICE || '',
}
