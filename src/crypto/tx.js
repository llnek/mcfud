// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Copyright © 2013-2022, Kenneth Leung. All rights reserved.

;(function(gscope,UNDEF){

  "use strict";

  /**Create the module.
  */
  function _module(Core){

    if(!Core)
      Core=gscope["io/czlab/mcfud/core"]();

    /**
     * @module mcfud/blockchain
     */

    /**
     * @typedef {object} FSMStateTransition
     * @property {string} target  switching to this target state
     * @property {function} action() run this code upon the transition
     */

    /**
     * @typedef {object} FSMStateTransitionList
     * @property {FSMStateTransition} transition-1 user defined transition
     * @property {FSMStateTransition} ...          more
     * @property {FSMStateTransition} transition-n  user defined transition
     */

    /**
     * @typedef {object} FSMState
     * @property {function} enter() run this code when the FSM switches to this state
     * @property {function} exit()  run this code when the FSM switches away from this state
     * @property {FSMStateTransitionList} transitions  a list of state transition definitions
     */

    /**
     * @typedef {object} FSMDefn
     * @property {function} initState() return the initial state
     * @property {FSMState} state-1 a user defined state
     * @property {FSMState} ...     more
     * @property {FSMState} state-n a user defined state
     */

    /**
     * @typedef {object} FSMObject
     * @property {function} state() returns the current state
     * @property {function} process() execute any runnable code defined by the current state
     * @property {function} trigger(event) apply this event to the state machine
     */


    const TS1=Date.parse("01 Jan 2001 00:00:00 GMT");
    const H0="";
    const H1="79ad3126b0d0645bc5cf8ca4af61ce4a7a41e6ad5e66c86419a7e2ec3f121627";

    /**
    */
    function Block(ts,index,data,hash,prev,nonce=0,difficulty=0){
      return {
        difficulty,
        nonce,
        index,
        hash,
        prev,
        ts,
        data
      }
    }
    //constructor(index: number, hash: string, previousHash: string, timestamp: number, data: Transaction[], difficulty: number, nonce: number)

    /*
    const genesisTransaction = {
        'txIns': [{'signature': '', 'txOutId': '', 'txOutIndex': 0}],
        'txOuts': [{
            'address': '04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a',
            'amount': 50
        }],
        'id': 'e655f6a5f26dc9b4cac6e46f52336428287759cf81ef5ff10854f69d68f43fa3'
    };
    */

    function getAdjustedDifficulty(e){
      let prev = _blockChain[_blockChain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
      let diff = e.ts - prev.ts;
      let expected = BLOCK_GENERATION_INTERVAL*1000 * DIFFICULTY_ADJUSTMENT_INTERVAL;
      return (diff < expected/2)? (prev.difficulty + 1)
                                : (diff > expected*2)? (prev.difficulty - 1) : prev.difficulty;
    }

    function calcDifficulty(){
      let e= _.last(_blockChain);
      return (e.index != 0 && e.index % DIFFICULTY_ADJUSTMENT_INTERVAL == 0)? getAdjustedDifficulty(e) : e.difficulty;
    }

    const _blockChain = [Block(TS1,0,"Bonjour!",H1,H0)];
    let unspentTxOuts = processTransactions(_blockchain[0].data, [], 0);
    const _$={
      // in seconds
      BLOCK_GENERATION_INTERVAL: 10,
      // in blocks
      DIFFICULTY_ADJUSTMENT_INTERVAL: 10,
      getChain(){ return _blockChain },
      headChain(){ return _blockChain[0] },
      tailChain(){ return _.last(_blockChain) },
      genRawNextBlock(data){
        const prev= this.tailChain();
        const difficulty= calcDifficulty();
        const n= prev.index + 1;
        const ts2= _.now();
        const newBlock= this.findBlock(n, prev.hash, ts2, blockData, difficulty);
        if(this.addBlockToChain(newBlock)){
          broadcastLatest();
          return newBlock;
        }
      },
      genNextBlock(){
        //const coinbaseTx: Transaction = getCoinbaseTransaction(getPublicFromWallet(), getLatestBlock().index + 1);
        //const blockData: Transaction[] = [coinbaseTx].concat(getTransactionPool());
        let blockData;
        return this.genRawNextBlock(blockData);
      },
      findBlock(index, prev, ts, data, difficulty){
        for(let hash,nonce=0; ; ++nonce){
          hash= this.calcHash(index, prev, ts, data, difficulty, nonce);
          if(this.hashMatchesDifficulty(hash, difficulty))
            return new Block(index, hash, prev, ts, data, difficulty, nonce);
        }
      },
      calcHashForBlock(b){
        return this.calcHash(b.index, b.prev, b.ts, b.data, b.difficulty, b.nonce)
      },
      calHash(index, prev, ts, data, difficulty, nonce){
        return CryptoJS.SHA256(index + prev+ ts + data + difficulty + nonce).toString()
      },
      isValidBlockStructure(b){
        return is.num(b.index) &&
               is.str(b.hash) &&
               is.str(b.prev) &&
               is.num(b.ts) && _.echts(data)
      },
      isValidNewBlock(b, prev){
        if(!this.isValidBlockStructure(b)){
          console.log('invalid block structure: %s', JSON.stringify(newBlock));
          return false;
        }
        if(prev.index+1 != b.index){
          console.log('invalid index');
          return false;
        }
        if(prev.hash != b.prev){
          console.log('invalid previoushash');
          return false;
        }
        if(!this.isValidTS(b, prev)){
          console.log('invalid timestamp');
          return false;
        }
        return this.hasValidHash(b);
      },
      getTotalDifficulty(bc){
        bc.reduce((acc,b)=>{
          return acc+Math.pow(2,b.difficulty)
        },0);
      },
      isValidTS(b, prev){
        let offset=60*1000;
        return (prev.ts-offset < b.ts) && (b.ts-offset < _.now())
      },
      hasValidHash(b){
        if(! this.hashMatchesBlockContent(b)){
          console.log('invalid hash, got:' + block.hash);
          return false;
        }
        if(! this.hashMatchesDifficulty(b.hash, b.difficulty)){
          console.log('block difficulty not satisfied. Expected: ' + block.difficulty + 'got: ' + block.hash);
        }
        return true;
      },
      hashMatchesBlockContent(b){
        return this.calcHashForBlock(b) == b.hash
      },
      hashMatchesDifficulty(hash, difficulty){
        return hexToBinary(hash).startsWith("0".repeat(difficulty))
      },
      isValidChain(bc){
        console.log('isValidChain:');
        console.log(JSON.stringify(bc));
        const isValidGenesis=(block: Block): boolean => {
          return JSON.stringify(block) === JSON.stringify(genesisBlock);
        };
        if(!isValidGenesis(bc[0])){
          return null;
        }
        /*
        Validate each block in the chain. The block is valid if the block structure is valid
          and the transaction are valid
         */
        let aUnspentTxOuts = [];
        for(let cur,i=0; i< bc.length; ++i){
          cur= bc[i];
          if(i != 0 &&
             !this.isValidNewBlock(cur, bc[i-1])){ return null }
          aUnspentTxOuts = this.processTransactions(cur.data, aUnspentTxOuts, cur.index);
          if(!aUnspentTxOuts){
            console.log('invalid transactions in blockchain');
            return null;
          }
        }
        return aUnspentTxOuts;
      },
      addBlockToChain(b){
        if(this.isValidNewBlock(b, this.tailChain())){
          const retVal = this.processTransactions(b.data, this.getUnspentTxOuts(), b.index);
          if(!retVal){
            console.log('block is not valid in terms of transactions');
            return false;
          }
          _blockChain.push(b);
          this.setUnspentTxOuts(retVal);
          this.updateTransactionPool(unspentTxOuts);
          return true;
        }
        return false;
      },
      replaceChain(c){
        const aUnspentTxOuts = this.isValidChain(c);
        const validChain = aUnspentTxOuts !== null;
        if(validChain &&
           this.getTotalDifficulty(c) > this.getTotalDifficulty(_blockChain)){
          console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
          _blockChain = c;
          this.setUnspentTxOuts(aUnspentTxOuts);
          this.updateTransactionPool(unspentTxOuts);
          this.broadcastLatest();
        }else{
          console.log('Received blockchain invalid');
        }
      },
      handleReceivedTransaction(tx){
        this.addToTransactionPool(tx, this.getUnspentTxOuts());
      },
      getUnspentTxOuts(){
        return _.cloneDeep(unspentTxOuts)
      },



        ;
    };


// and txPool should be only updated at the same time
    /*
const setUnspentTxOuts = (newUnspentTxOut: UnspentTxOut[]) => {
    console.log('replacing unspentTxouts with: %s', newUnspentTxOut);
    unspentTxOuts = newUnspentTxOut;
};
    */

// gets the unspent transaction outputs owned by the wallet
//const getMyUnspentTransactionOutputs = () => { return findUnspentTxOuts(getPublicFromWallet(), getUnspentTxOuts()); };

    /*
const generatenextBlockWithTransaction = (receiverAddress: string, amount: number) => {
    if (!isValidAddress(receiverAddress)) {
        throw Error('invalid address');
    }
    if (typeof amount !== 'number') {
        throw Error('invalid amount');
    }
    const coinbaseTx: Transaction = getCoinbaseTransaction(getPublicFromWallet(), getLatestBlock().index + 1);
    const tx: Transaction = createTransaction(receiverAddress, amount, getPrivateFromWallet(), getUnspentTxOuts(), getTransactionPool());
    const blockData: Transaction[] = [coinbaseTx, tx];
    return generateRawNextBlock(blockData);
};

const getAccountBalance = (): number => {
    return getBalance(getPublicFromWallet(), getUnspentTxOuts());
};

const sendTransaction = (address: string, amount: number): Transaction => {
    const tx: Transaction = createTransaction(address, amount, getPrivateFromWallet(), getUnspentTxOuts(), getTransactionPool());
    addToTransactionPool(tx, getUnspentTxOuts());
    broadCastTransactionPool();
    return tx;
};
    */

    /*
export {
    Block, getBlockchain, getUnspentTxOuts, getLatestBlock, sendTransaction,
    generateRawNextBlock, generateNextBlock, generatenextBlockWithTransaction,
    handleReceivedTransaction, getMyUnspentTransactionOutputs,
    getAccountBalance, isValidBlockStructure, replaceChain, addBlockToChain
};
    */

    //export {Block, getBlockchain, getLatestBlock, generateNextBlock, isValidBlockStructure, replaceChain, addBlockToChain};
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const _$={
      /**Create a FSM instance.
       * @memberof module:mcfud/fsm
       * @param {FSMDefn} defn
       * @return {FSMObject}
       */
    };

    return _$;
  }


  //export--------------------------------------------------------------------
  if(typeof module == "object" && module.exports){
    module.exports=_module(require("./core"))
  }else{
    gscope["io/czlab/mcfud/blockchain"]=_module
  }

})(this);

const ec = new ecdsa.ec('secp256k1');
const COINBASE_AMOUNT= 50;

function UnspentTxOut(txOutId, txOutIndex, address, amount){
  return{
    _txOutId: txOutId,
    _address: address,
    _amount: amount,
    _txOutIndex: txOutIndex,
    get txOutId() { return this._txOutId},
    get address() { return this._address},
    get amount() { return this._amount},
    get txOutIndex() { return this._txOutIndex }
  }
}

function TxIn(){
  return {
    signature: "",
    txOutId: "",
    txOutIndex: 0
  }
}

function TxOut(address, amount){
  return{
    address,amount
  }
}

function Transaction(){
  return {
    id: "",
    txIns: [],
    txOuts: []
  }
}

let _transactionPool= [];
let _T={
  getTransactionId(t){
    let
      a=t.txIns.reduce((acc,i)=>{ return acc + (i.txOutId + i.txOutIndex) },""),
      b=t.txOuts.reduce((acc,o)=>{ return acc+ (o.address+o.amount) },"");
    return CryptoJS.SHA256(txInContent + txOutContent).toString();
  },
  validateTransaction(t, aUnspentTxOuts){
    if(!this.isValidTransactionStructure(t)){ return false }
    if(this.getTransactionId(t) != t.id){
      console.log('invalid tx id: ' + t.id);
      return false;
    }
    const hasValidTxIns = t.txIns.map(i=>this.validateTxIn(i, t, aUnspentTxOuts)).reduce((acc, b) => acc && b, true);
    if(!hasValidTxIns){
      console.log('some of the txIns are invalid in tx: ' + t.id);
      return false;
    }
    const totalIns= t.txIns.reduce((acc,i)=>{ return acc+ this.getTxInAmount(i, aUnspentTxOuts) },0);
    const totalOuts= t.txOuts.reduce((acc,o)=>{ return acc + o.amount },0);
    if(totalIns != totalOuts){
      console.log('totalTxOutValues !== totalTxInValues in tx: ' + t.id);
      return false;
    }
    return true;
  },
  validateBlockTransactions(txs, aUnspentTxOuts, blockIndex){
    const coinbaseTx = txs[0];
    if(!this.validateCoinbaseTx(coinbaseTx, blockIndex)){
      console.log('invalid coinbase transaction: ' + JSON.stringify(coinbaseTx));
      return false;
    }
    // check for duplicate txIns. Each txIn can be included only once
    const txIns= txs.map(t=>t.txIns).flat();
    if(this.hasDuplicates(txIns)){
      return false;
    }
    // all but coinbase transactions
    return txs.slice(1).map(x=> this.validateTransaction(x,aUnspentTxOuts)).reduce((a,b)=>(a&&b), true);
  },
  hasDuplicates(txIns){
    let dup,groups={};
    txIns.map(i=> i.txOutId + i.txOutIndex).forEach(o=>{
      groups[o]= (groups[o]||0) + 1
    });
    _.doseq(groups,(v,k)=>{
      if(v>1){
        dup=true;
        console.log('duplicate txIn: ' + k);
      }
    });
    return dup;
  },
  validateCoinbaseTx(t, blockIndex){
    if(!t){
      console.log('the first transaction in the block must be coinbase transaction');
      return false;
    }
    if(this.getTransactionId(t) != t.id){
      console.log('invalid coinbase tx id: ' + t.id);
      return false;
    }
    if(t.txIns.length != 1){
      console.log('one txIn must be specified in the coinbase transaction');
      return false;
    }
    if(t.txIns[0].txOutIndex != blockIndex){
      console.log('the txIn signature in coinbase tx must be the block height');
      return false;
    }
    if(t.txOuts.length != 1){
      console.log('invalid number of txOuts in coinbase transaction');
      return false;
    }
    if(t.txOuts[0].amount != COINBASE_AMOUNT){
      console.log('invalid coinbase amount in coinbase transaction');
      return false;
    }
    return true;
  },
  validateTxIn(txIn, t, aUnspentTxOuts){
    const referencedUTxOut=
        aUnspentTxOuts.find((uTxO) => uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex);
    if(!referencedUTxOut){
      console.log('referenced txOut not found: ' + JSON.stringify(txIn));
      return false;
    }
    const address = referencedUTxOut.address;
    const key = ec.keyFromPublic(address, "hex");
    const validSignature= key.verify(t.id, txIn.signature);
    if(!validSignature){
      console.log('invalid txIn signature: %s txId: %s address: %s', txIn.signature, t.id, referencedUTxOut.address);
      return false;
    }
    return true;
  },
  getTxInAmount(txIn, aUnspentTxOuts){
    return this.findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts).amount;
  },
  findUnspentTxOut(tId, index, aUnspentTxOuts){
    return aUnspentTxOuts.find((uTxO) => uTxO.txOutId === transactionId && uTxO.txOutIndex === index);
  },
  getCoinbaseTransaction(address, blockIndex){
    const t = Transaction();
    const txIn= TxIn();
    txIn.signature = "";
    txIn.txOutId = "";
    txIn.txOutIndex = blockIndex;
    t.txIns = [txIn];
    t.txOuts = [TxOut(address, COINBASE_AMOUNT)];
    t.id = this.getTransactionId(t);
    return t;
  },
  signTxIn(t, txInIndex, privateKey, aUnspentTxOuts){
    const txIn= t.txIns[txInIndex];
    const dataToSign = t.id;
    const referencedUnspentTxOut= this.findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts);
    if(!referencedUnspentTxOut){
      console.log('could not find referenced txOut');
      throw Error();
    }
    const referencedAddress = referencedUnspentTxOut.address;
    if(this.getPublicKey(privateKey) != referencedAddress){
      console.log('trying to sign an input with private' +
          ' key that does not match the address that is referenced in txIn');
      throw Error();
    }
    const key = ec.keyFromPrivate(privateKey, "hex");
    return this.toHexString(key.sign(dataToSign).toDER());
  },
  updateUnspentTxOuts(txs, aUnspentTxOuts){
    const newOuts= txs.map(t=>
      t.txOuts.map((txOut,i)=> UnspentTxOut(t.id, i, txOut.address, txOut.amount))
    ).reduce((acc,b)=> acc.concat(b), []);
    const consumed= txs.reduce((acc,t)=>{
      return acc.concat(t.txIns)
    },[]).map(i=> UnspentTxOut(i.txOutId, i.txOutIndex, "", 0));

    return aUnspentTxOuts.filter(uTxO=>
      !this.findUnspentTxOut(uTxO.txOutId, uTxO.txOutIndex, consumed)).concat(newOuts);
  },
  processTransactions(txs, aUnspentTxOuts, blockIndex){
    if(!this.validateBlockTransactions(txs, aUnspentTxOuts, blockIndex)){
      console.log('invalid block transactions');
      return null;
    }
    return this.updateUnspentTxOuts(txs, aUnspentTxOuts);
  },
  toHexString(byteArray){
    return Array.from(byteArray, (b)=>{
      return ("0" + (b & 0xFF).toString(16)).slice(-2)
    }).join("")
  },
  getPublicKey(k){
    return ec.keyFromPrivate(k, "hex").getPublic().encode("hex")
  },
  isValidTxInStructure(txIn){
    if(!txIn){
      console.log('txIn is null');
      return false;
    }
    if(is.str(txIn.signature)){
      console.log('invalid signature type in txIn');
      return false;
    }
    if(is.str(txIn.txOutId)){
      console.log('invalid txOutId type in txIn');
      return false;
    }
    if(is.num(txIn.txOutIndex)){
      console.log('invalid txOutIndex type in txIn');
      return false;
    }
    return true;
  },
  isValidTxOutStructure(txOut){
    if(!txOut){
      console.log('txOut is null');
      return false;
    }
    if(is.str(txOut.address)){
      console.log('invalid address type in txOut');
      return false;
    }
    if(!this.isValidAddress(txOut.address)){
      console.log('invalid TxOut address');
      return false;
    }
    if(is.num(txOut.amount)){
      console.log('invalid amount type in txOut');
      return false;
    }
    return true;
  },
  isValidTransactionStructure(t){
    if(is.str(t.id)){
      console.log('transactionId missing');
      return false;
    }
    if(!is.vec(t)){
      console.log('invalid txIns type in transaction');
      return false;
    }
    if(!t.txIns.map(this.isValidTxInStructure).reduce((acc,b) => (acc && b), true)){
      return false;
    }
    if(!is.vec(t)){
      console.log('invalid txIns type in transaction');
      return false;
    }
    if(!t.txOuts.map(this.isValidTxOutStructure).reduce((acc,b) => (acc && b), true)){
      return false;
    }
    return true;
  },
  // valid address is a valid ecdsa public key in the 04 + X-coordinate + Y-coordinate format
  isValidAddress(a){
    if(a.length != 130){
      console.log(a);
      console.log('invalid public key length');
      return false;
    }
    if(!a.match("^[a-fA-F0-9]+$")){
      console.log('public key must contain only hex characters');
      return false;
    }
    if(!a.startsWith("04")){
      console.log('public key must start with 04');
      return false;
    }
    return true;
  },

  getTransactionPool(){
    return _.cloneDeep(_transactionPool);
  },
  addToTransactionPool(tx, unspentTxOuts){
    if(!this.validateTransaction(tx, unspentTxOuts)){
      throw Error('Trying to add invalid tx to pool');
    }
    if(!this.isValidTxForPool(tx, _transactionPool)){
      throw Error('Trying to add invalid tx to pool');
    }
    console.log('adding to txPool: %s', JSON.stringify(tx));
    _transactionPool.push(tx);
  },
  hasTxIn(txIn, unspentTxOuts){
    return unspentTxOuts.find(uTxO=> uTxO.txOutId == txIn.txOutId && uTxO.txOutIndex == txIn.txOutIndex)
  },
  updateTransactionPool(unspentTxOuts){
    let invalidTxs = [];
    for(let tx of _transactionPool){
        for(let txIn of tx.txIns){
          if(!this.hasTxIn(txIn, unspentTxOuts)){
            invalidTxs.push(tx);
            break;
          }
        }
    }
    invalidTxs.forEach((t,i)=>{
      if(i==0)
        console.log('removing the following transactions from txPool: %s', JSON.stringify(invalidTxs));
      _.disj(_transactionPool,t);
    });
  },
  getTxPoolIns(pool){
    return pool.map(t=> t.txIns).flat()
  },
  isValidTxForPool(tx, pool){
    const txPoolIns = this.getTxPoolIns(pool);
    const containsTxIn = (txIns, txIn)=>{
      return txPoolIns.find(txPoolIn=> txIn.txOutIndex == txPoolIn.txOutIndex && txIn.txOutId == txPoolIn.txOutId)
    };
    for(let txIn of tx.txIns){
      if(containsTxIn(txPoolIns, txIn)){
        console.log('txIn already found in the txPool');
        return false;
      }
    }
    return true;
  }


};


