import {isEven} from "../controler/basic.js"

// Becl Studio
// Game Engine Canvas 2D
// ----------------------
// Chunk

class Grid {
    constructor() {}

    draw(callb, width, gutter, total, param = {isDraw: null}) {
        if (!Array.isArray(param.isDraw)) {param.isDraw = new Array(total).fill(true)}
        var pos = 0.0

        // Box
        var step = (width / total) + (gutter / total)
        if (isEven(total)) {
            pos -= step * 1.5
        } else {
            pos -= step * 2
        }

        for (let num = 0; num < total; num++) {
            if (param.isDraw[num]) {callb(pos)}
            pos += step
        }
    }
}

// Class to var
var grid = new Grid()
export {grid}