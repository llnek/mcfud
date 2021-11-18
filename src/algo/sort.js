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
    const CMP=(a,b)=>{ return a<b?-1:(a>b?1:0) }
    const int=Math.floor;
    const {is,u:_}= Core;
    const {Bag,Stack,Node}= Basic;

    /**
     * @module mcfud/algo_sort
     */

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function less(v, w, cmp){ return cmp(v,w) < 0 }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function exch(a, i, j){
      const swap = a[i];
      a[i] = a[j];
      a[j] = swap;
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function isSorted(a,C){ return isSorted3(a, 0, a.length,C) }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function isSorted3(a, lo, hi,C){
      for(let i = lo + 1; i < hi; ++i)
        if(less(a[i], a[i-1], C)) return false;
      return true;
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function show(a){
      for(let i = 0; i < a.length; ++i) console.log(a[i])
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Provides static methods for sorting an array using insertion sort.
     * @memberof module:mcfud/algo_sort
     * @class
     */
    class Insertion{
      /**Rearranges the array in ascending order, using the natural order.
       * @param {array} a the array to be sorted
       * @param {function} compareFn
       * @return {array}
       */
      static sort(a,compareFn){
        const n = a.length;
        for(let i=1; i<n; ++i){
          for(let j=i; j>0 && less(a[j], a[j-1],compareFn); --j){
            exch(a, j, j-1);
          }
        }
        return a;
      }
      /**Rearranges the subarray a[lo..hi) in ascending order, using the natural order.
       * @param {array} a the array to be sorted
       * @param {number} lo left endpoint (inclusive)
       * @param {number} hi right endpoint (exclusive)
       * @param {function} compareFn
       * @return {array}
       */
      static sortRange(a, lo, hi,compareFn){
        for(let i = lo + 1; i < hi; ++i){
          for(let j = i; j > lo && less(a[j], a[j-1],compareFn); --j){
            exch(a, j, j-1);
          }
        }
        return a;
      }
      /**Returns a permutation that gives the elements in the array in ascending order.
       * @param a the array
       * @return a permutation {@code p[]} such that {@code a[p[0]]}, {@code a[p[1]]},
       *    ..., {@code a[p[n-1]]} are in ascending order
       */
      static indexSort(a,compareFn){
        // do not change the original array a[]
        let n = a.length;
        let index = new Array(n);
        for(let i=0; i<n; ++i) index[i] = i;
        for(let i=1; i<n; ++i)
          for(let j=i; j>0 && less(a[index[j]], a[index[j-1]],compareFn); --j)
            exch(index, j, j-1);
        return index;
      }
      static test(){
        let obj="SORTEXAMPLE".split("");
        show(Insertion.sort(obj,CMP));
        obj="bed bug dad yes zoo all bad yet".split(" ");
        show(Insertion.sortRange(obj,0,obj.length,CMP));
      }
    }

    /**Provides a static method for sorting an array using an optimized
     * binary insertion sort with half exchanges.
     * @memberof module:mcfud/algo_sort
     * @class
     */
    class BinaryInsertion{
      /**Rearranges the array in ascending order, using the natural order.
       * @param {array} a the array to be sorted
       * @param {function} compareFn
       * @return {array}
       */
      static sort(a,compareFn){
        let mid,lo,hi,n = a.length;
        for(let v,i = 1; i < n; ++i){
          // binary search to determine index j at which to insert a[i]
          lo = 0; hi = i; v = a[i];
          while(lo < hi){
            mid = lo + int((hi - lo) / 2);
            if(less(v, a[mid],compareFn)) hi = mid;
            else lo = mid + 1;
          }
          // insetion sort with "half exchanges"
          // (insert a[i] at index j and shift a[j], ..., a[i-1] to right)
          for(let j = i; j > lo; --j) a[j] = a[j-1];
          a[lo] = v;
        }
        return a;
      }
      static test(){
        let obj="SORTEXAMPLE".split("");
        show(BinaryInsertion.sort(obj,CMP));
        obj="bed bug dad yes zoo all bad yet".split(" ");
        show(BinaryInsertion.sort(obj,CMP));
      }
    }

    /**Provides static methods for sorting an array using <em>selection sort</em>.
     * @memberof module:mcfud/algo_sort
     * @class
     */
    class Selection{
      /**Rearranges the array in ascending order, using a comparator.
       * @param {array} a the array
       * @param {function} comparator the comparator specifying the order
       */
      static sort(a, compareFn){
        let min,n = a.length;
        for(let i = 0; i < n; ++i){
          min = i;
          for(let j = i+1; j < n; ++j)
            if(less(a[j], a[min],compareFn)) min = j;
          exch(a, i, min);
        }
        return a;
      }
      static test(){
        let obj="SORTEXAMPLE".split("");
        show(Selection.sort(obj,CMP));
        obj="bed bug dad yes zoo all bad yet".split(" ");
        show(Selection.sort(obj,CMP));
      }
    }

    /**Provides static methods for sorting an array using <em>Shellsort</em>.
     * @memberof module:mcfud/algo_sort
     * @class
     */
    class Shell{
      /**Rearranges the array in ascending order, using the natural order.
       * @param {array} a the array to be sorted
       * @param {function} compareFn
       * @return {array}
       */
      static sort(a, compareFn){
        let n = a.length,
            h=1,
            n3=int(n/3);
        // 3x+1 increment sequence:  1, 4, 13, 40, 121, 364, 1093, ...
        while(h < n3) h = 3*h + 1;
        while(h >= 1){
          // h-sort the array
          for(let i = h; i < n; ++i){
            for(let j = i; j >= h && less(a[j], a[j-h],compareFn); j -= h)
              exch(a, j, j-h);
          }
          h=int(h/3);
        }
        return a;
      }
      static test(){
        let obj="SORTEXAMPLE".split("");
        show(Shell.sort(obj,CMP));
        obj="bed bug dad yes zoo all bad yet".split(" ");
        show(Shell.sort(obj,CMP));
      }
    }
    /***************************************************************************
     *  Index mergesort.
     ***************************************************************************/
    // stably merge a[lo .. mid] with a[mid+1 .. hi] using aux[lo .. hi]
    function mergeIndex(a, index, aux, lo, mid, hi,C){
      // copy to aux[]
      for(let k = lo; k <= hi; ++k){ aux[k] = index[k] }
      // merge back to a[]
      let i = lo, j = mid+1;
      for(let k = lo; k <= hi; ++k){
        if(i > mid) index[k] = aux[j++];
        else if(j > hi) index[k] = aux[i++];
        else if(less(a[aux[j]], a[aux[i]],C)) index[k] = aux[j++];
        else index[k] = aux[i++];
      }
      return a;
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // stably merge a[lo .. mid] with a[mid+1 ..hi] using aux[lo .. hi]
    function merge(a, aux, lo, mid, hi,C){
      // precondition: a[lo .. mid] and a[mid+1 .. hi] are sorted subarrays
      //assert isSorted(a, lo, mid);
      //assert isSorted(a, mid+1, hi);
      // copy to aux[]
      for(let k = lo; k <= hi; ++k){ aux[k] = a[k] }
      // merge back to a[]
      let i = lo, j = mid+1;
      for(let k = lo; k <= hi; ++k){
        if(i > mid) a[k] = aux[j++];
        else if(j > hi) a[k] = aux[i++];
        else if(less(aux[j], aux[i],C)) a[k] = aux[j++];
        else a[k] = aux[i++];
      }
      // postcondition: a[lo .. hi] is sorted
      //assert isSorted(a, lo, hi);
      return a;
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // mergesort a[lo..hi] using auxiliary array aux[lo..hi]
    function sort(a, aux, lo, hi,C){
      if(hi <= lo){}else{
        let mid = lo + int((hi - lo) / 2);
        sort(a, aux, lo, mid,C);
        sort(a, aux, mid + 1, hi,C);
        merge(a, aux, lo, mid, hi,C);
      }
      return a;
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // mergesort a[lo..hi] using auxiliary array aux[lo..hi]
    function sortIndex(a, index, aux, lo, hi,C){
      if(hi <= lo){}else{
        let mid = lo + int((hi - lo) / 2);
        sortIndex(a, index, aux, lo, mid,C);
        sortIndex(a, index, aux, mid + 1, hi,C);
        mergeIndex(a, index, aux, lo, mid, hi,C);
      }
      return a;
    }

    /**Provides static methods for sorting an array
     * using a top-down, recursive version of <em>mergesort</em>.
     * @memberof module:mcfud/algo_sort
     * @class
     */
    class Merge{
      /**Rearranges the array in ascending order, using the natural order.
       * @param {array} a the array to be sorted
       * @param {function} compareFn
       * @return {array}
       */
      static sort(a,compareFn){
        let aux = new Array(a.length);
        sort(a, aux, 0, a.length-1,compareFn);
        return a;
      }
      /**Returns a permutation that gives the elements in the array in ascending order.
       * @param {array} a the array
       * @return a permutation {@code p[]} such that {@code a[p[0]]}, {@code a[p[1]]},
       *    ..., {@code a[p[N-1]]} are in ascending order
       */
      static indexSort(a,C){
        let n = a.length,
            index = new Array(n);
        for(let i = 0; i < n; ++i) index[i] = i;
        let aux = new Array(n);
        sortIndex(a, index, aux, 0, n-1,C);
        return index;
      }
      static test(){
        let obj="SORTEXAMPLE".split("");
        show(Merge.sort(obj,CMP));
        //Merge.indexSort(obj,CMP).forEach(x=> console.log("x= "+x));
        obj="bed bug dad yes zoo all bad yet".split(" ");
        show(Merge.sort(obj,CMP));
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function XXshuffle(a){
      for(let t,j,i = a.length - 1; i > 0; --i){
        j = int(_.rand() * (i + 1));
        t= a[i];
        a[i] = a[j];
        a[j] = t;
      }
      return a;
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    //function less(v, w,C){ return (v == w)?false:C(v,w)<0 }
    // quicksort the subarray from a[lo] to a[hi]
    function sort(a, lo, hi,C){
      if(hi <= lo){}else{
        let j = partition(a, lo, hi,C);
        sort(a, lo, j-1,C);
        sort(a, j+1, hi,C);
      }
      return a;
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // partition the subarray a[lo..hi] so that a[lo..j-1] <= a[j] <= a[j+1..hi]
    // and return the index j.
    function partition(a, lo, hi,C){
      let i = lo,
          v = a[lo],
          j = hi + 1;
      while(true){
        // find item on lo to swap
        while(less(a[++i], v,C)){
          if(i == hi) break;
        }
        // find item on hi to swap
        while(less(v, a[--j],C)){
          if(j == lo) break;// redundant since a[lo] acts as sentinel
        }
        // check if pointers cross
        if(i >= j) break;
        exch(a, i, j);
      }
      // put partitioning item v at a[j]
      exch(a, lo, j);
      // now, a[lo .. j-1] <= a[j] <= a[j+1 .. hi]
      return j;
    }

    /**Provides static methods for sorting an array using bubble sort.
     * @memberof module:mcfud/algo_sort
     * @class
     */
    class Bubble{
      /**
       * Rearranges the array in ascending order, using the natural order.
       * @param a the array to be sorted
       */
      static sort(a,C){
        function less(v, w){ return C(v,w) < 0 }
        function exch(a, i, j){
          let swap = a[i];
          a[i] = a[j];
          a[j] = swap;
        }
        let n = a.length;
        for(let x, i = 0; i < n; i++){
          x = 0;
          for(let j = n-1; j > i; j--){
            if(less(a[j], a[j-1])){
              exch(a, j, j-1);
              x++;
            }
          }
          if(x == 0) break;
        }
        return a;
      }
      static test(){
        let obj="bed bug dad yes zoo all bad yet".split(" ");
        Bubble.sort(obj,CMP);
        for(let i=0;i<obj.length;++i)
          console.log(obj[i]);
      }
    }

    /**Provides static methods for sorting an array and
     * selecting the ith smallest element in an array using quicksort.
     * @memberof module:mcfud/algo_sort
     * @class
     */
    class Quick{
      /**Rearranges the array in ascending order, using the natural order.
       * @param {array} a the array to be sorted
       * @param {function} compareFn
       */
      static sort(a,compareFn){
        _.shuffle(a);
        sort(a, 0, a.length - 1,compareFn);
        return a;
      }
      /**Rearranges the array so that {@code a[k]} contains the kth smallest key;
       * {@code a[0]} through {@code a[k-1]} are less than (or equal to) {@code a[k]}; and
       * {@code a[k+1]} through {@code a[n-1]} are greater than (or equal to) {@code a[k]}.
       *
       * @param  {array} a the array
       * @param  {number} k the rank of the key
       * @param {function} compareFn
       * @return the key of rank {@code k}
       * @throws Error unless {@code 0 <= k < a.length}
       */
      static select(a, k,compareFn){
        if(k < 0 || k >= a.length)
          throw Error(`index is not between 0 and ${a.length}: ${k}`);
        _.shuffle(a);
        let lo = 0, hi = a.length - 1;
        while(hi > lo){
          let i = partition(a, lo, hi, compareFn);
          if(i > k) hi = i - 1;
          else if(i < k) lo = i + 1;
          else return a[i];
        }
        return a[lo];
      }
      static test(){
        let obj="bed bug dad yes zoo all bad yet".split(" ");
        show(Quick.sort(obj,CMP));
        obj="SORTEXAMPLE".split("");
        show(Quick.sort(obj, CMP));
        _.shuffle(obj)
        obj.forEach((s,i)=> console.log(Quick.select(obj,i,CMP)));
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function less4(a,i, j,C){ return less(a[i], a[j],C) }
    function swim(k, M){
      while(k > 1 && less4(M.pq, int(k/2), k,M.comparator)){
        exch(M.pq, k, int(k/2));
        k = int(k/2);
      }
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function sink(k,M){
      let j;
      while(2*k <= M.n){
        j = 2*k;
        if(j < M.n && less4(M.pq, j, j+1,M.comparator)) j++;
        if(!less4(M.pq, k, j,M.comparator)) break;
        exch(M.pq, k, j);
        k = j;
      }
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // is pq[1..n] a max heap?
    function isMaxHeap(M){
      for(let i=1; i <= M.n; ++i)
        if(_.nichts(M.pq[i])) return false;

      for(let i = M.n+1; i < M.pq.length; ++i)
        if(!_.nichts(M.pq[i])) return false;

      if(!_.nichts(M.pq[0])) return false;
      return isMaxHeapOrdered(1,M);
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // is subtree of pq[1..n] rooted at k a max heap?
    function isMaxHeapOrdered(k,M){
      if(k > M.n) return true;
      let left = 2*k,
          right = 2*k + 1;
      if(left  <= M.n && less4(M.pq, k, left,M.comparator))  return false;
      if(right <= M.n && less4(M.pq, k, right,M.comparator)) return false;
      return isMaxHeapOrdered(left,M) && isMaxHeapOrdered(right,M);
    }
    // resize the underlying array to have the given capacity
    function _resize(c,M){
      //assert c > n;
      const temp = new Array(c);
      for(let i = 1; i <= M.n; ++i) temp[i] = M.pq[i];
      M.pq = temp;
    }

    /**Represents a priority queue of generic keys.
     * @memberof module:mcfud/algo_sort
     * @class
     * @property {function} comparator
     * @property {number} n // number of items on priority queue
     * @property {array} pq // store items at indices 1 to n
     */
    class MinPQ{
      /**Initializes an empty priority queue with the given initial capacity.
       * @param  initCapacity the initial capacity of this priority queue
       */
      constructor(compareFn, keys){
        this.comparator = compareFn;
        this.n=0;
        if(is.vec(keys)){
          this.pq = new Array(keys.length + 1);
          this.n = keys.length;
          for(let i = 0; i < this.n; ++i) this.pq[i+1] = keys[i];
          for(let k = int(this.n/2); k >= 1; --k) this.sink(k,this);
        }else{
          this.pq= new Array(is.num(keys)? keys: 2);
        }
      }
      /**Returns true if this priority queue is empty.
       * @return {@code true} if this priority queue is empty; {@code false} otherwise
       */
      isEmpty(){
        return this.n == 0;
      }
      /**Returns the number of keys on this priority queue.
       * @return the number of keys on this priority queue
       */
      size(){
        return this.n;
      }
      /**Returns a smallest key on this priority queue.
       * @return a smallest key on this priority queue
       * @throws Error if this priority queue is empty
       */
      min(){
        if(this.isEmpty()) throw Error("Priority queue underflow");
        return this.pq[1];
      }
      // resize the underlying array to have the given capacity
      _resize(c){
        _.assert(c> this.n,"bad resize capacity");
        let temp = new Array(c);
        for(let i = 1; i <= this.n; i++) temp[i] = this.pq[i];
        this.pq = temp;
      }
      /**Adds a new key to this priority queue.
       * @param  x the key to add to this priority queue
       */
      insert(x){
        // double size of array if necessary
        if(this.n == this.pq.length - 1) this._resize(2 * this.pq.length);
        // add x, and percolate it up to maintain heap invariant
        this.pq[++this.n] = x;
        this.swim(this.n);
        //assert isMinHeap();
      }
      /**Removes and returns a smallest key on this priority queue.
       * @return a smallest key on this priority queue
       * @throws Error if this priority queue is empty
       */
      delMin(){
        if(this.isEmpty()) throw Error("Priority queue underflow");
        let min = this.pq[1];
        exch(this.pq, 1, this.n--);
        this.sink(1);
        this.pq[this.n+1] = null;     // to avoid loitering and help with garbage collection
        if((this.n > 0) && (this.n == (this.pq.length - 1) / 4)) this._resize(this.pq.length / 2);
        //assert isMinHeap();
        return min;
      }
      swim(k){
        while(k > 1 && this.greater(int(k/2), k)){
          exch(this.pq, k, int(k/2));
          k = int(k/2);
        }
      }
      sink(k){
        while(2*k <= this.n){
          let j = 2*k;
          if(j < this.n && this.greater(j, j+1)) j++;
          if(!this.greater(k, j)) break;
          exch(this.pq, k, j);
          k = j;
        }
      }
      greater(i, j){
        return this.comparator(this.pq[i], this.pq[j]) > 0;
      }
      // is pq[1..n] a min heap?
      isMinHeap(){
        for(let i = 1; i <= this.n; i++) if(_.nichts(this.pq[i])) return false;
        for(let i = this.n+1; i < this.pq.length; i++) if(!_.nichts(this.pq[i])) return false;
        if(!_.nichts(this.pq[0])) return false;
        return this.isMinHeapOrdered(1);
      }
      // is subtree of pq[1..n] rooted at k a min heap?
      isMinHeapOrdered(k){
        if(k > this.n) return true;
        let left = 2*k;
        let right = 2*k + 1;
        if(left  <= this.n && this.greater(k, left))  return false;
        if(right <= this.n && this.greater(k, right)) return false;
        return this.isMinHeapOrdered(left) && this.isMinHeapOrdered(right);
      }
      /**Returns an iterator that iterates over the keys on this priority queue
       * in ascending order.
       * <p>
       * The iterator doesn't implement {@code remove()} since it's optional.
       *
       * @return an iterator that iterates over the keys in ascending order
       */
      iterator(){
        // add all items to copy of heap takes linear time since already in heap order so no keys move
        let copy = new MinPQ(this.comparator, this.size());
        for(let i = 1; i <= this.n; i++) copy.insert(this.pq[i]);
        return{
          remove(){ throw Error("UnsupportedOperationException") },
          hasNext(){ return !copy.isEmpty() },
          next(){
            if(!this.hasNext()) throw Error("NoSuchElementException");
            return copy.delMin();
          }
        }
      }
      static test(){
        let msg="",
            obj= new MinPQ(CMP);
        "PQE".split("").forEach(s=>obj.insert(s));
        msg += obj.delMin() + " ";
        "XAM".split("").forEach(s=>obj.insert(s));
        msg += obj.delMin() + " ";
        "PLE".split("").forEach(s=>obj.insert(s));
        msg += obj.delMin() + " ";
        console.log(msg)
        console.log("(" + obj.size() + " left on pq)");
      }
    }

      /**Represents a priority queue of generic keys.
       * @memberof module:mcfud/algo_sort
       * @class
       * @property {function} comparator
       * @property {number} n // number of items on priority queue
       * @property {array} pq // store items at indices 1 to n
       */
      class MaxPQ{
        /**Initializes an empty priority queue with the given initial capacity,
         * using the given comparator.
         * @param {function} compareFn
         * @param {any} keys
         */
        constructor(compareFn, keys){
          this.comparator = compareFn;
          this.n=0;
          if(is.vec(keys)){
            this.pq = new Array(keys.length + 1);
            this.n = keys.length;
            for(let i = 0; i < this.n; ++i) this.pq[i+1] = keys[i];
            for(let k = int(this.n/2); k >= 1; --k) sink(k,this);
          }else{
            this.pq= new Array(is.num(keys)? keys: 2);
          }
        }
        /**Returns true if this priority queue is empty.
         * @return {@code true} if this priority queue is empty;
         *         {@code false} otherwise
         */
        isEmpty(){
          return this.n == 0
        }
        /**Returns the number of keys on this priority queue.
         * @return the number of keys on this priority queue
         */
        size(){
          return this.n
        }
        /**Returns a largest key on this priority queue.
         * @return a largest key on this priority queue
         * @throws Error if this priority queue is empty
         */
        max(){
          if(this.isEmpty())
            throw Error("Priority queue underflow");
          return this.pq[1];
        }
        /**Adds a new key to this priority queue.
         * @param  x the new key to add to this priority queue
         */
        insert(x){
          // double size of array if necessary
          if(this.n == this.pq.length-1) _resize(2 * this.pq.length, this);
          // add x, and percolate it up to maintain heap invariant
          this.n+=1;
          this.pq[this.n] = x;
          swim(this.n, this);
          //assert isMaxHeap();
        }
        /**Removes and returns a largest key on this priority queue.
         * @return a largest key on this priority queue
         * @throws Error if this priority queue is empty
     */
    delMax(){
      if(this.isEmpty())
        throw Error("Priority queue underflow");
      let max = this.pq[1];
      exch(this.pq, 1, this.n, this.comparator);
      this.n-=1;
      sink(1,this);
      this.pq[this.n+1] = null;     // to avoid loitering and help with garbage collection
      if(this.n > 0 &&
         this.n == (this.pq.length - 1)/4) _resize(int(this.pq.length / 2), this);
      return max;
    }
    /**Returns an iterator that iterates over the keys on this priority queue
     * in descending order.
     * The iterator doesn't implement {@code remove()} since it's optional.
     * @return an iterator that iterates over the keys in descending order
     */
    iterator(){
      // add all items to copy of heap
      // takes linear time since already in heap order so no keys move
      const copy = new MaxPQ(this.comparator, this.size());
      for(let i = 1; i <= this.n; ++i) copy.insert(this.pq[i]);
      return{
        remove(){ throw Error("UnsupportedOperationException") },
        hasNext(){ return !copy.isEmpty() },
        next(){
          if(!this.hasNext()) throw Error("NoSuchElementException");
          return copy.delMax();
        }
      }
    }
    static test(){
      let msg="",
          obj= new MaxPQ(CMP);
      "PQE".split("").forEach(s=>obj.insert(s));
      msg += obj.delMax() + " ";
      "XAM".split("").forEach(s=>obj.insert(s));
      msg += obj.delMax() + " ";
      "PLE".split("").forEach(s=>obj.insert(s));
      msg += obj.delMax() + " ";
      console.log(msg)
      console.log("(" + obj.size() + " left on pq)");
    }
  }

  /***************************************************************************
   * Helper functions for comparisons and swaps.
   * Indices are "off-by-one" to support 1-based indexing.
   ***************************************************************************/
  function lessOneOff(pq, i, j, C){
    return C(pq[i-1], pq[j-1]) < 0
  }
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  function exchOneOff(pq, i, j){
    const swap = pq[i-1];
    pq[i-1] = pq[j-1];
    pq[j-1] = swap;
  }
  //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
  function sink4(pq, k, n,C){
    while(2*k <= n){
      let j = 2*k;
      if(j < n && lessOneOff(pq, j, j+1,C)) j++;
      if(!lessOneOff(pq, k, j,C)) break;
      exchOneOff(pq, k, j);
      k = j;
    }
  }

  /**Provides a static method to sort an array using <em>heapsort</em>.
   * @memberof module:mcfud/algo_sort
   * @class
   */
  class Heap{
    /**Rearranges the array in ascending order, using the natural order.
     * @param {array} pq the array to be sorted
     * @param {function} compareFn
     */
    static sort(pq,compareFn){
      let n = pq.length;
      // heapify phase
      for(let k = int(n/2); k >= 1; --k)
        sink4(pq, k, n, compareFn);
      // sortdown phase
      let k = n;
      while(k > 1){
        exchOneOff(pq, 1, k--);
        sink4(pq, 1, k,compareFn);
      }
      //////
      return pq;
    }
    static test(){
      let obj="SORTEXAMPLE".split("");
      show(Heap.sort(obj,CMP));
      obj="bed bug dad yes zoo all bad yet".split(" ");
      show(Heap.sort(obj,CMP));
    }
  }

  /**Represents an indexed priority queue of generic keys.
   * @memberof module:mcfud/algo_sort
   * @class
   * @property {number} maxN  maximum number of elements on PQ
   * @property {number} n number of elements on PQ
   * @property {array} pq  binary heap using 1-based indexing
   * @property {array} qp  inverse of pq - qp[pq[i]] = pq[qp[i]] = i
   * @property {array} mKeys  keys[i] = priority of i
   */
  class IndexMinPQ{
    /**
     * Initializes an empty indexed priority queue with indices between {@code 0}
     * and {@code maxN - 1}.
     * @param  maxN the keys on this priority queue are index from {@code 0} {@code maxN - 1}
     * @throws Error if {@code maxN < 0}
     */
    constructor(maxN,compareFn){
      if(maxN < 0) throw Error(`IllegalArgumentException`);
      this.compare=compareFn;
      this.maxN = maxN;
      this.n = 0;
      this.mKeys = new Array(maxN+1);    // make this of length maxN??
      this.pq = new Array(maxN + 1);
      this.qp   = new Array(maxN + 1);                   // make this of length maxN??
      for(let i = 0; i <= maxN; i++) this.qp[i] = -1;
    }
    /**Returns true if this priority queue is empty.
     *
     * @return {@code true} if this priority queue is empty;
     *         {@code false} otherwise
     */
    isEmpty() {
      return this.n == 0;
    }
    /**Is {@code i} an index on this priority queue?
     *
     * @param  i an index
     * @return {@code true} if {@code i} is an index on this priority queue;
     *         {@code false} otherwise
     * @throws Error unless {@code 0 <= i < maxN}
     */
    contains(i){
      this.validateIndex(i);
      return this.qp[i] != -1;
    }
    /**Returns the number of keys on this priority queue.
     * @return the number of keys on this priority queue
     */
    size(){
      return this.n;
    }
    /**Associates key with index {@code i}.
     *
     * @param  i an index
     * @param  key the key to associate with index {@code i}
     * @throws Error unless {@code 0 <= i < maxN}
     * @throws Error if there already is an item associated
     *         with index {@code i}
     */
    insert(i, key){
      this.validateIndex(i);
      if(this.contains(i)) throw Error("index is already in the priority queue");
      this.n++;
      this.qp[i] = this.n;
      this.pq[this.n] = i;
      this.mKeys[i] = key;
      this.swim(this.n);
    }
    /**Returns an index associated with a minimum key.
     *
     * @return an index associated with a minimum key
     * @throws Error if this priority queue is empty
     */
    minIndex(){
      if(this.n == 0) throw Error("Priority queue underflow");
      return this.pq[1];
    }
    /**Returns a minimum key.
     *
     * @return a minimum key
     * @throws Error if this priority queue is empty
     */
    minKey(){
      if(this.n == 0) throw Error("Priority queue underflow");
      return this.mKeys[this.pq[1]];
    }
    /**
     * Removes a minimum key and returns its associated index.
     * @return an index associated with a minimum key
     * @throws Error if this priority queue is empty
     */
    delMin(){
      if(this.n == 0) throw Error("Priority queue underflow");
      let min = this.pq[1];
      this.exch(1, this.n--);
      this.sink(1);
      _.assert(min == this.pq[this.n+1], "No good");
      this.qp[min] = -1;        // delete
      this.mKeys[min] = null;    // to help with garbage collection
      this.pq[this.n+1] = -1;        // not needed
      return min;
    }
    /**
     * Returns the key associated with index {@code i}.
     *
     * @param  i the index of the key to return
     * @return the key associated with index {@code i}
     * @throws Error unless {@code 0 <= i < maxN}
     * @throws Error no key is associated with index {@code i}
     */
    keyOf(i){
      this.validateIndex(i);
      if(!this.contains(i)) throw Error("index is not in the priority queue");
      return this.mKeys[i];
    }
    /**
     * Change the key associated with index {@code i} to the specified value.
     *
     * @param  i the index of the key to change
     * @param  key change the key associated with index {@code i} to this key
     * @throws Error unless {@code 0 <= i < maxN}
     * @throws Error no key is associated with index {@code i}
     */
    changeKey(i, key){
      this.validateIndex(i);
      if(!this.contains(i)) throw Error("index is not in the priority queue");
      this.mKeys[i] = key;
      this.swim(this.qp[i]);
      this.sink(this.qp[i]);
    }
    /**
     * Decrease the key associated with index {@code i} to the specified value.
     *
     * @param  i the index of the key to decrease
     * @param  key decrease the key associated with index {@code i} to this key
     * @throws Error unless {@code 0 <= i < maxN}
     * @throws Error if {@code key >= keyOf(i)}
     * @throws Error no key is associated with index {@code i}
     */
    decreaseKey(i, key){
      this.validateIndex(i);
      if(!this.contains(i)) throw Error("index is not in the priority queue");
      let c=this.compare(this.mKeys[i],key);
      if(c== 0)
        throw Error("Calling decreaseKey() with a key equal to the key in the priority queue");
      if(c< 0)
        throw Error("Calling decreaseKey() with a key strictly greater than the key in the priority queue");
      this.mKeys[i] = key;
      this.swim(this.qp[i]);
    }
    /**
     * Increase the key associated with index {@code i} to the specified value.
     *
     * @param  i the index of the key to increase
     * @param  key increase the key associated with index {@code i} to this key
     * @throws Error unless {@code 0 <= i < maxN}
     * @throws Error if {@code key <= keyOf(i)}
     * @throws Error no key is associated with index {@code i}
     */
    increaseKey(i, key){
      this.validateIndex(i);
      if(!this.contains(i)) throw Error("index is not in the priority queue");
      let c= this.compare(this.mKeys[i],key);
      if(c==0)
        throw Error("Calling increaseKey() with a key equal to the key in the priority queue");
      if(c>0)
        throw Error("Calling increaseKey() with a key strictly less than the key in the priority queue");
      this.mKeys[i] = key;
      this.sink(this.qp[i]);
    }
    /**
     * Remove the key associated with index {@code i}.
     *
     * @param  i the index of the key to remove
     * @throws IllegalArgumentException unless {@code 0 <= i < maxN}
     * @throws NoSuchElementException no key is associated with index {@code i}
     */
    delete(i){
      this.validateIndex(i);
      if(!this.contains(i)) throw Error("index is not in the priority queue");
      let index = this.qp[i];
      this.exch(index, this.n--);
      this.swim(index);
      this.sink(index);
      this.mKeys[i] = null;
      this.qp[i] = -1;
    }
    validateIndex(i){
      if(i < 0) throw Error("index is negative: " + i);
      if(i >= this.maxN) throw Error("index >= capacity: " + i);
    }
    greater(i, j){
      return this.compare(this.mKeys[this.pq[i]],this.mKeys[this.pq[j]]) > 0;
    }
    exch(i, j){
      let swap = this.pq[i];
      this.pq[i] = this.pq[j];
      this.pq[j] = swap;
      this.qp[this.pq[i]] = i;
      this.qp[this.pq[j]] = j;
    }
    swim(k){
      while(k > 1 && this.greater(k/2, k)) {
        this.exch(k, k/2);
        k = k/2;
      }
    }
    sink(k){
      while(2*k <= this.n){
          let j = 2*k;
          if(j < this.n && this.greater(j, j+1)) j++;
          if(!this.greater(k, j)) break;
          this.exch(k, j);
          k = j;
      }
    }
    /**
     * Returns an iterator that iterates over the keys on the
     * priority queue in ascending order.
     * The iterator doesn't implement {@code remove()} since it's optional.
     *
     * @return an iterator that iterates over the keys in ascending order
     */
    iterator(){
      // create a new pq
      let copy= new IndexMinPQ(this.pq.length-1, this.compare);
      // add all elements to copy of heap
      // takes linear time since already in heap order so no keys move
      for(let i = 1; i <= this.n; i++)
        copy.insert(this.pq[i], this.mKeys[this.pq[i]]);
      return{
        remove(){ throw Error(`UnsupportedOperationException`) },
        hasNext(){ return !copy.isEmpty() },
        next(){
          if(!this.hasNext()) throw Error(`NoSuchElementException`);
          return copy.delMin();
        }
      }
    }
    static test(){
      // insert a bunch of strings
      let strings = [ "it", "was", "the", "best", "of", "times", "it", "was", "the", "worst" ];
      let pq = new IndexMinPQ(strings.length,CMP);
      for(let i = 0; i < strings.length; i++)
        pq.insert(i, strings[i]);
      // delete and print each key
      while(!pq.isEmpty()){
        let i = pq.delMin();
        console.log(i + " " + strings[i]);
      }
      console.log("");
      // reinsert the same strings
      for(let i = 0; i < strings.length; i++) {
          pq.insert(i, strings[i]);
      }
      // print each key using the iterator
      for(let i,it=pq.iterator();it.hasNext();){
        i=it.next();
        console.log(i + " " + strings[i]);
      }
      while(!pq.isEmpty()){ pq.delMin() }
    }
  }

  /**Represents an indexed priority queue of generic keys.
   * @memberof module:mcfud/algo_sort
   * @class
   * @property {number} maxN  maximum number of elements on PQ
   * @property {number} n number of elements on PQ
   * @property {array} pq  binary heap using 1-based indexing
   * @property {array} qp  inverse of pq - qp[pq[i]] = pq[qp[i]] = i
   * @property {array} mKeys  keys[i] = priority of i
   */
  class IndexMaxPQ{
    /**Initializes an empty indexed priority queue with indices between {@code 0}
     * and {@code maxN - 1}.
     * @param  maxN the keys on this priority queue are index from {@code 0} to {@code maxN - 1}
     * @throws Error if {@code maxN < 0}
     */
    constructor(maxN,compareFn){
      if(maxN < 0) throw Error("IllegalArgumentException");
      this.compare=compareFn;
      this.maxN = maxN;
      this.n = 0;
      this.mKeys = new Array(maxN + 1);    // make this of length maxN??
      this.pq   = new Array(maxN + 1);
      this.qp   = new Array(maxN + 1);  // make this of length maxN??
      for(let i = 0; i <= maxN; i++) this.qp[i] = -1;
    }
    /**Returns true if this priority queue is empty.
     * @return {@code true} if this priority queue is empty; {@code false} otherwise
     */
    isEmpty(){
      return this.n == 0;
    }
    /**Is {@code i} an index on this priority queue?
     *
     * @param  i an index
     * @return {@code true} if {@code i} is an index on this priority queue; {@code false} otherwise
     * @throws Error unless {@code 0 <= i < maxN}
     */
    contains(i){
      this.validateIndex(i);
      return this.qp[i] != -1;
    }
    /**Returns the number of keys on this priority queue.
     * @return the number of keys on this priority queue
     */
    size(){
      return this.n;
    }
   /**Associate key with index i.
     *
     * @param  i an index
     * @param  key the key to associate with index {@code i}
     * @throws Error unless {@code 0 <= i < maxN}
     * @throws Error if there already is an item associated with index {@code i}
     */
    insert(i, key){
      this.validateIndex(i);
      if(this.contains(i)) throw Error("index is already in the priority queue");
      this.n++;
      this.qp[i] = this.n;
      this.pq[this.n] = i;
      this.mKeys[i] = key;
      this.swim(this.n);
    }
    /**Returns an index associated with a maximum key.
     *
     * @return an index associated with a maximum key
     * @throws Error if this priority queue is empty
     */
    maxIndex(){
      if(this.n == 0) throw Error("Priority queue underflow");
      return this.pq[1];
    }
    /**Returns a maximum key.
     *
     * @return a maximum key
     * @throws Error if this priority queue is empty
     */
    maxKey(){
      if(this.n == 0) throw Error("Priority queue underflow");
      return this.mKeys[this.pq[1]];
    }
    /**Removes a maximum key and returns its associated index.
     *
     * @return an index associated with a maximum key
     * @throws Error if this priority queue is empty
     */
    delMax(){
      if(this.n == 0) throw Error("Priority queue underflow");
      let max = this.pq[1];
      this.exch(1, this.n--);
      this.sink(1);
      _.assert(this.pq[this.n+1] == max,"bad delMax");
      this.qp[max] = -1;        // delete
      this.mKeys[max] = null;    // to help with garbage collection
      this.pq[this.n+1] = -1;        // not needed
      return max;
    }
    /**Returns the key associated with index {@code i}.
     *
     * @param  i the index of the key to return
     * @return the key associated with index {@code i}
     * @throws Error unless {@code 0 <= i < maxN}
     * @throws Error no key is associated with index {@code i}
     */
    keyOf(i){
      this.validateIndex(i);
      if(!this.contains(i)) throw Error("index is not in the priority queue");
      return this.mKeys[i];
    }
    /**Change the key associated with index {@code i} to the specified value.
     *
     * @param  i the index of the key to change
     * @param  key change the key associated with index {@code i} to this key
     * @throws Error unless {@code 0 <= i < maxN}
     */
    changeKey(i, key){
      this.validateIndex(i);
      if(!this.contains(i)) throw Error("index is not in the priority queue");
      this.mKeys[i] = key;
      this.swim(this.qp[i]);
      this.sink(this.qp[i]);
    }
    /**Increase the key associated with index {@code i} to the specified value.
     *
     * @param  i the index of the key to increase
     * @param  key increase the key associated with index {@code i} to this key
     * @throws Error unless {@code 0 <= i < maxN}
     * @throws Error if {@code key <= keyOf(i)}
     * @throws Error no key is associated with index {@code i}
     */
    increaseKey(i, key){
      this.validateIndex(i);
      if(!this.contains(i)) throw Error("index is not in the priority queue");
      if(this.compare(this.mKeys[i],key) == 0)
        throw Error("Calling increaseKey() with a key equal to the key in the priority queue");
      if(this.compare(this.mKeys[i],key) > 0)
        throw Error("Calling increaseKey() with a key that is strictly less than the key in the priority queue");
      this.mKeys[i] = key;
      this.swim(this.qp[i]);
    }
    /**Decrease the key associated with index {@code i} to the specified value.
     *
     * @param  i the index of the key to decrease
     * @param  key decrease the key associated with index {@code i} to this key
     * @throws Error unless {@code 0 <= i < maxN}
     * @throws Error if {@code key >= keyOf(i)}
     * @throws Error no key is associated with index {@code i}
     */
    decreaseKey(i, key){
      this.validateIndex(i);
      if(!this.contains(i)) throw Error("index is not in the priority queue");
      if(this.compare(this.mKeys[i],key) == 0)
        throw Error("Calling decreaseKey() with a key equal to the key in the priority queue");
      if(this.compare(this.mKeys[i],key) < 0)
        throw Error("Calling decreaseKey() with a key that is strictly greater than the key in the priority queue");
      this.mKeys[i] = key;
      this.sink(this.qp[i]);
    }
    /**Remove the key on the priority queue associated with index {@code i}.
     *
     * @param  i the index of the key to remove
     * @throws Error unless {@code 0 <= i < maxN}
     * @throws Error no key is associated with index {@code i}
     */
    delete(i){
      this.validateIndex(i);
      if(!this.contains(i)) throw Error("index is not in the priority queue");
      let index = this.qp[i];
      this.exch(index, this.n--);
      this.swim(index);
      this.sink(index);
      this.mKeys[i] = null;
      this.qp[i] = -1;
    }
    validateIndex(i){
      if(i < 0) throw Error("index is negative: " + i);
      if(i >= this.maxN) throw Error("index >= capacity: " + i);
    }
    less(i,j){
      return this.compare(this.mKeys[this.pq[i]], this.mKeys[this.pq[j]]) < 0;
    }
    exch(i, j){
      let swap = this.pq[i];
      this.pq[i] = this.pq[j];
      this.pq[j] = swap;
      this.qp[this.pq[i]] = i;
      this.qp[this.pq[j]] = j;
    }
    swim(k){
      while(k > 1 && this.less(int(k/2), k)) {
        this.exch(k, int(k/2));
        k = int(k/2);
      }
    }
    sink(k){
      while (2*k <= this.n){
        let j = 2*k;
        if(j < this.n && this.less(j, j+1)) j++;
        if(!this.less(k, j)) break;
        this.exch(k, j);
        k = j;
      }
    }
    /**Returns an iterator that iterates over the keys on the
     * priority queue in descending order.
     * The iterator doesn't implement {@code remove()} since it's optional.
     *
     * @return an iterator that iterates over the keys in descending order
     */
    iterator(){
      // add all elements to copy of heap takes linear time since already in heap order so no keys move
      let copy = new IndexMaxPQ(this.pq.length - 1,this.compare);
      for(let i = 1; i <= this.n; i++) copy.insert(this.pq[i], this.mKeys[this.pq[i]]);
      return{
        remove() { throw Error("UnsupportedOperationException")  },
        hasNext() { return !copy.isEmpty() },
        next(){
          if(!this.hasNext()) throw Error("NoSuchElementException");
          return copy.delMax();
        }
      }
    }
    static test(){
      // insert a bunch of strings
      let strings = [ "it", "was", "the", "best", "of", "times", "it", "was", "the", "worst" ];
      let pq = new IndexMaxPQ(strings.length, CMP);
      for(let i = 0; i < strings.length; i++){
        pq.insert(i, strings[i]);
      }
      for(let i,it=pq.iterator(); it.hasNext();){
        i=it.next();
        console.log(i + " " + strings[i]);
      }
      console.log("");
      // increase or decrease the key
      for(let i = 0; i < strings.length; i++){
        if(_.rand()<0.5)
          pq.increaseKey(i, strings[i] + strings[i]);
        else
          pq.decreaseKey(i, strings[i].substring(0, 1));
      }
      // delete and print each key
      while(!pq.isEmpty()){
        let key = pq.maxKey();
        let i = pq.delMax();
        console.log(i + " " + key);
      }
      console.log("");
      // reinsert the same strings
      for(let i = 0; i < strings.length; i++) {
        pq.insert(i, strings[i]);
      }
      // delete them in random order
      let perm = new Array(strings.length);
      for(let i = 0; i < strings.length; i++) perm[i] = i;
      _.shuffle(perm);
      for(let i = 0; i < perm.length; i++){
        let key = pq.keyOf(perm[i]);
        pq.delete(perm[i]);
        console.log(perm[i] + " " + key);
      }
    }
  }

  //Bubble.test();
  //IndexMaxPQ.test();
  //MinPQ.test();
  //IndexMinPQ.test();
  //Heap.test();
  //MaxPQ.test();
  //Quick.test();
  //Merge.test();
  //Shell.test();
  //Selection.test();
  //BinaryInsertion.test();
  //Insertion.test();

  const _$={
    Insertion,BinaryInsertion,Selection,Shell,Merge,Bubble,Quick,MinPQ, MaxPQ,Heap,IndexMinPQ,IndexMaxPQ
  };

  return _$;
}

//export--------------------------------------------------------------------
if(typeof module === "object" && module.exports){
  module.exports=_module(require("../main/core"),require("./basic"))
}else{
  gscope["io/czlab/mcfud/algo/sort"]=_module
}

})(this);

