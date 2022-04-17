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

    const {u:_, is}= Core;

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
    function TxIn(txOutId, txOutIndex, signature=""){
      return {
        txOutId,
        txOutIndex,
        signature,
        toString(){
          return ""+this.txOutId+this.txOutIndex+this.signature
        }
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function TxOut(address, amount){
      return {
        address,
        amount,
        toString(){
          return ""+this.address+this.amount
        }
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function Transaction(id, txIns, txOuts){
      return{
        id,
        txIns,
        txOuts,
        toString(){
          return ""+id+txIns.toString()+txOuts.toString()
        }
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function validateTransaction(t, aUnspentTxOuts){
      if(_$.getTransactionId(t) != t.id){
        console.log('invalid tx id: ' + t.id);
        console.log("expected = " + _$.getTransactionId(t));
        return false;
      }
      let sumIn, sumOut, hasValidTxIns= true;
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
      sumIn= t.txIns.reduce((acc,x)=>{
        return acc + getTxInAmount(x, aUnspentTxOuts)
      },0);
      sumOut= t.txOuts.reduce((acc,x)=>{
        return acc + x.amount
      },0);
      return sumOut==sumIn;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function validateBCoinTx(t, index){
      if(!t){
        console.log("the first transaction in the block must be coinbase transaction");
        return false;
      }
      if(_$.getTransactionId(t) != t.id){
        console.log(`invalid coinbase tx id: ${t.id}`);
        console.log("expected ==== " + _$.getTransactionId(t));
        return false;
      }
      if(t.txIns.length != 1){
        console.log("one txIn must be specified in the coinbase transaction");
        return false;
      }
      if(t.txIns[0].txOutIndex != index){
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
    function validateBlockTransactions(txs, aUnspentTxOuts, index){
      let t = txs[0];
      if(!validateBCoinTx(t, index)){
        console.log('invalid coinbase transaction: ' + JSON.stringify(t));
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
      for(let s,x,i=0; i< txIns.length; ++i){
        x=txIns[i];
        s= ""+ x.txOutId + x.txOutIndex;
        if(bin.has(s)){
          console.log(`duplicate txIn: ${s}`);
          return true;
        }
        bin.set(s,1);
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function validateTxIn(txIn, t, aUnspentTxOuts){
      let ref= aUnspentTxOuts.find(x=> x.txOutId == txIn.txOutId && x.txOutId == txIn.txOutId);
      return ref && EC.keyFromPublic(ref.address, "hex").verify(t.id, txIn.signature);
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function findUnspentTxOut(txID, index, aUnspentTxOuts){
      return aUnspentTxOuts.find(x=> x.txOutId == txID&& x.txOutIndex == index)
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function getTxInAmount(txIn, aUnspentTxOuts){
      return findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts).amount;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function updateUnspentTxOuts(nexTxs, aUnspentTxOuts){
      let newOuts = nexTxs.map(t=>
        t.txOuts.map((txOut,i)=> UnspentTxOut(t.id, i, txOut.address, txOut.amount))
      ).reduce((a,b) => a.concat(b), []);
      let consumed= nexTxs.map(t=> t.txIns).
          reduce((a,b) => a.concat(b), []).
          map(x=> UnspentTxOut(x.txOutId, x.txOutIndex, "", 0));
      return aUnspentTxOuts.filter(x=>
        !findUnspentTxOut(x.txOutId, x.txOutIndex, consumed)).concat(newOuts);
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function toHexString(byteArray){
      return Array.from(byteArray, (b)=>{
        return ("0" + (b&0xFF).toString(16)).slice(-2) }).join('');
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
      lift(bc){
        bc.replaceChain=function(c){
          let
            out = this.isValidChain(c),
            valid= _.echt(out);
          if(valid && this.calcTotalDifficulty(c) > this.calcTotalDifficulty()){
            _$.setUnspentTxOuts(out);
            _$.updateTransactionPool(out);
            this.resetChain(c);
          }else{
            console.log('Received blockchain invalid');
          }
        };
        bc.addBlockToChain=function(b){
          if(this.isValidNewBlock(b, this.tailChain())){
            let retVal= _$.processTransactions(b.data, _$.getUnspentTxOuts(), b.index);
            if(retVal){
              this.CHAIN_ADD(b);
              _$.setUnspentTxOuts(retVal);
              _$.updateTransactionPool(_$.unspentTxOuts);
              return true;
            }
          }
        };
        bc.isValidChain = function(bc){
          if(!this.ensureRoot(bc[0])){
            return UNDEF
          }
          let out=[];
          for(let cur,i=0; i< bc.length; ++i){
            cur= bc[i];
            if(i != 0 && !this.isValidNewBlock(bc[i], bc[i-1])){
              return UNDEF
            }
            out = _$.processTransactions(cur.data, out, cur.index);
            if(!out){
              console.log('invalid transactions in blockchain');
              return UNDEF
            }
          }
          return out;
        };
        bc.genRoot=function(){
          return [_$.genRoot()]
        }
      },
      genRoot(){
        return Transaction(
          "5e7a184fe16430f399d37a3e0197614ea3188624aa25b021139bb61a73fd412b",
          [TxIn("",0,"")],
          [TxOut("0429a91b39ad936a5e0690ffdb3136a554da25ba577182f6f187ba329e564a93cc5a3ee6f3258fe5139fd75d92851c85a3fb3f3f2b71e98ac254b8b73cc12db613",50) ]);
      },
      unspentTxOuts: [],
      getUnspentTxOuts(){
        return JSON.parse(JSON.stringify(this.unspentTxOuts))
      },
      setUnspentTxOuts(newUnspentTxOut){
        //console.log('replacing unspentTxouts with: %s', newUnspentTxOut);
        this.unspentTxOuts = newUnspentTxOut;
      },
      processTransactions(txs, aUnspentTxOuts, blockIndex){
        //console.log(JSON.stringify(txs));
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
        let txInContent= t.txIns.reduce((acc,t)=>{
          return acc + ("" + t.txOutId + t.txOutIndex)
        },"");
        let txOutContent= t.txOuts.reduce((acc,t)=>{
          return acc + ("" + t.address + t.amount)
        },"");
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
      },
      handleReceivedTransaction(t){
        this.addToTransactionPool(t, this.getUnspentTxOuts())
      },
      transactionPool: [],
      getTransactionPool(){
        return JSON.parse(JSON.stringify(this.transactionPool))
      },
      addToTransactionPool(tx, unspentTxOuts){
        if(!validateTransaction(tx, unspentTxOuts)){
          throw Error('Trying to add invalid tx to pool')
        }
        if(!this.isValidTxForPool(tx, this.transactionPool)){
          throw Error('Trying to add invalid tx to pool')
        }
        //console.log('adding to txPool: %s', JSON.stringify(tx));
        this.transactionPool.push(tx);
      },
      hasTxIn(txIn, unspentTxOuts){
        return unspentTxOuts.find(u=> u.txOutId == txIn.txOutId && u.txOutIndex == txIn.txOutIndex)
      },
      updateTransactionPool(unspentTxOuts){
        const invalidTxs = [];
        for(let tx of this.transactionPool){
          for(let txIn of tx.txIns){
            if(!this.hasTxIn(txIn, unspentTxOuts)){
              invalidTxs.push(tx);
              break;
            }
          }
        }
        invalidTxs.forEach(x=> _.disj(this.transactionPool,x));
      },
      getTxPoolIns(aTransactionPool){
        return aTransactionPool.map(tx=> tx.txIns).flat()
      },
      isValidTxForPool(tx, aTtransactionPool){
        const txPoolIns = this.getTxPoolIns(aTtransactionPool);
        const containsTxIn = (txIn)=>{
          return txPoolIns.find(txPoolIn=>
            txIn.txOutIndex == txPoolIn.txOutIndex && txIn.txOutId == txPoolIn.txOutId)
        };
        for(let txIn of tx.txIns){
          if(containsTxIn(txIn)){
            console.log('txIn already found in the txPool');
            return false;
          }
        }
        return true;
      },
      init(BC){
        this.unspentTxOuts= this.processTransactions(BC.CHAIN(0).data, [], 0);
        return this;
      }
    };

    if(0){
      let s= _$.getTransactionId(_$.genRoot());
      console.log(s);
    }
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

