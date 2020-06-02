import { Base } from "./Base.js"


export class Variable extends Base {
    // ignore this
    isVariable  : any

    name    : string
}


export class VariablesList extends Base {
    variables       : Map<string, Variable>     = new Map()

    addVariable (variable : Variable) {
        this.variables.set(variable.name, variable)
    }

    getVariable (name : string) : Variable {
        return this.variables.get(name)
    }

    clone () : VariablesList {
        return VariablesList.new({ variables : new Map(this.variables.entries()) })
    }
}


export enum EquationType {
    LessOrEqual         = 'LessOrEqual',
    GreaterOrEqual      = 'GreaterOrEqual',
    Equal               = 'Equal'
}

export enum ExtremumType {
    Minimum             = 'Minimum',
    Maximum             = 'Maximum'
}


export class BaseEquation extends Base {
    name            : string

    variablesList   : VariablesList

    coefficients    : Map<Variable, number>     = new Map()

    clone () : this {
        const cls = this.constructor as typeof BaseEquation

        return cls.new({
            name            : this.name,
            variablesList   : this.variablesList,
            coefficients    : new Map(this.coefficients.entries())
        }) as this
    }
}


export class Equation extends BaseEquation {
    rightHandSide   : number

    type            : EquationType

    clone () {
        const clone = super.clone()

        Object.assign(clone, {
            rightHandSide   : this.rightHandSide,
            type            : this.type
        })

        return clone
    }

    negateAllCoefficientsAndRhs () {
        this.rightHandSide  = -this.rightHandSide

        this.coefficients.forEach((coefValue, variable) => {
            this.coefficients.set(variable, -coefValue)
        })
    }

    divideOn (value : number) {
        this.rightHandSide  = this.rightHandSide / value

        this.coefficients.forEach((coefValue, variable) => {
            this.coefficients.set(variable, coefValue / value)
        })
    }


    findVariableWithNegativeAndMaximumModuloCoefficient () : Variable {
        let currentVariable : Variable = null

        this.coefficients.forEach((coefValue, variable) => {
            if (
                coefValue < 0
                && (currentVariable === null || Math.abs(coefValue) > Math.abs(this.coefficients.get(currentVariable)))
            ) {
                currentVariable = variable
            }
        })

        if (currentVariable === null) throw new Error("No negative coefficients - no optimization solution")

        return currentVariable
    }


    subtractMultiplied (anotherEquation : Equation, value : number) {
        this.rightHandSide  = this.rightHandSide - anotherEquation.rightHandSide * value

        this.coefficients.forEach((coefValue, variable) => {
            this.coefficients.set(variable, coefValue - (anotherEquation.coefficients.get(variable) || 0) * value)
        })
    }
}

export class TargetFunction extends BaseEquation {
    type            : ExtremumType
}


export type SimplexSolution = {
    error?      : string,
    result?     : Map<Variable, number>
}

let VAR_ID = 0

export class SimplexMethodSolver extends Base {
    variablesList   : VariablesList     = VariablesList.new()

    equations       : Equation[]        = []

    targetFunction  : TargetFunction

    currentBasis    : Map<Variable, Equation>


    addEquation (equation : Equation) {
        this.equations.push(equation)
    }


    convertToCanonical () : SimplexMethodSolver {
        const canonicalVariables : VariablesList    = this.variablesList.clone()
        const canonicalEquations : Equation[]       = []

        const initialBasis : Map<Variable, Equation> = new Map()

        this.equations.forEach(equation => {
            const canonicalEquation = equation.clone()

            if (equation.type === EquationType.LessOrEqual) {
                const extraVariable = Variable.new({ name : (VAR_ID++) + 'Extra variable for: ' + equation.name })

                canonicalVariables.addVariable(extraVariable)
                initialBasis.set(extraVariable, canonicalEquation)

                canonicalEquation.coefficients.set(extraVariable, 1)

            } else if (equation.type === EquationType.GreaterOrEqual) {
                const extraVariable = Variable.new({ name : (VAR_ID++) + 'Extra variable for: ' + equation.name })

                canonicalVariables.addVariable(extraVariable)
                initialBasis.set(extraVariable, canonicalEquation)

                canonicalEquation.negateAllCoefficientsAndRhs()

                canonicalEquation.coefficients.set(extraVariable, 1)
            } else {
                throw new Error("Not supported yet")
            }

            canonicalEquation.type  = EquationType.Equal

            canonicalEquations.push(canonicalEquation)
        })

        return SimplexMethodSolver.new({
            variablesList       : canonicalVariables,
            currentBasis        : initialBasis,
            equations           : canonicalEquations,
            targetFunction      : this.targetFunction
        })
    }


