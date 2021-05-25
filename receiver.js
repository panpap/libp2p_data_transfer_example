'use strict'

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const Node = require('./libp2p_bundle')
const pull = require('pull-stream')
const Pushable = require('pull-pushable')
const p = Pushable()

PeerId.createFromJSON(require('./ids/receiverID'), (err, peerId) => {
    if (err) { throw err }
    const peerInfo = new PeerInfo(peerId)
    peerInfo.multiaddrs.add('/ip4/127.0.0.1/tcp/10333')
    const nodeListener = new Node({ peerInfo })

    nodeListener.start((err) => {
        if (err) { throw err }
        nodeListener.on('peer:connect', (peerInfo) => {
            console.log('Receiver found Receiver  on: '+ peerInfo.id.toB58String());
            console.log('\n Receiver waiting for message from Receiver ')
        })

        nodeListener.handle('/chat/1.0.0', (protocol, conn) => {
            pull(p, conn)

            pull(
                conn,
                pull.map((data) => {
                    return data.toString('utf8').replace('\n', '')
                }),
                pull.drain(console.log)
            )
        })

        console.log('Receiver ready Listening on: ');
        peerInfo.multiaddrs.forEach((ma) => {
            console.log(ma.toString() + '/p2p/' + peerId.toB58String())
        })

        console.log('\n Receiver trying to connect with Sender');
    })
})