const dgram = require('dgram');
let selfAdddress = null;
class DiscoveryServer {
    constructor(config) {
        this.config = config;
    }
    start() {
        const discoverySocket = dgram.createSocket('udp4');
        discoverySocket.on('error', (err) => {
            console.log(err);
            throw err;
        });

        discoverySocket.on('listening', () => {
            selfAdddress = discoverySocket.address();
            console.log(`listening ${selfAdddress.address}:${selfAdddress.port}`);
        });

        discoverySocket.on('message', (msg, rinfo) => {
            console.log(`got a msg from :${JSON.stringify(rinfo)}`);
            const reply = msg.toString();
            console.log(reply);
            const response = new Buffer(`ip:${selfAdddress.address},response:${reply}`);
            discoverySocket.send(response, rinfo.port, rinfo.address, (err, num) => {
                if (err) {
                    console.error(err);
                    throw err;
                }
                console.log('send response');
            });
        });
        discoverySocket.bind({
            port: 1234,
            address:'0.0.0.0',
        }, () => {
            discoverySocket.addMembership('239.255.255.250');
        });
    }
};


const server = new DiscoveryServer('111');
server.start();