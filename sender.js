'use strict'

const { NOISE } = require('libp2p-noise')
const Libp2p = require('libp2p')
const { multiaddr } = require('multiaddr')
//const peerId = require('peer-id')
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
          listen: ['/ip4/0.0.0.0/tcp/0']
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


(async () => {
    const sender = await createNode();
    console.log('node has started (true/false):', sender.isStarted())
    //let receiverpeerId = peerId.createFromB58String("QmQHLaRPzt52AAcFXQ7XxqCxipZxsxn8thDgvsNiUWgpnJ")
    //sender.peerStore.addressBook.set(receiverpeerId, addr)
    console.log('Sender ready, listening on: ');
    sender.multiaddrs.forEach((ma) => {
        console.log(ma.toString() + '/p2p/' + sender.peerId.toB58String())
    })

    try{ 
        const { stream: stream2 } = await sender.dialProtocol(multiaddr("/ip4/127.0.0.1/tcp/9090/http/p2p-webrtc-direct/p2p/QmQt4wBm1L2XEFeqp2885NEvqsAjAvKmGNgpkhQBhLB5so"), '/print')
          await pipe(
            ['EPITELOUs'],
            stream2
        )
    } catch (err) {
        console.log('node 3 failed to dial to node 1 with:', err.message)
    }
})();