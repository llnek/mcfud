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
// Copyright © 2020-2021, Kenneth Leung. All rights reserved.

;(function(gscope){
  "use strict";
  /**
   * @private
   * @function
   */
  function _module(Core,_M){
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    if(!_M) _M=gscope["io/czlab/mcfud/math"]();

    const ATAN2= Math.atan2;
    const COS= Math.cos;
    const SIN= Math.sin;
    const TAN= Math.tan;
    const {u:_, is}= Core;
    const _X={
      V3:function(x,y,z){
        return [x||0,y||0,z||0]
      },
      vecDot:function(a,b){
        return a[0]*b[0] + a[1]*b[1] + a[2]+b[2]
      },
      vecCross:function(a,b){
        return this.V3(a.y * b.z - a.z * b.y,
                       a.z * b.x - a.x * b.z,
                       a.x * b.y - a.y * b.x)
      },
      vecLen2:function(a){
        return this.vecDot(a,a)
      },
      vecLen:function(a){
        return Math.sqrt(this.vecLen2(a))
      },
      vecUnit:function(a){
        let d=this.vecLen(a);
        let out=this.V3();
        if(d>EPSILON){
          out[0]=a[0]/d;
          out[1]=a[1]/d;
          out[2]=a[2]/d;
        }
        return out;
      },
      vecSub:function(a,b){
        return is.num(b) ? this.V3(a[0]-b, a[1]-b, a[2]-b)
                         : this.V3(a[0]-b[0], a[1]-b[1], a[2]-b[2])
      },
      vecAdd:function(a,b){
        return is.num(b) ? this.V3(a[0]+b, a[1]+b, a[2]+b)
                         : this.V3(a[0]+b[0], a[1]+b[1], a[2]+b[2])
      },
      vecMul:function(a,b){
        return is.num(b) ? this.V3(a[0]*b, a[1]*b, a[2]*b)
                         : this.V3(a[0]*b[0], a[1]*b[1], a[2]*b[2])
      },
      vecDiv:function(a,b){
        return is.num(b) ? this.V3(a[0]/b, a[1]/b, a[2]/b)
                         : this.V3(a[0]/b[0], a[1]/b[1], a[2]/b[2])
      }
    };
    /**
     * @private
     * @function
     */
    function _arrayEq(a1,a2){
      //2 numeric arrays are equal?
      for(let i=0;i<a1.length;++i){
        if(!_M.fuzzyEq(a1[i],a2[i]))
          return false;
      }
      return true
    }
    /**
     * @private
     * @function
     */
    function _odd(n){ return n%2 !== 0 }
    /**
     * Index where matrix is mapped to 1D array.
     * @private
     * @function
     */
    function _cell(rows,cols,r,c){
      return (c-1) + ((r-1)*cols)
    }
    /**
     * @private
     * @function
     */
    function _matnew(rows,cols,cells){
      return {dim: [rows,cols], cells: cells}
    }
    /**
     * @private
     * @function
     */
    function _new_mat(rows,cols){
      return _matnew(rows,cols, _.fill(new Array(rows*cols),0))
    }
    /**
     * @public
     * @function
     */
    _X.matrix=function([rows,cols],...args){
      let sz= rows*cols;
      return args.length===0 ? _new_mat(rows,cols)
                             : _.assert(sz===args.length) && _matnew(rows,cols,args)
    };
    /**
     * @public
     * @function
     */
    _X.matIdentity=function(sz){
      let out=_.fill(new Array(sz*sz),0);
      for(let i=0;i<sz;++i)
        out[_cell(sz,sz,i+1,i+1)] = 1;
      return _matnew(sz, sz, out)
    };
    /**
     * Matrix with zeroes.
     * @public
     * @function
     */
    _X.matZero=function(sz){
      return _.assert(sz>0) &&
             _matnew(sz,sz,_.fill(new Array(sz*sz),0))
    };
    /**
     * A 2x2 matrix.
     * @public
     * @function
     */
    _X.mat2=function(_11,_12,_21,_22){
      return this.matrix([2,2], _11,_12,_21,_22)
    };
    /**
     * A 3x3 matrix.
     * @public
     * @function
     */
    _X.mat3=function(_11,_12,_13,_21,_22,_23,_31,_32,_33){
      return this.matrix([3,3], _11,_12,_13,_21,_22,_23,_31,_32,_33)
    };
    /**
     * A 4x4 matrix.
     * @public
     * @function
     */
    _X.mat4=function(_11,_12,_13,_14,_21,_22,_23,_24,
                     _31,_32,_33,_34, _41,_42,_43,_44){
      return this.matrix([4,4],
                         _11,_12,_13,_14,_21,_22,_23,_24,
                         _31,_32,_33,_34,_41,_42,_43,_44)
    };
    /**
     * Matrices are equals.
     * @public
     * @function
     */
    _X.matEq=function(a,b){
      return a.dim[0]===b.dim[0] &&
             a.dim[1]===b.dim[1] ? _arrayEq(a.cells,b.cells) : false
    };
    /**
     * Matrices are different.
     * @public
     * @function
     */
    _X.matNeq=function(a,b){ return !this.matEq(a,b) };
    /**
     * Transpose a matrix.
     * @function
     * @public
     */
    _X.matXpose=function(m){
      let [rows,cols]= m.dim;
      let sz=rows*cols;
      let tmp=[];
      for(let i=0;i<sz;++i)
        tmp.push(m.cells[(i/rows) + cols*(i%rows)]);
      return _matnew(cols,rows,tmp)
    };
    /**
     * Inverse a 3x3 matrix - fast.
     * @public
     * @function
     */
    _X.mat3FastInverse=function(m){
      return _.assert(m.dim[0]===3 && m.dim[1]===3) && this.matXpose(m)
    };
    /**
     * Inverse a 4x4 matrx - fast.
     * @public
     * @function
     */
    _X.mat4FastInverse=function(m){
      _assert(m.dim[0]===4&&m.dim[1]===4);
      let out=this.matXpose(m);
      let [rows,cols] =m.dim;
      let p=_.partition(cols,m.cells);
      let m1=p[0],m2=p[1],m3=p[2],m4=p[3];
      let right=m1.slice(0,3);
      let up=m2.slice(0,3);
      let forward=m3.slice(0,3);
      let position=m4.slice(0,3);
      m.cells[_cell(4,4,1,4)]= 0;
      m.cells[_cell(4,4,2,4)]= 0;
      m.cells[_cell(4,4,3,4)]=0;
      m.cells[_cell(4,4,4,1)]= - this.vecDot(right,position);
      m.cells[_cell(4,4,4,2)]= - this.vecDot(up,position);
      m.cells[_cell(4,4,4,3)]= - this.vecDot(forward,position);
      return out;
    };
    /**
     * Scalar multiply a matrix.
     * @public
     * @function
     */
    _X.matScale=function(m,n){
      return _matnew(m.dim[0],m.dim[1],m.cells.map(x => x*n))
    };
    /**
     * Multiply 2 matrices.
     * @public
     * @function
     */
    _X.matMult=function(a,b){
      let [aRows,aCols]=a.dim;
      let [bRows,bCols]=b.dim;
      let aCells=a.cells;
      let bCells=b.cells;
      _.assert(aCols===bRows, "mismatch matrices");
      let out=new Array(aRows*bCols);
      for(let i=0; i<aRows; ++i)
        for(let j=0; j<bCols; ++j){
          out[j+i*bCols]=
            _.range(bRows).reduce((acc,k) => {
              return acc + aCells[k+i*aCols] * bCells[j+ k*bCols] },0);
        }
      return _matnew(aRows,bCols,out)
    };
    /** Determinent.
     *
     * @public
     * @function
     */
    _X.matDet=function(m){
      let [rows,cols]=m.dim;
      let tmp=[];
      for(let c=0; c< cols;++c)
        _.conj(tmp,this.matDet(this.matCut(m,1,c+1)));
      return _.range(cols).reduce((acc,j) => {
        let v=tmp[j];
        return acc + m.cells[j] * (_odd(j) ? -v : v)
      },0)
    };
    /**
     * Matrix determinent.
     * @public
     * @function
     */
    _X.matDet2x2=function(m){
      _.assert(m.cells.length===4);
      return m.cells[0]*m.cells[3] - m.cells[1] * m.cells[2]
    };
    /**
     * Extract a portion of a matrix.
     * Get rid of a row and col.
     * @public
     * @function
     */
    _X.matCut=function(m,row,col){
      let [rows,cols]=m.dim;
      //change to zero indexed
      let _row = row-1;
      let _col= col-1;
      let tmp=[];
      for(let i=0; i<rows; ++i)
        for(let j=0; j<cols; ++j){
          if(!(i === _row || j === _col))
            _.conj(tmp, m.cells[j+i*cols]);
        }
      return _matnew(rows-1,cols-1, tmp)
    };
    /**
     * Matrix minor.
     * @public
     * @function
     */
    _X.matMinor=function(m){
      let [rows,cols]=m.dim;
      let tmp=[];
      for(let i=0; i< rows;++i)
        for(let j=0; j<cols; ++j){
          //mat-cut is 1-indexed
          _.conj(tmp,this.matDet(this.matCut(m,i+1,j+1)));
        }
      return _matnew(rows,cols,tmp)
    };
    /**
     * @public
     * @function
     */
    _X.matMinor2x2=function(m){
      return _.assert(m.cells.length===4) &&
             this.mat2(m.cells[3],m.cells[2],m.cells[1],m.cells[0])
    };
    /**
     * Matrix co-factor.
     * @public
     * @function
     */
    _X.matCofactor=function(m){
      let minor=this.matMinor(m);
      let [rows,cols]=minor.dim;
      let tmp=m.cells.slice();
      for(let len=rows*cols,i=0; i< len; ++i){
        if(_odd(i))
          tmp[i]= -tmp[i];
      }
      return _matnew(rows,cols,tmp)
    };
    /**
     * Matrix adjugate.
     * @public
     * @function
     */
    _X.matAdjugate=function(m){
      return this.matXpose(this.matCofactor(m))
    };
    /**
     * Inverse matrix.
     * @public
     * @function
     */
    _X.matInverse2x2=function(m){
      let [rows,cols]=m.dim;
      _.assert(m.cells.length===4&&rows===2&&cols===2);
      let r,c=m.cells;
      let det= c[0]*c[3] - c[1]*c[2];
      if(_M.fuzzyZero(det))
        r=this.matIdentity(rows);
      else{
        let _det= 1/det;
        r= this.mat2(c[3]*_det, -c[1] * _det,
                     -c[2] * _det, c[0] * _det);
      }
      return r
    };
    /**
     * @function
     * @public
     */
    _X.matInverse=function(m){
      let [rows,cols]=m.dim;
      let d= this.matDet(m);
      return _M.fuzzyZero(d) ? this.matIdentity(rows)
                             : this.matScale(this.matAdjugate(m), 1/d)
    };
    /**
     * Matrix from column major.
     * @function
     * @public
     */
    _X.matFromColMajor=function(m){
      return this.matXpose(m)
    };
    /**
     * Matrix to column major.
     * @public
     * @function
     */
    _X.matToColMajor=function(m){
      return this.matXpose(m)
    };
    /**
     * Translate a 3x3 matrix.
     * @public
     * @function
     */
    _X.mat4Txlate=function(v3){
      let out= _.assert(v3.length===3) && this.matIdentity(4);
      out.cells[_cell(4,4,4,1)]= v3[0];
      out.cells[_cell(4,4,4,2)]= v3[1];
      out.cells[_cell(4,4,4,3)]= v3[2];
      return out
    };
    /**
     * Matrix from matrix-translation.
     *
     * @public
     * @function
     * @param m a 3x3 matrix
     * @returns 4x4 matrix
     */
    _X.matFromMX_3x3=function(m){
      _.assert(m.cells.length===9);
      let [rows,cols]=m.dim;
      let p=_.partition(cols,m.cells);
      let r1=p[0], r2=p[1], r3=p[2];
      return _matnew(rows+1,cols+1, r1.concat(0, r2, 0, r3, 0, [0,0,0,1]))
    };
    /**
     * Get the translation of a matrix.
     * @public
     * @function
     * @param m 4x4 matrix
     * @returns 3d vector
     */
    _X.getTranslation4x4=function(m){
      _.assert(m.cells.length===16);
      let c=m.cells;
      return this.V3(c[_cell(4,4,4,1)], c[_cell(4,4,4,2)], c[_cell(4,4,4,3)])
    };
    /**
     * Matrix from vector-translation.
     * @public
     * @function
     * @param v3 3d vector
     * @returns 4x4 matrix
     */
    _X.matFromVX_V3=function(v3){
      _.assert(v3.length===3);
      let out=this.matIdentity(4);
      let c=out.cells;
      c[_cell(4,4,1,1)]= v3[0];
      c[_cell(4,4,2,2)]= v3[1];
      c[_cell(4,4,3,3)]= v3[2];
      return out
    };
    /**
     * Get scale from matrix-translation.
     * @public
     * @function
     * @param m4 4x4 matrix
     * @returns 3d vector
     */
    _X.getScaleFromMX_4x4=function(m4){
      _.assert(m4.cells.length===16);
      let [rows,cols]=m4.dim;
      let p= _.partition(cols,m4.cells);
      let r1=p[0],r2=p[1],r3=p[2];
      return this.V3(r1[0], r2[1], r3[2])
    };
    /**
     * Multiply matrix and  vector.
     * @public
     * @function
     * @returns vector
     */
    _X.matVMult=function(m,v){
      let cols=m.dim[1];
      let rows=v.length;
      _.assert(cols===rows);
      let r= this.matMult(m, _matnew(rows, 1, v));
      let c=r.cells;
      r.cells=null;
      return c
    };
    /**
     * Rotate a 2x2 matrix, counter-clockwise
     * @function
     * @public
     */
    _X.rotation2x2=function(rot){
      return this.mat2(COS(rot),-SIN(rot),SIN(rot),COS(rot))
    };
    /**
     * 3D rotation.
     * @public
     * @function
     * @returns 4x4 matrix
     */
    _X.yawPitchRoll=function(yaw,pitch,roll){
      return this.mat4(COS(roll) * COS(yaw) +
                       SIN(roll)*SIN(pitch)*SIN(yaw),
                       SIN(roll)*COS(pitch),
                       COS(roll)* -SIN(yaw) +
                       SIN(roll)*SIN(pitch)*COS(yaw),
                       0,
                       -SIN(roll)*COS(yaw) +
                       COS(roll)*SIN(pitch)*SIN(yaw),
                       COS(roll)*COS(pitch),
                       SIN(roll)*SIN(yaw) +
                       COS(roll)*SIN(pitch)*COS(yaw),
                       0,
                       COS(pitch)*SIN(yaw),
                       -SIN(pitch),
                       COS(pitch)*COS(yaw),
                       0,
                       0,0,0,1)
    };
    /**
     * Rotate on x-axis in 4D.
     * @public
     * @function
     * @returns 4x4 matrix
     */
    _X.xRotation=function(rad){
      return this.mat4(1,0,0,0,
                       0,COS(rad),SIN(rad),0,
                       0,-SIN(rad),COS(rad),0,
                       0,0,0,1)
    };
    /**
     * Rotate on x-axis in 3D.
     * @public
     * @function
     * @returns 3x3 matrix
     */
    _X.xRotation3x3=function(rad){
      return this.mat3(1,0,0,
                       0, COS(rad), SIN(rad),
                       0, -SIN(rad), COS(rad))
    };
    /**
     * Rotate on y-axis in 4D.
     * @public
     * @function
     * @returns 4x4 matrix
     */
    _X.yRotation=function(rad){
      return this.mat4(COS(rad),0,-SIN(rad),0,
                       0,1, 0, 0,
                       SIN(rad), 0, COS(rad), 0,
                       0,0,0,1)
    };
    /**
     * Rotate on y-axis in 3D.
     * @public
     * @function
     * @returns 3x3 matrix
     */
    _X.yRotation3x3=function(rad){
      return this.mat3(COS(rad), 0, -SIN(rad),
                       0, 1, 0,
                       SIN(rad), 0, COS(rad))
    };
    /**
     * Rotate in z-axis in 4D.
     * @public
     * @function
     * @returns 4x4 matrix
     */
    _X.zRotation=function(rad){
      return this.mat4(COS(rad), SIN(rad), 0, 0,
                       -SIN(rad),COS(rad), 0, 0,
                       0, 0, 1, 0,
                       0, 0, 0, 1)
    };
    /**
     * Rotate in z-axis in 3D.
     * @public
     * @function
     * @returns 3x3 matrix
     */
    _X.zRotation3x3=function(rad){
      return this.mat3(COS(rad),SIN(rad), 0,
                       -SIN(rad),COS(rad), 0,
                       0, 0, 1)
    };
    /**
     * Rotation in 4D.
     * @public
     * @function
     * @returns 4x4 matrix
     */
    _X.mat4Rotation=function(pitch,yaw,roll){
      return this.matMult(
               this.matMult(this.zRotation(roll),
                            this.xRotation(pitch)), this.yRotation(yaw))
    };
    /**
     * Rotation in 3D.
     * @public
     * @function
     * @returns 3x3 matrix
     */
    _X.mat3Rotation=function(pitch,yaw,roll){
      return this.matMult(
               this.matMult(this.zRotation3x3(roll),
                            this.xRotation3x3(pitch)),this.yRotation3x3(yaw))
    };
    /**
     * Orthogonal of matrix.
     * @public
     * @function
     * @param m 4x4 matrix
     * @returns 4x4 matrix
     */
    _X.matOrthogonal4x4=function(m){
      _.assert(m.cells.length===16);
      let [rows,cols]=m.dim;
      let p= _.partition(cols,m.cells);
      let r1=p[0], r2=p[1], r3=p[2], r4=p[3];
      let xAxis=r1.slice(0,3);
      let yAxis=r2.slice(0,3);
      let zAxis= this.vecCross(xAxis,yAxis);
      let _x= this.vecCross(yAxis,zAxis);
      let _y= this.vecCross(zAxis,xAxis);
      let _z= this.vecCross(xAxis,yAxis);
      return this.mat4(_x[0],_x[1],_x[2],r1[3],
                       _y[0],_y[1],_y[2],r2[3],
                       _z[0],_z[1],_z[2],r3[3],
                       r4[0],r4[1],r4[2],r4[3])
    };
    /**
     * @public
     * @function
     * @param m 3x3 matrix
     * @returns 3x3 matrix
     */
    _X.matOrthogonal3x3=function(m){
      _.assert(m.cells.length===9);
      let [rows,cols]=m.dim;
      let p= _.partition(cols,m.cells);
      let r1=p[0], r2=p[1], r3=p[2];
      let xAxis=r1;//this.V3(r1[0],r1[1],r1[2]);
      let yAxis=r2;//this.V3(r2[0],r2[1],r2[2]);
      let zAxis= this.vecCross(xAxis,yAxis);
      let _x= this.vecCross(yAxis,zAxis);
      let _y= this.vecCross(zAxis,xAxis);
      let _z= this.vecCross(xAxis,yAxis);
      return this.mat3(_x[0],_x[1],_x[2],
                       _y[0],_y[1],_y[2],
                       _z[0],_z[1],_z[2])
    };
    /**
     * Rotate on this axis by this angle in 4D.
     * @public
     * @function
     * @returns 4x4 matrix
     */
    _X.mat4AxisAngle=function(axis ,rad){
      _.assert(axis.length===3);
      let x=axis[0],y=axis[1],z=axis[2];
      let d= this.vecLen(axis);
      let c=COS(rad);
      let s=SIN(rad);
      let t= 1-c;
      if(!_M.fuzzyEq(d,1)){
        let ilen= 1/d;
        x *= ilen;
        y *= ilen;
        z *= ilen;
      }
      return this.mat4(c+t*x*x,
                       t*x*y+s*z,
                       t*x*z-s*y,
                       0,
                       t*x*y-s*z,
                       c + t*y*y,
                       t*y*z+s*x,
                       0,
                       t*x*z+s*y,
                       t*y*z-s*x,
                       c + t*z*z,
                       0,
                       0,0,0,1)
    };
    /**
     * Rotate on this axis by this angle in 3D.
     * @public
     * @function
     * @returns 3x3 matrix
     */
    _X.axisAngle3x3=function(axis,rad){
      _.assert(axis.length===3);
      let x=axis[0],y=axis[1],z=axis[2];
      let c=COS(rad);
      let s=SIN(rad);
      let t= 1-c;
      let d= this.vecLen(axis);
      if(!_M.fuzzyEq(d,1)){
        let ilen=1/d;
        x *= ilen;
        y *= ilen;
        z *= ilen;
      }
      return this.mat3(c + t*x*x,
                       t*x*y + s*z,
                       t*x*z - s*y,
                       t*x*y - s*z,
                       c + t*y*y,
                       t*y*z + s*x,
                       t*x*z + s*y,
                       t*y*z - s*x,
                       c + t*z*z)
    };
    /**
     * Multiply vector and 4x4 matrix.
     * @function
     * @public
     * @returns 3d vector
     */
    _X.matMultV3M4=function(v3,m4){
      _.assert(v3.length===3&&m4.cells.length===16);
      let x=v3[0],y=v3[1],z=v3[2];
      let p=_.partition(4,m4.cells);
      let r1=p[0],r2=p[1],r3=p[2],r4=p[3];
      return this.V3(x*r1[0] + y*r2[0] + z*r3[0] + 1*r4[0],
                     x*r1[1] + y*r2[1] + z*r3[1] + 1*r4[1],
                     x*r1[2] + y*r2[2] + z*r3[2] + 1*r4[2])
    };
    /**
     * Multiply vector and 4x4 matrix.
     * @public
     * @function
     * @returns 3d vector
     */
    _X.mat3MultVX_4x4=function(v3,m4){
      _.assert(v3.length===3&&m4.cells.length===16);
      let x=v3[0],y=v3[1],z=v3[2];
      let p=_.partition(4,m4.cells);
      let r1=p[0],r2=p[1],r3=p[2],r4=p[3];
      return [x*r1[0] + y*r2[0] + z*r3[0] + 0*r4[0],
              x*r1[1] + y*r2[1] + z*r3[1] + 0*r4[1],
              x*r1[2] + y*r2[2] + z*r3[2] + 0*r4[2]]
    };
    /**
     * Multiply vector and 3x3 matrix.
     * * @public
     * @function
     * @returns 3d vector
     */
    _X.mat3MultVX_3x3=function(v3,m3){
      _.assert(v3.length===3&&m3.cells.length===9);
      let x=v3[0],y=v3[1],z=v3[2];
      let p=_.partition(3,m3.cells);
      let r1=p[0],r2=p[1],r3=p[2];
      return [this.vecDot(v3, this.V3(r1[0],r2[0],r3[0])),
              this.vecDot(v3, this.V3(r1[1],r2[1],r3[1])),
              this.vecDot(v3, this.V3(r1[2],r2[2],r3[2]))]
    };
    /**
     * Transform a 4x4 matrix.
     * @public
     * @function
     * @param eulerRotation 3d vector
     * @returns 4x4 matrix
     */
    _X.mat4TxformViaRotation=function(scale,eulerRotation,translate){
      _.assert(eulerRotation.length===3);
      let x=eulerRotation[0];
      let y=eulerRotation[1];
      let z=eulerRotation[2];
      return this.matMult(
        this.matMult(this.matFromVX(scale),
                     this.mat4Rotation(x,y,z)),
        this.mat4Txlate(translate))
    };
    /**
     * @public
     * @function
     * @returns 4x4 matrix
     */
    _X.mat4TxformViaAxisAngle=function(scale,rotationAxis, rotationAngle,translate){
      return this.matMult(
        this.matMult(this.matFromVX(scale),
                     this.mat4AxisAngle(rotationAxis,
                                        rotationAngle)),
        this.mat4Txlate(translate))
    };
    /**
     * View of a 4D matrix.
     * @public
     * @function
     */
    _X.mat4LookAt=function(pos,target,up){
      let fwd= this.vecUnit(this.vecSub(target,pos));
      let right= this.vecUnit(this.vecCross(up,fwd));
      let newUp= this.vecCross(fwd,right);
      return this.mat4(right[0],newUp[0],fwd[0],0,
                       right[1],newUp[1],fwd[1],0,
                       right[2],newUp[2],fwd[2],0,
                       - this.vecDot(right,pos),
                       - this.vecDot(newUp,pos),
                       - this.vecDot(fwd,pos), 1)
    };
    /**
     * 4D projection.
     * https://msdn.microsoft.com/en-us/library/windows/desktop/bb147302(v=vs.85).aspx
     * @public
     * @function
     * @returns 4x4 matrix
     */
    _X.mat4Proj=function(fov,aspect,zNear,zFar){
      let tanHalfFov= TAN(fov*0.5);
      let fovY=1/tanHalfFov;//cot(fov/2)
      let fovX=fovY/aspect; //cot(fov/2) / aspect
      let r33= zFar / (zFar - zNear);// far/range
      let ret= this.matIdentity(4);
      ret.cells[_cell(4,4,1,1)]= fovX;
      ret.cells[_cell(4,4,2,2)]=fovY;
      ret.cells[_cell(4,4,3,3)]= r33;
      ret.cells[_cell(4,4,3,4)]= 1;
      ret.cells[_cell(4,4,4,3)]= -zNear*r33; //-near * (far / range)
      ret.cells[_cell(4,4,4,4)]=0;
      return ret
    };
    /**
     * Orthogonal to this 4x4 matrix.
     * Derived following: http://www.songho.ca/opengl/gl_projectionmatrix.html
     * Above was wrong, it was OpenGL style, our matrices are DX style
     * Correct impl:
     * https://msdn.microsoft.com/en-us/library/windows/desktop/bb205347(v=vs.85).aspx
     * @public
     * @function
     * @returns 4x4 matrix
     */
    _X.mat4Ortho=function(left,right,bottom,top,zNear,zFar){
      let _11= (right-left)/2;
      let _22= (top-bottom)/2;
      let _33= (zFar-zNear)/1;
      let _41= (left+right)/(left-right);
      let _42= (top+bottom)/(bottom-top);
      let _43= zNear/(zNear-zFar);
      return this.mat4(_11,0,0,0,
                       0,_22,0, 0,
                       0, 0, _33, 0,
                       _41, _42, _43, 1)
    };
    /**
     * Decompose matrix.
     * @public
     * @function
     * @param rot1 3x3 matrix
     * @returns 3d vector
     */
    _X.matDecompose3x3=function(rot1){
      let rot= this.matXpose(rot1);
      let p= _.partition(3, rot);
      let r1=p[0],r2=p[1],r3=p[2];
      let sy= Math.sqrt(r1[0]*r1[0] + r2[0]*r2[0]);
      let singular= sy< 1e-6;
      return !singular ? this.V3(ATAN2(r3[1],r3[2]),
                                 ATAN2(-r3[0],sy),
                                 ATAN2(r2[0],r1[0]))
                       : this.V3(ATAN2(-r2[2],r2[1]), ATAN2(-r3[0],sy), 0)
    };

    return _X;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"),
                           require("./math"))
  }else{
    gscope["io/czlab/mcfud/matrix"]=_module
  }

})(this);


