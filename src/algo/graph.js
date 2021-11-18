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
    const CMP=(a,b)=>{return a<b?-1:(a>b?1:0)};
    const int=Math.floor;
    const {is,u:_}= Core;
    const {Bag,Stack,Queue,ST}= Basic;
    const {IndexMinPQ}= Sort;
    /**
     * @module mcfud/algo_graph
     */

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function dbgIter(o){
      let s="";
      for(let v, it=o.iterator(); it.hasNext();)
        s+= it.next() + " ";
      return s;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function _validateVertex(v,V){
      if(v < 0 || v >= V)
        throw Error(`vertex ${v} is not between 0 and ${V-1}`);
    }

    /**Represents an undirected graph of vertices named 0 through <em>V</em> – 1.
     * @memberof module:mcfud/algo_graph
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


    /**
     * @memberof module:mcfud/algo_graph
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
        this._dfs(G, s);
      }
      //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
      // depth first search from v
      _dfs(G, v){
        let w,it= G.adj(v).iterator();
        this.nCount+=1;
        this.bMarked[v] = true;
        while(it.hasNext()){
          w=it.next();
          if(!this.bMarked[w]) this._dfs(G, w);
        }
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
     * @memberof module:mcfud/algo_graph
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

    /**Represents a data type for finding paths from a source vertex <em>s</em>
     * to every other vertex in an undirected graph.
     * @memberof module:mcfud/algo_graph
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
        this._dfs(G, s);
      }
      //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
      // depth first search from v
      _dfs(G, v){
        let w,it=G.adj(v).iterator();
        this.bMarked[v] = true;
        while(it.hasNext()){
          w=it.next();
          if(!this.bMarked[w]){
            this.edgeTo[w] = v;
            this._dfs(G, w);
          }
        }
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

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // breadth-first search from a single source
    function _bfs(G, s, M){
      return _bfss(G,[s],M);
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // breadth-first search from multiple sources
    function _bfss(G, sources, M){
      let it,v,q = [];
      for(let v = 0; v < G.V(); ++v)
        M.mDistTo[v] = Infinity;
      sources.forEach(s=>{
        M.bMarked[s] = true;
        M.mDistTo[s] = 0;
        q.push(s);
      });
      while(q.length>0){
        v = q.shift();
        for(let w, it=G.adj(v).iterator(); it.hasNext();){
          w=it.next();
          if(!M.bMarked[w]){
            M.edgeTo[w] = v;
            M.mDistTo[w] = M.mDistTo[v] + 1;
            M.bMarked[w] = true;
            q.push(w);
          }
        }
      }
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // check optimality conditions for single source
    function _check(G, s,M){
      // check that the distance of s = 0
      if(M.mDistTo[s] != 0)
        throw Error(`distance of source ${s} to itself = ${M.mDistTo[s]}`);
      // check that for each edge v-w dist[w] <= dist[v] + 1
      // provided v is reachable from s
      for(let it,v = 0; v < G.V(); ++v){
        for(let m,w, it=G.adj(v).iterator(); it.hasNext();){
          w=it.next();
          if(M.hasPathTo(v) != M.hasPathTo(w)){
            m=("edge " + v + "-" + w);
            m+= ("hasPathTo(" + v + ") = " + M.hasPathTo(v));
            m+=("hasPathTo(" + w + ") = " + M.hasPathTo(w));
            throw Error(m);
          }
          if(M.hasPathTo(v) && (M.mDistTo[w] > (M.mDistTo[v]+1))){
            m= ("edge " + v + "--" + w);
            m+= ("distTo[" + v + "] = " + M.mDistTo[v]);
            m+=("distTo[" + w + "] = " + M.mDistTo[w]);
            throw Error(m);
          }
        }
      }
      // check that v = edgeTo[w] satisfies distTo[w] = distTo[v] + 1
      // provided v is reachable from s
      for(let m,v,w = 0; w < G.V(); ++w){
        if(!M.hasPathTo(w) || w == s) continue;
        v = M.edgeTo[w];
        if(M.mDistTo[w] != M.mDistTo[v] + 1){
          m=("shortest path edge " + v + "-" + w);
          m+=("distTo[" + v + "] = " + M.mDistTo[v]);
          m+=("distTo[" + w + "] = " + M.mDistTo[w]);
          throw Error(m);
        }
      }
      return true;
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function _validateVertices(vertices,M){
      if(!vertices)
        throw Error("argument is null");
      let count = 0,
          V = M.bMarked.length;
      vertices.forEach(v=>{
        ++count;
        if(v == null)
          throw Error("vertex is null");
        _validateVertex(v,M.bMarked.length);
      });
      if(count == 0)
        throw Error("zero vertices");
    }
    /**Represents a data type for finding shortest paths (number of edges)
     * from a source vertex <em>s</em> (or a set of source vertices)
     * to every other vertex in an undirected graph.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} bMarked marked[v] = is there an s-v path?
     * @property {array} mDistTo  number of edges shortest s-v path
     * @property {array} edgeTo previous edge on shortest s-v path
     */
    class BreadthFirstPaths{
      /**
       * Computes the shortest path between the source vertex {@code s}
       * and every other vertex in the graph {@code G}.
       * @param G the graph
       * @param s the source vertex
       * @throws IllegalArgumentException unless {@code 0 <= s < V}
       */
      constructor(G, s){
        this.bMarked = new Array(G.V());
        this.mDistTo = new Array(G.V());
        this.edgeTo = new Array(G.V());
        if(!Array.isArray(s)){
          s=[s]
        }
        _validateVertices(s,this);
        _bfss(G, s,this);
        _check(G, s, this);
      }
      /**
       * Is there a path between the source vertex {@code s} (or sources) and vertex {@code v}?
       * @param v the vertex
       * @return {@code true} if there is a path, and {@code false} otherwise
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      hasPathTo(v){
        _validateVertex(v,this.bMarked.length);
        return this.bMarked[v];
      }
      /**
       * Returns the number of edges in a shortest path between the source vertex {@code s}
       * (or sources) and vertex {@code v}?
       * @param v the vertex
       * @return the number of edges in such a shortest path
       *         (or {@code Integer.MAX_VALUE} if there is no such path)
       * @throws Error unless {@code 0 <= v < V}
       */
      distTo(v){
        _validateVertex(v,this.bMarked.length);
        return this.mDistTo[v];
      }
      /**
       * Returns a shortest path between the source vertex {@code s} (or sources)
       * and {@code v}, or {@code null} if no such path.
       * @param  v the vertex
       * @return the sequence of vertices on a shortest path, as an Iterable
       * @throws Error unless {@code 0 <= v < V}
       */
      pathTo(v){
        _validateVertex(v,this.bMarked.length);
        if(!this.hasPathTo(v)) return null;
        let x,path = new Stack();
        for(x = v; this.mDistTo[x] != 0; x = this.edgeTo[x]){
          path.push(x);
        }
        path.push(x);
        return path;
      }
      static test(){
        let s=0,G=new Graph(6);
        let a=[0,5,2,4,2,3,1,2,0,1,3,4,3,5,0,2];
        for(let i=0;i<a.length; i+=2){ G.addEdge(a[i], a[i+1]) }
        console.log(G.toString());
        let obj = new BreadthFirstPaths(G, s);
        for(let m,v = 0; v < G.V(); ++v){
          if(obj.hasPathTo(v)){
            m= `${s} to ${v} (${obj.distTo(v)}):  `;
            for(let x,it=obj.pathTo(v).iterator(); it.hasNext();){
              x=it.next();
              m += x == s? `${x}`: `-${x}`;
            }
            console.log(m);
          }else{
            console.log(`${s} to ${v} (-):  not connected\n`);
          }
        }
      }
    }

    /**Represents a weighted edge in an {@link EdgeWeightedGraph}.
     * Each edge consists of two integers.
     * (naming the two vertices) and a real-value weight.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {number} v
     * @property {number} w
     * @property {number} weight
     */
    class Edge{
      /**Initializes an edge between vertices {@code v} and {@code w} of
       * the given {@code weight}.
       * @param  v one vertex
       * @param  w the other vertex
       * @param  weight the weight of this edge
       * @throws Error if either {@code v} or {@code w}
       *         is a negative integer
       * @throws Error if {@code weight} is {@code NaN}
       */
      constructor(v, w, weight){
        if(v < 0) throw Error("vertex index must be a non-negative integer");
        if(w < 0) throw Error("vertex index must be a non-negative integer");
        this.v = v;
        this.w = w;
        this._weight = weight;
      }
      /**Returns the weight of this edge.
       * @return the weight of this edge
       */
      weight(){
        return this._weight
      }
      /**Returns either endpoint of this edge.
       * @return either endpoint of this edge
       */
      either(){
        return this.v;
      }
      /**Returns the endpoint of this edge that is different from the given vertex.
       * @param  vertex one endpoint of this edge
       * @return the other endpoint of this edge
       * @throws Error if the vertex is not one of the
       *         endpoints of this edge
       */
      other(vertex){
        if(vertex == this.v) return this.w;
        if(vertex == this.w) return this.v;
        throw Error("Illegal endpoint");
      }
      /**Compares two edges by weight.
       * Note that {@code compareTo()} is not consistent with {@code equals()},
       * which uses the reference equality implementation inherited from {@code Object}.
       *
       * @param  that the other edge
       * @return a negative integer, zero, or positive integer depending on whether
       *         the weight of this is less than, equal to, or greater than the
       *         argument edge
       */
      compareTo(that){
        return this._weight< that._weight?-1:(this._weight>that._weight?1:0)
      }
      /**Returns a string representation of this edge.
       * @return a string representation of this edge
       */
      toString(){
        return `${this.v}-${this.w} ${this._weight}`;
      }
      static test(){
        console.log(new Edge(12, 34, 5.67).toString());
      }
    }

    /**Represents an edge-weighted graph of vertices named 0 through <em>V</em> – 1,
     * where each undirected edge is of type {@link Edge} and has a real-valued weight.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {number} _V
     * @property {number} _E
     * @property {array} adjls
     */
    class EdgeWeightedGraph{
      /**
       * Initializes an empty edge-weighted graph with {@code V} vertices and 0 edges.
       *
       * @param  V the number of vertices
       * @throws Error if {@code V < 0}
       */
      constructor(V){
        if(V < 0) throw Error("Number of vertices must be non-negative");
        this.adjls = new Array(V);
        this._V = V;
        this._E = 0;
        for(let v = 0; v < V; ++v) this.adjls[v] = new Bag();
      }
      /**
       * Initializes a random edge-weighted graph with {@code V} vertices and <em>E</em> edges.
       *
       * @param  V the number of vertices
       * @param  E the number of edges
       * @throws Error if {@code V < 0}
       * @throws Error if {@code E < 0}
       */
      static randGraph(V, E){
        let g= new EdgeWeightedGraph(V);
        if(E < 0) throw Error("Number of edges must be non-negative");
        for(let wt,v,w,i = 0; i < E; ++i){
          v = _.randInt2(0,V);
          w = _.randInt2(0,V);
          wt = Math.round(100 * _.rand()) / 100.0;
          g.addEdge(new Edge(v, w, wt));
        }
        return g;
      }
      /**Initializes a new edge-weighted graph that is a deep copy of {@code G}.
       * @param  G the edge-weighted graph to copy
       */
      clone(){
        let g= new EdgeWeightedGraph(this.V());
        g._E = this.E();
        for(let it,r,v = 0; v < this.V(); ++v){
          // reverse so that adjacency list is in same order as original
          r= new Stack();
          it=this.adjls[v].iterator();
          while(it.hasNext()){
            r.push(it.next())
          }
          r.forEach(e=> g.adjls[v].add(e))
        }
        return g;
      }
      /**Returns the number of vertices in this edge-weighted graph.
       * @return the number of vertices in this edge-weighted graph
       */
      V(){
        return this._V;
      }
      /**Returns the number of edges in this edge-weighted graph.
       * @return the number of edges in this edge-weighted graph
       */
      E(){
        return this._E;
      }
      /**Adds the undirected edge {@code e} to this edge-weighted graph.
       * @param  e the edge
       * @throws Error unless both endpoints are between {@code 0} and {@code V-1}
       */
      addEdge(e){
        let v = e.either(),
            w = e.other(v);
        _validateVertex(v,this._V);
        _validateVertex(w,this._V);
        this.adjls[v].add(e);
        this.adjls[w].add(e);
        this._E +=1;
      }
      /**Returns the edges incident on vertex {@code v}.
       * @param  v the vertex
       * @return the edges incident on vertex {@code v} as an Iterable
       * @throws Error unless {@code 0 <= v < V}
       */
      adj(v){
        _validateVertex(v,this._V);
        return this.adjls[v];
      }
      /**Returns the degree of vertex {@code v}.
       * @param  v the vertex
       * @return the degree of vertex {@code v}
       * @throws Error unless {@code 0 <= v < V}
       */
      degree(v){
        _validateVertex(v,this._V);
        return this.adjls[v].size();
      }
      /**Returns all edges in this edge-weighted graph.
       * To iterate over the edges in this edge-weighted graph, use foreach notation:
       * {@code for (Edge e : G.edges())}.
       *
       * @return all edges in this edge-weighted graph, as an iterable
       */
      edges(){
        let list = new Bag();
        for(let it,s,e,v = 0; v < V; ++v){
          s= 0;
          it=this.adjls[v].iterator();
          while(it.hasNext()){
            e=it.next();
            if(e.other(v) > v){
              list.add(e);
            }
            // add only one copy of each self loop (self loops will be consecutive)
            else if(e.other(v) == v){
              if(s % 2 == 0) list.add(e);
              ++s;
            }
          }
        }
        return list;
      }
      /**Returns a string representation of the edge-weighted graph.
       * This method takes time proportional to <em>E</em> + <em>V</em>.
       *
       * @return the number of vertices <em>V</em>, followed by the number of edges <em>E</em>,
       *         followed by the <em>V</em> adjacency lists of edges
       */
      toString(){
        let s = `${this._V} ${this._E}\n`;
        for(let it,v = 0; v < this._V; ++v){
          s+= `${v}: `;
          it=this.adjls[v].iterator();
          while(it.hasNext()){
            s+= `${it.next()} `;
          }
          s+="\n";
        }
        return s;
      }
      static test(){
        let V=8,g= new EdgeWeightedGraph(V);
        let d=`4 5 0.35 4 7 0.37 5 7 0.28 0 7 0.16 1 5 0.32 0 4 0.38 2 3 0.17 1 7 0.19 0 2 0.26 1 2 0.36 1 3 0.29 2 7 0.34 6 2 0.40 3 6 0.52 6 0 0.58 6 4 0.93`.split(" ").map(s=> {return +s});
        for(let i=0;i<d.length;i+=3){
          _validateVertex(d[i],V);
          _validateVertex(d[i+1],V);
          g.addEdge(new Edge(d[i],d[i+1], d[i+2]));
        }
        console.log(g.toString());
      }
    }

    /**Represents a data type for determining the connected components in an undirected graph.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} bMarked   marked[v] = has vertex v been marked?
     * @property {number} id id[v] = id of connected component containing v
     * @property {number} size size[id] = number of vertices in given component
     * @property {number} nCount  number of connected components
     */
    class CC{
      /** Computes the connected components of the undirected graph {@code G}.
       * @param {Graph} undirected or edgeweighted graph
       */
      constructor(G){
        this.bMarked = new Array(G.V());
        this._id = new Array(G.V());
        this._size = new Array(G.V());
        this.nCount=0;
        for(let v = 0; v < G.V(); ++v){
          if(!this.bMarked[v]){
            this._dfs(G, v);
            ++this.nCount;
          }
        }
      }
      // depth-first search for a Graph
      _dfs(G, v){
        let e,w,it= G.adj(v).iterator();
        this.bMarked[v] = true;
        this._id[v] = this.nCount;
        this._size[this.nCount] += 1;
        if(G instanceof EdgeWeightedGraph){
          while(it.hasNext()){
            e=it.next();
            w = e.other(v);
            if(!this.bMarked[w]) this._dfs(G, w);
          }
        }else{
          while(it.hasNext()){
            w=it.next();
            if(!this.bMarked[w]) this._dfs(G, w);
          }
        }
      }
      /**Returns the component id of the connected component containing vertex {@code v}.
       * @param  v the vertex
       * @return the component id of the connected component containing vertex {@code v}
       * @throws Error unless {@code 0 <= v < V}
       */
      id(v){
        _validateVertex(v,this.bMarked.length);
        return this._id[v];
      }
      /**Returns the number of vertices in the connected component containing vertex {@code v}.
       * @param  v the vertex
       * @return the number of vertices in the connected component containing vertex {@code v}
       * @throws Error unless {@code 0 <= v < V}
       */
      size(v){
        _validateVertex(v, this.bMarked.length);
        return this._size[this._id[v]];
      }
      /**Returns the number of connected components in the graph {@code G}.
       * @return the number of connected components in the graph {@code G}
       */
      count(){
        return this.nCount;
      }
      /**Returns true if vertices {@code v} and {@code w} are in the same
       * connected component.
       *
       * @param  v one vertex
       * @param  w the other vertex
       * @return {@code true} if vertices {@code v} and {@code w} are in the same
       *         connected component; {@code false} otherwise
       * @throws Error unless {@code 0 <= v < V}
       * @throws Error unless {@code 0 <= w < V}
       */
      connected(v, w){
        _validateVertex(v,this.bMarked.length);
        _validateVertex(w, this.bMarked.length);
        return this.id(v) == this.id(w);
      }
      static test(){
        let V=13,G = new Graph(V);
        let a=[0,5,4,3,0,1,9,12,6,4,5,4,0,2,11,12,9,10,0,6,7,8,9,11,5,3];
        for(let i=0;i<a.length; i+=2){ G.addEdge(a[i], a[i+1]); }
        //console.log(G.toString());
        let cc = new CC(G);
        // number of connected components
        let m = cc.count();
        console.log(m + " components");
        // compute list of vertices in each connected component
        let components = new Array(m);
        for(let i = 0; i < m; i++){
          components[i] = [];
        }
        for(let v = 0; v < G.V(); v++){
          components[cc.id(v)].push(v);
        }
        // print results
        for(let s,i = 0; i < m; i++){
          s="";
          components[i].forEach(v=> s+= v.toString()+" ");
          console.log(s);
        }
      }
    }

    /**Represents a directed graph of vertices
     *  named 0 through <em>V</em> - 1.
     *  It supports the following two primary operations: add an edge to the digraph,
     *  iterate over all of the vertices adjacent from a given vertex.
     *  It also provides
     *  methods for returning the indegree or outdegree of a vertex,
     *  the number of vertices <em>V</em> in the digraph,
     *  the number of edges <em>E</em> in the digraph, and the reverse digraph.
     *  Parallel edges and self-loops are permitted.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} bMarked   marked[v] = has vertex v been marked?
     * @property {number} id id[v] = id of connected component containing v
     * @property {number} size size[id] = number of vertices in given component
     * @property {number} nCount  number of connected components
     */
    class Digraph{
      static load(V,data){
        if(V<0)
          throw Error("number of vertices in a Digraph must be non-negative");
        let g= new Digraph(V);
        for(let i = 0; i < data.length; i+=2){
          g.addEdge(data[i], data[i+1]);
        }
        return g;
      }
      //private final int V;           // number of vertices in this digraph
      //private int E;                 // number of edges in this digraph
      //private Bag<Integer>[] adj;    // adj[v] = adjacency list for vertex v
      //private int[] indegree;        // indegree[v] = indegree of vertex v
      /**Initializes an empty digraph with <em>V</em> vertices.
       * @param  V the number of vertices
       * @throws Error if {@code V < 0}
       */
      constructor(V){
        if(V < 0) throw Error("Number of vertices in a Digraph must be non-negative");
        this._V = V;
        this._E = 0;
        this._indegree = new Array(V);
        this.adjls = new Array(V);
        for(let v = 0; v < V; v++) this.adjls[v] = new Bag();
      }
      /**Initializes a new digraph that is a deep copy of the specified digraph.
       * @return {object} digraph copy
       * @throws Error if {@code G} is {@code null}
       */
      clone(){
        let g=new Digraph(this.V());
        g._E = this.E();
        // update indegrees
        g._indegree = new Array(g.V());
        for(let v = 0; v < g.V(); v++)
          g._indegree[v] = this._indegree(v);
        // update adjacency lists
        for(let it,r,v = 0; v < g.V(); v++){
          // reverse so that adjacency list is in same order as original
          r= new Stack();
          it=this.adjls[v].iterator();
          while(it.hasNext()){
            r.push(it.next())
          }
          it=r.iterator();
          while(it.hasNext())
            g.adjls[v].add(it.next());
        }
        return g;
      }
      /**Returns the number of vertices in this digraph.
       * @return the number of vertices in this digraph
       */
      V(){
        return this._V;
      }
      /**Returns the number of edges in this digraph.
       * @return the number of edges in this digraph
       */
      E(){
        return this._E;
      }
      /**Adds the directed edge v→w to this digraph.
       *
       * @param  v the tail vertex
       * @param  w the head vertex
       * @throws Error unless both {@code 0 <= v < V} and {@code 0 <= w < V}
       */
      addEdge(v, w){
        _validateVertex(v,this._V);
        _validateVertex(w,this._V);
        this.adjls[v].add(w);
        this._indegree[w] +=1;
        ++this._E;
      }
      /**Returns the vertices adjacent from vertex {@code v} in this digraph.
       *
       * @param  v the vertex
       * @return the vertices adjacent from vertex {@code v} in this digraph, as an iterable
       * @throws Error unless {@code 0 <= v < V}
       */
      adj(v){
        _validateVertex(v,this._V);
        return this.adjls[v];
      }
      /**Returns the number of directed edges incident from vertex {@code v}.
       * This is known as the <em>outdegree</em> of vertex {@code v}.
       *
       * @param  v the vertex
       * @return the outdegree of vertex {@code v}
       * @throws Error unless {@code 0 <= v < V}
       */
      outdegree(v){
        _validateVertex(v,this._V);
        return this.adjls[v].size();
      }
      /**Returns the number of directed edges incident to vertex {@code v}.
       * This is known as the <em>indegree</em> of vertex {@code v}.
       *
       * @param  v the vertex
       * @return the indegree of vertex {@code v}
       * @throws Error unless {@code 0 <= v < V}
       */
      indegree(v){
        _validateVertex(v,this._V);
        return this._indegree[v];
      }
      /**Returns the reverse of the digraph.
       * @return the reverse of the digraph
       */
      reverse(){
        let r= new Digraph(this._V);
        for(let it,v = 0; v < this._V; v++){
          it=this.adjls[v].iterater();
          while(it.hasNext())
            r.addEdge(it.next(), v);
        }
        return r;
      }
      /**Returns a string representation of the graph.
       * @return the number of vertices <em>V</em>, followed by the number of edges <em>E</em>,
       *         followed by the <em>V</em> adjacency lists
       */
      toString(){
        let s= `${this._V} vertices, ${this._E} edges\n`;
        for(let it,v = 0; v < this._V; v++){
          s+= `${v}: `
          it=this.adjls[v].iterator();
          while(it.hasNext())
            s+= `${it.next()} `;
          s+="\n";
        }
        return s;
      }
      static test(){
        let s= "4  2 2  3 3  2 6  0 0  1 2  0 11 12 12  9 9 10 9 11 7  9 10 12 11  4 4  3 3  5 6  8 8  6 5  4 0  5 6  4 6  9 7  6";
        let g= Digraph.load(13, s.split(/\s+/).map(n=>{ return +n }));
        console.log(g.toString());
        return g;
      }
    }

    /**Represents a data type for determining the vertices reachable
     * from a given source vertex <em>s</em> (or set of source vertices) in a digraph.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} bMarked  marked[v] = true iff v is reachable from source(s)
     * @property {number} nCount  number of vertices reachable from source(s)
     */
    class DirectedDFS{
      /**
       * Computes the vertices in digraph {@code G} that are
       * reachable from the source vertex {@code s}.
       * @param G the digraph
       * @param s the source vertex
       * @throws Error unless {@code 0 <= s < V}
       */
      constructor(G, s){
        this.bMarked = new Array(G.V());
        if(!is.vec(s)) s=[s];
        this._validateVertices(s);
        s.forEach(v=>{
          if(!this.bMarked[v]) this._dfs(G, v);
        });
      }
      _dfs(G, v){
        this.mCount+=1;
        this.bMarked[v] = true;
        for(let w,it=G.adj(v).iterator(); it.hasNext();){
          w=it.next();
          if(!this.bMarked[w]) this._dfs(G, w);
        }
      }
      /**Is there a directed path from the source vertex (or any
       * of the source vertices) and vertex {@code v}?
       * @param  v the vertex
       * @return {@code true} if there is a directed path, {@code false} otherwise
       * @throws Error unless {@code 0 <= v < V}
       */
      marked(v){
        _validateVertex(v,this.bMarked.length);
        return this.bMarked[v];
      }
      /**Returns the number of vertices reachable from the source vertex
       * (or source vertices).
       * @return the number of vertices reachable from the source vertex
       *   (or source vertices)
       */
      count(){
        return this.mCount;
      }
      // throw an IllegalArgumentException if vertices is null, has zero vertices,
      // or has a vertex not between 0 and V-1
      _validateVertices(vertices){
        let V = this.bMarked.length;
        let cnt = 0;
        vertices.forEach(v=>{
          cnt++;
          _validateVertex(v,V);
        });
        if(cnt == 0)
          throw Error("zero vertices");
      }
      static test(){
        let G= Digraph.test()
        let dfs = new DirectedDFS(G, [1,2,6]);
        // print out vertices reachable from sources
        for(let v = 0; v < G.V(); v++){
          if(dfs.marked(v)) console.log(v + " ");
        }
      }
    }

    /**Represents a data type for determining whether a digraph has a directed cycle.
     *  The <em>hasCycle</em> operation determines whether the digraph has
     *  a simple directed cycle and, if so, the <em>cycle</em> operation
     *  returns one.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} bMarked  marked[v] = has vertex v been marked?
     * @property {Stack} cycle  directed cycle (or null if no such cycle)
     * @property {array} edgeTo edgeTo[v] = previous vertex on path to v
     * @property {array} onStack onStack[v] = is vertex on the stack?
     */
    class DirectedCycle{
      /**Determines whether the digraph {@code G} has a directed cycle and, if so,
       * finds such a cycle.
       * @param G the digraph
       */
      constructor(G){
        this.bMarked  = new Array(G.V());
        this.onStack = new Array(G.V());
        this.edgeTo  = new Array(G.V());
        this.mCycle=null;
        for(let v = 0; v < G.V(); v++)
          if(!this.bMarked[v] && this.mCycle == null) this._dfs(G, v);
      }
      // run DFS and find a directed cycle (if one exists)
      _dfs(G, v){
        this.onStack[v] = true;
        this.bMarked[v] = true;
        for(let w, it=G.adj(v).iterator(); it.hasNext();){
          w=it.next();
          // short circuit if directed cycle found
          if(this.mCycle != null) return;
          // found new vertex, so recur
          else if(!this.bMarked[w]){
            this.edgeTo[w] = v;
            this._dfs(G, w);
          }
          // trace back directed cycle
          else if(this.onStack[w]){
            this.mCycle = new Stack();
            for(let x = v; x != w; x = this.edgeTo[x]){
              this.mCycle.push(x);
            }
            this.mCycle.push(w);
            this.mCycle.push(v);
            this.check();
          }
        }
        this.onStack[v] = false;
      }
      /**
       * Does the digraph have a directed cycle?
       * @return {@code true} if the digraph has a directed cycle, {@code false} otherwise
       */
      hasCycle(){
        return this.mCycle != null;
      }
      /**
       * Returns a directed cycle if the digraph has a directed cycle, and {@code null} otherwise.
       * @return a directed cycle (as an iterable) if the digraph has a directed cycle,
       *    and {@code null} otherwise
       */
      cycle(){
        return this.mCycle;
      }
      // certify that digraph has a directed cycle if it reports one
      check(){
        if(this.hasCycle()){
          // verify cycle
          let first = -1, last = -1;
          for(let v,it=this.cycle().iterator(); it.hasNext();){
            v=it.next();
            if(first == -1) first = v;
            last = v;
          }
          if(first != last)
            throw Error(`cycle begins with ${first} and ends with ${last}\n`);
        }
        return true;
      }
      static test(){
        let T2="2 3 0 6 0 1 2 0 11 12  9 12  9 10  9 11 3 5 8 7 5 4 0 5 6 4 6 9 7 6".split(/\s+/).map(n=>{return +n});
        let s="";
        let finder =[new DirectedCycle(Digraph.test()), new DirectedCycle(Digraph.load(13,T2))];
        finder.forEach(f=>{
          if(f.hasCycle()){
            console.log("Directed cycle: ");
            s="";
            for(let v,it=f.cycle().iterator(); it.hasNext();){
              s+=`${it.next()} `;
            }
            console.log(s);
          }else{
            console.log("No directed cycle");
          }
        });
      }
    }

    /**Represents a weighted edge in an
     *  {@link EdgeWeightedDigraph}. Each edge consists of two integers
     *  (naming the two vertices) and a real-value weight. The data type
     *  provides methods for accessing the two endpoints of the directed edge and
     *  the weight.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {number} v
     * @property {number} w
     * @property {number} weight
     */
    class DirectedEdge{
      /**
       * Initializes a directed edge from vertex {@code v} to vertex {@code w} with
       * the given {@code weight}.
       * @param v the tail vertex
       * @param w the head vertex
       * @param weight the weight of the directed edge
       * @throws IllegalArgumentException if either {@code v} or {@code w}
       *    is a negative integer
       * @throws IllegalArgumentException if {@code weight} is {@code NaN}
       */
      constructor(v, w, weight){
        if (v < 0) throw Error("Vertex names must be non-negative integers");
        if (w < 0) throw Error("Vertex names must be non-negative integers");
        this.v = v;
        this.w = w;
        this._weight = weight;
      }
      /**
       * Returns the tail vertex of the directed edge.
       * @return the tail vertex of the directed edge
       */
      from(){
        return this.v;
      }
      /**
       * Returns the head vertex of the directed edge.
       * @return the head vertex of the directed edge
       */
      to(){
        return this.w;
      }
      /**
       * Returns the weight of the directed edge.
       * @return the weight of the directed edge
       */
      weight(){
        return this._weight;
      }
      /**
       * Returns a string representation of the directed edge.
       * @return a string representation of the directed edge
       */
      toString(){
        return `${this.v}->${this.w} ${Number(this._weight).toFixed(2)}`
      }
      static test(){
        console.log(new DirectedEdge(12, 34, 5.67).toString());
      }
    }

    /**Represents a edge-weighted digraph of vertices named 0 through <em>V</em> - 1,
     * where each directed edge is of type {@link DirectedEdge} and has a real-valued weight.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {number} _V number of vertices in this digraph
     * @property {number} _E number of edges in this digraph
     * @property {array} adjls adj[v] = adjacency list for vertex v
     * @property {array} _indegree  indegree[v] = indegree of vertex v
     */
    class EdgeWeightedDigraph{
      /**Initializes an empty edge-weighted digraph with {@code V} vertices and 0 edges.
       *
       * @param  V the number of vertices
       * @throws Error if {@code V < 0}
       */
      constructor(V){
        if(V < 0) throw Error("Number of vertices in a Digraph must be non-negative");
        this._V = V;
        this._E = 0;
        this._indegree = new Array(V);
        this.adjls = new Array(V);
        for(let v = 0; v < V; v++) this.adjls[v] = new Bag();
      }
      static randGraph(V, E){
        if (E < 0) throw Error("Number of edges in a Digraph must be non-negative");
        let g= new EdgeWeightedDigraph(V);
        for(let i = 0; i < E; i++)
          g.addEdge(new DirectedEdge(_.randInt2(0,V),_.randInt2(0,V), 0.01 * _randInt2(0,100)));
        return g;
      }
      static load(V,data){
        if(V < 0) throw Error("number of vertices in a Digraph must be non-negative");
        let g= new EdgeWeightedDigraph(V);
        for(let i = 0; i < data.length; i+=3){
          _validateVertex(data[i],V);
          _validateVertex(data[i+1],V);
          //console.log(`d1=${data[i]}, d2=${data[i+1]}, d3=${data[i+2]}`);
          g.addEdge(new DirectedEdge(data[i],data[i+1],data[i+2]));
        }
        return g;
      }
      clone(){
        let g= new EdgeWeightedDigraph(this.V());
        g._E = this.E();
        for(let v = 0; v < this.V(); v++)
          g._indegree[v] = this._indegree(v);
        for(let r,v = 0; v < this.V(); v++){
          // reverse so that adjacency list is in same order as original
          r= new Stack();
          for(let e,it=this.adjls[v].iterator(); it.hasNext();){
            r.push(it.next());
          }
          for(let e,it=r.iterator();it.hasNext();){
            g.adjls[v].add(it.next());
          }
        }
        return g;
      }
      /**Returns the number of vertices in this edge-weighted digraph.
       *
       * @return the number of vertices in this edge-weighted digraph
       */
      V(){
        return this._V;
      }
      /**Returns the number of edges in this edge-weighted digraph.
       *
       * @return the number of edges in this edge-weighted digraph
       */
      E(){
        return this._E;
      }
      /**Adds the directed edge {@code e} to this edge-weighted digraph.
       *
       * @param  e the edge
       * @throws Error unless endpoints of edge are between {@code 0}
       *         and {@code V-1}
       */
      addEdge(e){
        _.assert(e instanceof DirectedEdge,"Expected DirectedEdge");
        let v = e.from();
        let w = e.to();
        _validateVertex(v,this._V);
        _validateVertex(w,this._V);
        this.adjls[v].add(e);
        this._indegree[w]+=1;
        this._E++;
      }
      /**Returns the directed edges incident from vertex {@code v}.
       *
       * @param  v the vertex
       * @return the directed edges incident from vertex {@code v} as an Iterable
       * @throws Error unless {@code 0 <= v < V}
       */
      adj(v){
        _validateVertex(v,this._V);
        return this.adjls[v];
      }
      /**Returns the number of directed edges incident from vertex {@code v}.
       * This is known as the <em>outdegree</em> of vertex {@code v}.
       *
       * @param  v the vertex
       * @return the outdegree of vertex {@code v}
       * @throws Error unless {@code 0 <= v < V}
       */
      outdegree(v){
        _validateVertex(v,this._V);
        return this.adjls[v].size();
      }
      /**Returns the number of directed edges incident to vertex {@code v}.
       * This is known as the <em>indegree</em> of vertex {@code v}.
       *
       * @param  v the vertex
       * @return the indegree of vertex {@code v}
       * @throws Error unless {@code 0 <= v < V}
       */
      indegree(v){
        _validateVertex(v,this._V);
        return this._indegree[v];
      }
      /**Returns all directed edges in this edge-weighted digraph.
       * To iterate over the edges in this edge-weighted digraph, use foreach notation:
       * {@code for (DirectedEdge e : G.edges())}.
       *
       * @return all edges in this edge-weighted digraph, as an iterable
       */
      edges(){
        let list = new Bag();
        for(let v = 0; v < this._V; v++){
          for(let e, it= this.adj(v).iterator(); it.hasNext();) list.add(it.next());
        }
        return list;
      }
      /**Returns a string representation of this edge-weighted digraph.
       *
       * @return the number of vertices <em>V</em>, followed by the number of edges <em>E</em>,
       *         followed by the <em>V</em> adjacency lists of edges
       */
      toString(){
        let s= `${this._V} ${this._E}\n`;
        for(let v = 0; v < this._V; v++){
          s+= `${v}: `;
          for(let e,it= this.adjls[v].iterator(); it.hasNext();){
            s+= `${it.next()}  `;
          }
          s+="\n";
        }
        return s;
      }
      static test(){
        let data=
        `4 5 0.35
        5 4 0.35
        4 7 0.37
        5 7 0.28
        7 5 0.28
        5 1 0.32
        0 4 0.38
        0 2 0.26
        7 3 0.39
        1 3 0.29
        2 7 0.34
        6 2 0.40
        3 6 0.52
        6 0 0.58
        6 4 0.93`.split(/\s+/).map(n=>{return +n});
        let G = EdgeWeightedDigraph.load(8,data);
        console.log(G.toString());
      }
    }

    /**Represents a data type for determining depth-first search ordering of the vertices in a digraph
     *  or edge-weighted digraph, including preorder, postorder, and reverse postorder.
     *  <p>
     *  This implementation uses depth-first search.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} bMarked marked[v] = has v been marked in dfs?
     * @property {array} _pre pre[v]    = preorder  number of v
     * @property {array} _post post[v]   = postorder number of v
     * @property {array} preorder vertices in preorder
     * @property {array} postorder vertices in postorder
     * @property {number} preCounter counter or preorder numbering
     * @property {number} postCounter counter for postorder numbering
     */
    class DepthFirstOrder{
      /**Determines a depth-first order for the digraph {@code G}.
       * @param G the digraph
       */
      constructor(G){
        this._pre    = new Array(G.V());
        this._post   = new Array(G.V());
        this.preCounter=0;
        this.postCounter=0;
        this.postorder = new Queue();
        this.preorder  = new Queue();
        this.bMarked    = new Array(G.V());
        for(let v = 0; v < G.V(); v++)
          if(!this.bMarked[v]) this._dfs(G, v);
        //assert check();
      }
      // run DFS in edge-weighted digraph G from vertex v and compute preorder/postorder
      // run DFS in digraph G from vertex v and compute preorder/postorder
      _dfs(G, v){
        this.bMarked[v] = true;
        this._pre[v] = this.preCounter++;
        this.preorder.enqueue(v);
        for(let w, it=G.adj(v).iterator(); it.hasNext();){
          w= (G instanceof EdgeWeightedDigraph)? it.next().to() : it.next();
          if(!this.bMarked[w]) this._dfs(G, w);
        }
        this.postorder.enqueue(v);
        this._post[v] = this.postCounter++;
      }
      /**Returns the preorder number of vertex {@code v}.
       * @param  v the vertex
       * @return the preorder number of vertex {@code v}
       * @throws Error unless {@code 0 <= v < V}
       */
      pre(v){
        _validateVertex(v,this.bMarked.length);
        return this._pre[v];
      }
      /**Returns the postorder number of vertex {@code v}.
       * @param  v the vertex
       * @return the postorder number of vertex {@code v}
       * @throws Error unless {@code 0 <= v < V}
       */
      post(v){
        _validateVertex(v,this.bMarked.length);
        return this._post[v];
      }
      /**Returns the vertices in postorder.
       * @return the vertices in postorder, as an iterable of vertices
       */
      postOrder(){
        return this.postorder;
      }
      /**Returns the vertices in preorder.
       * @return the vertices in preorder, as an iterable of vertices
       */
      preOrder(){
        return this.preorder;
      }
      /**Returns the vertices in reverse postorder.
       * @return the vertices in reverse postorder, as an iterable of vertices
       */
      reversePost(){
        let r= new Stack(),
            it= this.postorder.iterator();
        while(it.hasNext())
          r.push(it.next());
        return r;
      }
      // check that pre() and post() are consistent with pre(v) and post(v)
      check(){
        // check that post(v) is consistent with post()
        let r = 0;
        this.postOrder().forEach(v=>{
          if(this.post(v) != r)
            throw Error("post(v) and post() inconsistent");
          r++;
        })
        // check that pre(v) is consistent with pre()
        r = 0;
        this.preOrder().forEach(v=>{
          if(this.pre(v) != r)
            throw Error("pre(v) and pre() inconsistent");
          r++;
        });
        return true;
      }
      static test(){
        let G = Digraph.load(13,
                             "2 3 0 6 0 1 2 0 11 12  9 12  9 10  9 11 3 5 8 7 5 4 0 5 6 4 6 9 7 6".split(/\s+/).map(n=>{return +n}));
        console.log(G.toString());

        let s,dfs = new DepthFirstOrder(G);
        console.log("   v  pre post");
        console.log("--------------");
        for(let v = 0; v < G.V(); v++)
          console.log(`${v} ${dfs.pre(v)} ${dfs.post(v)}\n`);

        console.log("Preorder:  ");
        console.log(dbgIter(dfs.preOrder()));

        console.log("Postorder:  ");
        console.log(dbgIter(dfs.postOrder()));
        console.log("");

        console.log("Reverse postorder: ");
        console.log(dbgIter(dfs.reversePost()));
      }
    }

    /**Represents a data type for
     *  determining whether an edge-weighted digraph has a directed cycle.
     *  The <em>hasCycle</em> operation determines whether the edge-weighted
     *  digraph has a directed cycle and, if so, the <em>cycle</em> operation
     *  returns one.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} bMarked marked[v] = has v been marked in dfs?
     * @property {array} edgeTo  edgeTo[v] = previous edge on path to v
     * @property {array} onStack onStack[v] = is vertex on the stack?
     * @property {Stack} mCycle directed cycle (or null if no such cycle)
     */
    class EdgeWeightedDirectedCycle{
      /**
       * Determines whether the edge-weighted digraph {@code G} has a directed cycle and,
       * if so, finds such a cycle.
       * @param G the edge-weighted digraph
       */
      constructor(G){
        _.assert(G instanceof EdgeWeightedDigraph,"Expected EdgeWeightedDigraph");
        this.bMarked  = new Array(G.V());
        this.onStack = new Array(G.V());
        this.edgeTo  = new Array(G.V());
        for(let v = 0; v < G.V(); v++)
          if(!this.bMarked[v]) this._dfs(G, v);
        //check();
      }
      // check that algorithm computes either the topological order or finds a directed cycle
      _dfs(G, v){
        this.onStack[v] = true;
        this.bMarked[v] = true;
        for(let w,e,it=G.adj(v).iterator();it.hasNext();){
          e=it.next();
          w= e.to();
          // short circuit if directed cycle found
          if(this.mCycle != null) return;
          // found new vertex, so recur
          else if(!this.bMarked[w]){
            this.edgeTo[w] = e;
            this._dfs(G, w);
          }
          // trace back directed cycle
          else if(this.onStack[w]){
            this.mCycle = new Stack();
            let f = e;
            while(f.from() != w){
              this.mCycle.push(f);
              f = this.edgeTo[f.from()];
            }
            this.mCycle.push(f);
            return;
          }
        }
        this.onStack[v] = false;
      }
      /**
       * Does the edge-weighted digraph have a directed cycle?
       * @return {@code true} if the edge-weighted digraph has a directed cycle,
       * {@code false} otherwise
       */
      hasCycle(){
        return this.mCycle != null;
      }
      /**
       * Returns a directed cycle if the edge-weighted digraph has a directed cycle,
       * and {@code null} otherwise.
       * @return a directed cycle (as an iterable) if the edge-weighted digraph
       *    has a directed cycle, and {@code null} otherwise
       */
      cycle(){
        return this.mCycle;
      }
      // certify that digraph is either acyclic or has a directed cycle
      check(){
        // edge-weighted digraph is cyclic
        if(this.hasCycle()){
          // verify cycle
          let first = null, last = null;
          for(let e, it=this.cycle().iterator(); it.hasNext();){
            if(first == null) first = e;
            if(last != null){
              if(last.to() != e.from())
                throw Error(`cycle edges ${last} and ${e} not incident\n`);
            }
            last = e;
          }
          if(last.to() != first.from())
            throw Error(`cycle edges ${last} and ${first} not incident\n`);
        }
        return true;
      }
      static test(){
        // create random DAG with V vertices and E edges; then add F random edges
        let V = 13,E=8, F=6;
        let G = new EdgeWeightedDigraph(V);
        let vertices = new Array(V);
        for(let i = 0; i < V; i++) vertices[i] = i;
        _.shuffle(vertices);
        for(let wt,v,w,i = 0; i < E; i++){
          do{
            v = _.randInt2(0,V);
            w = _.randInt2(0,V);
          }while(v >= w);
          wt = _.rand();
          G.addEdge(new DirectedEdge(v, w, wt));
        }
        // add F extra edges
        for(let i = 0; i < F; i++){
          G.addEdge(new DirectedEdge(_.randInt2(0,V),_.randInt2(0,V),_.rand()));
        }
        console.log(G.toString());
        // find a directed cycle
        let s,finder = new EdgeWeightedDirectedCycle(G);
        if(finder.hasCycle()){
          console.log("Cycle: " + dbgIter(finder.cycle()));
        }else{
          console.log("No directed cycle");
        }
      }
    }

    /**Represents a digraph, where the
     *  vertex names are arbitrary strings.
     *  By providing mappings between string vertex names and integers,
     *  it serves as a wrapper around the
     *  {@link Digraph} data type, which assumes the vertex names are integers
     *  between 0 and <em>V</em> - 1.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {ST} st string -> index
     * @property {array} keys index  -> string
     * @property {Graph} _graph the underlying digraph
     */
    class SymbolGraph{
      /**
       * Initializes a graph from a file using the specified delimiter.
       * Each line in the file contains
       * the name of a vertex, followed by a list of the names
       * of the vertices adjacent to that vertex, separated by the delimiter.
       * @param filename the name of the file
       * @param delimiter the delimiter between fields
       */
      constructor(data){
        this.st = new ST();
        // First pass builds the index by reading strings to associate distinct strings with an index
        data.forEach(row=> row.forEach((s,i)=>{
          if(!this.st.contains(s)) this.st.put(s, this.st.size())
        }));
        //inverted index to get string keys in an array
        this.keys = new Array(this.st.size());
        for(let n,it= this.st.keys().iterator();it.hasNext();){
          n=it.next();
          this.keys[this.st.get(n)] = n;
        }
        // second pass builds the graph by connecting first vertex on each line to all others
        this._graph = new Graph(this.st.size());
        data.forEach(row=>{
          let v = this.st.get(row[0]);
          for(let w,i = 1; i < row.length; ++i){
            w = this.st.get(row[i]);
            this._graph.addEdge(v, w);
          }
        })
      }
      /**
       * Does the graph contain the vertex named {@code s}?
       * @param s the name of a vertex
       * @return {@code true} if {@code s} is the name of a vertex, and {@code false} otherwise
       */
      contains(s){
        return this.st.contains(s);
      }
      /**
       * Returns the integer associated with the vertex named {@code s}.
       * @param s the name of a vertex
       * @return the integer (between 0 and <em>V</em> - 1) associated with the vertex named {@code s}
       */
      indexOf(s){
        return this.st.get(s);
      }
      /**
       * Returns the name of the vertex associated with the integer {@code v}.
       * @param  v the integer corresponding to a vertex (between 0 and <em>V</em> - 1)
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       * @return the name of the vertex associated with the integer {@code v}
       */
      nameOf(v){
        _validateVertex(v,this._graph.V());
        return this.keys[v];
      }
      /**
       * Returns the graph assoicated with the symbol graph. It is the client's responsibility
       * not to mutate the graph.
       * @return the graph associated with the symbol graph
       */
      graph(){
        return this._graph;
      }
      static test(){
        let data=`JFK MCO
                  ORD DEN
                  ORD HOU
                  DFW PHX
                  JFK ATL
                  ORD DFW
                  ORD PHX
                  ATL HOU
                  DEN PHX
                  PHX LAX
                  JFK ORD
                  DEN LAS
                  DFW HOU
                  ORD ATL
                  LAS LAX
                  ATL MCO
                  HOU MCO
                  LAS PHX`.split(/\s+/);
        let sg = new SymbolGraph(_.partition(2,data));
        let graph = sg.graph();
        ["JFK","LAX"].forEach(k=>{
          if(sg.contains(k)){
            let s = sg.indexOf(k);
            console.log(k)
            for(let v,it= graph.adj(s).iterator(); it.hasNext();)
              console.log("   " + sg.nameOf(it.next()));
          }else{
            console.log("input not contain '" + k + "'");
          }
        });
      }
    }

    /**Represents a digraph, where the
     *  vertex names are arbitrary strings.
     *  By providing mappings between string vertex names and integers,
     *  it serves as a wrapper around the
     *  {@link Digraph} data type, which assumes the vertex names are integers
     *  between 0 and <em>V</em> - 1.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {ST} st string -> index
     * @property {array} keys index  -> string
     * @property {Digraph} graph the underlying digraph
     */
    class SymbolDigraph{
      /**
       * Initializes a digraph from a file using the specified delimiter.
       * Each line in the file contains
       * the name of a vertex, followed by a list of the names
       * of the vertices adjacent to that vertex, separated by the delimiter.
       * @param filename the name of the file
       * @param delimiter the delimiter between fields
       */
      constructor(data){
        this.st = new ST();
        // First pass builds the index by reading strings to associate
        // distinct strings with an index
        data.forEach(row=> row.forEach(s=>{
          if(!this.st.contains(s))
            this.st.put(s, this.st.size())
        }));
        // inverted index to get string keys in an array
        this.keys = new Array(this.st.size());
        for(let n,it=this.st.keys().iterator();it.hasNext();){
          n=it.next();
          this.keys[this.st.get(n)] = n;
        }
        // second pass builds the digraph by connecting first vertex on each
        // line to all others
        this.graph = new Digraph(this.st.size());
        data.forEach(row=> {
          let v = this.st.get(row[0]);
          for(let w,i = 1; i < row.length; i++){
            w = this.st.get(row[i]);
            this.graph.addEdge(v, w);
          }
        });
      }
      /**
       * Does the digraph contain the vertex named {@code s}?
       * @param s the name of a vertex
       * @return {@code true} if {@code s} is the name of a vertex, and {@code false} otherwise
       */
      contains(s){
        return this.st.contains(s);
      }
      /**
       * Returns the integer associated with the vertex named {@code s}.
       * @param s the name of a vertex
       * @return the integer (between 0 and <em>V</em> - 1) associated with the vertex named {@code s}
       */
      indexOf(s){
        return this.st.get(s);
      }
      /**
       * Returns the name of the vertex associated with the integer {@code v}.
       * @param  v the integer corresponding to a vertex (between 0 and <em>V</em> - 1)
       * @return the name of the vertex associated with the integer {@code v}
       * @throws Error unless {@code 0 <= v < V}
       */
      nameOf(v){
        _validateVertex(v, this.graph.V());
        return this.keys[v];
      }
      /**
       * Returns the digraph assoicated with the symbol graph. It is the client's responsibility
       * not to mutate the digraph.
       *
       * @return the digraph associated with the symbol digraph
       */
      digraph(){
        return this.graph;
      }
      static test(){
        let s=`JFK MCO
              ORD DEN
              ORD HOU
              DFW PHX
              JFK ATL
              ORD DFW
              ORD PHX
              ATL HOU
              DEN PHX
              PHX LAX
              JFK ORD
              DEN LAS
              DFW HOU
              ORD ATL
              LAS LAX
              ATL MCO
              HOU MCO
              LAS PHX`.split(/\s+/);
        let data=[];
        for(let i=0;i<s.length;i+=2) data.push([s[i],s[i+1]]);
        let sg = new SymbolDigraph(data);
        let G = sg.digraph();
        ["JFK","ATL","LAX"].forEach(x=>{
          let z=G.adj(sg.indexOf(x)), it=z?z.iterator():null;
          if(it)while(it.hasNext()){
            console.log("   " + sg.nameOf(it.next()));
          }
        });
      }
    }

    /**Represents a data type for
     *  determining a topological order of a <em>directed acyclic graph</em> (DAG).
     *  A digraph has a topological order if and only if it is a DAG.
     *  The <em>hasOrder</em> operation determines whether the digraph has
     *  a topological order, and if so, the <em>order</em> operation
     *  returns one.
     * @memberof module:mcfud/algo_graph
     * @class
     */
    class Topological{
      /**
       * Determines whether the digraph {@code G} has a topological order and, if so,
       * finds such a topological order.
       * @param G the digraph
       */
      constructor(G){
        this._order=null;
        this.rank=null;
        if(G instanceof Digraph){
          let finder = new DirectedCycle(G);
          if(!finder.hasCycle()){
            let dfs = new DepthFirstOrder(G);
            this._order = dfs.reversePost();
            this.rank = new Array(G.V());
            for(let v,i=0,it=this._order.iterator(); it.hasNext();) this.rank[it.next()] = i++;
          }
        }else if(G instanceof EdgeWeightedDigraph){
          let finder = new EdgeWeightedDirectedCycle(G);
          if(!finder.hasCycle()){
              let dfs = new DepthFirstOrder(G);
              this._order = dfs.reversePost();
          }
        }
      }
      /**
       * Returns a topological order if the digraph has a topologial order,
       * and {@code null} otherwise.
       * @return a topological order of the vertices (as an interable) if the
       *    digraph has a topological order (or equivalently, if the digraph is a DAG),
       *    and {@code null} otherwise
       */
      order(){
        return this._order;
      }
      /**
       * Does the digraph have a topological order?
       * @return {@code true} if the digraph has a topological order (or equivalently,
       *    if the digraph is a DAG), and {@code false} otherwise
       */
      hasOrder(){
        return this._order != null;
      }
      /**
       * The the rank of vertex {@code v} in the topological order;
       * -1 if the digraph is not a DAG
       *
       * @param v the vertex
       * @return the position of vertex {@code v} in a topological order
       *    of the digraph; -1 if the digraph is not a DAG
       * @throws Error unless {@code 0 <= v < V}
       */
      rank(v){
        _validateVertex(v,this.rank.length);
        if(this.hasOrder()) return this.rank[v];
        else return -1;
      }
      static test(){
        let sg = new SymbolDigraph(
        [[`Algorithms`,`Theoretical CS`,`Databases`,`Scientific Computing`],
[`Introduction to CS`,`Advanced Programming`,`Algorithms`],
[`Advanced Programming`,`Scientific Computing`],
[`Scientific Computing`,`Computational Biology`],
[`Theoretical CS`,`Computational Biology`,`Artificial Intelligence`],
[`Linear Algebra`,`Theoretical CS`],
[`Calculus`,`Linear Algebra`],
[`Artificial Intelligence`,`Neural Networks`,`Robotics`,`Machine Learning`],
[`Machine Learning`,`Neural Networks`]]);
        let topological = new Topological(sg.digraph());
        for(let v,it=topological.order().iterator(); it.hasNext();){
          console.log(sg.nameOf(it.next()));
        }
      }
    }

    /**Represents a data type for solving the
     *  single-source shortest paths problem in edge-weighted digraphs
     *  where the edge weights are non-negative.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} marked  marked[v] = true iff v is reachable from s
     * @property {array} edgeTo  edgeTo[v] = last edge on path from s to v
     * @property {number} s source vertex
     */
    class DepthFirstDirectedPaths{
      /**
       * Computes a directed path from {@code s} to every other vertex in digraph {@code G}.
       * @param  G the digraph
       * @param  s the source vertex
       * @throws Error unless {@code 0 <= s < V}
       */
      constructor(G, s){
        this.bMarked = new Array(G.V());
        this.edgeTo = new Array(G.V());
        this.s = s;
        _validateVertex(s,this.bMarked.length);
        this._dfs(G, s);
      }
      _dfs(G, v){
        this.bMarked[v] = true;
        for(let w,it= G.adj(v).iterator();it.hasNext();){
          w=it.next();
          if(!this.bMarked[w]){
            this.edgeTo[w] = v;
            this._dfs(G, w);
          }
        }
      }
      /**
       * Is there a directed path from the source vertex {@code s} to vertex {@code v}?
       * @param  v the vertex
       * @return {@code true} if there is a directed path from the source
       *         vertex {@code s} to vertex {@code v}, {@code false} otherwise
       * @throws Error unless {@code 0 <= v < V}
       */
      hasPathTo(v){
        _validateVertex(v,this.bMarked.length);
        return this.bMarked[v];
      }
      /**
       * Returns a directed path from the source vertex {@code s} to vertex {@code v}, or
       * {@code null} if no such path.
       * @param  v the vertex
       * @return the sequence of vertices on a directed path from the source vertex
       *         {@code s} to vertex {@code v}, as an Iterable
       * @throws Error unless {@code 0 <= v < V}
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
        let D=`4  2 2  3 3  2 6  0 0  1 2  0 11 12 12  9 9 10
              9 11 7  9 10 12 11  4 4  3 3  5 6
              8 8  6 5  4 0  5 6  4 6  9 7  6`.split(/\s+/).map(n=>{return +n});
        let s=3,G = Digraph.load(13,D);
        let msg, dfs = new DepthFirstDirectedPaths(G, s);
        for(let v = 0; v < G.V(); v++){
          if(dfs.hasPathTo(v)){
            msg= `${s} to ${v}:  `;
            for(let x,it= dfs.pathTo(v).iterator();it.hasNext();){
              x=it.next();
              if(x == s) msg += `${x}`;
              else msg += `-${x}`;
            }
            console.log(msg);
          }else{
            console.log(`${s} to ${v}:  not connected\n`);
          }
        }
      }
    }

    /**Represents a data type for solving the
     *  single-source shortest paths problem in edge-weighted digraphs
     *  where the edge weights are non-negative.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} marked marked[v] = is there an s->v path?
     * @property {array} edgeTo edgeTo[v] = last edge on shortest s->v path
     * @property {array} distTo distTo[v] = length of shortest s->v path
     */
    class BreadthFirstDirectedPaths{
      /**Computes the shortest path from {@code s} and every other vertex in graph {@code G}.
       * @param G the digraph
       * @param s the source vertex
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      constructor(G, s){
        if(!is.vec(s)) s= [s];
        this.bMarked = new Array(G.V());
        this.mDistTo = new Array(G.V());
        this.edgeTo = new Array(G.V());
        for(let v = 0; v < G.V(); v++)
          this.mDistTo[v] = Infinity;
        this._validateVertices(s);
        this._bfs(G, s);
      }
      _bfs(G, sources){
        let q = new Queue();
        sources.forEach(s=>{
          this.bMarked[s] = true;
          this.mDistTo[s] = 0;
          q.enqueue(s);
        });
        while(!q.isEmpty()){
          let v = q.dequeue();
          for(let w, it= G.adj(v).iterator();it.hasNext();){
            w=it.next();
            if(!this.bMarked[w]){
              this.edgeTo[w] = v;
              this.mDistTo[w] = this.mDistTo[v] + 1;
              this.bMarked[w] = true;
              q.enqueue(w);
            }
          }
        }
      }
      /**Is there a directed path from the source {@code s} (or sources) to vertex {@code v}?
       * @param v the vertex
       * @return {@code true} if there is a directed path, {@code false} otherwise
       * @throws Error unless {@code 0 <= v < V}
       */
      hasPathTo(v){
        _validateVertex(v,this.bMarked.length);
        return this.bMarked[v];
      }
      /**
       * Returns the number of edges in a shortest path from the source {@code s}
       * (or sources) to vertex {@code v}?
       * @param v the vertex
       * @return the number of edges in such a shortest path
       *         (or {@code Integer.MAX_VALUE} if there is no such path)
       * @throws Error unless {@code 0 <= v < V}
       */
      distTo(v){
        _validateVertex(v,this.bMarked.length);
        return this.mDistTo[v];
      }
      /**
       * Returns a shortest path from {@code s} (or sources) to {@code v}, or
       * {@code null} if no such path.
       * @param v the vertex
       * @return the sequence of vertices on a shortest path, as an Iterable
       * @throws Error unless {@code 0 <= v < V}
       */
      pathTo(v){
        _validateVertex(v,this.bMarked.length);
        if(!this.hasPathTo(v)) return null;
        let x,path = new Stack();
        for(x = v; this.mDistTo[x] != 0; x = this.edgeTo[x]) path.push(x);
        path.push(x);
        return path;
      }
      _validateVertices(vertices){
        if(!vertices)
          throw Error("argument is null");
        let cnt=0,
            V = this.bMarked.length;
        vertices.forEach(v=>{
          ++cnt;
          _validateVertex(v,V);
        });
        if(cnt == 0)
          throw Error("zero vertices");
      }
      static test(){
       let D=`4  2 2  3 3  2 6  0 0  1 2  0 11 12 12  9 9 10
              9 11 7  9 10 12 11  4 4  3 3  5 6
              8 8  6 5  4 0  5 6  4 6  9 7  6`.split(/\s+/).map(n=>{return +n});
        let s=3,G = Digraph.load(13,D);
        //console.log(G.toString());
        let msg,bfs = new BreadthFirstDirectedPaths(G,s);
        for(let v = 0; v < G.V(); v++){
          msg="";
          if(bfs.hasPathTo(v)){
            msg= `${s} to ${v} (${bfs.distTo(v)}):  `;
            for(let x,it= bfs.pathTo(v).iterator();it.hasNext();){
              x=it.next();
              if(x == s) msg+= `${x}`;
              else msg += `->${x}`;
            }
            console.log(msg);
          }else{
            console.log(`${s} to ${v} (-):  not connected\n`);
          }
        }
      }
    }

    /**Represents a data type for solving the
     *  single-source shortest paths problem in edge-weighted digraphs
     *  where the edge weights are non-negative.
     * @memberof module:mcfud/algo_graph
     * @class
     * @property {array} distTo   distTo[v] = distance  of shortest s->v path
     * @property {array} edgeTo   edgeTo[v] = last edge on shortest s->v path
     * @property {IndexMinPQ} pq priority queue of vertices
     */
    class DijkstraSP{
      /**
       * Computes a shortest-paths tree from the source vertex {@code s} to every other
       * vertex in the edge-weighted digraph {@code G}.
       *
       * @param  G the edge-weighted digraph
       * @param  s the source vertex
       * @throws Error if an edge weight is negative
       * @throws Error unless {@code 0 <= s < V}
       */
      constructor(G, s,compareFn){
        _.assert(G instanceof EdgeWeightedDigraph,"Expected EdgeWeightedDigraph");
        for(let e,it=G.edges().iterator();it.hasNext();){
          e=it.next();
          if(e.weight() < 0)
            throw Error(`edge ${e} has negative weight`);
        }
        this._distTo = new Array(G.V());
        this.edgeTo = new Array(G.V());
        _validateVertex(s, G.V());
        for(let v = 0; v < G.V(); v++)
          this._distTo[v] = Infinity;
        this._distTo[s] = 0.0;
        // relax vertices in order of distance from s
        this.pq = new IndexMinPQ(G.V(),compareFn);
        this.pq.insert(s, this._distTo[s]);
        while(!this.pq.isEmpty()){
          let v = this.pq.delMin();
          for(let it=G.adj(v).iterator(); it.hasNext();)
            this._relax(it.next());
        }
        // check optimality conditions
        //assert check(G, s);
      }
      // relax edge e and update pq if changed
      _relax(e){
        let v = e.from(), w = e.to();
        if(this._distTo[w] > this._distTo[v] + e.weight()){
          this._distTo[w] = this._distTo[v] + e.weight();
          this.edgeTo[w] = e;
          if(this.pq.contains(w)) this.pq.decreaseKey(w, this._distTo[w]);
          else this.pq.insert(w, this._distTo[w]);
        }
      }
      /**
       * Returns the length of a shortest path from the source vertex {@code s} to vertex {@code v}.
       * @param  v the destination vertex
       * @return the length of a shortest path from the source vertex {@code s} to vertex {@code v};
       *         {@code Double.POSITIVE_INFINITY} if no such path
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      distTo(v){
        _validateVertex(v,this._distTo.length);
        return this._distTo[v];
      }
      /**
       * Returns true if there is a path from the source vertex {@code s} to vertex {@code v}.
       *
       * @param  v the destination vertex
       * @return {@code true} if there is a path from the source vertex
       *         {@code s} to vertex {@code v}; {@code false} otherwise
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      hasPathTo(v){
        _validateVertex(v,this._distTo.length);
        return this._distTo[v] < Infinity;
      }
      /**
       * Returns a shortest path from the source vertex {@code s} to vertex {@code v}.
       *
       * @param  v the destination vertex
       * @return a shortest path from the source vertex {@code s} to vertex {@code v}
       *         as an iterable of edges, and {@code null} if no such path
       * @throws IllegalArgumentException unless {@code 0 <= v < V}
       */
      pathTo(v){
        _validateVertex(v,this._distTo.length);
        if(!this.hasPathTo(v)) return null;
        let path = new Stack();
        for(let e = this.edgeTo[v]; e != null; e = this.edgeTo[e.from()]){
          path.push(e);
        }
        return path;
      }
      // check optimality conditions:
      // (i) for all edges e:            distTo[e.to()] <= distTo[e.from()] + e.weight()
      // (ii) for all edge e on the SPT: distTo[e.to()] == distTo[e.from()] + e.weight()
      check(G, s){
        // check that edge weights are non-negative
        for(let e,it=G.edges().iterator();it.hasNext();){
          if(it.next().weight() < 0)
            throw Error("negative edge weight detected");
        }
        // check that distTo[v] and edgeTo[v] are consistent
        if(this._distTo[s] != 0.0 || this.edgeTo[s] != null)
          throw Error("distTo[s] and edgeTo[s] inconsistent");
        ////
        for(let v = 0; v < G.V(); v++){
          if(v == s) continue;
          if(this.edgeTo[v] == null && this._distTo[v] != Infinity)
            throw Error("distTo[] and edgeTo[] inconsistent");
        }
        // check that all edges e = v->w satisfy distTo[w] <= distTo[v] + e.weight()
        for(let v = 0; v < G.V(); v++){
          for(let w,e,it=G.adj(v).iterator();it.hasNext();){
            e=it.next();
            w = e.to();
            if(this._distTo[v] + e.weight() < this._distTo[w])
              throw Error(`edge ${e} not relaxed`);
          }
        }
        // check that all edges e = v->w on SPT satisfy distTo[w] == distTo[v] + e.weight()
        for(let v,e,w = 0; w < G.V(); w++){
          if(this.edgeTo[w] == null) continue;
          e = this.edgeTo[w];
          v = e.from();
          if(w != e.to()) throw Error("bad");
          if(this._distTo[v] + e.weight() != this._distTo[w])
            throw Error(`edge ${e} on shortest path not tight`);
        }
        return true;
      }
      static test(){
        let data= `4 5 0.35
                  5 4 0.35
                  4 7 0.37
                  5 7 0.28
                  7 5 0.28
                  5 1 0.32
                  0 4 0.38
                  0 2 0.26
                  7 3 0.39
                  1 3 0.29
                  2 7 0.34
                  6 2 0.40
                  3 6 0.52
                  6 0 0.58
                  6 4 0.93`.split(/\s+/).map(n=>{return +n});
        let G = EdgeWeightedDigraph.load(8,data);
        //console.log(G.toString());
        let s=0,sp = new DijkstraSP(G, s,CMP);
        // print shortest path
        for(let t = 0; t < G.V(); t++){
          if(sp.hasPathTo(t)){
            console.log(`${s} to ${t} (${Number(sp.distTo(t)).toFixed(2)})  ${dbgIter(sp.pathTo(t))}`);
          }else{
            console.log(`${s} to ${t}         no path\n`);
          }
        }
      }
    }

    //DepthFirstDirectedPaths.test();
    //BreadthFirstDirectedPaths.test();
    //SymbolGraph.test();
    //DijkstraSP.test();
    //Topological.test();
    //SymbolDigraph.test();
    //EdgeWeightedDirectedCycle.test();
    //DepthFirstOrder.test();
    //EdgeWeightedDigraph.test();
    //DirectedEdge.test();
    //DirectedCycle.test();
    //DirectedDFS.test();
    //Digraph.test();
    //CC.test();
    //EdgeWeightedGraph.test();
    //Edge.test();
    //BreadthFirstPaths.test();
    //DepthFirstPaths.test();
    //NonrecursiveDFS.test();
    //DepthFirstSearch.test();
    //Graph.test();

    const _$={
      DepthFirstDirectedPaths,
      BreadthFirstDirectedPaths,
      SymbolGraph,
      DijkstraSP,
      Topological,
      SymbolDigraph,
      EdgeWeightedDirectedCycle,
      DepthFirstOrder,
      EdgeWeightedDigraph,
      DirectedEdge,
      DirectedCycle,
      DirectedDFS,
      Digraph,
      CC,
      EdgeWeightedGraph,
      Edge,
      BreadthFirstPaths,
      DepthFirstPaths,
      NonrecursiveDFS,
      DepthFirstSearch,
      Graph
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("../main/core"),require("./basic"), require("./sort"))
  }else{
    gscope["io/czlab/mcfud/algo/graph"]=_module
  }

})(this);


