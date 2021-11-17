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
  function _module(Core){
    if(!Core) Core= gscope["io/czlab/mcfud/core"]();

    const CMP=(a,b)=>{return a<b?-1:(a>b?1:0)};
    const int=Math.floor;
    const {is, u:_}= Core;
    /**
     * @module mcfud/algo_basic
     */

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function dbgIter(o){
      let s="";
      for(let v, it=o.iterator(); it.hasNext();)
        s+= it.next() + " ";
      return s;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function _checkKey(key){
      if(!is.num(key) && !is.str(key))
        throw Error(`expected either number or string`);
      return true;
    }

    /**Original source from https://github.com/awstuff/TreeMap.js
     * @memberof module:mcfud/algo_basic
     * @class
     * @property {root} top of the map
     * @property {n} number of elements in map
     */
    class TreeMap{
      constructor(){
        this.root=null;
        this.n=0;
      }
      size(){
        return this.n
      }
      contains(key){
        return this.get(key) !== undefined
      }
      get(key){
        _checkKey(key);
        function _get(key,node,res){
          if(node) res=key < node.key?_get(key, node.left)
                                     :(key > node.key? _get(key, node.right): node.value);
          return res;
        }
        if(this.n>0)
          return _get(key,this.root);
      }
      set(key, value){
        let self=this;
        function _set(key, value, node){
          if(!node){
            self.n+=1;
            return{key,value,left:null,right:null};
          }
          if(key < node.key){
            node.left = _set(key, value, node.left);
          }else if(key > node.key){
            node.right = _set(key, value, node.right);
          }else{
            node.value = value;
          }
          return node;
        }
        _checkKey(key);
        this.root = _set(key, value, this.root);
      }
      _getMaxNode(node){
        while(node !== null && node.right !== null){ node = node.right }
        return node;
      }
      _getMaxKey(){
        let n = this._getMaxNode(this.root);
        if(n)
          return n.key;
      }
      _getMinNode(node){
        while(node !== null && node.left !== null){ node = node.left }
        return node;
      }
      _getMinKey(){
        let n = this._getMinNode(this.root);
        if(n)
          return n.key;
      }
      remove(key){
        let self=this;
        function _del(key, node){
          if(node){
            if(key < node.key){
              node.left = _del(key, node.left);
            }else if(key > node.key){
              node.right = _del(key, node.right);
            }else{
              if(node.left && node.right){
                let m = self._getMaxNode(node.left), k = m.key, v = m.value;
                m.value = node.value;
                m.key = node.key;
                node.key = k;
                node.value = v;
                node.left = _del(key, node.left);
              }else if(node.left){
                node=node.left;
                self.n -=1;
              }else if(node.right){
                node= node.right;
                self.n -=1;
              }else{
                node= null;
                self.n -=1;
              }
            }
          }
          return node;
        }
        _checkKey(key);
        this.root = _del(key, this.root);
      }
      keys(){
        let out=new Queue();
        this.forEach((v,k)=> out.enqueue(k));
        return out;
      }
      firstKey(){
        let q,k;
        if(this.n>0){
          q= this.keys();
          k=q.head();
        }
        return k;
      }
      lastKey(){
        let q,k;
        if(this.n>0){
          q= this.keys();
          k=q.tail();
        }
        return k;
      }
      forEach(cb, ctx){
        function _invokeCb(ctx,cb){
          return cb && cb.apply(ctx, Array.prototype.slice.call(arguments, 2)) }
        function _each(node, cb, ctx, internal){
          if(!node)
            return _invokeCb(ctx, internal);
          _each(node.left, cb, ctx, function(){
            _invokeCb(ctx, cb, node.value, node.key);
            _each(node.right, cb, ctx, function(){ _invokeCb(ctx, internal) });
          });
        }
        _each(this.root, cb, ctx);
      }
      static test(){
        let t= new TreeMap();
        t.set(3, "3"); t.set(2,"2"); t.set(7,"7"), t.set(1,"1");
        console.log(`firstKey= ${t.firstKey()}`);
        console.log(`lastKey= ${t.lastKey()}`);
        console.log(dbgIter(t.keys()));
        console.log(`k= ${t.get(3)}`);
        console.log(`has 2 = ${t.contains(2)}`);
        console.log(`has size = ${t.size()}`);
        t.remove(1);
        console.log(`has size = ${t.size()}`);
        console.log(dbgIter(t.keys()));
        console.log(`k= ${t.get(2)}`);
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Helper linked list
     * @memberof module:mcfud/algo_basic
     * @param {any} item
     * @param {object} next
     * @return {object}
     */
    function Node(item,next=null){
      return { item, next }
    }
    /**Represents a bag (or multiset) of generic items.
     * @memberof module:mcfud/algo_basic
     * @class
     * @property {first} beginning of bag
     * @property {n} number of elements in bag
     */
    class Bag{
      constructor(){
        this.first = null;
        this.n = 0;
      }
      /**Returns true if this bag is empty.
       * @return {@code true} if this bag is empty;
       *         {@code false} otherwise
       */
      isEmpty(){
        return this.first == null;
      }
      /**Returns the number of items in this bag.
       * @return the number of items in this bag
       */
      size(){
        return this.n;
      }
      /**Adds the item to this bag.
       * @param  item the item to add to this bag
       */
      add(item){
        this.first = Node(item, this.first);
        this.n++;
      }
      /**Returns an iterator that iterates over the items in this bag in arbitrary order.
       * @return an iterator that iterates over the items in this bag in arbitrary order
       */
      iterator(){
        let current = this.first;
        return{
          remove(){ throw Error("Unsupported")  },
          hasNext(){ return current != null },
          next(){
            if(!this.hasNext()) throw Error("NoSuchElementException");
            let item = current.item;
            current = current.next;
            return item;
          }
        }
      }
      static test(){
        let obj= new Bag();
        "to be or not to - be - - that - - - is".split(" ").forEach(n=> obj.add(n));
        console.log("size of bag = " + obj.size());
        obj=obj.iterator();
        while(obj.hasNext()){
          console.log(obj.next());
        }
      }
    }

    /**Represents a last-in-first-out (LIFO) stack of generic items.
     * @memberof module:mcfud/algo_basic
     * @class
     * @property {first} top of stack
     * @property {n} size of stack
     */
    class Stack{
      constructor(){
        this.first = null;
        this.n = 0;
      }
      /**Returns true if this stack is empty.
       * @return true if this stack is empty; false otherwise
       */
      isEmpty(){
        return this.first == null;
      }
      /**Returns the number of items in this stack.
       * @return the number of items in this stack
       */
      size(){
        return this.n;
      }
      /**Adds the item to this stack.
       * @param  item the item to add
       */
      push(item){
        this.first = Node(item, this.first);
        this.n++;
      }
      /**Removes and returns the item most recently added to this stack.
       * @return the item most recently added
       * @throws Error if this stack is empty
       */
      pop(){
        if(this.isEmpty())
          throw Error("Stack underflow");
        let item = this.first.item; // save item to return
        this.first = this.first.next;            // delete first node
        --this.n;
        return item;                   // return the saved item
      }
      /**Returns (but does not remove) the item most recently added to this stack.
       * @return the item most recently added to this stack
       * @throws NoSuchElementException if this stack is empty
       */
      peek(){
        if(this.isEmpty())
          throw Error("Stack underflow");
        return this.first.item;
      }
      /**Returns a string representation of this stack.
       * @return the sequence of items in this stack in LIFO order, separated by spaces
       */
      toString(){
        let out="",
            s= this.iterator();
        while(s.hasNext())
          out += s.next() + " ";
        return out;
      }
      /**Returns an iterator to this stack that iterates through the items in LIFO order.
       * @return an iterator to this stack that iterates through the items in LIFO order
       */
      iterator(){
        let current = this.first;
        return{
          remove(){ throw Error("Unsupported") },
          hasNext(){ return current != null },
          next(){
            if(!this.hasNext()) throw Error("NoSuchElementException");
            let item = current.item;
            current = current.next;
            return item;
          }
        }
      }
      static test(){
        let obj= new Stack();
        "to be or not to - be - - that - - - is".split(" ").forEach(s=>{
          if(s != "-"){
            obj.push(s);
          }else if(!obj.isEmpty()){
            console.log(obj.pop() + " ");
          }
        });
        console.log("(" + obj.size() + " left on stack)");
      }
    }

    /**Represents a first-in-first-out (FIFO) queue of generic items.
     * @memberof module:mcfud/algo_basic
     * @class
     * @property {first} beginning of queue
     * @property {last} end of queue
     * @property {n} number of elements on queue
     */
    class LinkedQueue{
      constructor(){
        this.first = null; // beginning of queue
        this.last  = null; //end of queue
        this.n = 0; // number of elements on queue
      }
      /**Is this queue empty?
       * @return true if this queue is empty; false otherwise
       */
      isEmpty(){
        return this.first == null;
      }
      /**Returns the number of items in this queue.
       * @return the number of items in this queue
       */
      size(){
        return this.n;
      }
      /**Returns the item least recently added to this queue.
       * @return the item least recently added to this queue
       * @throws Error if this queue is empty
       */
      peek(){
        if(this.isEmpty())
          throw Error("Queue underflow");
        return this.first.item;
      }
      /**Adds the item to this queue.
       * @param item the item to add
       */
      enqueue(item){
        let oldlast = this.last;
        this.last = Node(item);
        if(this.isEmpty())
          this.first = this.last;
        else
          oldlast.next = this.last;
        ++this.n;
        //assert check();
      }
      /**Removes and returns the item on this queue that was least recently added.
       * @return the item on this queue that was least recently added
       * @throws Error if this queue is empty
       */
      dequeue(){
        if(this.isEmpty())
          throw Error("Queue underflow");
        let item = this.first.item;
        this.first = this.first.next;
        --this.n;
        if(this.isEmpty()) this.last = null;   // to avoid loitering
        //assert check();
        return item;
      }
      /**Returns a string representation of this queue.
       * @return the sequence of items in FIFO order, separated by spaces
       */
      toString(){
        let out="",
            it=this.iterator();
        while(it.hasNext()){
          out += it.next() + " ";
        }
        return out;
      }
      /**Returns an iterator that iterates over the items in this queue in FIFO order.
       * @return an iterator that iterates over the items in this queue in FIFO order
       */
      iterator(){
        let current = this.first;
        return{
          remove(){ throw Error("UnsupportedOperationException") },
          hasNext(){ return current != null },
          next(){
            if(!this.hasNext()) throw Error("NoSuchElementException");
            let item = current.item;
            current = current.next;
            return item;
          }
        }
      }
      static test(){
        let obj= new LinkedQueue();
        "to be or not to - be - - that - - - is".split(" ").forEach(s=>{
          if(s != "-"){
            obj.enqueue(s);
          }else if(!obj.isEmpty()){
            console.log(obj.dequeue() + " ");
          }
        });
        console.log("(" + obj.size() + " left on queue)");
      }
    }

    /**
     * @memberof module:mcfud/algo_basic
     * @class
     * @property {first} beginning of queue
     * @property {last} end of queue
     * @property {n} number of elements on queue
     */
    class Queue{
      /**
       * Initializes an empty queue.
       */
      constructor(){
        this.first = null;
        this.last  = null;
        this.n = 0;
      }
      /**Returns true if this queue is empty.
       * @return {@code true} if this queue is empty; {@code false} otherwise
       */
      isEmpty(){
        return this.first == null;
      }
      /**Returns the number of items in this queue.
       * @return the number of items in this queue
       */
      size(){
        return this.n;
      }
      head(){
        return this.first && this.first.item;
      }
      tail(){
        return this.last && this.last.item;
      }
      /**Returns the item least recently added to this queue.
       * @return the item least recently added to this queue
       * @throws Error if this queue is empty
       */
      peek(){
        if(this.isEmpty()) throw Error("Queue underflow");
        return this.first.item;
      }
      /**Adds the item to this queue.
       * @param  item the item to add
       */
      enqueue(item){
        let oldlast = this.last;
        this.last = Node(item);
        if(this.isEmpty()) this.first = this.last;
        else oldlast.next = this.last;
        this.n+=1;
      }
      /**Removes and returns the item on this queue that was least recently added.
       * @return the item on this queue that was least recently added
       * @throws Error if this queue is empty
       */
      dequeue(){
        if(this.isEmpty()) throw Error("Queue underflow");
        let item = this.first.item;
        this.first = this.first.next;
        this.n-=1;
        if(this.isEmpty()) this.last = null;   // to avoid loitering
        return item;
      }
      /**Returns a string representation of this queue.
       * @return the sequence of items in FIFO order, separated by spaces
       */
      toString(){
        let s = "";
        for(let item, it=this.iterator(); it.hasNext();){
          s+= item + " ";
        }
        return s;
      }
      /**Returns an iterator that iterates over the items in this queue in FIFO order.
       * @return an iterator that iterates over the items in this queue in FIFO order
       */
      iterator(){
        let current=this.first;
        return{
          remove(){ throw Error("UnsupportedOperationException") },
          hasNext(){ return current != null },
          next(){
            if(!this.hasNext()) throw Error("NoSuchElementException");
            let item = current.item;
            current = current.next;
            return item;
          }
        }
      }
      static test(){
        let queue = new Queue();
        "to be or not to - be - - that - - - is".split(/\s+/).forEach(s=>{
          if(s!="-")
            queue.enqueue(s);
          else if(!queue.isEmpty())
            console.log(queue.dequeue() + " ");
        });
        console.log("(" + queue.size() + " left on queue)");
      }
    }

    /**Represents an ordered symbol table of generic key-value pairs.
     * @memberof module:mcfud/algo_basic
     * @class
     * @property {first} beginning of queue
     * @property {last} end of queue
     * @property {n} number of elements on queue
     */
    class ST{
      constructor(){
        this.st = new TreeMap();
      }
      /**Returns the value associated with the given key in this symbol table.
       *
       * @param  key the key
       * @return the value associated with the given key if the key is in this symbol table;
       *         {@code null} if the key is not in this symbol table
       * @throws Error if {@code key} is {@code null}
       */
      get(key){
        if(_.nichts(key)) throw Error("calls get() with null key");
        return this.st.get(key);
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
        if(_.nichts(key)) throw Error("calls put() with null key");
        if(val === undefined) this.st.remove(key);
        else this.st.set(key, val);
      }
      /**
       * Removes the specified key and its associated value from this symbol table
       * (if the key is in this symbol table).
       * This is equivalent to {@code remove()}, but we plan to deprecate {@code delete()}.
       *
       * @param  key the key
       * @throws Error if {@code key} is {@code null}
       */
      remove(key){
        if(_.nichts(key)) throw Error("calls remove() with null key");
        this.st.remove(key);
      }
      /**Returns true if this symbol table contain the given key.
       *
       * @param  key the key
       * @return {@code true} if this symbol table contains {@code key} and
       *         {@code false} otherwise
       * @throws Error if {@code key} is {@code null}
       */
      contains(key){
        if(_.nichts(key)) throw Error("calls contains() with null key");
        return this.st.contains(key);
      }
      /**Returns the number of key-value pairs in this symbol table.
       *
       * @return the number of key-value pairs in this symbol table
       */
      size(){
        return this.st.size();
      }
      /**Returns true if this symbol table is empty.
       *
       * @return {@code true} if this symbol table is empty and {@code false} otherwise
       */
      isEmpty(){
        return this.size() == 0;
      }
      /**Returns all keys in this symbol table.
       * <p>
       * To iterate over all of the keys in the symbol table named {@code st},
       * use the foreach notation: {@code for (Key key : st.keys())}.
       *
       * @return all keys in this symbol table
       */
      keys(){
        return this.st.keys();
      }
      /**Returns the smallest key in this symbol table.
       *
       * @return the smallest key in this symbol table
       * @throws Error if this symbol table is empty
       */
      min(){
        if(this.isEmpty()) throw Error("calls min() with empty symbol table");
        return this.st.firstKey();
      }
      /**Returns the largest key in this symbol table.
       * @return the largest key in this symbol table
       * @throws Error if this symbol table is empty
       */
      max(){
        if(this.isEmpty()) throw Error("calls max() with empty symbol table");
        return this.st.lastKey();
      }
      /**Returns the smallest key in this symbol table greater than or equal to {@code key}.
       *
       * @param  key the key
       * @return the smallest key in this symbol table greater than or equal to {@code key}
       * @throws Error if there is no such key
       * @throws Error if {@code key} is {@code null}
       */
      ceiling(key){
        if(_.nichts(key)) throw Error("argument to ceiling() is null");
        let w,k,q= this.st.keys();
        let it=q.iterator();
        while(it.hasNext()){
          k=it.next();
          if(k == key || k>key){
            w=k;
            break;
          }
        }
        if(w===undefined) throw Error("argument to ceiling() is too large");
        return w;
      }
      /**Returns the largest key in this symbol table less than or equal to {@code key}.
       *
       * @param  key the key
       * @return the largest key in this symbol table less than or equal to {@code key}
       * @throws Error if there is no such key
       * @throws Error if {@code key} is {@code null}
       */
      floor(key){
        if(_.nichts(key)) throw Error("argument to floor() is null");
        let w,k,q= this.st.keys();
        let it=q.iterator();
        while(it.hasNext()){
          k=it.next();
          if(k == key || k<key){
            w=k;
          }
        }
        if(w===undefined) throw Error("argument to floor() is too small");
        return w;
      }
      static test(){
        let t= new ST();
        t.put("a",1);t.put("g", 9); t.put("c",3); t.put("j",10); t.put("z",26); t.put("x",24);
        console.log(`isEmpty= ${t.isEmpty()}`);
        console.log(`size= ${t.size()}`);
        console.log(`get-c= ${t.get("c")}`);
        console.log(`contains z= ${t.contains("z")}`);
        console.log(`contains m= ${t.contains("m")}`);
        console.log(dbgIter(t.keys()));
        console.log(`ceil w= ${t.ceiling("w")}`);
        console.log(`floor k= ${t.floor("k")}`);
        console.log(`min = ${t.min()}`);
        console.log(`max = ${t.max()}`);
        t.remove("x");
        console.log(dbgIter(t.keys()));
      }
    }

    /**Represents an indexed priority queue of generic keys.
     * @memberof module:mcfud/algo_basic
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

    /**
     * @memberof module:mcfud/algo_basic
     * @class
     * @property {number} height  height of tree
     * @property {number} n  number of key-value pairs in the B-tree
     * @property {object} root root of tree
     */
    class BTree{
      // max children per B-tree node = M-1 (must be even and greater than 2)
      static M = 4;
      Node(k){
        return{
          m:k,    // number of children
          children: new Array(BTree.M) // children
        }
      }
      // internal nodes: only use key and next external nodes: only use key and value
      Entry(key,val,next=null){
        return{ key, val, next }
      }
      /**
       * Initializes an empty B-tree.
       */
      constructor(compareFn){
        this.root = this.Node(0);
        this.compare=compareFn;
        this._height=0;
        this.n=0;
      }
      /**
       * Returns true if this symbol table is empty.
       * @return {@code true} if this symbol table is empty; {@code false} otherwise
       */
      isEmpty(){
        return this.size() == 0;
      }
      /**
       * Returns the number of key-value pairs in this symbol table.
       * @return the number of key-value pairs in this symbol table
       */
      size() {
        return this.n;
      }
      /**
       * Returns the height of this B-tree (for debugging).
       *
       * @return the height of this B-tree
       */
      height(){
        return this._height;
      }
      /**
       * Returns the value associated with the given key.
       *
       * @param  key the key
       * @return the value associated with the given key if the key is in the symbol table
       *         and {@code null} if the key is not in the symbol table
       * @throws Error if {@code key} is {@code null}
       */
      get(key){
        if(_.nichts(key)) throw Error("argument to get() is null");
        return this._search(this.root, key, this._height);
      }
      _search(x, key, ht){
        let cs = x.children;
        // external node
        if(ht == 0){
          for(let j = 0; j < x.m; j++)
            if(this.compare(key, cs[j].key)==0) return cs[j].val;
        }else{ // internal node
          for(let j = 0; j < x.m; j++)
            if(j+1 == x.m ||
               this.compare(key, cs[j+1].key)<0)
              return this._search(cs[j].next, key, ht-1);
        }
      }
      /**
       * Inserts the key-value pair into the symbol table, overwriting the old value
       * with the new value if the key is already in the symbol table.
       * If the value is {@code null}, this effectively deletes the key from the symbol table.
       *
       * @param  key the key
       * @param  val the value
       * @throws Error if {@code key} is {@code null}
       */
      put(key, val){
        if(_.nichts(key)) throw Error("argument key to put() is null");
        let u = this._insert(this.root, key, val, this._height);
        this.n++;
        if(!u) return;
        // need to split root
        let t = this.Node(2);
        t.children[0] = this.Entry(this.root.children[0].key, null, this.root);
        t.children[1] = this.Entry(u.children[0].key, null, u);
        this.root = t;
        this._height++;
      }
      _insert(h, key, val, ht){
        let j,
            t = this.Entry(key, val);
        if(ht == 0){
          for(j = 0; j < h.m; j++)
            if(this.compare(key, h.children[j].key)<0) break;
        }else{ // internal node
          for(j = 0; j < h.m; j++){
            if((j+1 == h.m) ||
               this.compare(key, h.children[j+1].key)<0){
              let u = this._insert(h.children[j++].next, key, val, ht-1);
              if(!u) return null;
              t.key = u.children[0].key;
              t.val = null;
              t.next = u;
              break;
            }
          }
        }
        for(let i = h.m; i > j; i--)
          h.children[i] = h.children[i-1];
        h.children[j] = t;
        h.m++;
        if(h.m >= BTree.M) return this._split(h);
      }
      // split node in half
      _split(h){
        let m2=int(BTree.M/2),
            t = this.Node(m2);
        h.m = m2;
        for(let j = 0; j < m2; j++)
          t.children[j] = h.children[m2+j];
        return t;
      }
      /**
       * Returns a string representation of this B-tree (for debugging).
       *
       * @return a string representation of this B-tree.
       */
      toString() {
        function _s(h, ht, indent){
          let s= "", cs= h.children;
          if(ht == 0){
            for(let j = 0; j < h.m; j++)
              s+= `${indent}${cs[j].key} ${cs[j].val}\n`;
          }else{
            for(let j = 0; j < h.m; j++){
              if(j > 0)
                s+= `${indent}(${cs[j].key})\n`;
              s+= _s(cs[j].next, ht-1, indent+"     ");
            }
          }
          return s;
        }
        return _s(this.root, this._height, "") + "\n";
      }
      static test(){
        let st = new BTree(CMP);
        st.put("www.cs.princeton.edu", "128.112.136.12");
        st.put("www.cs.princeton.edu", "128.112.136.11");
        st.put("www.princeton.edu",    "128.112.128.15");
        st.put("www.yale.edu",         "130.132.143.21");
        st.put("www.simpsons.com",     "209.052.165.60");
        st.put("www.apple.com",        "17.112.152.32");
        st.put("www.amazon.com",       "207.171.182.16");
        st.put("www.ebay.com",         "66.135.192.87");
        st.put("www.cnn.com",          "64.236.16.20");
        st.put("www.google.com",       "216.239.41.99");
        st.put("www.nytimes.com",      "199.239.136.200");
        st.put("www.microsoft.com",    "207.126.99.140");
        st.put("www.dell.com",         "143.166.224.230");
        st.put("www.slashdot.org",     "66.35.250.151");
        st.put("www.espn.com",         "199.181.135.201");
        st.put("www.weather.com",      "63.111.66.11");
        st.put("www.yahoo.com",        "216.109.118.65");
        console.log("cs.princeton.edu:  " + st.get("www.cs.princeton.edu"));
        console.log("hardvardsucks.com: " + st.get("www.harvardsucks.com"));
        console.log("simpsons.com:      " + st.get("www.simpsons.com"));
        console.log("apple.com:         " + st.get("www.apple.com"));
        console.log("ebay.com:          " + st.get("www.ebay.com"));
        console.log("dell.com:          " + st.get("www.dell.com"));
        console.log("");
        console.log("size:    " + st.size());
        console.log("height:  " + st.height());
        console.log(st.toString());
        console.log("");
      }
    }

    //BTree.test();
    //IndexMinPQ.test();
    //ST.test();
    //TreeMap.test();
    //Queue.test();
    //LinkedQueue.test();
    //Stack.test();
    //Bag.test();

    const _$={
      BTree,Bag,Stack,LinkedQueue,Queue,ST,TreeMap,IndexMinPQ
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("../main/core"))
  }else{
    gscope["io/czlab/mcfud/algo/basic"]=_module
  }

})(this);


