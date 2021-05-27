const TCP = require('libp2p-tcp')
const WebRTCDirect = require('libp2p-webrtc-direct')
const {Multiaddr} = require('multiaddr')
const pipe = require('it-pipe')
const { collect } = require('streaming-iterables')
var crypto = require("crypto")
const WebSockets = require('libp2p-websockets')


function throughputCalc(time, bytes){
    return (bytes/1024/1024/1024*8)/(time/1000)
}

// A simple upgrader that just returns the MultiaddrConnection
const upgrader = {
  upgradeInbound: maConn => maConn,
  upgradeOutbound: maConn => maConn
}


;(async () => {
var addr
const type = new TCP({ upgrader });  addr = '/ip4/127.0.0.1/tcp/9092'
//const type = new WebRTCDirect({ upgrader }); addr = '/ip4/127.0.0.1/tcp/9092/http/p2p-webrtc-direct/'
//const type = new WebSockets({ upgrader });  addr = '/ip4/127.0.0.1/tcp/10000/ws'
const ma = new Multiaddr(addr)

const socket = await type.dial(ma)

var total=0
    var start=Date.now()
const values = await pipe(
  socket,
  collect
)
total = values.toString().length
var end = Date.now()-start
console.log("ts",Date.now(), "Message received:",total,"chars payload in total after",end,
                    "ms, throughput",throughputCalc(end, total),"Gbit/sec")
// Close connection after reading
})();