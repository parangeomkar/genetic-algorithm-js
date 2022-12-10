# Genetic Algorithm for Web
Created this library to be able to run parametric optimization in browser and server.

## Run Locally

### Clone the project
```bash
  git clone https://github.com/parangeomkar/genetic-algorithm-js.git
```

### Go to the project directory

```bash
  cd genetic-algorithm-js
```

### Configure GA instance
```bash
let config = {
  numParams,
  lowerLim,
  upperLim,
  popSize: 100,
  maxGen: 1000,
  fitnessFn,
  crossoverRate: 0.6,
  mutationRate: 0.05
}

let ga = new GA(config);
let solution = ga.optimize();  
```


### Start the server
```bash
  npm run start
```


### Fitness function
The fitness function depends on the type of optimization problem.
For function approximation, a simple MSE can be used.
```bash
fitnessFn = (params) => {
  let predictedOut = someCostFunction(params);

  return Math.pow(actualOutput - predictedOut, 2);
}
```



### Constraints
The constraints on upper and lower values of parameters can be specified
individually. For example, an optimization problem with 3 parameters the
constraints can be defined as follows,
```bash
let lowerLim = [-1, 0.23, 55];
let upperLim = [1, 0.25, 1000];
```

