declare let Siesta : any

let project : any

if (typeof process !== 'undefined' && typeof require !== 'undefined') {
    Siesta          = require('siesta-lite')

    project         = new Siesta.Project.NodeJS()
} else {
    project         = new Siesta.Project.Browser()
}

project.configure({
    title                   : 'Simplex Solver Test Suite',
    isEcmaModule            : true
})


project.start(
    '010_basic.t.js'
)
