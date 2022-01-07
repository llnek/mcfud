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
    const neuron_type={
      input:0,
      hidden:1,
      output:2,
      bias:3,
      none:4
    };

    const innov_type={
      new_neuron:0,
      new_link:1
    };

    //  this function is used to create a lookup table that is used to
    //  calculate the depth of the network.
    //------------------------------------------------------------------------
    const vecSplits=[];
    function split(low, high, depth){
      let span = high-low;
      vecSplits.push(SplitDepth(low + span/2, depth+1));
      if(depth > 6){
        return vecSplits;
      }else{
        split(low, low+span/2, depth+1);
        split(low+span/2, high, depth+1);
        return vecSplits;
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function sigmoid(netinput, response) {
      return 1 / (1 + Math.exp(-netinput / response))
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function SNeuronGene(type, id, y, x, r = false){
      return{
        id,
        neuronType: type,
        recurrent: r,
        //position in network grid
        splitY: y,
        splitX: x,
        //sets the curvature of the sigmoid function
        activationResponse: 1
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function SLinkGene(in, out, enable, tag, w, rec = false){
      return{
        enabled:enable,
        innovationID: tag,
        //the IDs of the two neurons this link connects
        fromNeuron: in,
        toNeuron: out,
        weight: w,
        recurrent: rec
      }
    }

    function SLinkGeneSort(lhs, rhs){
      return lhs.innovationID<rhs.innovationID?-1:(
        lhs.innovationID>rhs.innovationID?1:0
      )
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function SLink(dW, pIn, pOut, bRec){
      return{
        weight:dW, in: pIn, out: pOut, recurrent: bRec }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function SNeuron(type, id, y, x, actResponse){
      return{
        neuronType: type,
        neuronID: id,
        //sum of weights x inputs
        sumActivation: 0,
        output: 0,

        //used in visualization of the phenotype
        posX: 0,
        posY: 0,
        splitY: y,
        splitX: x,

        //all the links coming into/out of this neuron
        vecLinksIn: [],
        vecLinksOut: [],
        //sets the curvature of the sigmoid function
        activationResponse: actResponse
      }
    }

    //you have to select one of these types when updating the network
    //If snapshot is chosen the network depth is used to completely
    //flush the inputs through the network. active just updates the
    //network each timestep
    const run_type={
      snapshot:0,
      active:1
    };

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    //  This is a fix to prevent neurons overlapping when they are displayed
    function tidyXSplits(neurons){
      //stores the index of any neurons with identical splitY values
      let sameLevelNeurons=[],
          //stores all the splitY values already checked
          depthsChecked=[];
      //for each neuron find all neurons of identical ySplit level
      for(let n=0; n<neurons.length; ++n){
        let bAlreadyChecked = false,
            thisDepth = neurons[n].splitY;
        for(let i=0; i<depthsChecked.length; ++i){
          if(depthsChecked[i] == thisDepth){
            bAlreadyChecked = true;
            break;
          }
        }
        //add this depth to the depths checked.
        depthsChecked.push(thisDepth);
        //if this depth has not already been adjusted
        if(!bAlreadyChecked){
          //clear this storage and add the neuron's index we are checking
          sameLevelNeurons.length=0;
          sameLevelNeurons.push(n);
          //find all the neurons with this splitY depth
          for(let i=n+1; i<neurons.length; ++i){
            if(neurons[i].splitY == thisDepth){
              //add the index to this neuron
              sameLevelNeurons.push(i);
            }
          }
          //calculate the distance between each neuron
          let slice = 1/(sameLevelNeurons.length+1);
          //separate all neurons at this level
          for(let idx,i=0; i<sameLevelNeurons.length; ++i){
            idx = sameLevelNeurons[i];
            neurons[idx].splitX = (i+1) * slice;
          }
        }
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function CNeuralNet(neurons, depth){
      return{
        vecpNeurons: neurons,
        depth,
        //  takes a list of doubles as inputs into the network then steps through
        //  the neurons calculating each neurons next output.
        //  finally returns a std::vector of doubles as the output from the net.
        //update network for this clock cycle
        update(inputs, type){
          let outputs=[],
              //if the mode is snapshot then we require all the neurons to be
              //iterated through as many times as the network is deep. If the
              //mode is set to active the method can return an output after
              //just one iteration
              flushCount = 0;
          if(type == run_type.snapshot){
            flushCount = this.depth;
          }else{
            flushCount = 1;
          }
          //iterate through the network FlushCount times
          for(let cur,sum,cNeuron, i=0; i<flushCount; ++i){
            //clear the output vector
            outputs.length=0;
            //this is an index into the current neuron
            cNeuron=0;
            //first set the outputs of the 'input' neurons to be equal
            //to the values passed into the function in inputs
            while(this.vecpNeurons[cNeuron].neuronType == input){
              this.vecpNeurons[cNeuron].output = inputs[cNeuron];
              ++cNeuron;
            }
            //set the output of the bias to 1
            this.vecpNeurons[cNeuron++].output = 1;
            //then we step through the network a neuron at a time
            while(cNeuron < this.vecpNeurons.length){
              cur= this.vecpNeurons[cNeuron];
              //this will hold the sum of all the inputs x weights
              sum = 0;
              //sum this neuron's inputs by iterating through all the links into
              //the neuron
              for(let w,n,lnk=0; lnk<this.vecpNeurons[cNeuron].vecLinksIn.length; ++lnk){
                //get this link's weight
                w= cur.vecLinksIn[lnk].weight;
                //get the output from the neuron this link is coming from
                n= cur.vecLinksIn[lnk].in.output;
                sum += w* n;
              }
              //now put the sum through the activation function and assign the
              //value to this neuron's output
              cur.output = sigmoid(sum, cur.activationResponse);
              if(cur.neuronType == neuron_type.output){
                //add to our outputs
                outputs.push(cur.output);
              }
              ++cNeuron;
            }
          }
          //the network needs to be flushed if this type of update is performed
          //otherwise it is possible for dependencies to be built on the order
          //the training data is presented
          if(type == run_type.snapshot){
            for(let n=0; n<this.vecpNeurons.length; ++n){
              this.vecpNeurons[n].output = 0
            }
          }
          return outputs;
        },
        //draws a graphical representation of the network to a user speciefied window
        drawNet(gfx, left, right, top, bottom){
          const border = 10,
                //max line thickness
                maxThickness = 5;
          tidyXSplits(this.vecpNeurons);
          //go through the neurons and assign x/y coords
          let cur,cNeuron,
              spanX = right - left,
              spanY = top - bottom - (2*border);
          for(cNeuron=0; cNeuron<this.vecpNeurons.length; ++cNeuron){
            cur=this.vecpNeurons[cNeuron];
            cur.posX = left + spanX*cur.splitX;
            cur.posY = (top - border) - (spanY * cur.splitY);
          }
          //create some pens and brushes to draw with
          HPEN GreyPen  = CreatePen(PS_SOLID, 1, RGB(200, 200, 200));
          HPEN RedPen   = CreatePen(PS_SOLID, 1, RGB(255, 0, 0));
          HPEN GreenPen = CreatePen(PS_SOLID, 1, RGB(0, 200, 0));
          HPEN OldPen   = NULL;
          //create a solid brush
          HBRUSH RedBrush = CreateSolidBrush(RGB(255, 0, 0));
          HBRUSH OldBrush = NULL;
          OldPen =   (HPEN)  SelectObject(surface, RedPen);
          OldBrush = (HBRUSH)SelectObject(surface, GetStockObject(HOLLOW_BRUSH));
          //radius of neurons
          let radNeuron = spanX/60,
              radLink = radNeuron * 1.5;
          //now we have an X,Y pos for every neuron we can get on with the
          //drawing. First step through each neuron in the network and draw the links
          for(cNeuron=0; cNeuron<this.vecpNeurons.length; ++cNeuron){
            //grab this neurons position as the start position of each
            //connection
            cur=this.vecpNeurons[cNeuron];
            let bBias=false,
                startX = cur.posX,
                startY = cur.posY;
            if(cur.neuronType == neuron_type.bias){
              bBias = true
            }
            //now iterate through each outgoing link to grab the end points
            for(let thick,ex,ey,cLnk=0; cLnk<cur.vecLinksOut.length; ++cLnk){
              ex = cur.vecLinksOut[cLnk].out.posX;
              ey = cur.vecLinksOut[cLnk].out.posY;
              //if link is forward draw a straight line
              if((!cur.vecLinksOut[cLnk].recurrent) && !bBias){
                thick= int(Math.abs(cur.vecLinksOut[cLnk].weight));
                Clamp(thick, 0, MaxThickness);
                //create a yellow pen for inhibitory weights
                if(cur.vecLinksOut[cLnk].weight <= 0){
                  Pen  = CreatePen(PS_SOLID, thick, RGB(240, 230, 170));
                }else{ //grey for excitory
                  Pen  = CreatePen(PS_SOLID, thick, RGB(200, 200, 200));
                }
                HPEN tempPen = (HPEN)SelectObject(surface, Pen);
                //draw the link
                MoveToEx(surface, StartX, StartY, NULL);
                LineTo(surface, EndX, EndY);
                SelectObject(surface, tempPen);
                DeleteObject(Pen);
              }else if((!cur.vecLinksOut[cLnk].recurrent) && bBias){
                SelectObject(surface, GreenPen);
                //draw the link
                MoveToEx(surface, StartX, StartY, NULL);
                LineTo(surface, EndX, EndY);
              }else{ //recurrent link draw in red
                if(startX == ex && startY == ey){
                  thick= int(Math.abs(cur.vecLinksOut[cLnk].weight));
                  Clamp(thick, 0, MaxThickness);
                  //blue for inhibitory
                  if(cur.vecLinksOut[cLnk].weight <= 0){
                    Pen  = CreatePen(PS_SOLID, thick, RGB(0,0,255));
                  }else{ //red for excitory
                    Pen  = CreatePen(PS_SOLID, thick, RGB(255, 0, 0));
                  }
                  HPEN tempPen = (HPEN)SelectObject(surface, Pen);
                  //we have a recursive link to the same neuron draw an ellipse
                  let x = cur.posX,
                      y = cur.posY - (1.5 * radNeuron);
                  Ellipse(surface, x-radLink, y-radLink, x+radLink, y+radLink);
                  SelectObject(surface, tempPen);
                  DeleteObject(Pen);
                }else{
                  thick= int(Math.fabs(cur.vecLinksOut[cLnk].weight));
                  Clamp(thickness, 0, MaxThickness);
                  HPEN Pen;
                  //blue for inhibitory
                  if(cur.vecLinksOut[cLnk].weight <= 0){
                    Pen  = CreatePen(PS_SOLID, thickness, RGB(0,0,255));
                  }else{ //red for excitory
                    Pen  = CreatePen(PS_SOLID, thickness, RGB(255, 0, 0));
                  }
                  HPEN tempPen = (HPEN)SelectObject(surface, Pen);
                  //draw the link
                  MoveToEx(surface, StartX, StartY, NULL);
                  LineTo(surface, EndX, EndY);
                  SelectObject(surface, tempPen);
                  DeleteObject(Pen);
                }
              }
            }
          }
          //now draw the neurons and their IDs
          SelectObject(surface, RedBrush);
          SelectObject(surface, GetStockObject(BLACK_PEN));
          for(cNeuron=0; cNeuron<this.vecpNeurons.length; ++cNeuron){
            let x = cur.posX,
                y = cur.posY;
            //display the neuron
            Ellipse(surface, x-radNeuron, y-radNeuron, x+radNeuron, y+radNeuron);
          }
          //cleanup
          SelectObject(surface, OldPen);
          SelectObject(surface, OldBrush);
          DeleteObject(RedPen);
          DeleteObject(GreyPen);
          DeleteObject(GreenPen);
          DeleteObject(OldPen);
          DeleteObject(RedBrush);
          DeleteObject(OldBrush);
        }
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function GenomeSort(lhs, rhs){
      return lhs.fitness.gt(rhs.fitness)?-1:(
        lhs.fitness.lt(rhs.fitness)?1:0
      )
    }

    //------------------------------------------------------------------------
    //  this constructor creates a minimal genome where there are output +
    //  input neurons and each input neuron is connected to each output neuron.
    function CGenome(id, inputs, outputs, extra){
      let vecLinks=[],
          vecNeurons= [];
      if(extra){
        extra.neurons.forEach(n=> vecNeurons.push(n));
        extra.genes.forEach(n=> vecLinks.push(n));
      }else{
        //create the input neurons
        let i,inputRowSlice = 1/(inputs+2);
        for(i=0; i<inputs; ++i){
          vecNeurons.push(SNeuronGene(neuron_type.input, i, 0, (i+2)*inputRowSlice))
        }
        //create the bias
        vecNeurons.push(SNeuronGene(neuron_type.bias, inputs, 0, inputRowSlice));
        //create the output neurons
        let outputRowSlice = 1/(outputs+1);
        for(i=0; i<outputs; ++i){
          vecNeurons.push(SNeuronGene(output, i+inputs+1, 1, (i+1)*outputRowSlice))
        }
        //create the link genes, connect each input neuron to each output neuron and
        //assign a random weight -1 < w < 1
        for(i=0; i<inputs+1; ++i)
          for(let j=0; j<outputs; ++j)
            vecLinks.push(SLinkGene(vecNeurons[i].ID,
                                    vecNeurons[inputs+j+1].ID,
                                    true,
                                    inputs+outputs+1+vecLinks.length, _.randMinus1To1()));
      }
      return{
        adjustedFitness: NumericFitness(0),
        fitness: NumericFitness(0),
        phenotype:null,
        genomeID: id,
        numInputs: inputs,
        numOutPuts: outputs,
        amountToSpawn: 0,
        species: 0,
        vecLinks,
        vecNeurons,
        copy(){
        },
        //  Creates a neural network based upon the information in the genome.
        //  Returns a pointer to the newly created ANN
        createPhenotype(depth){
          let e,f,t,tmp,neurons=[];
          //first, create all the required neurons
          this.vecNeurons.forEach(cur=>{
            neurons.push(SNeuron(cur.neuronType, cur.ID,
                                 cur.splitY, cur.splitX, cur.activationResponse))
          });
          this.vecLinks.forEach(cur=>{
            if(cur.enabled){
              e= this.getElementPos(cur.FromNeuron);
              f= neurons[e];
              e= this.getElementPos(cur.toNeuron);
              t= neurons[e];
              tmp=SLink(cur.weight, f, t, cur.recurrent);
              f.vecLinksOut.push(tmp);
              t.vecLinksIn.push(tmp);
            }
          });
          //now the neurons contain all the connectivity information, a neural
          //network may be created from them.
          return this.phenotype = CNeuralNet(neurons, depth);
        },
        //  given a neuron ID this little function just finds its position in
        //  m_vecNeurons
        getElementPos(neuron_id){
          for(let i=0; i<this.vecNeurons.length; ++i){
            if(this.vecNeurons[i].ID == neuron_id) return i;
          }
          _.assert(false, `Error in CGenome::GetElementPos`);
        },
        duplicateLink(neuronIn, neuronOut){
          for(let cGene=0; cGene<this.vecLinks.length; ++cGene){
            if(this.vecLinks[cGene].fromNeuron == neuronIn &&
               this.vecLinks[cGene].toNeuron == neuronOut) return true;
          }
          return false;
        },
        // create a new link with the probability of CParams::dChanceAddLink
        addLink(MutationRate, ChanceOfLooped, innovation, numTrysToFindLoop, numTrysToAddLink){
          if(_.rand() > MutationRate) return;
          let ID_neuron1 = -1,
              ID_neuron2 = -1,
              bRecurrent = false;
          let id,cur,neuronPos;
          if(_.rand() < ChanceOfLooped){
            //find a neuron that is not an input or bias neuron and that does not already have a loopback connection
            while(numTrysToFindLoop--){
              neuronPos = _.randInt2(this.numInputs+1, this.vecNeurons.length-1);
              cur=this.m_vecNeurons[neuronPos];
              //check to make sure the neuron does not already have a loopback
              //link and that it is not an input or bias neuron
              if(!cur.recurrent &&
                 cur.neuronType != neuron_type.bias &&
                 cur.neuronType != neuron_type.input){
                ID_neuron1 = ID_neuron2 = cur.ID;
                cur.recurrent = true;
                bRecurrent = true;
                numTrysToFindLoop = 0;
              }
            }
          }else{ //No: try to find two unlinked neurons. Make NumTrysToAddLink attempts
            while(numTrysToAddLink--){
              ID_neuron1 = this.vecNeurons[_.randInt2(0, this.vecNeurons.length-1)].ID;
              ID_neuron2 = this.vecNeurons[_.randInt2(this.numInputs+1, this.vecNeurons.length-1)].ID;
              if(ID_neuron2 == 2){ continue }
              //make sure these two are not already linked and that they are not the same neuron
              if(!(this.duplicateLink(ID_neuron1, ID_neuron2) || ID_neuron1 == ID_neuron2)){
                numTrysToAddLink = 0;
              }else{
                ID_neuron1 = -1;
                ID_neuron2 = -1;
              }
            }
          }
          if(ID_neuron1 < 0 || ID_neuron2 < 0){ return }
          //check to see if we have already created this innovation
          id = innovation.checkInnovation(ID_neuron1, ID_neuron2, innov_type.new_link);
          if(this.vecNeurons[this.getElementPos(ID_neuron1)].splitY >
             this.vecNeurons[this.getElementPos(ID_neuron2)].splitY){
            bRecurrent = true;
          }
          if(id < 0){ //we need to create a new innovation
            innovation.createNewInnovation(ID_neuron1, ID_neuron2, innov_type.new_link);
            //then create the new gene
            this.vecLinks.push(SLinkGene(ID_neuron1,
                                         ID_neuron2,
                                         true,
                                         innovation.nextNumber()-1, _.randMinus1To1(), bRecurrent))
          }else{
            //the innovation has already been created so all we need to
            //do is create the new gene using the existing innovation ID
            this.vecLinks.push(SLinkGene(ID_neuron1,
                                         ID_neuron2,
                                         true,
                                         id, _.randMinus1To1(), bRecurrent))
          }
        },
        //  this function adds a neuron to the genotype by examining the network,
        //  splitting one of the links and inserting the new neuron.
        addNeuron(MutationRate, innovations, numTrysToFindOldLink){
          if(_.rand() > MutationRate) return;
          let bDone = false,
              chosenLink = 0;
          //first a link is chosen to split. If the genome is small the code makes
          //sure one of the older links is split to ensure a chaining effect does
          //not occur. Here, if the genome contains less than 5 hidden neurons it
          //is considered to be too small to select a link at random
          const sizeThreshold = this.numInputs + this.numOutPuts + 5;
          if(this.vecLinks.length < sizeThreshold){
            while(numTrysToFindOldLink--){
              //choose a link with a bias towards the older links in the genome
              chosenLink = _.randInt2(0, this.numGenes()-1-int(Math.sqrt(this.numGenes())));
              //make sure the link is enabled and that it is not a recurrent link or has a bias input
              let fromNeuron = this.vecLinks[chosenLink].fromNeuron;
              if(this.vecLinks[chosenLink].enabled &&
                 !this.vecLinks[chosenLink].recurrent &&
                 this.vecNeurons[this.getElementPos(fromNeuron)].neuronType != neuron_type.bias){
                bDone = true;
                numTrysToFindOldLink = 0;
              }
            }
            //failed to find a decent link
            if(!bDone){ return }
          }else{
            //the genome is of sufficient size for any link to be acceptable
            while(!bDone){
              chosenLink = _.randInt2(0, this.numGenes()-1);
              //make sure the link is enabled and that it is not a recurrent link
              //or has a BIAS input
              let fromNeuron = this.vecLinks[chosenLink].fromNeuron;
              if(this.vecLinks[chosenLink].enabled &&
                 !this.vecLinks[chosenLink].recurrent &&
                 this.vecNeurons[this.getElementPos(fromNeuron)].neuronType != neuron_type.bias){
                bDone = true;
              }
            }
          }
          this.vecLinks[chosenLink].enabled = false;
          //grab the weight from the gene (we want to use this for the weight of
          //one of the new links so that the split does not disturb anything the
          //NN may have already learned...
          let originalWeight = this.vecLinks[chosenLink].weight;
          //identify the neurons this link connects
          let from =  this.vecLinks[chosenLink].fromNeuron;
          let to_   =  this.vecLinks[chosenLink].toNeuron;
          //calculate the depth and width of the new neuron. We can use the depth
          //to see if the link feeds backwards or forwards
          let newDepth = (this.vecNeurons[this.getElementPos(from)].splitY +
                          this.vecNeurons[this.getElementPos(to_)].splitY) /2;
          let newWidth = (this.vecNeurons[this.getElementPos(from)].splitX +
                          this.vecNeurons[this.getElementPos(to_)].splitX) /2;
          //Now to see if this innovation has been created previously by
          //another member of the population
          let id = innovations.checkInnovation(from, to_, innov_type.new_neuron);
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
          if(id >= 0){
            let neuronID = innovations.getNeuronID(id);
            if(this.alreadyHaveThisNeuronID(neuronID)){
              id = -1;
            }
          }
          if(id < 0){
            //add the innovation for the new neuron
            let newNeuronID = innovations.createNewInnovation(from,
                                                              to_,
                                                              innov_type.new_neuron,
                                                              hidden, newWidth, newDepth);
            //create the new neuron gene and add it.
            this.vecNeurons.push(SNeuronGene(hidden, newNeuronID, newDepth, newWidth));
            //Two new link innovations are required, one for each of the
            //new links created when this gene is split.
            //-----------------------------------first link
            //get the next innovation ID
            let idLink1 = innovations.nextNumber();
            //create the new innovation
            innovations.createNewInnovation(from, newNeuronID, innov_type.new_link);
            this.vecLinks.push(SLinkGene(from, newNeuronID, true, idLink1, 1));
            //-----------------------------------second link
            //get the next innovation ID
            let idLink2 = innovations.nextNumber();
            //create the new innovation
            innovations.createNewInnovation(newNeuronID, to_, innov_type.new_link);
            this.vecLinks.push(SLinkGene(newNeuronID, to_, true, idLink2, originalWeight));
          }else{
            //this innovation has already been created so grab the relevant neuron
            //and link info from the innovation database
            let newNeuronID = innovations.getNeuronID(id);
            //get the innovation IDs for the two new link genes.
            let idLink1 = innovations.checkInnovation(from, newNeuronID, innov_type.new_link);
            let idLink2 = innovations.checkInnovation(newNeuronID, to_, innov_type.new_link);
            //this should never happen because the innovations *should* have already occurred
            if(idLink1 < 0 || idLink2 < 0){
              _.assert(false, `Error in CGenome::AddNeuron`);
            }
            //now we need to create 2 new genes to represent the new links
            this.vecLinks.push(SLinkGene(from, newNeuronID, true, idLink1, 1));
            this.vecLinks.push(SLinkGene(newNeuronID, to_, true, idLink2, originalWeight));
            this.vecNeurons.push(SNeuronGene(hidden, newNeuronID, newDepth, newWidth));
          }
        },
        // tests to see if the parameter is equal to any existing neuron ID's.
        // Returns true if this is the case.
        alreadyHaveThisNeuronID(ID){
          for(let n=0; n<this.vecNeurons.length; ++n){
            if(ID == this.vecNeurons[n].ID)
              return true;
          }
          return false;
        },
        //  Iterates through the genes and purturbs the weights given a
        //  probability mut_rate.
        //  prob_new_mut is the chance that a weight may get replaced by a
        //  completely new weight.
        //  dMaxPertubation is the maximum perturbation to be applied.
        //  type is the type of random number algorithm we use
        mutateWeights(mut_rate, prob_new_mut, MaxPertubation){
          for(let cGen=0; cGen<this.vecLinks.length; ++cGen){
            if(_.rand() < mut_rate){
              if(_.rand() < prob_new_mut){
                //change the weight using the random distribtion defined by 'type'
                this.vecLinks[cGen].weight = _.randMinus1To1()
              }else{
                this.vecLinks[cGen].weight += _.randMinus1To1() * MaxPertubation
              }
            }
          }
        },
        mutateActivationResponse(mut_rate, MaxPertubation){
          for(let cGen=0; cGen<this.vecNeurons.length; ++cGen){
            if(_.rand() < mut_rate)
              this.vecNeurons[cGen].activationResponse += _.randMinus1To1() * MaxPertubation
          }
        },
        //  this function returns a score based on the compatibility of this
        //  genome with the passed genome
        getCompatibilityScore(genome){
          //travel down the length of each genome counting the number of
          //disjoint genes, the number of excess genes and the number of
          //matched genes
          let numDisjoint = 0,
              numExcess   = 0,
              numMatched  = 0,
              //this records the summed difference of weights in matched genes
              weightDifference = 0,
              //position holders for each genome. They are incremented as we
              //step down each genomes length.
              g1 = 0,
              g2 = 0;
          while((g1 < this.vecLinks.length-1) || (g2 < genome.vecLinks.length-1)){
            //we've reached the end of genome1 but not genome2 so increment the excess score
            if(g1 == this.vecLinks.length-1){
              ++g2;
              ++numExcess;
              continue;
            }
            //and vice versa
            if(g2 == genome.vecLinks.length-1){
              ++g1;
              ++numExcess;
              continue;
            }
            //get innovation numbers for each gene at this point
            let id1 = this.vecLinks[g1].innovationID,
                id2 = genome.vecLinks[g2].innovationID;
            //innovation numbers are identical so increase the matched score
            if(id1 == id2){
              ++g1;
              ++g2;
              ++numMatched;
              //get the weight difference between these two genes
              weightDifference += Math.abs(this.vecLinks[g1].weight - genome.vecLinks[g2].weight);
            }
            //innovation numbers are different so increment the disjoint score
            if(id1 < id2){
              ++numDisjoint;
              ++g1;
            }
            if(id1 > id2){
              ++numDisjoint;
              ++g2;
            }
          }
          //get the length of the longest genome
          let longest = genome.numGenes();
          if(this.numGenes() > longest){
            longest = this.numGenes();
          }
          //these are multipliers used to tweak the final score.
          const Disjoint = 1;
          const Excess   = 1;
          const Matched  = 0.4;
          //finally calculate the scores
          return (Excess * numExcess/longest) +
                 (Disjoint * numDisjoint/longest) +
                 (Matched * weightDifference / numMatched);
        },
        sortGenes(){
          this.vecLinks.sort();
        },
        ID(){return this.genomeID},
        setID(val){this.genomeID = val},
        numGenes(){return this.vecLinks.length},
        numNeurons(){return this.vecNeurons.length},
        numInputs(){return this.numInputs},
        numOutputs(){return this.numOutPuts},
        amountToSpawn(){return this.amountToSpawn},
        setAmountToSpawn(num){this.amountToSpawn = num},
        setFitness(num){this.fitness = NumericFitness(num)},
        setAdjFitness(num){this.adjustedFitness = NumericFitness(num)},
        fitness(){return this.fitness},
        getAdjFitness(){return this.adjustedFitness},
        getSpecies(){return this.species},
        setSpecies(spc){this.species = spc},
        splitY(val){return this.vecNeurons[val].splitY},
        genes(){return this.vecLinks},
        neurons(){return this.vecNeurons}
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function SInnovation(in, out, t, inov_id, type=neuron_type.none, x=0, y=0){
      return{
        neuronIn:in,
        neuronOut:out,
        innovationType:t,
        innovationID:inov_id,
        neuronID:0,
        neuronType:type,
        splitX:x,
        splitY:y
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function SInnovationEx(neuron, innov_id, neuron_id){
      return{
        neuronType: neuron.neuronType,
        innovationID: innov_id,
        neuronID: neuron_id,
        splitX: neuron.splitX,
        splitY: neuron.splitY,
        neuronIn: -1,
        neuronOut: -1
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function CInnovation(start_genes, start_neurons){
      let nextNeuronID=	0,
          vecInnovs=[],
          nextInnovationNum= 0;
      //add the neurons
      for(let nd=0; nd<start_neurons.length; ++nd){
        vecInnovs.push(SInnovationEx(start_neurons[nd], nextInnovationNum++, nextNeuronID++))
      }
      //add the links
      for(let cGen = 0; cGen<start_genes.length; ++cGen){
        vecInnovs.push(SInnovation(start_genes[cGen].fromNeuron,
                                   start_genes[cGen].toNeuron,
                                   innov_type.new_link, nextInnovationNum));

        ++nextInnovationNum;
      }
      return{
        vecInnovs,
        nextNeuronID,
        nextInnovationNum,
        //	checks to see if this innovation has already occurred. If it has it
        //	returns the innovation ID. If not it returns a negative value.
        checkInnovation(in, out, type){
          //iterate through the innovations looking for a match on all three parameters
          for(let inv=0; inv<this.vecInnovs.length; ++inv){
            if(this.vecInnovs[inv].neuronIn == in   &&
               this.vecInnovs[inv].neuronOut == out &&
               this.vecInnovs[inv].innovationType == type){
              return this.vecInnovs[inv].innovationID
            }
          }
          return -1;
        },
        //	creates a new innovation and returns its ID
        createNewInnovation(in, out, type){
          let new_innov= SInnovation(in, out, type, this.nextInnovationNum);
          if(type == innov_type.new_neuron){
            new_innov.neuronID = this.nextNeuronID;
            ++this.nextNeuronID;
          }
          this.vecInnovs.push(new_innov);
          ++this.nextInnovationNum;
          return (this.nextNeuronID-1);
        },
        //  as above but includes adding x/y position of new neuron
        createNewInnovation2(from, to, innovType, neuronType, x, y){
          let new_innov = SInnovation(from, to, innovType, this.nextInnovationNum, neuronType, x, y);
          if(innovType == innov_type.new_neuron){
            new_innov.neuronID = this.nextNeuronID;
            ++this.nextNeuronID;
          }
          this.vecInnovs.push(new_innov);
          ++this.nextInnovationNum;
          return (this.nextNeuronID-1);
        },
        //  given a neuron ID this function returns a clone of that neuron
        createNeuronFromID(neuronID){
          let temp=SNeuronGene(hidden,0,0,0);
          for(let inv=0; inv<this.vecInnovs.length; ++inv){
            if(this.vecInnovs[inv].neuronID == neuronID){
              temp.neuronType = this.vecInnovs[inv].neuronType;
              temp.ID      = this.vecInnovs[inv].neuronID;
              temp.splitY  = this.vecInnovs[inv].splitY;
              temp.splitX  = this.vecInnovs[inv].splitX;
              return temp;
            }
          }
          return temp;
        },
        flush(){this.vecInnovs.length=0},
        nextNumber(num = 0){
          this.nextInnovationNum += num;
          return this.nextInnovationNum;
        },
        getNeuronID(inv){return this.vecInnovs[inv].neuronID}
      }
    }

    //;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    function SpeciesSort(lhs,rhs){
      return lhs.bestFitness.gt(rhs.bestFitness)?-1:(
        lhs.bestFitness.lt(rhs.bestFitness)?1:0
      )
    }

    //------------------------------------------------------------------------
    //  the initializing genome is kept in m_Leader and the first element
    //  of m_vecMembers is a pointer to that genome.
    function CSpecies(firstOrg, speciesID){
      let vecMembers=[firstOrg];
      return{
        bestFitness: firstOrg.fitness.clone(),
        gensNoImprovement:0,
        leader:firstOrg,
        age:0,
        spawnsRqd:0,
        speciesID,
        vecMembers,
        //  this function adds a new member to this species and updates the member
        //  variables accordingly
        addMember(newMember){
          //is the new member's fitness better than the best fitness?
          if(newMember.fitness.gt(this.bestFitness)){
            this.bestFitness = newMember.fitness.clone();
            this.gensNoImprovement = 0;
            this.leader = newMember;
          }
          this.vecMembers.push(newMember);
        },
        //  this functions clears out all the members from the last generation,
        //  updates the age and gens no improvement.
        purge(){
          this.vecMembers.length=0;
          ++this.age;
          ++this.gensNoImprovement;
          this.spawnsRqd = 0;
        },
        //  This function adjusts the fitness of each individual by first
        //  examining the species age and penalising if old, boosting if young.
        //  Then we perform fitness sharing by dividing the fitness by the number
        //  of individuals in the species. This ensures a species does not grow
        //  too large
        adjustFitnesses(){
          let total = 0;
          for(let gen=0; gen<this.vecMembers.length; ++gen){
            let score = this.vecMembers[gen].fitness.score();
            //boost the fitness scores if the species is young
            if(this.age < CParams::iYoungBonusAgeThreshhold){
              score *= CParams::dYoungFitnessBonus;
            }
            //punish older species
            if(this.age > CParams::iOldAgeThreshold){
              score *= CParams::dOldAgePenalty;
            }
            total += score;
            //apply fitness sharing to adjusted fitnesses
            this.vecMembers[gen].setAdjFitness(score/this.vecMembers.length);
          }
        },
        //  Simply adds up the expected spawn amount for each individual in the
        //  species to calculate the amount of offspring this species should
        //  spawn
        calculateSpawnAmount(){
          for(let gen=0; gen<this.vecMembers.length; ++gen){
            this.spawnsRqd += this.vecMembers[gen].amountToSpawn()
          }
        },
        //  Returns a random genome selected from the best individuals
        spawn(){
          let baby;
          if(this.vecMembers.length == 1){
            baby = this.vecMembers[0];
          }else{
            let n = int(CParams::dSurvivalRate * this.vecMembers.length)-1;
            if(n<0)n=0;
            let theOne = _.randInt2(0, n);
            baby = this.vecMembers[theOne];
          }
          return baby;
        },
        numToSpawn(){return this.spawnsRqd},
        numMembers(){return this.vecMembers.length},
        ID(){return this.speciesID},
        speciesLeaderFitness(){return this.leader.fitness}
      }
    }

    //------------------------------------------------------------------------
    //  this structure is used in the creation of a network depth lookup
    //  table.
    function SplitDepth(v, d){
      return{ val:v, depth:d }
    }

    //-------------------------------------------------------------------------
    //	this constructor creates a base genome from supplied values and creates
    //	a population of 'size' similar (same topology, varying weights) genomes
    function Cga(size, inputs, outputs, cx, cy){
      let vecGenomes=[],
          vecSplits=[],
          nextGenomeID=0,
          //create the innovation list. First create a minimal genome
          genome= CGenome(1, inputs, outputs);

      for(let i=0; i<size; ++i){
        vecGenomes.push(CGenome(nextGenomeID++, inputs, outputs))
      }
      //create the network depth lookup table
      vecSplits = Split(0, 1, 0);

      return{
        //create the innovations
        innovation: CInnovation(genome.genes(), genome.neurons());
        popSize: size,
        generation:0,
        nextSpeciesID: 0,
        fittestGenome: 0,
        bestEverFitness: NumericFitness(0),
        totFitAdj:0,
        avFitAdj:0,
        nextGenomeID,
        vecGenomes,
        //	cycles through all the members of the population and creates their
        //  phenotypes. Returns a vector containing pointers to the new phenotypes
        createPhenotypes(){
          let networks=[];
          for(let i=0; i<this.popSize; ++i){
            let depth = this.calculateNetDepth(this.vecGenomes[i]);
            //create new phenotype
            let net = this.vecGenomes[i].createPhenotype(depth);
            networks.push(net);
          }
          return networks;
        },
        //  searches the lookup table for the dSplitY value of each node in the
        //  genome and returns the depth of the network based on this figure
        calculateNetDepth(gen){
          let MaxSoFar = 0;
          for(let nd=0; nd<gen.numNeurons(); ++nd){
            for(let i=0; i<vecSplits.length; ++i){
              if(gen.splitY(nd) == vecSplits[i].val && vecSplits[i].depth > MaxSoFar){
                MaxSoFar = vecSplits[i].depth;
              }
            }
          }
          return MaxSoFar + 2;
        },
        //	just checks to see if a node ID has already been added to a vector of
        //  nodes. If not 	then the new ID  gets added. Used in Crossover.
        addNeuronID(nodeID, vec){
          for(let i=0; i<vec.length; ++i){
            if(vec[i] == nodeID){
              //already added
              return;
            }
          }
          vec.push(nodeID);
        },
        //  This function performs one epoch of the genetic algorithm and returns
        //  a vector of pointers to the new phenotypes
        epoch(fitnessScores){
          //first check to make sure we have the correct amount of fitness scores
          if(fitnessScores.length != this.vecGenomes.length){
            _.assert(false,`epoch(scores/ genomes mismatch)!`)
          }
          //reset appropriate values and kill off the existing phenotypes and
          //any poorly performing species
          this.resetAndKill();
          //update the genomes with the fitnesses scored in the last run
          for(let gen=0; gen<this.vecGenomes.length; ++gen){
            this.vecGenomes[gen].setFitness(fitnessScores[gen])
          }
          //sort genomes and keep a record of the best performers
          this.sortAndRecord();
          //separate the population into species of similar topology, adjust
          //fitnesses and calculate spawn levels
          this.speciateAndCalculateSpawnLevels();
          //this will hold the new population of genomes
          let baby,
              newPop=[],
              //request the offspring from each species. The number of children to
              //spawn is a double which we need to convert to an int.
              numSpawnedSoFar = 0;
          //now to iterate through each species selecting offspring to be mated and mutated
          for(let spc=0; spc<this.vecSpecies.length; ++spc){
            //because of the number to spawn from each species is a double
            //rounded up or down to an integer it is possible to get an overflow
            //of genomes spawned. This statement just makes sure that doesn't
            //happen
            if(numSpawnedSoFar < CParams::iNumSweepers){
              //this is the amount of offspring this species is required to
              // spawn. Rounded simply rounds the double up or down.
              let numToSpawn = Math.round(this.vecSpecies[spc].numToSpawn());
              let bChosenBestYet = false;
              while(numToSpawn--){
                //first grab the best performing genome from this species and transfer
                //to the new population without mutation. This provides per species
                //elitism
                if(!bChosenBestYet){
                  baby = this.vecSpecies[spc].leader;
                  bChosenBestYet = true;
                }else{
                  //if the number of individuals in this species is only one
                  //then we can only perform mutation
                  if(this.vecSpecies[spc].numMembers() == 1){
                    //spawn a child
                    baby = this.vecSpecies[spc].spawn();
                  }else{ //if greater than one we can use the crossover operator
                    //spawn1
                    let g1 = this.vecSpecies[spc].spawn();
                    if(_.rand() < CParams::dCrossoverRate){
                      //spawn2, make sure it's not the same as g1
                      let g2 = this.vecSpecies[spc].spawn();
                      //number of attempts at finding a different genome
                      let numAttempts = 5;
                      while(g1.ID() == g2.ID() && (numAttempts--)){
                        g2 = this.vecSpecies[spc].spawn();
                      }
                      if(g1.ID() != g2.ID()){
                        baby = this.crossOver(g1, g2);
                      }
                    }else{
                      baby = g1;
                    }
                  }
                  ++this.nextGenomeID;
                  baby.setID(this.nextGenomeID);
                  //now we have a spawned child lets mutate it! First there is the
                  //chance a neuron may be added
                  if(baby.numNeurons() < CParams::iMaxPermittedNeurons){
                    baby.addNeuron(CParams::dChanceAddNode,
                                   this.innovation,
                                   CParams::iNumTrysToFindOldLink);
                  }
                  //now there's the chance a link may be added
                  baby.addLink(CParams::dChanceAddLink,
                               CParams::dChanceAddRecurrentLink,
                               this.innovation,
                               CParams::iNumTrysToFindLoopedLink,
                               CParams::iNumAddLinkAttempts);
                  //mutate the weights
                  baby.mutateWeights(CParams::dMutationRate,
                                     CParams::dProbabilityWeightReplaced,
                                     CParams::dMaxWeightPerturbation);
                  baby.mutateActivationResponse(CParams::dActivationMutationRate,
                                                CParams::dMaxActivationPerturbation);
                }
                //sort the babies genes by their innovation numbers
                baby.sortGenes();
                //add to new pop
                newPop.push(baby);
                ++numSpawnedSoFar;
                if(numSpawnedSoFar == CParams::iNumSweepers){
                  numToSpawn = 0;
                }
              }
            }
          }
          //if there is an underflow due to the rounding error and the amount
          //of offspring falls short of the population size additional children
          //need to be created and added to the new population. This is achieved
          //simply, by using tournament selection over the entire population.
          if(numSpawnedSoFar < CParams::iNumSweepers){
            //calculate amount of additional children required
            let rqd = CParams::iNumSweepers - numSpawnedSoFar;
            //grab them
            while(rqd--){
              newPop.push(this.tournamentSelection(this.popSize/5));
            }
          }
          //replace the current population with the new one
          this.vecGenomes = newPop;
          //create the new phenotypes
          let new_phenotypes=[];
          for(let gen=0; gen<this.vecGenomes.length; ++gen){
            //calculate max network depth
            let depth = this.calculateNetDepth(this.vecGenomes[gen]);
            let phenotype = this.vecGenomes[gen].createPhenotype(depth);
            new_phenotypes.push(phenotype);
          }
          //increase generation counter
          ++this.generation;
          return new_phenotypes;
        },
        //  sorts the population into descending fitness, keeps a record of the
        //  best n genomes and updates any fitness statistics accordingly
        sortAndRecord(){
          //sort the genomes according to their unadjusted (no fitness sharing)
          //fitnesses
          this.vecGenomes.sort(GenomesSort);
          //is the best genome this generation the best ever?
          if(this.vecGenomes[0].fitness.gt(this.bestEverFitness)){
            this.bestEverFitness = this.vecGenomes[0].fitness.clone();
          }
          //keep a record of the n best genomes
          this.storeBestGenomes();
        },
        //  used to keep a record of the previous populations best genomes so that
        //  they can be displayed if required.
        storeBestGenomes(){
          this.vecBestGenomes.length=0;
          for(let gen=0; gen<CParams::iNumBestSweepers; ++gen){
            this.vecBestGenomes.push(this.vecGenomes[gen])
          }
        },
        //  returns a std::vector of the n best phenotypes from the previous
        //  generation
        getBestPhenotypesFromLastGeneration(){
          let brains=[];
          for(let gen=0; gen<this.vecBestGenomes.length; ++gen){
            //calculate max network depth
            let depth = this.calculateNetDepth(this.vecBestGenomes[gen]);
            brains.push(this.vecBestGenomes[gen].createPhenotype(depth));
          }
          return brains;
        },
        //  this functions simply iterates through each species and calls
        //  AdjustFitness for each species
        adjustSpeciesFitnesses(){
          for(let sp=0; sp<this.vecSpecies.length; ++sp){
            this.vecSpecies[sp].adjustFitnesses()
          }
        },
        //  separates each individual into its respective species by calculating
        //  a compatibility score with every other member of the population and
        //  niching accordingly. The function then adjusts the fitness scores of
        //  each individual by species age and by sharing and also determines
        //  how many offspring each individual should spawn.
        speciateAndCalculateSpawnLevels(){
          let bAdded = false;
          //iterate through each genome and speciate
          for(let gen=0; gen<this.vecGenomes.length; ++gen){
            //calculate its compatibility score with each species leader. If
            //compatible add to species. If not, create a new species
            for(let spc=0; spc<this.vecSpecies.length; ++spc){
              let compatibility = this.vecGenomes[gen].getCompatibilityScore(this.vecSpecies[spc].leader);
              //if this individual is similar to this species add to species
              if(compatibility <= CParams::dCompatibilityThreshold){
                this.vecSpecies[spc].addMember(this.vecGenomes[gen]);
                //let the genome know which species it's in
                this.vecGenomes[gen].setSpecies(this.vecSpecies[spc].ID());
                bAdded = true;
                break;
              }
            }
            if(!bAdded){
              //we have not found a compatible species so let's create a new one
              this.vecSpecies.push(CSpecies(this.vecGenomes[gen], this.nextSpeciesID++));
            }
            bAdded = false;
          }
          //now all the genomes have been assigned a species the fitness scores
          //need to be adjusted to take into account sharing and species age.
          this.adjustSpeciesFitnesses();
          //calculate new adjusted total & average fitness for the population
          for(let gen=0; gen<this.vecGenomes.length; ++gen){
            this.totFitAdj += this.vecGenomes[gen].getAdjFitness()
          }
          this.avFitAdj = this.totFitAdj/this.vecGenomes.length;
          //calculate how many offspring each member of the population
          //should spawn
          for(let gen=0; gen<this.vecGenomes.length; ++gen){
             let toSpawn = this.vecGenomes[gen].getAdjFitness() / this.avFitAdj;
             this.vecGenomes[gen].setAmountToSpawn(toSpawn);
          }
          //iterate through all the species and calculate how many offspring
          //each species should spawn
          for(let spc=0; spc<this.vecSpecies.length; ++spc){
            this.vecSpecies[spc].calculateSpawnAmount()
          }
        },
        tournamentSelection(numComparisons){
           let bestFitnessSoFar = 0;
           let chosenOne = 0;
           //Select NumComparisons members from the population at random testing
           //against the best found so far
           for(let i=0; i<numComparisons; ++i){
             let thisTry = _.randInt2(0, this.vecGenomes.length-1);
             if(this.vecGenomes[thisTry].fitness.gt(bestFitnessSoFar)){
               chosenOne = thisTry;
               bestFitnessSoFar = this.vecGenomes[thisTry].fitness;
             }
           }
           return this.vecGenomes[chosenOne];
        },
        crossOver(mum, dad){
          //helps make the code clearer
          const MUM=0,DAD=1;
          //first, calculate the genome we will using the disjoint/excess
          //genes from. This is the fittest genome.
          let best;
          //if they are of equal fitness use the shorter (because we want to keep
          //the networks as small as possible)
          if(mum.fitness.score() == dad.fitness.score()){
            //if they are of equal fitness and length just choose one at random
            if(mum.numGenes() == dad.numGenes()){
              best = _.randInt2(0, 1);
            }else{
              if(mum.numGenes() < dad.numGenes()){
                best = MUM;
              }else{
                best = DAD;
              }
            }
          }else{
            if(mum.fitness.gt(dad.fitness)){
              best = MUM;
            }else{
              best = DAD;
            }
          }
          //these vectors will hold the offspring's nodes and genes
          let babyNeurons=[];
          let babyGenes=[];
          //temporary vector to store all added node IDs
          let vecNeurons=[];
          //create iterators so we can step through each parents genes and set
          //them to the first gene of each parent
          vector<SLinkGene>::iterator curMum = mum.StartOfGenes();
          vector<SLinkGene>::iterator curDad = dad.StartOfGenes();
          //this will hold a copy of the gene we wish to add at each step
          let selectedGene;
          //step through each parents genes until we reach the end of both
          while(!((curMum == mum.endOfGenes()) && (curDad == dad.endOfGenes()))){
            //the end of mum's genes have been reached
            if((curMum == mum.endOfGenes())&&(curDad != dad.endOfGenes())){
              //if dad is fittest
              if(best == DAD){
                //add dads genes
                selectedGene = curDad;
              }
              //move onto dad's next gene
              ++curDad;
            }
            //the end of dads's genes have been reached
            else if((curDad == dad.endOfGenes()) && (curMum != mum.endOfGenes())){
              //if mum is fittest
              if(best == MUM){
                //add mums genes
                selectedGene = curMum;
              }
              //move onto mum's next gene
              ++curMum;
            }
            //if mums innovation number is less than dads
            else if(curMum.innovationID < curDad.innovationID){
              //if mum is fittest add gene
              if(best == MUM){
                selectedGene = curMum;
              }
              //move onto mum's next gene
              ++curMum;
            }
            //if dads innovation number is less than mums
            else if(curDad.innovationID < curMum.innovationID){
              //if dad is fittest add gene
              if(best == DAD){
                selectedGene = curDad;
              }
              //move onto dad's next gene
              ++curDad;
            }
            //if innovation numbers are the same
            else if(curDad.innovationID == curMum.innovationID){
              //grab a gene from either parent
              if(_.rand() < 0.5){
                selectedGene = curMum;
              }else{
                selectedGene = curDad;
              }
              //move onto next gene of each parent
              ++curMum;
              ++curDad;
            }
            //add the selected gene if not already added
            if(babyGenes.length == 0){
              babyGenes.push(selectedGene);
            }else{
              if(babyGenes[babyGenes.length-1].innovationID != selectedGene.innovationID){
                babyGenes.push(selectedGene);
              }
            }
            //Check if we already have the nodes referred to in SelectedGene.
            //If not, they need to be added.
            this.addNeuronID(selectedGene.fromNeuron, vecNeurons);
            this.addNeuronID(selectedGene.toNeuron, vecNeurons);
          }
          //now create the required nodes. First sort them into order
          vecNeurons.sort();
          for(let i=0; i<vecNeurons.length; ++i){
            babyNeurons.push(this.innovation.createNeuronFromID(vecNeurons[i]))
          }
          //finally, create the genome
          return CGenome(this.nextGenomeID++,
                         babyNeurons,
                         babyGenes,
                         mum.numInputs(), mum.numOutputs());
        },
        //  This function resets some values ready for the next epoch, kills off
        //  all the phenotypes and any poorly performing species.
        resetAndKill(){
          this.totFitAdj = 0;
          this.avFitAdj  = 0;
          //purge the species
          let curSp = this.vecSpecies.begin();
          while(curSp != this.vecSpecies.end()){
            curSp.purge();
            //kill off species if not improving and if not the species which contains
            //the best genome found so far
            if((curSp.gensNoImprovement() > CParams::iNumGensAllowedNoImprovement) &&
                 curSp.bestFitness().score() < this.bestEverFitness.score()){
             curSp = this.m_vecSpecies.erase(curSp);
             --curSp;
            }
            ++curSp;
          }
          //we can also delete the phenotypes
          for(let gen=0; gen<this.vecGenomes.length; ++gen){
            this.vecGenomes[gen].deletePhenotype();
          }
        },
        renderSpeciesInfo(surface, db){
        }
        numSpecies(){return this.vecSpecies.length},
        bestEverFitness(){return this.bestEverFitness}
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


