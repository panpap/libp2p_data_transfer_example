'use strict'

const { NOISE } = require('libp2p-noise')
const Libp2p = require('libp2p')
const { multiaddr } = require('multiaddr')
const TCP = require('libp2p-tcp')
const WebSockets = require('libp2p-websockets')
const WebRTCDirect = require('libp2p-webrtc-direct')
const MPLEX = require('libp2p-mplex')
const pipe = require('it-pipe')
const fs = require('fs')

const createNode = async () => {
  const node = await Libp2p.create({
        addresses: {
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
    if (process.argv.length < 3)
        throw new Error("Receiver's multiaddress argument not given")
    const addr = process.argv.slice(2)[0];

    const sender = await createNode();
    console.log('node has started (true/false):', sender.isStarted())

    console.log('Looking to connect with:', addr)
    var myFile = fs.readFileSync("message.txt", 'utf8');

    console.log('Sender ready, listening on: ');
    sender.multiaddrs.forEach((ma) => {
        console.log(ma.toString() + '/p2p/' + sender.peerId.toB58String())
    })

    try{ 
        const { stream: outstream } = await sender.dialProtocol(multiaddr(addr), '/print')
        await pipe([myFile], outstream)
        console.log("\nMessage sent!")
    } catch (err) {
        console.log('node 3 failed to dial to node 1 with:', err.message)
    }
    //await sender.stop()
    //process.exit(0)
})();