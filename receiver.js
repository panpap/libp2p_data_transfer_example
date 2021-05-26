'use strict'

const { NOISE } = require('libp2p-noise')
const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const WebSockets = require('libp2p-websockets')
const WebRTCDirect = require('libp2p-webrtc-direct')
const MPLEX = require('libp2p-mplex')
const pipe = require('it-pipe')

const createNode = async () => {
  const node = await Libp2p.create({
        addresses: {
          // To signal the addresses we want to be available, we use
          // the multiaddr format, a self describable address
          listen: ['/ip4/0.0.0.0/tcp/0', '/ip4/127.0.0.1/tcp/10000/ws', '/ip4/127.0.0.1/tcp/9090/http/p2p-webrtc-direct']
        },
        modules: {
          transport: [TCP, WebSockets, WebRTCDirect],
          connEncryption: [NOISE],
          streamMuxer: [MPLEX]
        }
    })

    await node.start()
    return node
}

function print ({ stream }) {
  pipe(
    stream,
    async function (source) {
      for await (const msg of source) {
        console.log(msg.toString())
      }
    }
  )
}


;(async () => {
    const receiver = await createNode()
    console.log('node has started (true/false):', receiver.isStarted())
    
    receiver.on('peer:connect', (peerInfo) => {
        console.log('Receiver found Server  on: '+ receiver.peerId.toB58String());
        console.log('\n Receiver waiting for message from Server ')
    })

    receiver.handle('/print', print)
    
    console.log('Receiver ready Listening on: ');
    receiver.multiaddrs.forEach((ma) => {
        console.log(ma.toString() + '/p2p/' + receiver.peerId.toB58String())
    })

    console.log('\n Receiver trying to connect with ldsls');
})();