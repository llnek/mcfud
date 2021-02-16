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

  /**Creates the module.
   */
  function _module(Core){
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    const {u:_}=Core;

    /**
      * @module mcfud/negamax
      */

    /**
     * @memberof module:mcfud/negamax
     * @class
     * @property {any} lastBestMove
     * @property {any} state
     * @property {any} other
     * @property {any} cur
     */
    class GFrame{
      /**
       * @param {any} cur
       * @param {any} other
       */
      constructor(cur,other){
        this.lastBestMove=null;
        this.state= null;
        this.other=other;
        this.cur=cur;
      }
      /**Make a copy of this.
       * @param {function} cp  able to make a copy of state
       * @return {GFrame}
       */
      clone(cp){
        const f= new GFrame();
        f.state=cp(this.state);
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
      /**Get the function that copies a game state.
       * @return {function}
       */
      getStateCopier(){}
      /**Get the first move.
       * @param {GFrame} frame
       * @return {any}
       */
      getFirstMove(frame){}
      /**Get the list of next possible moves.
       * @param {GFrame} frame
       * @return {any[]}
       */
      getNextMoves(frame){}
      /**Calculate the score.
       * @param {GFrame} frame
       * @return {number}
       */
      evalScore(frame){}
      /**Check if game is a draw.
       * @param {GFrame} frame
       * @return {boolean}
       */
      isStalemate(frame){}
      /**Check if game is over.
       * @param {GFrame} frame
       * @return {boolean}
       */
      isOver(frame){}
      //undoMove(frame, move){}
      /**Make a move.
       * @param {GFrame} frame
       * @param {any} move
       */
      makeMove(frame, move){}
      /**Switch to the other player.
       * @param {GFrame} frame
       */
      switchPlayer(frame){}
      /**Take a snapshot of current game state.
       * @return {GFrame}
       */
      takeGFrame(){}
    }

    /**Implements the NegaMax Min-Max algo.
     * @see {@link https://github.com/Zulko/easyAI}
     * @param {GameBoard} board
     * @param {GFrame} game
     * @param {number} maxDepth
     * @param {number} depth
     * @param {number} alpha
     * @param {number} beta
     * @return {number}
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
        if(!board.undoMove)
          game=state.clone(board.getStateCopier());
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
      GFrame,
      GameBoard,
      /**Make a move on the game-board using negamax algo.
       * @memberof module:mcfud/negamax
       * @param {GameBoard} board
       * @return {any} next best move
       */
      evalNegaMax(board){
        const f= board.takeGFrame();
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

