import { Equation, EquationType, ExtremumType, SimplexMethodSolver, TargetFunction, Variable, VariablesList } from "../src/SimplexMethod.js"

declare const StartTest : any

StartTest(t => {

    t.it('Simple case should work', async t => {
        const xVar = Variable.new({ name : 'x' })

        const variablesList = VariablesList.new()

        variablesList.addVariable(xVar)

        const solver = SimplexMethodSolver.new({
            variablesList   : variablesList,

            targetFunction  : TargetFunction.new({
                variablesList   : variablesList,
                type        : ExtremumType.Maximum,

                coefficients    : new Map([
                    [ xVar, 1 ]
                ])
            }),

            equations : [
                Equation.new({
                    name            : 'xVar limit',
                    variablesList   : variablesList,
                    type            : EquationType.LessOrEqual,
                    rightHandSide   : 10,

                    coefficients    : new Map([
                        [ xVar, 1 ]
                    ])
                })
            ]
        })

        const result = solver.solve()

        t.isDeeply(result.result, new Map([ [ xVar, 10 ] ]), 'Correct result found')
    })


    t.iit('Simple case should work for 2 variables', async t => {
        const xVar = Variable.new({ name : 'x' })
        const yVar = Variable.new({ name : 'y' })

        const variablesList = VariablesList.new()

        variablesList.addVariable(xVar)
        variablesList.addVariable(yVar)

        const solver = SimplexMethodSolver.new({
            variablesList   : variablesList,

            targetFunction  : TargetFunction.new({
                variablesList   : variablesList,
                type        : ExtremumType.Maximum,

                coefficients    : new Map([
                    [ xVar, 1 ],
                    [ yVar, 1 ]
                ])
            }),

            equations : [
                Equation.new({
                    name            : 'xVar limit',
                    variablesList   : variablesList,
                    type            : EquationType.LessOrEqual,
                    rightHandSide   : 10,

                    coefficients    : new Map([
                        [ xVar, 1 ]
                    ])
                }),
                Equation.new({
                    name            : 'yVar limit',
                    variablesList   : variablesList,
                    type            : EquationType.LessOrEqual,
                    rightHandSide   : 10,

                    coefficients    : new Map([
                        [ yVar, 1 ]
                    ])
                })
            ]
        })

        const result = solver.solve()

        t.isDeeply(result.result, new Map([ [ xVar, 10 ], [ yVar, 10 ] ]), 'Correct result found')
    })

})
