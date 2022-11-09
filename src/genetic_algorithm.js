class GeneticAlgorithm {
    constructor(config) {
        this.numParams = config.numParams;
        this.lowerLim = config.lowerLim;
        this.upperLim = config.upperLim;
        this.popSize = config.popSize;
        this.maxGen = config.maxGen;
        this.costFunction = config.costFunction;
        this.crossoverRate = config.crossoverRate;
        this.mutationRate = config.mutationRate;

        this.population = [...new Array(this.popSize * 2)].map(() => new Array(this.numParams));
        this.performance = new Array(this.popSize * 2).fill(-1000000000);

        this.initPopulation();
    }

    initPopulation() {
        for (let i = 0; i < this.popSize; i++) {
            let chromosome = new Array(this.numParams);

            for (let j = 0; j < this.numParams; j++) {
                let limitDiff = (this.upperLim[j] - this.lowerLim[j]);
                chromosome[j] = Math.floor((Math.random() * limitDiff) + this.lowerLim[j]);
            }

            this.population[i] = chromosome;
            this.performance[i] = this.evaluate(chromosome);
        }

        this.sortPopulation();
    }

    evaluate(chromosome) {
        return this.costFunction(chromosome);
    }

    sortPopulation() {
        let performance = [...this.performance],
            population = new Array(this.popSize * 2);

        performance.sort(function (a, b) {
            return a - b;
        }).reverse();

        for (let i = 0; i < this.popSize * 2; i++) {
            if (performance[i] == undefined || isNaN(performance[i])) {
                break;
            };

            let sortedPerfIdx = this.performance.indexOf(performance[i]);
            population[i] = this.population[sortedPerfIdx];
        }

        this.population = [...population];
        this.performance = [...performance];

    }

    mutate(child) {
        let mutatedChild = [...child],
            idx = Array.from({ length: 10 }, () => Math.floor(Math.random() * this.numParams));

        // for (let i = 0; i < 5; i++) {
        //     mutatedChild[idx[i]] = child[idx[i * 2]];
        //     mutatedChild[idx[i * 2]] = child[idx[i]];

        //     mutatedChild[idx[i + 1]] = child[idx[i * 2 + 1]];
        //     mutatedChild[idx[i * 2 + 1]] = child[idx[i + 1]];
        // }


        for (let id of idx) {
            let limitDiff = (this.upperLim[id] - this.lowerLim[id]),
                adder = Math.floor(((Math.random() - 0.5) * 2 * limitDiff));

            mutatedChild[id] += adder;//(Math.random() - 0.5) * 2;

            mutatedChild[id] = Math.min(this.upperLim[id], mutatedChild[id]);
            mutatedChild[id] = Math.max(this.lowerLim[id], mutatedChild[id]);
        }

        return mutatedChild;
    }

    crossover(p1, p2) {

        let split = 0,
            parent1 = this.population[p1],
            parent2 = this.population[p2];

        let crossoverChild1 = [...this.population[p1]],
            crossoverChild2 = [...this.population[p2]];

        for (let i = 0; i < this.numParams; i++) {
            split = Math.random();
            crossoverChild1[i] = Math.floor(split * parent1[i] + (1 - split) * parent2[i]);
            crossoverChild2[i] = Math.floor(split * parent2[i] + (1 - split) * parent1[i]);
        }

        return [crossoverChild1, crossoverChild2];
    }

    selection() {
        let idx = Array.from({ length: 10 }, () => Math.floor(Math.random() * this.popSize)),
            perfTemp = this.performance;

        let max1 = idx[0], max2 = idx[1];

        for (let id of idx) {
            if (perfTemp[id] > perfTemp[max1] && id != max2) {
                max1 = id;
            } else if (perfTemp[id] > perfTemp[max2] && id != max1) {
                max2 = id;
            }
        }

        return [max1, max2];
    }


    optimize() {
        let child1 = new Array(this.numParams),
            child2 = new Array(this.numParams);

        let currentPopSize = this.popSize;

        for (let i = 0; i < this.maxGen; i++) {
            if (i > this.maxGen / 2) {
                this.mutationRate = this.mutationRate * 0.98;
            }

            while (currentPopSize < this.popSize * 2) {

                let [idxParent1, idxParent2] = this.selection();

                [child1, child2] = this.crossover(idxParent1, idxParent2);


                if (Math.random() < this.mutationRate) {
                    child1 = this.mutate(child1);
                    child2 = this.mutate(child2);
                }

                this.performance[currentPopSize] = this.evaluate(child1);
                this.performance[currentPopSize + 1] = this.evaluate(child2);

                this.population[currentPopSize] = [...child1];
                this.population[currentPopSize + 1] = [...child2];

                currentPopSize += 2;
            }

            this.sortPopulation();

            console.log("Current Generation: " + i + "  |  Current Optimal Performance: " + JSON.stringify(this.performance[0]))
            currentPopSize = this.popSize / 2;
        }
        return this.population[0];
    }
}

module.exports = GeneticAlgorithm;