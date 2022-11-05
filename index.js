export default class GA {
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
        let mutatedChild = [...child];

        for (let j = 0; j < this.numParams; j++) {

            let limitDiff = (this.upperLim[j] - this.lowerLim[j]);

            mutatedChild[j] += Math.floor(0.1 * ((Math.random() - 0.5) * 2 * limitDiff));

            mutatedChild[j] = Math.min(this.upperLim[j], mutatedChild[j]);
            mutatedChild[j] = Math.max(this.lowerLim[j], mutatedChild[j]);

        }


        return mutatedChild;

        // for (let i = 0; i < this.numParams; i++) {
        //     let binary1 = (mutatedChild1[i] >>> 0).toString(2);
        //     let binary2 = (mutatedChild2[i] >>> 0).toString(2);

        //     let idx1 = Math.floor(Math.random() * binary1.length);
        //     let idx2 = Math.floor(Math.random() * binary2.length);

        //     let str1 = !parseInt(binary1[idx1]) ? 1 : 0;
        //     let str2 = !parseInt(binary2[idx2]) ? 1 : 0;

        //     binary1 = binary1.substring(0, idx1) + str1 + binary1.substring(idx1 + 1);
        //     binary2 = binary2.substring(0, idx2) + str2 + binary2.substring(idx2 + 1);

        //     mutatedChild1[i] = Math.min(this.upperLim[i], parseInt(binary1, 2));
        //     mutatedChild2[i] = Math.min(this.upperLim[i], parseInt(binary2, 2));

        //     mutatedChild1[i] = Math.max(this.lowerLim[i], mutatedChild1[i]);
        //     mutatedChild2[i] = Math.max(this.lowerLim[i], mutatedChild2[i]);
        // }

        // return [mutatedChild1, mutatedChild2];
    }

    crossover(p1, p2) {

        let split = 0,
            parent1 = this.population[p1],
            parent2 = this.population[p2];

        while (split == 0 || split == (this.numParams - 1)) {
            split = Math.floor(Math.random() * this.numParams);
        }

        let child1 = [...[...parent1].slice(0, split), ...[...parent2].slice(split, this.numParams)],
            child2 = [...[...parent2].slice(0, split), ...[...parent1].slice(split, this.numParams)];

        return [child1, child2];

        // let crossoverChild1 = [...this.population[p1]],
        //     crossoverChild2 = [...this.population[p2]];

        // for (let i = 0; i < this.numParams; i++) {
        //     let binary1 = (crossoverChild1[i]).toString(2);
        //     let binary2 = (crossoverChild2[i]).toString(2);

        //     let idx1 = Math.floor(Math.random() * (binary1.length - 2));
        //     let idx2 = Math.floor(Math.random() * (binary2.length - 2));

        //     let binary11 = binary1.substring(0, idx1) + binary2.substring(idx2 + 1);
        //     let binary22 = binary2.substring(0, idx2) + binary1.substring(idx1 + 1);

        //     crossoverChild1[i] = Math.min(this.upperLim[i], parseInt(binary11, 2));
        //     crossoverChild2[i] = Math.min(this.upperLim[i], parseInt(binary22, 2));

        //     crossoverChild1[i] = Math.max(this.lowerLim[i], crossoverChild1[i]);
        //     crossoverChild2[i] = Math.max(this.lowerLim[i], crossoverChild2[i]);
        // }

        // return [crossoverChild1, crossoverChild2];
    }

    optimize() {
        let child1 = new Array(this.numParams),
            child2 = new Array(this.numParams);

        let currentPopSize = this.popSize;

        for (let i = 0; i < this.maxGen; i++) {

            while (currentPopSize < this.popSize * 2) {
                let idxParent1 = 0,
                    idxParent2 = 0;

                while (idxParent1 == idxParent2) {
                    idxParent1 = Math.floor(Math.random() * this.popSize);
                    idxParent1 = Math.floor(Math.random() * this.popSize);
                }

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

            currentPopSize = this.popSize;
        }

        console.log(this.performance[0], this.performance[this.popSize]);
        console.log(this.population[0]);
    }
}