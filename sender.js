'use strict'

const pipe = require('it-pipe')
const fs = require('fs')
const common = require('./common.js')
const { multiaddr } = require('multiaddr')
var crypto = require("crypto")

const BYTESVOL = 265794176

/**
*   Read command line args and return multiaddress of receiver 
*   or error if no input given
**/
function getReceiver(){
    if (process.argv.length < 3)
        throw new Error("Receiver's multiaddress argument not given")
    return process.argv.slice(2)[0];
}


(async () => {

    // get receivers multiaddr from input
    const addr = getReceiver() 
    console.log('> Looking to connect with:', addr)

    // create libp2p node
    const sender = await common.createNode([]);
    console.log('> Sender has started (true/false):', sender.isStarted())

    // create random hex string from bytes to stream
    var mystr = await crypto.randomBytes(BYTESVOL).toString('hex');

    // dial receiver in the protocol /print and stream the random text through the pipe
    var i=0
    while (i<10) {
        try{
            const { stream: outstream } = await sender.dialProtocol(multiaddr(addr), '/print')
            console.log("\n> Started sending message at timestamp:",Date.now())
            await pipe([mystr], outstream)
            console.log("> Message sent!")
        } catch (err) {
            console.log('Error: Sender failed to dial to Receiver with:', err.message)
        }
        i++
    }
    // close libp2p node and exit smoothly when Ctrl-C is given
    const stop = async () => {
        // stop sender gently and close connection
        await sender.stop()
        console.log('\n> Node stopped')
        process.exit(0)
    }
    //catch sigint when Ctrl-C pressed
    process.on('SIGINT', stop)
})();