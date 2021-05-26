'use strict'

const { NOISE } = require('libp2p-noise')
const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const WebSockets = require('libp2p-websockets')
const WebRTCDirect = require('libp2p-webrtc-direct')
const MPLEX = require('libp2p-mplex')
const pipe = require('it-pipe')

const createNode = async (listeners) => {
  const node = await Libp2p.create({
        addresses: {
          listen: listeners
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

module.exports = { createNode };