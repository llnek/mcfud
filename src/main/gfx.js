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
  /**
   * @private
   * @function
   */
  function _module(Core,_M){
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    if(!_M) _M=gscope["io/czlab/mcfud/math"]();

    const TWO_PI=Math.PI*2;
    const {u:_}=Core;

    /** @module mcfud/gfx */

    /**
     * @memberof module:mcfud/gfx
     * @class
     * @property {number[]} m
     */
    class TXMatrix2D{
      /**
       * @param {Vec2[]} source
       */
      constructor(source){
        if(source){
          this.m = [];
          this.clone(source);
        }else{
          this.m = [1,0,0,0,1,0];
        }
      }
      /**Toggle this into an `Identity` matrix
       * @return {TXMatrix2D} self
       */
      identity(){
        let m = this.m;
        m[0] = 1; m[1] = 0; m[2] = 0;
        m[3] = 0; m[4] = 1; m[5] = 0;
        return this;
      }
      /**Deep clone a matrix.
       * @param {TXMatrix2D}
       * @return {TXMatrix2D} self
       */
      clone(matrix){
        let d = this.m,
            s = matrix.m;
        d[0]=s[0]; d[1]=s[1]; d[2] = s[2];
        d[3]=s[3]; d[4]=s[4]; d[5] = s[5];
        return this;
      }
      /**Multiply by this matrix
       * @param {TXMatrix2D} matrix
       * @return {TXMatrix2D} self
       */
      multiply(matrix){
        let a = this.m,
            b = matrix.m;
        let m11 = a[0]*b[0] + a[1]*b[3];
        let m12 = a[0]*b[1] + a[1]*b[4];
        let m13 = a[0]*b[2] + a[1]*b[5] + a[2];
        let m21 = a[3]*b[0] + a[4]*b[3];
        let m22 = a[3]*b[1] + a[4]*b[4];
        let m23 = a[3]*b[2] + a[4]*b[5] + a[5];

        a[0]=m11; a[1]=m12; a[2] = m13;
        a[3]=m21; a[4]=m22; a[5] = m23;
        return this;
      }
      /**Apply rotation.
       * @param {number} radians
       * @return {TXMatrix2D} self
       */
      rotate(radians){
        if(!_.feq0(radians)){
          let m=this.m,
              cos = Math.cos(radians),
              sin = Math.sin(radians);
          let m11 = m[0]*cos  + m[1]*sin;
          let m12 = -m[0]*sin + m[1]*cos;
          let m21 = m[3]*cos  + m[4]*sin;
          let m22 = -m[3]*sin + m[4]*cos;
          m[0] = m11; m[1] = m12;
          m[3] = m21; m[4] = m22;
        }
        return this;
      }
      /**Apply rotation (in degrees).
       * @param {number} degrees
       * @return {TXMatrix2D} self
       */
      rotateDeg(degrees){
        return _.feq0(degrees)? this: this.rotate(Math.PI * degrees / 180)
      }
      /**Apply scaling.
       * @param {number} sx
       * @param {number} sy
       * @return {TXMatrix2D} self
       */
      scale(sx,sy){
        let m = this.m;
        if(sy===undefined){ sy=sx }
        m[0] *= sx;
        m[1] *= sy;
        m[3] *= sx;
        m[4] *= sy;
        return this;
      }
      /**Apply translation.
       * @param {number} tx
       * @param {number} ty
       * @return {TXMatrix2D} self
       */
      translate(tx,ty){
        let m = this.m;
        m[2] += m[0]*tx + m[1]*ty;
        m[5] += m[3]*tx + m[4]*ty;
        return this;
      }
      /**Transform this point.
       * @param {number} x
       * @param {number} y
       * @return {Vec2}
       */
      transform(x,y){
        return [ x * this.m[0] + y * this.m[1] + this.m[2],
                 x * this.m[3] + y * this.m[4] + this.m[5] ];
      }
      /**@see {@link module:mcfud/gfx.TXMatrix2D#transform}
       * @param {object} obj
       * @return {object} obj
       */
      transformPoint(obj){
        let [x,y]= this.transform(obj.x,obj.y);
        obj.x = x;
        obj.y = y;
        return obj;
      }
      /**@see {@link module:mcfud/gfx.TXMatrix2D#transform}
       * @param {Vec2} inArr
       * @return {Vec2}
       */
      transformArray(inArr){
        return this.transform(inArr[0],inArr[1])
      }
      /**Set HTML5 2d-context's transformation matrix.
       * @param {object} html5 2d-context
       */
      setContextTransform(ctx){
        let m = this.m;
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
        ctx.transform(m[0],m[3],m[1],m[4],m[2],m[5]);
      }
    }


    const _$={
      TXMatrix2D:TXMatrix2D,
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
        let x={font: font, fill: fill};
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
       * @return {}
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
        this.drawCircle(ctx,circle.pos[0],circle.pos[1],circle.radius);
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
        return this.drawLine(ctx,line.p[0],line.p[1],line.q[0],line.q[1]);
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"),
                           require("./math"))
  }else{
    gscope["io/czlab/mcfud/gfx"]=_module
  }

})(this);

