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

    class Fibonacci{
      static solve0(N){
        _.assert(N>0,"bad fib number");
        let res=[];
        function _s(n){
          return n<3?1: (_s(n-1) + _s(n-2))
        }
        for(let i=1;i<=N;++i){ res.push(_s(i)) }
        return res;
      }
      static solve(N){
        _.assert(N>0,"bad fib number");
        let res=[],
            c=new Map();
        function _s(n){
          if(n<3) return 1;
          if(c.has(n)) return c.get(n);
          let v= _s(n-2) + _s(n-1);
          c.set(n,v);
          return v;
        }
        for(let i=1;i<=N;++i){ res.push(_s(i)) }
        return res;
      }
      static test(){
        let vs=Fibonacci.solve(15);
        console.log(vs.join(","));
      }
    }
    //Fibonacci.test();

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
    //KnightsTour.test();

    /**Classic Sudoku.
     * @memberof module:mcfud/algo_prog
     * @class
     */
    class Sudoku{
      /**Solve the given sudoku.
       * @param {array} G grid NxN(N=9)
       * @return {array} the solution
       */
      static solve(G){
        const N=G.length,
              W=G[0].length;
        _.assert(N==W,"bad sudoku size");
        function _qok(row, col, v){
          for(let c=0; c < G[0].length; ++c) if(G[row][c] == v) return false;//check row
          for(let r=0; r < G.length; ++r) if(G[r][col] == v) return false;//check col
          //check box
          let boxX= col - col % 3,
              boxY= row - row % 3;
          for(let r=boxY; r<boxY+3; ++r)
          for(let c = boxX; c<boxX+3; ++c){
            if(G[r][c] == v) return false;
          }
          return true;
        }
        return (function _s(){
          let row,col;
          //pick first empty slot
          for(let r=0; r<N; ++r){
            for(let c=0; c<N; ++c){
              if(G[r][c]==0){
                row = r;
                col = c;
                break;
              }
            }
            if(row !==undefined){ break }
          }
          if(row===undefined){//all filled
            return G
          }else{//test or backtrack
            for(let v=1; v <= N; ++v){
              if(_qok(row, col, v)){
                G[row][col] = v;
                if(_s()){
                  return G
                }else{//revert
                  G[row][col] = 0;
                }
              }
            }
          }
        })();
      }
      static test(){
        let D=`3 0 6 5 0 8 4 0 0
               5 2 0 0 0 0 0 0 0
               0 8 7 0 0 0 0 3 1
               0 0 3 0 1 0 0 8 0
               9 0 0 8 6 3 0 0 5
               0 5 0 0 9 0 6 0 0
               1 3 0 0 0 0 2 5 0
               0 0 0 0 0 0 0 7 4
               0 0 5 2 0 6 3 0 0`.split(/\s+/).map(n=> {return +n});
        let g= Sudoku.solve(_.partition(9,D));
        if(g)
          g.forEach(r=> console.log(r.join(",")));
        else
          console.log("no solution");
      }
    }
    //Sudoku.test();

    /**Classic coin change.
     * @memberof module:mcfud/algo_prog
     * @class
     */
    class UnboundedKnapsack{
      /**Count the number of ways coins can be combined to
       * match the given amount.
       * @param {array} coins list of coins
       * @param {number} amount
       * @return {number} number of solutions
       */
      static solve(coins,amount){
        return (function _s(s,m,n){
          // If n is 0 then there is 1 solution (do not include any coin)
          if(n == 0) return 1;
          // If n is less than 0 then no solution exists
          if(n < 0) return 0;
          // If there are no coins and n is greater than 0, then no solution exist
          if(m <=0 && n >= 1) return 0;
          // count is sum of solutions (i) including S[m-1] (ii) excluding S[m-1]
          return _s(s, m-1, n) +
                 _s(s, m, n - s[m-1]);
        })(coins,coins.length,amount);
      }
      /**Count the number of ways coins can be combined to
       * match the given amount.
       * @param {array} coins list of coins
       * @param {number} amount
       * @return {number} number of solutions
       */
      static solve2(coins,amount,V){
        const N=coins.length;
        return (function _s(s,v,n,dp){
          if(v == 0) return dp[n][v] = 1;
          if(n == 0) return 0;
          if(dp[n][v] != -1) return dp[n][v];
          if(s[n-1] <= v){
            // Either Pick this coin or not
            return dp[n][v] = _s(s, v- s[n-1], n, dp) + _s(s, v, n-1, dp);
          }else{ // We have no option but to leave this coin
            return dp[n][v] = _s(s, v, n-1, dp);
          }
        })(coins,amount,N, V);
      }
      static test(){
        let ret=UnboundedKnapsack.solve([1,2,3],4);
        console.log("n# of solution= "+ ret);
      }
      static test2(){
        let amt=6,N=3,V=_.fill(N+1,()=> _.fill(amt+1,-1));
        let ret=UnboundedKnapsack.solve2([1,2,3], amt,V);
        console.log("n# of solution= "+ ret);
      }
    }
    //UnboundedKnapsack.test();

    /**Classic min coins.
     * @memberof module:mcfud/algo_prog
     * @class
     */
    class MinCoins{
      static solve(coins,amount){
        return (function _s(coins,m,V){
          // table[i] will be storing the minimum number of coins
          // required for i value. So table[V] will have result
          let table = _.fill(V+1, Infinity);
          table[0] = 0; // base case (V is 0)
          // minimum coins required for all values from 1 to V
          for(let v=1; v<=V; ++v){
            // Go through all coins smaller than i
            for(let r,j=0; j<m; ++j)
              if(coins[j] <= v){
                r = table[v - coins[j]];
                if(r !== Infinity && r+1 < table[v]) table[v] = r+1;
              }
          }
          return table[V]===Infinity? -1: table[V];
        })(coins,coins.length,amount);
      }
      static test(){
        let coins = [9, 6, 5, 1];
        let amt = 11;
        console.log("Minimum coins required is " + MinCoins.solve(coins, amt));
      }
    }
    //MinCoins.test();

    /**Classic min coins.
     * @memberof module:mcfud/algo_prog
     * @class
     */
    class MinCoins2{
      static solve(coins,amount){
        function _f(s,m,V,dp,out){
          if(V == 0){ return out }
          for(let i=0; i<m; ++i){
            // Try every coin that has value smaller than n
            if(V-s[i] >= 0 && dp[V-s[i]]+1 == dp[V]){
              out.push(s[i]);
              _f(s,m,V-s[i],dp,out);
              break;
            }
          }
          return out;
        }
        function _s(s,m,V,dp){
          if(V == 0){ return (dp[0]=0); }//amount=0
          //previously computed subproblem occurred
          if(dp[V] != -1) return dp[V];
          // try every coin that has smaller value than V
          let ret = Infinity;
          for(let x,i=0; i<m; ++i){
            if(s[i] <= V){
              x = _s(s,m,V-s[i],dp);
              if(x !== Infinity)
                ret = Math.min(ret, 1+x);
            }
          }
          // Memoizing value of current state
          return (dp[V] = ret);
        }
        return (function(s, m, V){
          let out=[],
              dp= _.fill(V+1,-1);
          if(_s(s,m,V,dp) !== Infinity){
            return _f(s,m,V,dp,out)
          }
        })(coins, coins.length, amount);
      }
      static test(){
        let g=MinCoins2.solve([2,3,4],5);//[2,3,4,5],21);
        if(g)
          console.log(g.toString());
        else
          console.log("no solution");
      }
    }
    //MinCoins2.test();

    class TowerOfHanoi{
      static solve(N){
        let steps=[],
            C=0,
            d=new Stack(),
            t=new Stack(),
            s=new Stack();
        s.name="P1";
        t.name="P2";
        d.name="P3";
        for(let i=N;i>0;--i)s.push(i);
        (function _s(src,des,tmp,n){
          if(n<=0){return}
          _s(src, tmp, des, n-1);
          let d= src.pop();
          des.push(d);
          steps.push(`move d${d} from ${src.name} to ${des.name}`);
          _s(tmp,des,src,n-1);
        })(s,d,t,N);
        _.assert(s.isEmpty()&&t.isEmpty()&&d.size()==N,"hanoi has problems");
        for(let it=d.iter();it.hasNext();){
          ++C;
          _.assert(C== it.next(), "Hanoi has problems");
        }
        _.assert(C==N,"hanoi has prolems");
        return steps;
      }
      static test(){
        console.log(TowerOfHanoi.solve(4).join("\n"));
      }
    }
    //TowerOfHanoi.test();

    class GenerateGuess{
      static solve(target){
        const GS = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!.";
        const GS2= GS.split("");
        const LEN= target.length;
        //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
        function genGuess(genes){
          while(genes.length < LEN){
            let n = Math.min(LEN-genes.length, GS.length);
            _.shuffle(GS2);
            for(let i=0;i<n;++i) genes.push(GS2[i]);
          }
          return genes.join("");
        }
        function getFitness(guess){
          let sum=0;
          for(let i=0;i<LEN;++i)
            if(target.charAt(i) == guess.charAt(i)) ++sum;
          return sum;
        }
        function mutate(parent){
          let c = parent.split(""),
              i = _.randInt(parent.length);
          _.shuffle(GS2);
          c[i]= GS2[0] == c[i] ? GS2[GS2.length-1] : GS2[0];
          return c.join("");
        }
        function show(guess){
          let f= getFitness(guess);
          console.log(`fitness=${f} for guess ${guess}`);
        }
        let bestPar= genGuess([]);
        let bestFit= getFitness(bestPar);
        while(1){
          let c= mutate(bestPar);
          let f= getFitness(c);
          if(bestFit >= f) continue;
          show(c);
          if(f >= bestPar.length)break;
          bestFit= f;
          bestPar= c;
        }
      }
    }
    //GenerateGuess.solve("Hello World!");


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


