const dgram = require('dgram');
const fs = require('fs');
const content = fs.readFileSync('./probe.xml');
const clientSocket = dgram.createSocket('udp4');
const addrReg = /.*?XAddrs\>(.*?)\</i;
const typeReg = /.*?Types\>(.*?)\</i;

clientSocket.on('message', (msg, rinfo) => {
    msg = msg.toString();
    console.log(
        'ip:', rinfo.address, 
        'addrees:', addrReg.exec(msg)[1],
        'type:', typeReg.exec(msg)[1]);
});

clientSocket.on('error', (err) => {
    console.error(err);
    throw err;
});

clientSocket.bind(() => {
    const { address, port } = clientSocket.address();
    console.log(`address:${address},port:${port}`);
    clientSocket.setMulticastInterface('0.0.0.0');
    //https://nodejs.org/dist/latest-v10.x/docs/api/dgram.html#dgram_call_results
    clientSocket.send(content, 3702, '239.255.255.250', (err, num) => {
        if (err) {
            console.log(err);
            throw err;
        }
    });
});