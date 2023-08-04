import {load} from "../controler/loader.js"
import {mat4} from "../controler/basic.js"

// Becl Studio
// Game Engine Canvas 2D
// ----------------------
// Webgl Render

// Initialize
const canvas = document.querySelector('canvas')
const gl = canvas.getContext('webgl2', {antialias: false})

// Web GL
class Webgl {
    constructor() {
        // Init
        const matrixDefault = [
            0, 0, 0, 1,
            1, 0, 1, 0,
            0, 1, 1, 1,
        ]
        this.program = this.createProgramAllConfig()
        this.nameProgram = ""
        
        // Set Program
        this.changeProgram("image")
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

        // Position Buffer
        this.vertcoordBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertcoordBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(matrixDefault), gl.STATIC_DRAW)
    
        // Texture Coords Buffer
        this.texcoordBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(matrixDefault), gl.STATIC_DRAW)
    }

    // Shader Component
    createProgramAllConfig() {
        var listName = load.getConfig("all-name", "shader")
        var listProgram = {}

        // Compile All Shader
        for (let n = 0; n < listName.length; n++) {
            const name = listName[n]
            let vertex = load.getConfig(`${name}_vertex`, "shader").data
            let fragment = load.getConfig(`${name}_fragment`, "shader").data
            vertex = this.compileShader(vertex, gl.VERTEX_SHADER)
            fragment = this.compileShader(fragment, gl.FRAGMENT_SHADER)

            listProgram[name] = this.createProgram(vertex, fragment)
        }
        return listProgram
    }

    compileShader(shaderSource, shaderType) {
        // Create Shader
        var shader = gl.createShader(shaderType)
        gl.shaderSource(shader, shaderSource)
        gl.compileShader(shader)
       
        // Check Compiled
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
        if (!success) {
          throw "could not compile shader:" + gl.getShaderInfoLog(shader)
        }
        return shader
    }
    
    checkProgram(name) {
        if (Object.getOwnPropertyNames(this.program).indexOf(name) == -1) {return false}
        return true
    }
    
    changeProgram(name) {
        if (name == this.nameProgram) {return}
        var program = this.program[name]
        this.nameProgram = name

        // Attribute
        this.vertcoordLoc = gl.getAttribLocation(program, "a_vertcoord")
        this.texcoordLoc = gl.getAttribLocation(program, "a_texcoord")

        // Uniforms
        this.projectionLoc = gl.getUniformLocation(program, "u_projection")
        this.textureLoc = gl.getUniformLocation(program, "u_texture")
        this.positionLoc = gl.getUniformLocation(program, "u_position")
        this.resolutionLoc = gl.getUniformLocation(program, "u_resolution")
        this.texSizeLoc = gl.getUniformLocation(program, "u_texsize")
        
        // Set Shader Program
        gl.useProgram(program)
        gl.uniform2f(this.resolutionLoc, canvas.width, canvas.height)
    }
    
    createProgram(vertexShader, fragmentShader) {
        // Create Program.
        var program = gl.createProgram()
        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragmentShader)
        gl.linkProgram(program)
       
        // Check Linked
        var success = gl.getProgramParameter(program, gl.LINK_STATUS)
        if (!success) {
            throw ("program failed to link:" + gl.getProgramInfoLog(program))
        }
        return program
    }
    
    // Render Component
    clearScreen() {
        gl.clear(gl.COLOR_BUFFER_BIT)
    }

    resizeScreen(size) {
        var projection = mat4.orthographic(0.0, size.w, size.h, 0.0, -1.0, 1.0)
        gl.uniformMatrix4fv(this.projectionLoc, false, new Float32Array(projection))

        gl.viewport(0, 0, size.w, size.h)
        gl.uniform2f(this.resolutionLoc, size.w, size.h)
    }
    
    loadImageTexture(img) {
        var tex = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, tex)

        // Load Texture
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        return tex
    }

    drawImage(tex, dstX, dstY, texWidth, texHeight, shader) {
        this.changeProgram(shader)
        
        // Attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertcoordBuffer)
        gl.enableVertexAttribArray(this.vertcoordLoc)
        gl.vertexAttribPointer(this.vertcoordLoc, 2, gl.FLOAT, false, 0, 0)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer)
        gl.enableVertexAttribArray(this.texcoordLoc)
        gl.vertexAttribPointer(this.texcoordLoc, 2, gl.FLOAT, false, 0, 0)
        
        // Uniform
        gl.uniform3f(this.positionLoc, dstX, dstY, 0.0)
        gl.uniform2f(this.texSizeLoc, texWidth, texHeight)

        // Texture unit 0
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.uniform1i(this.textureLoc, 0)

        // Draw Quad
        gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
}

// Class to var
var webgl = new Webgl()
export {webgl}