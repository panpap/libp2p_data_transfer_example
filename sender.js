'use strict'

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const Node = require('./libp2p_bundle')
const pull = require('pull-stream')
const Pushable = require('pull-pushable')
const p = Pushable();
const async = require('async');

async.parallel([
    (callback) => {
        PeerId.createFromJSON(require('./ids/senderID'), (err, senderPeerId) => {
            if (err) {
                throw err
            }
            callback(null, senderPeerId)
        })
    },
    (callback) => {
        PeerId.createFromJSON(require('./ids/receiverID'), (err, receiverPeerId) => {
            if (err) {
                throw err
            }
            callback(null, receiverPeerId)
        })
    }
], (err, ids) => {
    if (err) throw err
    const senderPeerId=ids[0]
    const senderPeerInfo = new PeerInfo(senderPeerId)
    senderPeerInfo.multiaddrs.add('/ip4/127.0.0.1/tcp/0')
    const nodeDialer = new Node({ peerInfo: senderPeerInfo })

    const receiverPeerId = ids[1]
    const receiverPeerInfo = new PeerInfo(receiverPeerId)
    receiverPeerInfo.multiaddrs.add('/ip4/127.0.0.1/tcp/10333')
    nodeDialer.start((err) => {
        if (err) { throw err }
        console.log('Sender ready, listening on: ');

        senderPeerInfo.multiaddrs.forEach((ma) => {
            console.log(ma.toString() + '/p2p/' + senderPeerId.toB58String())
        })

        nodeDialer.dialProtocol(receiverPeerInfo, '/chat/1.0.0', (err, conn) => {
            if (err) { throw err }
            console.log('\n Sender dialed to Receiver on protocol: /chat/1.0.0 Type a message')
            // Write operation. Data sent as a buffer
            pull(p, conn)
            // Sink, data converted from buffer to utf8 string
            pull(
                conn,
                pull.map((data) => {
                    return data.toString('utf8').replace('\n', '')
                }),
                pull.drain(console.log)
            )

            process.stdin.setEncoding('utf8')
            process.openStdin().on('data', (chunk) => {
                p.push(chunk.toString())                
            })
        })
    })
})