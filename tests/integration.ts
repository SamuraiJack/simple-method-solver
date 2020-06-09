import { optimizeDecolsOrder } from "../main.js"
import { inputDataBig } from "./input.js"
import { inputDataBig2 } from "./input2.js"


const res = optimizeDecolsOrder(JSON.stringify(inputDataBig2))

console.log(JSON.parse(res))
