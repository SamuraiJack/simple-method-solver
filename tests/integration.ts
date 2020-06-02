import { InputData, optimizeDecolsOrder } from "../main.js"

const inputData : InputData = {
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

const res = optimizeDecolsOrder(JSON.stringify(inputData))

console.log(JSON.parse(res))
