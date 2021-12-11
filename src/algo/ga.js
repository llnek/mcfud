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
    const {Bag,Stack,Queue,StdCompare:CMP,prnIter}= Basic;
    const {MinPQ}= Sort;
    const int=Math.floor;
    const {is,u:_}= Core;

    /**
     * @module mcfud/algo_ga
     */

    /**Classic NQueen problem.
     * @memberof module:mcfud/algo_ga
     * @class
     */

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Guess a password.
     * @memberof module:mcfud/algo_go
     * @class
     */
    class CH1{
      static Chromosome(genes,fitness){ return {genes, fitness} }
      static mutate(parent, geneSet, getFit){
        let c= parent.genes.slice(),
            i= _.randInt(parent.genes.length);
        for(let z;;){
          z=_.randItem(geneSet);
          if(z!= c[i]){
            c[i]=z;
            break;
          }
        }
        return CH1.Chromosome(c, getFit(c));
      }
      static genParent(length, geneSet, getFit){
        let genes = [];
        while(genes.length < length){
          let sampleSize = Math.min(length - genes.length, geneSet.length);
          genes.push.apply(genes, _.randSample(geneSet, sampleSize));
        }
        return CH1.Chromosome(genes, getFit(genes));
      }
      static getBest(getFit, targetLen, optimal, geneSet,display){
        let bestParent = CH1.genParent(targetLen, geneSet, getFit);
        display("p", bestParent);
        if(bestParent.fitness >= optimal) return bestParent;
        while(1){
          let child = CH1.mutate(bestParent, geneSet, getFit);
          if(bestParent.fitness >= child.fitness){continue}
          display("c", child);
          if(child.fitness >= optimal) return child;
          bestParent = child;
        }
      }
      static test(input){
        let geneSet = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!.,".split("");
        let target=input.split(""),
            N=target.length,
            optimal= target.length;
        function getFit(guess){
          let sum=0;
          for(let i=0;i<N;++i) if(target[i]==guess[i]) ++sum;
          return sum;
        }
        function display(w,x){
          console.log(`${w} = ${x.genes.join("")}`);
        }
        CH1.getBest(getFit, N, optimal, geneSet, display);
      }
    }
    //CH1.test("Hello World!");

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function Chromosome(genes, fitness){
      return {genes, fitness, age:0}
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function genPar(length, geneSet, getFit){
      let genes = [];
      while(genes.length < length){
        let sampleSize = Math.min(length - genes.length, geneSet.length);
        genes.push.apply(genes, _.randSample(geneSet, sampleSize));
      }
      return Chromosome(genes, getFit(genes));
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function mutate(parent, geneSet, getFit){
      let c= parent.genes.slice(),
          i= _.randInt(parent.genes.length);
      for(let z;;){
        z=_.randItem(geneSet);
        if(z!=c[i]){
          c[i]=z;
          break;
        }
      }
      return Chromosome(c, getFit(c));
    }
    function bisectLeft(arr,e){
      let a,i=0;
      for(;i<arr.length;++i){
        a=arr[i];
        if(a.fitness.eq(e.fitness) || !e.fitness.gt(a.fitness)) break;
      }
      return i;
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function cycle(getFit, targetLen, optimal, geneSet, extra={}){
      let child,parent,bestParent;
      let index,ratio;
      extra.cycles=0;
      if(extra.create){
        let c= extra.create();
        bestParent= Chromosome(c, getFit(c));
      }else{
        bestParent= genPar(targetLen, geneSet, getFit);
      }
      parent=bestParent;
      let history=[bestParent];
      if(extra.display)
        extra.display("p",bestParent);
      if(!(optimal.gt(bestParent.fitness))) return bestParent;
      while(1){
        if(extra.mutate)
          child=extra.mutate(parent, geneSet, getFit);
        else
          child=mutate(parent, geneSet, getFit);
        extra.cycles += 1;
        //console.log("cycle="+extra.cycles);
        if(bestParent.fitness.gt( child.fitness)){
          if(extra.maxAge===undefined) continue;
          parent.age +=1;
          if(extra.maxAge>parent.age) continue;
          index=bisectLeft(history,child,0,history.length);
          //console.log("inx====="+index +", len= " + history.length);
          ratio=(history.length-index)/history.length;
          //console.log(ratio);
          if(_.rand()< Math.exp(-ratio)){
            parent=child;
            continue;
          }
          bestParent.age=0;
          parent=bestParent;
          continue;
        }
        if(!(child.fitness.gt( bestParent.fitness))){
          //same fitness
          child.age=parent.age+1;
          parent = child;
          continue;
        }
        child.age=0;
        parent=child;
        if(extra.display)
          extra.display("c",child);
        if(child.fitness.gt(bestParent.fitness)){
          bestParent=child;
          if(!(optimal.gt(child.fitness))) return child;
          //_.assert(bestParent.fitness.gt(history[history.length-1].fitness),"Boom");
          history.push(bestParent);
        }
      }
    }
    function wrapNumObjGtr(n){
      return {
        value:n,
        gt(x){ return n>x.value },
        eq(x){ return n==x.value }
      }
    }
    function wrapNumObjLsr(n){
      return {
        value:n,
        gt(x){ return n<x.value },
        eq(x){ return n==x.value }
      }
    }
    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Sort numbers.
     * @memberof module:mcfud/algo_go
     * @class
     */
    class CH3{
      static Fitness(numbersInSeqCnt, totalGap){
        return {
          numbersInSeqCnt, totalGap,
          prn(){
            return `${this.numbersInSeqCnt} Sequential, ${this.totalGap} Total Gap`
          },
          gt(b){
            if(this.numbersInSeqCnt != b.numbersInSeqCnt)
                return this.numbersInSeqCnt > b.numbersInSeqCnt;
            return this.totalGap < b.totalGap;
          }
        };
      }
      static test(totalNumbers){
        function getFit(genes){
          let fitness = 1, gap = 0;
          for(let i=1;i<genes.length;++i){
            if(genes[i] > genes[i - 1])
              fitness += 1;
            else
              gap += genes[i - 1] - genes[i];
          }
          return CH3.Fitness(fitness, gap);
        }
        let extra={
          display(w,a){
            console.log(`${w}= ${a.genes.join(",")}`);
          }
        };
        let geneSet = _.fill(100,(i)=> i),
            optimal= CH3.Fitness(totalNumbers, 0);
        cycle(getFit, totalNumbers, optimal, geneSet, extra);
      }
    }
    //CH3.test(20);

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Solve 8 queens.
     * @memberof module:mcfud/algo_go
     * @class
     */
    class CH4{
      static Board(genes, size){
        let board = _.fill(size, ()=> _.fill(size, "."));
        for(let row,col,i=0;i<genes.length;i+=2){
          row = genes[i];
          col= genes[i+ 1];
          board[row][col] = "Q";
        }
        return {
          get(row, col){ return board[row][col] },
          prn(){
            for(let i=0;i<board.length;++i)
              console.log(board[i].join(" "));
          }
        }
      }
      static Fitness(clashQ){
        return {
          gt(b){ return this.clashQ < b.clashQ },
          prn(){ return `${this.clashQ}` },
          clashQ
        }
      }
      static test(N){
        let geneSet = _.fill(N, (i)=> i);
        function getFit(genes){
          //best case is rows,cols dont overlap, so we would get
          //8 and 8 in those 2 maps. For diagonals, the two diags
          //are indexed by 2 formulas to check for overlaps
          let bd= CH4.Board(genes, N),
              NE = new Map(), SE= new Map(),
              ROWS = new Map(), COLS = new Map();
          for(let row=0;row<N;++row)
            for(let col=0;col<N;++col){
              if(bd.get(row, col) == "Q"){
                ROWS.set(row,1);
                COLS.set(col,1);
                NE.set(row+col,1);
                SE.set(N-1-row+col,1);
              }
            }
          return CH4.Fitness(N*4 - ROWS.size - COLS.size - NE.size - SE.size)
        }
        let extra= {
          display(Z,c){
            console.log(_.fill(48,"-").join("") + ", f= "+c.fitness.prn());
            CH4.Board(c.genes, N).prn();
          }
        }
        cycle(getFit, 2*N, CH4.Fitness(0), geneSet, extra);
      }
    }
    //CH4.test(4);

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Solve Graph coloring.
     * @memberof module:mcfud/algo_go
     * @class
     */
    class CH5{
      static Edge(a,b){
        let left,right;
        if(a<b){ left=a; right=b; } else { left=b; right=a; }
        //console.log(`edge=${left}->${right}`);
        return{
          left,right,
          id(){ return `${left}:${right}` },
          isValid(genes, nodeIndexLookup){
            let i= nodeIndexLookup.get(left),
                j= nodeIndexLookup.get(right);
            return genes[i] != genes[j];
          }
        }
      }
      static test(){
        let Rules=new Map(), Nodes=new Map();
        `AK AL,FL;GA;MS;TN AR,LA;MO;MS;OK;TN;TX AZ,CA;NM;NV;UT CA,AZ;NV;OR CO,KS;NE;NM;OK;UT;WY CT,MA;NY;RI DC,MD;VA
         DE,MD;NJ;PA FL,AL;GA GA,AL;FL;NC;SC;TN HI IA,IL;MN;MO;NE;SD;WI ID,MT;NV;OR;UT;WA;WY IL,IA;IN;KY;MO;WI
         IN,IL;KY;MI;OH KS,CO;MO;NE;OK KY,IL;IN;MO;OH;TN;VA;WV LA,AR;MS;TX MA,CT;NH;NY;RI;VT MD,DC;DE;PA;VA;WV
         ME,NH MI,IN;OH;WI MN,IA;ND;SD;WI MO,AR;IA;IL;KS;KY;NE;OK;TN MS,AL;AR;LA;TN MT,ID;ND;SD;WY NC,GA;SC;TN;VA
         ND,MN;MT;SD NE,CO;IA;KS;MO;SD;WY NH,MA;ME;VT NJ,DE;NY;PA NM,AZ;CO;OK;TX NV,AZ;CA;ID;OR;UT NY,CT;MA;NJ;PA;VT
         OH,IN;KY;MI;PA;WV OK,AR;CO;KS;MO;NM;TX OR,CA;ID;NV;WA PA,DE;MD;NJ;NY;OH;WV RI,CT;MA SC,GA;NC SD,IA;MN;MT;ND;NE;WY
         TN,AL;AR;GA;KY;MO;MS;NC;VA TX,AR;LA;NM;OK UT,AZ;CO;ID;NV;WY VA,DC;KY;MD;NC;TN;WV VT,MA;NH;NY WA,ID;OR
         WI,IA;IL;MI;MN WV,KY;MD;OH;PA;VA WY,CO;ID;MT;NE;SD;UT`.split(/\s+/).forEach(s=>{
           let p,e,a=s.split(/[,;]/).filter(x=>x.length>0); _.assert(a.length>0,"Boom");
           p=a.shift();
           Nodes.set(p,1);
           a.forEach(x=>{
             Nodes.set(x,1);
             e=CH5.Edge(p,x);
             Rules.set(e.id(),e);
           });
         });
        //console.log("Nodes===="+Nodes.size);
        let Colors=new Map(),
            NodeIndex=new Map(),
            optimal= wrapNumObjGtr(Rules.size);
        let geneSet= ["Orange", "Yellow", "Green", "Blue"].map(c=>{
          Colors.set(c.charAt(0),c);
          return c.charAt(0);
        });
        let keys=Array.from(Nodes.keys()).sort();
        keys.forEach((n,i)=> NodeIndex.set(n,i));
        function getFit(genes){
          let sum=0;
          Rules.forEach((r,k)=>{
            if(r.isValid(genes, NodeIndex)) ++sum;
          })
          return wrapNumObjGtr(sum);
        }
        let extra={};
        let best=cycle(getFit, keys.length, optimal, geneSet, extra);
        keys.forEach((k,i)=>{
          console.log(`${k} is ${Colors.get(best.genes[i])}`);
        });
        console.log("total cycles= " + extra.cycles);
      }
    }
    //CH5.test();

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Solve a card problem.
     * @memberof module:mcfud/algo_go
     * @class
     */
    class CH6{
      static Fitness(group1Sum, group2Product, duplicateCount){
        let sumDifference= Math.abs(36 - group1Sum);
        let productDifference= Math.abs(360 - group2Product);
        return{
          group1Sum,
          group2Product,
          duplicateCount,
          sumDifference,
          productDifference,
          totalDifference: sumDifference + productDifference,
          gt(b){
            if(this.duplicateCount != b.duplicateCount)
              return this.duplicateCount < b.duplicateCount;
            return this.totalDifference < b.totalDifference;
          }
        }
      }
      static test(){
        let geneSet = _.fill(10,(i)=>i+1);
        let optimal= CH6.Fitness(36, 360, 0);
        function getFit(genes){
          let g1Sum = 0;
          let g2Prod = 1;
          let duplicates = genes.length - new Set(genes).size;
          for(let i=0;i<5;++i) g1Sum += genes[i];
          for(let i=5;i<10;++i) g2Prod *= genes[i];
          return CH6.Fitness(g1Sum, g2Prod, duplicates);
        }
        let extra={
          mutate(parent,geneSet,getFit){
            let genes= parent.genes.slice();
            if(genes.length == new Set(genes).size){
              let count = _.randInt2(1, 4);
              let t,a,b,x=_.fill(genes.length,(i)=> i);
              while(count > 0){
                count -= 1;
                _.shuffle(x);
                a=x[0];
                b=x[1];
                //swap
                t=genes[a];
                genes[a]=genes[b];
                genes[b]=t;
              }
            }else{
              a = _.randInt(genes.length);
              b = _.randInt(geneset.length);
              genes[a] = geneSet[b];
            }
            return Chromosome(genes, getFit(genes));
          }
        };
        let best=cycle(getFit, 10, optimal, geneSet, extra);
        console.log("total cycles= "+extra.cycles);
        console.log(best.genes.slice(0,5).join(",") + " - " + best.genes.slice(5).join(","));
      }
    }
    //CH6.test();

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Solve Knight's problem.
     * @memberof module:mcfud/algo_go
     * @class
     */
    class CH7{
      static Position(x, y){
        return {x,y, id(){ return `${x},${y}` }}
      }
      static Board(genes, N){
        console.log(JSON.stringify(genes.slice(0,7)));
        console.log(JSON.stringify(genes.slice(7)));
        let board=_.fill(N,()=> _.fill(N,"."));
        genes.forEach(p=> board[p.y][p.x]="N");
        return{
          prn(){
            board.forEach(r=> console.log(r.join(" ")));
          }
        }
      }
      static test(N, expectedK){
        let optimal= wrapNumObjGtr(N*N);

        function getAttacks(loc){
          let out=new Map(),
              X= [-2, -1, 1, 2],
              Y= [-2, -1, 1, 2];
          for(let p,x,i=0;i<X.length;++i){
            x=loc.x+X[i];
            if(x>=0 && x<N)
              for(let y,j=0;j<Y.length;++j){
                y=loc.y+Y[j];
                if(y>=0 && y<N && Math.abs(X[i]) != Math.abs(Y[j])){
                  p=CH7.Position(x,y);
                  out.set(p.id(),p);
                }
              }
          }
          let r= Array.from(out.values());
          return r;
        }

        function getFit(genes){
          let out=new Map();
          genes.forEach(k=> getAttacks(k).forEach(p=> out.set(p.id(),1)));
          return wrapNumObjGtr(out.size);
        }

        let allPos=[];
        for(let x=0;x<N;++x)
          for(let y=0;y<N;++y) allPos.push(CH7.Position(x,y));

        let allPosMap=allPos.reduce((m,v)=>{
          m.set(v.id(),v); return m;
        },new Map());

        let nonEdgePos= allPos.map(p=>{
          return (p.x>0 && p.x < N-1 && p.y>0 && p.y < N-1)?p:null
        }).filter(o=> o != null);

        let nonEdgePosMap= nonEdgePos.reduce((m,v)=>{
          m.set(v.id(), 0); return m;
        },new Map());

        function fnMutate(parent){
          let cnt= _.randInt(10)==0 ? 2 : 1;
          let genes= parent.genes.slice();
          let KI,unattacked,posToKIndexes;
          let potentialKPos;
          while(cnt>0){
            cnt -= 1;
            unattacked = [];

            posToKIndexes= allPos.reduce((m,v)=>{
              m.set(v.id(),[]); return m;
            },new Map());

            genes.forEach((k,i)=>{
              getAttacks(k).forEach(p=> posToKIndexes.get(p.id()).push(i));
            });

            KI=genes.reduce((m,v,i)=>{ m.set(i,0); return m; },new Map());

            posToKIndexes.forEach((v,k)=>{
              if(v.length==0){
                unattacked.push(allPosMap.get(k));
              }else if(v.length==1){
                if(KI.has(v[0])) KI.delete(v[0])
              }
            });

            potentialKPos= nonEdgePos;
            if(unattacked.length>0){
              potentialKPos=[];
              for(let a,i=0; i<unattacked.length;++i){
                a=getAttacks(unattacked[i]);
                _.assert(a.length>0,"CRap");
                for(let p,j=0;j<a.length;++j){
                  p=a[j];
                  if(nonEdgePosMap.has(p.id())) potentialKPos.push(p);
                }
              }
            }

            let gi= KI.size ==0 ? _.randInt(genes.length)
                                : _.randItem(Array.from(KI.keys()));
            _.assert(potentialKPos.length>0,"Boom");
            genes[gi] = _.randItem(potentialKPos);
          }

          return Chromosome(genes,getFit(genes));
        }

        let extra={
          mutate: fnMutate,
          create: function(){
            return _.fill(expectedK, ()=> _.randItem(nonEdgePos))
          }
        };

        let best = cycle(getFit, null, optimal, null, extra);
        console.log("total cycles= "+ extra.cycles);
        console.log("best fitness= "+ best.fitness.value);
        console.log("best len= "+ best.genes.length);
        CH7.Board(best.genes,N).prn();
      }
    }
    //CH7.test(8,14);

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Solve Knight's problem.
     * @memberof module:mcfud/algo_go
     * @class
     */
    class CH8{
      static getSums(genes, N){
        let se=0, ne=0,
            rows = _.fill(N,0),
            columns = _.fill(N,0);
        for(let v,r=0;r<N;++r){
          for(let c=0;c<N;++c){
            v= genes[r * N + c];
            rows[r] += v;
            columns[c] += v;
          }
          se += genes[r * N + r];
          ne += genes[r * N + (N - 1 - r)];
        }
        //console.log("rows=="+rows.join(","));
        //console.log("cols=="+columns.join(","));
        //console.log("ne==="+ne+", se==="+se);
        //console.log("=======");
        //console.log(_.partition(3,genes).join("\n"));
        return [rows, columns, ne, se];
      }
      static test(N,maxAge){
        let SQ= N*N;
        let optimal= wrapNumObjLsr(0);
        let geneSet = _.fill(SQ, (i)=> i+1);
        let expected= N* Math.floor((SQ+1)/2);
        let geneIndexes = _.fill(geneSet.length,(i)=> i);
        function getFit(genes){
          let [rows, cols, ne, se]= CH8.getSums(genes, N),
              sums=rows.concat(cols).concat([se,ne]).filter(s=> s != expected);
          return wrapNumObjLsr(sums.reduce((acc,v)=>{
            acc += Math.abs(v-expected);
            return acc;
          },0));
        }
        let extra={
          maxAge,
          mutate(par){
            let genes=par.genes.slice();
            _.shuffle(geneIndexes);
            let a= geneIndexes[0],
                b= geneIndexes[1],
                tmp= genes[a];
            genes[a]=genes[b];
            genes[b]=tmp;
            return Chromosome(genes,getFit(genes));
          },
          create(){
            return _.shuffle(geneSet.slice())
          }
        }
        let best = cycle(getFit, SQ, optimal, geneSet, extra);
        console.log("total cycles= "+extra.cycles);
        for(let i=0;i<N;++i){
          let row=best.genes.slice(i*N, (i+1)*N);
          console.log(row.join(" "));
        }
      }
    }
    //CH8.test(3,500);

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Solve Knapsack problem.
     * @memberof module:mcfud/algo_go
     * @class
     */
    class CH9{
      static Fitness(totalWeight, totalVolume, totalValue){
        return{
          totalWeight, totalVolume, totalValue,
          prn(){
            return `totalWeight=${this.totalWeight}, totalVolume=${this.totalVolume}, totalValue=${this.totalValue}`
          },
          eq(b){
            return this.totalWeight==b.totalWeight &&
              this.totalVolume==b.totalVolume &&
              this.totalValue==b.totalValue;
          },
          gt(b){
            if(this.totalValue != b.totalValue)
              return this.totalValue > b.totalValue;
            if(this.totalWeight != b.totalWeight)
              return this.totalWeight < b.totalWeight;
            return this.totalVolume < b.totalVolume;
          }
        }
      }
      static ItemQuantity(item, quantity){
        return{
          item,quantity,
          prn(){
            return `item=${this.item.name}, qty=${this.quantity}`
          },
          eq(b){
            return this.item === b.item && this.quantity == b.quantity
          }
        }
      }
      static Resource(name, value, weight, volume){
        return{name,value,weight,volume, eq(b){
          return this===b;
        }}
      }
      static Window(min,max,size){
        return{
          min,max,size,
          slide(){
            this.size = this.size>this.min? this.size - 1: this.max;
          }
        }
      }
      static test(){
        let items=[ CH9.Resource("Flour", 1680, 0.265, 0.41),
                    CH9.Resource("Butter", 1440, 0.5, 0.13),
                    CH9.Resource("Sugar", 1840, 0.441, 0.29) ];
        let MaxWeight = 10, MaxVolume = 4;
        let window = CH9.Window(1, int(Math.max(1, items.length/3)), int(items.length/2));
        items.sort((a,b)=> a.value<b.value?-1:1);
        let optimal = getFit([CH9.ItemQuantity(items[0], 1),
                              CH9.ItemQuantity(items[1], 14),
                              CH9.ItemQuantity(items[2], 6)]);
        //console.log(optimal.prn())
        function getFit(genes){
          let c,totalWeight = 0, totalVolume = 0, totalValue = 0;
          genes.forEach(g=>{
            c= g.quantity;
            totalWeight += g.item.weight * c;
            totalVolume += g.item.volume * c;
            totalValue += g.item.value * c;
          });
          return CH9.Fitness(totalWeight, totalVolume, totalValue);
        }
        function maxQ(item, maxWeight, maxVolume){
          return int(Math.min(maxWeight/item.weight, maxVolume/item.volume)) }
        function add(genes, items, maxWeight, maxVolume){
          let item;
          while(1){
            item= _.randItem(items);
            for(let g,j=0;j<genes.length;++j){
              g=genes[j];
              if(g.item===item){
                item=null;
                break;
              }
            }
            if(item) break;
          }
          let m= maxQ(item, maxWeight, maxVolume);
          return m>0? CH9.ItemQuantity(item, m) : null;
        }
        function create(){
          let genes = [],
              remainWeight=MaxWeight,
              remainVolume = MaxVolume,
              n=_.randInt2(1,items.length);
          for(let g,i=0;i<n;++i){
            g = add(genes, items, remainWeight, remainVolume);
            if(g){
              genes.push(g);
              remainWeight -= g.quantity * g.item.weight;
              remainVolume -= g.quantity * g.item.volume;
            }
          }
          return genes;
        }
        function mutate(par){
          let genes=par.genes.slice();
          let fitness = getFit(genes),
              remainWeight = MaxWeight - fitness.totalWeight,
              remainVolume = MaxVolume - fitness.totalVolume,
              removing = genes.length>1 &&  _.randInt2(0, 10) == 0;
          let g,item,index;
          window.slide();
          if(removing){
            index = _.randInt(genes.length);
            g = genes[index];
            item = g.item;
            remainWeight += item.weight * g.quantity;
            remainVolume += item.volume * g.quantity;
            genes.splice(index,1);
          }
          if((remainWeight>0 || remainVolume>0) &&
             (genes.length == 0 || (genes.length < items.length && _.randInt2(0, 100) == 0))){
            let n= add(genes, items, remainWeight, remainVolume);
            if(n){
              genes.push(n);
              return Chromosome(genes,getFit(genes));
            }
          }
          index = _.randInt(genes.length);
          g = genes[index];
          item = g.item;
          remainWeight += item.weight * g.quantity;
          remainVolume += item.volume * g.quantity;
          if(genes.length < items.length && _.randInt2(0, 4) == 0){
            let itemIndex = items.indexOf(g.item);
            let start = Math.max(1, itemIndex - window.size);
            let stop = Math.min(items.length - 1, itemIndex + window.size);
            item = items[_.randInt2(start, stop)];
          }
          let mQ= maxQ(item, remainWeight, remainVolume);
          if(mQ > 0){
            genes[index] = CH9.ItemQuantity(item, window.size>1?mQ: _.randInt2(1, mQ));
          }else{
            genes.splice(index,1);
          }
          return Chromosome(genes, getFit(genes));
        }
        let extra={
          maxAge:50,
          mutate,
          create,
          cycles:0
        };
        let best = cycle(getFit, null, optimal, null, extra);
        console.log("total cycles = "+ extra.cycles);
      }
    }
    //CH9.test();

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Solving Linear Equations.
     * @memberof module:mcfud/algo_go
     * @class
     */
    class CH10{
      static Window(min, max, size){
        return{
          min,max,size,
          slide(){
            this.size = this.size>this.min? this.size-1 : this.max;
          }
        }
      }
      static Fitness(totalDifference){
        return{
          totalDifference,
          prn(){ return `${this.totalDifference}` },
          eq(b){ return this.totalDifference==b.totalDifference},
          gt(b){ return this.totalDifference < b.totalDifference }
        }
      }
      static test(numUnknowns){
        let geneSet = [-5,-4,-3,-2,-1,1,2,3,4];
        function fnGenesToInputs(genes){ return [genes[0], genes[1]] }
        function e1(genes){
          let [x, y] = fnGenesToInputs(genes);
          return x + 2 * y - 4;
        }
        function e2(genes){
          let [x, y] = fnGenesToInputs(genes);
          return 4 * x + 4 * y - 12;
        }
        let EQS=[ `x + 2 * y - 4 `, `4 * x + 4 * y - 12` ,""];
        let equations= [e1,e2];
        let MaxAge=50;
        let window = CH10.Window(Math.max(1, int(geneSet.length /(2 * MaxAge))),
                                 Math.max(1, int(geneSet.length / 3)), int(geneSet.length / 2));
        let geneIndexes = _.fill(numUnknowns,(i)=>i);
        let sortedGeneset = geneSet.sort();
        let optimal= CH10.Fitness(0);
        function getFit(genes){
          let v= equations.reduce((acc,e)=>{
            acc += Math.abs(e(genes));
            return acc;
          },0);
          return CH10.Fitness(v);
        }
        function mutate(par){
          let genes=par.genes.slice();
          let indexes;
          if(_.randInt2(0,10)==0)
            indexes=_.randSample(geneIndexes, _.randInt2(1,genes.length));
          else
            indexes=[_.randItem(geneIndexes)];
          window.slide();
          while(indexes.length>0){
            let index = indexes.pop();
            let genesetIndex = sortedGeneset.indexOf(genes[index]);
            let start = Math.max(0, genesetIndex - window.size);
            let stop = Math.min(sortedGeneset.length - 1, genesetIndex + window.size);
            genesetIndex = _.randInt2(start, stop);
            genes[index] = sortedGeneset[genesetIndex];
          }
          return Chromosome(genes, getFit(genes));
        }
        let extra={
          maxAge:MaxAge,
          mutate
        };
        let best = cycle(getFit, numUnknowns, optimal, geneSet, extra);
        console.log("total cycles= "+ extra.cycles);
        console.log("fitness= " + best.fitness.prn());
        console.log(best.genes.join(","));
        console.log(EQS.join("=0\n"));
      }
    }
    //CH10.test(2);

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Solving Suduko.
     * @memberof module:mcfud/algo_go
     * @class
     */
    class CH11{
      static Rule(it, other){
        let r={
          eq(b){ return this.index == b.index && this.otherIndex == b.otherIndex; }
        };
        if(it > other){
          r.index = other; r.otherIndex = it;
        }else{
          r.index = it; r.otherIndex = other;
        }
        return r;
      }
      static test(){
        let geneSet = _.fill(9,(i)=>i+1);
        let optimal= wrapNumObjGtr(100);
        function indexRow(index){ return int(index / 9)}
        function indexColumn(index){ return index % 9 }
        function rowColumnSection(row, column){ return int(row / 3) * 3 + int(column / 3) }
        function indexSection(index){ return rowColumnSection(indexRow(index), indexColumn(index)) }
        function sectionStart(index){ return int((indexRow(index) % 9) / 3) * 27 + int(indexColumn(index) / 3) * 3 }
        function buildValidationRules(){
          let i,j,rules = [];
          for(i=0;i<80;++i){
            let itsRow = indexRow(i);
            let itsColumn = indexColumn(i);
            let itsSection = rowColumnSection(itsRow, itsColumn);
            for(j=i+1;j<81;++j){
              let otherRow = indexRow(j);
              let otherColumn = indexColumn(j);
              let otherSection = rowColumnSection(otherRow, otherColumn);
              if(itsRow == otherRow ||
                 itsColumn == otherColumn || itsSection == otherSection)
                rules.push(CH11.Rule(i, j));
            }
          }
          rules.sort((a,b)=>{
            let x=a.otherIndex*100+a.index;
            let y=b.otherIndex*100+b.index;
            return x<y?-1:(x>y?1:0);
          });
          //console.log(JSON.stringify(rules));
          return rules;
        }
        let validationRules = buildValidationRules();
        function fRule(genes){
          for(let r,i=0;i<validationRules.length;++i){
            r=validationRules[i];
            if(genes[r.index]==genes[r.otherIndex])
              return r;
          }
        }
        function getFit(genes){
          let f=100, R= fRule(genes);
          if(R){
            f= (1 + indexRow(R.otherIndex)) * 10  + (1 + indexColumn(R.otherIndex));
          }
          return wrapNumObjGtr(f);
        }
        function shuffleInPlace(genes, first, last){
          while(first < last){
            let index = _.randInt2(first, last);
            let tmp=genes[first];
            genes[first]=genes[index];
            genes[index] = tmp;
            first += 1;
          }
        }
        function mutate(par){
          let genes=par.genes.slice();
          let selectedRule = fRule(genes);
          if(!selectedRule)
            return Chromosome(genes, getFit(genes));
          if(indexRow(selectedRule.otherIndex) % 3 == 2 && _.randInt2(0, 10) == 0){
            let sectStart = sectionStart(selectedRule.index);
            let current = selectedRule.otherIndex;
            while(selectedRule.otherIndex == current){
              shuffleInPlace(genes, sectStart, 80);
              selectedRule = fRule(genes);
            }
            return Chromosome(genes, getFit(genes));
          }
          let row = indexRow(selectedRule.otherIndex);
          let start = row * 9;
          let a = selectedRule.otherIndex;
          let b = _.randInt2(start, genes.length);
          let tmp=genes[a];
          genes[a]=genes[b];
          genes[b] = tmp;
          return Chromosome(genes, getFit(genes));
        }
        let extra={
          maxAge:50,
          mutate,
          create(){
            return _.shuffle(_.fill(9,0).map(x=> _.fill(9,(i)=>i+1)).flat())
          }
        }
        let best = cycle(getFit, null, optimal, null, extra);
        console.log("total cycles= "+ extra.cycles);
        console.log(_.partition(9, best.genes).forEach(r=> console.log(r.join(","))));
      }
    }
    //CH11.test();

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Solving Suduko.
     * @memberof module:mcfud/algo_go
     * @class
     */
    class CH12{
      static test(){
        let optimalSeq= "ABCDEFGH".split("");
        let geneSet = optimalSeq.slice();
        let idToLocationLookup ={
            "A": [4, 7],
            "B": [2, 6],
            "C": [0, 5],
            "D": [1, 3],
            "E": [3, 0],
            "F": [5, 1],
            "G": [7, 2],
            "H": [6, 4]
        };
        function getFit(genes){
          let d = getDist(idToLocationLookup[genes[0]],
                          idToLocationLookup[genes[genes.length-1]]);
          for(let s,e,i=0;i<genes.length-1;++i){
            s= idToLocationLookup[genes[i]];
            e= idToLocationLookup[genes[i + 1]];
            d += getDist(s, e);
          }
          return CH12.Fitness(Math.round(d));
        }
        function getDist(a, b){
          let sideA = a[0] - b[0];
          let sideB = a[1] - b[1];
          return Math.sqrt(sideA * sideA + sideB * sideB);
        }
        function mutate(genes){
          let count = _.randInt2(2, genes.length);
          let f0 = getFit(genes);
          let f,t,a,b,n=_.fill(genes.length,(i)=>i);
          while(count > 0){
            count -= 1;
            _.shuffle(n);
            a=n[0];
            b=n[1];
            t=genes[a];
            genes[a]=genes[b];
            genes[b]=t;
            f=getFit(genes);
            if(f.gt(f0))
              return Chromosome(genes, f);
          }
          return Chromosome(genes, getFit(genes));
        }
        function Pair(a,b){
          return {
            a,b,
            id(){
              return `${a},${b}`
            }
          }
        }
        function crossOver(parentGenes, donorGenes,getFit){
          let p,pairs = new Map();
          p=Pair(donorGenes[0], _.last(donorGenes));
          pairs.set(p.id(),[p,0]);
          for(let i=0;i<donorGenes.length-1;++i){
            p=Pair(donorGenes[i], donorGenes[i + 1]);
            pairs.set(p.id(),[p,0]);
          }
          let tempGenes = parentGenes.slice();
          p=Pair(parentGenes[0], _.last(parentGenes[-1]));
          if(pairs.has(p.id())){
            //find a discontinuity
            let found = false;
            for(let i=0;i<parentGenes.length-1;++i){
              p=Pair(parentGenes[i], parentGenes[i + 1]);
              if(pairs.has(p.id())) continue;
              tempGenes = parentGenes.slice(i+1).concat(parentGenes.slice(0,i+1));
              found = true;
              break;
            }
            if(!found) return null;
          }
          let runs = [[tempGenes[0]]];
          let childGenes;
          for(let i=0;i<tempGenes.length-1;++i){
            p=Pair(tempGenes[i], tempGenes[i + 1]);
            if(pairs.has(p.id())){
              _.last(runs).push(tempGenes[i + 1]);
              continue;
            }
            runs.push([tempGenes[i + 1]]);
          }
          let initialFitness = getFit(parentGenes);
          let count = _.randInt2(2, 20);
          let runIndexes = _.fill(runs.length,(i)=>i);
          while(count > 0){
            count -= 1;
            for(let i,x=0;x<runIndexes.length;++x){
              i=runIndexes[x];
              if(runs[i].length == 1) continue;
              if(_.randInt2(0, runs.length) == 0) runs[i] = runs[i].reverse();
            }
            let xxx=_.shuffle(runIndexes,false),
                f,a=xxx[0], b=xxx[1],t=runs[a];
            runs[a]=runs[b];
            runs[b] = t;
            childGenes=[];
            for(let j=0;j<runs.length;++j){
              childGenes= childGenes.concat(runs[i]);
            }
            f=getFit(childGenes);
            if(f.gt(initialFitness)) return childGenes;
          }
          return childGenes;
        }
        let optimal= getFit(optimalSeq);
        let extra={
          maxAge:500,
          poolSize:25,
          crossOver,
          mutate,
          create(){
            return _.shuffle(geneSet.slice())
          }
        };
        let best = cycle(getFit, null, optimal, null, extra);
      }
    }

            const _$={ };
    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("../main/core"),require("./basic"),require("./sort"))
  }else{
    gscope["io/czlab/mcfud/algo/ga"]=_module
  }

})(this);


