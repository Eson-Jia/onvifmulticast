const dgram = require('dgram');
const uuid = require('uuid');
const clientSocket = dgram.createSocket('udp4');

clientSocket.on('message', (msg, rinfo) => {
    console.log('msg:', msg.toString());
});

clientSocket.on('error', (err) => {
    console.error(err);
    throw err;
});

clientSocket.bind(() => {
    const { address, port } = clientSocket.address();
    console.log(`address:${address},port:${port}`);
    setInterval(() => {
        clientSocket.send(uuid.v1(), 1234, '239.255.255.250', (err, num) => {
            if (err) {
                console.log(err);
                throw err;
            }
        });
    }, 5 * 1000);
});