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

//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
"use strict";
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
const Core=require("../main/core.js");
const Test=require("../main/test.js");
const {u:_,is,EventBus}=Core;
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
function tearDown(){ 0&&console.log("tearDown called()") }
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
Test.runtest(
//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
Test.deftest("Core").
  begin(env=>{
    0&&console.log("setup called()");
    env.window={
      location:{ origin: "https://www.google.com" },
      hack:911,//to test some browser related stuff
      navigator:{
        vendor: "Google Inc.",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36"
      }
    }
  }).
  ensure("srand",()=>{ return _.rand() !== _.rand() }).
  ensure("feq0",()=>{ return _.feq0(0) && !_.feq0(1) }).
  ensure("feq",()=>{ return _.feq(0,0) && !_.feq(1,9) }).
  ensure("pack,unpack",()=>{ return _.unpack(_.pack({a:{b:{c:1}}})).a.b.c===1 }).
  ensure("v2,p2",()=>{ return _.v2(2,3)[1]===3 && _.v2()[0]===0 && _.p2(3,2).x===3 && _.p2().y===0 }).
  ensure("numOrZero",()=>{ return _.numOrZero(7)===7 && _.numOrZero("yes")===0 }).
  ensure("or",()=>{ let x; return _.or(x,6)===6 && _.or(7,5)===7 && _.or(null,5)===null }).
  ensure("toNumber",()=>{ return _.toNumber("33")===33 && _.toNumber("w",5)===5 }).
  ensure("splitVerStr",()=>{
    return _.splitVerStr("3.2.1").join("") === "321" &&
           _.splitVerStr("3").join("") === "300" && _.splitVerStr("3.6").join("") === "360"
  }).
  ensure("cmpVerStr",()=>{
    return _.cmpVerStrs("3.2.1","3.0.0")===1 &&
           _.cmpVerStrs("3.2.1","3.2.1")===0 && _.cmpVerStrs("3.2.1","3.2.5")===-1
  }).
  ensure("pdef",()=>{ let x={}; return _.pdef(x) === x }).
  ensure("findFiles",()=>{
    return _.findFiles(["/a/b/c.mp3","/c.z","/v/w.wav"],[".mp3",".wav"]).length===2 &&
           _.findFiles(["/a/b/c.mp3","/c.z","/v/w.wav"],[".txt"]).length===0
  }).
  ensure("partition",()=>{
    let x= _.partition(2,[1,2,3,4,5]);
    let ok1= x.length===3 && x[0].length===2 && x[1].length===2 && x[2].length===1;
    x= _.partition(2,[]);
    let ok2= x.length===0;
    x= _.partition(2,[1]);
    let ok3= x.length=1 && x[0].length===1;
    return ok1 && ok2 && ok3;
  }).
  ensure("keys",()=>{
    return _.keys({a:1,b:2}).length===2 &&
           _.keys(new Map([["a",1],["b",2]])).length===2 && _.keys(3).length===0;
  }).
  ensure("selectNotKeys",()=>{
    let o=_.selectNotKeys({a:1,c:2,x:3,y:4},"a,c");
    let ok1= o.a===undefined && o.c===undefined && o.x===3 && o.y===4;
    o=_.selectNotKeys(new Map([["a",1],["x",3],["c",2],["z",4]]),["x","z"]);
    let ok2= o.get("x")===undefined && o.get("z")===undefined && o.get("a")===1 && o.get("c")===2;
    return ok1&&ok2;
  }).
  ensure("selectKeys",()=>{
    let o=_.selectKeys({a:1,c:2,x:3,y:4},"a,c");
    let ok1= o.a===1 && o.c===2 && Object.keys(o).length===2;
    o=_.selectKeys(new Map([["a",1],["x",3],["c",2],["z",4]]),["x","z"]);
    let ok2= o.get("x")===3 && o.get("z")===4 && o.size===2;
    return ok1&&ok2;
  }).
  eerror("assertNot",()=>{ _.assertNot(true,"Oh!") }).
  eerror("assert",()=>{ _.assert(false,"Oh!") }).
  ensure("noSuchKeys",()=>{
    return _.noSuchKeys("x,t,g",{a:1,c:2,f:4}) && !_.noSuchKeys("a,c",{a:1,c:2,f:4})
  }).
  ensure("randInt2",()=>{
    let t=0,N=1000;
    for(let x,i=0;i<N;++i){
      x=_.randInt2(10,17);
      if(x >= 10 && x <= 17)t++;
    }
    return t===N;
  }).
  ensure("randFloat",()=>{
    let t=0,N=1000;
    for(let x,i=0;i<N;++i){
      x=_.randFloat(10,17);
      if(x >= 10 && x < 17)t++;
    }
    return t===N;
  }).
  ensure("randMinus1To1",()=>{
    let t=0,N=1000;
    for(let x,i=0;i<N;++i){
      x=_.randMinus1To1();
      if(x > -1 && x < 1)t++;
    }
    return t===N;
  }).
  ensure("randInt",()=>{
    let t=0,N=1000;
    for(let x,i=0;i<N;++i){
      x=_.randInt(999);
      if(x >=0 && x < 999)t++;
    }
    return t===N;
  }).
  ensure("randSign",()=>{
    let t=0,N=1000;
    for(let x,i=0;i<N;++i){
      x=_.randSign();
      if(x === 1 || x=== -1)t++;
    }
    return t===N;
  }).
  ensure("inst",()=>{
    return _.inst(String,new String()) && !_.inst(Number,new Array()) && _.inst(Array,[])
  }).
  ensure("hashCode",()=>{
    return _.hashCode("hello")===_.hashCode("hello") && _.hashCode("bonjour") !== _.hashCode("caio");
  }).
  ensure("randItem",()=>{
    let arr= [1,2,3,4,5,6,7,8,9];
    let t=0,N=1000;
    for(let x,i=0;i<N;++i){
      x=_.randItem(arr);
      if(x>=1 && x<=9)t++;
    }
    return t===N;
  }).
  ensure("isPerc",()=>{
    return !_.isPerc("dasdas") && _.isPerc("77%") && _.isPerc("0.9%");
  }).
  ensure("isEven",()=>{
    return !_.isEven(7) && _.isEven(102) && _.isEven(92)
  }).
  ensure("jsMap",()=>{
    let x= _.jsMap("a",1,"b",2);
    let y=_.jsMap();
    return x.get("a")===1&&x.get("b")===2 && y.size===0;
  }).
  ensure("jsObj",()=>{
    let x= _.jsObj("a",1,"b",2);
    let y=_.jsObj();
    return x.a===1&&x.b===2 && Object.keys(y).length===0;
  }).
  ensure("jsVec",()=>{
    let x= _.jsVec("a",1,"b",2);
    let y=_.jsVec();
    return x.length===4 && y.length===0;
  }).
  ensure("lastIndex",()=>{
    return _.lastIndex([1,2,3])===2 && _.lastIndex([]) < 0
  }).
  ensure("first,head",()=>{
    return _.first([1,2,3])===1 && _.first([]) === undefined &&
           _.head([1,2,3])===1 && _.head([]) === undefined;
  }).
  ensure("last,tail",()=>{
    return _.last([1,2,3])===3 && _.last([]) === undefined &&
           _.tail([1,2,3])===3 && _.tail([]) === undefined;
  }).
  ensure("floor,ceil",()=>{ return _.floor(3.9898)===3 && _.ceil(3.9899)===4 }).
  ensure("abs,sqrt",()=>{ return _.abs(-3)===3 && _.sqrt(25)===5 }).
  ensure("min,max",()=>{ return _.min(2,3,7,-3)===-3 && _.max(2,3,8,25)===25 }).
  ensure("slice",function(){
    return _.slice([1,2,3,4],0).join("")==="1234" &&
           _.slice([1,2,3,4],2).join("")==="34" &&
           _.slice([1,2,3,4],3).join("")==="4" &&
           _.slice([1,2,3,4],99).join("")==="" &&
           _.slice(arguments,0).join("")==="";
  }).
  ensure("every",()=>{
    return _.every([2,4,8],_.isEven) && _.every([2,2,2,2],2) && !_.every([2,4,5],_.isEven)
  }).
  ensure("notAny",()=>{
    return !_.notAny([2,4,8],_.isEven) && _.notAny([2,2,2,2],4) && _.notAny([7,49,5],_.isEven)
  }).
  ensure("copy",()=>{
    let to=[1,2,3,4];
    return _.copy(to.slice(),[0,0,0,0,0]).join("")==="0000" &&
           _.copy(to.slice()).join("")==="1234" &&
           _.copy(to.slice(),[9,8]).join("")==="9834"
  }).
  ensure("append",()=>{
    let to=[1,2];
    return _.append(to.slice(),[0,0,0,0,0]).join("")==="1200000" &&
           _.append(to.slice()).join("")==="12" &&
           _.append(to.slice(),[9,8]).join("")==="1298"
  }).
  ensure("fill",()=>{
    return _.fill(5,7).join("")==="77777" &&
           _.fill([0,0,0],3).join("")==="333" &&
           _.fill(new Array(3),()=>1).join("")==="111"
  }).
  ensure("size",()=>{
    return _.size({a:1,b:3})===2 &&
           _.size([0,0,0])===3 &&
           _.size("hello")===5 &&
           _.size(new Map([["a",3]]))===1;
  }).
  ensure("nextId",()=>{ return _.nextId() < _.nextId() }).
  ensure("now",()=>{ return _.now() <= _.now() }).
  ensure("fileExt,fileBase",()=>{
    return _.fileExt("/a/b/c/d.txt")==="txt" &&
           _.fileBase("/a/b/c/d.txt")==="d";
  }).
  ensure("range",()=>{
    return _.range(5).join("")==="01234" &&
           _.range(3,7).join("")==="3456" &&
           _.range(2,9,2).join("")==="2468";
  }).
  ensure("shuffle",()=>{
    let x=[1,2,3,4,5];
    let y=_.shuffle(x);
    while(y.join("")=="12345"){
      y=_.shuffle(x);
    }
    return x===y && y.join("") != "12345";
  }).
  ensure("uniq",()=>{
    return _.uniq([1,2,3,3,3,3,1,1,1,4,2,5,5]).join("")==="12345";
  }).
  ensure("map",()=>{
    return _.map([1,2,3],(x)=>{ return x+1 }).join("")==="234" &&
           _.map({a:1,z:2},(x)=>{ return x+1 })["a"]===2;
  }).
  ensure("find",()=>{
    return _.find([1,2,3],(x)=>{ return _.isEven(x)}).join("")==="12" &&
           _.find({a:1,b:2},(x)=>{ return _.isEven(x)}).join("")==="b2" &&
           _.find([1,2,3],(x)=>{ return false })===undefined
  }).
  ensure("some",()=>{
    return _.some([1,2,3,5],(x)=>{ if(x===3) return 3 })===3 &&
           _.some({a:1,b:2,c:3},(x)=>{ if(x===3) return 3 })===3 &&
           _.some([1,2,3],(x)=>{ return false })===undefined
  }).
  ensure("invoke",()=>{
    let sum=0;
    _.invoke([{foo:()=>{sum+=7}},{foo:()=>{sum+=9}}],"foo");
    return 16;
  }).
  ensure("rseq",()=>{
    let out=[];
    _.rseq([1,2,3],(x)=>{ out.push(x) });
    return out.join("")==="321";
  }).
  ensure("doseq",()=>{
    let out=[];
    _.doseq([1,2,3],(x)=>{ out.push(x) });
    _.doseq({a:1,b:2,c:3},(x)=>{ out.push(x) });
    _.doseq(new Map([["a",1],["b",2],["c",3]]),(x)=>{ out.push(x) });
    return out.join("")==="123123123";
  }).
  ensure("doseqEx",()=>{
    let out=[];
    _.doseq([1,null,3],(x)=>{ out.push(x) });
    _.doseq({a:1,b:null,c:3},(x)=>{ out.push(x) });
    _.doseq(new Map([["a",1],["b",2],["c",null]]),(x)=>{ out.push(x) });
    return out.join("")==="131312";
  }).
  ensure("dissoc",()=>{
    let x,y;
    _.dissoc(x={a:1,b:2},"a");
    _.dissoc(y=new Map([["a",1],["b",2]]),"b");
    return x.a===undefined && x.b===2 && y.get("a")===1 && y.get("b")===undefined;
  }).
  ensure("get",()=>{
    return _.get({a:1,b:2},"a")===1 &&
           _.get(new Map([["a",1],["b",2]]),"b")===2;
  }).
  ensure("assoc",()=>{
    let x,y;
    return _.assoc(x={a:1,b:2},"a",7)===1 &&
           _.assoc(y=new Map([["a",1],["b",2]]),"b",5)===2 && x.a===7 && y.get("b")===5;
  }).
  ensure("disj,conj",()=>{
    let x;
    return _.disj(x=[1,3,"a",4],"a") && x.length===3 && _.conj([1],2,3,4).length===4;
  }).
  ensure("seq",()=>{
    return _.seq("1,2,3;4, 5").length===5 && _.seq([1,2]).length===2;
  }).
  ensure("has",()=>{
    return _.has([1,2,3],3) && _.has({a:1,b:2},"a") && _.has(new Map([["x",1]]),"x") && !_.has([1],2);
  }).
  ensure("patch",()=>{
    let x,y;
    return _.patch(x={a:1},{a:2,b:3}).a===1 && x.b===3 &&
           (y=_.patch(y,{a:2,b:3})).a===2 && y.b===3;
  }).
  ensure("clone",()=>{
    let x;
    return (x=_.clone({a:1,b:"x"})).a===1 && x.b=="x";
  }).
  ensure("inject",()=>{
    let x,y;
    return (y=_.inject(y,{a:3},{b:2},{b:3,c:4})).a===3&&y.b===3&&y.c===4 &&
           (x=_.inject({a:1},{a:3},{b:2},{b:3,c:4})).a===3&&x.b===3&&x.c===4;
  }).
  ensure("deepCopyArray",()=>{
    let x;
    return (x=_.deepCopyArray([1,[2,[3]]]))[0]===1&&x[1][0]===2&&x[1][1][0]===3;
  }).
  ensure("merge,mergeEx",()=>{
    let x,y= _.merge(x={a:1,b:[2],c:{x:1}},{a:9,b:"hi",c:{x:6,z:7}});
    let m,n= _.mergeEx(m={a:1,b:[2],c:{x:1}},{a:9,b:"hi",c:{x:6,z:7}});
    return x===y && y.a===9 && y.b=="hi" && y.c.x===6 && y.c.z===7 &&
           m !== n && n.a===9 && n.b=="hi" && n.c.x===6 && n.c.z===7;
  }).
  ensure("negate",()=>{
    function x(arg){ return _.isEven(arg) }
    return !_.negate(x)(2) && _.negate(x)(3);
  }).
  ensure("strPadRight",()=>{
    return _.strPadRight("hello",10,"7")=="hello77777" &&
           _.strPadRight("hello",3,"7")=="hello";
  }).
  ensure("strPadLeft",()=>{
    return _.strPadLeft("hello",10,"7")=="77777hello" &&
           _.strPadLeft("hello",3,"7")=="hello";
  }).
  ensure("safeSplit",()=>{
    let x;
    return (x=_.safeSplit("a/b/c////d","/")).length===4 && x[2]=="c" &&
           (x=_.safeSplit("a/b/c////d",/\//)).length===4 && x[3]=="d";
  }).
  ensure("capitalize",()=>{
    let x;
    return (x=_.capitalize("hello"))[0]=="H" && x.length===5;
  }).
  ensure("prettyNumber",()=>{
    return _.prettyNumber(117)=="117" && _.prettyNumber("9",5)=="00009";
  }).
  ensure("delay", function(){
    return new Promise((resolve,reject)=>{
      _.delay(300,()=>{
        resolve(true)
      })
    });
  }).
  ensure("timer,once", function(){
    return new Promise((resolve,reject)=>{
      _.timer(()=>{
        resolve(true)
      },300);
    });
  }).
  ensure("timer,repeat", function(){
    let count=0;
    return new Promise((resolve,reject)=>{
      let x= _.timer(()=>{
        count+=1;
        if(count>4){
          _.clear(x);
          resolve(true);
        }
      },300,true);
    });
  }).
  ensure("EventBus",()=>{
    let ok1,ok2,ok3,ok4,ok5;
    let sum=0;
    let e= EventBus(),x={foo:(a)=>sum+=a*2},y={foo:(a)=>{sum+=a}};
    //
    e.sub(["t1",x],"foo",y);
    e.pub(["t1",x],1);
    ok1=sum===1;
    //
    e.unsub(["t1",x],"foo",y);
    e.pub(["t1",x],1);
    ok2=sum===1;
    sum=0;
    //
    e.sub(["t2"],"foo",x)
    e.pub(["t2"],3);
    ok3=sum===6;
    //
    sum=0;
    e.sub(["t1",x],"foo");
    e.pub(["t1",x],1);
    ok4=sum===2;
    //
    e.reset();
    sum=0;
    e.sub(["t1,t2",x],"foo");
    e.pub(["t1",x],1);
    e.pub(["t2",x],2);
    ok5=sum===6;
    return ok1&&ok2&&ok3&&ok4&&ok5;
  }).
  ensure("dropArgs",()=>{
    function x(){ return _.dropArgs(arguments,3) }
    return x(1,2,3,8,4,7).join("")=="847" && x(1,2).join("")=="";
  }).
  ensure("isMobile,isSafari", function(){
    return !_.isMobile(this.window.navigator) && !_.isSafari(this.navigator);
  }).
  ensure("isCrossOrigin",function(){
    return _.isCrossOrigin("https://www.mozilla.com/helloworld.php",this.window) &&
           !_.isCrossOrigin("https://www.google.com/helloworld.php",this.window);
  }).end(tearDown)).then(function(r){
  Test.prn(r);
  });

//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
//EOF









