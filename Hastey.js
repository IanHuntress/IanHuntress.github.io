function sum(total, num) {
    return total + num;
}

function squareSum(total, num) {
    return total + num*num;
}

function factorialize(num) { //https://medium.freecodecamp.org/how-to-factorialize-a-number-in-javascript-9263c89a4b38
  if (num < 0) 
        return -1;
  else if (num == 0) 
      return 1;
  else {
      return (num * factorialize(num - 1));
  }
}

  var binomials = [ //https://stackoverflow.com/questions/37679987/efficient-computation-of-n-choose-k-in-node-js
    [1],
    [1,1],
    [1,2,1],
    [1,3,3,1],
    [1,4,6,4,1],
    [1,5,10,10,5,1],
    [1,6,15,20,15,6,1],
    [1,7,21,35,35,21,7,1],
    [1,8,28,54,70,54,28,8,1]
  ];

  function binomial(n,k) {
    while(n >= binomials.length) {
      let s = binomials.length;
      let nextRow = [];
      nextRow[0] = 1;
      for(let i=1, prev=s-1; i<s; i++) {
        nextRow[i] = binomials[prev][i-1] + binomials[prev][i];
      }
      nextRow[s] = 1;
      binomials.push(nextRow);
    }
    return binomials[n][k];
  }


console.log("Loaded Hastey")


var layout = {
  autosize: false,
  margin: {
    l: 50,
    r: 50,
    b: 30,
    t: 20,
    pad: 4
  },
  xaxis: {range: [0, 1]},
  plot_bgcolor: '#c7c7c7'
};



function P_X_Given_Theta(X,T){ // Get the probability of observing the data given a certain Theta, probability that a site is a purine
    N = X.length
    pu = X.reduce(sum)
    py = X.length - pu
    B = binomial(N, pu)
    return(B * Math.pow(T,pu) * Math.pow(1 - T,py))
}

function Jumping_Distribution(Tnew, Told) { // Probability of proposing Tnew to jump to given Told
    if(Tnew <= (Told + High(Told)) && Tnew >= (Told - Low(Told))) {
        return( 1/ ( High(Told) + Low(Told) ))
    } else {
        return(0)
    }
        
}

function High(T) {
    return(Math.min(delta, 1-T))
}
function Low(T) {
    return(Math.min(delta,T))
}
function Generate_Tnew(Told) {
    return((Told - Low(Told)) + Math.random() * (High(Told) + Low(Told)))
}

function Uniform_Prior(T) {
    return(1)
}

Prior = Uniform_Prior

function Jumpy_Prior(T) {
    if (T >= 0 && T <= 0.3) {
        return(10/3 - (100/9)*T)
    } else if (T >= 0.3 && T<=1) {
        return((100*T)/49 - 30/49)
    }
}

function Select_Jumpy() {
    Prior = Jumpy_Prior
}
function Select_Uniform() {
    Prior = Uniform_Prior
}
function MC_Sample () {
    Tnew = Generate_Tnew(Told)
    r = (P_X_Given_Theta(X,Tnew) * Prior(Tnew) * Jumping_Distribution(Told, Tnew)) / (P_X_Given_Theta(X,Told) * Prior(Told) * Jumping_Distribution(Tnew, Told))
    
    if (Math.random() < Math.min(r, 1)) {
        Told = Tnew // make the jump
    } else {
        Told = Told // don't jump
    }
    return(Told)
}

function simulate(data, d, Tstart, burn, samples, totalSamples) {

    delta = d
    Told = Tstart
    burnin = burn
    X = data
    
    for(i=0;i<burnin;i++){
        MC_Sample()
    }
    for(i=0;i<totalSamples;i++){
        samples.push(MC_Sample())
    }
    

}


function Generate_Obs(XData, prop) {
    X = []

    purines = prop*XData
    pyrimidine = (1-prop)*XData
    for(i=0;i<Math.floor(purines);i++){
        X.push(1)
    }
    for(i=0;i<Math.floor(pyrimidine);i++){
        X.push(0)
    }
    return(X)
}

