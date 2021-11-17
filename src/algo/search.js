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
  function _module(Core,Basic){
    if(!Core) Core= gscope["io/czlab/mcfud/core"]();
    if(!Basic) Basic= gscope["io/czlab/mcfud/algo/basic"]();
    const int=Math.floor;
    const {is,u:_}= Core;
    const {Bag,Stack,Node}= Basic;

    /**
     * @module mcfud/algo_search
     */

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Provides a client for reading in a sequence of words and printing a word
     * (exceeding a given length) that occurs most frequently.
     * @memberof module:mcfud/algo_search
     * @class
     */
    class FrequencyCounter{
      /**
       * @param {array} input the list of words
       * @param {number} keySize the minimum word length
       * @return {array} [word, max]
       */
      static count(input,keySize){
        let m=new Map(),
            words=0,
            max="", distinct=0;
        // compute frequency counts
        for(let s,i=0;i<input.length;++i){
          s=input[i];
          if(s.length<keySize)continue;
          ++words;
          if(m.has(s)){
            m.set(s, m.get(s)+1)
          }else{
            m.set(s, 1);
            ++distinct;
          }
        }
        // find a key with the highest frequency count
        m.set(max, 0);
        Array.from(m.keys()).forEach(k=>{
          if(m.get(k) > m.get(max)) max = k;
        });
        return [max, m.get(max)];
      }
      static test(){
        let s= `it was the best of times it was the worst of times
        it was the age of wisdom it was the age of foolishness
        it was the epoch of belief it was the epoch of incredulity
        it was the season of light it was the season of darkness
        it was the spring of hope it was the winter of despair`.split(" ");
        let [m,v]= FrequencyCounter.count(s,1);
        console.log("" + m + " " + v);
        //console.log("distinct = " + distinct);
        //console.log("words= " + words);
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function SNode(key,val,next){ return {key,val,next} }
    /**
     * @memberof module:mcfud/algo_search
     * @class
     * @property {object} first // the linked list of key-value pairs
     * @property {number} n // number of key-value pairs
     */
    class SequentialSearchST{
      constructor(){
        this.n=0;
        this.first=null;
      }
      /**Returns the number of key-value pairs in this symbol table.
       * @return the number of key-value pairs in this symbol table
       */
      size(){
        return this.n;
      }
      /**Returns true if this symbol table is empty.
       * @return {@code true} if this symbol table is empty;
       *         {@code false} otherwise
       */
      isEmpty(){
        return this.size() == 0;
      }
      /**Returns true if this symbol table contains the specified key.
       * @param  key the key
       * @return {@code true} if this symbol table contains {@code key};
       *         {@code false} otherwise
       * @throws Error if {@code key} is {@code null}
       */
      contains(key){
        if(key === null)
          throw Error(`argument to contains is null`);
        return this.get(key) != undefined;
      }
      /**Returns the value associated with the given key in this symbol table.
       * @param  key the key
       * @return the value associated with the given key if the key is in the symbol table
       *     and {@code null} if the key is not in the symbol table
       * @throws Error if {@code key} is {@code null}
       */
      get(key){
        if(key == null)
          throw Error(`argument to get is null`);
        for(let x = this.first; x != null; x = x.next){
          if(key==x.key)
            return x.val;
        }
      }
      /**Inserts the specified key-value pair into the symbol table, overwriting the old
       * value with the new value if the symbol table already contains the specified key.
       * Deletes the specified key (and its associated value) from this symbol table
       * if the specified value is {@code null}.
       *
       * @param  key the key
       * @param  val the value
       * @throws Error if {@code key} is {@code null}
       */
      put(key, val){
        if(key == null)
          throw Error(`first argument to put is null`);
        if(val == null){
          this.delete(key);
          return;
        }
        for(let x = this.first; x != null; x = x.next){
          if(key==x.key){
            x.val = val;
            return;
          }
        }
        //add to head
        this.first = SNode(key, val, this.first);
        this.n +=1;
      }
      /**Removes the specified key and its associated value from this symbol table
       * (if the key is in this symbol table).
       * @param  key the key
       * @throws Error if {@code key} is {@code null}
       */
      delete(key){
        let self=this;
        // delete key in linked list beginning at Node x
        // warning: function call stack too large if table is large
        function _delete(x, key){
          if(x == null) return null;
          if(key==x.key){
            self.n -= 1;
            return x.next;
          }
          x.next = _delete(x.next, key);
          return x;
        }
        if(key == null)
          throw Error(`argument to delete is null`);
        this.first = _delete(this.first, key);
      }
      /**Returns all keys in the symbol table as an {@code Iterable}.
       * To iterate over all of the keys in the symbol table named {@code st},
       * use the foreach notation: {@code for (Key key : st.keys())}.
       *
       * @return all keys in the symbol table
       */
      keys(){
        let out=[];
        for(let x = this.first; x != null; x = x.next) out.push(x.key);
        return out;
      }
      /////
      static eval(input){
        let obj=new SequentialSearchST();
        input.forEach((s,i)=> obj.put(s,i));
        return obj
      }
      static test(){
        let obj=SequentialSearchST.eval("SEARCHEXAMPLE".split(""));
        obj.keys().forEach(k=>{
          console.log(`key=${k}, val=${obj.get(k)}`)
        })
      }
    }

    /**
     * @memberof module:mcfud/algo_search
     * @class
     * @property {array} mKeys
     * @property {array} vals
     * @property {number} n
     * @property {function} compare
     */
    class BinarySearchST{
      /**
       * Initializes an empty symbol table with the specified initial capacity.
       * @param capacity the maximum capacity
       */
      constructor(compareFn){
        this.mKeys= new Array(2);
        this.vals= new Array(2);
        this.compare=compareFn;
        this.n=0;
        // resize the underlying arrays
        this.resize=(c)=>{
          let tempk = new Array(c),
              tempv = new Array(c);
          for(let i=0; i<this.n; ++i){
            tempk[i] = this.mKeys[i];
            tempv[i] = this.vals[i];
          }
          this.vals = tempv;
          this.mKeys = tempk;
        };
        this.assertOk=(p)=>{
          if(p===null||p===undefined)
            throw Error("Invalid argument");
          return true;
        }
        this.nnil=(p)=>{ return p===null || p===undefined };
        /***************************************************************************
         *  Check internal invariants.
         ***************************************************************************/
        this.assertCheck=()=>{
          let isSorted=()=>{
            // are the items in the array in ascending order?
            for(let i=1; i<this.size(); ++i)
              if(this.compare(this.mKeys[i],this.mKeys[i-1]) < 0) return false;
            return true;
          };
          let rankCheck=()=>{
            // check that rank(select(i)) = i
            for(let i=0; i<this.size(); ++i)
              if(i != this.rank(this.select(i))) return false;
            for(let i=0; i<this.size(); ++i)
              if(this.compare(this.mKeys[i],this.select(this.rank(this.mKeys[i]))) != 0) return false;
            return true;
          };
          return isSorted() && rankCheck();
        };
      }
      /**
       * Returns true if this symbol table is empty.
       *
       * @return {@code true} if this symbol table is empty;
       *         {@code false} otherwise
       */
      isEmpty(){
        return this.size() == 0;
      }
      /**
       * Does this symbol table contain the given key?
       *
       * @param  key the key
       * @return {@code true} if this symbol table contains {@code key} and
       *         {@code false} otherwise
       * @throws Error if {@code key} is {@code null}
       */
      contains(key){
        return this.assertOk(key) && this.get(key) !== undefined
      }
      /**
       * Returns the value associated with the given key in this symbol table.
       *
       * @param  key the key
       * @return the value associated with the given key if the key is in the symbol table
       *         and {@code null} if the key is not in the symbol table
       * @throws Error if {@code key} is {@code null}
       */
      get(key){
        if(this.assertOk(key) && !this.isEmpty()){
          let i = this.rank(key);
          if(i < this.n &&
             this.compare(this.mKeys[i],key) == 0) return this.vals[i];
        }
      }
      /**
       * Returns the number of keys in this symbol table strictly less than {@code key}.
       *
       * @param  key the key
       * @return the number of keys in the symbol table strictly less than {@code key}
       * @throws Error if {@code key} is {@code null}
       */
      rank(key){
        this.assertOk(key);
        let mid,cmp,
            lo = 0, hi = this.n-1;
        while(lo <= hi){
          mid = lo + Math.floor((hi - lo) / 2);
          cmp = this.compare(key,this.mKeys[mid]);
          if(cmp < 0) hi = mid - 1;
          else if(cmp > 0) lo = mid + 1;
          else return mid;
        }
        return lo;
      }
      /**
       * Inserts the specified key-value pair into the symbol table, overwriting the old
       * value with the new value if the symbol table already contains the specified key.
       * Deletes the specified key (and its associated value) from this symbol table
       * if the specified value is {@code null}.
       *
       * @param  key the key
       * @param  val the value
       * @throws Error if {@code key} is {@code null}
       */
      put(key, val){
        if(this.assertOk(key) && this.nnil(val)){
          this.delete(key);
        }else{
          let i = this.rank(key);
          // key is already in table
          if(i < this.n && this.compare(this.mKeys[i],key) == 0){
            this.vals[i] = val;
          }else{
            // insert new key-value pair
            if(this.n == this.mKeys.length)
              this.resize(2*this.mKeys.length);
            for(let j = this.n; j > i; --j){
              this.mKeys[j] = this.mKeys[j-1];
              this.vals[j] = this.vals[j-1];
            }
            this.n+=1;
            this.mKeys[i] = key;
            this.vals[i] = val;
            this.assertCheck();
          }
        }
      }
      /**
       * Removes the specified key and associated value from this symbol table
       * (if the key is in the symbol table).
       *
       * @param  key the key
       * @throws Error if {@code key} is {@code null}
       */
      delete(key){
        if(this.assertOk(key) && this.isEmpty()){
          return
        }else{
          // compute rank
          let i = this.rank(key);
          // key not in table
          if(i == this.n || this.compare(this.mKeys[i],key) != 0){
            return;
          }else{
            for(let j = i; j < this.n-1; j++){
              this.mKeys[j] = this.mKeys[j+1];
              this.vals[j] = this.vals[j+1];
            }
            this.n-=1;
            this.mKeys[n] = null;  // to avoid loitering
            this.vals[n] = null;
            // resize if 1/4 full
            if(this.n > 0 &&
               this.n == Math.floor(this.mKeys.length/4))
              this.resize(this.mKeys.length/2);
            this.assertCheck();
          }
        }
      }
      /**
       * Removes the smallest key and associated value from this symbol table.
       *
       * @throws Error if the symbol table is empty
       */
      deleteMin(){
        if(this.isEmpty())
          throw Error(`Symbol table underflow error`);
        this.delete(this.min());
      }
      /**
       * Removes the largest key and associated value from this symbol table.
       *
       * @throws Error if the symbol table is empty
       */
      deleteMax(){
        if(this.isEmpty())
          throw Error(`Symbol table underflow error`);
        this.delete(this.max());
      }
      /***************************************************************************
       *  Ordered symbol table methods.
       ***************************************************************************/
      /**
       * Returns the smallest key in this symbol table.
       *
       * @return the smallest key in this symbol table
       * @throws Error if this symbol table is empty
       */
      min(){
        if(this.isEmpty())
          throw Error(`called min with empty symbol table`);
        return this.mKeys[0];
      }
      /**
       * Returns the largest key in this symbol table.
       *
       * @return the largest key in this symbol table
       * @throws Error if this symbol table is empty
       */
      max(){
        if(this.isEmpty())
          throw Error(`called max with empty symbol table`);
        return this.mKeys[this.n-1];
      }
      /**
       * Return the kth smallest key in this symbol table.
       *
       * @param  k the order statistic
       * @return the {@code k}th smallest key in this symbol table
       * @throws Error unless {@code k} is between 0 and
       *        <em>n</em>–1
       */
      select(k){
        if(k < 0 || k >= this.size())
          throw Error(`called select with invalid argument: ${k}`);
        return this.mKeys[k];
      }
      /**
       * Returns the largest key in this symbol table less than or equal to {@code key}.
       *
       * @param  key the key
       * @return the largest key in this symbol table less than or equal to {@code key}
       * @throws Error if there is no such key
       * @throws Error if {@code key} is {@code null}
       */
      floor(key){
        let i = this.assertOk(key) && this.rank(key);
        if(i < this.n &&
           this.compare(key,this.mKeys[i]) == 0)
          return this.mKeys[i];
        if(i == 0)
          throw Error(`argument to floor is too small`);
        return this.mKeys[i-1];
      }
      /**
       * Returns the smallest key in this symbol table greater than or equal to {@code key}.
       *
       * @param  key the key
       * @return the smallest key in this symbol table greater than or equal to {@code key}
       * @throws Error if there is no such key
       * @throws Error if {@code key} is {@code null}
       */
      ceiling(key){
        let i = this.assertOk(key) && this.rank(key);
        if(i == n)
          throw Error(`argument to ceiling is too large`);
        return this.mKeys[i];
      }
      /**
       * Returns the number of keys in this symbol table in the specified range.
       *
       * @param lo minimum endpoint
       * @param hi maximum endpoint
       * @return the number of keys in this symbol table between {@code lo}
       *         (inclusive) and {@code hi} (inclusive)
       * @throws Error if either {@code lo} or {@code hi}
       *         is {@code null}
       */
      size(lo, hi){
        if(arguments.length==0){
          return this.n;
        }
        this.assertOk(lo) && this.assertOk(hi);
        return this.compare(lo,hi)>0 ?0
                                     :(this.contains(hi)?(this.rank(hi)-this.rank(lo)+1)
                                                        :(this.rank(hi)-this.rank(lo)));
      }
      /**
       * Returns all keys in this symbol table in the given range,
       * as an {@code Iterable}.
       *
       * @param lo minimum endpoint
       * @param hi maximum endpoint
       * @return all keys in this symbol table between {@code lo}
       *         (inclusive) and {@code hi} (inclusive)
       * @throws Error if either {@code lo} or {@code hi}
       *         is {@code null}
       */
      keys(lo, hi){
        if(arguments.length==0){
          lo=this.min();
          hi=this.max();
        }
        this.assertOk(lo) && this.assertOk(hi);
        let out=[];
        if(this.compare(lo,hi) > 0){}else{
          for(let i=this.rank(lo); i<this.rank(hi); i++)
            out.push(this.mKeys[i]);
          if(this.contains(hi))
            out.push(this.mKeys[this.rank(hi)]);
        }
        return out;
      }
      static eval(input,compareFn){
        let obj= new BinarySearchST(compareFn);
        input.forEach((s,i)=> obj.put(s,i));
        return obj;
      }
      static test(){
        let b= BinarySearchST.eval("SEARCHEXAMPLE".split(""),(a,b)=>{
          return a<b?-1:(a>b?1:0)
        });
        b.keys().forEach(k=>{
          console.log(`${k} = ${b.get(k)}`)
        });
      }
    }

    /**Represents an ordered symbol table of generic key-value pairs.
     * @memberof module:mcfud/algo_search
     * @class
     * @property {object} root
     * @property {function} compare
     */
    class BST{
      constructor(compareFn){
        this.nil=(x)=>{ return x===null || x===undefined };
        this.compare=compareFn;
        this.root=null;
        this.assertOk=(x)=>{
          if(x===null || x===undefined)
            throw Error("Invalid argument");
          return true;
        };
        this.assertCheck=()=>{
          if(!this.isBST(this.root,null,null)) console.log("Not in symmetric order");
          if(!this.isSizeConsistent(this.root)) console.log("Subtree counts not consistent");
          if(!this.isRankConsistent()) console.log("Ranks not consistent");
          return this.isBST(this.root,null,null) && this.isSizeConsistent(this.root) && this.isRankConsistent();
        };
        // is the tree rooted at x a BST with all keys strictly between min and max
        // (if min or max is null, treat as empty constraint)
        // Credit: Bob Dondero's elegant solution
        this.isBST=(x, min, max)=>{
          if(this.nil(x)) return true;
          if(!this.nil(min) && this.compare(x.key,min) <= 0) return false;
          if(!this.nil(max) && this.compare(x.key,max) >= 0) return false;
          return this.isBST(x.left, min, x.key) && this.isBST(x.right, x.key, max);
        };
        this.isSizeConsistent=(x)=>{
          if(this.nil(x)) return true;
          if(x.size != (this._sizeNode(x.left) + this._sizeNode(x.right) + 1)) return false;
          return this.isSizeConsistent(x.left) && this.isSizeConsistent(x.right);
        };
        // check that ranks are consistent
        this.isRankConsistent=()=>{
          for(let i=0; i<this.size(); ++i)
            if(i != this.rank(this.select(i))) return false;
          for(let i=0,ks=this.keys();i<ks.length;++i)
            if(this.compare(ks[i],this.select(this.rank(ks[i]))) != 0) return false;
          return true;
        };
      }
      Node(key, val, size){
        return{ key,val,size, left:null, right:null }
      }
      /**
       * Returns true if this symbol table is empty.
       * @return {@code true} if this symbol table is empty; {@code false} otherwise
       */
      isEmpty(){
        return this.size() == 0;
      }
      /**
       * Does this symbol table contain the given key?
       *
       * @param  key the key
       * @return {@code true} if this symbol table contains {@code key} and
       *         {@code false} otherwise
       * @throws IllegalArgumentException if {@code key} is {@code null}
       */
      contains(key){
        return this.assertOk(key) && this.get(key) != undefined;
      }
      /**
       * Returns the value associated with the given key.
       *
       * @param  key the key
       * @return the value associated with the given key if the key is in the symbol table
       *         and {@code null} if the key is not in the symbol table
       * @throws IllegalArgumentException if {@code key} is {@code null}
       */
      get(key){
        return this._getNode(this.root, key);
      }
      _getNode(x, key){
        if(this.assertOk(key) && this.nil(x)){
          return undefined;
        }
        let cmp = this.compare(key,x.key);
        return cmp < 0? this._getNode(x.left, key) :(cmp > 0? this._getNode(x.right, key) : x.val);
      }
      /**
       * Inserts the specified key-value pair into the symbol table, overwriting the old
       * value with the new value if the symbol table already contains the specified key.
       * Deletes the specified key (and its associated value) from this symbol table
       * if the specified value is {@code null}.
       *
       * @param  key the key
       * @param  val the value
       * @throws Error if {@code key} is {@code null}
       */
      put(key, val){
        if(this.assertOk(key) && this.nil(val)){
          this.delete(key);
        }else{
          this.root = this._putNode(this.root, key, val);
          this.assertCheck();
        }
      }
      _putNode(x, key, val){
        if(this.nil(x)){
          return this.Node(key, val, 1);
        }
        let cmp = this.compare(key,x.key);
        if(cmp < 0) x.left = this._putNode(x.left,  key, val);
        else if(cmp > 0) x.right = this._putNode(x.right, key, val);
        else x.val = val;
        x.size = 1 + this._sizeNode(x.left) + this._sizeNode(x.right);
        return x;
      }
      /**
       * Removes the smallest key and associated value from the symbol table.
       *
       * @throws Error if the symbol table is empty
       */
      deleteMin(){
        if(this.isEmpty()) throw Error("Symbol table underflow");
        this.root = this._deleteMinNode(this.root);
        this.assertCheck();
      }
      _deleteMinNode(x){
        if(this.nil(x.left)) return x.right;
        x.left = this._deleteMinNode(x.left);
        x.size = this._sizeNode(x.left) + this._sizeNode(x.right) + 1;
        return x;
      }
      /**
       * Removes the largest key and associated value from the symbol table.
       *
       * @throws Error if the symbol table is empty
       */
      deleteMax(){
        if(this.isEmpty()) throw Error("Symbol table underflow");
        this.root = this._deleteMaxNode(this.root);
        this.assertCheck();
      }
      _deleteMaxNode(x){
        if(this.nil(x.right)) return x.left;
        x.right = this._deleteMaxNode(x.right);
        x.size = this._sizeNode(x.left) + this._sizeNode(x.right) + 1;
        return x;
      }
      /**
       * Removes the specified key and its associated value from this symbol table
       * (if the key is in this symbol table).
       *
       * @param  key the key
       * @throws Error if {@code key} is {@code null}
       */
      delete(key){
        this.assertOk(key);
        this.root = this._deleteNode(root, key);
        this.assertCheck();
      }
      _deleteNode(x, key){
        if(this.nil(x)) return null;
        let cmp = this.compare(key,x.key);
        if(cmp < 0) x.left = this._deleteNode(x.left,  key);
        else if(cmp > 0) x.right = this._deleteNode(x.right, key);
        else{
          if(this.nil(x.right)) return x.left;
          if(this.nil(x.left)) return x.right;
          let t = x;
          x = this._minNode(t.right);
          x.right = this._deleteMinNode(t.right);
          x.left = t.left;
        }
        x.size = this._sizeNode(x.left) + this._sizeNode(x.right) + 1;
        return x;
      }
      /**
       * Returns the smallest key in the symbol table.
       *
       * @return the smallest key in the symbol table
       * @throws Error if the symbol table is empty
       */
      min(){
        if(this.isEmpty())
          throw Error(`calls min with empty symbol table`);
        return this._minNode(this.root).key;
      }
      _minNode(x){
        return this.nil(x.left)? x: this._minNode(x.left);
      }
      /**
       * Returns the largest key in the symbol table.
       *
       * @return the largest key in the symbol table
       * @throws Error if the symbol table is empty
       */
      max(){
        if(this.isEmpty())
          throw Error(`calls max with empty symbol table`);
        return this._maxNode(this.root).key;
      }
      _maxNode(x){
        return this.nil(x.right)? x: this._maxNode(x.right);
      }
      /**
       * Returns the largest key in the symbol table less than or equal to {@code key}.
       *
       * @param  key the key
       * @return the largest key in the symbol table less than or equal to {@code key}
       * @throws Error if there is no such key
       * @throws Error if {@code key} is {@code null}
       */
      floor(key){
        if(this.assertOk(key) && this.isEmpty())
          throw Error(`calls floor with empty symbol table`);
        let x = this._floorNode(this.root, key);
        if(this.nil(x))
          throw Error(`argument to floor is too small`);
        return x.key;
      }
      _floorNode(x, key){
        if(this.nil(x)){
          return null;
        }
        let cmp = this.compare(key,x.key);
        if(cmp == 0) return x;
        if(cmp < 0) return this._floorNode(x.left, key);
        let t = this._floorNode(x.right, key);
        return this.nil(t)?x: t;
      }
      floor2(key){
        let x = this._floor2(root, key, null);
        if(this.nil(x))
          throw Error(`argument to floor is too small`);
        return x;
      }
      _floor2(x, key, best){
        if(this.nil(x)){
          return best;
        }
        let cmp = this.compare(key,x.key);
        return cmp < 0? this._floor2(x.left, key, best): (cmp > 0? this._floor2(x.right, key, x.key): x.key);
      }
      /**
       * Returns the smallest key in the symbol table greater than or equal to {@code key}.
       *
       * @param  key the key
       * @return the smallest key in the symbol table greater than or equal to {@code key}
       * @throws Error if there is no such key
       * @throws Error if {@code key} is {@code null}
       */
      ceiling(key){
        if(this.assertOk(key) && this.isEmpty())
          throw Error(`calls ceiling with empty symbol table`);
        let x = this._ceilingNode(root, key);
        if(this.nil(x))
          throw Error(`argument to floor is too large`);
        return x.key;
      }
      _ceilingNode(x, key){
        if(this.nil(x)) return null;
        let cmp = this.compare(key,x.key);
        if(cmp == 0) return x;
        if(cmp < 0){
          let t = this._ceilingNode(x.left, key);
          return t? t: x;
        }
        return this._ceilingNode(x.right, key);
      }
      /**
       * Return the key in the symbol table of a given {@code rank}.
       * This key has the property that there are {@code rank} keys in
       * the symbol table that are smaller. In other words, this key is the
       * ({@code rank}+1)st smallest key in the symbol table.
       *
       * @param  rank the order statistic
       * @return the key in the symbol table of given {@code rank}
       * @throws IllegalArgumentException unless {@code rank} is between 0 and
       *        <em>n</em>–1
       */
      select(rank){
        if(rank < 0 || rank >= this.size())
          throw Error(`argument to select is invalid: ${rank}`);
        return this._selectNode(this.root, rank);
      }
      // Return key in BST rooted at x of given rank.
      // Precondition: rank is in legal range.
      _selectNode(x, rank){
        if(this.nil(x)) return null;
        let leftSize = this._sizeNode(x.left);
        if(leftSize > rank) return this._selectNode(x.left,  rank);
        if(leftSize < rank) return this._selectNode(x.right, rank - leftSize - 1);
        return x.key;
      }
      /**
       * Return the number of keys in the symbol table strictly less than {@code key}.
       *
       * @param  key the key
       * @return the number of keys in the symbol table strictly less than {@code key}
       * @throws Error if {@code key} is {@code null}
       */
      rank(key){
        return this.assertOk(key) && this._rankNode(key, this.root);
      }
      // Number of keys in the subtree less than key.
      _rankNode(key, x){
        if(this.nil(x)) return 0;
        let cmp = this.compare(key,x.key);
        return cmp < 0? this._rankNode(key, x.left)
                      : (cmp > 0? (1 + this._sizeNode(x.left) + this._rankNode(key, x.right)) :this._sizeNode(x.left));
      }
      /**
       * Returns all keys in the symbol table in the given range,
       * as an {@code Iterable}.
       *
       * @param  lo minimum endpoint
       * @param  hi maximum endpoint
       * @return all keys in the symbol table between {@code lo}
       *         (inclusive) and {@code hi} (inclusive)
       * @throws Error if either {@code lo} or {@code hi}
       *         is {@code null}
       */
      keys(lo, hi){
        if(arguments.length==0){
          if(this.isEmpty()) return [];
          lo=this.min();
          hi=this.max();
        }
        this.assertOk(lo) && this.assertOk(hi);
        return this._keysNode(this.root, [], lo, hi);
      }
      _keysNode(x, queue, lo, hi){
        if(this.nil(x)){}else{
          let cmplo = this.compare(lo,x.key);
          let cmphi = this.compare(hi,x.key);
          if(cmplo < 0) this._keysNode(x.left, queue, lo, hi);
          if(cmplo <= 0 && cmphi >= 0) queue.push(x.key);
          if(cmphi > 0) this._keysNode(x.right, queue, lo, hi);
        }
        return queue;
      }
      // return number of key-value pairs in BST rooted at x
      _sizeNode(x){
        return this.nil(x)?0: x.size;
      }
      /**
       * Returns the number of keys in the symbol table in the given range.
       *
       * @param  lo minimum endpoint
       * @param  hi maximum endpoint
       * @return the number of keys in the symbol table between {@code lo}
       *         (inclusive) and {@code hi} (inclusive)
       * @throws Error if either {@code lo} or {@code hi}
       *         is {@code null}
       */
      size(lo, hi){
        if(arguments.length==0){
          return this._sizeNode(this.root)
        }
        this.assertOk(lo) && this.assertOk(hi);
        return this.compare(lo,hi)>0? 0
                                    : (this.contains(hi)? (this.rank(hi) - this.rank(lo) + 1): (this.rank(hi) - this.rank(lo)));
      }
      /**
       * Returns the height of the BST (for debugging).
       *
       * @return the height of the BST (a 1-node tree has height 0)
       */
      height(){
        return this._heightNode(this.root);
      }
      _heightNode(x){
        return this.nil(x)? -1 : (1 + Math.max(this._heightNode(x.left), this._heightNode(x.right)))
      }
      /**
       * Returns the keys in the BST in level order (for debugging).
       *
       * @return the keys in the BST in level order traversal
       */
      levelOrder(){
        let keys = [],
            x,queue = [];
        queue.push(this.root);
        while(queue.length>0){
          x = queue.pop();
          if(!this.nil(x)){
            keys.push(x.key);
            queue.push(x.left, x.right);
          }
        }
        return keys;
      }
      static eval(input,compareFn){
        let b=new BST(compareFn);
        input.forEach((s,i)=> b.put(s,i));
        return b;
      }
      static test(){
        let obj= BST.eval("SEARCHEXAMPLE".split(""),(a,b)=>{
          return a<b?-1:(a>b?1:0)
        });
        obj.levelOrder().forEach(s=>{
          console.log(`${s} = ${obj.get(s)}`)
        });
        console.log("");
        obj.keys().forEach(s=>{
          console.log(`${s} = ${obj.get(s)}`)
        });
      }
    }

    /**
     * @memberof module:mcfud/algo_search
     * @class
     * @property {object} root
     * @property {function} compare
     */
    class RedBlackBST{
      static BLACK = false;
      static RED= true;
      constructor(compareFn){
        this.nil= (x)=>{ return x===null || x===undefined };
        this.compare=compareFn;
        this.root=null;
        this.assertOk=(x)=>{
          if(x===null||x===undefined) throw Error("Invalid argument");
          return true;
        }
        this.assertCheck=()=>{
          // is the tree rooted at x a BST with all keys strictly between min and max
          // (if min or max is null, treat as empty constraint)
          // Credit: Bob Dondero's elegant solution
          let isBST3=(x, min, max)=>{
            if(this.nil(x)) return true;
            if(min && this.compare(x.key,min) <= 0) return false;
            if(max && this.compare(x.key,max) >= 0) return false;
            return isBST3(x.left, min, x.key) && isBST3(x.right, x.key, max);
          };
          let isSizeConsistent=(x)=>{
            if(this.nil(x)) return true;
            if(x.size != this._sizeNode(x.left) + this._sizeNode(x.right) + 1) return false;
            return isSizeConsistent(x.left) && isSizeConsistent(x.right);
          }
          // check that ranks are consistent
          let isRankConsistent=()=>{
            for(let i = 0; i < this.size(); ++i)
              if(i != this._rankNode(this.select(i))) return false;
            for(let i=0,ks=this.keys(); i<ks.length;++i)
              if(this.compare(ks[i],this.select(this._rankNode(key))) != 0) return false;
            return true;
          };
          // Does the tree have no red right links, and at most one (left)
          // red links in a row on any path?
          let is23=(x)=>{
            if(this.nil(x)) return true;
            if(this._isRed(x.right)) return false;
            if (x !== this.root && this._isRed(x) && this._isRed(x.left)) return false;
            return is23(x.left) && is23(x.right);
          }
          // do all paths from root to leaf have same number of black edges?
          let isBalanced=()=>{
            let black = 0;     // number of black links on path from root to min
            let x = this.root;
            while(x != null){
              if(!this._isRed(x)) black++;
              x = x.left;
            }
            return isBalanced2(this.root, black);
          };
          // does every path from the root to a leaf have the given number of black links?
          let isBalanced2=(x, black)=>{
            if(this.nil(x)) return black == 0;
            if(!this._isRed(x)) black--;
            return isBalanced2(x.left, black) && isBalanced2(x.right, black);
          };
          return isBST(this.root,null,null) && isSizeConsistent(this.root) && isRankConsistent() && is23(this.root) && isBalanced();
        };
      }
      Node(key, val, color, size){
        //color is parent color
        return {key,val,color,size,left:null,right:null}
      }
      // is node x red; false if x is null ?
      _isRed(x){
        return this.nil(x)?false:x.color=== RedBlackBST.RED
      }
      //number of node in subtree rooted at x; 0 if x is null
      _sizeNode(x){
        return this.nil(x)?0:x.size
      }
      /**
       * Is this symbol table empty?
       * @return {@code true} if this symbol table is empty and {@code false} otherwise
       */
      isEmpty(){
        return this.root === null;
      }
      /***************************************************************************
       *  Standard BST search.
       ***************************************************************************/
      /**
       * Returns the value associated with the given key.
       * @param key the key
       * @return the value associated with the given key if the key is in the symbol table
       *     and {@code null} if the key is not in the symbol table
       * @throws Error if {@code key} is {@code null}
       */
      get(key){
        return this.assertOk(key) && this._getNode(this.root, key);
      }
      // value associated with the given key in subtree rooted at x; null if no such key
      _getNode(x, key){
        while(x != null){
          let cmp = this.compare(key,x.key);
          if(cmp < 0) x = x.left;
          else if(cmp > 0) x = x.right;
          else return x.val;
        }
      }
      /**
       * Does this symbol table contain the given key?
       * @param key the key
       * @return {@code true} if this symbol table contains {@code key} and
       *     {@code false} otherwise
       * @throws Error if {@code key} is {@code null}
       */
      contains(key){
        return this.get(key) !== undefined
      }
      /***************************************************************************
       *  Red-black tree insertion.
       ***************************************************************************/
      /**
       * Inserts the specified key-value pair into the symbol table, overwriting the old
       * value with the new value if the symbol table already contains the specified key.
       * Deletes the specified key (and its associated value) from this symbol table
       * if the specified value is {@code null}.
       *
       * @param key the key
       * @param val the value
       * @throws Error if {@code key} is {@code null}
       */
      put(key, val){
        if(this.assertOk(key) && this.nil(val)){
          this.delete(key);
        }else{
          this.root = this._putNode(this.root, key, val);
          this.root.color = RedBlackBST.BLACK;
        }
      }
      // insert the key-value pair in the subtree rooted at h
      _putNode(h, key, val){
        if(this.nil(h)) return this.Node(key, val, RedBlackBST.RED, 1);
        let cmp = this.compare(key,h.key);
        if(cmp < 0) h.left  = this._putNode(h.left, key, val);
        else if(cmp > 0) h.right = this._putNode(h.right, key, val);
        else h.val = val;
        // fix-up any right-leaning links
        if(this._isRed(h.right) && !this._isRed(h.left))  h = this._rotateLeft(h);
        if(this._isRed(h.left)  &&  this._isRed(h.left.left)) h = this._rotateRight(h);
        if(this._isRed(h.left)  &&  this._isRed(h.right)) this._flipColors(h);
        h.size = this._sizeNode(h.left) + this._sizeNode(h.right) + 1;
        return h;
      }
      /***************************************************************************
       *  Red-black tree deletion.
       ***************************************************************************/
      /**
       * Removes the smallest key and associated value from the symbol table.
       * @throws Error if the symbol table is empty
       */
      deleteMin(){
        if(this.isEmpty())
          throw Error("BST underflow");
        // if both children of root are black, set root to red
        if(!this._isRed(this.root.left) &&
           !this._isRed(this.root.right))
          this.root.color = RedBlackBST.RED;
        this.root = this._deleteMinNode(this.root);
        if(!this.isEmpty()) this.root.color = RedBlackBST.BLACK;
      }
      // delete the key-value pair with the minimum key rooted at h
      _deleteMinNode(h){
        if(this.nil(h.left)) return null;
        if(!this._isRed(h.left) &&
           !this._isRed(h.left.left))
          h = this._moveRedLeft(h);
        h.left = this._deleteMinNode(h.left);
        return this._balance(h);
      }
      /**
       * Removes the largest key and associated value from the symbol table.
       * @throws Error if the symbol table is empty
       */
      deleteMax(){
        if(this.isEmpty())
          throw Error("BST underflow");
        // if both children of root are black, set root to red
        if(!this._isRed(this.root.left) &&
           !this._isRed(this.root.right))
          this.root.color = RedBlackBST.RED;
        this.root = this._deleteMaxNode(this.root);
        if(!this.isEmpty()) this.root.color = RedBlackBST.BLACK;
      }
      // delete the key-value pair with the maximum key rooted at h
      _deleteMaxNode(h){
        if(this._isRed(h.left)) h = this._rotateRight(h);
        if(this.nil(h.right)) return null;
        if(!this._isRed(h.right) &&
           !this._isRed(h.right.left))
          h = this._moveRedRight(h);
        h.right = this._deleteMaxNode(h.right);
        return this._balance(h);
      }
      /**
       * Removes the specified key and its associated value from this symbol table
       * (if the key is in this symbol table).
       *
       * @param  key the key
       * @throws Error if {@code key} is {@code null}
       */
      delete(key){
        if(this.assertOk(key) && !this.contains(key)){}else{
          //if both children of root are black, set root to red
          if(!this._isRed(this.root.left) &&
             !this._isRed(this.root.right)) this.root.color = RedBlackBST.RED;
          this.root = this._deleteNode(this.root, key);
          if(!this.isEmpty()) this.root.color = RedBlackBST.BLACK;
        }
      }
      // delete the key-value pair with the given key rooted at h
      _deleteNode(h, key){
        if(this.compare(key,h.key) < 0){
          if(!this._isRed(h.left) &&
             !this._isRed(h.left.left))
            h = this._moveRedLeft(h);
          h.left = this._deleteNode(h.left, key);
        }else{
          if(this._isRed(h.left))
            h = this._rotateRight(h);
          if(this.compare(key,h.key) == 0 &&
             this.nil(h.right)) return null;
          if(!this._isRed(h.right) &&
             !this._isRed(h.right.left))
            h = this._moveRedRight(h);
          if(this.compare(key,h.key) == 0){
            let x = this._minNode(h.right);
            h.key = x.key;
            h.val = x.val;
            h.right = this._deleteMinNode(h.right);
          }else{
            h.right = this._deleteNode(h.right, key);
          }
        }
        return this._balance(h);
      }
      /***************************************************************************
       *  Red-black tree helper functions.
       ***************************************************************************/
      // make a left-leaning link lean to the right
      _rotateRight(h){
        if(this.nil(h) || !this._isRed(h.left))
          throw Error("bad input to rotateRight");
        let x = h.left;
        h.left = x.right;
        x.right = h;
        x.color = x.right.color;
        x.right.color = RedBlackBST.RED;
        x.size = h.size;
        h.size = this._sizeNode(h.left) + this._sizeNode(h.right) + 1;
        return x;
      }
      // make a right-leaning link lean to the left
      _rotateLeft(h){
        if(this.nil(h) || !this._isRed(h.right))
          throw Error("bad input to rotateLeft");
        let x = h.right;
        h.right = x.left;
        x.left = h;
        x.color = x.left.color;
        x.left.color = RedBlackBST.RED;
        x.size = h.size;
        h.size = this._sizeNode(h.left) + this._sizeNode(h.right) + 1;
        return x;
      }
      // flip the colors of a node and its two children
      _flipColors(h){
        // h must have opposite color of its two children
        // assert (h != null) && (h.left != null) && (h.right != null);
        // assert (!isRed(h) &&  isRed(h.left) &&  isRed(h.right))
        //    || (isRed(h)  && !isRed(h.left) && !isRed(h.right));
        h.color = !h.color;
        h.left.color = !h.left.color;
        h.right.color = !h.right.color;
      }
      // Assuming that h is red and both h.left and h.left.left
      // are black, make h.left or one of its children red.
      _moveRedLeft(h){
        // assert (h != null);
        // assert isRed(h) && !isRed(h.left) && !isRed(h.left.left);
        this._flipColors(h);
        if(this._isRed(h.right.left)){
          h.right = this._rotateRight(h.right);
          h = this._rotateLeft(h);
          this._flipColors(h);
        }
        return h;
      }
      // Assuming that h is red and both h.right and h.right.left
      // are black, make h.right or one of its children red.
      _moveRedRight(h){
        // assert (h != null);
        // assert isRed(h) && !isRed(h.right) && !isRed(h.right.left);
        this._flipColors(h);
        if(this._isRed(h.left.left)){
          h = this._rotateRight(h);
          this._flipColors(h);
        }
        return h;
      }
      // restore red-black tree invariant
      _balance(h){
        // assert (h != null);
        if(this._isRed(h.right) && !this._isRed(h.left))    h = this._rotateLeft(h);
        if(this._isRed(h.left) && this._isRed(h.left.left)) h = this._rotateRight(h);
        if(this._isRed(h.left) && this._isRed(h.right))     this._flipColors(h);
        h.size = this._sizeNode(h.left) + this._sizeNode(h.right) + 1;
        return h;
      }
      /***************************************************************************
       *  Utility functions.
       ***************************************************************************/
      /**
       * Returns the height of the BST (for debugging).
       * @return the height of the BST (a 1-node tree has height 0)
       */
      height(){
        return this._height(this.root);
      }
      _height(x){
        return this.nil(x)? -1: (1 + Math.max(this._height(x.left), this._height(x.right)));
      }
      /***************************************************************************
       *  Ordered symbol table methods.
       ***************************************************************************/
      /**
       * Returns the smallest key in the symbol table.
       * @return the smallest key in the symbol table
       * @throws Error if the symbol table is empty
       */
      min(){
        if(this.isEmpty())
          throw Error(`calls min with empty symbol table`);
        return this._minNode(this.root).key;
      }
      // the smallest key in subtree rooted at x; null if no such key
      _minNode(x){
        return this.nil(x.left)? x: this._minNode(x.left);
      }
      /**
       * Returns the largest key in the symbol table.
       * @return the largest key in the symbol table
       * @throws Error if the symbol table is empty
       */
      max(){
        if(this.isEmpty())
          throw Error(`calls max with empty symbol table`);
        return this._maxNode(this.root).key;
      }
      // the largest key in the subtree rooted at x; null if no such key
      _maxNode(x){
        return this.nil(x.right)? x : this._maxNode(x.right);
      }
      /**
       * Returns the largest key in the symbol table less than or equal to {@code key}.
       * @param key the key
       * @return the largest key in the symbol table less than or equal to {@code key}
       * @throws Error if there is no such key
       * @throws Error if {@code key} is {@code null}
       */
      floor(key){
        if(this.assertOk(key) && this.isEmpty())
          throw Error(`calls floor with empty symbol table`);
        let x = this._floorNode(this.root, key);
        if(this.nil(x))
          throw Error(`argument to floor is too small`);
        return x.key;
      }
      // the largest key in the subtree rooted at x less than or equal to the given key
      _floorNode(x, key){
        if(this.nil(x)) return null;
        let cmp = this.compare(key,x.key);
        if(cmp == 0) return x;
        if(cmp < 0)  return this._floorNode(x.left, key);
        let t = this._floorNode(x.right, key);
        return t? t: x;
      }
      /**
       * Returns the smallest key in the symbol table greater than or equal to {@code key}.
       * @param key the key
       * @return the smallest key in the symbol table greater than or equal to {@code key}
       * @throws Error if there is no such key
       * @throws Error if {@code key} is {@code null}
       */
      ceiling(key){
        if(this.assertOk(key) && this.isEmpty())
          throw Error(`calls ceiling with empty symbol table`);
        let x = this._ceilingNode(this.root, key);
        if(this.nil(x))
          throw Error(`argument to ceiling is too small`);
        return x.key;
      }
      // the smallest key in the subtree rooted at x greater than or equal to the given key
      _ceilingNode(x, key){
        if(this.nil(x)) return null;
        let cmp = this.compare(key,x.key);
        if(cmp == 0) return x;
        if(cmp > 0)  return this._ceilingNode(x.right, key);
        let t = this._ceilingNode(x.left, key);
        return t? t: x;
      }
      /**
       * Return the key in the symbol table of a given {@code rank}.
       * This key has the property that there are {@code rank} keys in
       * the symbol table that are smaller. In other words, this key is the
       * ({@code rank}+1)st smallest key in the symbol table.
       *
       * @param  rank the order statistic
       * @return the key in the symbol table of given {@code rank}
       * @throws Error unless {@code rank} is between 0 and
       *        <em>n</em>–1
       */
      select(rank){
        if(rank < 0 || rank >= this.size())
            throw Error(`argument to select is invalid: ${rank}`);
        return this._selectNode(this.root, rank);
      }
      // Return key in BST rooted at x of given rank.
      // Precondition: rank is in legal range.
      _selectNode(x, rank){
        if(this.nil(x)) return null;
        let leftSize = this._sizeNode(x.left);
        return leftSize > rank? this._selectNode(x.left,  rank)
                              : (leftSize < rank? this._selectNode(x.right, rank - leftSize - 1): x.key);
      }
      /**
       * Return the number of keys in the symbol table strictly less than {@code key}.
       * @param key the key
       * @return the number of keys in the symbol table strictly less than {@code key}
       * @throws Error if {@code key} is {@code null}
       */
      rank(key){
        return this.assertOk(key) && this._rankNode(key, this.root);
      }
      // number of keys less than key in the subtree rooted at x
      _rankNode(key, x){
        if(this.nil(x)) return 0;
        let cmp = this.compare(key,x.key);
        return cmp < 0? this._rankNode(key, x.left)
                      :(cmp > 0? (1 + this._sizeNode(x.left) + this._rankNode(key, x.right)) :  this._sizeNode(x.left));
      }
      /***************************************************************************
       *  Range count and range search.
       ***************************************************************************/
      /**
       * Returns all keys in the symbol table in the given range,
       * as an {@code Iterable}.
       *
       * @param  lo minimum endpoint
       * @param  hi maximum endpoint
       * @return all keys in the symbol table between {@code lo}
       *    (inclusive) and {@code hi} (inclusive) as an {@code Iterable}
       * @throws Error if either {@code lo} or {@code hi}
       *    is {@code null}
       */
      keys(lo, hi){
        if(arguments.length==0){
          if(this.isEmpty()) return [];
          lo=this.min();
          hi=this.max();
        }
        this.assertOk(lo) && this.assertOk(hi);
        return this._keysNode(this.root, [], lo, hi);
      }
      // add the keys between lo and hi in the subtree rooted at x
      // to the queue
      _keysNode(x, queue, lo, hi){
        if(!this.nil(x)){
          let cmplo = this.compare(lo,x.key);
          let cmphi = this.compare(hi,x.key);
          if(cmplo < 0) this._keysNode(x.left, queue, lo, hi);
          if(cmplo <= 0 && cmphi >= 0) queue.push(x.key);
          if(cmphi > 0) this._keysNode(x.right, queue, lo, hi);
        }
        return queue;
      }
      /**
       * Returns the number of keys in the symbol table in the given range.
       *
       * @param  lo minimum endpoint
       * @param  hi maximum endpoint
       * @return the number of keys in the symbol table between {@code lo}
       *    (inclusive) and {@code hi} (inclusive)
       * @throws Error if either {@code lo} or {@code hi}
       *    is {@code null}
       */
      size(lo, hi){
        if(argmuments.length==0){
          return this._sizeNode(this.root);
        }else{
          this.assertOk(lo) && this.assertOk(hi);
          return this.compare(lo,hi) > 0? 0
                                        :(this.contains(hi)? (this._rankNode(hi) - this._rankNode(lo) + 1)
                                                           : (this._rankNode(hi) - this._rankNode(lo)));
        }
      }
      static eval(input,compareFn){
        let b= new RedBlackBST(compareFn);
        input.forEach((s,i)=> b.put(s,i));
        return b;
      }
      static test(){
        let obj= RedBlackBST.eval("SEARCHEXAMPLE".split(""), (a,b)=>{
          return a<b?-1:(a>b?1:0)
        });
        obj.keys().forEach(s=>{
          console.log(`${s} = ${obj.get(s)}`)
        });
      }
    }

    /**Provides a static method for binary searching for an integer in a sorted array of integers.
     * @memberof module:mcfud/algo_search
     * @class
     */
    class BinarySearch{
      /**Returns the index of the specified key in the specified array.
       * @param  a the array of integers, must be sorted in ascending order
       * @param  key the search key
       * @return index of key in array {@code a} if present; {@code -1} otherwise
       */
      static indexOf(a, key){
        let lo = 0,
            hi = a.length - 1;
        while(lo <= hi){
          // Key is in a[lo..hi] or not present.
          let mid = lo + (hi - lo) / 2;
          if(key < a[mid]) hi = mid - 1;
          else if(key > a[mid]) lo = mid + 1;
          else return mid;
        }
        return -1;
      }
      static test(){
        let inp= "84 48 68 10 18 98 12 23 54 57 33 16 77 11 29".split(" ").map(s=>{ return +s }).sort();
        let t="23 50 10 99 18 23 98 84 11 10 48 77 13 54 98 77 77 68".split(" ").map(s=>{return +s});
        t.forEach(n=>{
          if(BinarySearch.indexOf(inp,n)<0)
            console.log(n);
        })
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // throw an IllegalArgumentException unless {@code 0 <= v < V}
    function _validateVertex(v,V){
      if(v < 0 || v >= V)
        throw Error(`vertex ${v} is not between 0 and ${V-1}`);
    }
    /**Represents an undirected graph of vertices named 0 through <em>V</em> – 1.
     * @memberof module:mcfud/algo_search
     * @class
     * @property {number} V number of vertices
     * @property {number} E number of edges
     * @property {array} adjls list of adjacents
     */
    class Graph{
      static copy(G){
        if(G.V() < 0)
          throw Error("Number of vertices must be non-negative");
        let ret=new Graph(G.V());
        ret.edges= G.E();
        // update adjacency lists
        ret.adjls = new Array(G.V());
        for(let v = 0; v < V; ++v) ret.adjls[v] = new Bag();
        for(let v = 0; v < G.V(); ++v){
          // reverse so that adjacency list is in same order as original
          let reverse = new Stack();
          let it= G.adjls[v].iterator();
          while(it.hasNext()){
            reverse.push(it.next())
          }
          it=reverse.iterator();
          while(it.hasNext()){
            this.adjls[v].add(it.next())
          }
        }
        return ret;
      }
      /**
       * Initializes an empty graph with {@code V} vertices and 0 edges.
       * param V the number of vertices
       *
       * @param  V number of vertices
       * @throws Error if {@code V < 0}
       */
      constructor(V){
        if(V < 0)
          throw Error("Number of vertices must be non-negative");
        this.adjls = new Array(V);
        this.verts = V;
        this.edges = 0;
        for(let v = 0; v < V; ++v) this.adjls[v] = new Bag();
      }
      /**
       * Returns the number of vertices in this graph.
       *
       * @return the number of vertices in this graph
       */
      V(){
        return this.verts;
      }
      /**
       * Returns the number of edges in this graph.
       *
       * @return the number of edges in this graph
       */
      E(){
        return this.edges;
      }
      /**
       * Adds the undirected edge v-w to this graph.
       *
       * @param  v one vertex in the edge
       * @param  w the other vertex in the edge
       * @throws IllegalArgumentException unless both {@code 0 <= v < V} and {@code 0 <= w < V}
       */
      addEdge(v, w){
        _validateVertex(v,this.verts);
        _validateVertex(w,this.verts);
        this.edges++;
        this.adjls[v].add(w);
        this.adjls[w].add(v);
      }
      /**
       * Returns the vertices adjacent to vertex {@code v}.
       *
       * @param  v the vertex
       * @return the vertices adjacent to vertex {@code v}, as an iterable
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      adj(v){
        _validateVertex(v, this.verts);
        return this.adjls[v];
      }
      /**
       * Returns the degree of vertex {@code v}.
       *
       * @param  v the vertex
       * @return the degree of vertex {@code v}
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      degree(v){
        _validateVertex(v, this.verts);
        return this.adjls[v].size();
      }
      /**
       * Returns a string representation of this graph.
       *
       * @return the number of vertices <em>V</em>, followed by the number of edges <em>E</em>,
       *         followed by the <em>V</em> adjacency lists
       */
      toString(){
        let out=`${this.verts} vertices, ${this.edges} edges\n`;
        for(let it,v = 0; v < this.verts; ++v){
          out += `${v}: `;
          it= this.adjls[v].iterator();
          while(it.hasNext()){
            out += `${it.next()} `;
          }
          out += "\n";
        }
        return out;
      }
      static test(){
        let obj= new Graph(13);
        let a=[0,5,4,3,0,1,9,12,6,4,5,4,0,2,11,12,9,10,0,6,7,8,9,11,5,3];
        for(let i=0;i<a.length; i+=2){
          obj.addEdge(a[i], a[i+1]);
        }
        console.log(obj.toString());
      }
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // depth first search from v
    function _dfs(G, v,M){
      let w,it= G.adj(v).iterator();
      M.nCount++;
      M.bMarked[v] = true;
      while(it.hasNext()){
        w=it.next();
        if(!M.bMarked[w]) _dfs(G, w,M);
      }
    }
    /**
     * @memberof module:mcfud/algo_search
     * @class
     * @property {array} bMarked marked[v] = is there an s-v path?
     * @property {number} count number of vertices connected to s
     */
    class DepthFirstSearch{
      /**
       * Computes the vertices in graph {@code G} that are
       * connected to the source vertex {@code s}.
       * @param G the graph
       * @param s the source vertex
       * @throws Error unless {@code 0 <= s < V}
       */
      constructor(G, s){
        this.bMarked = new Array(G.V()); // marked[v] = is there an s-v path?
        this.nCount=0; // number of vertices connected to s
        _validateVertex(s,this.bMarked.length);
        _dfs(G, s, this);
      }
      /**
       * Is there a path between the source vertex {@code s} and vertex {@code v}?
       * @param v the vertex
       * @return {@code true} if there is a path, {@code false} otherwise
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      marked(v){
        _validateVertex(v,this.bMarked.length);
        return this.bMarked[v];
      }
      /**
       * Returns the number of vertices connected to the source vertex {@code s}.
       * @return the number of vertices connected to the source vertex {@code s}
       */
      count(){
        return this.nCount;
      }
      static test(){
        let g=new Graph(13);
        let a=[0,5,4,3,0,1,9,12,6,4,5,4,0,2,11,12,9,10,0,6,7,8,9,11,5,3];
        for(let i=0;i<a.length; i+=2){ g.addEdge(a[i], a[i+1]); }
        let obj= new DepthFirstSearch(g, 0);
        for(let v = 0; v < g.V(); ++v)
          if(obj.marked(v)) console.log(v + " ");
        console.log(obj.count() != g.V()? "NOT connected" :"connected");
        obj= new DepthFirstSearch(g, 9);
        for(let v = 0; v < g.V(); ++v)
          if(obj.marked(v)) console.log(v + " ");
        console.log(obj.count() != g.V()? "NOT connected" :"connected");
      }
    }
    /**Represents a data type for finding the vertices connected to a source vertex <em>s</em> in the undirected graph.
     * @memberof module:mcfud/algo_search
     * @class
     * @property {array} bMarked marked[v] = is there an s-v path?
     */
    class NonrecursiveDFS{
      /**
       * Computes the vertices connected to the source vertex {@code s} in the graph {@code G}.
       * @param G the graph
       * @param s the source vertex
       * @throws Error unless {@code 0 <= s < V}
       */
      constructor(G, s){
        this.bMarked = new Array(G.V()); // marked[v] = is there an s-v path?
        _validateVertex(s,this.bMarked.length);
        // to be able to iterate over each adjacency list, keeping track of which
        // vertex in each adjacency list needs to be explored next
        let adj = new Array(G.V());
        for(let v = 0; v < G.V(); ++v)
          adj[v] = G.adj(v).iterator();
        // depth-first search using an explicit stack
        let it,v,w,stack = new Stack();
        this.bMarked[s] = true;
        stack.push(s);
        while(!stack.isEmpty()){
          v = stack.peek();
          it=adj[v];
          if(it.hasNext()){
            w = it.next();
            //console.log(`check ${w}`);
            if(!this.bMarked[w]){
              // discovered vertex w for the first time
              this.bMarked[w] = true;
              // edgeTo[w] = v;
              stack.push(w);
              //console.log(`dfs(${w})`);
            }
          }else{
            //console.log(`${v} done`);
            stack.pop();
          }
        }
      }
      /**
       * Is vertex {@code v} connected to the source vertex {@code s}?
       * @param v the vertex
       * @return {@code true} if vertex {@code v} is connected to the source vertex {@code s},
       *    and {@code false} otherwise
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      marked(v){
        _validateVertex(v,this.bMarked.length);
        return this.bMarked[v];
      }
      static test(){
        let g = new Graph(13);
        let a=[0,5,4,3,0,1,9,12,6,4,5,4,0,2,11,12,9,10,0,6,7,8,9,11,5,3];
        for(let i=0;i<a.length; i+=2){ g.addEdge(a[i], a[i+1]); }
        let obj = new NonrecursiveDFS(g, 0);
        for(let v = 0; v < g.V(); ++v)
          if(obj.marked(v)) console.log(v + " ");
        console.log("***");
        obj = new NonrecursiveDFS(g, 9);
        for(let v = 0; v < g.V(); ++v)
          if(obj.marked(v)) console.log(v + " ");
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // depth first search from v
    function _dfs(G, v,M){
      let w,it=G.adj(v).iterator();
      M.bMarked[v] = true;
      while(it.hasNext()){
        w=it.next();
        if(!M.bMarked[w]){
          M.edgeTo[w] = v;
          _dfs(G, w,M);
        }
      }
    }

    /**Represents a data type for finding paths from a source vertex <em>s</em>
     * to every other vertex in an undirected graph.
     * @memberof module:mcfud/algo_search
     * @class
     * @property {array} bMarked marked[v] = is there an s-v path?
     * @property {number} s source index
     * @property {array} edgeTo edgeTo[v] = last edge on s-v path
     */
    class DepthFirstPaths{
      /**
       * Computes a path between {@code s} and every other vertex in graph {@code G}.
       * @param G the graph
       * @param s the source vertex
       * @throws IllegalArgumentException unless {@code 0 <= s < V}
       */
      constructor(G, s){
        this.bMarked = new Array(G.V());
        this.edgeTo = new Array(G.V());
        this.s = s; // source vertex
        _validateVertex(s,this.bMarked.length);
        _dfs(G, s,this);
      }
      /**
       * Is there a path between the source vertex {@code s} and vertex {@code v}?
       * @param v the vertex
       * @return {@code true} if there is a path, {@code false} otherwise
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      hasPathTo(v){
        _validateVertex(v,this.bMarked.length);
        return this.bMarked[v];
      }
      /**
       * Returns a path between the source vertex {@code s} and vertex {@code v}, or
       * {@code null} if no such path.
       * @param  v the vertex
       * @return the sequence of vertices on a path between the source vertex
       *         {@code s} and vertex {@code v}, as an Iterable
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      pathTo(v){
        _validateVertex(v,this.bMarked.length);
        if(!this.hasPathTo(v)) return null;
        let path = new Stack();
        for(let x = v; x != this.s; x = this.edgeTo[x]) path.push(x);
        path.push(this.s);
        return path;
      }
      static test(){
        let G = new Graph(6);
        let s=0,a=[0,5,2,4,2,3,1,2,0,1,3,4,3,5,0,2];
        for(let i=0;i<a.length; i+=2){ G.addEdge(a[i], a[i+1]) }
        let obj = new DepthFirstPaths(G, s);
        for(let m,it,x, v = 0; v < G.V(); ++v){
          if(obj.hasPathTo(v)){
            m= `${s} to ${v}:  `;
            it=obj.pathTo(v).iterator();
            while(it.hasNext()){
              x=it.next();
              m += x==s? x : `-${x}`;
            }
            console.log(m);
          }else{
            console.log(`${s} to ${v}:  not connected\n`);
          }
        }
      }
    }

    DepthFirstPaths.test();
    //NonrecursiveDFS.test();
    //DepthFirstSearch.test();
    //Graph.test();
    //BinarySearch.test();
    //RedBlackBST.test();
    //BST.test();
    //BinarySearchST.test();
    //SequentialSearchST.test();
    //FrequencyCounter.test();

    const _$={
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("../main/core"),require("./basic"))
  }else{
    gscope["io/czlab/mcfud/algo/search"]=_module
  }

})(this);


