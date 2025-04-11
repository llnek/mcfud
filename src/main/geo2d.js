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
// Copyright © 2025, Kenneth Leung. All rights reserved.

;(function(gscope,UNDEF){

  "use strict";

  /** @ignore */
  const [LEFT_VORONOI, MID_VORONOI, RIGHT_VORONOI]= [1,0,-1];

  /**Create the module.
   * Standard XY cartesian coordinates, Y axis goes UP
   */
  function _module(Core,_M,_V,_X,_B){

    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    if(!_M) _M=gscope["io/czlab/mcfud/math"]();
    if(!_V) _V=gscope["io/czlab/mcfud/vec2"]();
    if(!_X) _X=gscope["io/czlab/mcfud/matrix"]();
    if(!_B) _B= gscope["io/czlab/mcfud/algo/basic"]();

    const {Stack,StdCompare:CMP}= _B;
    const int=Math.floor;
    const MaxVerts=36;
    const {is,u:_}=Core;

    /**
     * @module mcfud/geo2d
     */

    /**
     * @typedef {number[]} Vec2
     */

    /**Check if point inside a polygon.
     * @see https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html
     * @ignore
     */
    function _pointInPoly(testx,testy,points){
      let c=false,
          nvert=points.length;
      for(let p,q, i=0, j=nvert-1; i<nvert;){
        p=points[i];
        q=points[j];
        if(((p[1]>testy) !== (q[1]>testy)) &&
          (testx < (q[0]-p[0]) * (testy-p[1]) / (q[1]-p[1]) + p[0])) c = !c;
        j=i;
        ++i;
      }
      return c
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const TheHull=_.fill(MaxVerts,UNDEF);
    /**Original source from Randy Gaul's impulse-engine:
     * https://github.com/RandyGaul/ImpulseEngine#Shape.h
     */
    function _orderPointsCCW(vertices){
      _.assert(vertices.length>2 && vertices.length <= MaxVerts, "too little/many vertices");
      //find the right-most point
      let rightMost=0,
          maxX= vertices[0][0];
      for(let x,i=1; i<vertices.length; ++i){
        x=vertices[i][0];
        if(x>maxX){
          maxX= x;
          rightMost= i;
        }else if(_.feq(x, maxX) &&
                 vertices[i][1]<vertices[rightMost][1]){
          //if same x then choose one with smaller y
          rightMost = i;
        }
      }
      let hpos=0,
          cur=rightMost;
      //examine all the points, sorting them in order of ccw from the rightmost, one by one
      //and eventually wraps back to the rightmost point, at which time exit this inf-loop
      for(;;){
        TheHull[hpos]=cur;
        //search for next index that wraps around the hull
        //by computing cross products to find the most counter-clockwise
        //vertex in the set, given the previos hull index
        let next= 0,
            hp=TheHull[hpos];
        for(let e1,e2,c,i=1; i<vertices.length; ++i){
          if(next==cur){ next= i; continue } //same point, skip
          //cross every set of three unique vertices
          //record each counter clockwise third vertex and add
          //to the output hull
          //see: http://www.oocities.org/pcgpe/math2d.html
          e1= _V.sub(vertices[next], vertices[hp]);
          e2= _V.sub(vertices[i], vertices[hp]);
          c= _V.cross(e1,e2);
          if(c<0){ next=i } //counterclockwise, e2 on left of e1
          //cross product is zero then e vectors are on same line
          //therefore want to record vertex farthest along that line
          if(_.feq0(c) && _V.len2(e2) > _V.len2(e1)){next=i}
        }
        //we found the *next* point *left,ccw* of last hull point
        cur=next;
        ++hpos;
        //conclude algorithm upon wrap-around
        if(next==rightMost){ break }
      }
      const result=[];
      for(let i=0; i<hpos; ++i)
        result.push(_V.clone(vertices[TheHull[i]]));
      return result;
    }

    /**A Rectangle, standard Cartesian: bottom-left corner + width + height.
     * @memberof module:mcfud/geo2d
     * @class
     * @property {Vec2} pos
     * @property {number} width
     * @property {number} height
     */
    class Rect{
      /**
       * @param {number} x
       * @param {number} y
       * @param {number} width
       * @param {number} height
       */
      constructor(x,y,width,height){
        switch(arguments.length){
          case 2:
            this.pos= _V.vec();
            this.width=x;
            this.height=y;
            break;
          case 4:
            this.pos=_V.vec(x,y);
            this.width=width;
            this.height=height;
            break;
          default:
            throw "Error: bad input to Rect()";
        }
      }
    }

    /**An Area.
     * @memberof module:mcfud/geo2d
     * @class
     * @property {number} width
     * @property {number} height
     */
    class Area{
      /**
       * @param {number} w
       * @param {number} h
       */
      constructor(w,h){
        this.width=w;
        this.height=h;
      }
      /**
       * @return {Area}
       */
      half(){
        return new Area(_M.ndiv(this.width,2),_M.ndiv(this.height,2))
      }
    }

    /**A Line.
     * @memberof module:mcfud/geo2d
     * @class
     * @property {Vec2} p
     * @property {Vec2} q
     */
    class Line{
      /**
       * @param {number} x1
       * @param {number} y1
       * @param {number} x2
       * @param {number} y2
       */
      constructor(x1,y1,x2,y2){
        this.p= _V.vec(x1,y1);
        this.q= _V.vec(x2,y2);
      }
    }

    /**
     * @class
     */
    class Body{
      constructor(s,x=0,y=0){
        this.pos=_V.vec(x,y);
        this.shape=s;
      }
    }

    /**
     * @abstract
     */
    class Shape{
      constructor(){
        this.orient=0;
      }
      setOrient(r){
        throw Error("no implementation")
      }
    }

    /**A Circle.
     * @memberof module:mcfud/geo2d
     * @class
     * @property {number} radius
     * @property {number} orient
     */
    class Circle extends Shape{
      /**
       * @param {number} r
       */
      constructor(r){
        super();
        this.radius=r;
      }
      /**Set the rotation.
       * @param {number} r
       * @return {Circle} self
       */
      setOrient(r){
        this.orient=r;
        return this;
      }
    }

    /**A Polygon, points are specified in COUNTER-CLOCKWISE order.
     * @memberof module:mcfud/geo2d
     * @class
     * @property {Vec2} pos
     * @property {Vec2[]} normals
     * @property {Vec2[]} edges
     * @property {Vec2[]} points
     * @property {number} orient
     * @property {Vec2[]} calcPoints
     */
    class Polygon extends Shape{
      constructor(points){
        super();
        this.calcPoints=[];
        this.normals=[];
        this.edges=[];
        this.set(points||[]);
      }
      /**Set vertices.
       * @param {Vec2[]} points
       * @return {Polygon}
       */
      set(points){
        this.calcPoints.length=0;
        this.normals.length=0;
        this.edges.length=0;
        this.points= _orderPointsCCW(points);
        this.points.forEach(p=>{
          this.calcPoints.push(_V.vec());
          this.edges.push(_V.vec());
          this.normals.push(_V.vec());
        });
        return this._recalc();
      }
      /**Set rotation.
       * @param {number} rot
       * @return {Polygon} self
       */
      setOrient(rot){
        this.orient = rot;
        return this._recalc();
      }
      /**Move the points.
       * @param {number} x
       * @param {number} y
       * @return {Polygon}
       */
      moveBy(x, y){
        this.points.forEach(p=>{
          p[0] += x;
          p[1] += y;
        });
        return this._recalc();
      }
      /** @ignore */
      _recalc(){
        let N=this.points.length;
        this.points.forEach((p,i)=>{
          _V.copy(this.calcPoints[i],p);
          if(!_.feq0(this.orient))
            _V.rot$(this.calcPoints[i],this.orient);
        });
        this.points.forEach((p,i)=>{
          this.edges[i]= _V.sub(this.calcPoints[(i+1)%N],
                                this.calcPoints[i]);
          this.normals[i]= _V.unit(_V.normal(this.edges[i]));
        });
        return this;
      }
    }

    /** @ignore */
    function toPolygon(r){
      return new Polygon([_V.vec(r.width,0),
                          _V.vec(r.width,r.height),
                          _V.vec(0,r.height),_V.vec()]);
    }

    /**A collision manifold.
     * @memberof module:mcfud/geo2d
     * @class
     * @property {Vec2} overlapN  overlap normal
     * @property {Vec2} overlapV  overlap vector
     * @property {number} overlap overlap magnitude
     * @property {object} A
     * @property {object} B
     * @property {boolean} AInB
     * @property {boolean} BInA
     */
    class Manifold{
      /**
       * @param {Vec2} overlapN
       * @param {Vec2} overlapV
       * @param {object} A
       * @param {object} B
       */
      constructor(A,B){
        this.overlapN = _V.vec();
        this.overlapV = _V.vec();
        this.A = A;
        this.B = B;
        this.clear();
      }
      swap(){
        let m=new Manifold();
        let aib=this.AInB;
        let bia=this.BInA;
        let a=this.A;

        m.overlap=this.overlap;
        m.A=this.B;
        m.B=a;
        m.AInB=bia;
        m.BInA=aib;
        m.overlapN=_V.flip(this.overlapN);
        m.overlapV=_V.flip(this.overlapV);
        //m.overlapV[0]=m.overlapN[0]*this.overlap;
        //m.overlapV[1]=m.overlapN[1]*this.overlap;
        return m;
      }
      /**Reset to zero. */
      clear(){
        this.overlap = Infinity;
        this.AInB = true;
        this.BInA = true;
        return this;
      }
    }

    //------------------------------------------------------------------------
    // 2d collision using Separating Axis Theorem.
    // see https://github.com/jriecken/sat-js
    //------------------------------------------------------------------------

    /**Check all shadows onto this axis and
     * find the min and max.
     */
    function _findProjRange(points, axis){
      let min = Infinity,
          max = -Infinity;
      for(let dot,i=0; i<points.length; ++i){
        dot= _V.dot(points[i],axis);
        if(dot<min) min = dot;
        if(dot>max) max = dot;
      }
      return [min,max]
    }

    /** @ignore */
    function _voronoiRegion(line, point){
      let n2 = _V.len2(line),
          dp = _V.dot(point,line);
      //If pt is beyond the start of the line, left voronoi region
      //If pt is beyond the end of the line, right voronoi region
      return dp<0 ? LEFT_VORONOI : (dp>n2 ? RIGHT_VORONOI : MID_VORONOI)
    }

    /** @ignore */
    function _testSAT(aPos,aPoints, bPos,bPoints, axis, resolve){
      let [minA,maxA] =_findProjRange(aPoints, axis);
      let [minB,maxB] =_findProjRange(bPoints, axis);
      //B relative to A; A--->B
      let vAB= _V.vecAB(aPos,bPos);
      let proj= _V.dot(vAB,axis);
      //move B's range to its position relative to A.
      minB += proj;
      maxB += proj;
      if(minA>maxB || minB>maxA){ return true }
      if(resolve){
        let overlap = 0;
        //A starts left of B
        if(minA<minB){
          resolve.AInB = false;
          //A ends before B does, have to pull A out of B
          if(maxA < maxB){
            overlap= maxA - minB;
            resolve.BInA = false;
          }else{
            //B is fully inside A.  Pick the shortest way out.
            let [d1,d2] = [maxA - minB, maxB - minA];
            overlap = d1 < d2 ? d1 : -d2;
          }
        //B starts left than A
        }else{
          resolve.BInA = false;
          //B ends before A ends, have to push A out of B
          if(maxA>maxB){
            overlap = minA - maxB;
            resolve.AInB = false;
          }else{
            //A is fully inside B.  Pick the shortest way out.
            let [d1,d2] = [maxA - minB, maxB - minA];
            overlap = d1 < d2 ? d1 : -d2;
          }
        }
        //if smallest amount of overlap, set it as the minimum overlap.
        let absOverlap= Math.abs(overlap);
        if(absOverlap < resolve.overlap){
          resolve.overlap = absOverlap;
          _V.copy(resolve.overlapN,axis);
          if(overlap<0) _V.flip$(resolve.overlapN);
        }
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    //const _FAKE_POLY= toPolygon(new Rect(0,0, 1, 1));

    /** @ignore */
    function _circle_circle(a, b, resolve){
      let r_ab = a.shape.radius+b.shape.radius,
          vAB= _V.vecAB(a.pos,b.pos),
          d2 = _V.len2(vAB),
          r2 = r_ab*r_ab,
          dist, status= !(d2 > r2);
      if(status && resolve){
        dist = Math.sqrt(d2);
        resolve.A = a;
        resolve.B = b;
        resolve.overlap = r_ab - dist;
        _V.copy(resolve.overlapN, _V.unit$(vAB));
        _V.copy(resolve.overlapV, _V.mul(vAB,resolve.overlap));
        resolve.AInB = a.shape.radius <= b.shape.radius && dist <= b.shape.radius - a.shape.radius;
        resolve.BInA = b.shape.radius <= a.shape.radius && dist <= a.shape.radius - b.shape.radius;
      }
      return status;
    }

    /** @ignore */
    function _poly_circle(polygon, circle, resolve){
      // get position of the circle relative to the polygon.
      let r2 = circle.shape.radius*circle.shape.radius,
          vPC= _V.vecAB(polygon.pos,circle.pos),
          cps = polygon.shape.calcPoints,
          point, edge = _V.vec();
      // for each edge in the polygon:
      for(let next,prev, overlap,overlapN,len=cps.length,i=0; i<len; ++i){
        next = i == len-1 ? 0 : i+1;
        prev = i == 0 ? len-1 : i-1;
        overlap = 0;
        overlapN = null;
        _V.copy(edge,polygon.shape.edges[i]);
        // calculate the center of the circle relative to the starting point of the edge.
        point=_V.vecAB(cps[i],vPC);
        // if the distance between the center of the circle and the point
        // is bigger than the radius, the polygon is definitely not fully in
        // the circle.
        if(resolve && _V.len2(point) > r2){
          resolve.AInB = false;
        }
        // calculate which Voronoi region the center of the circle is in.
        let region = _voronoiRegion(edge, point);
        if(region === LEFT_VORONOI){
          // need to make sure we're in the RIGHT_VORONOI of the previous edge.
          _V.copy(edge,polygon.shape.edges[prev]);
          // calculate the center of the circle relative the starting point of the previous edge
          let point2= _V.vecAB(cps[prev],vPC);
          region = _voronoiRegion(edge, point2);
          if(region === RIGHT_VORONOI){
            // it's in the region we want.  Check if the circle intersects the point.
            let dist = _V.len(point);
            if(dist>circle.shape.radius){
              // No intersection
              return false;
            } else if(resolve){
              // intersects, find the overlap.
              resolve.BInA = false;
              overlapN = _V.unit(point);
              overlap = circle.shape.radius - dist;
            }
          }
        } else if(region === RIGHT_VORONOI){
          // need to make sure we're in the left region on the next edge
          _V.copy(edge,polygon.shape.edges[next]);
          // calculate the center of the circle relative to the starting point of the next edge.
          _V.sub$(_V.copy(point,vPC),cps[next]);
          region = _voronoiRegion(edge, point);
          if(region === LEFT_VORONOI){
            // it's in the region we want.  Check if the circle intersects the point.
            let dist = _V.len(point);
            if(dist>circle.shape.radius){
              return false;
            } else if(resolve){
              resolve.BInA = false;
              overlapN = _V.unit(point);
              overlap = circle.shape.radius - dist;
            }
          }
        }else{
          // check if the circle is intersecting the edge,
          // change the edge into its "edge normal".
          let normal = _V.unit$(_V.normal(edge));
          // find the perpendicular distance between the center of the circle and the edge.
          let dist = _V.dot(point,normal);
          let distAbs = Math.abs(dist);
          // if the circle is on the outside of the edge, there is no intersection.
          if(dist > 0 && distAbs > circle.shape.radius){
            return false;
          } else if(resolve){
            overlapN = normal;
            overlap = circle.shape.radius - dist;
            // if the center of the circle is on the outside of the edge, or part of the
            // circle is on the outside, the circle is not fully inside the polygon.
            if(dist >= 0 || overlap < 2 * circle.shape.radius){
              resolve.BInA = false;
            }
          }
        }
        // if this is the smallest overlap we've seen, keep it.
        // (overlapN may be null if the circle was in the wrong Voronoi region).
        if(overlapN && resolve && Math.abs(overlap) < Math.abs(resolve.overlap)){
          resolve.overlap = overlap;
          _V.copy(resolve.overlapN,overlapN);
        }
      }
      // calculate the final overlap vector - based on the smallest overlap.
      if(resolve){
        resolve.A = polygon;
        resolve.B = circle;
        _V.mul$(_V.copy(resolve.overlapV,resolve.overlapN),resolve.overlap);
      }
      return true;
    }

    /** @ignore */
    function _circle_poly(circle, polygon, resolve){
      let result = _poly_circle(polygon, circle, resolve);
      if(result && resolve){
        // flip A and B
        let a = resolve.A;
        let aInB = resolve.AInB;
        _V.flip$(resolve.overlapN);
        _V.flip$(resolve.overlapV);
        resolve.A = resolve.B;
        resolve.B = a;
        resolve.AInB = resolve.BInA;
        resolve.BInA = aInB;
      }
      return result;
    }

    /** @ignore */
    function _poly_poly(a, b, resolve){
      let pa = a.shape.calcPoints,
          pb = b.shape.calcPoints;
      for(let i=0; i < pa.length; ++i){
        if(_testSAT(a.pos, pa, b.pos, pb, a.shape.normals[i], resolve))
          return false;
      }
      for(let i=0;i < pb.length; ++i){
        if(_testSAT(a.pos, pa, b.pos, pb, b.shape.normals[i], resolve))
          return false;
      }
      if(resolve){
        if(resolve.overlap==0 || _.feq0(resolve.overlap))
          return false;
        resolve.A = a;
        resolve.B = b;
        _V.copy(resolve.overlapV,resolve.overlapN);
        _V.mul$(resolve.overlapV,resolve.overlap);
      }
      return true;
    }

    /**2D transformation matrix.
     * @memberof module:mcfud/geo2d
     * @class
     * @property {object} m internal 3x3 matrix
     */
    class C2DMatrix{
      static create(){ return new C2DMatrix() }
      constructor(){
        this.identity()
      }
      identity(){
        this.m=_X.matIdentity(3);
        return this;
      }
      translate(x, y){
        this.m=_X.matMult(this.m,_X.mat3(1,0,x, 0,1,y,0,0,1));
        return this;
      }
      scale(xScale, yScale){
        this.m=_X.matMult(this.m,_X.mat3(xScale,0,0, 0,yScale,0, 0,0,1));
        return this;
      }
      shear(xDir, yDir){
        this.m=_X.matMult(this.m,_X.mat3(1,xDir,0, yDir,1,0, 0,0,1));
        return this;
      }
      rotateCCW(rot,cx,cy){
        let s = Math.sin(rot),
            c = Math.cos(rot);
        if(cx!==undefined && cy!==undefined){
          this.translate(-cx,-cy);
          this.rotateCCW(rot);
          this.translate(cx,cy);
        }else{
          this.m=_X.matMult(this.m,_X.mat3(c,-s,0, s,c,0, 0,0,1))
        }
        return this;
      }
      rotateCW(rot,cx,cy){
        let s = Math.sin(rot),
            c = Math.cos(rot);
        if(cx!==undefined && cy!==undefined){
          this.translate(-cx,-cy);
          this.rotateCW(rot);
          this.translate(cx,cy);
        }else{
          this.m=_X.matMult(this.m,_X.mat3(c,s,0, -s,c,0, 0,0,1))
        }
        return this;
      }
      transformXY(x,y){
        let v=[x,y,1],
            r=_X.matVMult(this.m,v);
        r.length=2;
        return 2;
      }
      transformPoints(ps){
        let r,v=[0,0,1];
        ps.forEach(p=>{
          if(is.vec(p)){
            v[0]=p[0];v[1]=p[1];
          }else{
            v[0]=p.x;v[1]=p.y;
          }
          r=_X.matVMult(this.m,v);
          if(is.vec(p)){
            p[0]=r[0];p[1]=r[1];
          }else{
            p.x=r[0];p.y=r[1];
          }
        });
      }
    }

    /**
     * @memberof module:mcfud/geo2d
     * @class
     * @property {number} min
     * @property {number} max
     */
    class Interval1D{
      constructor(min, max){
        if(max<min){
          let t=min;
          min=max;
          max=t;
        }
        if(_.feq0(min)) min = 0;
        if(_.feq0(max)) max = 0;
        this.min = min;
        this.max = max;
      }
      min(){ return this.min }
      max(){ return this.max }
      intersects(that){ return (this.max < that.min || that.max < this.min) ? false : true }
      contains(x){ return (this.min <= x) && (x <= this.max) }
      length(){ return this.max - this.min }
      // ascending order of min endpoint
      static MinEndPtCmp(a,b){
        if(a.min < b.min) return -1;
        if(a.min > b.min) return 1;
        if(a.max < b.max) return -1;
        if(a.max > b.max) return 1;
        return  0;
      }
      // ascending order of max endpoint
      static MaxEndPtCmp(a, b){
        if(a.max < b.max) return -1;
        if(a.max > b.max) return 1;
        if(a.min < b.min) return -1;
        if(a.min > b.min) return 1;
        return  0;
      }
      // ascending order of length
      static LenCmp(a, b){
        let alen = a.length(),
            blen = b.length();
        return alen < blen ? -1 : ( alen > blen ? 1 : 0);
      }
      static test(){
        let ps = [new Interval1D(15, 33),
                  new Interval1D(45, 60),
                  new Interval1D(20, 70),
                  new Interval1D(46, 55)];
        console.log("Unsorted");
        ps.forEach(p=> console.log(`min=${p.min}, max=${p.max}`));
        console.log("Sort by min endpoint");
        ps.sort(Interval1D.MinEndPtCmp);
        ps.forEach(p=> console.log(`min=${p.min}, max=${p.max}`));
        console.log("Sort by max endpoint");
        ps.sort(Interval1D.MaxEndPtCmp);
        ps.forEach(p=> console.log(`min=${p.min}, max=${p.max}`));
        console.log("Sort by length");
        ps.sort(Interval1D.LenCmp);
        ps.forEach(p=> console.log(`min=${p.min}, max=${p.max}`));
      }
    }
    //Interval1D.test();

    /**
     * @memberof module:mcfud/geo2d
     * @class
     * @property {number} x
     * @property {number} y
     */
    class Interval2D{
      constructor(x, y){
        this.x = x;
        this.y = y;
      }
      intersects(that){
        if(!this.x.intersects(that.x)) return false;
        if(!this.y.intersects(that.y)) return false;
        return true;
      }
      contains(p){
        return x.contains(p[0])  && y.contains(p[1]);
      }
      area(){
        return x.length() * y.length();
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    // stably merge a[lo .. mid] with a[mid+1 ..hi] using aux[lo .. hi]
    // precondition: a[lo .. mid] and a[mid+1 .. hi] are sorted subarrays
    function _merge(a, aux, lo, mid, hi){
      for(let k = lo; k <= hi; ++k) _V.copy(aux[k], a[k]); // copy to aux[]
      // merge back to a[]
      let i = lo, j = mid+1;
      for(let k = lo; k <= hi; ++k){
        if(i > mid) _V.copy(a[k], aux[j++]);
        else if(j > hi) _V.copy(a[k], aux[i++]);
        else if(Point2D.compareTo(aux[j], aux[i])<0) _V.copy(a[k],aux[j++]);
        else _V.copy(a[k], aux[i++]);
      }
    }

    /**
     * @memberof module:mufud/geo2d
     * @class
     */
    class Point2D{
      /** Returns the angle of this point in polar coordinates.
       * @return the angle (in radians) of this point in polar coordiantes (between PI and PI)
       */
      static theta(p){
        return Math.atan2(p[1], p[0]);
      }
      /**Returns the angle between this point and that point.
       * @return the angle in radians (between –PI and PI) between this point and that point (0 if equal)
       */
      static angleBetween(a,b){
        return Math.atan2(b[1] - a[1], b[0] - a[0]);
      }
      /**Returns true if a-> b-> c is a counterclockwise turn.
       * @param a first point
       * @param b second point
       * @param c third point
       * @return {number} -1, 0, 1  if a-> b-> c is a { clockwise, collinear; counterclocwise } turn.
       */
      static ccw(a, b, c){
        let area2 = (b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0]);
        return area2<0?-1:(area2>0?1:0);
      }
      /**Returns twice the signed area of the triangle a-b-c.
       * @param a first point
       * @param b second point
       * @param c third point
       * @return twice the signed area of the triangle a-b-c
       */
      static area2(a, b, c){
        return (b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0]);
      }
      /**Returns the Euclidean distance between this point and that point.
       * @param that the other point
       * @return the Euclidean distance between this point and that point
       */
      static distTo(a,b){
        let dx= a[0] - b[0],
            dy= a[1] - b[1];
        return Math.sqrt(dx*dx + dy*dy);
      }
      /**Returns the square of the Euclidean distance between this point and that point.
       * @param that the other point
       * @return the square of the Euclidean distance between this point and that point
       */
      static distSqTo(a,b){
        let dx= a[0] - b[0],
            dy= a[1] - b[1];
        return dx*dx + dy*dy;
      }
      /**Compares two points by y-coordinate, breaking ties by x-coordinate.
       * Formally, the invoking point (x0, y0) is less than the argument point (x1, y1)
       * if and only if either {@code y0 < y1} or if {@code y0 == y1} and {@code x0 < x1}.
       *
       * @param  that the other point
       * @return the value {@code 0} if this string is equal to the argument
       *         string (precisely when {@code equals()} returns {@code true});
       *         a negative integer if this point is less than the argument
       *         point; and a positive integer if this point is greater than the
       *         argument point
       */
      static compareTo(a,b){
        if(a[1] < b[1]) return -1;
        if(a[1] > b[1]) return 1;
        if(a[0] < b[0]) return -1;
        if(a[0] > b[0]) return 1;
        return 0;
      }
      // compare points according to their x-coordinate
      static XOrderCmp(p, q){
        return p[0] < q[0] ? -1 : (p[0] > q[0] ? 1:0)
      }
      // compare points according to their y-coordinate
      static YOrderCmp(p, q){
        return p[1] < q[1] ? -1 : (p[1] > q[1] ? 1 : 0)
      }
      // compare points according to their polar radius
      static ROrderCmp(p, q){
        let delta = (p[0]*p[0] + p[1]*p[1]) - (q[0]*q[0] + q[1]*q[1]);
        return delta < 0 ? -1 : (delta > 0 ? 1: 0)
      }
      // compare other points relative to polar angle (between 0 and 2PI) they make with this Point
      static PolarOrderCmp(q){
        return (q1,q2)=>{
          let dx1 = q1[0] - q[0];
          let dy1 = q1[1] - q[1];
          let dx2 = q2[0] - q[0];
          let dy2 = q2[1] - q[1];
          if(dy1 >= 0 && dy2 < 0) return -1;    // q1 above; q2 below
          if(dy2 >= 0 && dy1 < 0) return 1;    // q1 below; q2 above
          if(_.feq0(dy1) && _.feq0(dy2)){ // 3-collinear and horizontal
            if(dx1 >= 0 && dx2 < 0) return -1;
            if(dx2 >= 0 && dx1 < 0) return 1;
            return  0;
          }
          return - Point2D.ccw(q, q1, q2);     // both above or below
        }
      }
      // compare points according to their distance to this point
      static DistToOrderCmp(p, q){
        let dist1 = Point2D.distSqTo(p);
        let dist2 = Point2D.distSqTo(q);
        return dist1 < dist2 ? -1 : (dist1 > dist2 ? 1 : 0)
      }
      static equals(a,b){
        if(b === a) return true;
        if(!b) return false;
        return a[0]== b[0] && a[1] == b[1];
      }
      static farthestPair(points){
        let best1=[0,0], best2=[0,0], bestDistance=0,bestDistSQ= -Infinity;
        let m,H = Point2D.calcConvexHull(points);
        // single point
        if(H===false ||
           points.length <= 1) return false;
        // number of points on the hull
        m = H.length;
        // the hull, in counterclockwise order hull[1] to hull[m]
        H.unshift(null);
        // points are collinear
        if(m == 2){
          best1 = H[1];
          best2 = H[2];
          bestDistance= Point2D.distTo(best1,best2);
        }else{
          // k = farthest vertex from edge from hull[1] to hull[m]
          let j,k = 2;
          while(Point2D.area2(H[m], H[1], H[k+1]) > Point2D.area2(H[m], H[1], H[k])){ ++k }
          j = k;
          for(let d2,i = 1; i <= k && j <= m; ++i){
            if(Point2D.distSqTo(H[i],H[j]) > bestDistSQ){
              bestDistSQ= Point2D.distSqTo(H[i],H[j]);
              _V.copy(best1,H[i]);
              _V.copy(best2,H[j]);
            }
            while((j < m) &&
                  Point2D.area2(H[i], H[i+1], H[j+1]) > Point2D.area2(H[i], H[i+1], H[j])){
              ++j;
              d2 = Point2D.distSqTo(H[i], H[j]);
              if(d2 > bestDistSQ){
                bestDistSQ= Point2D.distSqTo(H[i], H[j]);
                _V.copy(best1, H[i]);
                _V.copy(best2, H[j]);
              }
            }
          }
        }
        return {best1,best2,bestDistance: Math.sqrt(bestDistSQ)};
      }
      static closestPair(points){
        // sort by x-coordinate (breaking ties by y-coordinate via stability)
        let best1=[0,0],best2=[0,0],bestDistance=Infinity;
        let pointsByX = points.slice();
        const n=points.length;
        pointsByX.sort(Point2D.YOrderCmp);
        pointsByX.sort(Point2D.XOrderCmp);
        // check for coincident points
        for(let i = 0; i < n-1; ++i){
          if(Point2D.equals(pointsByX[i],pointsByX[i+1])){
            _V.copy(best1, pointsByX[i]);
            _V.copy(best2, pointsByX[i+1]);
            return{ bestDistance:0, best1, best2 }
          }
        }
        // sort by y-coordinate (but not yet sorted)
        let pointsByY = pointsByX.slice();
        let aux = _.fill(n,()=> [0,0]);
        // find closest pair of points in pointsByX[lo..hi]
        // precondition:  pointsByX[lo..hi] and pointsByY[lo..hi] are the same sequence of points
        // precondition:  pointsByX[lo..hi] sorted by x-coordinate
        // postcondition: pointsByY[lo..hi] sorted by y-coordinate
        function _closest(pointsByX, pointsByY, aux, lo, hi){
          if(hi <= lo) return Infinity;
          let mid = lo + _M.ndiv(hi - lo, 2);
          let median = pointsByX[mid];
          // compute closest pair with both endpoints in left subarray or both in right subarray
          let delta1 = _closest(pointsByX, pointsByY, aux, lo, mid);
          let delta2 = _closest(pointsByX, pointsByY, aux, mid+1, hi);
          let delta = Math.min(delta1, delta2);
          // merge back so that pointsByY[lo..hi] are sorted by y-coordinate
          _merge(pointsByY, aux, lo, mid, hi);
          // aux[0..m-1] = sequence of points closer than delta, sorted by y-coordinate
          let m = 0;
          for(let i = lo; i <= hi; ++i)
            if(Math.abs(pointsByY[i][0] - median[0]) < delta) _V.copy(aux[m++],pointsByY[i]);
          // compare each point to its neighbors with y-coordinate closer than delta
          for(let i = 0; i < m; ++i){
            // a geometric packing argument shows that this loop iterates at most 7 times
            for(let d,j = i+1; (j < m) && (aux[j][1] - aux[i][1] < delta); ++j){
              d= Point2D.distTo(aux[i],aux[j]);
              if(d< delta){
                delta = d;
                if(d< bestDistance){
                  bestDistance = delta;
                  _V.copy(best1, aux[i]);
                  _V.copy(best2, aux[j]);
                  //console.log(`better distance = ${delta} from ${best1} to ${best2}`);
                }
              }
            }
          }
          return delta;
        }
        _closest(pointsByX, pointsByY, aux, 0, n-1);
        return {bestDistance,best1,best2};
      }
      /**Computes the convex hull of the specified array of points.
       *  The {@code GrahamScan} data type provides methods for computing the
       *  convex hull of a set of <em>n</em> points in the plane.
       *  <p>
       *  The implementation uses the Graham-Scan convex hull algorithm.
       *  It runs in O(<em>n</em> log <em>n</em>) time in the worst case
       *  and uses O(<em>n</em>) extra memory.
       * @param  points the array of points
       */
      static calcConvexHull(points){
        _.assert(points && points.length>0, "invalid points");
        let a0, n=points.length, a= _.deepCopyArray(points);
        let hull=new Stack();
        // preprocess so that a[0] has lowest y-coordinate; break ties by x-coordinate
        // a[0] is an extreme point of the convex hull
        // (alternatively, could do easily in linear time)
        a.sort(Point2D.compareTo);
        a0=a[0];
        // sort by polar angle with respect to base point a[0],
        // breaking ties by distance to a[0]
        //Arrays.sort(a, 1, n, Point2D.polarOrder(a[0]));
        a.shift();//pop head off
        a.sort(Point2D.PolarOrderCmp(a0));
        //put head back
        a.unshift(a0);

        // a[0] is first extreme point
        hull.push(a[0]);
        // find index k1 of first point not equal to a[0]
        let k1;
        for(k1 = 1; k1 < n; ++k1)
          if(!Point2D.equals(a[0],a[k1])) break;
        if(k1 == n) return false; // all points equal
        // find index k2 of first point not collinear with a[0] and a[k1]
        let k2;
        for(k2 = k1+1; k2 < n; ++k2)
          if(Point2D.ccw(a[0], a[k1], a[k2]) != 0) break;
        // a[k2-1] is second extreme point
        hull.push(a[k2-1]);
        // Graham scan; note that a[n-1] is extreme point different from a[0]
        for(let top,i = k2; i < n; ++i){
          top = hull.pop();
          while(Point2D.ccw(hull.peek(), top, a[i]) <= 0){
            top = hull.pop();
          }
          hull.push(top);
          hull.push(a[i]);
        }
        //Returns the extreme points on the convex hull in counterclockwise order.
        let H = new Stack();
        for(let p,it= hull.iterator();it.hasNext();) H.push(it.next());
        //check if convex
        n = H.size();
        points = [];
        for(let p,it= H.iterator();it.hasNext();){
          points.push(_V.clone(it.next()));
        }
        if(n > 2){
          for(let i = 0; i < n; ++i){
            if(Point2D.ccw(points[i], points[(i+1) % n], points[(i+2) % n]) <= 0)
            return false;
          }
        }
        return points;
      }
      static test_convexHull(){
        let D=`9230 13137 4096 24064 8192 26112 22016  9344 4440  8028 6505 31422 28462 32343 17152 19200 9561 11599
               4096 20992 21538  2430 21903 23677 17152 16128 7168 25088 10162 18638 822 32301 16128 12032 18989  3797
               8192 28160 16128 20224 14080 20224 26112  7296 20367 20436 7486   422 17835  2689 22016  3200 22016  5248
               24650 16886 15104 20224 25866  4204 13056 15104 13662 10301 17152 20224 15104 12032 6144 20992 26112  3200
               6144 29184 13056 12032 8128 20992 5076 19172 17152 17152 823 15895 25216  3200 6071 29161 5120 20992
               10324 22176 29900  9390 27424  7945 4096 23040 12831 27971 29860 12437 28668  2061 1429 12561 29413   596
               17152 18176 8192 27136 5120 29184 22016 11392 1444 10362 32011  3140 15731 32661 26112  4224 13120 20224
               30950  2616 4096 22016 4096 25088 24064  3200 26112  5248 4862 30650 5570  8885 21784 18853 23164 32371
               4160 29184 13056 13056 8192 29184 23040  7296 5120 25088 22016  7296 7168 29184 25216  7296 23040  3200
               4718  4451 14080 16128 7168 20992 19546 17728 13056 16128 17947 17017 26112  6272 20658  1204 23553 13965
               13056 14080 14080 12032 24064  7296 21377 26361 17088
               12032 16128 16128 30875 28560 2542 26201 8192 25088 11444 16973`.split(/\s+/).map(n=>{return +n});
        let p=[];
        for(let i=0;i<D.length;i+=2){
          p.push([D[i],D[i+1]])
        }
        p=[[5,15], [5,-20], [-60,10], [70,-10], [-60,-10], [70,10]];
        //p=[[5,1], [5,-2], [-60,10], [70,-10], [-60,-10], [70,10]];//concave
        let hull=Point2D.calcConvexHull(p);
        if(hull===false || hull.length!=p.length){
          console.log("not convex!");
        }else{
          hull.forEach(v=>{ console.log(`${v[0]}, ${v[1]}`) });
        }
      }
      static test_closestPair(){
        let D=`954 11163 1125 11331 1296 11499 1467 11667 1657 11796 1847 11925 2037 12054 2238 12207 2439 12360
               2640 12513 2878 12523 3116 12533 3354 12543 3518 12493 3682 12443 3846 12393
               8463 7794 8022 7527 7581 7260 7140 6993 6731 6624 6322 6255 5913 5886
               5521 5494 5129 5102 4737 4710 4599 5158`.split(/\s+/).map(n=>{return +n});
        let ps=[];
        for(let i=0;i<D.length;i+=2){
          ps.push([D[i],D[i+1]]);
        }
        let {bestDistance,best1, best2}= Point2D.closestPair(ps)
        console.log(`bestDist=${bestDistance}, p1=${best1}, p2=${best2}`);
      }
      static test_farthestPair(){
        let D=`9230 13137 4096 24064 8192 26112 22016  9344 4440  8028 6505 31422 28462 32343 17152 19200 9561 11599 4096 20992 21538  2430
               21903 23677 17152 16128 7168 25088 10162 18638 822 32301 16128 12032 18989  3797 8192 28160 16128 20224 14080 20224 26112  7296
               20367 20436 7486   422 17835  2689 22016  3200 22016  5248 24650 16886 15104 20224 25866  4204 13056 15104 13662 10301 17152 20224
               15104 12032 6144 20992 26112  3200 6144 29184 13056 12032 8128 20992 5076 19172 17152 17152 823 15895 25216  3200 6071 29161
               5120 20992 10324 22176 29900  9390 27424  7945 4096 23040 12831 27971 29860 12437 28668  2061 1429 12561 29413   596 17152 18176
               8192 27136 5120 29184 22016 11392 1444 10362 32011  3140 15731 32661 26112  4224 13120 20224 30950  2616 4096 22016
               4096 25088 24064  3200 26112  5248 4862 30650 5570  8885 21784 18853 23164 32371 4160 29184 13056 13056 8192 29184 23040  7296
               5120 25088 22016  7296 7168 29184 25216  7296 23040  3200 4718  4451 14080 16128 7168 20992 19546 17728 13056 16128 17947 17017
               26112  6272 20658  1204 23553 13965 13056 14080 14080 12032 24064  7296 21377 26361 17088 12032 16128 16128
               30875 28560 2542 26201 8192 25088 11444 16973`.split(/\s+/).map(n=>{return +n});
        let ps=[];
        for(let i=0;i<D.length;i+=2){
          ps.push([D[i],D[i+1]]);
        }
        let {bestDistance,best1, best2}= Point2D.farthestPair(ps)
        console.log(`bestDist=${bestDistance}, p1=${best1}, p2=${best2}`);
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const _$={
      Rect,
      Area,
      Line,
      Body,
      Circle,
      Polygon,
      Manifold,
      C2DMatrix,
      Point2D,
      Interval1D,
      Interval2D,
      /**Wrap shape in this body
       * @memberof module:mcfud/geo2d
       * @param {Circle|Polygon} s
       * @param {number} x
       * @param {number} y
       * @return {Body}
       */
      bodyWrap(s,x,y){
        return new Body(s, x, y)
      },
      /**Sort vertices in counter clockwise order.
       * @memberof module:mcfud/geo2d
       * @param {Vec2[]} vs
       * @return {Vec2[]}
       */
      orderVertices(vs){ return _orderPointsCCW(vs) },
      /**Calculate the area of this polygon.
       * @memberof module:mcfud/geo2d
       * @param{Vec2[]} points
       * @return {number}
       */
      polyArea(points,sort=false){
        let ps= sort? this.orderVertices(points) : points;
        let area=0;
        for(let p,q,i2,len=ps.length,i=0;i<len;++i){
          i2= (i+1)%len;
          p=ps[i];
          q=ps[i2];
          area += (p[0]*q[1] - q[0]*p[1]);
        }
        return _M.ndiv(Math.abs(area),2)
      },
      /**Find the center point of this polygon.
       * @memberof module:mcfud/geo2d
       * @param {Vec2[]} points
       * @return {Vec2}
       */
      calcPolygonCenter(points,sort=false){
        const ps= sort?this.orderVertices(points):points;
        const A= 6*this.polyArea(ps);
        let cx=0;
        let cy=0;
        for(let p,q,i2,i=0,len=ps.length;i<len;++i){
          i2= (i+1)%len;
          p=ps[i];
          q=ps[i2];
          cx += (p[0]+q[0]) * (p[0]*q[1]-q[0]*p[1]);
          cy += (p[1]+q[1]) * (p[0]*q[1]-q[0]*p[1]);
        }
        return _V.vec(_M.ndiv(cx,A), _M.ndiv(cy,A))
      },
      /**Get the AABB rectangle.
       * @memberof module:mcfud/geo2d
       * @param {Body} obj
       * @return {Rect}
       */
      getAABB(obj){
        _.assert(obj instanceof Body, "wanted a body");
        if(_.has(obj.shape,"radius")){
          return new Rect(obj.pos[0]-obj.shape.radius,
                          obj.pos[1]-obj.shape.radius,
                          obj.shape.radius*2, obj.shape.radius*2)
        }else{
          let cps= _V.translate(obj.pos, obj.shape.calcPoints);
          let xMin= cps[0][0];
          let yMin= cps[0][1];
          let xMax= xMin;
          let yMax= yMin;
          for(let p,i=1; i<cps.length; ++i){
            p= cps[i];
            if(p[0] < xMin) xMin = p[0];
            if(p[0] > xMax) xMax = p[0];
            if(p[1] < yMin) yMin = p[1];
            if(p[1] > yMax) yMax = p[1];
          }
          return new Rect(xMin, yMin, xMax - xMin, yMax - yMin)
        }
      },
      /**Shift a set of points.
       * @memberof module:mcfud/geo2d
       * @param {Vec2[]} points
       * @param {Vec2|number} delta
       * @return {Vec2[]}
       */
      shiftPoints(points,delta){
        return points.map(v=> _V.add(v,delta))
      },
      /**Rotate a set of points.
       * @memberof module:mcfud/geo2d
       * @param {Vec2[]} points
       * @param {number} rot
       * @param {Vec2} [pivot]
       */
      rotPoints(points,rot,pivot){
        return points.map(v=> _V.rot(v,rot,pivot))
      },
      /**Find the vertices of a rectangle, centered at origin.
       * @memberof module:mcfud/geo2d
       * @param {number} w
       * @param {number} h
       * @return {Vec2[]} points in counter-cwise, bottom-right first
       */
      calcRectPoints(w,h){
        const hw=w/2,
              hh=h/2;
        return [_V.vec(hw,-hh), _V.vec(hw,hh),
                _V.vec(-hw,hh), _V.vec(-hw,-hh)]
      },
      /**Create a Line object.
       * @memberof module:mcfud/geo2d
       * @return {Line}
       */
      line(x1,y1,x2,y2){ return new Line(x1,y1,x2,y2) },
      /**Check if 2 rects are equal.
       * @memberof module:mcfud/geo2d
       * @param {Rect} r1
       * @param {Rect} r2
       * @return {boolean}
       */
      rectEqRect(r1,r2){
        return r1.width==r2.width &&
               r1.height==r2.height &&
               r1.pos[0]==r2.pos[0] &&
               r1.pos[1]==r2.pos[1]
      },
      /**Check if `R` contains `r`.
       * @memberof module:mcfud/geo2d
       * @param {Rect} R
       * @param {Rect} r
       * @return {boolean}
       */
      rectContainsRect(R,r){
        return !(R.pos[0] >= r.pos[0] ||
                 R.pos[1] >= r.pos[1] ||
                 (R.pos[0]+R.width) <= (r.pos[0]+r.width) ||
                 (R.pos[1]+R.height) <= (r.pos[1]+r.height))
      },
      /**Get the right side on the x-axis.
       * @memberof module:mcfud/geo2d
       * @param {Rect} r
       * @return {number}
       */
      rectGetMaxX(r){ return r.pos[0] + r.width },
      /**Get the middle on the x-axis.
       * @memberof module:mcfud/geo2d
       * @param {Rect} r
       * @return {number}
       */
      rectGetMidX(r){ return r.pos[0] + r.width/2 },
      /**Get the left on the x-axis.
       * @memberof module:mcfud/geo2d
       * @param {Rect} r
       * @return {number}
       */
      rectGetMinX(r){ return r.pos[0] },
      /**Get the top on the y-axis.
       * @memberof module:mcfud/geo2d
       * @param {Rect} r
       * @return {number}
       */
      rectGetMaxY(r){ return r.pos[1] + r.height },
      /**Get the mid point on the y-axis.
       * @memberof module:mcfud/geo2d
       * @param {Rect} r
       * @return {number}
       */
      rectGetMidY(r){ return r.pos[1] + r.height/2 },
      /**Get the bottom on the y-axis.
       * @memberof module:mcfud/geo2d
       * @param {Rect} r
       * @return {number}
       */
      rectGetMinY(r){ return r.pos[1] },
      /**Check if point lies inside rect.
       * @memberof module:mcfud/geo2d
       * @param {Rect} R
       * @param {number} x
       * @param {number} y
       * @return {boolean}
       */
      rectContainsPoint(R,x,y){
        return x >= this.rectGetMinX(R) &&
               x <= this.rectGetMaxX(R) &&
               y >= this.rectGetMinY(R) &&
               y <= this.rectGetMaxY(R)
      },
      /**Check if 2 rects intersects.
       * @memberof module:mcfud/geo2d
       * @param {Rect} r1
       * @param {Rect} r2
       * @return {boolean}
       */
      rectOverlayRect(r1,r2){
        return !((r1.pos[0]+r1.width) < r2.pos[0] ||
                 (r2.pos[0]+r2.width) < r1.pos[0] ||
                 (r1.pos[1]+r1.height) < r2.pos[1] ||
                 (r2.pos[1]+r2.height) < r1.pos[1])
      },
      /**Find the union of these 2 rects.
       * @memberof module:mcfud/geo2d
       * @param {Rect} r1
       * @param {Rect} r2
       * @return {Rect}
       */
      rectUnion(r1,r2){
        const x= Math.min(r1.pos[0],r2.pos[0]);
        const y= Math.min(r1.pos[1],r2.pos[1]);
        return new Rect(x,y,
                        Math.max(r1.pos[0]+r1.width, r2.pos[0]+r2.width)-x,
                        Math.max(r1.pos[1]+r1.height, r2.pos[1]+r2.height)-y)
      },
      /**Find the intersection of these 2 rects.
       * @memberof module:mcfud/geo2d
       * @param {Rect} r1
       * @param {Rect} r2
       * @return {Rect}
       */
      rectIntersection(r1,r2){
        if(this.rectOverlayRect(r1,r2)){
          const x= Math.max(r1.pos[0],r2.pos[0]);
          const y= Math.max(r1.pos[1],r2.pos[1]);
          return new Rect(x,y,
                          Math.min(r1.pos[0]+r1.width, r2.pos[0]+r2.width)-x,
                          Math.min(r1.pos[1]+r1.height, r2.pos[1]+r2.height)-y)
        }
      },
      /**Check if circle contains this point.
       * @memberof module:mcfud/geo2d
       * @param {number} px
       * @param {number} py
       * @param {Circle} c
       * @return {boolean}
       */
      hitTestPointCircle(px, py, c){
        _.assert(c instanceof Body, "wanted a body");
        let dx=px-c.pos[0];
        let dy=py-c.pos[1];
        return dx*dx+dy*dy <= c.shape.radius*c.shape.radius;
      },
      /**If these 2 circles collide, return the manifold.
       * @memberof module:mcfud/geo2d
       * @param {Circle} a
       * @param {Circle} b
       * @return {Manifold} if false undefined
       */
      hitCircleCircle(a, b){
        _.assert(a instanceof Body && b instanceof Body, "need bodies");
        let m=new Manifold();
        if(_circle_circle(a,b,m)) return m;
      },
      /**Check if these 2 circles collide.
       * @memberof module:mcfud/geo2d
       * @param {Circle} a
       * @param {Circle} b
       * @return {boolean}
       */
      hitTestCircleCircle(a, b){
        _.assert(a instanceof Body && b instanceof Body, "need bodies");
        return _circle_circle(a,b,new Manifold());
      },
      /**If this polygon collides with the circle, return the manifold.
       * @memberof module:mcfud/geo2d
       * @param {Polygon} p
       * @param {Circle} c
       * @return {Manifold} if false undefined
       */
      hitPolygonCircle(p, c){
        _.assert(p instanceof Body && c instanceof Body, "need bodies");
        let m=new Manifold();
        if(_poly_circle(p,c,m)) return m;
      },
      /**Check if polygon collides with the circle.
       * @memberof module:mcfud/geo2d
       * @param {Polygon} p
       * @param {Circle} c
       * @return {boolean}
       */
      hitTestPolygonCircle(p, c){
        _.assert(p instanceof Body && c instanceof Body, "need bodies");
        return _poly_circle(p,c,new Manifold())
      },
      /**If this circle collides with polygon, return the manifold.
       * @memberof module:mcfud/geo2d
       * @param {Circle} c
       * @param {Polygon} p
       * @return {Manifold} if false undefined
       */
      hitCirclePolygon(c, p){
        _.assert(p instanceof Body && c instanceof Body, "need bodies");
        let m=new Manifold();
        if(_circle_poly(c,p,m)) return m;
      },
      /**Check if this circle collides with the polygon.
       * @memberof module:mcfud/geo2d
       * @param {Circle} c
       * @param {Polygon} p
       * @return {boolean}
       */
      hitTestCirclePolygon(c, p){
        _.assert(p instanceof Body && c instanceof Body, "need bodies");
        return _circle_poly(c,p,new Manifold())
      },
      /**If these 2 polygons collide, return the manifold.
       * @memberof module:mcfud/geo2d
       * @param {Polygon} a
       * @param {Polygon} b
       * @return {Manifold} if false undefined
       */
      hitPolygonPolygon(a, b){
        _.assert(a instanceof Body && b instanceof Body, "need bodies");
        let m=new Manifold();
        if(_poly_poly(a,b,m)) return m;
      },
      /**Check if these 2 polygons collide.
       * @memberof module:mcfud/geo2d
       * @param {Polygon} a
       * @param {Polygon} b
       * @return {boolean}
       */
      hitTestPolygonPolygon(a, b){
        _.assert(a instanceof Body && b instanceof Body, "need bodies");
        return _poly_poly(a,b,new Manifold())
      },
      /**Check if a point is inside these polygon vertices.
       * @memberof module:mcfud/geo2d
       * @param {number} testx
       * @param {number} testy
       * @param {Vec2[]} ps
       * @return {boolean}
       */
      hitTestPointInPolygon(testx,testy,ps){
        let c;
        for(let p,q,len=ps.length, i=0, j=len-1; i<len;){
          p=ps[i];
          q=ps[j];
          if(((p[1]>testy) !== (q[1]>testy)) &&
             (testx < (q[0]-p[0]) * (testy-p[1]) / (q[1]-p[1]) + p[0])) c = !c;
          j=i;
          ++i;
        }
        return c;
      },
      /**Check if point is inside this polygon.
       * @memberof module:mcfud/geo2d
       * @param {number} testx
       * @param {number} testy
       * @param {Polygon} poly
       * @return {boolean}
       */
      hitTestPointPolygon(testx,testy,poly){
        _.assert(poly instanceof Body, "wanted a body");
        return this.hitTestPointInPolygon(testx,testy,
                                          _V.translate(poly.pos,poly.shape.calcPoints))
      },
      hitTestLineCircle(A,B, x, y, radius){
        let AB=_V.sub(B,A),
            C=[x,y],
            AC=_V.sub(C,A),
            BC=_V.sub(C,B),
            AC_L2=_V.len2(AC);
        //try to get the 90deg proj onto line
        //let proj=_V.proj_scalar(AC,AB);
        //let U=proj/_V.len(AB);
        let dist,u = _V.dot(AC,AB) / _V.dot(AB,AB);
        if(u >= 0 && u <= 1){
          // point is on the line so just get the dist2 to the point
          dist= AC_L2 - u*u*_V.len2(AB);
        }else{
          // find which end is closest and get dist2 to circle
          dist = u < 0 ? AC_L2 : _V.len2(BC);
        }
        return [dist < radius * radius];
      },
      hitTestLinePolygon(p,p2, poly){
        _.assert(poly instanceof Body, "wanted a body");
        let vs=_V.translate(poly.pos, poly.shape.calcPoints);
        for(let i=0,i2=0; i<vs.length; ++i){
          i2= i+1;
          if(i2 == vs.length) i2=0;
          let [hit,t, pe] = this.lineIntersect2D(p,p2, vs[i],vs[i2]);
          if(hit)
            return [hit,t, pe];
        }
        return [false];
      },
      lineIntersect2D(p, p2, q, q2){
        let x1=p[0],y1=p[1];
        let x2=p2[0],y2=p2[1];
        let x3=q[0],y3=q[1];
        let x4=q2[0],y4=q2[1];
        let t;//forL1
        let u;//forL2
        let d= (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4);
        //TODO: handle collinear correctly!?
        if(_.feq0(d))
          return [false];//parallel

        t=(x1-x3)*(y3-y4)-(y1-y3)*(x3-x4);
        t /= d;
        u=(x1-x3)*(y1-y2)-(y1-y3)*(x1-x2);
        u /= d;

        if(0<=t && t<=1 && 0<=u && u<=1){
          return [true, t, [x1+t*(x2-x1), y1+t*(y2-y1)]]
        }else{
          return [false]
        }
      },
      //--------------------2LinesIntersection2D-------------------------
      //  Given 2 lines in 2D space AB, CD this returns true if an
      //  intersection occurs and sets dist to the distance the intersection
      //  occurs along AB
      //-----------------------------------------------------------------
      lineIntersection2D(A, B, C, D){
        //first test against the bounding boxes of the lines
        if( (((A[1] > D[1]) && (B[1] > D[1])) && ((A[1] > C[1]) && (B[1] > C[1]))) ||
             (((B[1] < C[1]) && (A[1] < C[1])) && ((B[1] < D[1]) && (A[1] < D[1]))) ||
             (((A[0] > D[0]) && (B[0] > D[0])) && ((A[0] > C[0]) && (B[0] > C[0]))) ||
             (((B[0] < C[0]) && (A[0] < C[0])) && ((B[0] < D[0]) && (A[0] < D[0])))){
          return [false,0];
        }
        let rTop = (A[1]-C[1])*(D[0]-C[0])-(A[0]-C[0])*(D[1]-C[1]);
        let rBot = (B[0]-A[0])*(D[1]-C[1])-(B[1]-A[1])*(D[0]-C[0]);

        let sTop = (A[1]-C[1])*(B[0]-A[0])-(A[0]-C[0])*(B[1]-A[1]);
        let sBot = (B[0]-A[0])*(D[1]-C[1])-(B[1]-A[1])*(D[0]-C[0]);

        let rTopBot = rTop*rBot;
        let sTopBot = sTop*sBot;

        if((rTopBot>0) && (rTopBot<rBot*rBot) && (sTopBot>0) && (sTopBot<sBot*sBot)){
          return [true, rTop/rBot];
        }else{
          return [false,0];
        }
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module == "object" && module.exports){
    module.exports=_module(require("./core"),
                           require("./math"),
                           require("./vec2"),
                           require("./matrix"),
                           require("../algo/basic"))
  }else{
    gscope["io/czlab/mcfud/geo2d"]=_module
  }

})(this);


