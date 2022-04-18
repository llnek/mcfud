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
     * @module mcfud/crypto/wallet
     */

    const EC = new ECDSA.ec("secp256k1");
    const {u:_, is} = Core;

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    //kenl

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function findTxOutsForAmount(amount, out){
      let
        included= [],
        currentAmount = 0;
      for(let u of out){
        included.push(u);
        currentAmount += u.amount;
        if(currentAmount >= amount){
          return {included, leftOver: currentAmount - amount }
        }
      }
      throw Error(
        `Cannot create transaction from the available unspent transaction outputs.
         Required amount: ${amount}. Available unspentTxOuts: ${JSON.stringify(out)}`)
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function createTxOuts(TX,receiver, addr, amount, leftOver){
      let txOut1= TX.TxOut(receiver, amount);
      return leftOver== 0 ? [txOut1]
                          : [txOut1, TX.TxOut(addr, leftOver) ];
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    //MODULE EXPORT
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const _$={
      _KEY:UNDEF,
      createTx(receiver, amount, privateKey, unspent, txPool){
        function filterPool(addr){
          let
            out= [],
            txIns = txPool.map(t=> t.txIns).flat(),
            matched = unspent.filter(u=> u.address == addr);
          for(let u of matched){
            if(!_.find(txIns, a=> a.txOutId == u.txOutId &&
                                  a.txOutIndex == u.txOutIndex)) out.push(u) }
          return out;
        }
        let
          TX=this.TX,
          addr= EC.keyFromPrivate(sk, "hex").getPublic().encode("hex"),
          outs = filterPool(addr);
        let {included, leftOver} = findTxOutsForAmount(amount, outs);
        let toTxIn = (u)=> TX.TxIn(u.txOutId, u.txOutIndex);
        let tx= TX.Transaction("",
                               included.map(toTxIn),
                               createTxOuts(TX,receiver, addr, amount, leftOver));
        tx.id=TX.getTransactionId(tx);
        for(let i=0; i< tx.txIns.length; ++i){
          tx.txIns[i].signature = TX.signTxIn(tx, i, privateKey, unspent)
        }
        return tx;
      },
      genPrivateKey(){
        return EC.genKeyPair().getPrivate().toString(16)
      },
      getPublicFromWallet(){
        return EC.keyFromPrivate(this.getPrivateFromWallet(), "hex").getPublic().encode("hex")
      },
      getPrivateFromWallet(){
        return this._KEY
      },
      initWallet(){
        this._KEY="20db2edd8bd2e09e8cb7def7a26a20547afc0442509b275209cdd609923f7a80";
        //initialize this wallet, do whatever you want here
        if(!this._KEY)
          this._KEY= this.genPrivateKey();
        return this;
      },
      deleteWallet(){
        //purge stuff here
        //this._KEY=UNDEF;
        return this;
      },
      getBalance(addr, unspent){
        return this.findUnspentRecs(addr, unspent).reduce((acc,u)=> acc + u.amount,0)
      },
      findUnspentRecs(owner, unspent){
        return unspent.filter(u=> u.address == owner)
      },
      init(BC,TX,P2P){
        this.evtMgr= Core.EventBus();
        this.BC= BC.init(TX, this.evtMgr);
        this.TX= TX.init(BC, this.evtMgr);
        P2P.init(BC, TX, this.evtMgr);
        return this;
      },
      genNextBlock(){
        let t= this.TX.genGrantTx(this.getPublicFromWallet(), this.BC.nextIndex());
        return this.BC.genRawNextBlock([t].concat(this.TX.getTxPool()));
      },
      genBlockWith(receiver, amount){
        _.assert(this.TX.isValidAddress(receiver), "invalid address");
        _.assert(is.num(amount), "invalid amount");
        return this.BC.genRawNextBlock([
          this.TX.genGrantTx(this.getPublicFromWallet(), this.BC.nextIndex()),
          this.createTx(receiver, amount,
                                  this.getPrivateFromWallet(),
                                  this.TX.getUnspentRecs(), this.TX.getTxPool()) ]);
      },
      getAccountBalance(){
        return this.getBalance(this.getPublicFromWallet(), this.TX.getUnspentRecs())
      },
      sendTx(addr, amount){
        let tx= this.createTx(addr, amount, this.getPrivateFromWallet(),
                                            this.TX.getUnspentRecs(), this.TX.getTxPool());
        this.TX.addToTxPool(tx, this.TX.getUnspentRecs());
        this.evtMgr.pub(["tx.pool"], this.TX.getTxPool());
        return tx;
      },
      listUnspent(){
        return this.findUnspentRecs(this.getPublicFromWallet(), this.TX.getUnspentRecs())
      }
    };

    if(1){
    }

    return _$.initWallet();
  }

  //export--------------------------------------------------------------------
  if(typeof module == "object" && module.exports){
    module.exports=_module(require("../main/core"),
                           require("crypto-js"),
                           require("elliptic"))
  }else{
    gscope["io/czlab/mcfud/crypto/wallet"]=_module
  }

})(this);

