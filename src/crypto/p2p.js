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
  function _module(Core, WebSocket){

    if(!Core)
      Core=gscope["io/czlab/mcfud/core"]();

    const { is,u:_ }=Core;
    const {Server}= WebSocket;

    /**
     * @module mcfud/p2p
     */

    const _sockets = [];

    function SOCS_ADD(s){ return _sockets.push(s) }
    function SOCS(){ return _sockets }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const MsgType={
      QUERY_LATEST: 0,
      QUERY_ALL: 1,
      RESPONSE_BLOCKCHAIN: 2,
      QUERY_TRANSACTION_POOL: 4,
      RESPONSE_TRANSACTION_POOL: 8
    };

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const queryTransactionPoolMsg = {
      type: MsgType.QUERY_TRANSACTION_POOL
    };
    const queryChainLengthMsg={
      type: MsgType.QUERY_LATEST
    };
    const queryAllMsg={
      type: MsgType.QUERY_ALL
    };
    const responseLatestMsg=(arg)=>({
      type: MsgType.BLOCKCHAIN,
      data: JSON.stringify(arg)
    });
    const responseChainMsg=(arg)=>({
      type: MsgType.BLOCKCHAIN,
      data: JSON.stringify(arg)
    });
    const responseTransactionPoolMsg =(arg)=> ({
      type: MsgType.RESPONSE_TRANSACTION_POOL,
      data: JSON.stringify(arg)
    });

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function JSONToObject(data){
      try{
        return JSON.parse(data)
      }catch(e){
        console.log(e);
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function writeMsg(ws, msg){
      ws && ws.send(JSON.stringify(msg))
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function cfgMessageHandler(ws,bcObj,txObj){
      ws.on("message", (msg)=>{
        const obj= JSONToObject(msg);
        if(!obj){
          console.log(`could not parse received JSON message: ${msg}`)
        }else{
          console.log(`received message ${JSON.stringify(obj)}`);
          switch(obj.type){
            case MsgType.QUERY_LATEST:
              writeMsg(ws, responseLatestMsg(bcObj.tailChain()));
              break;
            case MsgType.QUERY_ALL:
              writeMsg(ws, responseChainMsg(bcObj.CHAIN()));
              break;
            case MsgType.RESPONSE_BLOCKCHAIN:
              const received= JSONToObject(obj.data);
              if(!received){
                console.log(`invalid blocks received:\n${obj.data}`);
              }else{
                handleUpdates(received,bcObj);
              }
              break;
            case MsgType.QUERY_TRANSACTION_POOL:
              writeMsg(ws, responseTransactionPoolMsg(txObj));
              break;
            case MsgType.RESPONSE_TRANSACTION_POOL:
              let txs= JSONToObject(obj.data);
              if(!txs){
                console.log('invalid transaction received: %s', JSON.stringify(obj.data));
              }else{
                txs.forEach(t=>{
                  try{
                    txObj.handleReceivedTx(t);
                    _$.bcastTxPool();
                  }catch (e){
                    console.log(e.message);
                  }
                });
              }
              break;
          }
        }
      })
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function broadcast(msg){
      _sockets.forEach(s=> writeMsg(s, msg))
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function cfgErrorHandler(ws){
      let closeConnection = (w)=>{
        console.log(`connection failed to peer: ${w.url}`);
        _.disj(_sockets,w)
      };
      ws.on("close", ()=> closeConnection(ws));
      ws.on("error", ()=> closeConnection(ws));
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function handleUpdates(newBlocks,bcObj){
      if(newBlocks.length == 0){
        console.log('received block chain size of 0');
        return;
      }
      const latest= newBlocks.at(-1);
      if(!bcObj.isValidBlockShape(latest)){
        console.log("block structuture not valid");
        return;
      }
      const curLast= bcObj.tailChain();
      if(latest.index > curLast.index){
        console.log(`blockchain possibly behind. got: ${curLast.index}, peer got: ${latest.index}`);
        if(curLast.hash == latest.prev){
          if(bcObj.addBlockToChain(latest))
            broadcast(responseLatestMsg(bcObj.tailChain()))
        }else if(newBlocks.length == 1){
          console.log("have to query the chain from our peer");
          broadcast(queryAllMsg);
        }else{
          console.log("blockchain is longer than current blockchain");
          bcObj.replaceChain(newBlocks);
        }
      }else{
        console.log("received blockchain is not longer than received blockchain. Do nothing");
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    //MODULE EXPORT
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const _$={
      initServer(p2pPort){
        let server = new WebSocket.Server({port: p2pPort});
        server.on("connection", (ws)=> this.cfgConnection(ws));
        console.log(`listening websocket p2p port on: ${p2pPort}`);
      },
      getSockets(){ return _sockets},
      connect(addr){
        let ws= new WebSocket(addr);
        ws.on("open", ()=> this.cfgConnection(ws));
        ws.on("error", ()=> console.log('connection failed'));
      },
      cfgConnection(ws){
        SOCS_ADD(ws);
        cfgMessageHandler(ws, this.bcObj, this.txObj);
        cfgErrorHandler(ws);
        writeMsg(ws, queryChainLengthMsg);
      },
      onBCLatest(arg){
        console.log("send changes to peers");
        broadcast(responseLatestMsg(arg));
      },
      onTxPool(arg){
        console.log("send tx-pool to peers");
        broadcast(responseTransactionPoolMsg(arg));
      },
      init(BC,TX,evt){
        this.evtMsg=evt;
        this.bcObj=BC;
        this.txObj=TX;
        evt.sub(["bc.latest"], "onBCLatest",this);
        evt.sub(["tx.pool"], "onTxPool",this);
      }
    };

    return _$;
  }
  //export--------------------------------------------------------------------
  if(typeof module == "object" && module.exports){
    module.exports=_module(require("../main/core"), require("ws"));
  }else{
    gscope["io/czlab/mcfud/crypto/p2p"]=_module
  }

})(this);


