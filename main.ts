import { Decol, ListLayout, optimize } from "./src/Optimization.js"
import { SimplexMethodSolver } from "./src/SimplexMethod.js"

type InputData = {
    decoli  : { id : string, square : string }[],
    layouts : {
        id          : string,
        minOrder    : number,
        decoli      : { decolId : string, count : number }[],
    }[],
    required : { decolId : string, count : number }[]
}

type Result = {
    error       : string,
    result      : { layoutId : string, count : number }[]
}


const InputData : InputData = {
    decoli : [
        { id : 'd1', square : '15,0' },
        { id : 'd2', square : '5,0' },
        { id : 'd3', square : '25' }
    ],

    layouts : [
        {
            id          : 'l1',
            minOrder    : 1,
            decoli      : [
                { decolId : 'd1', count : 15 },
                { decolId : 'd2', count : 5 }
            ]
        },
        {
            id          : 'l2',
            minOrder    : 1,
            decoli      : [
                { decolId : 'd1', count : 10 },
                { decolId : 'd2', count : 10 }
            ]
        },
        {
            id          : 'l3',
            minOrder    : 1,
            decoli      : [
                { decolId : 'd1', count : 4 },
                { decolId : 'd2', count : 6 },
                { decolId : 'd3', count : 6 }
            ]
        }

    ],

    required : [
        { decolId : 'd1', count : 1200 },
        { decolId : 'd2', count : 500 },
        { decolId : 'd3', count : 30 }
    ]
}

const result : Result = {
    error       : '',
    result      : [
        { layoutId : 'l1', count : 1 },
        { layoutId : 'l2', count : 10 }
    ]
}


export const optimizeDecolsOrder = function (inputData : InputData) {
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

    const result = optimize(decoli, layouts, requiredDecols)



    return
}
