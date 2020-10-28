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
// Copyright © 2020, Kenneth Leung. All rights reserved.
;
(function(global){
  //export--------------------------------------------------------------------
  if(typeof module === "object" &&
     module && typeof module.exports === "object"){
    global=module.exports;
  }
  else if(typeof exports === "object" && exports){
    global=exports;
  }
  let _singleton=null;
  global["io.czlab.mcfud.geo2d"]=function(){
    if(_singleton) { return _singleton }
    const Core=global["io.czlab.mcfud.core"]();
    const _M=global["io.czlab.mcfud.math"]();
    const _V=global["io.czlab.mcfud.vec2"]();
    const _=Core.u;
    const _G={};
    const MaxPolyVertexCount=64;
    const LEFT_VORONOI= -1;
    const MID_VORONOI= 0;
    const RIGHT_VORONOI= 1;
    /**
     * @public
     * @class
     */
    class Box4{
      constructor(left,bottom,right,top){
        this.left=left;
        this.right=right;
        this.top=top;
        this.bottom=bottom;
      }
    }
    /**
     * @public
     * @class
     */
    class Rect{
      constructor(x,y,width,height){
        if(arguments.length===2){
          this.width=x;
          this.height=y;
          this.pos= _V.V2();
        }else{
          this.pos=_V.V2(x,y);
          this.width=width;
          this.height=height;
        }
      }
    }
    /**
     * @public
     * @class
     */
    class Area{
      constructor(w,h){
        this.width=w;
        this.height=h;
      }
      half(){
        return new Area(this.width/2,this.height/2)
      }
    }
    /**
     * Calculate the area of this polygon.
     * @private
     * @function
     */
    _G.polyArea=function(points){
      let area=0;
      for(let p,q,i2,len=points.length,i=0;i<len;++i){
        i2= (i+1)%len;
        p=poly.points[i];
        q=poly.points[i2];
        area += (p[0]*q[1] - q[0]*p[1]);
      }
      return Math.abs(area)/2
    }
    /**
     * Find the center point of this polygon.
     * @public
     * @function
     */
    _G.calcPolyCenter=function(points){
      let A= 6*this.polyArea(points);
      let cx=0;
      let cy=0;
      for(let p,q,i2,i=0,len=points.length;i<len;++i){
        i2= (i+1)%len;
        p=points[i];
        q=points[i2];
        cx += (p[0]+q[0]) * (p[0]*q[1]-q[0]*p[1]);
        cy += (p[1]+q[1]) * (p[0]*q[1]-q[0]*p[1]);
      }
      return _V.V2(cx/A, cy/A)
    };
    /**
     * Lifted from Randy Gaul's impulse-engine:
     * https://github.com/RandyGaul/ImpulseEngine#Shape.h
     * @private
     * @function
     */
    function _orderPoints(vertices){
      let count=vertices.length;
      _.assert(count > 2 && count <= MaxPolyVertexCount); // at least 3
      //find the right most point
      let rightMost=0;
      let highestX= vertices[0][0];
      for(let x,i=1; i<count; ++i){
        x=vertices[i][0];
        if(x > highestX){
          highestX= x;
          rightMost= i;
        }
        // if same x then take farthest negative y
        else if(_M.fuzzyEq(x, highestX)){
          if(vertices[i][1] < vertices[rightMost][1]) rightMost = i;
        }
      }
      let hull=new Array(MaxPolyVertexCount);
      let outCount = 0;
      let indexHull = rightMost;
      for(;;){
        hull[outCount] = indexHull;
        // search for next index that wraps around the hull
        // by computing cross products to find the most counter-clockwise
        // vertex in the set, given the previos hull index
        let nextHullIndex = 0;
        for(let i=1; i<count; ++i){
          // skip if same coordinate as we need three unique
          // points in the set to perform a cross product
          if(nextHullIndex === indexHull){
            nextHullIndex = i;
            continue;
          }
          // cross every set of three unique vertices
          // record each counter clockwise third vertex and add
          // to the output hull
          // see : http://www.oocities.org/pcgpe/math2d.html
          let e1 = _V.vecSub(vertices[nextHullIndex], vertices[hull[outCount]]);
          let e2 = _V.vecSub(vertices[i], vertices[hull[outCount]]);
          let c = _V.vec2Cross(e1,e2);
          if(c < 0.0)
            nextHullIndex = i;
          // cross product is zero then e vectors are on same line
          // therefor want to record vertex farthest along that line
          if(_M.fuzzyZero(c) && _V.vecLen2(e2) > _V.vecLen2(e1))
            nextHullIndex = i;
        }
        ++outCount;
        indexHull = nextHullIndex;
        // conclude algorithm upon wrap-around
        if(nextHullIndex === rightMost){
          break;
        }
      }
      const result=[];
      for(let i=0; i<outCount; ++i)
        result.push(_V.vecClone(vertices[hull[i]]));
      return result;
    }
    /**
     * @public
     * @class
     */
    class Line{
      constructor(x1,y1,x2,y2){
        this.p= _V.V2(x1,y1);
        this.q= _V.V2(x2,y2);
      }
    }
    /**
     * @public
     * @class
     */
    class Circle{
      constructor(r){
        this.radius=r;
        this.orient=0;
        this.pos=_V.V2();
      }
      setOrient(r){
        this.orient=r;
        return this;
      }
      setPos(x,y){
        _V.vecCopy(this.pos,x,y);
        return this;
      }
    }
    /**
     * Points are specified in COUNTER-CLOCKWISE order
     * @public
     * @class
     */
    class Polygon{
      constructor(x,y){
        this.orient = 0;
        this.pos=_V.V2();
        this.setPos(x,y);
      }
      setPos(x,y){
        _V.vecCopy(this.pos,x||0,y||0);
        return this;
      }
      set(points){
        points= _orderPoints(points);
        if(this.calcPoints) this.calcPoints.length=0; else this.calcPoints = [];
        if(this.normals) this.normals.length=0; else this.normals = [];
        if(this.edges) this.edges.length=0; else this.edges = [];
        for(let i=0; i < points.length; ++i){
          this.calcPoints.push(_V.V2());
          this.edges.push(_V.V2());
          this.normals.push(_V.V2());
        }
        this.points = points;
        this._recalc();
        return this;
      }
      setOrient(rot){
        this.orient = rot;
        this._recalc();
        return this;
      }
      translate(x, y){
        if(this.points){
          for(let i=0; i < this.points.length; ++i){
            this.points[i][0] += x;
            this.points[i][1] += y;
          }
          this._recalc();
        }
        return this;
      }
      _recalc(){
        if(this.points){
          for(let i=0; i < this.points.length; ++i){
            _V.vecSet(this.calcPoints[i],this.points[i]);
            if(!_M.fuzzyZero(this.orient))
              _V.vec2RotSelf(this.calcPoints[i],this.orient);
          }
          for(let i2,p1,p2,e,i = 0; i < this.points.length; ++i){
            p1 = this.calcPoints[i];
            i2= (i+1) % this.calcPoints.length;
            p2=this.calcPoints[i2];
            this.edges[i]= _V.vecSub(p2,p1);
            this.normals[i]= _V.vecUnit(_V.perp(this.edges[i]));
          }
        }
        return this;
      }
    }
    /**
     * @public
     * @class
     */
    class Box extends Rect{
      constructor(x,y, w, h){
        super(x,y,w,h);
      }
      toPolygon(){
        return new Polygon(this.pos[0],
                           this.pos[1]).set([_V.V2(this.width,0),
                                             _V.V2(this.width,this.height),
                                             _V.V2(0,this.height),_V.V2()]);
      }
    }
    /**
     * @public
     * @class
     */
    class Manifold{
      constructor(A,B){
        this.A = A;
        this.B = B;
        this.overlapN = _V.V2();
        this.overlapV = _V.V2();
        this.clear();
      }
      clear(){
        this.overlap = Infinity;
        this.AInB = true;
        this.BInA = true;
        return this;
      }
    }

    /**
     * @public
     * @function
     */
    _G.getAABB=function(obj){
      if(_.has(obj,"radius")){
        return new _G.Rect(obj.pos[0]-obj.radius,
                           obj.pos[1]-obj.radius,
                           obj.radius*2, obj.radius*2)
      } else{
        let cps= _V.translate(obj.pos, obj.calcPoints);
        let xMin = cps[0][0];
        let yMin = cps[0][1];
        let xMax = xMin;
        let yMax = yMin;
        for(let p,i=1; i<cps.length; ++i){
          p= cps[i];
          if(p[0] < xMin) xMin = p[0];
          if(p[0] > xMax) xMax = p[0];
          if(p[1] < yMin) yMin = p[1];
          if(p[1] > yMax) yMax = p[1];
        }
        return new _G.Rect(xMin,
                           yMin,
                           xMax - xMin, yMax - yMin)
      }
    };
    /**
     * Shift a set of points.
     * @public
     * @function
     */
    _G.shiftPoints=function(ps,delta){
      return ps.map(v => _V.vecAdd(v,delta))
    };
    /**
     * Rotate a set of points.
     * @public
     * @function
     */
    _G.rotPoints=function(ps,rot,pivot){
      return ps.map(v => _V.vec2Rot(v,rot,pivot))
    };
    /**
     * Find the vertices of a rectangle.
     * @public
     * @function
     * @returns points in counter-cwise, bottom-right first.
     */
    _G.calcRectPoints=function(w,h){
      let w2=w/2;
      let h2=h/2;
      return [_V.V2(hw,-hh),
              _V.V2(hw,hh),
              _V.V2(-hw,hh),
              _V.V2(-hw,-hh)];
    };
    /**
     * @public
     * @function
     */
    _G.line=function(x1,y1,x2,y2){
      return new Line(x1,y1,x2,y2)
    };
    /**
     * @public
     * @function
     */
    _G.rectEqRect=function(r1,r2){
      return r1.width===r2.width &&
             r1.height===r2.height &&
             r1.pos[0]===r2.pos[0] &&
             r1.pos[1]===r2.pos[1]
    };
    /**
     * @public
     * @function
     */
    _G.rectContainsRect=function(R,r){
      return !(R.pos[0] >= r.pos[0] ||
               R.pos[1] >= r.pos[1] ||
               (R.pos[0]+R.width) <= (r.pos[0]+r.width) ||
               (R.pos[1]+R.height) <= (r.pos[1]+r.height))
    };
    /**
     * Right side on the x-axis.
     * @public
     * @function
     */
    _G.rectGetMaxX=function(r){
      return r.pos[0] + r.width
    }
    /**
     * Middle on the x-axis.
     * @public
     * @function
     */
    _G.rectGetMidX=function(r){
      return r.pos[0] + r.width/2
    };
    /**
     * @public
     * @function
     */
    _G.rectGetMinX=function(r){
      return r.pos[0]
    };
    /**
     * @public
     * @function
     */
    _G.rectGetMaxY=function(r){
      return r.pos[1] + r.height
    };
    /**
     * Mid point on the y-axis.
     * @public
     * @function
     */
    _G.rectGetMidY=function(r){
      return r.pos[1] + r.height/2
    };
    /**
     * @public
     * @function
     */
    _G.rectGetMinY=function(r){
      return r.pos[1]
    }
    /**
     * If point lies inside rect.
     * @public
     * @function
     */
    _G.containsPoint=function(r,x,y){
      return x >= this.rectGetMinX(r) &&
             x <= this.rectGetMaxX(r) &&
             y >= this.rectGetMinY(r) &&
             y <= this.rectGetMaxY(r)
    };
    /**
     * @public
     * @function
     */
    _G.rectIntersectsRect=function(r1,r2){
      return !((r1.pos[0]+r1.width) < r2.pos[0] ||
               (r2.pos[0]+r2.width) < r1.pos[0] ||
               (r1.pos[1]+r1.height) < r2.pos[1] ||
               (r2.pos[1]+r2.height) < r1.pos[1])
    };
    /**
     * Find the union of two rects.
     * @public
     * @function
     */
    _G.rectUnionsRect=function(r1,r2){
      let x= Math.min(r1.pos[0],r2.pos[0]);
      let y= Math.min(r1.pos[1],r2.pos[1]);
      return new Rect(x,y,
                      Math.max(r1.pos[0]+r1.width, r2.pos[0]+r2.width)-x,
                      Math.max(r1.pos[1]+r1.height, r2.pos[1]+r2.height)-y)
    };
    /**
     * @public
     * @function
     */
    _G.rectIntersectsRect=function(r1,r2){
      let x= Math.max(r1.pos[0],r2.pos[0]);
      let y= Math.max(r1.pos[1],r2.pos[1]);
      return new Rect(x,y,
                      Math.min(r1.pos[0]+r1.width, r2.pos[0]+r2.width)-x,
                      Math.min(r1.pos[1]+r1.height, r2.pos[1]+r2.height)-y)
    };

    //------------------------------------------------------------------------
    // 2d collision using Separating Axis Theorem.
    // see https://github.com/jriecken/sat-js
    //------------------------------------------------------------------------
    /**
     * @private
     * @function
     */
    function _findProjRange(points, axis){
      let min = Infinity;
      let max = -Infinity;
      for(let dot,i=0; i < points.length; ++i){
        dot = _V.vecDot(points[i],axis);
        if(dot < min) min = dot;
        if(dot > max) max = dot;
      }
      return _V.takeV2(min,max)
    }
    /**
     * @private
     * @function
     */
    function _voronoiRegion(line, point){
      let dp = _V.vecDot(point,line);
      let len2 = _V.vecLen2(line);
      // If pt is beyond the start of the line, left voronoi region
      // If pt is beyond the end of the line, right voronoi region
      return dp < 0 ? LEFT_VORONOI : (dp > len2 ? RIGHT_VORONOI : MID_VORONOI)
    }
    /**
     * @private
     * @function
     */
    function _testSAT(aPos,aPoints, bPos,bPoints, axis, resolve){
      let vAB= _V.vecSub(bPos,aPos); // B relative to A
      let projectedOffset = _V.vecDot(vAB,axis);
      let [minA,maxA] =_findProjRange(aPoints, axis);
      let [minB,maxB] =_findProjRange(bPoints, axis);
      // move B's range to its position relative to A.
      minB += projectedOffset;
      maxB += projectedOffset;
      let gap;
      if(minA > maxB || minB > maxA){
        gap=true;
      } else if(resolve){
        let overlap = 0;
        // A starts left of B
        if(minA < minB){
          resolve.AInB = false;
          // A ends before B does. We have to pull A out of B
          if(maxA < maxB){
            overlap = maxA - minB;
            resolve.BInA = false;
          }else{
            // B is fully inside A.  Pick the shortest way out.
            let [d1,d2] = [maxA - minB, maxB - minA];
            overlap = d1 < d2 ? d1 : -d2;
          }
        // B starts left than A
        }else{
          resolve.BInA = false;
          // B ends before A ends. We have to push A out of B
          if(maxA > maxB){
            overlap = minA - maxB;
            resolve.AInB = false;
          }else{
            // A is fully inside B.  Pick the shortest way out.
            let [d1,d2] = [maxA - minB, maxB - minA];
            overlap = d1 < d2 ? d1 : -d2;
          }
        }
        // If smallest amount of overlap, set it as the minimum overlap.
        let absOverlap = Math.abs(overlap);
        if(absOverlap < resolve.overlap){
          resolve.overlap = absOverlap;
          _V.vecSet(resolve.overlapN,axis);
          if(overlap < 0)
            _V.vecFlipSelf(resolve.overlapN);
        }
      }
      _V.dropV2(vAB);
      return gap;
    }
    /**
     * @public
     * @function
     */
    _G.hitTestPointCircle=function(p, c){
      let d2 = _V.vecLen2(_V.vecSub(p,c.pos));
      return d2 <= c.radius * c.radius;
    };
    const _RES= new Manifold();
    const _FAKE_POLY= new Box(0,0, 1, 1).toPolygon();
    /**
     * @public
     * @function
     */
    _G.hitTestPointPolygon=function(p, poly){
      _V.vecSet(_FAKE_POLY.pos,p);
      let res= this.hitTestPolygonPolygon(_FAKE_POLY, poly, _RES.clear());
      return res ? _RES.AInB : false;
    };
    /**
     * @private
     * @function
     */
    function _circle_circle(a, b, resolve){
      let r_ab = a.radius + b.radius;
      let vAB= _V.vecSub(b.pos,a.pos);
      let r2 = r_ab * r_ab;
      let d2 = _V.vecLen2(vAB);
      let status= !(d2 > r2);
      if(status && resolve){
        let dist = Math.sqrt(d2);
        resolve.A = a;
        resolve.B = b;
        resolve.overlap = r_ab - dist;
        _V.vecSet(resolve.overlapN, _V.vecUnitSelf(vAB));
        _V.vecSet(resolve.overlapV, _V.vecMul(vAB,resolve.overlap));
        resolve.AInB = a.radius <= b.radius && dist <= b.radius - a.radius;
        resolve.BInA = b.radius <= a.radius && dist <= a.radius - b.radius;
      }
      _V.dropV2(vAB);
      return status;
    }
    /**
     * @public
     * @function
     */
    _G.hitCircleCircle=function(a, b){
      let m=new Manifold();
      return _circle_circle(a,b,m) ? m : null
    };
    /**
     * @public
     * @function
     */
    _G.hitTestCircleCircle=function(a, b){
      return _circle_circle(a,b,new Manifold());
    };
    /**
     * @private
     * @function
     */
    function _poly_circle(polygon, circle, resolve){
      // get position of the circle relative to the polygon.
      let vPC= _V.vecSub(circle.pos,polygon.pos);
      let r2 = circle.radius * circle.radius;
      let cps = polygon.calcPoints;
      let edge = _V.takeV2();
      let point;// = _V.takeV2();
      // for each edge in the polygon:
      for(let len=cps.length,i=0; i < len; ++i){
        let next = i === len-1 ? 0 : i+1;
        let prev = i === 0 ? len-1 : i-1;
        let overlap = 0;
        let overlapN = null;
        _V.vecSet(edge,polygon.edges[i]);
        // calculate the center of the circle relative to the starting point of the edge.
        point=_V.vecSub(vPC,cps[i]);
        // if the distance between the center of the circle and the point
        // is bigger than the radius, the polygon is definitely not fully in
        // the circle.
        if(resolve && _V.vecLen2(point) > r2){
          resolve.AInB = false;
        }
        // calculate which Voronoi region the center of the circle is in.
        let region = _voronoiRegion(edge, point);
        if(region === LEFT_VORONOI){
          // need to make sure we're in the RIGHT_VORONOI of the previous edge.
          _V.vecSet(edge,polygon.edges[prev]);
          // calculate the center of the circle relative the starting point of the previous edge
          let point2= _V.vecSub(vPC,cps[prev]);
          region = _voronoiRegion(edge, point2);
          if(region === RIGHT_VORONOI){
            // it's in the region we want.  Check if the circle intersects the point.
            let dist = _V.vecLen(point);
            if(dist > circle.radius){
              // No intersection
              _V.dropV2(vPC,edge,point,point2);
              return false;
            } else if(resolve){
              // intersects, find the overlap.
              resolve.BInA = false;
              overlapN = _V.vecUnit(point);
              overlap = circle.radius - dist;
            }
          }
          _V.dropV2(point2);
        } else if(region === RIGHT_VORONOI){
          // need to make sure we're in the left region on the next edge
          _V.vecSet(edge,polygon.edges[next]);
          // calculate the center of the circle relative to the starting point of the next edge.
          _V.vecSubSelf(_V.vecSet(point,vPC),cps[next]);
          region = _voronoiRegion(edge, point);
          if(region === LEFT_VORONOI){
            // it's in the region we want.  Check if the circle intersects the point.
            let dist = _V.vecLen(point);
            if(dist > circle.radius){
              _V.dropV2(vPC,edge,point);
              return false;
            } else if(resolve){
              resolve.BInA = false;
              overlapN = _V.vecUnit(point);
              overlap = circle.radius - dist;
            }
          }
        }else{
          // check if the circle is intersecting the edge,
          // change the edge into its "edge normal".
          let normal = _V.vecUnitSelf(_V.perp(edge));
          // find the perpendicular distance between the center of the circle and the edge.
          let dist = _V.vecDot(point,normal);
          let distAbs = Math.abs(dist);
          // if the circle is on the outside of the edge, there is no intersection.
          if(dist > 0 && distAbs > circle.radius){
            _V.dropV2(vPC,normal,point);
            return false;
          } else if(resolve){
            overlapN = normal;
            overlap = circle.radius - dist;
            // if the center of the circle is on the outside of the edge, or part of the
            // circle is on the outside, the circle is not fully inside the polygon.
            if(dist >= 0 || overlap < 2 * circle.radius){
              resolve.BInA = false;
            }
          }
        }
        // if this is the smallest overlap we've seen, keep it.
        // (overlapN may be null if the circle was in the wrong Voronoi region).
        if(overlapN && resolve && Math.abs(overlap) < Math.abs(resolve.overlap)){
          resolve.overlap = overlap;
          _V.vecSet(resolve.overlapN,overlapN);
        }
      }
      // calculate the final overlap vector - based on the smallest overlap.
      if(resolve){
        resolve.A = polygon;
        resolve.B = circle;
        _V.vecMulSelf(_V.vecSet(resolve.overlapV,resolve.overlapN),resolve.overlap);
      }
      _V.dropV2(vPC,edge,point);
      return true;
    }
    /**
     * @public
     * @function
     */
    _G.hitPolygonCircle=function(polygon, circle){
      let m=new Manifold();
      return _poly_circle(polygon,circle,m) ? m : null
    };
    /**
     * @public
     * @function
     */
    _G.hitTestPolygonCircle=function(polygon, circle){
      return _poly_circle(polygon,circle,new Manifold());
    };
    /**
     * @private
     * @function
     */
    function _circle_poly(circle, polygon, resolve){
      let result = _poly_circle(polygon, circle, resolve);
      if(result && resolve){
        // flip A and B
        let a = resolve.A;
        let aInB = resolve.AInB;
        _V.vecFlipSelf(resolve.overlapN);
        _V.vecFlipSelf(resolve.overlapV);
        resolve.A = resolve.B;
        resolve.B = a;
        resolve.AInB = resolve.BInA;
        resolve.BInA = aInB;
      }
      return result;
    }
    /**
     * @public
     * @function
     */
    _G.hitCirclePolygon=function(circle, polygon){
      let m=new Manifold();
      return _circle_poly(circle,polygon,m) ? m : null
    };
    /**
     * @public
     * @function
     */
    _G.hitTestCirclePolygon=function(circle, polygon){
      return _circle_poly(circle,polygon,new Manifold());
    };
    /**
     * @private
     * @function
     */
    function _poly_poly(a, b, resolve){
      let pa = a.calcPoints;
      let pb = b.calcPoints;
      for(let i=0; i < pa.length; ++i){
        if(_testSAT(a.pos, pa, b.pos, pb, a.normals[i], resolve))
          return false;
      }
      for(let i=0;i < pb.length; ++i){
        if(_testSAT(a.pos, pa, b.pos, pb, b.normals[i], resolve))
          return false;
      }
      if(resolve){
        if(resolve.overlap===0 || _M.fuzzyZero(resolve.overlap))
          return false;
        resolve.A = a;
        resolve.B = b;
        _V.vecSet(resolve.overlapV,resolve.overlapN);
        _V.vecMulSelf(resolve.overlapV,resolve.overlap);
      }
      return true;
    }
    /**
     * @public
     * @function
     */
    _G.hitPolygonPolygon=function(a, b){
      let m=new Manifold();
      return _poly_poly(a,b,m) ? m : null
    };
    /**
     * @public
     * @function
     */
    _G.hitTestPolygonPolygon=function(a, b){
      return _poly_poly(a,b,new Manifold());
    };

    return _singleton= _.inject(_G, {Circle: Circle,
                                     Line: Line,
                                     Box: Box,
                                     Manifold: Manifold,
                                     Polygon: Polygon, Rect: Rect, Area: Area});

  };


})(this);
