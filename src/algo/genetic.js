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
			return{ weights, numInputs: weights.length };
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
								out.push(this.sigmoid(sumInput, ACTIVATION_RESPONSE));
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
		 * @param
		 * @param
		 * @return {object}
		 */
		function Chromosome(genes, fitness){
			return {
				genes,fitness, clone(){
					return Chromosome(this.genes.slice(),this.fitness.clone())
				}
			}
		}

		/**
		 * @memberof module:mcfud/NNetGA
		 * @param
		 * @return {object}
		 */
		function NumericFitness(v){
			return{
				value:v,
				gt(b){
					return this.value > b.value
				},
				eq(b){
					return this.value==b.value
				},
				lt(b){
					return this.value < b.value
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
		 * @return {array}
		 */
		function mutateSM(genes){
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
			return genes;
		}

		/**Select two random points, grab the chunk of chromosome between them,
		 * and then reinsert at a random position displaced from the original.
		 * @memberof module:mcfud/NNetGA
		 * @param {array} genes
		 * @return {array}
		 */
		function mutateDM(genes){
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
			return genes;
		}

		/**Almost the same as the DM operator, except here only one gene is selected
		 * to be displaced and inserted back into the chromosome.
		 * @memberof module:mcfud/NNetGA
		 * @param {array} genes
		 * @return {array}
		 */
		function mutateIM(genes){
			let b,a=_.randInt(genes.length);
			let vb,va= genes[a];
			b=_.randInt(genes.length);
			while(b==a)
				b=_.randInt(genes.length);
			vb= genes[b];
			genes[b]=va;
			genes[a]=vb;
			return genes;
		}

		/**Select two random points and reverse the genes between them.
		 * @memberof module:mcfud/NNetGA
		 * @param {array} genes
		 * @return {array}
		 */
		function mutateIVM(genes){
			let [beg, end]= randSpan(genes);
			let count= end-beg-1;
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
			return genes;
		}

		/**Select two random points, reverse the city order between the two points,
		 * and then displace them somewhere along the length of the original chromosome.
		 * This is similar to performing IVM and then DM using the same start and end points.
		 * @memberof module:mcfud/NNetGA
		 * @param {array} genes
		 * @return {array}
		 */
		function mutateDIVM(genes){
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
			return genes;
		}

		/**
		 * @memberof module:mcfud/NNetGA
		 * @param {array} genes
		 * @return {array}
		 */
		function mutate(genes, mRate){
			genes.forEach((g,i)=>{
				if(_.rand() < mRate)
					genes[i] =  g + _.randMinus1To1() * MAX_PERTURBATION
			});
		}

		/**Several genes are chosen at random from one parent and
		 * then the order of those cities is imposed on
		 * the respective genes in the other parent.
		 * @memberof module:mcfud/NNetGA
		 * @param {array} mum
		 * @param {array} dad
		 * @param {number} cRate
		 * @return {array}
		 */
		function crossOverOBX(mum, dad,cRate){
			if(_.rand()>cRate){ return [mum,dad] }
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
			return [b1,b2];
		}

		/**Similar to Order-Based CrossOver, but instead of imposing the order of the genes,
		 * this imposes the position.
		 * @memberof module:mcfud/NNetGA
		 * @param {array} mum
		 * @param {array} dad
		 * @param {number} cRate
		 * @return {array}
		 */
		function crossOverPBX(mum, dad,cRate){
			if(_.rand()>cRate){ return [mum,dad] }
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
			return [b1,b2];
		}

		/**
		 * @memberof module:mcfud/NNetGA
		 * @param {array} mum
		 * @param {array} dad
		 * @param {number} cRate
		 * @return {array}
		 */
		function crossOver(mum, dad, cRate){
			let cp,b1,b2;
			if(_.rand() > cRate){
				b1 = mum;
				b2 = dad;
			}else{
				cp = _.randInt(mum.length);
				b1=mum.slice(0,cp).concat(dad.slice(cp));
				b2=dad.slice(0,cp).concat(mum.slice(cp));
			}
			return [b1,b2];
		}

		/**
		 * @memberof module:mcfud/NNetGA
		 * @param {array} mum
		 * @param {array} dad
		 * @param {number} cRate
		 * @param {array} splits
		 * @return {array}
		 */
		function crossOverAtSplits(mum, dad,cRate,splits){
			let cp,cp1,cp2,b1,b2;
			if(_.rand() > cRate){
				b1 = mum;
				b2 = dad;
			}else{
				cp = _.randInt(splits.length-2);
				cp1 = splits[cp];
				cp2 = splits[_.randInt2(cp1, splits.length-1)];
				b1= mum.slice(0,cp1).concat(dad.slice(cp1,cp2)).concat(mum.slice(cp2));
				b2= dad.slice(0,cp1).concat(mum.slice(cp1,cp2)).concat(dad.slice(cp2));
			}
			return [b1,b2];
		}

		function chromoRoulette(pop,stats){
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

		function calcStats(pop){
			let best= 0,
					worst= Infinity,
					stats={averageScore:0,totalScore:0,bestScore:0,worstScore:0,fittest:0};
			pop.forEach((c,i)=>{
				if(c.fitness.score() > best){
					best = c.fitness.score();
					stats.bestScore = best;
					stats.fittest= i;
				}else if(c.fitness.score() < worst){
					worst = c.fitness.score();
					stats.worstScore = worst;
				}
				stats.totalScore += c.fitness.score();
			});
			stats.averageScore = stats.totalScore / pop.length;
			return stats;
		}

		/**
		 * @memberof module:mcfud/NNetGA
		 * @param {array} old current generation
		 * @param {object} extra
		 * @return {array} new generation
		 */
		function runGACycle(pop,extra){
			pop.sort((a,b)=> a.fitness.lt(b.fitness)?-1:(a.fitness.gt(b.fitness)?1:0));
			let stats=calcStats(pop),
					b1,b2,res,mum,dad,vecNewPop = [];
			if(extra.NUM_ELITES !== undefined){
				for(let i=pop.length-1;i>=0;--i) vecNewPop.push(pop[i]);
			}
			while(vecNewPop.length < pop.length){
				if(extra.TOURNAMENT_COMPETITORS !== undefined){
					mum = tournamentSelection(pop,extra.TOURNAMENT_COMPETITORS);
					dad = tournamentSelection(pop,extra.TOURNAMENT_COMPETITORS);
				}else{
					mum = chromoRoulette(pop,stats);
					dad = chromoRoulette(pop,stats);
				}
				b1=mum.genes.slice();
				b2=dad.genes.slice();
				if(extra.crossOver)
					extra.crossOver(b1,b2);
				if(extra.mutate){
					extra.mutate(b1);
					extra.mutate(b2);
				}
				vecNewPop.push(Chromosome(b1, extra.calcFit(b1)), Chromosome(b2, extra.calcFit(b2)));
			}
			//trim?
			if(vecNewPop.length != _pop.length) vecNewPop.length = _pop.length;
			return vecNewPop;
		}

		//;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
		const _$={
			MAX_PERTURBATION : 0.3,
		  //NUM_ELITE = 4,
			BIAS: -1,
			ACTIVATION_RESPONSE : 1,
			//NUM_COPIES_ELITE  = 1,
			//TOURNAMENT_COMPETITORS = 4;
			NumericFitness,
			Chromosome,
			mutateSM,
			mutateDM,
			mutateIM,
			mutateIVM,
			mutateDIVM,
      crossOverOBX,
      crossOverPBX,
			runGACycle,

			SNeuron,
			SNeuralLayer,
			NeurelNet
		};

		return _$;
	}

	//export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("./core"))
  }else{
    gscope["io/czlab/mcfud/NNetGA"]=_module
  }

})(this)


