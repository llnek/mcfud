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

;(function(global){

	"use strict";

	/**Create the module.
   */
  function _module(Core){
    if(!Core) Core=gscope["io/czlab/mcfud/core"]();
    const int=Math.floor;
    const {u:_, is}= Core;

		/**
     * @module mcfud/NNetGA
     */

		//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
		const MAX_PERTURBATION = 0.3,
			    BIAS= -1,
			    ACTIVATION_RESPONSE = 1;

		/**
     * @typedef {object} Statistics
     * @property {number} averageScore
		 * @property {number} totalScore
		 * @property {number} bestScore
		 * @property {number} worstScore
		 * @property {object} best
     */

		/**
     * @typedef {object} FitnessObject
     * @property {function} gt greater than
     * @property {function} lt less than
		 * @property {function} eq equals
		 * @property {function} clone
		 * @property {function} score
     */

		/**
     * @typedef {object} ChromosomeObject
     * @property {number} age
     * @property {array} genes
		 * @property {FitnessObject} fitness
		 * @property {function} clone
     */

		/**
     * @typedef {object} NeuronObject
     * @property {number} numInputs number of inputs into neuron
     * @property {number[]} weights list of weights
     */

		/**
     * @typedef {object} NeuronLayerObject
     * @property {number} numNeurons number of neurons in layer
     * @property {NeuronObject[]} neurons list of neurons
     */

		/**
     * @typedef {object} NeuronNetObject
		 * @property {number} numOfWeights
		 * @property {number} numOutputs
		 * @property {number} numInputs
		 * @property {number} numHidden
		 * @property {number} neuronsPerHidden
		 * @property {NeuronLayerObject[]} layers
		 * @property {function} putWeights
		 * @property {function} getNumberOfWeights
		 * @property {function} update
		 * @property {function} sigmoid
		 * @property {function} calcSplitPoints
     */

		/**
		 * @memberof module:mcfud/NNetGA
		 * @param {number} numInputs
		 * @return {NeuronObject}
		 */
		function SNeuron(numInputs){
			//add one for bias
			let weights= _.fill(numInputs+1, ()=> _.randMinus1To1());
			return{ activation:0, error:0, weights, numInputs: weights.length };
		}

		/**
		 * @memberof module:mcfud/NNetGA
		 * @param {number} numNeurons
		 * @param {number} numInputsPerNeuron
		 * @return {NeuronLayerObject}
		 */
		function SNeuronLayer(numNeurons, numInputsPerNeuron){
			return {
				numNeurons,
				neurons: _.fill(numNeurons,()=> SNeuron(numInputsPerNeuron))
			}
		}

		/**
		 * @memberof module:mcfud/NNetGA
		 * @param {number} numInputs
		 * @param {number} numOutputs
		 * @param {number} numHidden
		 * @param {number} neuronsPerHidden
		 * @return {NeuralNetObject}
		 */
		function NeuralNet(numInputs, numOutputs, numHidden, neuronsPerHidden){
			function createNet(out){
				//make the first layer
				out.push(SNeuronLayer(numHidden>0?neuronsPerHidden:numOutputs,numInputs));
				if(numHidden>0){
					for(let i=0;i<numHidden-1;++i)
						out.push(SNeuronLayer(neuronsPerHidden, neuronsPerHidden));
					out.push(SNeuronLayer(numOutputs, neuronsPerHidden));
				}
				return [out, countWeights(out)];
			}
			function countWeights(l){
				let sum = 0
				_.doseq(l, y=>
					_.doseq(y.neurons, u=> {sum += u.weights.length}));
				return sum;
			}
			let [layers, numOfWeights]=createNet([]);
			return{
				numOfWeights,
				numOutputs,
				numInputs,
				numHidden,
				neuronsPerHidden,
				layers,
				//getWeights(){ return this.layers.map(y=> y.neurons.map(u=> u.weights.map(v=>v)).flat()).flat(); },
				putWeights(weights){
					let pos=0;
					_.doseq(this.layers, y=>
						_.doseq(y.neurons, u=>
							_.doseq(u.weights, (v,i)=> u.weights[i]= weights[pos++])));
				},
				getNumberOfWeights(){
					return this.numOfWeights;//countWeights(this.layers)
				},
				update(inputs){
					let sumInput,numInputs,idx = 0, out=[];
					if(inputs.length == this.numInputs)
						_.doseq(this.layers, (y,i)=>{
							if(i>0)
								inputs = out;
							idx  = 0;
							out= [];
							y.neurons.forEach(u=>{
								idx = 0;
								sumInput = 0;
								numInputs = u.numInputs;
								for(let k=0;k<numInputs-1;++k){
									sumInput += (u.weights[k] * inputs[idx]);
									++idx;
								}
								sumInput += (u.weights[numInputs-1] * BIAS);
								u.activation= this.sigmoid(sumInput, ACTIVATION_RESPONSE);
								out.push(u.activation);
							});
						});
					_.assert(out.length== this.numOutputs, "out length incorrect");
					return out;
				},
				sigmoid(input, response){
					return (1 / (1 + Math.exp(-input / response)))
				},
				calcSplitPoints(){
					let pts= [],
							pos = 0;
					this.layers.forEach(y=> y.neurons.forEach(u=>{
						pos += u.numInputs;
						pts.push(pos-1);
					}));
					return pts;
				}
			}
		}

		/**
		 * @memberof module:mcfud/NNetGA
		 * @param {array} genes
		 * @param {FitnessObject} fitness
		 * @return {ChromosomeObject}
		 */
		function Chromosome(genes, fitness){
			return {
				age:0,genes,fitness, clone(){
					return Chromosome(this.genes.slice(),this.fitness.clone())
				}
			}
		}

		/**
		 * @memberof module:mcfud/NNetGA
		 * @param {number} v
		 * @return {FitnessObject}
		 */
		function NumericFitness(v,flipped){
			return{
				value:v,
				gt(b){
					return flipped? this.value < b.value: this.value > b.value
				},
				eq(b){
					return this.value==b.value
				},
				lt(b){
					return flipped? this.value > b.value: this.value < b.value
				},
				score(){
					return this.value
				},
				clone(){
					return NumericFitness(v)
				}
			}
		}

		//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
		function randSpan(genes){
			let a= _.randInt(genes.length),
					b= _.randInt(genes.length);
			return a<b ? [a,b] : [b,a];
		}

		/**Choose two random points and “scramble” the genes located between them.
		 * @memberof module:mcfud/NNetGA
		 * @param {array} genes
		 */
		function mutateSM(genes, mRate){
			if(_.rand()<=mRate){
				let [beg, end] = randSpan(genes);
				let tmp,count= end-beg-1;
				switch(count){
					case -1:
					case 0:
					case 1:
						break;
					case 2:
						tmp=genes[beg+1];
						genes[beg+1]=genes[beg+2];
						genes[beg+2]=tmp;
						break;
					default:
						tmp=_.shuffle(genes.slice(beg+1,end));
						for(let k=0,i=beg+1;i<end;++i){
							genes[i]=tmp[k++];
						}
						break;
				}
			}
		}

		/**Select two random points, grab the chunk of chromosome between them,
		 * and then reinsert at a random position displaced from the original.
		 * @memberof module:mcfud/NNetGA
		 * @param {array} genes
		 */
		function mutateDM(genes,mRate){
			if(_.rand()<=mRate){
				let [beg, end]= randSpan(genes);
				let p,tmp,rem,count= end-beg-1;
				switch(count){
					case -1:
					case 0:
						break;
					default:
						tmp=genes.slice(beg+1,end);
						rem=genes.slice(0,beg+1).concat(genes.slice(end));
						p=_.randInt2(rem.length-1);
						tmp=rem.slice(0,p).concat(tmp).concat(rem.slice(p));
						_.assert(tmp.length==genes.length,"Boom");
						tmp.forEach((v,i)=> genes[i]=v);
						break;
				}
			}
		}

		/**Almost the same as the DM operator, except here only one gene is selected
		 * to be displaced and inserted back into the chromosome.
		 * @memberof module:mcfud/NNetGA
		 * @param {array} genes
		 */
		function mutateIM(genes,mRate){
			if(_.rand()<=mRate){
				let b,a=_.randInt(genes.length);
				b=_.randInt(genes.length);
				while(b==a)
					b=_.randInt(genes.length);
				_.swap(genes, a,b);
			}
		}

		/**Select two random points and reverse the genes between them.
		 * @memberof module:mcfud/NNetGA
		 * @param {array} genes
		 */
		function mutateIVM(genes,mRate){
			if(_.rand()<=mRate){
				let [beg, end]= randSpan(genes);
				let tmp,count= end-beg-1;
				switch(count){
					case -1:
					case 0:
					case 1:
						break;
					default:
						tmp=genes.slice(beg+1,end).reverse();
						for(let k=0, i=beg+1;i<end;++i){
							genes[i]=tmp[k++];
						}
						break;
				}
			}
		}

		/**Select two random points, reverse the order between the two points,
		 * and then displace them somewhere along the length of the original chromosome.
		 * This is similar to performing IVM and then DM using the same start and end points.
		 * @memberof module:mcfud/NNetGA
		 * @param {array} genes
		 */
		function mutateDIVM(genes,mRate){
			if(_.rand()<=mRate){
				let [beg, end]= randSpan(genes);
				let p,tmp,rem,count= end-beg-1;
				switch(count){
					case -1:
					case 0:
						break;
					default:
						tmp=genes.slice(beg+1,end).reverse();
						rem=genes.slice(0,beg+1).concat(genes.slice(end));
						p=_.randInt2(rem.length-1);
						tmp=rem.slice(0,p).concat(tmp).concat(rem.slice(p));
						_.assert(tmp.length==genes.length,"Boom");
						tmp.forEach((v,i)=> genes[i]=v);
						break;
				}
			}
		}

		/**Several genes are chosen at random from one parent and
		 * then the order of those cities is imposed on
		 * the respective genes in the other parent.
		 * @memberof module:mcfud/NNetGA
		 * @param {array} mum
		 * @param {array} dad
		 * @param {number} cRate
		 */
		function crossOverOBX(mum, dad,cRate){
			if(_.rand()>cRate){ return }
			let a= int(mum.length * 0.2),
					b= int(mum.length * 0.8),
					n=_.randInt2(a,b),
					xs= _.listIndexesOf(mum,true).slice(n),
					tmp= xs.map(i=> mum[i]),
					b1=[],b2=[] ,bin=new Set(tmp);
			//cross over and modify b2
			for(let i=0;i<dad.length;++i){
				if(tmp.length>0 && bin.has(dad[i])){
					b2.push(tmp.shift());
				}else{
					b2.push(dad[i]);
				}
			}
			_.assert(b2.length==dad.length,"Boom");
			//cross over and modify b1
			tmp= xs.map(i=> dad[i]);
			bin=new Set(tmp);
			for(let i=0;i<mum.length;++i){
				if(tmp.length>0 && bin.has(mum[i])){
					b1.push(tmp.shift());
				}else{
					b1.push(mum[i]);
				}
			}
			_.assert(b1.length==mum.length,"Boom");

			b1.forEach((v,i)=> mum[i]=v);
			b2.forEach((v,i)=> dad[i]=v);
		}

		/**Similar to Order-Based CrossOver, but instead of imposing the order of the genes,
		 * this imposes the position.
		 * @memberof module:mcfud/NNetGA
		 * @param {array} mum
		 * @param {array} dad
		 * @param {number} cRate
		 */
		function crossOverPBX(mum, dad,cRate){
			if(_.rand()>cRate){ return }
			let a= int(mum.length * 0.2),
					b= int(mum.length * 0.8),
					n=_.randInt2(a,b),
					xs= _.listIndexesOf(mum,true).slice(n),
					b1=[], b2=[] , bin=new Set(xs);
			//cross over and modify b2
			for(let i=0;i<dad.length;++i){
				if(bin.has(i)){
					b2.push(mum[i]);
				}else{
					b2.push(dad[i]);
				}
			}
			_.assert(b2.length==dad.length,"Boom");
			//cross over and modify b1
			for(let i=0;i<mum.length;++i){
				if(bin.has(i)){
					b1.push(dad[i]);
				}else{
					b1.push(mum[i]);
				}
			}
			_.assert(b1.length==mum.length,"Boom");

			b1.forEach((v,i)=> mum[i]=v);
			b2.forEach((v,i)=> dad[i]=v);
		}

		/**
		 * @memberof module:mcfud/NNetGA
		 * @param {array} mum
		 * @param {array} dad
		 * @param {number} cRate
		 */
		function crossOverRND(mum, dad, cRate){
			if(_.rand() <= cRate){
				let cp,b1,b2;
				cp = _.randInt(mum.length);
				b1=mum.slice(0,cp).concat(dad.slice(cp));
				b2=dad.slice(0,cp).concat(mum.slice(cp));
				b1.forEach((v,i)=> mum[i]=v);
				b2.forEach((v,i)=> dad[i]=v);
			}
		}

		function crossOverPMX(b1,b2,cRate){
			if(_.rand() <= cRate){
				let beg = _.randInt2(0, b1.length-2);
				let end = _.randInt2(beg+1, b1.length-1);
				for(let t,pos=beg; pos<=end;++pos){
					let gene1 = b1[pos];
					let gene2 = b2[pos];
					if(gene1 != gene2){
						let posGene1 = b1.indexOf(gene1);
						let posGene2 = b1.indexOf(gene2);
						_.swap(b1,posGene1,posGene2);
						posGene1 = b2.indexOf(gene1);
						posGene2 = b2.indexOf(gene2);
						_.swap(b2,posGene1,posGene2);
					}
				}
			}
		}

		function XXcrossOver(b1,b2,cRate){
			if(_.rand() <= cRate){
				let beg = _.randInt2(0, b1.length-2),
				    end = _.randInt2(beg+1, b1.length-1);
				let gene1,gene2,
					  posGene1,posGene2;
				for(let t,pos=beg; pos<=end; ++pos){
					gene1 = b1[pos];
					gene2 = b2[pos];
					if(gene1 != gene2){
						posGene1 = b1.indexOf(gene1);
						posGene2 = b1.indexOf(gene2);
						_.swap(b1,posGene1,posGene2);
						posGene1 = b2.indexOf(gene1);
						posGene2 = b2.indexOf(gene2);
						_.swap(b2,posGene1,posGene2);
					}
				}
			}
		}

		/**
		 * @memberof module:mcfud/NNetGA
		 * @param {array} mum
		 * @param {array} dad
		 * @param {number} cRate
		 * @param {array} splits
		 */
		function crossOverAtSplits(mum, dad,cRate,splits){
			if(_.rand() <= cRate){
				let cp,cp1,cp2,b1,b2;
				cp = _.randInt(splits.length-2);
				cp1 = splits[cp];
				cp2 = splits[_.randInt2(cp1, splits.length-1)];
				b1= mum.slice(0,cp1).concat(dad.slice(cp1,cp2)).concat(mum.slice(cp2));
				b2= dad.slice(0,cp1).concat(mum.slice(cp1,cp2)).concat(dad.slice(cp2));
				b1.forEach((v,i)=> mum[i]=v);
				b2.forEach((v,i)=> dad[i]=v);
			}
		}

		function chromoRoulette(pop,stats){
			let sum= stats? stats.totalScore : pop.reduce((acc,p)=>{ return acc+ p.fitness.score() },0);
			let i,prev=0,R=_.rand();
			let ps=pop.map((p)=>{ return prev= (prev+ p.fitness.score()/sum) });
			for(i=0;i<ps.length-1;++i)
				if(R >= ps[i] && R <= ps[i+1]) return pop[i]
			return pop[0];
		}

		//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
		function chromoRoulette0(pop,stats){
			let sel=0, best= 0,
					slice = _.rand() * stats.totalScore;
			for(let p,i=0;i<pop.length;++i){
				p=pop[i];
				best += p.fitness.score();
				if(best >= slice){
					sel= i;
					break;
				}
			}
			return pop[sel];
		}

		function tournamentSelection(pop,N){
			let sel= 0,
					best= -Infinity;
			for(let t,i=0;i<N;++i){
				t = _.randInt(pop.length);
				if(pop[t].fitness.score()>best){
					sel= t;
					best= pop[t].fitness.score();
				}
			}
			return pop[sel];
		}

		/**Calculate statistics on population.
		 * @memberof module:mcfud/NNetGA
		 * @param {array} pop current generation
		 * @return {object} statistics
		 */
		function calcStats(pop,flipped){
			let best= 0,
					worst= Infinity,
					stats={averageScore:0,totalScore:0,bestScore:0,worstScore:0,best:null};
			if(flipped){
				best=Infinity;
				worst=0;
			}
			pop.forEach((c,i)=>{
				if(flipped){
					if(c.fitness.score() < best){
						best = c.fitness.score();
						stats.bestScore = best;
						stats.best= c;
					}else if(c.fitness.score() > worst){
						worst = c.fitness.score();
						stats.worstScore = worst;
					}
				}else{
					if(c.fitness.score() > best){
						best = c.fitness.score();
						stats.bestScore = best;
						stats.best= c;
					}else if(c.fitness.score() < worst){
						worst = c.fitness.score();
						stats.worstScore = worst;
					}
				}
				stats.totalScore += c.fitness.score();
			});
			stats.averageScore = stats.totalScore / pop.length;
			return stats;
		}

		//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
		function markStart(extra,fld="cycles"){
			let s= extra.startTime=_.now();
			extra[fld]=0;
			return s;
		}

		//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
		function markEnd(extra){
			return extra.endTime=_.now();
		}

		//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function newChild(p1, parents, crossOver, mutate, calcFit){
      let p2= _.randInt(parents.length);
			while(parents.length>1 && p2==p1){
				p2= _.randInt(parents.length)
			}
			let c1=parents[p1].genes.slice();
			let c2=parents[p2].genes.slice();
			if(crossOver)
				crossOver(c1,c2);
      if(mutate){
        mutate(c1);
			  mutate(c2);
      }
			let f1= calcFit(c1, parents[p1].fitness);
			let f2= calcFit(c2, parents[p2].fitness);
			return f1.gt(f2)? Chromosome(c1, f1): Chromosome(c2, f2);
    }

		//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function bisectLeft(arr,e){
      let a,i=0;
      for(;i<arr.length;++i){
        a=arr[i];
        if(a.fitness.eq(e.fitness) ||
           !e.fitness.gt(a.fitness)) break;
      }
      return i;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
		function* getNextStar([start,maxMillis],extra){
			let {mutate,create,maxAge,
				   calcFit,poolSize,crossOver}=extra;
			let parent, bestParent = create();
      yield bestParent;
      let parents = [bestParent],
          history = [bestParent],
          ratio,child, index,pindex, lastParentIndex;
			poolSize=poolSize || 1;
			maxAge= maxAge || 50;
      for(let i=0;i<poolSize-1;++i){
        parent = create();
        if(parent.fitness.gt(bestParent.fitness)){
          yield (bestParent = parent);
          history.push(parent);
        }
        parents.push(parent);
      }
      lastParentIndex = poolSize - 1;
      pindex = 1;
      while(true){
				if(_.now()-start > maxMillis) yield bestParent;
        pindex = pindex>0? pindex-1 : lastParentIndex;
        parent = parents[pindex];
        child = newChild(pindex, parents, crossOver, mutate, calcFit);
        if(parent.fitness.gt(child.fitness)){
          if(maxAge===undefined){
						continue
					}
          parent.age += 1;
					if(maxAge > parent.age){
						continue
					}
          index = bisectLeft(history, child, 0, history.length);
          ratio= index / history.length;
          if(_.rand() < Math.exp(-ratio)){
            parents[pindex] = child;
            continue;
          }
          bestParent.age = 0;
          parents[pindex] = bestParent;
          continue;
        }
        if(!child.fitness.gt(parent.fitness)){
          //same fitness
          child.age = parent.age + 1;
          parents[pindex] = child;
          continue;
        }
				child.age = 0;
				parents[pindex] = child;
        if(child.fitness.gt(bestParent.fitness)){
          yield (bestParent = child);
          history.push(bestParent);
				}
      }
    }

		/**
		 * @memberof module:mcfud/NNetGA
		 * @param {FitnessObject} optimal
		 * @param {object} extra
		 * @return {array}
		 */
		function runGASearch(optimal,extra){
			let start= markStart(extra),
				  maxCycles=(extra.maxCycles|| 100),
				  maxMillis= (extra.maxSeconds || 30) * 1000,
			    imp, now, gen= getNextStar([start,maxMillis],extra);
			while(true){
				imp= gen.next().value;
				now= markEnd(extra);
				if(now-start > maxMillis){
					now=null;
					break;
				}
				if(!optimal.gt(imp.fitness)){
					break;
				}
				if(extra.cycles >= maxCycles){
					break;
				}
				extra.cycles += 1;
				//console.log(imp.genes.join(","));
			}
			return [now==null, imp]
		}

		function runGACycle(pop,extra){
			let { maxCycles, targetScore, maxSeconds }=extra;
			let maxMillis= (maxSeconds || 30) * 1000,
			    s,now, start= markStart(extra);
			maxCycles= maxCycles || 100;
			while(true){
				pop= genPop(pop, extra);
				now= markEnd(extra);
				//time out?
				if(now-start > maxMillis){
					now=null;
					break;
				}
				//pop.forEach(p=> console.log(p.genes.join("")));
				s=calcStats(pop);
				//matched?
				if(_.echt(targetScore) && s.bestScore >= targetScore){
					break;
				}
				//too many?
				if(extra.cycles>= maxCycles){
					break;
				}
				extra.cycles += 1;
			}
			return [now == null, pop];
		}

		function genPop(pop,extra){

			if(is.num(pop))
				return _.fill(pop, ()=> extra.create());

			let b1,b2,res,mum,dad,vecNewPop = [];
			let stats=calcStats(pop);
			let {calcFit, crossOver, mutate,
				   NUM_ELITES, TOURNAMENT_COMPETITORS}= extra;

			pop.sort((a,b)=> a.fitness.lt(b.fitness)?-1:(a.fitness.gt(b.fitness)?1:0));
			if(is.num(NUM_ELITES)){
				for(let k=NUM_ELITES, i=pop.length-1;i>=0;--i){
					if(k>0){
						vecNewPop.push(pop[i]);
						--k;
					}else{
						break;
					}
				}
			}

			while(vecNewPop.length < pop.length){
				if(TOURNAMENT_COMPETITORS !== undefined){
					mum = tournamentSelection(pop,TOURNAMENT_COMPETITORS);
					dad = tournamentSelection(pop,TOURNAMENT_COMPETITORS);
				}else{
					mum = chromoRoulette(pop,stats);
					dad = chromoRoulette(pop,stats);
				}
				b1=mum.genes.slice();
				b2=dad.genes.slice();
				if(crossOver)
					crossOver(b1,b2);
				if(mutate){
					mutate(b1);
					mutate(b2);
				}
				vecNewPop.push(Chromosome(b1, calcFit(b1, mum.fitness)), Chromosome(b2, calcFit(b2,dad.fitness)));
			}

			while(vecNewPop.length > pop.length){
				vecNewPop.pop();
			}

			return vecNewPop;
		}

		function hillClimb(optimizationFunction, isImprovement, isOptimal, getNextFeatureValue, initialFeatureValue,extra){
			let start= extra.startTime=_.now();
			let best = optimizationFunction(initialFeatureValue);
			//console.log("bb===="+best.genes.join(","));
			//stdout = sys.stdout sys.stdout = None
			while(!isOptimal(best)){
				let child = optimizationFunction( getNextFeatureValue(best));
				if(isImprovement(best, child)){
					best = child
					//sys.stdout = stdout
					//display(best, featureValue)
					//sys.stdout = None
				}
			}
			extra.endTime=_.now();
			return best;
		}

		function tournament(create, crossOver, compete, sortKey, numParents=10, maxGenerations=100){
			let best,bestScore,parents,pool=[];
			for(let i=0,z=1+numParents*numParents;i<z;++i){
				pool.push([create(),[0,0,0]])
			}
			bestScore = pool[0];
			function getSortKey(x){
				return sortKey(x[0],
											 x[1][CompetitionResult.Win],
											 x[1][CompetitionResult.Tie],
											 x[1][CompetitionResult.Loss]);
			}
			function getSortKeys(a,b){
				let x= getSortKey(a),
						y= getSortKey(b);
				return x<y?-1:(x>y?1:0);
			}
			let generation = 0;
			while(generation < maxGenerations){
				generation += 1;
				for(let i=0;i<pool.length;++i){
					for(let j=0;j<pool.length;++j){
						if(i == j) continue;
						let [playera, scorea] = pool[i];
						let [playerb, scoreb] = pool[j];
						let result = compete(playera, playerb);
						scorea[result] += 1;
						scoreb[2 - result] += 1;
					}
				}
				pool.sort(getSortKeys).reverse();
				if(getSortKey(pool[0]) > getSortKey([best, bestScore])){
					[best, bestScore] = pool[0];
					//display(best, bestScore[CompetitionResult.Win], bestScore[CompetitionResult.Tie], bestScore[CompetitionResult.Loss], generation)
				}
				parents=[];
				for(let i=0;i<numParents.length;++i){
					parents.push(pool[i][0]);
				}
				pool=[];
				for(let i=0;i<parents.length;++i)
					for(let j=0;j<parents.length;++j){
						if(i !== j)
							pool.push([crossOver(parents[i], parents[j]), [0, 0, 0]]);
					}
				parents.forEach(p=> pool.push([p,[0,0,0]]));
				pool.push([create(), [0, 0, 0]]);
			}
			return best;
		}


		//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
		const _$={

			MAX_PERTURBATION,
			BIAS,
			//ACTIVATION_RESPONSE : 1,

			//NUM_COPIES_ELITE  = 1,
			//TOURNAMENT_COMPETITORS = 4;
			CrossOverRate : 0.7,
			MutationRate  : 0.1,
			NumericFitness,
			Chromosome,

			mutateSM,
			mutateDM,
			mutateIM,
			mutateIVM,
			mutateDIVM,

			crossOverRND,
      crossOverOBX,
      crossOverPBX,
			crossOverPMX,
			crossOverAtSplits,

			calcStats,
			runGACycle,
			runGASearch,

			hillClimb,

			SNeuron,
			SNeuronLayer,
			NeuralNet,

			showBest(best,extra,tout){
        console.log(_.fill(80,"-").join(""));
        console.log("total time: " + _.prettyMillis(extra.endTime-extra.startTime));
				if(tout)
					console.log("time expired");
        console.log("total cycles= " + extra.cycles);
        console.log("fitness= "+ best.fitness.score());
        console.log(_.fill(80,"-").join(""));
      }
		};

		return _$;
	}

	//export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("../main/core"))
  }else{
    global["io/czlab/mcfud/NNetGA"]=_module
  }

})(this)


