'use strict'
const pipe = require('it-pipe')
const common = require('./common.js')

/*
*   Read Bytes from pipe and echo them back 
*/
function echoBack ({ stream }) {        
  pipe(
    stream.source, 
    stream.sink
  )
}

(async () => {
    // create libp2p node with 3 different transports
    const receiver = await common.createNode(['/ip4/0.0.0.0/tcp/0', 
                                        '/ip4/127.0.0.1/tcp/10000/ws', 
                                        '/ip4/127.0.0.1/tcp/9090/http/p2p-webrtc-direct'])
    console.log('node has started (true/false):', receiver.isStarted())
    

    // Log a message when we receive a connection
    receiver.connectionManager.on('peer:connect', (connection) => {
        console.log('Received dial to me from:', connection.remotePeer.toB58String())
    })

    // event handler for the /echo endpoint by calling the print function
    receiver.handle('/echo', echoBack)
    
    // print the available multiaddresses receiver is listening on
    console.log('Receiver ready Listening on: ');
    receiver.multiaddrs.forEach((ma) => {
        console.log(ma.toString() + '/p2p/' + receiver.peerId.toB58String())
    })

    console.log('\nReceiver waiting to connect with sender');

    // close libp2p node and exit smoothly when Ctrl-C is given
    const stop = async () => {
        // stop sender gently and close connection
        await receiver.stop()
        console.log('\n> Node stopped')
        process.exit(0)
    }
    // catch sigint signal when Ctrl-C pressed
    process.on('SIGINT', stop)
})();