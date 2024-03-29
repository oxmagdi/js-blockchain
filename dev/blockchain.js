const sha256 = require('sha256');
const uuid = require('uuid/v1');

const currentNodeUrl = process.argv[3];

function Blockchain () {
	this.chain = [];
	this.pendingTransactions = [];

    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes = [];

    // create genesis block

    this.createNewBlock(100, '0', '0');
};

Blockchain.prototype.createNewBlock = function (nonce, previousBlockHash, hash) {
    const newBlock = {
        index: this.chain.length +1,
        timestamp: Date.now(),
        transactions: this.pendingTransactions,
        nonce: nonce,
        hash: hash,
        previousBlockHash: previousBlockHash
    };

    this.pendingTransactions = [];
    this.chain.push(newBlock);

    return newBlock;
};


Blockchain.prototype.getLastBlock = function () {
	return this.chain[this.chain.length -1];
};

Blockchain.prototype.createNewTransaction = function (amount, sender, recipient) {
    const newTransaction = {
         transactionId: uuid().split('-').join(''),
         amount: amount,
         sender: sender,
         recipient: recipient,
    };
   
    return newTransaction;
};

Blockchain.prototype.addTransactionToPendingTransactions = function (newTransaction) {
    this.pendingTransactions.push(newTransaction);

    return this.getLastBlock()['index'] +1;
};

Blockchain.prototype.hashBlock = function (previousBlockHash, currentBlockData, nonce) {
       const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
       const hash = sha256(dataAsString);
       return hash;
};

Blockchain.prototype.proofOfWork = function (previousBlockHash, currentBlockData) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

    while(hash.substring(0, 4) !== '0000'){
       nonce++;
       hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
       // console.log(hash);
    }

    return nonce;
};

Blockchain.prototype.chainIsValid = function(blockchain){
    let validChain = true;

    for(var i = 1; i < blockchain.length ; i++){
        const currentBlock = blockchain[i];
        const prevBlock = blockchain[i -1];
        const blockHash = this.hashBlock(prevBlock['hash'], {index: currentBlock['index'], transactions: currentBlock['transactions']}, currentBlock['nonce']);
        
        if(blockHash.substring(0, 4) !== '0000') validChain = false;
        if(currentBlock['previousBlockHash'] !== prevBlock['hash']) validChain = false;
    }

    const genesisBlock = blockchain[0];
    const correctNonce = genesisBlock['nonce'] === 100;
    const correctpreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
    const correctHash = genesisBlock['hash'] === '0';
    const correctTransactions = genesisBlock['transactions'].length === 0;

    if(
        !correctNonce ||
        !correctpreviousBlockHash ||
        !correctHash ||
        !correctTransactions
    ) validChain = false;

    return validChain;
};

module.exports = Blockchain;