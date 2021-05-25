const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const WebSockets = require('libp2p-websockets')
const WebRTCDirect = require('libp2p-webrtc-direct')
const MPLEX = require('libp2p-mplex')
const Multiplex = require('libp2p-mplex') 
const defaultsDeep = require('@nodeutils/defaults-deep')
const SECIO = require('libp2p-secio')

const DEFAULT_OPTS = {
  modules: {
    transport: [
      WebRTCDirect
    ],
    connEncryption: [
      SECIO
    ],
    streamMuxer: [
      Multiplex
    ]
  }
}

class P2PNode extends Libp2p {
  constructor (opts) {
    super(defaultsDeep(opts, DEFAULT_OPTS))
  }
}
module.exports = P2PNode
