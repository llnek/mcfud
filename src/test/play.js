/* Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright © 2020-2022, Kenneth Leung. All rights reserved. */

;(function(gscope){

  "use strict";

  function play(){
    let Core=gscope["io/czlab/mcfud/core"]();
    let _G=gscope["io/czlab/mcfud/gfx"]();
    let Geo=gscope["io/czlab/mcfud/geo2d"]();
    const {u:_}=Core;

    const canvas = document.getElementById('test');
    const ctx = canvas.getContext('2d');
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;

    //_G.drawCircle(ctx, 400,400, 100);
    //_G.textStyle(ctx,"bold 84px serif","red","blue","left","top");
    //_G.fillText(ctx,"poo Face", 300, 500);
    //_G.drawLine(ctx, 100,200, 500, 700);


    _G.cfgStyle(ctx,"red","blue",4,"round");
    //_G.drawPoints(ctx, [ [600,400], [300,300], [100,600] ]);
    //_G.fillPoints(ctx, [[20, 140], [120, 10], [220, 140]]);
    _G.fillPoints(ctx, [ [600,400], [300,300], [100,600] ]);
    //setTimeout(()=>{ _G.clearCanvas(ctx); },3000);


    ////_G.drawRect(ctx, 700,200, 100,300, 30*3.14/180);
    //_G.fillRect(ctx, 700,200, 100,300, 30*3.14/180);
    //_G.fillCircle(ctx, 400,400, 100);
  }

  window.addEventListener("load",()=>{
    play();
  });

})(this);


