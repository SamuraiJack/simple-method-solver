import { Base } from "./Base.js"
import { Equation, EquationType, ExtremumType, SimplexMethodSolver, TargetFunction, Variable, VariablesList } from "./SimplexMethod.js"

class Decol extends Base {
    square      : number
}

const decols : Map<string, Decol> = new Map()

decols.set('decol1', Decol.new({ square : 10 }))
decols.set('decol2', Decol.new({ square : 50 }))
decols.set('decol3', Decol.new({ square : 80 }))


class ListLayout extends Base {
    name        : string

    layout      : Map<Decol, number> = new Map()

    minOrderCount    : number
}

const layouts : Map<string, ListLayout> = new Map()

layouts.set('layout1', ListLayout.new({
    name        : 'layout1',
    layout  : new Map([
        [ decols.get('decol1'), 5 ],
        [ decols.get('decol2'), 7 ],
    ]),

    minOrderCount    : 50
}))

layouts.set('layout2', ListLayout.new({
    layout  : new Map([
        [ decols.get('decol2'), 15 ],
        [ decols.get('decol3'), 3 ],
    ]),

    minOrderCount    : 100
}))



const requiredDecols : Map<Decol, number> = new Map([
    [ decols.get('decol1'), 1500 ],
    [ decols.get('decol2'), 2300 ],
    [ decols.get('decol3'), 1800 ]
])


class Result {
    required    : Map<Decol, number>

    result      : Map<ListLayout, number>


    getUnusefulSquare () : number {
        let decolsCount : Map<Decol, number> = new Map()

        this.result.forEach((orderedNumber : number, layout : ListLayout) => {

            layout.layout.forEach((count : number, decol : Decol) => {
                let already = decolsCount.get(decol)

                if (already === undefined) { already = 0; decolsCount.set(decol, 0) }


                decolsCount.set(decol, already + count * orderedNumber)
            })
        })

        let unsefulSquare = 0

        decolsCount.forEach((count : number, decol : Decol) => {
            unsefulSquare += (count - this.required.get(decol)) * decol.square
        })

        return unsefulSquare
    }
}

// Создаем список переменных
const variablesList = VariablesList.new()

layouts.forEach((layout : ListLayout, name : string) => {
    variablesList.addVariable(Variable.new({ name : name }))
})

// Создаем список ограничений
const solver = SimplexMethodSolver.new({
    variablesList       : variablesList
})

layouts.forEach((layout : ListLayout, layoutName : string) => {

    solver.addEquation(Equation.new({
        name                : 'MinOrderForListLayout: ' + layoutName,
        rightHandSide       : layout.minOrderCount,
        type                : EquationType.GreaterOrEqual,

        coefficients        : new Map([
            [ variablesList.getVariable(layoutName), 1 ]
        ])
    }))
})


decols.forEach((decol : Decol, decolName : string) => {

    const coefficients : Map<Variable, number>  = new Map()

    layouts.forEach((layout : ListLayout, layoutName : string) => {
        coefficients.set(variablesList.getVariable(layoutName), layout.layout.get(decol) || 0)
    })

    solver.addEquation(Equation.new({
        name                : 'RequiredNumberOfDecol: ' + decolName,
        rightHandSide       : requiredDecols.get(decol) || 0,
        type                : EquationType.GreaterOrEqual,

        coefficients        : coefficients
    }))
})

// Задаем целевую функцию

const coefficients : Map<Variable, number>  = new Map()

layouts.forEach((layout : ListLayout, layoutName : string) => {
    const layoutVariable    = variablesList.getVariable(layoutName)

    let coefficientValue    = 0

    decols.forEach((decol : Decol, decolName : string) => {
        coefficientValue += decol.square * (layout.layout.get(decol) || 0)
    })

    coefficients.set(layoutVariable, coefficientValue)
})

solver.targetFunction = TargetFunction.new({
    variablesList       : variablesList,
    type                : ExtremumType.Minimum,

    coefficients        : coefficients
})


const result = solver.solve()
