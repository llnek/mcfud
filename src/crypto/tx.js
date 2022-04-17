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
// Copyright © 2022, Kenneth Leung. All rights reserved.

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
    function UnspentRec(txOutId, txOutIndex, address, amount){
      return{ txOutId, txOutIndex, address, amount }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function TxIn(txOutId, txOutIndex, signature=""){
      return{
        txOutId, txOutIndex, signature,
        toString(){
          return ""+this.txOutId+this.txOutIndex+this.signature } }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function TxOut(address, amount){
      return{
        address, amount,
        toString(){ return ""+this.address+this.amount } }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function Transaction(id, txIns, txOuts){
      return{
        id, txIns, txOuts,
        toString(){ return ""+this.id+this.txIns.toString()+this.txOuts.toString() } }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function validateTx(t, unspent){
      if(_$.getTransactionId(t) != t.id){
        console.error(`invalid tx id: ${t.id}`)
      }else{
        for(let i=0; i<t.txIns.length; ++i){
          if(!validateTxIn(t.txIns[i], t, unspent)){
            console.error(`some of the txIns are invalid in tx: ${t.id}`);
            t=UNDEF;
            break;
          }
        }
        return t && (t.txOuts.reduce((acc,x)=> acc + x.amount,0)==
                     t.txIns.reduce((acc,x)=> acc+getTxInAmount(x, unspent),0))
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function validateGrantTx(t, index){
      let msg;
      if(!t){
        msg="the first tx in the block must be a grant-transaction"
      }
      else if(_$.getTransactionId(t) != t.id){
        msg=`invalid grant-tx id: ${t.id}`
      }
      else if(t.txIns.length != 1){
        msg="one txIn must be specified in the coinbase transaction"
      }
      else if(t.txIns[0].txOutIndex != index){
        msg="the txIn signature in coinbase tx must be the block height"
      }
      else if(t.txOuts.length != 1){
        msg="invalid number of txOuts in coinbase transaction"
      }
      else if(t.txOuts[0].amount != COINBASE_AMOUNT){
        msg="invalid coinbase amount in coinbase transaction"
      }
      if(msg)
        console.error(msg);
      return !msg;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function validateBlockTxs(txs, unspent, index){
      let msg,t = txs[0];
      if(!validateGrantTx(t, index)){
        msg=`invalid grant-transaction: ${JSON.stringify(t)}`
      }else if(hasDuplicates(txs.map(x=> x.txIns).flat())){
        msg=`duplicate txIns`
      }else{
        //all but coinbase transactions
        for(let i=1; i< txs.length; ++i){
          if(!validateTx(txs[i], unspent)){
            msg="invalid tx";
            i=Infinity;
          }
        }
      }
      if(msg)
        console.error(msg);
      return !msg;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function hasDuplicates(txIns){
      for(let s,x,bin=new Map(), i=0; i< txIns.length; ++i){
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
    function validateTxIn(txIn, t, unspent){
      let ref= unspent.find(x=> x.txOutId == txIn.txOutId && x.txOutIndex == txIn.txOutIndex);
      return ref && EC.keyFromPublic(ref.address, "hex").verify(t.id, txIn.signature);
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function findUnspentRec(id, index, unspent){
      return unspent.find(x=> x.txOutId == id && x.txOutIndex == index)
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function getTxInAmount(txIn, unspent){
      let r= findUnspentRec(txIn.txOutId, txIn.txOutIndex, unspent);
      _.assert(r, "failed to locate unspent-rec");
      return r.amount;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function updateUnspentRec(txs, unspent){
      let newOuts = txs.map(t=> t.txOuts.
          map((u,i)=> UnspentRec(t.id, i, u.address, u.amount))).
          reduce((acc,b) => acc.concat(b), []);
      let consumed= txs.map(t=> t.txIns).
          reduce((acc,b) => acc.concat(b), []).
          map(x=> UnspentRec(x.txOutId, x.txOutIndex, "", 0));
      return unspent.filter(x=>
        !findUnspentRec(x.txOutId, x.txOutIndex, consumed)).concat(newOuts);
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function toHexString(bytes){
      return Array.from(bytes, (b)=>{
        return ("0" + (b&0xFF).toString(16)).slice(-2) }).join('')
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function isValidTxInShape(txIn){
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
    function isValidTxOutShape(txOut){
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
    function isValidTxShape(txs){
      for(let i=0;i<txs.length;++i){
        if(!isValidTransactionShape(txs[i]))
          return false
      }
      return true;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function isValidTransactionShape(t){
      let msg;
      if(!is.str(t.id)){
        msg="transactionId missing"
      }
      else if(!(t.txIns instanceof Array)){
        msg="invalid txIns type in transaction"
      }
      else if(!t.txIns.map(isValidTxInShape).reduce((a,b) => (a && b), true)){
        msg="invalid txIn structure"
      }
      else if(!(t.txOuts instanceof Array)){
        msg="invalid txIns type in transaction"
      }
      if(msg){
        console.error(msg);
        return false;
      }
      for(let i=0;i < t.txOuts.length;++i){
        if(!isValidTxOutShape(t.txOuts[i]))
          return false
      }
      return true;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    //valid address is a valid ecdsa public key in the 04 + X-coordinate + Y-coordinate format
    function isValidAddress(addr){
      let msg;
      if(addr.length != 130){
        msg="invalid public key length"
      }else if(!addr.match("^[a-fA-F0-9]+$")){
        msg="public key must contain only hex characters"
      }else if(!addr.startsWith("04")){
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
      UnspentRec,
      TxIn,
      TxOut,
      Transaction,
      lift(bc){
        bc.replaceChain=function(c){
          let
            out = this.isValidChain(c),
            valid= _.echt(out);
          if(valid && this.calcTotalDifficulty(c) > this.calcTotalDifficulty()){
            _$.setUnspentRecs(out);
            _$.updateTxPool(out);
            this.resetChain(c);
          }else{
            console.warn("received blockchain invalid")
          }
        };
        bc.addBlockToChain=function(b){
          if(this.isValidNewBlock(b, this.tailChain())){
            let retVal= _$.processTxs(b.data, _$.unspentRecs, b.index);
            if(retVal){
              this.CHAIN_ADD(b);
              _$.setUnspentRecs(retVal);
              _$.updateTxPool(retVal);
              return b;
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
            out = _$.processTxs(cur.data, out, cur.index);
            if(!out){
              console.warn("invalid transactions in blockchain");
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
      unspentRecs: [],
      cloneUnspentRecs(){
        return JSON.parse(JSON.stringify(this.unspentRecs))
      },
      setUnspentRecs(r){
        this.unspentRecs = r;
      },
      processTxs(txs, unspent, index){
        if(isValidTxShape(txs) &&
           validateBlockTxs(txs, unspent, index))
          return updateUnspentRec(txs, unspent);
      },
      getPublicKey(sk){
        return EC.keyFromPrivate(sk, "hex").getPublic().encode("hex");
      },
      genGrantTx(addr, index){
        let
          txIn= TxIn("",index,""),
          t = Transaction("", [txIn], [TxOut(addr, COINBASE_AMOUNT)]);
        t.id = this.getTransactionId(t);
        return t;
      },
      getTransactionId(t){
        let i= t.txIns.reduce((acc,t)=>{
          return acc + ("" + t.txOutId + t.txOutIndex) },"");
        let o= t.txOuts.reduce((acc,t)=>{
          return acc + ("" + t.address + t.amount) },"");
        return CryptoJS.SHA256(""+i+o).toString();
      },
      signTxIn(t, txInIndex, privateKey, unspent){
        let
          txIn= t.txIns[txInIndex],
          ref= findUnspentRec(txIn.txOutId, txIn.txOutIndex, unspent);
        _.assert(ref, "could not find referenced txOut");
        if(getPublicKey(privateKey) != ref.address){
          _.assert(false,"trying to sign an input with private" +
                         "-key that does not match the address that is referenced in txIn")
        }
        return toHexString(EC.keyFromPrivate(privateKey, "hex").sign(t.id).toDER());
      },
      handleReceivedTx(t){
        this.addToTxPool(t, this.unspentRecs)
      },
      transactionPool: [],
      cloneTxPool(){
        return JSON.parse(JSON.stringify(this.transactionPool))
      },
      addToTxPool(tx, unspent){
        _.assert(validateTx(tx, unspent), "trying to add invalid tx to pool");
        _.assert(this.isValidTxForPool(tx), "trying to add invalid tx to pool");
        this.transactionPool.push(tx);
      },
      hasTxIn(txIn, unspent){
        return unspent.find(u=> u.txOutId == txIn.txOutId && u.txOutIndex == txIn.txOutIndex)
      },
      updateTxPool(unspent){
        let invalid= [];
        for(let tx of this.transactionPool){
          for(let txIn of tx.txIns){
            if(!this.hasTxIn(txIn, unspent)){
              invalid.push(tx);
              //break;
            }
          }
        }
        invalid.forEach(x=> _.disj(this.transactionPool,x));
      },
      getTxPoolIns(){
        return this.transactionPool.map(tx=> tx.txIns).flat()
      },
      isValidTxForPool(tx){
        let
          pins = this.getTxPoolIns(),
          has= (x)=> pins.find(p=> x.txOutIndex == p.txOutIndex && x.txOutId == p.txOutId);
        for(let x of tx.txIns){
          if(has(x)){
            console.error("txIn already found in the txPool");
            return false;
          }
        }
        return true;
      },
      init(BC){
        this.unspentRecs= this.processTxs(BC.CHAIN(0).data, [], 0);
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

