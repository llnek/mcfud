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
// Copyright © 2013-2021, Kenneth Leung. All rights reserved.

;(function(gscope){

  "use strict";

  /**Create the module.
   */
  function _module(Core,_M, _X){

    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    if(!_M) _M=gscope["io/czlab/mcfud/math"]();
    if(!_X) _X=gscope["io/czlab/mcfud/matrix"]();

    const TWO_PI=Math.PI*2;
    const {u:_}=Core;

    /**
     * @module mcfud/gfx
     */

    const _$={
      /**Set HTML5 2d-context's transformation matrix.
       * @memberof module:mcfud/gfx
       * @param {object} ctx html2d-context
       * @param {C2DMatrix} m
       */
      setContextTransform(ctx,m){
        // source:
        //  m[0] m[1] m[2]
        //  m[3] m[4] m[5]
        //  0     0   1
        //
        // destination:
        //  m11  m21  dx
        //  m12  m22  dy
        //  0    0    1
        //  setTransform(m11, m12, m21, m22, dx, dy)
        ctx.transform(m.cells[0],m.cells[3],
                      m.cells[1],m.cells[4],
                      m.cells[2],m.cells[5]);
      },
      /**Html5 Text Style object.
       * @example
       * "14px 'Arial'" "#dddddd" "left" "top"
       * @memberof module:mcfud/gfx
       * @param {string} font
       * @param {string|number} fill
       * @param {string} [align]
       * @param {string} [base]
       * @return {object} style object
       */
      textStyle(font,fill,align,base){
        const x={font: font, fill: fill};
        if(align) x.align=align;
        if(base) x.base=base;
        return x;
      },
      /**Draw the shape onto the html5 canvas.
       * @memberof module:mcfud/gfx
       * @param {object} ctx html5 2d-context
       * @param {object} s a shape
       * @param (...any) args
       */
      drawShape(ctx,s,...args){
        if(s && s.draw)
          s.draw(ctx,...args)
      },
      /**Apply styles to the canvas.
       * @memberof module:mcfud/gfx
       * @param {object} html5 2d-context
       * @param {object} style object
       */
      cfgStyle(ctx,styleObj){
        const {line,stroke} =styleObj;
        if(line){
          if(line.cap)
            ctx.lineCap=line.cap;
          if(line.width)
            ctx.lineWidth=line.width;
        }
        if(stroke){
          if(stroke.style)
            ctx.strokeStyle=stroke.style;
        }
      },
      /**Draw and connect this set of points onto the canvas.
       * @memberof module:mcfud/gfx
       * @param {object} html5 2d-context
       * @param {Vec2[]} points
       * @param {number} [size] n# of points to draw
       */
      drawPoints(ctx,points,size){
        if(size === undefined) size=points.length;
        _.assert(size<=points.length);
        ctx.beginPath();
        for(let p,q,i2,i=0;i<size;++i){
          i2= (i+1)%size;
          p=points[i];
          q=points[i2];
          ctx.moveTo(p[0],p[1]);
          ctx.lineTo(q[0],q[1]);
        }
        ctx.stroke();
      },
      /**Draw a polygonal shape.
       * @memberof module:mcfud/gfx
       * @param {object} html5 2d-context
       * @param {Polygon} poly
       */
      drawShapePoly(ctx,poly){
        return this.drawPoints(ctx,poly.points);
      },
      /**Draw a circle onto the canvas.  If a starting point
       * is provided, draw a line to the center.
       * @memberof module:mcfud/gfx
       * @param {object} html5 2d-context
       * @param {number} x
       * @param {number} y
       * @param {radius} r
       */
      drawCircle(ctx,x,y,radius){
        ctx.beginPath();
        ctx.arc(x,y,radius,0,TWO_PI,true);
        ctx.closePath();
        ctx.stroke();
      },
      /**Draw a circular shape.
       * @memberof module:mcfud/gfx
       * @param {object} html5 2d-context
       * @param {Circle} circle
       */
      drawShapeCircle(ctx,circle){
        return this.drawCircle(ctx,circle.pos[0],circle.pos[1],circle.radius)
      },
      /**Draw a rectangle.
       * @memberof module:mcfud/gfx
       * @param {object} html5 2d=context
       * @param {number} x
       * @param {number} y
       * @param {number} width
       * @param {number} height
       * @param {number} rot
       */
      drawRect(ctx,x,y,width,height,rot){
        let left=x;
        let top= y - height;
        ctx.save();
        ctx.translate(left,top);
        ctx.rotate(rot);
        ctx.strokeRect(0,0,width,height);
        ctx.restore();
      },
      /**Draw a rectangular shape.
       * @memberof module:mcfud/gfx
       * @param {object} html5 2d-context
       * @param {Rect} rect
       */
      drawShapeRect(ctx,rect){
        return this.drawRect(ctx,rect.pos[0],rect.pos[1],
                             rect.width,rect.height,rect.rotation)
      },
      /**Draw a line.
       * @memberof module:mcfud/gfx
       * @param {object} html5 2d-context
       * @param {number} x1
       * @param {number} y1
       * @param {number} x2
       * @param {number} y2
       */
      drawLine(ctx,x1,y1,x2,y2){
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();
        //ctx.closePath();
      },
      /**Draw a 2d line.
       * @memberof module:mcfud/gfx
       * @param {ctx} html5 2d-context
       * @param {Line} line
       */
      drawShapeLine(ctx,line){
        return this.drawLine(ctx,line.p[0],line.p[1],line.q[0],line.q[1])
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"),
                           require("./math"),
                           require("./matrix"))
  }else{
    gscope["io/czlab/mcfud/gfx"]=_module
  }

})(this);

