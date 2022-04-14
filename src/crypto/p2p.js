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

//import * as WebSocket from 'ws';
//import {Server} from 'ws';
//import {addBlockToChain, Block, getBlockchain, getLatestBlock, isValidBlockStructure, replaceChain} from './blockchain';
  /**Create the module.
  */
  function _module(Core){

    if(!Core)
      Core=gscope["io/czlab/mcfud/core"]();

    const { is,u:_ }=Core;

    /**
     * @module mcfud/p2p
     */

    const _sockets = [];

    const MessageType={
      QUERY_LATEST: 0,
      QUERY_ALL: 1,
      RESPONSE_BLOCKCHAIN: 2
    };


    function SOCS_ADD(s){ return _sockets.push(s) }
    function SOCS(){ return _sockets }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function Message(type, data){
      return { type, data }
    }

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
    function initMessageHandler(ws){
      ws.on("message", (msg)=>{
        const obj= JSONToObject(msg);
        if(!obj){
          console.log(`could not parse received JSON message: ${msg}`)
        }else{
          console.log(`received message ${JSON.stringify(obj)}`);
          switch(obj.type){
            case MessageType.QUERY_LATEST:
              writeMsg(ws, responseLatestMsg());
              break;
            case MessageType.QUERY_ALL:
              writeMsg(ws, responseChainMsg());
              break;
            case MessageType.RESPONSE_BLOCKCHAIN:
              const received= JSONToObject(obj.data);
              if(!received){
                console.log(`invalid blocks received:\n${obj.data}`);
              }else{
                handleBlockchainResponse(received);
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
    const queryChainLengthMsg=()=>({"type": MessageType.QUERY_LATEST, "data": UNDEF});
    const queryAllMsg=()=>({"type": MessageType.QUERY_ALL, "data": UNDEF});
    const responseChainMsg=()=>({
    "type": MessageType.RESPONSE_BLOCKCHAIN, "data": JSON.stringify(getBlockchain())
    });
    const responseLatestMsg=()=>({
    "type": MessageType.RESPONSE_BLOCKCHAIN,
    "data": JSON.stringify([getLatestBlock()]) });

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function initErrorHandler(ws){
      let closeConnection = (w)=>{
        console.log(`connection failed to peer: ${w.url}`);
        _.disj(_sockets,w)
      };
      ws.on("close", ()=> closeConnection(ws));
      ws.on("error", ()=> closeConnection(ws));
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function handleBlockchainResponse(receivedBlocks){
      if(receivedBlocks.length == 0){
        console.log('received block chain size of 0');
        return;
      }
      const latestBlockReceived= receivedBlocks.at(-1);
      if(!isValidBlockStructure(latestBlockReceived)){
        console.log('block structuture not valid');
        return;
      }
      const latestBlockHeld= getLatestBlock();
      if(latestBlockReceived.index > latestBlockHeld.index){
        console.log('blockchain possibly behind. We got: '
            + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if(latestBlockHeld.hash == latestBlockReceived.previousHash){
          if(addBlockToChain(latestBlockReceived)){
            broadcast(responseLatestMsg())
          }
        }else if(receivedBlocks.length == 1){
          console.log('We have to query the chain from our peer');
          broadcast(queryAllMsg());
        }else{
          console.log('Received blockchain is longer than current blockchain');
          replaceChain(receivedBlocks);
        }
      }else{
        console.log('received blockchain is not longer than received blockchain. Do nothing');
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    //MODULE EXPORT
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const _$={
      initP2PServer(p2pPort){
        let server = new WebSocket.Server({port: p2pPort});
        server.on("connection", (ws)=> initConnection(ws));
        console.log(`listening websocket p2p port on: ${p2pPort}`);
      },
      getSockets(){ return _sockets},
      bcastLatest(){
        broadcast(responseLatestMsg())
      },
      connectToPeers(addr){
        let ws= new WebSocket(addr);
        ws.on("open", ()=> initConnection(ws));
        ws.on("error", ()=> console.log('connection failed'));
      },
      initConnection(ws){
        SOCS_ADD(ws);
        initMessageHandler(ws);
        initErrorHandler(ws);
        writeMsg(ws, queryChainLengthMsg());
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module == "object" && module.exports){
    module.exports=_module(require("../main/core"))
  }else{
    gscope["io/czlab/mcfud/crypto/p2p"]=_module
  }

})(this);


