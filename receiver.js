'use strict'
const pipe = require('it-pipe')
const common = require('./common.js')

/*
 *   Calculate throughput
*/
function throughputCalc(time, bytes){
    return (bytes/1024/1024/1024*8)/(time/1000)
}

/*
*   Read Bytes from pipe and print the total received volume along with the
*   elapsed time (from packet 0 to the final received packet)
*/
function print ({ stream }) {        
  pipe(
    stream,
    async function (source) {
    var total=0
    var start=Date.now()
    console.log("\nStarted receiving message Bytes")
      for await (const msg of source) {
        total+=msg.toString().length
      }
      var end = Date.now()-start
      console.log("ts",Date.now(), "Message received:",total,"Bytes payload in total after",end,
                    "ms, throughput",throughputCalc(end, total),"Gbit/sec")
    }
  )
}

;(async () => {
    // create libp2p node with 3 different transports
    const receiver = await common.createNode(['/ip4/0.0.0.0/tcp/0', 
                                        '/ip4/127.0.0.1/tcp/10000/ws', 
                                        '/ip4/127.0.0.1/tcp/9090/http/p2p-webrtc-direct'])
    console.log('node has started (true/false):', receiver.isStarted())
    
    // event handler for the /print endpoint by calling the print function
    receiver.handle('/print', print)
    
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
    //catch sigint when Ctrl-C pressed
    process.on('SIGINT', stop)
})();