let HiddenNeuron = require('./neuron').HiddenNeuron,
    OutputNeuron = require('./neuron').OutputNeuron

module.exports = {
    
    Trainer: class Trainer 
    {
        /**
         * @param  {number} learnRate
         * @param  {[{input: [number], desired: [number]}]} patterns
         */
        constructor (learnRate, patterns) {
            this.learnRate = learnRate
            this.patterns = patterns
        }

        train (network) 
        {
            this.bindErrorFunctions(network)

            // train untill error less than 0.1
            for (let i = 0, errorSum = 1; errorSum > 0.1; i++)
            {
                errorSum = 0

                for (var { input, desired } of this.patterns) {
                    
                    // Execute network for input pattern
                    let result = network.calculate(input)
                    let length = network.outputNeurons.length
                    let outputErrorSum = 0
                    
                    // Calculate error function for every neuron
                    if (desired.length !== length) 
                        throw new Error(`Desired must have ${length} elements`)

                    for (let i=0; i<length; i++) {
                        let neuron = network.outputNeurons[i]
                        neuron.error = neuron.calculateError(desired[i])
                    }

                    network.hiddenNeurons.forEach(function(neuron) {
                        neuron.error = neuron.calculateError()
                    }, network)
                    
                    // Calculate delta for every connection
                    network.connections.forEach(function(conn) {
                        var outputNeuron = conn.output
                        conn.weight += this.learnRate*outputNeuron.error*conn.input.activation
                    }, this)

                    for (let i=0; i<desired.length; i++) {
                        outputErrorSum += Math.abs(desired[i]-network.outputNeurons[i].activation) 
                    }

                    errorSum += outputErrorSum/length
                }

                console.log(`${i++}.    ${errorSum}`)
            }
        }

        bindErrorFunctions (network) 
        {
            OutputNeuron.prototype.calculateError = this.outputNeuronErrorCalculator        
            HiddenNeuron.prototype.calculateError = this.hiddenNeuronErrorCalculator
        }

        hiddenNeuronErrorCalculator () 
        {
            let sum = 0

            this.outputs.forEach(function(conn) {
                sum += conn.output.error*conn.weight
            }, this)

            return this.deriveActivation()*sum
        }

        outputNeuronErrorCalculator (desired) 
        {
            return this.deriveActivation()*(desired-this.activation)
        }
    }
}