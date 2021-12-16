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
  function _module(Core,GA){
    if(!Core) Core= gscope["io/czlab/mcfud/core"]();
    if(!GA) GA= gscope["io/czlab/mcfud/algo/ga"]();
    const int=Math.floor;
    const {is,u:_}= Core;
    const {wrapNumObjGtr,wrapNumObjLsr,cycle,Chromosome,swapGeneAt}= GA;

    /**
     * @module mcfud/algo_gaex
     */

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function showBest(best,extra){ return GA.showBest(best,extra) }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Guess a password.
     * @memberof module:mcfud/algo_gaex
     * @class
     */
    class CH1{
      static test(input){
        let geneSet = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!.,".split("");
        let gs=geneSet.slice();
        let target=input.split(""),
            N=target.length,
            optimal= wrapNumObjGtr(N);
        function create(){ return _.shuffle(gs).slice(0,N) }
        function calcFit(guess){
          let sum=0;
          for(let i=0;i<N;++i)
            if(target[i]==guess[i]) ++sum;
          return wrapNumObjGtr(sum);
        }
        function mutate(c){
          let i= _.randInt(c.length);
          for(let z;;){
            z=_.randItem(gs);
            if(z!= c[i]){
              c[i]=z;
              break;
            }
          }
        }
        let extra= {calcFit,create,mutate,optimal,cycles:0};
        let best= GA.cycle(geneSet,extra);
        showBest(best,extra);
        console.log(best.genes.join(""));
      }
    }
    //CH1.test("Hello World!");

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Sort numbers.
     * @memberof module:mcfud/algo_gaex
     * @class
     */
    class CH3{
      static test(totalNumbers){
        function Fitness(numbersInSeqCnt, totalGap){
          return {
            numbersInSeqCnt, totalGap,
            toString(){
              return `${this.numbersInSeqCnt} Sequential, ${this.totalGap} Total Gap`
            },
            eq(b){
              return this.totalGap==b.totalGap &&
                     this.numbersInSeqCnt==b.numbersInSeqCnt;
            },
            gt(b){
              if(this.numbersInSeqCnt != b.numbersInSeqCnt)
                  return this.numbersInSeqCnt > b.numbersInSeqCnt;
              return this.totalGap < b.totalGap;
            }
          }
        }
        function calcFit(genes){
          let fitness = 1, gap = 0;
          for(let i=1;i<genes.length;++i){
            if(genes[i] > genes[i-1])
              fitness += 1;
            else
              gap += genes[i-1] - genes[i];
          }
          return Fitness(fitness, gap);
        }
        function create(){
          return _.shuffle(geneSet,false).slice(0,totalNumbers)
        }
        let optimal= Fitness(totalNumbers, 0);
        let geneSet = _.fill(100,(i)=> i);
        let extra={ calcFit,create,optimal };
        let best= cycle(geneSet,extra);
        showBest(best,extra);
        console.log(best.genes.join(","));
      }
    }
    //CH3.test(50);

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Solve 8 queens.
     * @memberof module:mcfud/algo_gaex
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
          toString(){
            return board.reduce((acc,r)=>{
              return acc + r.join(" ") + "\n"
            },"")
          }
        }
      }
      static test(N){
        function Fitness(clashQ){
          return {
            gt(b){ return this.value < b.value },
            eq(b){ return this.value==b.value},
            toString(){ return `${this.value}` },
            value:clashQ
          }
        }
        function calcFit(genes){
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
          return Fitness(N*4 - ROWS.size - COLS.size - NE.size - SE.size)
        }
        let geneSet = _.fill(N, (i)=> i);
        let extra= {
          optimal:Fitness(0),
          calcFit,
          create(){
            return _.shuffle(geneSet,false).concat(_.shuffle(geneSet,false))
          }
        }
        let best=cycle(geneSet, extra);
        showBest(best,extra);
        console.log(CH4.Board(best.genes, N));
      }
    }
    //CH4.test(8);

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Solve Graph coloring.
     * @memberof module:mcfud/algo_gaex
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
        function calcFit(genes){
          let sum=0;
          Rules.forEach((r,k)=>{
            if(r.isValid(genes, NodeIndex)) ++sum;
          })
          return wrapNumObjGtr(sum);
        }
        let extra={calcFit,optimal,create(){
          return _.fill(keys.length,0).map(x=> _.randItem(geneSet))
        }};
        let best=cycle(geneSet, extra);
        showBest(best,extra);
        keys.forEach((k,i)=>{
          console.log(`${k} is ${Colors.get(best.genes[i])}`);
        });
      }
    }
    //CH5.test();

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Solve a card problem.
     * @memberof module:mcfud/algo_gaex
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
          eq(b){
            return this.group1Sum==b.group1Sum &&
            this.group2Product==b.group2Product &&
            this.duplicateCount==b.duplicateCount &&
            this.sumDifference==b.sumDifference &&
            this.productDifference==b.productDifference &&
            this.totalDifference==b.totalDifference;
          },
          gt(b){
            if(this.duplicateCount != b.duplicateCount)
              return this.duplicateCount < b.duplicateCount;
            return this.totalDifference < b.totalDifference;
          },
          toString(){
            return `dupCount= ${this.duplicateCount}, totalDiff=${this.totalDifference}`
          }
        }
      }
      static test(){
        let optimal= CH6.Fitness(36, 360, 0);
        //A,2-10
        let geneSet = _.fill(10,(i)=>i+1);
        function calcFit(genes){
          let g1Sum = 0,
              g2Prod = 1,
              duplicates = genes.length - new Set(genes).size;
          for(let i=0;i<5;++i) g1Sum += genes[i];
          for(let i=5;i<10;++i) g2Prod *= genes[i];
          return CH6.Fitness(g1Sum, g2Prod, duplicates);
        }
        function mutate(genes){
          if(genes.length == new Set(genes).size){
            let ix=_.fill(genes.length,(i)=> i);
            for(let i=0,count = _.randInt2(1, 4); i<count;++i){
              _.shuffle(ix);
              swapGeneAt(genes,ix[0],ix[1]);
            }
          }else{
            genes[_.randInt(genes.length)] = geneSet[_.randInt(geneset.length)];
          }
          return Chromosome(genes, calcFit(genes));
        }
        let extra={calcFit,mutate,optimal,create(){
          return _.shuffle(geneSet,false)
        }};
        let best=cycle(geneSet, extra);
        showBest(best,extra);
        console.log(best.genes.slice(0,5).join(",") + " - " + best.genes.slice(5).join(","));
      }
    }
    //CH6.test();

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Solve Knight's problem.
     * @memberof module:mcfud/algo_gaex
     * @class
     */
    class CH7{
      static Position(x, y){
        return {x,y, id(){ return `${x},${y}` }}
      }
      static Board(genes, N){
        //console.log(JSON.stringify(genes.slice(0,7)));
        //console.log(JSON.stringify(genes.slice(7)));
        let board=_.fill(N,()=> _.fill(N,"."));
        genes.forEach(p=> board[p.y][p.x]="N");
        return{
          toString(){
            return board.reduce((acc,r)=>{
              return acc + r.join(" ") + "\n"
            },"")
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
          return Array.from(out.values());
        }
        function calcFit(genes){
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
        function mutate(genes){
          let cnt= _.randInt(10)==0 ? 2 : 1;
          let KI,unattacked,posToKIndexes,potentialKPos;
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
        }
        let extra={
          calcFit,
          optimal,
          mutate,
          create(){
            return _.fill(expectedK, ()=> _.randItem(nonEdgePos))
          }
        };
        let best = cycle(null,extra);
        showBest(best,extra);
        console.log(CH7.Board(best.genes,N));
      }
    }
    //CH7.test(8,14);

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Solve Magic Square.
     * @memberof module:mcfud/algo_gaex
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
        function calcFit(genes){
          let [rows, cols, ne, se]= CH8.getSums(genes, N),
              sums=rows.concat(cols).concat([se,ne]).filter(s=> s != expected);
          return wrapNumObjLsr(sums.reduce((acc,v)=>{
            acc += Math.abs(v-expected);
            return acc;
          },0));
        }
        let extra={
          calcFit,
          optimal,
          maxAge,
          mutate(genes){
            _.shuffle(geneIndexes);
            swapGeneAt(genes, geneIndexes[0], geneIndexes[1]);
          },
          create(){
            return _.shuffle(geneSet.slice())
          }
        }
        let best = cycle(geneSet, extra);
        showBest(best,extra);
        for(let i=0;i<N;++i){
          let row=best.genes.slice(i*N, (i+1)*N);
          console.log(row.join(" "));
        }
      }
    }
    //CH8.test(5,500);

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Solve Knapsack problem.
     * @memberof module:mcfud/algo_go
     * @class
     */
    class CH9{
      static Fitness(totalWeight, totalVolume, totalValue){
        return{
          totalWeight, totalVolume, totalValue,
          toString(){
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
          toString(){
            return `{item=${this.item.name}, qty=${this.quantity}}`
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
        let geneSet=[CH9.Resource("Flour", 1680, 0.265, 0.41),
                     CH9.Resource("Butter", 1440, 0.5, 0.13),
                     CH9.Resource("Sugar", 1840, 0.441, 0.29) ];
        let MaxWeight = 10, MaxVolume = 4;
        let window = CH9.Window(1, int(Math.max(1, geneSet.length/3)), int(geneSet.length/2));
        let optimal = calcFit([CH9.ItemQuantity(geneSet[0], 1),
                               CH9.ItemQuantity(geneSet[1], 14),
                               CH9.ItemQuantity(geneSet[2], 6)]);
        geneSet.sort((a,b)=> a.value<b.value?-1:1);
        //console.log(optimal.toString())
        function calcFit(genes){
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
              n=_.randInt2(1,geneSet.length);
          for(let g,i=0;i<n;++i){
            g = add(genes, geneSet, remainWeight, remainVolume);
            if(g){
              genes.push(g);
              remainWeight -= g.quantity * g.item.weight;
              remainVolume -= g.quantity * g.item.volume;
            }
          }
          return genes;
        }
        function mutate(genes){
          let fitness = calcFit(genes),
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
             (genes.length == 0 || (genes.length < geneSet.length && _.randInt2(0, 100) == 0))){
            let n= add(genes, geneSet, remainWeight, remainVolume);
            if(n){
              genes.push(n);
              return;
            }
          }
          index = _.randInt(genes.length);
          g = genes[index];
          item = g.item;
          remainWeight += item.weight * g.quantity;
          remainVolume += item.volume * g.quantity;
          if(genes.length < geneSet.length && _.randInt2(0, 4) == 0){
            let itemIndex = geneSet.indexOf(g.item);
            let start = Math.max(1, itemIndex - window.size);
            let stop = Math.min(geneSet.length - 1, itemIndex + window.size);
            item = geneSet[_.randInt2(start, stop)];
          }
          let mQ= maxQ(item, remainWeight, remainVolume);
          if(mQ > 0){
            genes[index] = CH9.ItemQuantity(item, window.size>1?mQ: _.randInt2(1, mQ));
          }else{
            genes.splice(index,1);
          }
        }
        let extra={
          maxAge:50,
          mutate,
          create,
          optimal,
          calcFit
        };
        let best = cycle(null,extra);
        showBest(best,extra);
        best.genes.forEach(g=>{
          console.log(`item=${g.item.name}, quantity=${g.quantity}`)
        });
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
          toString(){ return `${this.totalDifference}` },
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
        let optimal= CH10.Fitness(0);
        function calcFit(genes){
          let v= equations.reduce((acc,e)=>{
            acc += Math.abs(e(genes));
            return acc;
          },0);
          return CH10.Fitness(v);
        }
        function mutate(genes){
          let indexes;
          if(_.randInt2(0,10)==0)
            indexes=_.randSample(geneIndexes, _.randInt2(1,genes.length));
          else
            indexes=[_.randItem(geneIndexes)];
          window.slide();
          while(indexes.length>0){
            let index = indexes.pop();
            let genesetIndex = geneSet.indexOf(genes[index]);
            let start = Math.max(0, genesetIndex - window.size);
            let stop = Math.min(geneSet.length - 1, genesetIndex + window.size);
            genesetIndex = _.randInt2(start, stop);
            genes[index] = geneSet[genesetIndex];
          }
          return Chromosome(genes, calcFit(genes));
        }
        let extra={
          maxAge:MaxAge,
          optimal,
          mutate,
          calcFit,
          create(){
            return _.shuffle(geneSet.slice()).slice(0,numUnknowns)
          }
        };
        let best = cycle(geneSet, extra);
        showBest(best,extra);
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
        function calcFit(genes){
          let f=100, R= fRule(genes);
          if(R){
            f= (1 + indexRow(R.otherIndex)) * 10  + (1 + indexColumn(R.otherIndex));
          }
          return wrapNumObjGtr(f);
        }
        function shuffleInPlace(genes, first, last){
          while(first < last){
            let index = _.randInt2(first, last);
            swapGeneAt(genes, first,index);
            first += 1;
          }
        }
        function mutate(genes){
          let selectedRule = fRule(genes);
          if(!selectedRule)
            return;
          if(indexRow(selectedRule.otherIndex) % 3 == 2 && _.randInt2(0, 10) == 0){
            let sectStart = sectionStart(selectedRule.index);
            let current = selectedRule.otherIndex;
            while(selectedRule.otherIndex == current){
              shuffleInPlace(genes, sectStart, 80);
              selectedRule = fRule(genes);
            }
            return ;
          }
          let row = indexRow(selectedRule.otherIndex);
          let start = row * 9;
          swapGeneAt(genes, selectedRule.otherIndex, _.randInt2(start, genes.length-1));
        }
        let extra={
          maxAge:50,
          mutate,
          calcFit,
          optimal,
          create(){
            return _.shuffle(_.fill(9,0).map(x=> _.fill(9,(i)=>i+1)).flat())
          }
        }
        let best = cycle(null,extra);
        showBest(best,extra);
        _.partition(9, best.genes).forEach(r=> console.log(r.join(",")));
      }
    }
    //CH11.test();

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Solving Travel Salesman's Problem.
     * @memberof module:mcfud/algo_go
     * @class
     */
    class CH12{
      static test(){
        function Fitness(totalDistance){
          return{
            totalDistance,
            eq(b){ return this.totalDistance==b.totalDistance },
            gt(b){ return this.totalDistance < b.totalDistance },
            toString(){ return `${this.totalDistance}` }
          }
        }
        function getDist(locationA, locationB){
          let sideA = locationA[0] - locationB[0];
          let sideB = locationA[1] - locationB[1];
          return Math.sqrt(sideA * sideA + sideB * sideB);
        }
        function calcFit(genes){
          let d = getDist(idToLocationLookup[genes[0]],
                          idToLocationLookup[_.last(genes)]);
          for(let s,e,i=0;i<genes.length-1;++i){
            s= idToLocationLookup[genes[i]];
            e= idToLocationLookup[genes[i + 1]];
            d += getDist(s, e);
          }
          return Fitness(Math.round(d));
        }
        function mutate(genes){
          let count = _.randInt2(2, genes.length);
          let f0 = calcFit(genes);
          let ix= _.fill(genes.length,(i)=>i);
          while(count > 0){
            count -= 1;
            _.shuffle(ix);
            swapGeneAt(genes, ix[0],ix[1]);
            if(calcFit(genes).gt(f0))
              return;
          }
        }
        function Pair(a,b){
          if(a<b){ let t=a; a=b;b=a; }
          return{a,b,id(){return `${this.a},${this.b}`}}
        }
        function crossOver(parentGenes, donorGenes){
          let p,pairs=new Map();
          p=Pair(donorGenes[0],_.last(donorGenes));
          pairs.set(p.id(),[0,p]);
          for(let i=0;i<donorGenes.length-1;++i){
            p=Pair(donorGenes[i], donorGenes[i+1]);
            pairs.set(p.id(),[0,p]);
          }
          let hit,tempGenes = parentGenes.slice();
          p=Pair(parentGenes[0], _.last(parentGenes));
          if(pairs.has(p.id())){
            //find a discontinuity
            hit = false;
            for(let i=0;i<parentGenes.length-1;++i){
              p=Pair(parentGenes[i], parentGenes[i+1]);
              if(pairs.has(p.id())) continue;
              tempGenes = parentGenes.slice(i+1).concat(parentGenes.slice(0,i+1));
              hit = true;
              break;
            }
            if(!hit) return null;
          }
          let runs = [[tempGenes[0]]];
          for(let i=0;i<tempGenes.length-1;++i){
            p=Pair(tempGenes[i], tempGenes[i+1]);
            if(pairs.has(p.id())){
              _.last(runs).push(tempGenes[i + 1]);
              continue;
            }
            runs.push([tempGenes[i + 1]]);
          }
          let f0= calcFit(parentGenes);
          let count = _.randInt2(2, 20);
          let runIndexes= _.fill(runs.length,(i)=>i);
          let cg, rix=runIndexes.slice();
          while(count > 0){
            count -= 1;
            for(let i,x=0;x<runIndexes.length;++x){
              i=runIndexes[x];
              if(runs[i].length == 1) continue;
              if(_.randInt2(0, runs.length) == 0) runs[i] = runs[i].reverse();
            }
            if(runs.length>1){
              _.shuffle(rix);
              swapGeneAt(runs, rix[0], rix[1]);
            }
            cg=[];
            runs.forEach(r=> cg.push(...r));
            if(calcFit(cg).gt(f0)) return cg;
          }
          return cg;
        }
        let geneSet = "ABCDEFGH".split("");
        let idToLocationLookup = {
          "A": [4, 7], "B": [2, 6], "C": [0, 5], "D": [1, 3],
          "E": [3, 0], "F": [5, 1], "G": [7, 2], "H": [6, 4] };
        let extra={
          optimal: calcFit(geneSet),
          maxAge:500, poolSize:25,
          crossOver,
          calcFit,
          mutate,
          create(){ return _.shuffle(geneSet,false) }
        }
        let best = cycle(geneSet, extra);
        showBest(best,extra);
        console.log(best.genes.join(" -> "));
      }
    }
    //CH12.test();

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Solving Approximation of PI.
     * @memberof module:mcfud/algo_go
     * @class
     */
    class CH13{
      static test(){
        let bitValues=[512, 256, 128, 64, 32, 16, 8, 4, 2, 1];
        let numBits= bitValues.length;
        let geneSet = [0,1];
        let optimal= wrapNumObjGtr(3.14159);
        function calcFit(genes){
          let denominator = getDenominator(genes, bitValues);
          if(denominator == 0) return wrapNumObjGtr(0);
          let ratio = getNumerator(genes, bitValues) / denominator;
          return wrapNumObjGtr(Math.PI - Math.abs(Math.PI - ratio));
        }
        function bitsToInt(bits){
          let result = 0;
          for(let bit,i=0;i<bits.length;++i){
            bit=bits[i];
            if(bit == 0) continue;
            result += bitValues[i];
          }
          return result;
        }
        function getNumerator(genes){
          return 1 + bitsToInt(genes.slice(0,bitValues.length));
        }
        function getDenominator(genes){
          return bitsToInt(genes.slice(bitValues.length));
        }
        function mutate(genes){
          let numeratorIndex = _.randInt2(0, numBits-1);
          let denominatorIndex= _.randInt2(numBits, genes.length-1);
          genes[numeratorIndex] = 1 - genes[numeratorIndex];
          genes[denominatorIndex] = 1 - genes[denominatorIndex];
        }
        let extra={
          maxAge:250, optimal,calcFit,mutate,create(){
            return _.fill(bitValues.length*2,0).map(x=> _.randItem(geneSet))
          }};
        let best = cycle(geneSet, extra);
        showBest(best,extra);
      }
    }
    //CH13.test();

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**Solving Lawnmower problem.
     * @memberof module:mcfud/algo_go
     * @class
     */
    class CH15{
      //field contents
      static Grass = " #";
      static Mowed = " .";
      static Mower = "M";
      static Location(x, y){
        return {x,y,move(xOffset, yOffset){
          return CH15.Location(this.x + xOffset, this.y + yOffset)
        }}
      }
      static Direction(index, xOffset, yOffset, symbol){
        return{index,xOffset,yOffset,symbol,moveFrom(location, distance=1){
          return Location(location.x + distance * this.xOffset, location.y + distance * this.yOffset)
        }}
      }
      static North = CH15.Direction(0, 0, -1, "^");
      static East = CH15.Direction(1, 1, 0, ">");
      static South = CH15.Direction(2, 0, 1, "v");
      static West = CH15.Direction(3, -1, 0, "<");
      static Directions=[North,East,South,West];
      static getDirectionAfterTurnLeft90Degrees(dir){
        let newDir,newIndex = dir.index>0? dir.index-1 : CH15.Directions.length - 1;
        for(let i=0;i<CH15.Directions.length;++i){
          if(CH15.Directions[i].index==newIndex){
            newDir=CH15.Directions.[i];
            break;
          }
        }
        _.assert(newDir, "Boom");
        return newDir;
      }
      static getDirectionAfterTurnRight90Degrees(dir){
        let newIndex = dir.index< CH15.Directions.length-1? dir.index + 1 : 0;
        for(let i=0;i<CH15.Directions.length;++i){
          if(CH15.Directions[i].index==newIndex){
            newDir=CH15.Directions.[i];
            break;
          }
        }
        _.assert(newDir, "Boom");
        return newDir;
      }
      static Field(width, height, initialContent){
        return{width,height,field:_.fill(height,()=> _.fill(width,initialContent)),
          set(location, symbol){ this.field[location.y][location.x] = symbol }
          countMowed(sum=0){
            this.field.forEach(r=> r.forEach(c=>{ if(c != CH15.Grass) ++sum; }));
            return sum;
          }
        }
      }
      static ValidatingField(width, height, initialContent){
        let f= CH15.Field(width,height,initialContent);
        f.fixLocation=(location)=>{
          return (location.x >= this.width ||
            location.x < 0 || location.y >= this.height || location.y < 0)?[null,false]:[location,true]
        };
        return f;
      }
      static ToroidField(width, height, initialContent){
        let f= CH15.Field(width, height, initialContent);
        f.fixLocation=(location)=>{
          let newLocation = CH15.Location(location.x, location.y);
          if(newLocation.x < 0){
            newLocation.x += this.width;
          }else if(newLocation.x >= this.width){
            newLocation.x %= this.width;
          }
          if(newLocation.y < 0){
            newLocation.y += this.height;
          }else if(newLocation.y >= this.height){
            newLocation.y %= this.height;
          }
          return [newLocation, true]
        };
        return f;
      }
      static Mower(location, dir){
        return{location,dir,stepCount:0,
          turn_left(){
            this.stepCount += 1;
            this.dir= CH15.getDirectionAfterTurnLeft90Degrees(this.dir)
          }
          mow(field){
            let isValid,newLocation = this.dir.moveFrom(this.location);
            [newLocation, isValid] = field.fixLocation(newLocation);
            if(isValid){
              this.location = newLocation;
              this.stepCount += 1;
              field.set(this.location, this.stepCount > 9? this.stepCount: `${this.stepCount}`);
            }
          }
          jump(field, forward, right){
            let newLocation = this.dir.moveFrom(this.location, forward);
            let rightDirection = CH15.getDirectionAfterTurnRight90Degrees(this.dir);
            let isValid, newLocation = rightDirection.moveFrom(newLocation, right);
            [newLocation, isValid] = field.fixLocation(newLocation);
            if(isValid){
              this.location = newLocation;
              this.stepCount += 1;
              field.set(this.location, this.stepCount>9?this.stepCount:`${this.stepCount}`);
            }
          }
        }
      }
      static test(){
        static Fitness(totalMowed, totalInstructions, stepCount){
          return{ totalMowed, totalInstructions, stepCount,
            eq(b){
              return this.totalMowed==b.totalMowed&& this.totalInstructions==b.totalInstructions&& this.stepCount==b.stepCount;
            }
            gt(b){
              if(this.totalMowed != b.totalMowed) return this.totalMowed > b.totalMowed;
              if(this.stepCount != b.stepCount) return this.stepCount < b.stepCount;
              return this.totalInstructions < b.totalInstructions;
            }
            toString(){
              return `${this.totalMowed} mowed with ${this.totalInstructions} instructions and ${this.stepCount} steps`
            }
          }
        }
        function calcFit(genes, fnEvaluate){
          let [field, mower, _] = fnEvaluate(genes);
          return CH15.Fitness(field.countMowed(), genes.length, mower.stepCount);
        }
        function mutate(genes, geneSet, minGenes, maxGenes, maxRounds){
          let count = _.randInt2(1, maxRounds);
          let f0 = calcFit(genes);
          while(count > 0){
            count -= 1;
            if(calcFit(genes) > f0) return;
            if(genes.length == 0 || (genes.length < maxGenes && _.randInt2(0, 5) == 0)){
              genes.push(_.randItem(geneSet)());
              continue;
            }
            if(genes.length > minGenes and _.randInt2(0, 50) == 0){
              genes.splice( _.randInt2(0, genes.length-1),1);
              continue;
            }
            genes[ _.randInt2(0, genes.length-1)]= _.randItem(geneSet)();
          }
        }
        function create(geneSet, minGenes, maxGenes){
          let numGenes = _.randInt2(minGenes, maxGenes);
          return _.fill(numGenes-1,0).map(x=>  _.randItem(geneSet)());
        }
        function crossOver(parent, otherParent){
          let c= parent.slice();
          if(parent.length <= 2 or otherParent.length < 2) return c;
          let length = _.randInt2(1, parent.length - 2);
          let start = _.randInt2(0, parent.length - length-1);
          for(let i=start;i<start+length;++i) c[i] = otherParent[i];
          return c;
        }


      }
    }


    const _$={ };
    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("../main/core"),require("./ga"))
  }else{
    gscope["io/czlab/mcfud/algo/gaex"]=_module
  }

})(this);


