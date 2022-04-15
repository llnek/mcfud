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

"use strict";

var bodyParser =require( "body-parser");
var express= require("express");

var BC= require( "./blockchain");
var P2P= require("./p2p");
var TX= require("./tx");


let {Block, genNextBlock, getChain}= BC;
let {connect, getSockets, initServer} = P2P;

const httpPort= parseInt(process.env.HTTP_PORT) || 3001;
const p2pPort= parseInt(process.env.P2P_PORT) || 6001;


function start(myHttpPort){
  const app = express();
  app.use(bodyParser.json());

  app.get("/blocks", (req, res) => {
    res.send(BC.getChain());
  });
  app.post("/mine", (req, res) => {
    const newBlock= BC.genNextBlock(req.body.data);
    res.send(newBlock);
  });
  app.get("/peers", (req, res) => {
      res.send(P2P.getSockets().map(s=> s._socket.remoteAddress + ":" + s._socket.remotePort));
  });
  app.post("/addPeer", (req, res) => {
    P2P.connect(req.body.peer);
    res.send();
  });

  app.listen(myHttpPort, ()=>{
    console.log('Listening http on port: ' + myHttpPort);
  });
}

start(httpPort);
P2P.initServer(p2pPort, BC);



