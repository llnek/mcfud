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
      * @module mcfud/minimax
      */

    /**
     * @memberof module:mcfud/minimax
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
     * @memberof module:mcfud/minimax
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
      evalScore(frame,move){}
      /**Check if game is a draw.
       * @param {GFrame} frame
       * @return {boolean}
       */
      isStalemate(frame){}
      /**Check if game is over.
       * @param {GFrame} frame
       * @return {boolean}
       */
      isOver(frame,move){}
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
      run(seed,actor){
        this.syncState(seed,actor);
        let pos= this.getFirstMove();
        if(_.nichts(pos))
          pos= _$.evalMiniMax(this);
        return pos;
      }
    }

    /** @ignore */
    function _calcScore(board,game,move,depth){
      let score=board.evalScore(game,move);
      if(!_.feq0(score))
        score -= 0.01*depth*Math.abs(score)/score;
      return score;
    }

    /**Implements the Min-Max (alpha-beta) algo.
     * @param {GameBoard} board
     * @param {GFrame} game
     * @param {number} maxDepth
     * @param {number} depth
     * @param {any} prevMove
     * @param {number} alpha
     * @param {number} beta
     * @return {number}
     */
    function _miniMax(board, game, maxDepth, depth, prevMove, alpha, beta, maxing){
      if(depth===0 ||
         (!_.nichts(prevMove)&&
          board.isOver(game,prevMove))){
        return _calcScore(board,game,prevMove,depth)
      }else{
        ++depth;
        return maxing? _doMax(board, game, maxDepth, depth, alpha, beta)
                     : _doMin(board, game, maxDepth, depth, alpha, beta);
      }
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function _doMax(board, game, maxDepth, depth, alpha, beta){
      let bestMove=null;
      let state=game;
      let openMoves= board.getNextMoves(game);

      if(depth === maxDepth)
        state.lastBestMove = openMoves[0];

      for(let rc, move, i=0; i<openMoves.length; ++i){
        game=state.clone(board.getStateCopier());
        move=openMoves[i];
        board.makeMove(game, move);
        board.switchPlayer(game);
        rc= _miniMax(board, game, maxDepth, depth, move, alpha, beta, false);
        if(rc > alpha){
          alpha = rc;
          bestMove = move;
        }
        if(alpha >= beta){ break }
      }

      if(bestMove){
        if(depth === maxDepth)
          state.lastBestMove = bestMove;
        else
          board.makeMove(state, bestMove);
      }

      return alpha;
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function _doMin(board, game, maxDepth, depth, alpha, beta){
      let bestMove=null;
      let state=game;
      let openMoves= board.getNextMoves(game);
      for(let rc, move, i=0; i<openMoves.length; ++i){
        game=state.clone(board.getStateCopier());
        move=openMoves[i];
        board.makeMove(game, move);
        board.switchPlayer(game);
        rc= _miniMax(board, game, maxDepth, depth, move, alpha, beta, true);
        if(rc < beta){
          beta = rc;
          bestMove = move;
        }
        if(alpha >= beta){ break }
      }
      if(bestMove)
        board.makeMove(state, bestMove);
      return beta;
    }

    const _$={
      GFrame,
      GameBoard,
      /**Make a move on the game-board using minimax algo.
       * @memberof module:mcfud/minimax
       * @param {GameBoard} board
       * @return {any} next best move
       */
      evalMiniMax(board){
        const f= board.takeGFrame();
        const d= board.depth;
        _miniMax(board, f, d,d,null, -Infinity, Infinity);
        return f.lastBestMove;
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module == "object" && module.exports){
    module.exports=_module(require("./core"))
  }else{
    gscope["io/czlab/mcfud/minimax"]=_module
  }

})(this);

