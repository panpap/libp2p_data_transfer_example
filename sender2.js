const TCP = require('libp2p-tcp')
const WebRTCDirect = require('libp2p-webrtc-direct')
const {Multiaddr} = require('multiaddr')
const pipe = require('it-pipe')
const { collect } = require('streaming-iterables')
var crypto = require("crypto")
const WebSockets = require('libp2p-websockets')

const BYTESVOL = 26176

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
const type = new TCP({ upgrader });  addr = '/ip4/192.168.1.100/tcp/9092'
//const type = new WebRTCDirect({ upgrader }); addr = '/ip4/192.168.1.100/tcp/9092/http/p2p-webrtc-direct/'
//const type = new WebSockets({ upgrader });  addr = '/ip4/127.0.0.1/tcp/10000/ws'


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
})();