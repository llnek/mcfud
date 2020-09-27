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
// Copyright © 2020, Kenneth Leung. All rights reserved.

;(function(global){
  //export--------------------------------------------------------------------
  if(typeof module === "object" &&
     module && typeof module.exports === "object"){
    global=module.exports;
  }
  else if(typeof exports === "object" && exports){
    global=exports;
  }
  let _singleton=null;
  global["io.czlab.mcfud.gfx"]=function(){
    if(_singleton){ return _singleton }
    const Core=global["io.czlab.mcfud.core"]();
    const _M=global["io.czlab.mcfud.math"]();
    const _=Core.u;
    const _G={};
    const TWO_PI=Math.PI*2;
    /**
     * Html5 Text Style object.
     * @public
     * @function
     */
    _G.textStyle=function(font,fill,align,base){
      //"14px 'Arial'" "#dddddd" "left" "top"
      return {font: font, fill: fill, align: align, base: base}
    };
    /**
     * Draw the shape onto the html5 canvas.
     * @public
     * @function
     */
    _G.drawShape=function(ctx,s,...args){
      if(s.draw)
        s.draw(ctx,...args)
    };
    /**
     * Apply styles to the canvas.
     * @public
     * @function
     */
    _G.cfgStyle=function(ctx,styleObj){
      if(styleObj){
        let line=styleObj.line;
        let stroke=styleObj.stroke;
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
      }
    };
    /**
     * Draw and connect this set of points onto the canvas.
     * @public
     * @function
     */
    _G.drawPoints=function(ctx,points,size){
      if(size === undefined) size=points.length;
      ctx.beginPath();
      for(let i=0;i<size;++i){
        let i2= (i+1)%size;
        let p=points[i];
        let q=points[i2];
        ctx.moveTo(p[0],p[1]);
        ctx.lineTo(q[0],q[1]);
      }
      ctx.stroke();
    };
    /**
     * @public
     * @function
     */
    _G.drawShapePoly=function(ctx,poly){
      return this.drawPoints(ctx,poly.points);
    };
    /**
     * Draw a circle onto the canvas.  If a starting point
     * is provided, draw a line to the center.
     * @public
     * @function
     */
    _G.drawCircle=function(ctx,x,y,radius){
      ctx.beginPath();
      ctx.arc(x,y,radius,0,TWO_PI,true);
      ctx.closePath();
      ctx.stroke();
    };
    /**
     * @public
     * @function
     */
    _G.drawShapeCircle=function(ctx,circle){
      this.drawCircle(ctx,circle.pos[0],circle.pos[1],circle.radius);
    };
    /**
     * @public
     * @function
     */
    _G.drawRect=function(ctx,x,y,width,height,rot){
      let left=x;
      let top= y - height;
      ctx.save();
      ctx.translate(left,top);
      ctx.rotate(rot);
      ctx.strokeRect(0,0,width,height);
      ctx.restore();
    };
    /**
     * @public
     * @function
     */
    _G.drawShapeRect=function(ctx,rect){
      return this.drawRet(ctx,rect.pos[0],rect.pos[1],
                          rect.width,rect.height,rect.rotation);
    };
    /**
     * @public
     * @function
     */
    _G.drawLine=function(ctx,x1,y1,x2,y2){
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.stroke();
      //ctx.closePath();
    };
    /**
     * @public
     * @function
     */
    _G.drawShapeLine=function(ctx,line){
      return this.drawLine(ctx,line.p[0],line.p[1],line.q[0],line.q[1]);
    };
    /**
     * @public
     * @class
     */
    class TXMatrix2d{
      constructor(source){
        if(source){
          this.m = [];
          this.clone(source);
        }else{
          this.m = [1,0,0,0,1,0];
        }
      }
      identity(){
        let m = this.m;
        m[0] = 1; m[1] = 0; m[2] = 0;
        m[3] = 0; m[4] = 1; m[5] = 0;
        return this;
      }
      clone(matrix){
        let d = this.m, s = matrix.m;
        d[0]=s[0]; d[1]=s[1]; d[2] = s[2];
        d[3]=s[3]; d[4]=s[4]; d[5] = s[5];
        return this;
      }
      multiply(matrix){
        let a = this.m, b = matrix.m;
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
      rotate(radians){
        if(radians === 0){ return this; }
        let cos = Math.cos(radians),
            sin = Math.sin(radians),
            m = this.m;

        let m11 = m[0]*cos  + m[1]*sin;
        let m12 = m[0]*-sin + m[1]*cos;
        let m21 = m[3]*cos  + m[4]*sin;
        let m22 = m[3]*-sin + m[4]*cos;

        m[0] = m11; m[1] = m12; // m[2] == m[2]
        m[3] = m21; m[4] = m22; // m[5] == m[5]
        return this;
      }
      rotateDeg(degrees){
        if(degrees === 0){ return this }
        return this.rotate(Math.PI * degrees / 180);
      }
      scale(sx,sy){
        let m = this.m;
        if(sy === undefined){ sy = sx; }
        m[0] *= sx;
        m[1] *= sy;
        m[3] *= sx;
        m[4] *= sy;
        return this;
      }
      translate(tx,ty){
        let m = this.m;
        m[2] += m[0]*tx + m[1]*ty;
        m[5] += m[3]*tx + m[4]*ty;
        return this;
      }
      transform(x,y){
        return [ x * this.m[0] + y * this.m[1] + this.m[2],
                 x * this.m[3] + y * this.m[4] + this.m[5] ];
      }
      transformPoint(obj){
        let x = obj.x, y = obj.y;
        obj.x = x * this.m[0] + y * this.m[1] + this.m[2];
        obj.y = x * this.m[3] + y * this.m[4] + this.m[5];
        return obj;
      }
      transformArray(inArr,outArr){
        let x = inArr[0], y = inArr[1];
        outArr[0] = x * this.m[0] + y * this.m[1] + this.m[2];
        outArr[1] = x * this.m[3] + y * this.m[4] + this.m[5];
        return outArr;
      }
      transformX(x,y){
        return x * this.m[0] + y * this.m[1] + this.m[2];
      }
      transformY(x,y){
        return x * this.m[3] + y * this.m[4] + this.m[5];
      }
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

    return (_singleton= _.inject(_G, {TXMatrix2d: TXMatrix2d}))
  };

})(this);