    solve () : SimplexSolution {
        try {
            const result = this.convertToCanonical().doSolve()

            return {
                error   : '',
                result : new Map(
                    Array.from(result.entries()).filter(([ variable, value ]) => this.variablesList.variables.has(variable.name))
                )
            }
        } catch (e) {
            return { error : String(e), result : new Map() }
        }
    }


    doSolve () : Map<Variable, number> {
        this.equations.forEach(equation => {
            if (equation.type !== EquationType.Equal) throw new Error("Must be in the canonical form")
        })

        this.normalizeRightHandSides()

        let deltas : Equation

        do {
            deltas = this.calculateDeltas()

            if (this.foundOptimum(deltas)) break

            const resolvingVariable : Variable = this.findResolvingVariable(deltas)

            const simplexQ : Map<Variable, number> = this.findSimplexQ(resolvingVariable)

            if (simplexQ.size === 0) throw new Error("Function is not limited, no solution")

            let variableWithMinQ = this.findVariableWithMinQ(simplexQ)

            this.nullifyCoefficientsOfVariable(variableWithMinQ, this.currentBasis.get(variableWithMinQ), resolvingVariable)

        } while (true)

        const result : Map<Variable, number> = new Map()

        this.currentBasis.forEach((equation : Equation, variable : Variable) => {
            if (equation.rightHandSide < 0) throw new Error("Negative free coefficient - No solution")

            result.set(variable, equation.rightHandSide)
        })

        this.variablesList.variables.forEach(variable => {
            if (!result.has(variable)) result.set(variable, 0)
        })

        return result
    }


    hasRightHandSideLessThanZero () : boolean {
        let hasRightHandSideLessThanZero : boolean = false

        this.equations.forEach(equation => {
            if (equation.rightHandSide < 0) hasRightHandSideLessThanZero = true
        })

        return hasRightHandSideLessThanZero
    }


    findEquationWithNegativeAndMaximumModuloRightHandSide () : { variable : Variable, equation : Equation } {
        let currentEquation : Equation = null
        let currentVariable : Variable = null

        this.currentBasis.forEach((equation : Equation, variable : Variable) => {
            if (
                equation.rightHandSide < 0
                && (currentEquation === null || Math.abs(equation.rightHandSide) > Math.abs(currentEquation.rightHandSide))
            ) {
                currentEquation = equation
                currentVariable = variable
            }
        })

        if (currentEquation === null) throw new Error("No negative right hand sides")

        return { variable : currentVariable, equation : currentEquation }
    }


    normalizeRightHandSides () {
        while (this.hasRightHandSideLessThanZero()) {
            const equationWithNegativeAndMaximumModuleRhs = this.findEquationWithNegativeAndMaximumModuloRightHandSide()

            const variableWithNegativeAndMaximumModuloCoefficient =
                equationWithNegativeAndMaximumModuleRhs.equation.findVariableWithNegativeAndMaximumModuloCoefficient()

            this.nullifyCoefficientsOfVariable(
                equationWithNegativeAndMaximumModuleRhs.variable,
                equationWithNegativeAndMaximumModuleRhs.equation,
                variableWithNegativeAndMaximumModuloCoefficient
            )

            // this.changeBasis(
            //     equationWithNegativeAndMaximumModuleRhs.variable,
            //     equationWithNegativeAndMaximumModuleRhs.equation,
            //     variableWithNegativeAndMaximumModuloCoefficient
            // )
            //
            // equationWithNegativeAndMaximumModuleRhs.equation.divideOn(
            //     equationWithNegativeAndMaximumModuleRhs.equation.coefficients.get(variableWithNegativeAndMaximumModuloCoefficient) || 0
            // )
            //
            // this.currentBasis.forEach((equation, variable) => {
            //     // ignore the current equation
            //     if (equation === equationWithNegativeAndMaximumModuleRhs.equation) return
            //
            //     equation.subtractMultiplied(equationWithNegativeAndMaximumModuleRhs.equation, equation.coefficients.get(variable) || 0)
            // })
        }
    }


