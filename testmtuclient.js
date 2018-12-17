const dgram = require('dgram');
const clientSocket = dgram.createSocket('udp4');
const fs = require('fs');
const msg = fs.readFileSync('./msg.xml');
clientSocket.bind(() => {
    console.log('bind suceesed');
    clientSocket.send(msg, 1235, '192.168.1.160');
});

clientSocket.on('message', (msg, rinfo) => {
    console.log(JSON.stringify(rinfo));
    console.log(msg.toString());
});