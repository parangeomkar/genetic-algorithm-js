class GeneticAlgorithm {
    constructor(config) {
        // load the config
        this.numParams = config.numParams;
        this.lowerLim = config.lowerLim;
        this.upperLim = config.upperLim;
        this.popSize = config.popSize;
        this.maxGen = config.maxGen;
        this.fitnessFn = config.fitnessFn;
        this.crossoverRate = config.crossoverRate;
        this.mutationRate = config.mutationRate;

        // assign fixed memory to population and fitness properties
        this.population = [...new Array(this.popSize * 2)].map(() => new Array(this.numParams));
        this.fitness = new Array(this.popSize * 2).fill(-1000000000);

        // initialize pupulation
        this.initPopulation();
    }

    /**
     * Initializes population with constraints defined by lowerLim and upperLin
     */
    initPopulation() {

        for (let i = 0; i < this.popSize; i++) {

            // create chromosome of parameretes to be optimized
            let chromosome = new Array(this.numParams);

            for (let j = 0; j < this.numParams; j++) {
                let limitDiff = (this.upperLim[j] - this.lowerLim[j]);
                chromosome[j] = Math.floor((Math.random() * limitDiff) + this.lowerLim[j]);
            }

            this.population[i] = chromosome;

            // evaluate fitness of the chromosome
            this.fitness[i] = this.evaluate(chromosome);
        }

        // sort generated population based on fitness
        this.sortPopulation();
    }

    /**
     * 
     * @param {*} chromosome an array of parameters to be optimized
     * @returns fitness value computed by fitnessFn
     */
    evaluate(chromosome) {
        return this.fitnessFn(chromosome);
    }

    /**
     * Sorts population based on fitness value
     */
    sortPopulation() {
        let fitness = [...this.fitness],
            population = new Array(this.popSize * 2);

        // sort by fitness
        fitness.sort(function (a, b) {
            return a - b;
        }).reverse();


        for (let i = 0; i < this.popSize * 2; i++) {
            // initially population is only popSize
            if (fitness[i] == undefined) {
                break;
            };

            // create an array of indexes of sorted chromosomes
            let sortedPerfIdx = this.fitness.indexOf(fitness[i]);
            population[i] = this.population[sortedPerfIdx];
        }

        this.population = [...population];
        this.fitness = [...fitness];

    }

    /**
     * 
     * @param {*} child child chromosome
     * @returns child chromosome with mulation applied
     */
    mutate(child) {

        // create child chromosome copy and randomly generated indexes for parameters
        // of child chromosome to be mutated
        let mutatedChild = [...child],
            idx = Array.from({ length: 1 }, () => Math.floor(Math.random() * this.numParams));

        // apply mutation to selected parameters
        // adds a random number to the existing parameter value
        for (let id of idx) {
            let limitDiff = (this.upperLim[id] - this.lowerLim[id]),
                adder = Math.floor(((Math.random() - 0.5) * 2 * limitDiff));

            mutatedChild[id] += adder;

            // keep the parameter within constraints
            mutatedChild[id] = Math.max(this.lowerLim[id], Math.min(this.upperLim[id], mutatedChild[id]));
        }

        return mutatedChild;
    }

    /**
     * 
     * @param {*} p1 first parent chromosome index in population
     * @param {*} p2 second parent chromosome index in population
     * @returns two children chromosomes obtained by real valued crossover of variables
     */
    crossover(p1, p2) {
        let split = 0,
            parent1 = this.population[p1],
            parent2 = this.population[p2],
            crossoverChild1 = [...parent1],
            crossoverChild2 = [...parent2];

        // randomly split the real valued parameters
        split = Math.random();

        for (let i = 0; i < this.numParams; i++) {
            crossoverChild1[i] = Math.floor(split * parent1[i] + (1 - split) * parent2[i]);
            crossoverChild2[i] = Math.floor(split * parent2[i] + (1 - split) * parent1[i]);
        }

        return [crossoverChild1, crossoverChild2];
    }

    /**
     * 
     * @returns two parent chromosome indexes from population with tournament selection 
     */
    selection() {
        // select 5 indexes randomly
        let idx = Array.from({ length: 5 },
            () => Math.min(Math.round(Math.random() * this.popSize), this.popSize - 1)),
            maxFit1 = idx[0],
            maxFit2 = idx[1];

        // choose two chromosome indexes with highest fitness among selected 5
        for (let id of idx) {
            if (this.fitness[id] > this.fitness[maxFit1] && id != maxFit2) {
                maxFit1 = id;
            } else if (this.fitness[id] > this.fitness[maxFit2] && id != maxFit1) {
                maxFit2 = id;
            }
        }

        return [maxFit1, maxFit2];
    }


    /**
     * 
     * @returns optimized parameters
     */
    optimize() {
        // assign fixed sized arrays for two children
        let child1 = new Array(this.numParams),
            child2 = new Array(this.numParams);

        let currentPopSize = this.popSize;

        // iterate till maxGen
        for (let i = 0; i < this.maxGen; i++) {
            
            // reduce mutation rate after 50% of generations
            // if (i > this.maxGen / 2) {
            //     this.mutationRate = this.mutationRate * 0.999;
            //     console.log(this.mutationRate);
            // }

            // add children till pupulation size becomes 2 times original
            while (currentPopSize < this.popSize * 2) {

                // select parents
                let [idxParent1, idxParent2] = this.selection();
  
                // create children
                child1 = [...this.population[idxParent1]];
                child2 = [...this.population[idxParent2]];

                // apply crossover
                if (Math.random() < this.crossoverRate) {
                    [child1, child2] = this.crossover(idxParent1, idxParent2);
                }

                // apply mutation
                if (Math.random() < this.mutationRate) {
                    child1 = this.mutate(child1);
                    child2 = this.mutate(child2);
                }

                // evaluate fitnesses
                this.fitness[currentPopSize] = this.evaluate(child1);
                this.fitness[currentPopSize + 1] = this.evaluate(child2);

                // insert children to population
                this.population[currentPopSize] = [...child1];
                this.population[currentPopSize + 1] = [...child2];

                currentPopSize += 2;
            }

            // sort population on fitness
            this.sortPopulation();

            // print 
            console.log("Current Generation: " + i + "  |  Current Optimal fitness: " + JSON.stringify(this.fitness[0]))
            
            // reset the index to retain n chromosomes of highest fitness
            currentPopSize = this.popSize / 2;
        }

        // return optimal chromosome
        return this.population[0];
    }
}

module.exports = GeneticAlgorithm;