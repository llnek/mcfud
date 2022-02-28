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
  function _module(Core,_V, _M, _X){

    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    if(!_V) _V=gscope["io/czlab/mcfud/vec2"]();
    if(!_M) _M=gscope["io/czlab/mcfud/math"]();
    if(!_X) _X=gscope["io/czlab/mcfud/matrix"]();

    const TWO_PI=Math.PI*2;
    const {u:_}=Core;

    /**
     * @module mcfud/gfx
     */

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const _$={
      /**Set HTML5 2d-context's transformation matrix.
       * @memberof module:mcfud/gfx
       * @param {CanvasRenderingContext2D} ctx html2d-context
       * @param {C2DMatrix} m
       * @param {boolean} reset [false]
       * @return {CanvasRenderingContext2D} ctx
       */
      setContextTransform(ctx,m,reset=false){
        // source:
        //  m[0] m[1] m[2]
        //  m[3] m[4] m[5]
        //  0     0   1
        // destination:
        //  m11  m21  dx
        //  m12  m22  dy
        //  0    0    1
        //setTransform(m11, m12, m21, m22, dx, dy)
        ctx[reset?"setTransform":"transform"](m.cells[0],m.cells[3],
                                              m.cells[1],m.cells[4],
                                              m.cells[2],m.cells[5]);
        return ctx;
      },
      /**Html5 Text Style object.
       * @example
       * "14px 'Arial'" "#dddddd" "left" "top"
       * @memberof module:mcfud/gfx
       * @param {CanvasRenderingContext2D} ctx htm5 2d-context
       * @param {string} font
       * @param {string|number} stroke
       * @param {string|number} fill
       * @param {string} align
       * @param {string} base
       * @return {CanvasRenderingContext2D} ctx
       */
      textStyle(ctx,font,stroke,fill,align,base){
        if(font)
          ctx.font=font;
        if(fill)
          ctx.fillStyle=fill;
        if(align)
          ctx.textAlign=align;
        if(base)
          ctx.textBaseline=base;
        if(stroke)
          ctx.strokeStyle=stroke;
        return ctx;
      },
      /**Draw the shape onto the html5 canvas.
       * @memberof module:mcfud/gfx
       * @param {CanvasRenderingContext2D} ctx html5 2d-context
       * @param {object} s a shape
       * @param {...any} args
       * @return {CanvasRenderingContext2D} ctx
       */
      drawShape(ctx,s, ...args){
        if(s && s.draw) s.draw(ctx, ...args);
        return ctx;
      },
      /**Apply styles to the canvas.
       * @memberof module:mcfud/gfx
       * @param {CanvasRenderingContext2D} ctx html5 2d-context
       * @param {string|number} stroke
       * @param {string|number} fill
       * @param {number} lineWidth
       * @param {string} lineCap
       * @return {CanvasRenderingContext2D} ctx
       */
      cfgStyle(ctx,stroke,fill,lineWidth,lineCap){
        if(fill)
          ctx.fillStyle=fill;
        if(stroke)
          ctx.strokeStyle=stroke;
        if(lineCap)
          ctx.lineCap=lineCap;
        if(lineWidth)
          ctx.lineWidth = lineWidth;
        return ctx;
      },
      /**Draw and connect this set of points onto the canvas.
       * @memberof module:mcfud/gfx
       * @param {CanvasRenderingContext2D} ctx html5 2d-context
       * @param {Vec2[]} points
       * @return {CanvasRenderingContext2D} ctx
       */
      drawPoints(ctx,points){
        ctx.beginPath();
        for(let p,q,i2,z=points.length,i=0;i<z;++i){
          i2= (i+1)%z;
          p=points[i];
          q=points[i2];
          ctx.moveTo(_V.gx(p), _V.gy(p));
          ctx.lineTo(_V.gx(q), _V.gy(q));
        }
        ctx.closePath();
        ctx.stroke();
        return ctx;
      },
      /**Fill and connect this set of points onto the canvas.
       * @memberof module:mcfud/gfx
       * @param {CanvasRenderingContext2D} ctx html5 2d-context
       * @param {Vec2[]} points
       * @return {CanvasRenderingContext2D} ctx
       */
      fillPoints(ctx,points){
        ctx.beginPath();
        for(let p,q,i2,z=points.length,i=0;i<z;++i){
          i2= (i+1)%z;
          p=points[i];
          q=points[i2];
          if(i==0)
            ctx.moveTo(_V.gx(p), _V.gy(p));
          else
            ctx.lineTo(_V.gx(p), _V.gy(p));
          ctx.lineTo(_V.gx(q), _V.gy(q));
        }
        ctx.closePath();
        ctx.fill();
        return ctx;
      },
      /**Draw a circle onto the canvas.  If a starting point
       * is provided, draw a line to the center.
       * @memberof module:mcfud/gfx
       * @param {CanvasRenderingContext2D} ctx html5 2d-context
       * @param {number} x
       * @param {number} y
       * @param {radius} r
       * @return {CanvasRenderingContext2D} ctx
       */
      drawCircle(ctx,x,y,radius){
        ctx.beginPath();
        ctx.arc(x,y,radius,0,TWO_PI,true);
        ctx.closePath();
        ctx.stroke();
        return ctx;
      },
      /**Fill a circle onto the canvas.  If a starting point
       * is provided, draw a line to the center.
       * @memberof module:mcfud/gfx
       * @param {CanvasRenderingContext2D} ctx html5 2d-context
       * @param {number} x
       * @param {number} y
       * @param {radius} r
       * @return {CanvasRenderingContext2D} ctx
       */
      fillCircle(ctx,x,y,radius){
        ctx.beginPath();
        ctx.arc(x,y,radius,0,TWO_PI,true);
        ctx.closePath();
        ctx.fill();
        return ctx;
      },
      /**Draw a rectangle.
       * @memberof module:mcfud/gfx
       * @param {CanvasRenderingContext2D} ctx html5 2d=context
       * @param {number} x
       * @param {number} y
       * @param {number} width
       * @param {number} height
       * @param {number} rot
       * @param {number} cx [0]
       * @param {number} cy [0]
       * @return {CanvasRenderingContext2D} ctx
       */
      drawRect(ctx,x,y,width,height,rot=0,cx=0,cy=0){
        ctx.save();
        ctx.translate(cx,cy);
        ctx.rotate(rot);
        ctx.translate(-cx,-cy);
        ctx.strokeRect(x,y,width,height);
        ctx.restore();
        return ctx;
      },
      /**Fill a rectangle.
       * @memberof module:mcfud/gfx
       * @param {CanvasRenderingContext2D} ctx html5 2d=context
       * @param {number} x
       * @param {number} y
       * @param {number} width
       * @param {number} height
       * @param {number} rot
       * @param {number} cx [0]
       * @param {number} cy [0]
       * @return {CanvasRenderingContext2D} ctx
       */
      fillRect(ctx,x,y,width,height,rot=0,cx=0,cy=0){
        ctx.save();
        ctx.translate(cx,cy);
        ctx.rotate(rot);
        ctx.translate(-cx,-cy);
        ctx.fillRect(x,y,width,height);
        ctx.restore();
        return ctx;
      },
      /**Draw a line.
       * @memberof module:mcfud/gfx
       * @param {CanvasRenderingContext2D} ctx html5 2d-context
       * @param {number} x1
       * @param {number} y1
       * @param {number} x2
       * @param {number} y2
       * @return {CanvasRenderingContext2D} ctx
       */
      drawLine(ctx,x1,y1,x2,y2){
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();
        return ctx;
      },
      /**Write text.
       * @memberof module:mcfud/gfx
       * @param {CanvasRenderingContext2D} ctx html5 2d-context
       * @param {string} msg
       * @param {number} x
       * @param {number} y
       * @return {CanvasRenderingContext2D} ctx
       */
      drawText(ctx,msg,x,y){
        ctx.strokeText(msg, x,y);
        return ctx;
      },
      /**Fill text.
       * @memberof module:mcfud/gfx
       * @param {CanvasRenderingContext2D} ctx html5 2d-context
       * @param {string} msg
       * @param {number} x
       * @param {number} y
       * @return {CanvasRenderingContext2D} ctx
       */
      fillText(ctx,msg,x,y){
        ctx.fillText(msg, x,y);
        return ctx;
      },
      /**Clear the canvas.
       * @memberof module:mcfud/gfx
       * @param {CanvasRenderingContext2D} ctx html5 2d-context
       * @return {CanvasRenderingContext2D} ctx
       */
      clearCanvas(ctx){
        return this.clearRect(ctx, 0,0,ctx.canvas.width, ctx.canvas.height);
      },
      /**Fill the canvas.
       * @memberof module:mcfud/gfx
       * @param {CanvasRenderingContext2D} ctx html5 2d-context
       * @return {CanvasRenderingContext2D} ctx
       */
      fillCanvas(ctx){
        return this.fillRect(ctx, 0,0,ctx.canvas.width, ctx.canvas.height);
      },
      /**Clear a rectangular region.
       * @memberof module:mcfud/gfx
       * @param {CanvasRenderingContext2D} ctx html5 2d-context
       * @param {number} x
       * @param {number} y
       * @param {number} width
       * @param {number} height
       * @return {CanvasRenderingContext2D} ctx
       */
      clearRect(ctx,x,y,width,height){
        ctx.clearRect(x,y,width,height);
        return ctx;
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module == "object" && module.exports){
    module.exports=_module(require("./core"),
                           require("./vec2"),
                           require("./math"),
                           require("./matrix"))
  }else{
    gscope["io/czlab/mcfud/gfx"]=_module
  }

})(this);

