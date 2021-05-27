'use strict'

const pipe = require('it-pipe')
const fs = require('fs')
const common = require('./common.js')
const { multiaddr } = require('multiaddr')
var crypto = require("crypto")

const BYTESVOL = 26214400
const RUNS = 10

/**
*   Method to read command line args and return multiaddress of receiver 
*   or error if no input given
**/
function getReceiver(){
    if (process.argv.length < 3)
        throw new Error("Receiver's multiaddress argument not given")
    return process.argv.slice(2)[0];
}

/*
 *   Method to calculate and return throughput
*/
function throughputCalc(time, bytes){
    return 2*(bytes/1024/1024*8)/(time/1000)
}

/*
 *  Async function to send random message, listen for the echo and 
 *  print throughtput
*/
async function sendAndGetEcho(stream, mystr){
    await pipe(
        [mystr], 
        stream,
        async function (source) {
            // For each chunk of data
            var total=0
            for await (const data of source) {
                // Measure the total received bytes
                total+=data.toString().length
            } 
            var end = Date.now()-start
            console.log("Echo received:",total,"Bytes payload in total after",end,
                    "ms, throughput",throughputCalc(end, total),"Mbit/sec")
        }   
    )
}

var start
(async () => {
    // get receivers multiaddr from input
    const addr = getReceiver() 
    console.log('> Looking to connect with:', addr)

    // create libp2p node
    const sender = await common.createNode([]);
    console.log('> Sender has started (true/false):', sender.isStarted())

    // create random hex string from bytes to stream
    var mystr = await crypto.randomBytes(BYTESVOL).toString('hex');

    // Run multiple times to get the average numbers
    var i=0
    while (i < RUNS) {
        try{
            start=Date.now()
            // dial receiver in the protocol /print and stream the random text through the pipe
            const { stream: stream } = await sender.dialProtocol(multiaddr(addr), '/echo')
            await sendAndGetEcho(stream, mystr)
        } catch (err) {
            console.log('Error: Sender failed to dial to Receiver with:', err.message)
        }
        i++
    }
    // stop libp2p node
    await sender.stop()
})();