#### Instal
	`npm install`

#### Usage
In one window run: `node receiver.js` It will show you the available multiaddresses the newly created libp2p node listens to.

In another window run `node sender.js <multiaddr>` with <multiaddr> being one of the receiver's multiaddress sender will use to send bytes to.

