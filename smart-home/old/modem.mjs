import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline';
import {execSync} from 'child_process';
import { Blob, Buffer } from 'node:buffer';


export class Modem {
    stream = null;
    port = null;

    constructor() {
        this.port = new SerialPort({
            path: '/dev/ttyAMA0',
            baudRate: 9600
        })
        this.stream = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    }

    get stream () {
        return this.stream;
    }

    async test() {
        await this.write('AT');
    }

    async sms(to, message) {
        await this.write('ATZ');
        await this.write('AT+CMGF=1');
        await this.write(`AT+CMGS="+34${this.encode(to)}"`);
        await this.write(this.encode(message));
        //await this.write((26).toString(16));
        //await this.write(new Buffer([26]));
    }

    async dial(number) {
        await this.write(`ATDT+34${this.encode(number)};`)
    }


    async getCarrier() {
        await this.write('AT+COPS?');

        return this;
    }


    async write(data) {
        await this.port.write(`${data}\r`);
    }

    encode(string) {
        return Buffer.from(string + '', 'utf-8').toString();
    }

    sleep(time = 1) {
        execSync(`sleep ${time}`);
    }

}