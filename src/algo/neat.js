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
     * @module mcfud/algo/NEAT
     */

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const NeuronType={
      INPUT:0,
      HIDDEN:1,
      OUTPUT:2,
      BIAS:3,
      NONE:4
    };

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const InnovType={
      NEW_NEURON:0,
      NEW_LINK:1
    };

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    //you have to select one of these types when updating the network
    //If snapshot is chosen the network depth is used to completely
    //flush the inputs through the network. active just updates the
    //network each timestep
    const RunType={
      SNAPSHOT:0,
      ACTIVE:1
    };

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const Params={
      numInputs: 0,
      numOutputs: 0,
      bias: -1,
      //starting value for the sigmoid response
      sigmoidResponse:1,
      //number of times we try to find 2 unlinked nodes when adding a link.
      numAddLinkAttempts:5,
      //number of attempts made to choose a node that is not an input
      //node and that does not already have a recurrently looped connection to itself
      numTrysToFindLoopedLink: 5,
      //the number of attempts made to find an old link to prevent chaining in addNeuron
      numTrysToFindOldLink: 5,
      //the chance, each epoch, that a neuron or link will be added to the genome
      chanceAddLink:0.07,
      chanceAddNode:0.03,
      chanceAddRecurrentLink:0.05,
      //mutation probabilities for mutating the weights
      mutationRate:0.8,
      maxWeightPerturbation:0.5,
      probabilityWeightReplaced:0.1,
      //probabilities for mutating the activation response
      activationMutationRate:0.1,
      maxActivationPerturbation:0.1,
      //the smaller the number the more species will be created
      compatibilityThreshold:0.26,
      //during fitness adjustment this is how much the fitnesses of
      //young species are boosted (eg 1.2 is a 20% boost)
      youngFitnessBonus:1.3,
      //if the species are below this age their fitnesses are boosted
      youngBonusAgeThreshhold:10,
      //number of population to survive each epoch. (0.2 = 20%)
      survivalRate:0,
      //if the species is above this age their fitness gets penalized
      oldAgeThreshold:50,
      //by this much
      oldAgePenalty:0.7,
      crossOverRate:0.7,
      //how long we allow a species to exist without any improvement
      numGensAllowedNoImprovement:15,
      //maximum number of neurons permitted in the network
      maxPermittedNeurons:100,
      numBestElites:4
    };

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    let INNOV_COUNTER=0,
        NEURON_COUNTER=0,
        GENOME_COUNTER=0;
    function NextGlobalNID(){ return ++NEURON_COUNTER }
    function NextGlobalIID(){ return ++INNOV_COUNTER }
    function NextGlobalGID(){ return ++GENOME_COUNTER }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**
     * @memberof module:mcfud/algo/NEAT
     * @param {NeuronType} type
     * @param {number} y
     * @param {number} x
     * @param {boolean} r
     */
    function NeuronGene(type, y, x, r=false){
      return NeuronGene.From( NextGlobalNID(), type, y, x, r)
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    NeuronGene.From=function(id, type, y, x, r=false){
      return{
        neuronType: type,
        recurrent: r,
        id,
        //position in network grid
        splitY:y,
        splitX:x,
        //sets the curvature of the sigmoid function
        activationResponse:1
      }
    };

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    /**
     * @memberof module:mcfud/algo/NEAT
     * @param {number} from
     * @param {number} to
     * @param {number} iid
     * @param {boolean} enable
     * @param {number} w
     * @param {boolean} rec
     */
    function LinkGene(from, to, iid, enable=true, w=null, rec = false){
      return{
        //the IDs of the two neurons this link connects
        fromNeuron: from,
        toNeuron: to,
        innovationID: iid,
        recurrent: !!rec,
        enabled: enable !== false,
        weight: w==null? _.randMinus1To1() : w
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    LinkGene.SortFunc=function(lhs,rhs){
      //overload '<' used for sorting(we use the innovation ID as the criteria)
      return lhs.innovationID < rhs.innovationID?-1:(
        lhs.innovationID > rhs.innovationID?1:0
      )
    };

    /**
     * @memberof module:mcfud/algo/NEAT
     * @param {number} from
     * @param {number} to
     * @param {InnovType} t
     * @param {number} iid
     * @param {NeuronType} type
     * @param {number} x
     * @param {number} y
     * @return {Innovation}
     */
    function Innovation(from, to, t, iid, type=NeuronType.NONE, x=0, y=0){
      return{
        innovationID: iid,
        innovationType: t,
        neuronType: type,
        neuronIn: from,
        neuronOut: to,
        neuronID: 0,
        splitX:x,
        splitY:y
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    Innovation.From=function(neuron, innov_id){
      const s= Innovation(-1,-1,null, innov_id, neuron.neuronType, neuron.splitX, neuron.splitY);
      s.neuronID=neuron.id;
      return s;
    };

    /**Used to keep track of all innovations created during
     * the populations evolution, adds all the appropriate innovations.
     * @memberof module:mcfud/algo/NEAT
     * @param {LinkGene[]} start_genes
     * @param {NeuronGene[]} start_neurons
     * @return {InnovationHistory}
     */
    function InnovationHistory(start_genes, start_neurons){
      let vecInnovs= start_neurons.map(n=> Innovation.From(n, NextGlobalIID()));
      start_genes.forEach(g=> vecInnovs.push(Innovation(g.fromNeuron, g.toNeuron, InnovType.NEW_LINK, NextGlobalIID())));
      return{
        vecInnovs,
        /**Checks to see if this innovation has already occurred. If it has it
         * returns the innovation ID. If not it returns a negative value.
         * @memberof module:mcfud/algo/NEAT
         * @param {number} from
         * @param {number} out
         * @param {InnovType} type
         * @return {number}
         */
        checkInnovation(from, out, type){
          let rc= -1;
          for(let cur,i=0; i<this.vecInnovs.length; ++i){
            cur=this.vecInnovs[i];
            if(cur.neuronIn == from   &&
               cur.neuronOut == out &&
               cur.innovationType == type){ rc=cur.innovationID; break; }
          }
          return rc;
        },
        /**Creates a new innovation and returns its ID.
         * @memberof module:mcfud/algo/NEAT
         * @param {number} from
         * @param {number} to
         * @param {InnovType} innovType
         * @param {NeuronType} neuronType
         * @param {number} x
         * @param {number} y
         * @return {Innovation}
         */
        createNewInnovation(from, to, innovType, neuronType=NeuronType.NONE, x=0, y=0){
          let new_innov= Innovation(from, to, innovType, NextGlobalIID(), neuronType, x, y);
          //if(innovType == InnovType.NEW_NEURON){
            //new_innov.neuronID = this.nextNeuronID;
            //++this.nextNeuronID;
          //}
          this.vecInnovs.push(new_innov);
          //++this.nextInnovationNum;
          //return this.nextNeuronID-1;
          return new_innov;
        },
        /**Given a neuron ID this function returns a clone of that neuron.
         * @param {number} neuronID
         * @return {NeuronGene}
         */
        createNeuronFromID(neuronID){
          let temp=NeuronGene.From(0,NeuronType.HIDDEN,0,0);
          for(let cur,i=0; i<this.vecInnovs.length; ++i){
            cur=this.vecInnovs[i];
            if(cur.neuronID == neuronID){
              temp.neuronType = cur.neuronType;
              temp.id = cur.neuronID;
              temp.splitY = cur.splitY;
              temp.splitX = cur.splitX;
              return temp;
            }
          }
          _.assert(false, "boom from createNeuronFromID");
          //return temp;
        },
        flush(){this.vecInnovs.length=0},
        getNeuronID(inv){return this.vecInnovs[inv].neuronID}
        //nextNumber(num=0){ return (this.nextInnovationNum += num) }
      }
    }

    /**
     * @memberof module:mcfud/algo/NEAT
     * @param {number} w
     * @param {NNetNeuron} from
     * @param {NNetNeuron} out
     * @param {boolean} rec
     */
    function NNetLink(w, from, out, rec){
      return{
        weight:w,
        from,
        out,
        recurrent:rec
      }
    }

    /**
     * @memberof module:mcfud/algo/NEAT
     * @param {NeuronType} type
     * @param {number} id
     * @param {number} y
     * @param {number} x
     * @param {number} actResponse
     */
    function NNetNeuron(type, id, y, x, actResponse){
      return{
        neuronType:type,
        neuronID:id,
        //sum of weights * inputs
        sumActivation:0,
        output:0,
        posX:0,
        posY:0,
        splitY:y,
        splitX:x,
        //links coming in and out
        vecLinksIn:[],
        vecLinksOut:[],
        //sets the curvature of the sigmoid function
        activationResponse:actResponse
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function sigmoid(netinput, response){
      return 1 / ( 1 + Math.exp(-netinput / response));
    }

    /**
     * @memberof module:mcfud/algo/NEAT
     * @param {NNetNeuron} neurons
     * @param {number} depth
     */
    function NeuralNet(neurons, depth){
      return{
        vecpNeurons: neurons,
        depth,
        /**Update network for this clock cycle.
         * @param {number[]} inputs
         * @param {RunType} type
         */
        update(inputs, type){
          //if the mode is snapshot then we require all the neurons to be
          //iterated through as many times as the network is deep. If the
          //mode is set to active the method can return an output after just one iteration
          let outputs=[],
              flushCount = type == RunType.SNAPSHOT ? this.depth:1;
          for(let sum,n,i=0; i<flushCount; ++i){
            outputs.length=0;
            n = 0;
            //first set the outputs of the 'input' neurons to be equal
            //to the values passed into the function in inputs
            while(this.vecpNeurons[n].neuronType == NeuronType.INPUT){
              this.vecpNeurons[n].output = inputs[n];
              ++n;
            }
            //set the output of the bias to 1
            this.vecpNeurons[n++].output = 1;
            //then we step through the network a neuron at a time
            while(n < this.vecpNeurons.length){
              sum=0;
              for(let k=0; k<this.vecpNeurons[n].vecLinksIn.length; ++k){
                sum += this.vecpNeurons[n].vecLinksIn[k].weight *
                       this.vecpNeurons[n].vecLinksIn[k].in.output
              }
              //now put the sum through the activation function and assign the
              //value to this neuron's output
              this.vecpNeurons[n].output = sigmoid(sum, this.vecpNeurons[n].activationResponse);
              if(this.vecpNeurons[n].neuronType == NeuronType.OUTPUT){
                outputs.push(this.vecpNeurons[n].output)
              }
              ++n;
            }
          }
          //the network needs to be flushed if this type of update is performed
          //otherwise it is possible for dependencies to be built on the order
          //the training data is presented
          if(type == RunType.SNAPSHOT)
            this.vecpNeurons.forEach(n=> n.output=0);
          /////
          return outputs;
        },
        drawNet(gfx, cxLeft, cxRight, cyTop, cyBot){ }
      }
    }

    /**A genome basically consists of a vector of
     * link genes, a vector of neuron genes and a fitness score.
     * @memberof module:mcfud/algo/NEAT
     * @param {number} id
     * @param {number} inputs
     * @param {number} outputs
     * @param {NeuronGene[]} neurons (optional)
     * @param {LinkGene[]} genes (optional)
     */
    function Genome(id, inputs, outputs,neurons, genes){
      let inputRowSlice = 1/(inputs+2),
          outputRowSlice = 1/(outputs+1);
      let vecLinks= [],
          vecNeurons= [];
      if(arguments.length>3){
        vecLinks= genes;
        vecNeurons= neurons;
      }else{
        for(let i=0; i<inputs; ++i)
          vecNeurons.push(NeuronGene(NeuronType.INPUT, 0, (i+2)*inputRowSlice));
        ////
        vecNeurons.push(NeuronGene(NeuronType.BIAS, 0, inputRowSlice));
        for(let i=0; i<outputs; ++i)
          vecNeurons.push(NeuronGene(NeuronType.OUTPUT, 1, (i+1)*outputRowSlice));
        //create the link genes, connect each input neuron to each output neuron and
        for(let i=0; i<inputs+1; ++i)
          for(let j=0; j<outputs; ++j)
            vecLinks.push(LinkGene(vecNeurons[i].id, vecNeurons[inputs+j+1].id, NextGlobalIID()));
      }
      return{
        phenotype:null,
        genomeID:id,
        //its raw fitness score
        fitness:NumericFitness(0),
        //its fitness score after it has been placed into a species and adjusted accordingly
        adjustedFitness:0,
        //the number of offspring this individual is required to spawn
        //for the next generation
        amountToSpawn:0,
        //keep a record of the number of inputs and outputs
        numInputs:inputs,
        numOutputs:outputs,
        //keeps a track of which species this genome is in (only used for display purposes)
        species:0,
        vecLinks,
        vecNeurons,
        /**Create a neural network from the genome.
         * @param {number} depth
         * @return {NeuralNet} newly created ANN
         */
        createPhenotype(depth){
          let vecNeurons=[];
          this.deletePhenotype();
          for(let i=0; i<this.vecNeurons.length; ++i)
            vecNeurons.push(NNetNeuron(this.vecNeurons[i].neuronType,
                                       this.vecNeurons[i].id,
                                       this.vecNeurons[i].splitY,
                                       this.vecNeurons[i].splitX,
                                       this.vecNeurons[i].activationResponse));
          for(let f,t,k,i=0; i<this.vecLinks.length; ++i){
            if(this.vecLinks[i].enabled){
              f= vecNeurons[ this.getElementPos(this.vecLinks[i].fromNeuron) ];
              t= vecNeurons[ this.getElementPos(this.vecLinks[i].toNeuron) ];
              //create a link between those two neurons and assign the weight stored in the gene
              k= NNetLink(this.vecLinks[i].weight, f, t, this.vecLinks[i].recurrent);
              //add new links to neuron
              f.vecLinksOut.push(k);
              t.vecLinksIn.push(k);
            }
          }
          return this.phenotype = NeuralNet(vecNeurons, depth);
        },
        /**Remove the internal neural net.
         */
        deletePhenotype(){
          return this.phenotype = null;
        },
        /**Create a new link with the probability of Params::dChanceAddLink.
         * @param {number} MutationRate
         * @param {boolean} ChanceOfLooped
         * @param {InnovationHistory} innovation
         * @param {number} numTrysToFindLoop
         * @param {number} numTrysToAddLink
         */
        addLink(MutationRate, ChanceOfLooped, innovation, numTrysToFindLoop, numTrysToAddLink){
          if(_.rand() > MutationRate)
          return;
          //define holders for the two neurons to be linked. If we have find two
          //valid neurons to link these values will become >= 0.
          let ID_neuron1 = -1,
              ID_neuron2 = -1,
              //flag set if a recurrent link is selected (looped or normal)
              recurrent = false;
          //first test to see if an attempt shpould be made to create a
          //link that loops back into the same neuron
          if(_.rand() < ChanceOfLooped){
            //YES: try NumTrysToFindLoop times to find a neuron that is not an
            //input or bias neuron and that does not already have a loopback connection
            while(numTrysToFindLoop--){
              let pos = _.randInt2(this.numInputs+1, this.vecNeurons.length-1),
                  n=this.vecNeurons[pos];
              //check to make sure the neuron does not already have a loopback
              //link and that it is not an input or bias neuron
              if(!n.recurrent && n.neuronType != NeuronType.BIAS && n.neuronType != NeuronType.INPUT){
                ID_neuron1 = ID_neuron2 = n.id;
                n.recurrent = true;
                recurrent = true;
                break;
                //numTrysToFindLoop = 0;
              }
            }
          }else{
            //No: try to find two unlinked neurons. Make NumTrysToAddLink attempts
            while(numTrysToAddLink--){
              //choose two neurons, the second must not be an input or a bias
              ID_neuron1 = this.vecNeurons[_.randInt2(0, this.vecNeurons.length-1)].id;
              ID_neuron2 = this.vecNeurons[_.randInt2(this.numInputs+1, this.vecNeurons.length-1)].id;
              if(ID_neuron2 == 2){ continue; }//TODO: why2?
              //make sure these two are not already linked and that they are not the same neuron
              if(ID_neuron1 == ID_neuron2 || this.duplicateLink(ID_neuron1, ID_neuron2)){
                ID_neuron1 = ID_neuron2 = -1;
              }else{
                break;
                //numTrysToAddLink = 0;
              }
            }
          }
          if(ID_neuron1 < 0 || ID_neuron2 < 0){}else{
            let id = innovation.checkInnovation(ID_neuron1, ID_neuron2, InnovType.NEW_LINK);
            if(this.vecNeurons[this.getElementPos(ID_neuron1)].splitY >
               this.vecNeurons[this.getElementPos(ID_neuron2)].splitY){ recurrent = true }
            if(id<0)
              id= innovation.createNewInnovation(ID_neuron1, ID_neuron2, InnovType.NEW_LINK).innovationID;
            this.vecLinks.push(LinkGene(ID_neuron1, ID_neuron2, id, true, _.randMinus1To1(), recurrent));
          }
        },
        /**This function adds a neuron to the genotype by examining the network,
         * splitting one of the links and inserting the new neuron.
         * @param {number} MutationRate
         * @param {CInnovationHostory} innovation
         * @param {number} numTrysToFindOldLink
         */
        addNeuron(MutationRate, innovation, numTrysToFindOldLink){
          if(_.rand() > MutationRate)
          return;
          let done = false,
              chosenLink = 0,
              //first a link is chosen to split. If the genome is small the code makes
              //sure one of the older links is split to ensure a chaining effect does
              //not occur. Here, if the genome contains less than 5 hidden neurons it
              //is considered to be too small to select a link at random
              SizeThreshold = this.numInputs + this.numOutputs + 5;
          if(this.vecLinks.length < SizeThreshold){
            while(numTrysToFindOldLink--){
              //choose a link with a bias towards the older links in the genome
              chosenLink = _.randInt2(0, this.numGenes()-1-int(Math.sqrt(this.numGenes())));
              //make sure the link is enabled and that it is not a recurrent link or has a bias input
              let fromNeuron = this.vecLinks[chosenLink].fromNeuron;
              if(this.vecLinks[chosenLink].enabled    &&
                 !this.vecLinks[chosenLink].recurrent &&
                 this.vecNeurons[this.getElementPos(fromNeuron)].neuronType != NeuronType.BIAS){
                done = true;
                break;
                //numTrysToFindOldLink = 0;
              }
            }
            if(!done){ return } //failed to find a decent link
          }else{ //the genome is of sufficient size for any link to be acceptable
            while(!done){
              chosenLink = _.randInt2(0, this.numGenes()-1);
              //make sure the link is enabled and that it is not a recurrent link or has a BIAS input
              let fromNeuron = this.vecLinks[chosenLink].fromNeuron;
              if(this.vecLinks[chosenLink].enabled &&
                 !this.vecLinks[chosenLink].recurrent &&
                 this.vecNeurons[this.getElementPos(fromNeuron)].neuronType != NeuronType.BIAS){
                done = true;
              }
            }
          }
          this.vecLinks[chosenLink].enabled = false;
          //grab the weight from the gene (we want to use this for the weight of
          //one of the new links so that the split does not disturb anything the
          //NN may have already learned...
          let originalWeight = this.vecLinks[chosenLink].weight,
              from =  this.vecLinks[chosenLink].fromNeuron,
              to   =  this.vecLinks[chosenLink].toNeuron,
              //calculate the depth and width of the new neuron. We can use the depth
              //to see if the link feeds backwards or forwards
              newDepth = (this.vecNeurons[this.getElementPos(from)].splitY +
                          this.vecNeurons[this.getElementPos(to)].splitY) /2,
              newWidth = (this.vecNeurons[this.getElementPos(from)].splitX +
                          this.vecNeurons[this.getElementPos(to)].splitX) /2,
              //Now to see if this innovation has been created previously by another member of the population
              id = innovations.checkInnovation(from, to, InnovType.NEW_NEURON);
          /*it is possible for NEAT to repeatedly do the following:
              1. Find a link. Lets say we choose link 1 to 5
              2. Disable the link,
              3. Add a new neuron and two new links
              4. The link disabled in Step 2 maybe re-enabled when this genome
                 is recombined with a genome that has that link enabled.
              5  etc etc
          Therefore, this function must check to see if a neuron ID is already
          being used. If it is then the function creates a new innovation
          for the neuron. */
          if(id >= 0 && this.alreadyHaveThisNeuronID(innovations.getNeuronID(id))) id = -1;
          let idLink1, idLink2, newNeuronID;
          if(id < 0){
            let new_innov= innovations.createNewInnovation(from, to,
                                                           InnovType.NEW_NEURON,
                                                           NeuronType.HIDDEN, newWidth, newDepth),
                n= NeuronGene(NeuronType.HIDDEN, newDepth, newWidth);
            new_innov.neuronID= newNeuronID=n.id;
            //create the new neuron gene and add it.
            this.vecNeurons.push(n);
            //Two new link innovations are required, one for each of the
            //new links created when this gene is split.
            idLink1 = innovations.createNewInnovation(from, newNeuronID, InnovType.NEW_LINK).innovationID;
            this.vecLinks.push(LinkGene(from, newNeuronID, idLink1, true, 1));
            idLink2 = innovations.createNewInnovation(newNeuronID, to, InnovType.NEW_LINK).innovationID;
            this.vecLinks.push(LinkGene(newNeuronID, to, idLink2, true, originalWeight));
          }else{
            //this innovation has already been created so grab the relevant neuron
            //and link info from the innovation database
            newNeuronID = innovations.getNeuronID(id);
            idLink1 = innovations.checkInnovation(from, newNeuronID, InnovType.NEW_LINK);
            idLink2 = innovations.checkInnovation(newNeuronID, to, InnovType.NEW_LINK);
            //this should never happen because the innovations *should* have already occurred
            if(idLink1 < 0 || idLink2 < 0)
              _.assert(false, "Error in Genome::AddNeuron");
            //now we need to create 2 new genes to represent the new links
            this.vecLinks.push(LinkGene(from, newNeuronID, idLink1, true, 1));
            this.vecLinks.push(LinkGene(newNeuronID, to, idLink2, true, originalWeight));
            this.vecNeurons.push(NeuronGene.From(newNeuronID, hidden, newDepth, newWidth));
          }
        },
        /**Given a neuron ID this little function just finds its position in m_vecNeurons.
         * @param {number} neuron_id
         * @return {number}
         */
        getElementPos(neuron_id){
          for(let i=0; i<this.vecNeurons.length; ++i){
            if(this.vecNeurons[i].id == neuron_id)
            return i
          }
          _.assert(false, "Error in Genome::GetElementPos");
          //return -1;
        },
        /**
         * @param {number} neuronIn
         * @param {number} neuronOut
         * @return {boolean} true if the link is already part of the genome
         */
        duplicateLink(neuronIn, neuronOut){
          return this.vecLinks[i].some(k=> k.fromNeuron == neuronIn && k.toNeuron == neuronOut)
        },
        /**Tests to see if the parameter is equal to any existing neuron ID's.
         * @param {number} id
         * @return {boolean} true if this is the case.
         */
        alreadyHaveThisNeuronID(id){
          return this.vecNeurons.some(n=> id== n.id)
        },
        /**
         * @param {number} MutationRate
         * @param {number} ProbNewWeight the chance that a weight may get replaced by a completely new weight.
         * @param {number} maxPertubation the maximum perturbation to be applied
         */
        mutateWeights(MutationRate, ProbNewWeight, maxPertubation){
          for(let i=0; i<this.vecLinks.length; ++i){
            if(_.rand() < MutationRate){
              if(_.rand() < ProbNewWeight){
                //change the weight to a completely new weight
                this.vecLinks[i].weight = _.randMinus1To1()
              }else{
                this.vecLinks[i].weight += _.randMinus1To1() * maxPertubation
              }
            }
          }
        },
        /**Perturbs the activation responses of the neurons.
         * @param {number} MutationRate
         * @param {number} maxPertubation the maximum perturbation to be applied
         */
        mutateActivationResponse(MutationRate, maxPertubation){
          this.vecNeurons[i].forEach(n=>{
            if(_.rand() < MutationRate)
              n.activationResponse += _.randMinus1To1() * maxPertubation
          })
        },
        /**Find the compatibility of this genome with the passed genome.
         * @param {Genome} genome
         * @return {number}
         */
        getCompatibilityScore(genome){
          //travel down the length of each genome counting the number of
          //disjoint genes, the number of excess genes and the number of matched genes
          let numDisjoint = 0,
              numExcess   = 0,
              numMatched  = 0,
              //this records the summed difference of weights in matched genes
              weightDifference = 0,
              //position holders for each genome. They are incremented as we step down each genomes length.
              g1 = 0,
              g2 = 0;
          while((g1 < this.vecLinks.length-1) ||
                (g2 < genome.vecLinks.length-1)){
            //we've reached the end of genome1 but not genome2 so increment the excess score and vice versa
            if(g1 == this.vecLinks.length-1){ ++g2; ++numExcess; continue; }
            if(g2 == genome.vecLinks.length-1){ ++g1; ++numExcess; continue; }
            let id1 = this.vecLinks[g1].innovationID,
                id2 = genome.vecLinks[g2].innovationID;
            if(id1 == id2){
              ++g1; ++g2; ++numMatched;
              weightDifference += Math.abs(this.vecLinks[g1].weight - genome.vecLinks[g2].weight);
            }else{
              ++numDisjoint;
              if(id1 < id2){ ++g1 }
              else if(id1 > id2){ ++g2 }
            }
          }
          const Disjoint = 1,
                Excess   = 1,
                Matched  = 0.4,
                longest= Math.max(this.numGenes(), genome.numGenes());
          return (Excess * numExcess/longest) +
                 (Disjoint * numDisjoint/longest) +
                 (Matched * weightDifference / numMatched);
        },
        sortGenes(){
          this.vecLinks.sort(LinkGene.SortFunc)
        },
        id(){return this.genomeID},
        setID(val){this.genomeID = val},
        numGenes(){return this.vecLinks.length},
        numNeurons(){return this.vecNeurons.length},
        //numInputs(){return this.numInputs}
        //numOutputs(){return this.numOutputs}
        //amountToSpawn(){return this.amountToSpawn}
        setAmountToSpawn(num){this.amountToSpawn = num},
        setFitness(n){this.fitness = n},
        setAdjFitness(num){this.adjustedFitness = num},
        fitness(){return this.fitness},
        getAdjFitness(){return this.adjustedFitness},
        getSpecies(){return this.species},
        setSpecies(spc){this.species = spc},
        splitY(val){return this.vecNeurons[val].splitY},
        genes(){return this.vecLinks},
        neurons(){return this.vecNeurons},
        startOfGenes(){return 0},
        endOfGenes(){return this.vecLinks.length-1}
      }
    }
    Genome.SortFunc=function(lhs,rhs){
      //overload '<' used for sorting. From fittest to poorest.
      return lhs.fitness().score() > rhs.fitness().score()?-1:(
          lhs.fitness().score() < rhs.fitness().score()?1:0
      )
    };

    /**
     * @param {Genome} firstOrg
     * @param {number} speciesID
     */
    function CSpecies(firstOrg, speciesID){
      return{
        speciesID,
        //generations since fitness has improved, we can use
        //this info to kill off a species if required
        _gensNoImprovement:0,
        //age of species
        _age:0,
        //how many of this species should be spawned for the next population
        spawnsRqd:0,
        vecMembers: [firstOrg],
        _leader: firstOrg,
        //best fitness found so far by this species
        _bestFitness: firstOrg.fitness().score(),
        /**This function adjusts the fitness of each individual by first
         * examining the species age and penalising if old, boosting if young.
         * Then we perform fitness sharing by dividing the fitness
         * by the number of individuals in the species.
         * This ensures a species does not grow too large.
         */
        adjustFitnesses(){
          let score,total = 0;
          this.vecMembers.forEach(m=>{
            score = m.fitness().score();
            if(this._age < Params.youngBonusAgeThreshhold){
              //boost the fitness scores if the species is young
              score *= Params.youngFitnessBonus
            }
            if(this._age > Params.oldAgeThreshold){
              //punish older species
              score *= Params.oldAgePenalty
            }
            total += score;
            //apply fitness sharing to adjusted fitnesses
            m.setAdjFitness(score/this.vecMembers.length);
          })
        },
        /**Adds a new member to this species and updates the member variables accordingly
         * @param {Genome} newMember
         */
        addMember(newMember){
          if(newMember.fitness().score() > this._bestFitness){
            this._bestFitness = newMember.fitness().score();
            this._gensNoImprovement = 0;
            this._leader = newMember;
          }
          this.vecMembers.push(newMember);
        },
        /**Clears out all the members from the last generation, updates the age and gens no improvement.
         */
        purge(){
          this.vecMembers.length=0;
          ++this._gensNoImprovement;
          this.spawnsRqd = 0;
          ++this._age;
        },
        /**Simply adds up the expected spawn amount for each individual
         * in the species to calculate the amount of offspring
         * this species should spawn.
         */
        calculateSpawnAmount(){
          this.vecMembers.forEach(m=>{
            this.spawnsRqd += m.amountToSpawn()
          })
        },
        /**Spawns an individual from the species selected at random
         * from the best Params::dSurvivalRate percent.
         * @return {Genome} a random genome selected from the best individuals
         */
        spawn(){
          let baby;
          if(this.vecMembers.length == 1){
            baby = this.vecMembers[0]
          }else{
            let n = int(Params.survivalRate * this.vecMembers.length)-1;
            if(n<0)n=1;
            baby = this.vecMembers[ _.randInt2(0, n) ];
          }
          return baby;
        },
        leader(){return this._leader},
        numToSpawn(){return this.spawnsRqd},
        numMembers(){return this.vecMembers.length},
        gensNoImprovement(){return this._gensNoImprovement},
        id(){return this.speciesID},
        bestFitness(){return this._bestFitness },
        age(){return this._age},
        speciesLeaderFitness(){return this._leader.fitness().score() }
      }
    }
    CSpeciies.SortFunc(lhs,rhs){
      //so we can sort species by best fitness. Largest first
      return lhs._bestFitness > rhs._bestFitness?-1:(
        lhs._bestFitness < rhs._bestFitness?1:0
      )
    }

    /**A recursive function used to calculate a lookup table of split depths.
     */
    function split(low, high, depth, out){
      const span = high-low;
      out.push({val: low + span/2, depth: depth+1});
      if(depth > 6){
      }else{
        split(low, low+span/2, depth+1, out);
        split(low+span/2, high, depth+1, out);
      }
      return out;
    }

    /**Checks to see if a node ID has already been added to a vector of nodes.
     * If not then the new ID  gets added. Used in Crossover.
     * @param {number} nodeID
     * @param {number[]} vec
     * @return {number[]} vec
     */
    function addNeuronID(nodeID, vec){
      for(let i=0; i<vec.length; ++i){
        if(vec[i] == nodeID) { return vec }
      }
      vec.push(nodeID);
      return vec;
    }

    /**Creates a base genome from supplied values and creates a population
     * of 'size' similar (same topology, varying weights) genomes.
     * @param {number} size
     * @param {number} inputs
     * @param {number} outputs
     */
    function NeatGA(size, inputs, outputs){
      return{
        nextSpeciesID:0,
        generation:0,
        popSize:size,
        //adjusted fitness scores
        totFitAdj:0,
        avFitAdj:0,
        //index into the genomes for the fittest genome
        fittestGenome:0,
        _bestEverFitness:0,
        vecGenomes: _.fill(size, ()=> Genome(NextGlobalGID(), inputs, outputs)),
        //create the innovation list. First create a minimal genome
        innovHistory: (function(g){ return InnovationHistory(g.genes(), g.neurons()) })(Genome(1,inputs,outputs)),
        //this holds the precalculated split depths. They are used
        //to calculate a neurons x/y position for rendering and also
        //for calculating the flush depth of the network when a
        //phenotype is working in 'snapshot' mode.
        //create the network depth lookup table
        vecSplits : split(0, 1, 0, []),
        vecBestGenomes:[],
        vecSpecies:[],
        /**Resets some values ready for the next epoch, kills off
         * all the phenotypes and any poorly performing species.
         */
        resetAndKill(){
          this.totFitAdj = 0;
          this.avFitAdj  = 0;
          let tmp=[];
          this.vecSpecies.forEach(s=>{
            s.purge();
            //kill off species if not improving and if not the species which contains
            //the best genome found so far
            if(s.gensNoImprovement() > Params.numGensAllowedNoImprovement &&
               s.bestFitness() < this._bestEverFitness){
              //delete it
            }else{
              //keep it
              tmp.push(s);
            }
          });
          this.vecSpecies=tmp;
          this.vecGenomes.forEach(g=> g.deletePhenotype());
        },
        /**Separates each individual into its respective species by calculating
         * a compatibility score with every other member of the population and
         * niching accordingly. The function then adjusts the fitness scores of
         * each individual by species age and by sharing and also determines
         * how many offspring each individual should spawn.
         */
        speciateAndCalculateSpawnLevels(){
          let added = false;
          for(let gen=0; gen<this.vecGenomes.length; ++gen){
            //calculate its compatibility score with each species leader. If
            //compatible add to species. If not, create a new species
            for(let cp, spc=0; spc<this.vecSpecies.length; ++spc){
              cp = this.vecGenomes[gen].getCompatibilityScore(this.vecSpecies[spc].leader());
              //if this individual is similar to this species add to species
              if(cp <= Params.compatibilityThreshold){
                this.vecSpecies[spc].addMember(this.vecGenomes[gen]);
                //let the genome know which species it's in
                this.vecGenomes[gen].setSpecies(this.vecSpecies[spc].id());
                added = true;
                break;
              }
            }
            if(!added)
              this.vecSpecies.push(CSpecies(this.vecGenomes[gen], this.nextSpeciesID++));
            added = false;
          }
          //now all the genomes have been assigned a species the fitness scores
          //need to be adjusted to take into account sharing and species age.
          this.adjustSpeciesFitnesses();
          //calculate new adjusted total & average fitness for the population
          for(let i=0; i<this.vecGenomes.length; ++i)
            this.totFitAdj += this.vecGenomes[i].getAdjFitness();
          //////
          this.avFitAdj = this.totFitAdj/this.vecGenomes.length;
          //calculate how many offspring each member of the population should spawn
          for(let i=0; i<this.vecGenomes.length; ++i)
            this.vecGenomes[i].setAmountToSpawn(this.vecGenomes[i].getAdjFitness() / this.avFitAdj);
          //iterate through all the species and calculate how many offspring
          //each species should spawn
          for(let i=0; i<this.vecSpecies.length; ++i)
            this.vecSpecies[i].calculateSpawnAmount();
        },
        /**Adjusts the fitness scores depending on the number
         * sharing the species and the age of the species.
         */
        adjustSpeciesFitnesses(){
          this.vecSpecies.forEach(s=> s.adjustFitnesses())
        },
        /**
         * @param {Genome} mum
         * @param {Genome} dad
         */
        crossOver(mum, dad){
          const MUM=0, DAD=1;
          //first, calculate the genome we will using the disjoint/excess
          //genes from. This is the fittest genome.
          let best;
          //if they are of equal fitness use the shorter (because we want to keep
          //the networks as small as possible)
          if(mum.fitness().score() == dad.fitness().score()){
            best=mum.numGenes() == dad.numGenes() ? (_.randSign()>0?DAD:MUM)
                                                  : (mum.numGenes() < dad.numGenes()?MUM :DAD)
          }else{
            best = mum.fitness().score() > dad.fitness().score() ? MUM : DAD
          }
          //these vectors will hold the offspring's nodes and genes
          let babyNeurons=[],
              babyGenes=[],
              vecNeurons=[],
              //create iterators so we can step through each parents genes and set
              //them to the first gene of each parent
              //this will hold a copy of the gene we wish to add at each step
              curMum=0,curDad=0,selectedGene;
          //step through each parents genes until we reach the end of both
          while(!(curMum == mum.endOfGenes() && curDad == dad.endOfGenes())){
            if(curMum == mum.endOfGenes()&&curDad != dad.endOfGenes()){
              //the end of mum's genes have been reached
              if(best == DAD) selectedGene = dad.vecLinks[curDad];
              ++curDad;
            }else if(curDad == dad.endOfGenes() && curMum != mum.endOfGenes()){
              //the end of dads's genes have been reached
              if(best == MUM) selectedGene = mum.vecLinks[curMum];
              ++curMum;
            }else if(mum.vecLinks[curMum].innovationID < dad.vecLinks[curDad].innovationID){
              if(best == MUM) selectedGene = mum.vecLinks[curMum];
              ++curMum;
            }else if(dad.vecLinks[curDad].innovationID < mum.vecLinks[curMum].innovationID){
              if(best == DAD) selectedGene = dad.vecLinks[curDad];
              ++curDad;
            }else if(dad.vecLinks[curDad].innovationID == mum.vecLinks[curMum].innovationID){
              selectedGene=_.rand() < 0.5 ? mum.vecLinks[curMum] : dad.vecLinks[curDad];
              ++curMum;
              ++curDad;
            }
            //add the selected gene if not already added
            if(babyGenes.length == 0){
              babyGenes.push(selectedGene)
            }else if(_.last(babyGenes).innovationID != selectedGene.innovationID){
              babyGenes.push(selectedGene)
            }
            //Check if we already have the nodes referred to in SelectedGene.
            //If not, they need to be added.
            this.addNeuronID(selectedGene.fromNeuron, vecNeurons);
            this.addNeuronID(selectedGene.toNeuron, vecNeurons);
          }
          //now create the required nodes
          vecNeurons.sort();
          for(let i=0; i<vecNeurons.length; ++i)
            babyNeurons.push(this.innovHistory.createNeuronFromID(vecNeurons[i]));
          //finally, create the genome
          return Genome(NextGlobalGID(), mum.numInputs, mum.numOutputs, babyNeurons, babyGenes);
        },
        /**
         * @param {number} numComparisons
         * @return {Genome}
         */
        tournamentSelection(numComparisons){
          let chosenOne = 0,
              thisTry,bestFitnessSoFar = 0;
          //Select NumComparisons members from the population at random testing
          //against the best found so far
          for(let i=0; i<numComparisons; ++i){
            thisTry = _.randInt2(0, this.vecGenomes.length-1);
            if(this.vecGenomes[thisTry].fitness().score() > bestFitnessSoFar){
              chosenOne = thisTry;
              bestFitnessSoFar = this.vecGenomes[thisTry].fitness().score();
            }
          }
          return this.vecGenomes[chosenOne];
        },
        /**Searches the lookup table for the splitY value of each node
         * in the genome and returns the depth of the network based on this figure.
         * @param {Genome} gen
         * @return {number}
         */
        calculateNetDepth(gen){
          let maxSoFar = 0;
          for(let nd=0; nd<gen.numNeurons(); ++nd){
            for(let i=0; i<this.vecSplits.length; ++i)
              if(gen.splitY(nd) == this.vecSplits[i].val &&
                 this.vecSplits[i].depth > maxSoFar){
                maxSoFar = this.vecSplits[i].depth;
              }
          }
          return maxSoFar + 2;
        },
        /**Sorts the population into descending fitness, keeps a record of the best
         * n genomes and updates any fitness statistics accordingly.
         */
        sortAndRecord(){
          //sort the genomes according to their unadjusted (no fitness sharing) fitnesses
          this.vecGenomes.sort(Genome.SortFunc);
          //is the best genome this generation the best ever?
          if(this.vecGenomes[0].fitness().score() > this._bestEverFitness){
            this._bestEverFitness = this.vecGenomes[0].fitness().score()
          }
          this.storeBestGenomes();
        },
        /**Performs one epoch of the genetic algorithm and returns a vector of pointers to the new phenotypes.
         * @param {number[]} fitnessScores
         * @return {}
         */
        epoch(fitnessScores){
          _.assert(fitnessScores.length == this.vecGenomes.length, "NeatGA::Epoch(scores/ genomes mismatch)!");
          //reset appropriate values and kill off the existing phenotypes and any poorly performing species
          this.resetAndKill();
          //update the genomes with the fitnesses scored in the last run
          this.vecGenomes.forEach((g,i)=> g.setFitness(NumericFitness(fitnessScores[i])));
          //sort genomes and keep a record of the best performers
          this.sortAndRecord();
          //separate the population into species of similar topology, adjust
          //fitnesses and calculate spawn levels
          this.speciateAndCalculateSpawnLevels();
          //this will hold the new population of genomes
          let newPop=[],
              baby,
              //request the offspring from each species. The number of children to
              //spawn is a double which we need to convert to an int.
              numSpawnedSoFar = 0;
          //now to iterate through each species selecting offspring to be mated and mutated
          for(let spc=0; spc<this.vecSpecies.length; ++spc){
            //because of the number to spawn from each species is a double
            //rounded up or down to an integer it is possible to get an overflow
            //of genomes spawned. This statement just makes sure that doesn't happen
            if(numSpawnedSoFar < this.popSize){
              //this is the amount of offspring this species is required to
              // spawn. Rounded simply rounds the double up or down.
              let chosenBestYet = false,
                  numToSpawn = _.rounded(this.vecSpecies[spc].numToSpawn());
              while(numToSpawn--){
                //first grab the best performing genome from this species and transfer
                //to the new population without mutation. This provides per species elitism
                if(!chosenBestYet){
                  chosenBestYet = true;
                  baby = this.vecSpecies[spc].leader();
                }else{
                  //if the number of individuals in this species is only one
                  //then we can only perform mutation
                  if(this.vecSpecies[spc].numMembers() == 1){
                    baby = this.vecSpecies[spc].spawn()
                  }else{
                    let numAttempts = 5,
                        g2,g1 = this.vecSpecies[spc].spawn();
                    if(_.rand() < Params.crossOverRate){
                      g2 = this.vecSpecies[spc].spawn();
                      while(g1.id() == g2.id() && (numAttempts--)){
                        g2 = this.vecSpecies[spc].spawn()
                      }
                      if(g1.id() != g2.id())
                        baby = this.crossOver(g1, g2);
                    }else{
                      baby = g1
                    }
                  }
                  baby.setID(NextGlobalGID());
                  //now we have a spawned child lets mutate it! First there is the
                  //chance a neuron may be added
                  if(baby.numNeurons() < Params.maxPermittedNeurons)
                    baby.addNeuron(Params.chanceAddNode,
                                   this.innovHistory, Params.numTrysToFindOldLink);
                  //now there's the chance a link may be added
                  baby.addLink(Params.chanceAddLink,
                               Params.chanceAddRecurrentLink,
                               this.innovHistory,
                               Params.numTrysToFindLoopedLink, Params.numAddLinkAttempts);
                  //mutate the weights
                  baby.mutateWeights(Params.mutationRate,
                                     Params.probabilityWeightReplaced,
                                     Params.maxWeightPerturbation);
                  baby.mutateActivationResponse(Params.activationMutationRate,
                                                Params.maxActivationPerturbation);
                }
                //sort the babies genes by their innovation numbers
                baby.sortGenes();
                newPop.push(baby);
                ++numSpawnedSoFar;
                if(numSpawnedSoFar == this.popSize){ numToSpawn = 0 }
              }
            }
          }
          //if there is an underflow due to the rounding error and the amount
          //of offspring falls short of the population size additional children
          //need to be created and added to the new population. This is achieved
          //simply, by using tournament selection over the entire population.
          if(numSpawnedSoFar < this.popSize){
            //calculate amount of additional children required
            let rqd = this.popSize - numSpawnedSoFar;
            while(rqd--)
              newPop.push(this.tournamentSelection(int(this.popSize/ 5)));
          }
          //replace the current population with the new one
          this.vecGenomes = newPop;
          let out=this.vecGenomes.map((g,i)=> g.createPhenotype( this.calculateNetDepth(g)));
          ++this.generation;
          return out;
        },
        /**Cycles through all the members of the population and creates their phenotypes.
         * @return {NeuralNet[]} the new phenotypes
         */
        createPhenotypes(){
          return this.vecGenomes.map((g,i)=> g.createPhenotype( this.calculateNetDepth(g)))
        },
        /**Used to keep a record of the previous populations best genomes
         * so that they can be displayed if required.
         */
        storeBestGenomes(){
          this.vecBestGenomes.length=0;
          for(let i=0; i<Params.numBestElites; ++i)
            this.vecBestGenomes.push(this.vecGenomes[i]);
        },
        //renders the best performing species statistics and a visual aid
        //showing the distribution.
        renderSpeciesInfo(){},
        numSpecies(){return this.vecSpecies.length},
        bestEverFitness(){return this._bestEverFitness},
        /**
         * @return {NeuralNet[]} the n best phenotypes from the previous generation.
         */
        getBestPhenotypesFromLastGeneration(){
          return this.vecBestGenomes.map((g,i)=> {
            g.createPhenotype(this.calculateNetDepth(g))
          })
        }
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    const _$={
      NeatGA, NeuralNet,
      configParams(options){
        return _.inject(Params,options)
      }
    };

    return _$;
  }

  //export--------------------------------------------------------------------
  if(typeof module === "object" && module.exports){
    module.exports=_module(require("../main/core"))
  }else{
    global["io/czlab/mcfud/algo/NEAT"]=_module
  }

})(this)