function graph() {
    totalSamples = document.getElementById("TotalSamples").value
    burn = document.getElementById("BurnIn").value
    delta = document.getElementById("WindowSize").value
    XData = document.getElementById("TotalObserved").value
    prop = document.getElementById("TrueTheta").value
    
    GenX = Generate_Obs(XData, prop)
    samples = []
    simulate(GenX,delta, Math.random(), burn, samples, totalSamples)
    var data = [
      {
        x: samples,
        type: 'histogram',
        size: 0.05,
        mode: 'markers'
      }
    ];
    Plotly.newPlot('graph1', data, layout);

    posterior = samples.reduce(sum) / samples.length
    variance = samples.reduce(squareSum) / samples.length
    std = variance * variance
    
    document.getElementById("PostMean").innerHTML = "Posterior mean = " + posterior.toFixed(3)
    document.getElementById("PostStd").innerHTML = "Posterior standard deviation = " + std.toFixed(3)

}

function Preset1() {
    document.getElementById("TotalSamples").value = 10000
    document.getElementById("BurnIn").value = 0
    document.getElementById("WindowSize").value = 0.1
    document.getElementById("TotalObserved").value = 7
    document.getElementById("TrueTheta").value = 2/7
    
    Select_Uniform()
}
function Preset2() {
    document.getElementById("TotalSamples").value = 10000
    document.getElementById("BurnIn").value = 0
    document.getElementById("WindowSize").value = 0.1
    document.getElementById("TotalObserved").value = 70
    document.getElementById("TrueTheta").value = 2/7
    Select_Uniform()
}
function Preset3() {
    document.getElementById("TotalSamples").value = 10000
    document.getElementById("BurnIn").value = 0
    document.getElementById("WindowSize").value = 0.1
    document.getElementById("TotalObserved").value = 7
    document.getElementById("TrueTheta").value = 2/7
    Select_Jumpy()
}
function Preset4() {
    document.getElementById("TotalSamples").value = 10000
    document.getElementById("BurnIn").value = 0
    document.getElementById("WindowSize").value = 0.1
    document.getElementById("TotalObserved").value = 70
    document.getElementById("TrueTheta").value = 2/7
    Select_Jumpy()
}

function rejectionGraph() {
    // document.getElementById("TotalSamples").value = 10000
    totalSamples = document.getElementById("TotalSamples").value
    samples = []
    c = 3
    for (i=0;samples.length<totalSamples;i++){
        Ts = Math.random()
        r = Prior(Ts) / c * Uniform_Prior(Ts)
        
        if( Math.random() < r ) {
            samples.push(Ts)
        } else {
            //nothing
        }
        
    }
    
    var data = [
      {
        x: samples,
        type: 'histogram',
        size: 0.05,
        mode: 'markers'
      }
    ];
    Plotly.newPlot('graph1', data, layout);

    posterior = samples.reduce(sum) / samples.length
    variance = samples.reduce(squareSum) / samples.length
    std = variance * variance
    
    document.getElementById("PostMean").innerHTML = "Posterior mean = " + posterior.toFixed(3)
    document.getElementById("PostStd").innerHTML = "Posterior standard deviation = " + std.toFixed(3)
    
}

function importanceSample() {
    // document.getElementById("TotalSamples").value = 10000
    totalSamples = document.getElementById("TotalSamples").value
    samples = []
    weights = []
    c = 3
    for (i=0;i<totalSamples;i++){
        Ts = Math.random()
        w = Prior(Ts) / Uniform_Prior(Ts)
        
    }
    
    var data = [
      {
        x: samples,
        type: 'histogram',
        size: 0.05,
        mode: 'markers'
      }
    ];
    Plotly.newPlot('graph1', data, layout);

    posterior = samples.reduce(sum) / samples.length
    variance = samples.reduce(squareSum) / samples.length
    std = variance * variance
    
    document.getElementById("PostMean").innerHTML = "Posterior mean = " + posterior.toFixed(3)
    document.getElementById("PostStd").innerHTML = "Posterior standard deviation = " + std.toFixed(3)
    
}













window.onload = function() {
    graph();
};



