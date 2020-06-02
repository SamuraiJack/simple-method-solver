import { Base } from "./Base.js"
import { Equation, EquationType, ExtremumType, SimplexMethodSolver, TargetFunction, Variable, VariablesList } from "./SimplexMethod.js"

export class Decol extends Base {
    square      : number
}

export class ListLayout extends Base {
    name        : string

    layout      : Map<Decol, number> = new Map()

    minOrderCount    : number
}

// class Result {
//     required    : Map<Decol, number>
//
//     result      : Map<ListLayout, number>
//
//
//     getUnusefulSquare () : number {
//         let decolsCount : Map<Decol, number> = new Map()
//
//         this.result.forEach((orderedNumber : number, layout : ListLayout) => {
//
//             layout.layout.forEach((count : number, decol : Decol) => {
//                 let already = decolsCount.get(decol)
//
//                 if (already === undefined) { already = 0; decolsCount.set(decol, 0) }
//
//
//                 decolsCount.set(decol, already + count * orderedNumber)
//             })
//         })
//
//         let unsefulSquare = 0
//
//         decolsCount.forEach((count : number, decol : Decol) => {
//             unsefulSquare += (count - this.required.get(decol)) * decol.square
//         })
//
//         return unsefulSquare
//     }
// }


export const optimize = (decols : Map<string, Decol>, layouts : Map<string, ListLayout>, requiredDecols : Map<Decol, number>) => {
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

    return solver.solve()
}
