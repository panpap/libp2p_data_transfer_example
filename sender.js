'use strict'

const pipe = require('it-pipe')
const fs = require('fs')
const common = require('./common.js');
const { multiaddr } = require('multiaddr')

function getReceiver(){
    if (process.argv.length < 3)
        throw new Error("Receiver's multiaddress argument not given")
    return process.argv.slice(2)[0];
}


(async () => {

    const addr = getReceiver() 
    const sender = await common.createNode(['/ip4/0.0.0.0/tcp/0']);
    console.log('> Sender has started (true/false):', sender.isStarted())

    console.log('> Looking to connect with:', addr)
    var myFile = fs.readFileSync("message.txt", 'utf8');

    const latency = await sender.ping(addr)
    console.log("Receiver pinged in", latency,'ms')
    try{

        const { stream: outstream } = await sender.dialProtocol(multiaddr(addr), '/print')
        await pipe([myFile], outstream)
        console.log("\n> Message sent!")
    } catch (err) {
        console.log('Error: Sender failed to dial to Receiver with:', err.message)
    }
    const stop = async () => {
        // stop sender gently and close connection
        await sender.stop()
        console.log('\n> Node stopped')
        process.exit(0)
    }
    process.on('SIGINT', stop)
})();