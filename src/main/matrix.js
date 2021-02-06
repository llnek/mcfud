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
  function _module(Core){
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    const ATAN2= Math.atan2;
    const COS= Math.cos;
    const SIN= Math.sin;
    const TAN= Math.tan;
    const MFL=Math.floor;
    const {u:_, is}= Core;
    /**
     * @private
     * @function
     */
    function _arrayEq(a1,a2){
      //2 numeric arrays are equal?
      for(let i=0;i<a1.length;++i){
        if(!_.feq(a1[i],a2[i]))
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
    /**Cells are provided.
     * @private
     * @function
     */
    function _matnew(rows,cols,cells){
      return {dim: [rows,cols], cells: cells}
    }
    /**Cells are all zeroes.
     * @private
     * @function
     */
    function _new_mat(rows,cols){
      return _matnew(rows,cols, _.fill(rows*cols,0))
    }

    /** @module matrix */
    const _$={
      V4(x=0,y=0,z=0,K=0){ return [x,y,z,K] },
      V3(x=0,y=0,z=0){ return [x,y,z] },
      /**
       * Dot product of 3D vectors.
       * @function
       * @param {number[]} a
       * @param {number[]} b
       * @return {number}
       * @memberof module:matrix
      */
      dot(a,b){
        return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]
      },
      /**
       * Cross product of 3D vectors.
       * @memberof module:matrix
       * @function
       * @param {number[]} a
       * @param {number[]} b
       * @return {number[]}
       */
      cross(a,b){
        return this.V3(a[1] * b[2] - a[2] * b[1],
                       a[2] * b[0] - a[0] * b[2],
                       a[0] * b[1] - a[1] * b[0])
      },
      /**
       * The length of this vector, squared.
       * @memberof module:matrix
       * @function
       * @param {number[]} a
       * @return {number}
       */
      len2(a){ return this.dot(a,a) },
      /**
       * The length of this vector.
       * @memberof module:matrix
       * @function
       * @param {number[]} a
       * @return {number}
       */
      len(a){ return Math.sqrt(this.len2(a)) },
      /**
       * Normalize this vector, if possible.
       * @memberof module:matrix
       * @function
       * @param {number[]} a
       * @return {number[]|undefined} a unit vector
       */
      unit(a){
        let d=this.len(a);
        if(!_.feq0(d))
          return [a[0]/d, a[1]/d, a[2]/d];
      },
      /**
       * Vector operation A - B.
       * @memberof module:matrix
       * @function
       * @param {number[]} a
       * @param {number[]} b
       * @return {number[]}
       */
      sub(a,b){
        return is.num(b) ? this.V3(a[0]-b, a[1]-b, a[2]-b)
                         : this.V3(a[0]-b[0], a[1]-b[1], a[2]-b[2])
      },
      /**
       * Vector operation A + B.
       * @memberof module:matrix
       * @function
       * @param {number[]} a
       * @param {number[]} b
       * @return {number[]}
       */
      add(a,b){
        return is.num(b) ? this.V3(a[0]+b, a[1]+b, a[2]+b)
                         : this.V3(a[0]+b[0], a[1]+b[1], a[2]+b[2])
      },
      /**
       * Vector operation A x B.
       * @memberof module:matrix
       * @function
       * @param {number[]} a
       * @param {number[]} b
       * @return {number[]}
       */
      mul(a,b){
        return is.num(b) ? this.V3(a[0]*b, a[1]*b, a[2]*b)
                         : this.V3(a[0]*b[0], a[1]*b[1], a[2]*b[2])
      },
      /**
       * Vector operation A / B.
       * @memberof module:matrix
       * @function
       * @param {number[]} a
       * @param {number[]} b
       * @return {number[]}
       */
      div(a,b){
        return is.num(b) ? this.V3(a[0]/b, a[1]/b, a[2]/b)
                         : this.V3(a[0]/b[0], a[1]/b[1], a[2]/b[2])
      },
      /**
       * Create a matrix.
       * @memberof module:matrix
       * @function
       * @param {number[]} dim dimension of the matrix
       * @param {...number} args values for the matrix (row major)
       * @return {object} a new matrix
       */
      matrix([rows,cols],...args){
        const sz= rows*cols;
        return args.length===0 ? _new_mat(rows,cols)
                               : _.assert(sz===args.length) && _matnew(rows,cols,args)
      },
      /**
       * Create an `Identity` matrix.
       * memberof module:matrix
       * @function
       * @param {number} sz  size of the matrix
       * @return {object}
       */
      matIdentity(sz){
        const out=_.assert(sz>0) &&
                  _.fill(sz*sz,0);
        for(let i=0;i<sz;++i)
          out[_cell(sz,sz,i+1,i+1)] = 1;
        return _matnew(sz, sz, out);
      },
      /**
       * Create a matrix of zeroes.
       * memberof module:matrix
       * @function
       * @param {number} sz  size of the matrix
       * @return {object}
       */
      matZero(sz){
        return _.assert(sz>0) &&
               _matnew(sz,sz,_.fill(sz*sz,0))
      },
      /**
       * Get the rows of this matrix.
       *
       * For example, if the matrix is
       * [1 0 0
       *  0 1 0
       *  0 0 1] then the rows majors are
       *  [1 0 0], [0 1 0], [0 0 1]
       *
       * @memberof module:matrix
       * @function
       * @param {object} m the matrix
       * @return {Array[]}
       */
      matRowMajors(m){
        const [rows,cols]=m.dim;
        return _.partition(cols,m.cells)
      },
      /**
       * Get the cols of this matrix.
       *
       * For example, if the matrix is
       * [1 2 3
       *  4 5 6
       *  7 8 9] then the column majors are
       *  [1 4 7], [2 5 8], [7 8 9]
       *
       * @memberof module:matrix
       * @function
       * @param {object} m the matrix
       * @return {Array[]}
       */
      matColMajors(m){
        const [rows,cols]=m.dim;
        const out=[];
        for(let a,c=0;c<cols;++c){
          a=[];
          for(let r=0;r<rows;++r){
            a.push(m.cells[r*cols+c])
          }
          out.push(a);
        }
        return out;
      },
      /**
       * Create a 2x2 matrix.
       *
       * @memberof module:matrix
       * @function
       * @param {number} _11
       * @param {number} _12
       * @param {number} _21
       * @param {number} _22
       * @return {object}
       */
      mat2(_11,_12,_21,_22){
        return this.matrix([2,2],_11,_12,_21,_22)
      },
      /**
       * Create a 3x3 matrix.
       *
       * @memberof module:matrix
       * @function
       * @param {number} _11
       * @param {number} _12
       * @param {number} _13
       * @param {number} _21
       * @param {number} _22
       * @param {number} _23
       * @param {number} _31
       * @param {number} _32
       * @param {number} _33
       * @return {object}
       */
      mat3(_11,_12,_13,_21,_22,_23,_31,_32,_33){
        return this.matrix([3,3], _11,_12,_13,_21,_22,_23,_31,_32,_33)
      },
      /**
       * Create a 4x4 matrix.
       *
       * @memberof module:matrix
       * @function
       * @param {number} _11
       * @param {number} _12
       * @param {number} _13
       * @param {number} _14
       * @param {number} _21
       * @param {number} _22
       * @param {number} _23
       * @param {number} _24
       * @param {number} _31
       * @param {number} _32
       * @param {number} _33
       * @param {number} _34
       * @param {number} _41
       * @param {number} _42
       * @param {number} _43
       * @param {number} _44
       * @return {object}
       */
      mat4(_11,_12,_13,_14,_21,_22,_23,_24,
           _31,_32,_33,_34, _41,_42,_43,_44){
        return this.matrix([4,4],
                           _11,_12,_13,_14,_21,_22,_23,_24,
                           _31,_32,_33,_34,_41,_42,_43,_44)
      },
      /**
       * Check if these 2 matrices are equal.
       * @memberof module:matrix
       * @function
       * @param {object} a matrix A
       * @param {object} b matrix B
       * @return {boolean}
       */
      matEq(a,b){
        return a.dim[0]===b.dim[0] &&
               a.dim[1]===b.dim[1] ? _arrayEq(a.cells,b.cells) : false
      },
      /**
       * Transpose this matrix.
       *
       * @memberof module:matrix
       * @function
       * @param {object} m the matrix
       * @return {object}
       */
      matXpose(m){
        const [rows,cols]= m.dim;
        const sz=rows*cols;
        const tmp=[];
        for(let i=0;i<sz;++i)
          tmp.push(m.cells[MFL(i/rows) + cols*(i%rows)]);
        return _matnew(cols,rows,tmp)
      },
      /**
       * Multiply this matrix with a scalar value.
       * @memberof module:matrix
       * @function
       * @param {object} m the matrix
       * @param {number} n scalar
       * @return {object}
       */
      matScale(m,n){
        return _matnew(m.dim[0],m.dim[1],m.cells.map(x=> x*n))
      },
      /** Multiply these 2 matrices.
       * @memberof module:matrix
       * @function
       * @param {object} a matrix A
       * @param {object} b matrix B
       * @return {object}
       */
      matMult(a,b){
        let [aRows,aCols]=a.dim;
        let [bRows,bCols]=b.dim;
        let aCells=a.cells;
        let bCells=b.cells;
        _.assert(aCols===bRows, "mismatch matrices");
        let out=new Array(aRows*bCols);
        for(let i=0; i<aRows; ++i)
          for(let j=0; j<bCols; ++j){
            out[j+i*bCols]=
              _.range(bRows).reduce((acc,k)=> {
                return acc + aCells[k+i*aCols] * bCells[j+ k*bCols] },0);
          }
        return _matnew(aRows,bCols,out)
      },
      /**Find the `Determinent` this matrix.
       * @memberof module:matrix
       * @function
       * @param {object} m the matrix
       * @return {number}
       */
      matDet(m){
        let [rows,cols]=m.dim;
        let tmp=[];
        if(cols===2)
          return this._matDet2x2(m);
        for(let c=0; c< cols;++c)
          _.conj(tmp,this.matDet(this.matCut(m,1,c+1)));
        return _.range(cols).reduce((acc,j)=>{
          let v=tmp[j];
          return acc + m.cells[j] * (_odd(j) ? -v : v)
        },0)
      },
      _matDet2x2(m){
        _.assert(m.cells.length===4);
        return m.cells[0]*m.cells[3] - m.cells[1] * m.cells[2]
      },
      /** Extract a portion of a matrix by
       * getting rid of a row and col.
       *
       * @memberof module:matrix
       * @function
       * @param {object} m the matrix
       * @param {number} row the row to cut (1-indexed)
       * @param {number} col the col to cut (1-indexed)
       * @return {object}
       */
      matCut(m,row,col){
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
      },
      /** Find the `Matrix Minor` of this matrix.
       *  A "minor" is the determinant of the square matrix
       *  formed by deleting one row and one column from
       *  some larger square matrix.
       * @memberof module:matrix
       * @function
       * @param {object} m the matrix
       * @return {object}
       */
      matMinor(m){
        let [rows,cols]=m.dim;
        let tmp=[];
        _.assert(rows===cols);
        if(cols===2)
          return this._matMinor2x2(m);
        for(let i=0; i< rows;++i)
          for(let j=0; j<cols; ++j){
            //mat-cut is 1-indexed
            _.conj(tmp,this.matDet(this.matCut(m,i+1,j+1)));
          }
        return _matnew(rows,cols,tmp)
      },
      _matMinor2x2(m){
        return _.assert(m.cells.length===4) &&
               this.mat2(m.cells[3],m.cells[2],m.cells[1],m.cells[0])
      },
      /** Find the `Matrix Cofactor` of this matrix.
       * The cofactor is a signed minor.
       * The cofactor of aij is denoted by Aij and is defined as
       * Aij = (-1)^(i+j) Mij
       *
       * @memberof module:matrix
       * @function
       * @param {object} m
       * @return {object}
       */
      matCofactor(m){
        let minor=this.matMinor(m);
        let [rows,cols]=minor.dim;
        let tmp=minor.cells.slice();
        for(let r=0;r<rows;++r)
          for(let p,c=0;c<cols;++c){
            p=r*cols+c;
            if(_odd(r+c))
              tmp[p]= -tmp[p];
          }
        return _matnew(rows,cols,tmp)
      },
      /**
       * Find the adjugate of a square matrix.
       *
       * An `Adjugate` is the transpose of its cofactor matrix.
       * @memberof module:matrix
       * @function
       * @param {object} m the matrix
       * @return {object}
       */
      matAdjugate(m){
        return this.matXpose(this.matCofactor(m))
      },
      /** Inverse a matrix */
      _minv2x2(m){
        let [rows,cols]=m.dim;
        _.assert(m.cells.length===4&&rows===2&&cols===2);
        let r,c=m.cells;
        let det= c[0]*c[3] - c[1]*c[2];
        if(_.feq0(det))
          r=this.matIdentity(rows);
        else{
          let _det= 1/det;
          r= this.mat2(c[3]*_det, -c[1] * _det,
                       -c[2] * _det, c[0] * _det);
        }
        return r
      },
      /** Find the `Inverse` of this matrix.
       * @memberof module:matrix
       * @function
       * @param {object} m the matrix
       * @return {object}
       */
      matInv(m){
        let [rows,cols]=m.dim;
        if(cols===2)
          return this._minv2x2(m);
        let d= this.matDet(m);
        return _.feq0(d) ? this.matIdentity(rows)
                         : this.matScale(this.matAdjugate(m), 1/d)
      },
      /** Matrix from column major */
      /**
       * @memberof module:matrix
       * @function
       * @param {Array[]} list of column values
       * @return {object}
       */
      matFromColMajor(arr){
        let numCols= arr.length,
            rows=arr[0].length,
            out=_new_mat(rows,numCols);
        for(let C,c=0;c<arr.length;++c){
          C=arr[c];
          for(let r=0;r<C.length;++r){
            out.cells[r*numCols+c]=C[r];
          }
        }
        return out;
      },
      /** Get the list of `Column Major` vectors from this matrix.
       * @memberof module:matrix
       * @function
       * @param {object} m the matrix
       * @return {object}
       */
      matToColMajor(m){
        const [rows,cols]=m.dim;
        const out=m.cells.slice();
        for(let i=0,c=0;c<cols;++c)
          for(let r=0;r<rows;++r){
            out[i++]=m.cells[r*cols+c];
          }
        return {cells: out, depth:rows};
      },
      /** Create a 3D scale matrix.
       *
       * @memberof module:matrix
       * @function
       * @param {number[]} V3 x,y,z values
       * @return {object}
       */
      scale3D(V3){
        let out=this.matIdentity(4);
        out.cells[_cell(4,4,1,1)]=V3[0];
        out.cells[_cell(4,4,2,2)]=V3[1];
        out.cells[_cell(4,4,3,3)]=V3[2];
        return out;
      },
      /** Create a 3D translation matrix.
       *
       * @memberof module:matrix
       * @function
       * @param {number[]} V3 x,y,z values
       * @return {object}
       */
      translate3D(V3){
        let out=this.matIdentity(4);
        out.cells[_cell(4,4,4,1)]=V3[0];
        out.cells[_cell(4,4,4,2)]=V3[1];
        out.cells[_cell(4,4,4,3)]=V3[2];
        return out;
      },
      /** Create a 3D rotation matrix.
       *  rotation order *IMPORTANT*
       * @memberof module:matrix
       * @function
       * @param {number} roll x rotation in radians.
       * @param {number} pitch y rotation in radians.
       * @param {number} yaw z rotation in radians.
       * @return {object}
       */
      rot3D(roll,pitch,yaw){
        //x,y,z order is important, matrix not commutative
        return this.matMult(this.zRot3D(yaw),
                            this.matMult(this.yRot3D(pitch),
                                         this.xRot3D(roll)));
      },
      /** Multiply matrix and  vector.
       * @memberof module:matrix
       * @function
       * @param {object} m the matrix
       * @param {number[]} v the vector
       * @return {number[]}
       */
      matVMult(m,v){
        let cols=m.dim[1];
        let rows=v.length;
        _.assert(cols===rows);
        let r= this.matMult(m, _matnew(rows, 1, v));
        let c=r.cells;
        r.cells=null;
        return c
      },
      /** Rotate a 2x2 matrix, counter-clockwise.
       * @memberof module:matrix
       * @function
       * @param {number} rot in radians
       * @return {object}
       */
      rot2D(rot){
        return this.mat2(COS(rot),-SIN(rot),SIN(rot),COS(rot))
      },
      /** Rotate on x-axis.
       * @memberof module:matrix
       * @function
       * @param {number} rad value in radians
       * @return {object}
       */
      xRot3D(rad){
        return this.mat4(1,0,0,0,
                         0,COS(rad),-SIN(rad),0,
                         0,SIN(rad),COS(rad),0,
                         0,0,0,1)
      },
      /** Rotate on y-axis.
       * @memberof module:matrix
       * @function
       * @param {number} rad value in radians
       * @return {object}
       */
      yRot3D(rad){
        return this.mat4(COS(rad),0,SIN(rad),0,
                         0,1, 0, 0,
                         -SIN(rad), 0, COS(rad), 0,
                         0,0,0,1)
      },
      /** Rotate on z-axis.
       * @memberof module:matrix
       * @function
       * @param {number} rad value in radians
       * @return {object}
       */
      zRot3D(rad){
        return this.mat4(COS(rad), -SIN(rad), 0, 0,
                         SIN(rad),COS(rad), 0, 0,
                         0, 0, 1, 0,
                         0, 0, 0, 1)
      },
      /** True if m is an `identity` matrix.
       * @memberof module:matrix
       * @function
       * @param {object} m the matrix
       * @return {boolean}
       */
      isIdentity(m){
        const [rows,cols]=m.dim;
        if(rows===cols){
          for(let v,r=0;r<rows;++r){
            for(let c=0;c<cols;++c){
              v=m.cells[r*cols+c];
              if((r+1)===(c+1)){
                if(v !== 1) return false;
              }else if(v !== 0) return false;
            }
          }
          return true;
        }else{
          return false;
        }
      },
      /** True if matrix is `orthogonal`.
       * @memberof module:matrix
       * @function
       * @param {object} m the matrix
       * @return {boolean}
       */
      isOrthogonal(m){
        //Given a square matrixA, to check for its orthogonality steps are:
        //Find the determinant of A. If, it is 1 then,
        //find the inverse matrix of inv(A) and transpose of xpos(A),
        //if xpose(A) X inv(A) === I
        //then A will be orthogonal
        let r,d= this.matDet(m);
        return Math.abs(d)===1 &&
               this.isIdentity(this.matMult(this.matXpose(m), this.matInv(m)));
      }
    };
    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"))
  }else{
    gscope["io/czlab/mcfud/matrix"]=_module
  }

})(this);


