var udp = require('dgram')

var client = udp.createSocket('udp4');

client.on('message', (msg, rinfo) => {
    console.log('Message:', msg.toString());
});

client.on('listening', () => {
    const address = client.address();
    console.log(`Client listening ${address.address}:${address.port}`);
});

client.bind(56830, '127.0.0.1');
