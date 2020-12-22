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
 * Copyright © 2013-2020, Kenneth Leung. All rights reserved. */

;(function(global) {
  "use strict";
  //export--------------------------------------------------------------------
  if(typeof module === "object" &&
     module && typeof module.exports === "object"){
    global=module.exports;
  }
  else if(typeof exports === "object" && exports){
    global=exports;
  }
  let _singleton=null;
  /**
   * @public
   * @function
   */
  global["io.czlab.mcfud.negamax"]= function(){
    if(_singleton){ return _singleton }
    const Core=global["io.czlab.mcfud.core"]();
    const _= Core.u;
    const _N={};
    //const PINF = 1000000;
    /**
     * @public
     * @class
     */
    class FFrame{
      constructor(){
        this.lastBestMove=null;
        this.state= null;
        this.other=0;
        this.cur=0;
      }
      clone(){
        let f= new FFrame();
        f.state=_.deepCopyArray(this.state);
        f.lastBestMove=this.lastBestMove;
        f.other=this.other;
        f.cur=this.cur;
        return f;
      }
    }
    /**
     * @public
     * @class
     */
    class GameBoard{
      constructor(){
      }
      getFirstMove(frame){}
      getNextMoves(frame){}
      evalScore(frame){}
      isStalemate(frame){}
      isOver(f){}
      //undoMove(frame, move){}
      makeMove(f, move){}
      switchPlayer(frame){}
      takeFFrame(){}
    }
    /**Nega Min-Max algo.
     * @private
     * @function
     */
    function _negaMax(board, game, maxDepth, depth, alpha, beta){
      if(depth === 0 || board.isOver(game)){
        let score=board.evalScore(game);
        if(score !== 0)
          score -= 0.01*depth*Math.abs(score)/score;
        return score;
      }

      let openMoves = board.getNextMoves(game),
          state=game,
          bestValue = -Infinity,
          bestMove = openMoves[0];

      if(depth === maxDepth)
        game.lastBestMove = openMoves[0];

      for(let rc, move, i=0; i<openMoves.length; ++i){
        if(!board.undoMove){
          game=state.clone();
        }
        move = openMoves[i];
        //try a move
        board.makeMove(game, move);
        board.switchPlayer(game);
        rc= - _negaMax(board, game, maxDepth, depth-1, -beta, -alpha);
        //now, roll it back
        if(board.undoMove){
          board.switchPlayer(game);
          board.undoMove(game, move);
        }
        //how did we do ?
        //bestValue = _.max(bestValue, rc);
        if(bestValue < rc){
          bestValue = rc;
          bestMove = move
        }
        if(alpha < rc){
          alpha = rc;
          //bestMove = move;
          if(depth === maxDepth)
            game.lastBestMove = move;
          if(alpha >= beta) break;
        }
      }
      return bestValue;
    }
    /**
     * Main method for nega-max algo.
     * @public
     * @function
     */
    _N.evalNegaMax=function(board){
      let f= board.takeFFrame();
      _negaMax(board, f, board.depth, board.depth, -Infinity, Infinity);
      return f.lastBestMove;
    };

    return _singleton= _.inject(_N,{ FFrame: FFrame, GameBoard: GameBoard });
  };

})(this);

