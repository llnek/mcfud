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
  function _module(Core, CryptoJS, ECDSA){

    if(!Core)
      Core=gscope["io/czlab/mcfud/core"]();

    /**
     * @module mcfud/crypto/transaction
     */

    const EC = new ECDSA.ec("secp256k1");
    const COINBASE_AMOUNT= 50;

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function UnspentTxOut(txOutId, txOutIndex, address, amount){
      return {
        txOutId,
        txOutIndex,
        address,
        amount
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function TxIn(txOutId, txOutIndex, signature){
      return {
        txOutId,
        txOutIndex,
        signature
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function TxOut(address, amount){
      return {
        address,
        amount
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function Transaction(id, txIns, txOuts){
      return{
        id,
        txIns,
        txOuts
      }
    }

    function validateTransaction(t, aUnspentTxOuts){
      if(_$.getTransactionId(t) != t.id){
        console.log('invalid tx id: ' + t.id);
        return false;
      }
      let hasValidTxIns= true;
      for(let i=0;i<t.txIns.length;++i){
        if(!validateTxIn(t.txIns[i], t, aUnspentTxOuts)){
          hasValidTxIns=false;
          break;
        }
      }
      if(!hasValidTxIns){
        console.log('some of the txIns are invalid in tx: ' + t.id);
        return false;
      }

      const totalTxInValues= t.txIns.reduce((acc,x)=>{
        return acc + getTxInAmount(x, aUnspentTxOuts)
      },0);

      const totalTxOutValues= t.txOuts.reduce((acc,x)=>{
        return acc + x.amount
      },0);

      if(totalTxOutValues != totalTxInValues){
        console.log('totalTxOutValues !== totalTxInValues in tx: ' + t.id);
        return false;
      }

      return true;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function validateBlockTransactions(txs, aUnspentTxOuts, blockIndex){
      const coinbaseTx = txs[0];
      if(!validateCoinbaseTx(coinbaseTx, blockIndex)){
        console.log('invalid coinbase transaction: ' + JSON.stringify(coinbaseTx));
        return false;
      }
      //check for duplicate txIns. Each txIn can be included only once
      const txIns= txs.map(x=> x.txIns).flat();
      if(hasDuplicates(txIns)){
        return false;
      }
      // all but coinbase transactions
      for(let i=1; i< txs.length;++i){
        if(!validateTransaction(txs[i], aUnspentTxOuts))
          return false
      }
      return true;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function hasDuplicates(txIns){
      let bin=new Map();
      for(let x,i=0; i< txIns.length; ++i){
        x=txIns[i];
        s= x.txOutId + x.txOutIndex;
        if(bin.has(s)){
          console.log(`duplicate txIn: ${s}`);
          return true;
        }
        bin.set(s,1);
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function validateCoinbaseTx(t, blockIndex){
      if(!t){
        console.log("the first transaction in the block must be coinbase transaction");
        return false;
      }
      if(_$.getTransactionId(t) != t.id){
        console.log(`invalid coinbase tx id: ${t.id}`);
        return false;
      }
      if(t.txIns.length != 1){
        console.log("one txIn must be specified in the coinbase transaction");
        return false;
      }
      if(t.txIns[0].txOutIndex != blockIndex){
        console.log("the txIn signature in coinbase tx must be the block height");
        return false;
      }
      if(t.txOuts.length != 1){
        console.log("invalid number of txOuts in coinbase transaction");
        return false;
      }
      if(t.txOuts[0].amount != COINBASE_AMOUNT){
        console.log("invalid coinbase amount in coinbase transaction");
        return false;
      }
      return true;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function validateTxIn(txIn, t, aUnspentTxOuts){
      const referencedUTxOut=
          aUnspentTxOuts.find(x=> x.txOutId == txIn.txOutId && x.txOutId == txIn.txOutId);
      if(!referencedUTxOut){
        console.log(`referenced txOut not found: ${JSON.stringify(txIn)}`);
        return false;
      }
      const address = referencedUTxOut.address;
      const key = EC.keyFromPublic(address, "hex");
      return key.verify(t.id, txIn.signature);
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function findUnspentTxOut(transactionId, index, aUnspentTxOuts){
      return aUnspentTxOuts.find(x=> x.txOutId == transactionId && x.txOutIndex == index);
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function getTxInAmount(txIn, aUnspentTxOuts){
      return findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts).amount;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function updateUnspentTxOuts(newTransactions, aUnspentTxOuts){
      const newUnspentTxOuts = newTransactions
          .map(t=> {
              return t.txOuts.map((txOut,i)=> UnspentTxOut(t.id, i, txOut.address, txOut.amount));
          })
          .reduce((a,b) => a.concat(b), []);

      const consumedTxOuts = newTransactions
          .map(t=> t.txIns)
          .reduce((a, b) => a.concat(b), [])
          .map(x=> UnspentTxOut(x.txOutId, x.txOutIndex, "", 0));

      return aUnspentTxOuts.filter(x=> !findUnspentTxOut(x.txOutId, x.txOutIndex, consumedTxOuts)).concat(newUnspentTxOuts);
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function toHexString(byteArray){
      return Array.from(byteArray, (byte)=>{
        return ("0" + (byte & 0xFF).toString(16)).slice(-2) }).join('');
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function isValidTxInStructure(txIn){
      let msg;
      if(!txIn){
        msg="txIn is null"
      }else if(!is.str(txIn.signature)){
        msg="invalid signature type in txIn"
      }else if(!is.str(txIn.txOutId)){
        msg="invalid txOutId type in txIn"
      }else if(!is.num(txIn.txOutIndex)){
        msg="invalid txOutIndex type in txIn"
      }
      if(msg)
        console.log(msg);
      return !msg;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function isValidTxOutStructure(txOut){
      let msg;
      if(!txOut){
        msg="txOut is null"
      }else if(!is.str(txOut.address)){
        msg="invalid address type in txOut"
      }else if(!isValidAddress(txOut.address)){
        msg="invalid TxOut address"
      }else if(!is.num(txOut.amount)){
        msg="invalid amount type in txOut"
      }
      if(msg)
        console.log(msg);

      return !msg;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function isValidTransactionsStructure(txs){
      for(let i=0;i<txs.length;++i){
        if(!isValidTransactionStructure(txs[i]))
          return false
      }
      return true;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function isValidTransactionStructure(t){
      let msg;
      if(!is.str(t.id)){
        msg="transactionId missing"
      }
      else if(!(t.txIns instanceof Array)){
        msg="invalid txIns type in transaction"
      }
      else if(!t.txIns.map(isValidTxInStructure).reduce((a,b) => (a && b), true)){
        msg="invalid txIn structure"
      }
      else if(!(t.txOuts instanceof Array)){
        msg="invalid txIns type in transaction"
      }
      if(msg){
        console.log(msg);
        return false;
      }

      for(let i=0;i < t.txOuts.length;++i){
        if(!isValidTxOutStructure(t.txOuts[i]))
          return false
      }
      return true;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    //valid address is a valid ecdsa public key in the 04 + X-coordinate + Y-coordinate format
    function isValidAddress(address){
      let msg;
      if(address.length != 130){
        msg="invalid public key length"
      }else if(!address.match("^[a-fA-F0-9]+$")){
        msg="public key must contain only hex characters"
      }else if(!address.startsWith("04")){
        msg="public key must start with 04"
      }
      if(msg)
        console.log(msg);
      return !msg;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    //MODULE EXPORT
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const _$={
      UnspentTxOut,
      TxIn,
      TxOut,
      Transaction,

      processTransactions(txs, aUnspentTxOuts, blockIndex){
        if(!isValidTransactionsStructure(txs)){
          return UNDEF;
        }
        if(!validateBlockTransactions(txs, aUnspentTxOuts, blockIndex)){
          console.log("invalid block transactions");
          return UNDEF;
        }
        return updateUnspentTxOuts(txs, aUnspentTxOuts);
      },
      getPublicKey(sk){
        return EC.keyFromPrivate(sk, "hex").getPublic().encode("hex");
      },
      getCoinbaseTransaction(address, blockIndex){
        const t = Transaction();
        const txIn= TxIn();
        txIn.signature = "";
        txIn.txOutId = "";
        txIn.txOutIndex = blockIndex;

        t.txIns = [txIn];
        t.txOuts = [TxOut(address, COINBASE_AMOUNT)];
        t.id = _$.getTransactionId(t);
        return t;
      },
      getTransactionId(t){

        const txInContent= t.txIns.reduce((acc,t)=>{
          return acc + (t.txOutId + t.txOutIndex)
        },"");

        const txOutContent= t.txOuts.reduce((acc,t)=>{
          return acc + (t.address + t.amount)
        });

        return CryptoJS.SHA256(txInContent + txOutContent).toString();
      },
      signTxIn(t, txInIndex, privateKey, aUnspentTxOuts){
        const txIn= t.txIns[txInIndex];
        const dataToSign = t.id;
        const referencedUnspentTxOut= findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts);
        if(!referencedUnspentTxOut){
          console.log("could not find referenced txOut");
          throw Error();
        }
        const referencedAddress = referencedUnspentTxOut.address;
        if(getPublicKey(privateKey) != referencedAddress){
          console.log("trying to sign an input with private" +
                "-key that does not match the address that is referenced in txIn");
          throw Error();
        }
        const key = EC.keyFromPrivate(privateKey, "hex");
        return toHexString(key.sign(dataToSign).toDER());
      }

    };

    return _$;
  }


  //export--------------------------------------------------------------------
  if(typeof module == "object" && module.exports){
    module.exports=_module(require("../main/core"),
                           require("crypto-js"),
                           require("elliptic"))
  }else{
    gscope["io/czlab/mcfud/crypto/transaction"]=_module
  }

})(this);