    nullifyCoefficientsOfVariable (oldVariable : Variable, oldEquation : Equation, newVariable : Variable) {
        this.changeBasis(oldVariable, oldEquation, newVariable)

        oldEquation.divideOn(
            oldEquation.coefficients.get(newVariable) || 0
        )

        this.currentBasis.forEach((equation, variable) => {
            // ignore the current variable
            if (equation === oldEquation) return

            equation.subtractMultiplied(oldEquation, equation.coefficients.get(newVariable) || 0)
        })
    }



    changeBasis (oldVariable : Variable, oldEquation : Equation, newVariable : Variable) {
        if (this.currentBasis.has(newVariable)) throw new Error("Already in basis, wtf?")

        this.currentBasis.set(newVariable, oldEquation)

        this.currentBasis.delete(oldVariable)
    }


    calculateDeltas () : Equation {
        const deltasEquation : Equation = Equation.new({ variablesList : this.variablesList })

        this.variablesList.variables.forEach((variable : Variable, name : string) => {
            let delta   = 0

            this.currentBasis.forEach((equation : Equation, basisVariable : Variable) => {
                delta   += (this.targetFunction.coefficients.get(basisVariable) || 0) * (equation.coefficients.get(variable) || 0)
            })

            delta       -= this.targetFunction.coefficients.get(variable) || 0

            deltasEquation.coefficients.set(variable, delta)
        })

        let rhs     = 0

        this.currentBasis.forEach((equation : Equation, basisVariable : Variable) => {
            rhs     += (this.targetFunction.coefficients.get(basisVariable) || 0) * equation.rightHandSide
        })

        deltasEquation.rightHandSide = rhs

        return deltasEquation
    }


    foundOptimum (deltas : Equation) : boolean {
        let isOptimal : boolean = true

        deltas.coefficients.forEach((delta : number, variable : Variable) => {
            if (this.targetFunction.type === ExtremumType.Minimum) {
                if (delta > 0) isOptimal = false
            } else {
                if (delta < 0) isOptimal = false
            }
        })

        // if (this.targetFunction.type === ExtremumType.Minimum) {
        //     if (deltas.rightHandSide > 0) isOptimal = false
        // } else {
        //     if (deltas.rightHandSide < 0) isOptimal = false
        // }

        return isOptimal
    }


    findResolvingVariable (deltas : Equation) : Variable {
        let resolvingVariable : Variable = null

        let currentDelta = this.targetFunction.type === ExtremumType.Minimum ? -1e10 : 1e10

        deltas.coefficients.forEach((delta : number, variable : Variable) => {
            if (this.targetFunction.type === ExtremumType.Minimum) {
                if (delta > currentDelta) {
                    currentDelta        = delta
                    resolvingVariable   = variable
                }
            } else {
                if (delta < currentDelta) {
                    currentDelta        = delta
                    resolvingVariable   = variable
                }
            }
        })

        return resolvingVariable
    }


    findSimplexQ (resolvingVariable : Variable) : Map<Variable, number> {
        const simplexQ : Map<Variable, number> = new Map()

        this.currentBasis.forEach((equation : Equation, basisVariable : Variable) => {
            const coef = equation.coefficients.get(basisVariable)

            if (equation.rightHandSide < 0) throw new Error("debug me")

            if (coef !== 0 && equation.rightHandSide >= 0) {
                simplexQ.set(basisVariable, equation.rightHandSide / coef)
            }
        })

        return simplexQ
    }


    findVariableWithMinQ (simplexQ : Map<Variable, number>) : Variable {
        let min = 1e10
        let currentVariable : Variable = null

        simplexQ.forEach((simplexQ : number, variable : Variable) => {
            if (simplexQ < min) {
                min     = simplexQ

                currentVariable = variable
            }
        })

        return currentVariable
    }
}


