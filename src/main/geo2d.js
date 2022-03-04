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
// Copyright © 2013-2022, Kenneth Leung. All rights reserved.

;(function(gscope,UNDEF){

  "use strict";

  /** @ignore */
  const [LEFT_VORONOI, MID_VORONOI, RIGHT_VORONOI]= [1,0,-1];

  /**Create the module.
   * Standard XY cartesian coordinates, Y axis goes UP
   */
  function _module(Core,_M,_V,_X){

    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    if(!_M) _M=gscope["io/czlab/mcfud/math"]();
    if(!_V) _V=gscope["io/czlab/mcfud/vec2"]();
    if(!_X) _X=gscope["io/czlab/mcfud/matrix"]();

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
          let [hit,t] = this.lineIntersect2D(p,p2, vs[i],vs[i2]);
          if(hit)
            return [hit,t];
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
                           require("./matrix"))
  }else{
    gscope["io/czlab/mcfud/geo2d"]=_module
  }

})(this);


