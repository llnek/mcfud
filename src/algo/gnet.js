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

    const DFTS={
      NUM_HIDDEN: 1,
      BIAS:-1,
      NEURONS_PER_HIDDEN:10,
      ACTIVATION_RESPONSE: 1,
      MAX_PERTURBATION: 0.3,
      NUM_ELITE:4,
      NUM_COPIES_ELITE:1,
      TOURNAMENT_COMPETITORS :5
    }


    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    //	given a max span size and a min span size, this will calculate a
    //  random beginning and end point within the span. Used mainly in
    //  mutation and crossover operators
		function randSpan(genes){
			let a= _.randInt(genes.length),
					b= _.randInt(genes.length);
			return a<b ? [a,b] : [b,a];
		}

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    //	checks if a given integer is already contained in a vector
    //	of integers.
    function testNumber(vec, number){
      for(let i=0; i<vec.length; ++i){
        if(vec[i] == number) return true;
      }
      return false;
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
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
    function SNeuron(inputs){
      //we need an additional weight for the bias hence the +1
      return{
        activation:0,
        error:0,
        numInputs: inputs+1,
        vecWeight: _.fill(inputs+1,()=> _.randMinus1To1())
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function SNeuronLayer(neurons, inputsPerNeuron){
      return{
        numNeurons: neurons,
        vecNeurons: _.fill(neurons, ()=> new SNeuron(inputsPerNeuron))
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function CNeuralNet(inputs,outputs,hidden,numPerHidden){
      function createNet(out){
        //create the layers of the network
        if(hidden>0){
          //create first hidden layer
          out.push(SNeuronLayer(numPerHidden, inputs));
          for(let i=0; i<hidden-1; ++i)
            out.push(SNeuronLayer(numPerHidden,numPerHidden));
          //create output layer
          out.push(SNeuronLayer(outputs, numPerHidden))
        }else{
          //create output layer
          out.push(SNeuronLayer(outputs, inputs))
        }
      }
      return{
        numInputs: inputs,
        numOutputs: outputs,
        numHiddenLayers: hidden,
        neuronsPerHiddenLyr: numPerHidden,
        vecLayers: createNet([]),
        //gets the weights for the NN
        getWeights(){
          let w=[];
          for(let i=0; i<hidden+1; ++i)
            for(let j=0; j<this.vecLayers[i].numNeurons; ++j)
              for(let k=0; k<this.vecLayers[i].vecNeurons[j].numInputs; ++k){
                w.push(this.vecLayers[i].vecNeurons[j].vecWeight[k]);
              }
          return w;
        },
        //returns total number of weights in net
        getNumberOfWeights(){
          let w= 0;
          for(let i=0; i<hidden+1; ++i)
            for(let j=0; j<this.vecLayers[i].numNeurons; ++j)
              for(let k=0; k<this.vecLayers[i].vecNeurons[j].numInputs; ++k) w++;
          return w;
        },
        //replaces the weights with new ones
        putWeights(weights){
          let cWeight = 0;
          for(let i=0; i<hidden+1; ++i)
            for(let j=0; j<this.vecLayers[i].numNeurons; ++j)
              for(let k=0; k<this.vecLayers[i].vecNeurons[j].numInputs; ++k)
                this.vecLayers[i].vecNeurons[j].vecWeight[k] = weights[cWeight++];
        },
        //calculates the outputs from a set of inputs
        update(inputs){
          let outputs=[],
              cWeight = 0;
          //first check that we have the correct amount of inputs
          if(inputs.length != this.numInputs){
            console.warn("incorrect input length");
            //just return an empty vector if incorrect.
            return outputs;
          }
          for(let i=0; i<hidden+1; ++i){
            if( i > 0 ){
              inputs = outputs;
            }
            outputs.length=0;
            cWeight = 0;
            //for each neuron sum the (inputs * corresponding weights).Throw
            //the total at our sigmoid function to get the output.
            for(let j=0; j<this.vecLayers[i].numNeurons; ++j){
              let netinput = 0;
              let numInputs = this.vecLayers[i].vecNeurons[j].numInputs;
              for(let k=0; k<numInputs-1; ++k){
                //sum the weights x inputs
                netinput += this.vecLayers[i].vecNeurons[j].vecWeight[k] * inputs[cWeight++];
              }
              //add in the bias
              netinput += this.vecLayers[i].vecNeurons[j].vecWeight[numInputs-1] * BIAS;
              //we can store the outputs from each layer as we generate them.
              //The combined activation is first filtered through the sigmoid
              //function
              outputs.push(this.sigmoid(netinput, ACTIVATION_RESPONSE));
              cWeight = 0;
            }
          }
          return outputs;
        },
        //this method calculates all points in the vector of
        //weights which represent the start and end points of
        //individual neurons
        calculateSplitPoints(){
          let splits=[],
              weightCounter = 0;
          for(let i=0; i<hidden+1; ++i){
            for(let j=0; j<this.vecLayers[i].numNeurons; ++j){
              for(let k=0; k<this.vecLayers[i].vecNeurons[j].numInputs; ++k){
                ++weightCounter;
              }
              splits.push(weightCounter-1);
            }
          }
          return splits;
        },
        //sigmoid response curve
        sigmoid(activation, response){
          return 1 / ( 1 + Math.exp(-activation/response))
        }
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function SGenome(fitness, weights,age=0){
      if(arguments.length==0){
        fitness=NumericFitness(0);
        weights=[];
        age=0;
      }
      return{
        vecWeights: weights,
        fitness,
        age,
        eq(b){
          return _.equals(this.vecWeights, b.vecWeights)
        },
        clone(){
          return SGenome(this.fitness.clone(), this.vecWeights.slice(),this.age)
        }
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function CGenAlg(popSize, MutRate, CrossRate, numWeights, splits){
      let vecPop=[];
      //initialise population with chromosomes consisting of random
      //weights and all fitnesses set to zero
      for(let i=0; i<popSize; ++i){
        vecPop.push(SGenome());
        for(let j=0; j<numWeights; ++j)
          vecPop[i].vecWeights.push(_.randMinus1To1());
      }
      return{
        //this holds the positions of the split points in the genome for use
        //in our modified crossover operator
        vecSplitPoints: splits.slice(),
        //this holds the entire population of chromosomes
        vecPop,
        //size of population
        popSize,
        //amount of weights per chromo
        chromoLength: numWeights,
        //best, average, worst and total fitnesses this population (after scaling)
        bestFitness: 0,
        averageFitness: 0,
        worstFitness: Infinity,
        totalFitness: 0,
        generation: 0,
        //keeps track of the best genome
        FittestGenome: 0,
        //probability that a chromosones bits will mutate.
        //Try figures around 0.05 to 0.3 ish
        MutationRate: MutRate,
        //probability of chromosones crossing over bits
        //0.7 is pretty good
        CrossOverRate: CrossRate,
        //  variation of tournament selection described in chapter 5 of the book
        alternateTournamentSelection(sRate){
          let g1 = _.randInt2(0, this.posSize-1),
              g2 = _.randInt2(0, this.posSize-1);
          //make sure they are different
          while(g1 == g2)
            g2 = _.randInt2(0, this.posSize-1);
          //now return the chosen individual based on CTOURNAMENT
          if(_.rand() < sRate){
            if(this.vecPop[g1].fitness.gt(this.vecPop[g2].fitness)){
              return this.vecPop[g1]
            }else{
              return this.vecPop[g2]
            }
          }else{
            if(this.vecPop[g1].fitness.lt(this.vecPop[g2].fitness)){
              return this.vecPop[g1]
            }else{
              return this.vecPop[g2]
            }
          }
        },
        //  mutates a chromosome by perturbing its weights by an amount not
        //  greater than MAX_PERTURBATION
        mutate(chromo){
          //traverse the chromosome and mutate each weight dependent
          //on the mutation rate
          for(let i=0; i<chromo.length; ++i){
            if(_.rand() < MutRate)
              //add a small value to the weight
              chromo[i] += (_.randMinus1To1() * MAX_PERTURBATION);
          }
        },
        //	Mutates the chromosome by choosing two random genes and swapping
        //	their position.
        mutateEM(chromo){
          if(_.rand() > MutRate){}else{
            //choose first gene
            let pos1 = _.randInt2(0, chromo.length-1), pos2 = pos1;
            while(pos1 == pos2)
              pos2 = _.randInt2(0, chromo.length-1);
            //swap their positions
            _.swap(chromo,pos1, pos2);
          }
        },
        //	Chooses a random gene and inserts displaced back into the
        //	chromosome
        mutateIM(chromo){
          if(_.rand() > MutRate){}else{
            //choose a gene to move
            let curPos = _.randInt2(0, chromo.length-1);
                k,left,right,N=chromo.length,v = chromo[curPos];
            //remove from the chromosome
            chromo.splice(curPos,1);
            //move the iterator to the insertion location
            curPos = _.randInt2(0, chromo.length-1);
            left=chromo.slice(0,curPos);
            right=chromo.slice(curPos);
            k=0;
            left.forEach(n=> chromo[k++]=n);
            chromo[k++]=v;
            right.forEach(n=> chromo[k++]=n);
            _.assert(N==k,"bad mutation");
          }
        },
        //	chooses a random start and point then scrambles the genes
        //	between them
        mutateSM(chromo){
          if(_.rand() > MutRate){}else{
            let [beg, end] = randSpan(chromo);
            let tmp,count= end-beg-1;
            switch(count){
              case -1:
              case 0:
              case 1:
                break;
              case 2:
                tmp=chromo[beg+1];
                chromo[beg+1]=chromo[beg+2];
                chromo[beg+2]=tmp;
                break;
              default:
                tmp=_.shuffle(chromo.slice(beg+1,end));
                for(let k=0,i=beg+1;i<end;++i){
                  chromo[i]=tmp[k++];
                }
                break;
            }
          }
        },
        //	Select two random points, grab the chunk of chromosome between them
        //	and then insert it back into the chromosome in a random position
        //	displaced from the original.
        mutateDM(chromo){
          if(_.rand() > MutRate){}else{
            let [beg, end] = randSpan(chromo);
            let N=chromo.length;
            let k,l,r,pos,tmp=chromo.slice(beg,end);
            chromo.splice(beg,end-beg);
            pos = _.randInt2(0, chromo.length-1);
            l=chromo.slice(0,pos);
            r=chromo.slice(pos);
            k=0;
            l.forEach(n=> chromo[k++]=n);
            tmp.forEach(n=> chromo[k++]=n);
            r.forEach(n=> chromo[k++]=n);
            _.assert(N==k,"bad mutation");
          }
        },
        //  given parents and storage for the offspring this method performs
        //	crossover according to the GAs crossover rate
        crossOverRND(mum,dad){
          let b1,b2;
          if(_.rand() > CrossRate || mum.eq(dad)){
            b1 = mum.vecWeights.slice();
            b2 = dad.vecWeights.slice();
          }else{
            let cp = _.randInt2(0, this.chromoLength-1);
            b1=[];
            b2=[];
            for(let i=0; i<cp; ++i){
              b1.push(mum.vecWeights[i]);
              b2.push(dad.vecWeights[i]);
            }
            for(i=cp; i<mum.vecWeights.length; ++i){
              b1.push(dad.vecWeights[i]);
              b2.push(mum.vecWeights[i]);
            }
          }
          return [b1,b2];
        },
        //  Position Based Crossover as described in Chapter 5
        crossOverPBX(mum,dad){
          let b1,b2,N=mum.vecWeights.length;
          if(_.rand() > CrossRate || mum.eq(dad)){
            //make sure baby1 and baby2 are assigned some cities first!
            b1 = mum.vecWeights.slice();
            b2 = dad.vecWeights.slice();
          }else{
            //initialize the babies with minus values so we can tell which positions
            //have been filled later in the algorithm
            b1=_.fill(N,()=> -1);
            b2=_.fill(N,()=> -1);
            //holds the positions of the chosen cities
            let positions=[],
                pos = _.randInt2(0, N-2);
            //keep adding until we can add no more
            //record the positions as we go
            while(pos < N){
              positions.push(pos);
              pos += _.randInt2(1, N-pos);
            }
            //now we have chosen it's time to copy the selected
            //over into the offspring in the same position.
            for(pos=0; pos<positions.length; ++pos){
              b1[positions[pos]] = mum.vecWeights[positions[pos]];
              b2[positions[pos]] = dad.vecWeights[positions[pos]];
            }
            //fill in the blanks. First create two position markers so we know
            //whereabouts we are in baby1 and baby2
            let c1 = 0, c2 = 0;
            for(pos=0; pos<N; ++pos){
              //advance position marker until we reach a free position in baby2
              while((b2[c2] > -1) && (c2 < N)){ ++c2 }
              //baby2 gets the next from mum which is not already present
              if(!testNumber(b2, mum.vecWeights[pos])){
                b2[c2] = mum.vecWeights[pos]
              }
              //now do the same for baby1
              while((b1[c1] > -1) && (c1 < N)){ ++c1 }
              //baby1 gets the next from dad which is not already present
              if(!testNumber(b1, dad.vecWeights[pos])){
                b1[c1] = dad.vecWeights[pos]
              }
            }
          }
          return [b1,b2];
        },
        // Order Based operator as described in Chapter 5
        crossOverOBX(mum,dad){
          let b1,b2,N=mum.vecWeights.length;
          if(_.rand() > CrossRate || mum.eq(dad)){
            b1=mum.vecWeights.slice();
            b2=dad.vecWeights.slice();
          }else{
            let temp=[],
                positions=[],
                cPos,pos= _.randInt2(0, N-2);
            //keep adding until we can add no more record the positions as we go
            while(pos < N){
              positions.push(pos);
              temp.push(mum.vecWeights[pos]);
              pos += _.randInt2(1, N-pos);
            }
            //so now we have n amount of genes from mum in the temp
            //vector we can impose their order in dad.
            cPos = 0;
            for(let cit=0; cit<N; ++cit){
              for(let i=0; i<temp.length; ++i){
                if(b2[cit]==temp[i]){
                   b2[cit] = temp[cPos];
                   ++cPos;
                   break;
                }
              }
            }
            //now vice versa
            temp.length=0;
            cPos = 0;
            //first grab the genes from the same positions in dad
            for(let i=0; i<positions.length; ++i)
              temp.push(dad.vecWeights[positions[i]]);
            //and impose their order in mum
            for(let cit=0; cit<N; ++cit){
              for(let i=0; i<temp.length; ++i){
                if(b1[cit]==temp[i]){
                   b1[cit] = temp[cPos];
                   ++cPos;
                   break;
                }
              }
            }
          }
          return [b1,b2];
        },
        // crossover operator based on 'partially matched crossover' as
        // defined in the text
        crossOverPMX(mum,dad){
          let b1,b2,N=mum.vecWeights.length;

          b1=mum.vecWeights.slice();
          b2=mum.vecWeights.slice();

          if(_.rand() > CrossRate || mum.eq(dad)){
          }else{
            //first we choose a section of the chromosome
            let beg = _.randInt2(0, N-2), end = beg;
            while(end <= beg)
              end = _.randInt2(0, N-1);
            //now we iterate through the matched pairs of genes from beg
            //to end swapping the places in each child
            let gene1,gene2;
            for(let pos = beg; pos<end+1; ++pos){
              //these are the genes we want to swap
              gene1 = mum.vecWeights[pos];
              gene2 = dad.vecWeights[pos];
              if(gene1 != gene2){
                posGene1= b1.indexOf(gene1);
                posGene2 = b1.indexOf(gene2);
                //find and swap them in baby1
                _.swap(b1,posGene1,posGene2);
                //and in baby2
                posGene1 = b2.indexOf(gene1);
                posGene2 = b2.indexOf(gene2);
                _.swap(b2,posGene1, posGene2);
              }
            }
          }
          return [b1,b2];
        },
        // performs crossover at the neuron bounderies. See the end of chapter 7
        // for details
        crossOverAtSplits(mum,dad){
          let b1,b2;
          //just return parents as offspring dependent on the rate
          //or if parents are the same
          if((_.rand() > CrossRate) || mum.eq(dad)){
            b1=mum.vecWeights.slice();
            b2=dad.vecWeights.slice();
          }else{
            //determine two crossover points
            let x1 = _.randInt2(0, this.vecSplitPoints.length-2);
            let x2 = _.randInt2(index1, this.vecSplitPoints.length-1);
            let cp1 = this.vecSplitPoints[x1];
            let cp2 = this.vecSplitPoints[x2];

            b1=[];
            b2=[];

            for(let i=0; i<mum.vecWeights.length; ++i){
              if((i<cp1) || (i>=cp2)){
                //keep the same genes if outside of crossover points
                b1.push(mum.vecWeights[i]);
                b2.push(dad.vecWeights[i]);
              }else{
                //switch over the belly block
                b1.push(dad.vecWeights[i]);
                b2.push(mum.vecWeights[i]);
              }
            }
          }

          return [b1,b2];
        },
        //	This type of fitness scaling sorts the population into ascending
        //	order of fitness and then simply assigns a fitness score based
        //	on its position in the ladder. (so if a genome ends up last it
        //	gets score of zero, if best then it gets a score equal to the size
        //	of the population.
        fitnessScaleRank(pop){
          //sort population into ascending order
          pop.sort((a,b)=>{
            return a.fitness.lt(b.fitness)?-1:(
              a.fitness.gt(b.fitness)?1:0
            )
          });
          //now assign fitness according to the genome's position on
          //this new fitness 'ladder'
          for(let i=0; i<pop.length; ++i)
            pop[i].fitness = NumericFitness(i);

          //recalculate values used in selection
          this.calculateBestWorstAvTot();
        },
        //  Scales the fitness using sigma scaling based on the equations given
        //  in Chapter 5 of the book.
        fitnessScaleSigma(pop){
          let gen,runningTotal = 0;
          //first iterate through the population to calculate the standard deviation
          for(gen=0; gen<pop.length; ++gen){
            runningTotal += (pop[gen].fitness.score() - this.averageFitness) *
                            (pop[gen].fitness.score() - this.averageFitness);
          }

          let variance = runningTotal/pop.length;

          //standard deviation is the square root of the variance
          this.sigma = Math.sqrt(variance);

          //now iterate through the population to reassign the fitness scores
          for(gen=0; gen<pop.length; ++gen){
            let oldFitness = pop[gen].fitness.score();
            pop[gen].fitness = NumericFitness((oldFitness - this.averageFitness) / (2 * sigma));
          }

          //recalculate values used in selection
          this.calculateBestWorstAvTot();
        },
        //  This function applies Boltzmann scaling to a populations fitness
        //  scores as described in Chapter 5.
        //  The static value Temp is the boltzmann temperature which is reduced
        //  each generation by a small amount. As Temp decreases the difference
        //  spread between the high and low fitnesses increases.
        fitnessScaleBoltzmann(pop){
          //reduce the temp a little each generation
          this.boltzmannTemp -= BOLTZMANN_DT;
          //make sure it doesn't fall below minimum value
          if(this.boltzmannTemp< MIN_TEMP) this.boltzmannTemp = MIN_TEMP;
          //iterate through the population to find the average e^(fitness/temp)
          //keep a record of e^(fitness/temp) for each individual
          let expBoltz=[],
              gen,average = 0;
          for(gen=0; gen<pop.length; ++gen){
            expBoltz.push(Math.exp(pop[gen].fitness.score() / this.boltzmannTemp));
            average += expBoltz[gen];
          }

          average /= pop.length;

          //now iterate once more to calculate the new expected values
          for(gen=0; gen<pop.length; ++gen)
            pop[gen].fitness = NumericFitness(expBoltz[gen]/average);

          //recalculate values used in selection
          this.calculateBestWorstAvTot();
        },
        //	returns a chromo based on roulette wheel sampling
        getChromoRoulette(){
          //generate a random number between 0 & total fitness count
          let theChosenOne,
              fitnessSoFar = 0,
              slice = _.rand() * this.totalFitness;
          for(let i=0; i<this.popSize; ++i){
            FitnessSoFar += this.vecPop[i].fitness.score();
            //if the fitness so far > random number return the chromo at
            //this point
            if(fitnessSoFar >= slice){
              theChosenOne = this.vecPop[i];
              break;
            }
          }
          return theChosenOne;
        },
        //  performs standard tournament selection given a number of genomes to
        //  sample from each try.
        tournamentSelection(N){
          let chosenOne = 0,
              bestSoFar = -Infinity;
          //Select N members from the population at random testing against
          //the best found so far
          for(let i=0; i<N; ++i){
            let thisTry = _.randInt2(0, this.popSize-1);
            if(this.vecPop[thisTry].fitness.gt(bestSoFar)){
              chosenOne = thisTry;
              bestSoFar = this.vecPop[thisTry].fitness;
            }
          }
          return this.vecPop[chosenOne];
        },
        //	takes a population of chromosones and runs the algorithm through one
        //	cycle.
        //	Returns a new population of chromosones.
        epoch(oldPop, options){
          let mum,dad,vecNewPop=[],
              extra= _.inject({},DFTS,options);

          this.vecPop = oldPop;
          this.reset();
          this.calculateBestWorstAvTot();

          this.vecPop.sort((a,b)=>{
            return a.fitness.score()<b.fitness.score()?-1:(
              a.fitness.score()>b.fitness.score()?1:0
            )
          });

          //Now to add a little elitism we shall add in some copies of the
          //fittest genomes. Make sure we add an EVEN number or the roulette
          //wheel sampling will crash
          if(!(NUM_COPIES_ELITE * NUM_ELITE % 2)){
            this.grabNBest(NUM_ELITE, NUM_COPIES_ELITE, vecNewPop)
          }
          //repeat until a new population is generated
          while(vecNewPop.length < this.popSize){
            if(extra.TOURNAMENT_COMPETITORS){
              mum = this.tournamentSelection(TOURNAMENT_COMPETITORS);
              dad = this.tournamentSelection(TOURNAMENT_COMPETITORS);
            }else{
              mum = this.getChromoRoulette();
              dad = this.getChromoRoulette();
            }
            let [b1,b2]= this.crossOverAtSplits(mum,dad);
            this.mutate(b1);
            this.mutate(b2);
            vecNewPop.push(SGenome(NumericFitness(0),b1));
            vecNewPop.push(SGenome(NumericFitness(0),b2));
          }
          return this.vecPop = vecNewPop;
        },
        //	This works like an advanced form of elitism by inserting NumCopies
        //  copies of the NBest most fittest genomes into a population vector
        grabNBest(nBest, numCopies, pop){
          //add the required amount of copies of the n most fittest to the supplied vector
          while(nBest--){
            for(let i=0; i<numCopies; ++i)
              pop.push(this.vecPop[(this.popSize-1) - nBest])
          }
        },
        //	calculates the fittest and weakest genome and the average/total
        //	fitness scores
        calculateBestWorstAvTot(){
          let highestSoFar = 0,
              lowestSoFar  = Infinity;
          this.totalFitness = 0;
          for(let i=0; i<this.popSize; ++i){
            if(this.vecPop[i].fitness.gt(highestSoFar)){
              highestSoFar= this.vecPop[i].fitness;
              this.fittestGenome = i;
              this.bestFitness	 = highestSoFar;
            }
            //update worst if necessary
            if(this.vecPop[i].fitness.lt(lowestSoFar)){
              lowestSoFar = this.vecPop[i].fitness;
              this.worstFitness = lowestSoFar;
            }
            this.totalFitness	+= this.vecPop[i].fitness.score();
          }
          this.averageFitness = this.totalFitness / this.popSize;
          //if all the fitnesses are zero the population has converged
          //to a grpoup of identical genomes so we should stop the run
          if(this.averageFitness == 0){
            this.sigma = 0;
          }
        },
        //	resets all the relevant variables ready for a new generation
        reset(){
          this.totalFitness		= 0;
          this.bestFitness		= 0;
          this.averageFitness	= 0;
          this.sigma=1;
          this.worstFitness		= Infinity;
        },
        getChromos(){return this.vecPop},
        bestRawFitness(){return this.bestFitness},
        averageRawFitness(){return this.averageFitness}
      }
    }

    const _$={


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


