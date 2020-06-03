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

export const optimize = (
    decols : Map<string, Decol>,
    layouts : Map<string, ListLayout>,
    requiredDecols : Map<Decol, number>,
    useMinimimalOrder : boolean,
    optimizeBySquare : boolean
) => {
    // Создаем список переменных
    const variablesList = VariablesList.new()

    layouts.forEach((layout : ListLayout, name : string) => {
        variablesList.addVariable(Variable.new({ name : name }))
    })

    // Создаем список ограничений
    const solver = SimplexMethodSolver.new({
        variablesList       : variablesList
    })

    if (useMinimimalOrder) {
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
    }


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

    if (optimizeBySquare) {
        layouts.forEach((layout : ListLayout, layoutName : string) => {
            const layoutVariable    = variablesList.getVariable(layoutName)

            let coefficientValue    = 0

            decols.forEach((decol : Decol, decolName : string) => {
                coefficientValue += decol.square * (layout.layout.get(decol) || 0)
            })

            coefficients.set(layoutVariable, coefficientValue)
        })
    } else {
        layouts.forEach((layout : ListLayout, layoutName : string) => {
            const layoutVariable    = variablesList.getVariable(layoutName)

            let coefficientValue    = 0

            decols.forEach((decol : Decol, decolName : string) => {
                coefficientValue += (layout.layout.get(decol) || 0)
            })

            coefficients.set(layoutVariable, coefficientValue)
        })
    }

    solver.targetFunction = TargetFunction.new({
        variablesList       : variablesList,
        type                : ExtremumType.Minimum,

        coefficients        : coefficients
    })

    return solver.solve()
}
