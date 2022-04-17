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
    function getPublicKey(sk){
      return EC.keyFromPrivate(sk, "hex").getPublic().encode("hex");
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function filterTxPoolTxs(unspentTxOuts, transactionPool){
      let
        out= [],
        x,txIns = transactionPool.map(t=> t.txIns).flat();
      for(let u of unspentTxOuts){
        x= _.find(txIns, (a)=> a.txOutId == u.txOutId &&
                               a.txOutIndex == u.txOutIndex);
        if(!x)
          out.push(u);
      }
      return out;
    }

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
         Required amount: ${amount}. Available unspentTxOuts: ${JSON.stringify(out)}`
      )
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function createTxOuts(receiver, myAddress, amount, leftOver){
      const txOut1= _$.TX.TxOut(receiver, amount);
      return leftOver== 0 ? [txOut1]
                          : [txOut1, _$.TX.TxOut(myAddress, leftOver) ];
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    //MODULE EXPORT
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const _$={
      _KEY:UNDEF,
      createTransaction(receiver, amount, privateKey, unspentTxOuts, txPool){
        let
          myAddress= getPublicKey(privateKey),
          myOuts = unspentTxOuts.filter(u=> u.address == myAddress);
        myOuts = filterTxPoolTxs(myOuts, txPool);
        let {included, leftOver} = findTxOutsForAmount(amount, myOuts);
        let toUnsignedTxIn = (u)=> this.TX.TxIn(u.txOutId, u.txOutIndex);
        let tx= this.TX.Transaction(this.TX.getTransactionId(tx),
                                    included.map(toUnsignedTxIn),
                                    createTxOuts(receiver, myAddress, amount, leftOver));
        for(let i=0; i< tx.txIns.length; ++i){
          tx.txIns[i].signature = this.TX.signTxIn(tx, i, privateKey, unspentTxOuts)
        }
        return tx;
      },
      genPrivateKey(){
        return EC.genKeyPair().getPrivate().toString(16)
      },
      getPublicFromWallet(){
        let k = this.getPrivateFromWallet();
        return EC.keyFromPrivate(k, "hex").getPublic().encode("hex");
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
      getBalance(address, unspentTxOuts){
        return this.findUnspentTxOuts(address, unspentTxOuts).reduce((acc,u)=>{
          return acc + u.amount
        },0)
      },
      findUnspentTxOuts(ownerAddress, unspentTxOuts){
        return _.filter(unspentTxOuts, (u)=> u.address == ownerAddress)
      },
      init(BC,TX, P2P){
        this.BC= BC.init(TX, P2P);
        this.TX= TX.init(BC);
        this.P2P=P2P;
      },
      genNextBlock(){
        let
          t= this.TX.getCoinbaseTransaction(this.getPublicFromWallet(), this.BC.tailChain().index + 1);
          data= [t].concat(this.TX.getTransactionPool());
        return this.BC.generateRawNextBlock(data);
      },
      genBlockWithTransaction(receiver, amount){
        if(!this.TX.isValidAddress(receiver)){
          throw Error('invalid address');
        }
        if(!is.num(amount)){
          throw Error('invalid amount');
        }
        let
          c= this.TX.getCoinbaseTransaction(this.getPublicFromWallet(), this.BC.tailChain().index+1),
          tx= this.createTransaction(receiver, amount,
                                     this.getPrivateFromWallet(),
                                     this.TX.getUnspentTxOuts(), this.TX.getTransactionPool());
        return this.BC.generateRawNextBlock([c,tx]);
      },
      getAccountBalance(){
        return this.getBalance(this.getPublicFromWallet(), this.TX.getUnspentTxOuts());
      },
      sendTransaction(address, amount){
        const tx= this.createTransaction(address, amount, this.getPrivateFromWallet(),
                                         this.TX.getUnspentTxOuts(), this.TX.getTransactionPool());
        this.TX.addToTransactionPool(tx, this.TX.getUnspentTxOuts());
        this.P2P.bcastTxPool();
        return tx;
      },
      getMyUnspentTransactionOutputs(){
        return this.findUnspentTxOuts(this.getPublicFromWallet(), this.TX.getUnspentTxOuts())
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

