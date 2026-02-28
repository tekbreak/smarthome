import {sendAlertToHomeDashboard, sendToHomeDashboard} from "../utils.mjs";
import { emitKeypressEvents } from 'readline';

emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on("keypress", (char, evt) => {
    console.log("=====Key pressed=====");
    console.log('Sending');
    sendAlertToHomeDashboard('Hola', 'medium')

    // Dim
    // sendToHomeDashboard('dim', '0.5');
    // sendToHomeDashboard('dim', 0.5);


    if (char === "q") process.exit();
});
