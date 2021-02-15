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
 * Copyright © 2013-2021, Kenneth Leung. All rights reserved. */

;(function(gscope){
  "use strict";
  /**
   * @private
   * @function
   */
  function _module(Core){
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    const {u:_}=Core;

    /** @module mcfud/negamax */

    /**
     * @memberof module:mcfud/negamax
     * @class
     * @property {any} lastBestMove
     * @property {any[]} state
     * @property {number} other
     * @property {number} cur
     *
     */
    class FFrame{
      constructor(){
        this.lastBestMove=null;
        this.state= null;
        this.other=0;
        this.cur=0;
      }
      /**Make a copy of this.
       * @return {FFrame}
       */
      clone(){
        const f= new FFrame();
        f.state=_.deepCopyArray(this.state);
        f.lastBestMove=this.lastBestMove;
        f.other=this.other;
        f.cur=this.cur;
        return f;
      }
    }
    /**Represents a game board.
     * @memberof module:mcfud/negamax
     * @class
     */
    class GameBoard{
      constructor(){}
      /**Get the first move.
       * @param {FFrame} frame
       * @return {any}
       */
      getFirstMove(frame){}
      /**Get the list of next possible moves.
       * @param {FFrame} frame
       * @return {any[]}
       */
      getNextMoves(frame){}
      /**Calculate the score.
       * @param {FFrame} frame
       * @return {number}
       */
      evalScore(frame){}
      /**Check if game is a draw.
       * @param {FFrame} frame
       * @return {boolean}
       */
      isStalemate(frame){}
      /**Check if game is over.
       * @param {FFrame} frame
       * @return {boolean}
       */
      isOver(frame){}
      //undoMove(frame, move){}
      /**Make a move.
       * @param {FFrame} frame
       * @param {number} move
       */
      makeMove(frame, move){}
      /**Switch to the other player.
       * @param {FFrame} frame
       */
      switchPlayer(frame){}
      /**Take a snapshot of current game state.
       * @return {FFrame}
       */
      takeFFrame(){}
    }
    /**Nega Min-Max algo.
     * @ignore
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

    const _$={
      FFrame,
      GameBoard,
      /**
       * @memberof module:mcfud/negamax
       * @param {GameBoard} board
       * @return {number}
       */
      evalNegaMax(board){
        const f= board.takeFFrame();
        _negaMax(board, f, board.depth, board.depth, -Infinity, Infinity);
        return f.lastBestMove;
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"))
  }else{
    gscope["io/czlab/mcfud/negamax"]=_module
  }

})(this);

