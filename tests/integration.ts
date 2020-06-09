import { optimizeDecolsOrder } from "../main.js"
import { inputDataBig } from "./input.js"


const res = optimizeDecolsOrder(JSON.stringify(inputDataBig))

console.log(JSON.parse(res))
