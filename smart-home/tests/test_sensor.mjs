
import TuyAPI from 'tuyapi';

const device = {
    name: 'Contact Sensor',
    config: {
        id: 'bff051a1d6634bf078eklg',
        key: "1'(`Q+ay1o}8J>U!",
        // version: '3.3',
        issueRefreshOnConnect: false,
        issueRefreshOnPing: false,
        issueGetOnConnect: false
    }
}

const connectedDevice = new TuyAPI({
    issueRefreshOnPing: true,
    issueGetOnConnect: false,
    ...device.config
});

await connectedDevice.find();
await connectedDevice.connect();

console.log('connected', connectedDevice);

connectedDevice.on('data', (d) => {
    console.log('Data: ', d);
})