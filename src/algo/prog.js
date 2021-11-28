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
  function _module(Core,Basic,Sort){
    if(!Core) Core= gscope["io/czlab/mcfud/core"]();
    if(!Basic) Basic= gscope["io/czlab/mcfud/algo/basic"]();
    if(!Sort) Sort= gscope["io/czlab/mcfud/algo/sort"]();
    const {Bag,Stack,Queue,StdCompare:CMP,prnIter}= Basic;
    const {MinPQ}= Sort;
    const int=Math.floor;
    const {is,u:_}= Core;

    /**
     * @module mcfud/algo_prog
     */

    /**Classic NQueen problem.
     * @memberof module:mcfud/algo_prog
     * @class
     */
    class NQueen{
      /**Place N chess queens on an N×N chessboard so that
       * no two queens can attack each other.
       * @param {number} size board size
       * @return {array} sizexsize board
       */
      static solve(N){
        //_.assert(N>3,"Bad board for NQueen: " + N);
        let M='1',
            Z='0',
            G=_.fill(N,()=> _.fill(N,Z));
        function _qok(row,col){
          for(let x=0; x<col; ++x) if(G[row][x] == M) return false;
          for(let y=row, x=col; y>=0 && x>=0; --y, --x) if(G[y][x] == M) return false;
          for(let y=row, x=col; x>=0 && y<N; ++y, --x) if(G[y][x] == M) return false;
          return true;
        }
        //start from left to right
        return (function _s(col){
          for(let y=0;y<N;++y){
            if(_qok(y,col)){
              G[y][col] = M;
              if(col+1>=N || _s(col+1))
              return G;
              //else revert
              G[y][col] = Z;
            }
          }
        })(0);
      }
      static test(){
        let g=NQueen.solve(8);
        if(g)
          g.forEach(row=> console.log(row.join(",")));
        else
          console.log("no solution");
      }
    }
    //NQueen.test();

    /**Classic Kinight's tour problem using Warnsdorff's algorithm.
     * @memberof module:mcfud/algo_prog
     * @class
     */
    class KnightsTour{
      static N=8;
      static solve(sy,sx){
        let N=KnightsTour.N,
            ZZ=N*N,
            G= _.fill(N,()=> _.fill(N, 0)),
            //dirs=[[1,2],[1,-2],[2,1],[2,-1],[-1,2],[-1,-2],[-2,1],[-2,-1]];
	          //dirs=[[1,2], [2,1], [2,-1], [1,-2], [-1,-2], [-2,-1], [-2,1], [-1,2 ]];
            dirs=[ [2,1],[1,2],[-1,2],[-2,1],[-2,-1],[-1,-2],[1,-2],[2,-1] ];

        function _ok(y,x){
          return x>=0 && x<N && y>=0 && y<N && G[y][x]<0 }
        function _getAdj(row,col,cnt=0){
          for(let k=0; k<N; ++k)
            if(_ok(row+dirs[k][1], col+dirs[k][0])) ++cnt;
          return cnt;
        }
        function _validAdj(row,col,y,x){
          for(let k=0; k<N; ++k)
            if(y+dirs[k][1] == row &&
               x+dirs[k][0] == col) return true;
        }
        function _move(ret){
          let minDeg = N+1,
              minDegIdx = -1,
              [col,row] = ret,
              c,nx,ny,start = _.randInt(N);
          for(let c,i,k=0; k < N; ++k){
            i = (k+start) % N;
            ny = row+dirs[i][1];
            nx = col+dirs[i][0];
            if(_ok(ny,nx)){
              if((c= _getAdj(ny,nx))<minDeg){
                minDegIdx = i;
                minDeg = c;
              }
            }
          }
          if(minDegIdx <0){
            ret=null; // could not find a next cell
          }else{
            ny= row+ dirs[minDegIdx][1];
            nx= col+ dirs[minDegIdx][0];
            G[ny][nx] = G[row][col]+1;
            // update next point
            ret[0]=nx;
            ret[1]=ny;
          }
          return ret;
        }
        function _solve(row,col){
          // using Warnsdorff's heuristic
          let ret=[col,row];
          G[row][col]=1;
          for(let i=0; i< ZZ-1; ++i){
            ret = _move(ret);
            if(!ret) return false;
          }
          // Check if tour is closed (Can end at starting point)
          if(!_validAdj(row,col,ret[1],ret[0])) return false;
          return G;
        }
        while(!_solve(sy,sx))
          G.forEach(r=> r.forEach((v,i)=> r[i]= -1));
        return G;
      }
      static test(){
        let g=KnightsTour.solve(_.randInt(KnightsTour.N),_.randInt(KnightsTour.N));
        if(g)
          g.forEach(row=> console.log(row.map(v=> _.prettyNumber(v,2," ")).join(",")));
        else
          console.log("no solution");
      }
    }
    KnightsTour.test();

    const _$={
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("../main/core"),require("./basic"),require("./sort"))
  }else{
    gscope["io/czlab/mcfud/algo/prog"]=_module
  }

})(this);


