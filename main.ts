import { Decol, ListLayout, optimize } from "./src/Optimization.js"

export type InputData = {
    useMinimalOrder : boolean,
    optimizeBySquare : boolean,
    decoli  : { id : string, square : string }[],
    layouts : {
        id          : string,
        minOrder    : number,
        decoli      : { decolId : string, count : number }[],
    }[],
    required : { decolId : string, count : number }[]
}

export type Result = {
    error       : string,
    result      : { layoutId : string, count : number }[]
}

export const optimizeDecolsOrder = function (input : string) : string {
    const inputData : InputData = JSON.parse(input)

    const decoli : Map<string, Decol> = new Map(inputData.decoli.map(decolData => {
        return [
            decolData.id,
            Decol.new({ square : Number(String(decolData.square).replace(/,/g, '.') || 0) })
        ]
    }))

    const layouts : Map<string, ListLayout> = new Map(inputData.layouts.map(layoutData => {
        const layoutDecolsData : Map<Decol, number> = new Map(layoutData.decoli.map(layoutDecolData => {
            return [ decoli.get(layoutDecolData.decolId), layoutDecolData.count ]
        }))

        return [
            layoutData.id,
            ListLayout.new({
                name            : layoutData.id,
                minOrderCount   : layoutData.minOrder,
                layout          : layoutDecolsData
            })
        ]
    }))

    const requiredDecols : Map<Decol, number> = new Map(inputData.required.map(requiredData => {
        return [ decoli.get(requiredData.decolId), requiredData.count ]
    }))

    const result = optimize(decoli, layouts, requiredDecols, inputData.useMinimalOrder, inputData.optimizeBySquare)

    const outerResult : Result = {
        error       : result.error,
        result      : Array.from(result.result.entries()).map(([ variable, count ]) => {
            return {
                layoutId    : variable.name,
                count       : Math.ceil(count)
            }
        })
    }

    return JSON.stringify(outerResult)
}

export const sanityChecker = (a, b) => a + b

const inputFile     = process.argv[ 2 ]
const outputFile    = process.argv[ 3 ]

console.log("Starting optimization, input data: " + inputFile)

const fs            = require('fs')

// empty the output in case something will go wrong, so that it won't show stale results
fs.writeFileSync(outputFile, '')

const input         = fs.readFileSync(inputFile)

fs.writeFileSync(outputFile, optimizeDecolsOrder(input))

console.log("Optimization completed, output data: " + inputFile)
