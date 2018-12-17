const dgram = require('dgram');
const serverSocket = dgram.createSocket('udp4');
const fs = require('fs');
const msg = fs.readFileSync('./msg.xml');
serverSocket.bind(1235, () => {
    console.log('bind suceesed');
    serverSocket.send(msg, 1235, '192.168.1.160');
});

serverSocket.on('message', (msg, rinfo) => {
    console.log(JSON.stringify(rinfo));
    console.log(msg);
    serverSocket.send('receive done', rinfo.port, rinfo.address);
});