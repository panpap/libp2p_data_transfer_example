const TCP = require('libp2p-tcp')
const WebRTCDirect = require('libp2p-webrtc-direct')
const {Multiaddr} = require('multiaddr')
const pipe = require('it-pipe')
const { collect } = require('streaming-iterables')
var crypto = require("crypto")
const WebSockets = require('libp2p-websockets')

const BYTESVOL = 26214400 //set 256MB as the size for the random data

/*
 *   Method to calculate and return throughput
*/
function throughputCalc(time, bytes){
    return 2*(bytes/1024/1024*8)/(time/1000)
}


// A simple upgrader that just returns the MultiaddrConnection
const upgrader = {
  upgradeInbound: maConn => maConn,
  upgradeOutbound: maConn => maConn
};


(async () => {
	var addr
	const type = new TCP({ upgrader });  addr = '/ip4/127.0.0.1/tcp/9092'

	// create random hex string from bytes to stream
	var mystr = await crypto.randomBytes(BYTESVOL).toString('hex');
	const listener = type.createListener((socket) => {
	  console.log('new connection opened')
	  pipe(
	    [mystr],
	    socket
	  )
	})

	const ma = new Multiaddr(addr)
	await listener.listen(ma)
	console.log('listening')

	// close listener and exit smoothly when Ctrl-C is given
	const stop = async () => {
	    // stop sender gently and close connection
	    await listener.stop()
	    console.log('\n> Node stopped')
	    process.exit(0)
	}
	// catch sigint signal when Ctrl-C pressed
	process.on('SIGINT', stop)
})();