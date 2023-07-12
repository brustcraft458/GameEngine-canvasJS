import {dataRender} from "../config/render.js"
import {load} from "../controler/loader.js"
import {taskRunPriority, taskRun, Task} from "../controler/task.js"

// Becl Studio
// Game Engine Canvas 2D
// ----------------------
// Render

// Initialize
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const mixcan = document.createElement("canvas")
const mixctx = mixcan.getContext('2d', {willReadFrequently: true})
var taskRunCount = 0
var frameDelta = {now: 0, then: performance.now(), delay: 26}
document.addEventListener('contextmenu', event => event.preventDefault())

// Sprite for Render
class renderSprite {
    constructor() {
        this.limit = dataRender.spriteMax
        this.register = []
        this.render = new Array(this.limit).fill(null)
    }

    draw() {
        // Sprite Render
        for (let sid = 0, len = this.limit; sid < len; sid++) {
            const sprite = this.render[sid]
            if (sprite == null) {
                if (this.register.length == 0) {continue}
                const nsprite = this.register.pop()

                nsprite.setID(sid)
                this.render[sid] = nsprite
                continue
            }

            sprite.draw()
        }

        // Warning Message
        if (dataRender.debugDisplay) {
            if (this.register.length > 30) {ctx.fillText(`sprite leaks ${this.register.length}`, 10, 100)}
        }
    }
}

// Animation for Render
class renderAnimation {
    constructor() {
        this.loaded = []
        this.render = []
        this.img = []

        // Animation Loader
        load.callb.animation = async (name) => {
            // Load
            var config = load.getConfig(name, "animation", "png")
            if (config == null) {throw `animation name invalid "${name}"`}
            if (this.loaded.indexOf(name) != -1) {return}
            
            var id = this.render.push({
                available: false,
                path: config.path,
                data: {loop: config.data.loop, delay: config.data.delay},
                frame: {current: 0, max: config.data.frameMax, delta: performance.now()},
                listSpriteID: [],
                textureList: []
            }) - 1
            this.loaded[id] = name
        }
        
        load.callreq.animation = () => {
            var promise = []
            this.render.forEach(anim => {
                banim: {
                    if (anim == null) {break banim}
                    if (anim.available) {break banim}
        
                    promise.push(new Promise(async (resolve, reject) => {
                        var texture = new Texture(anim.path)
                        await texture.load()
                        var textureList = await texture.extractImage(anim.frame.max)
        
                        anim.textureList = textureList
                        anim.available = true
                        resolve(true)
                    }))
                }
            })
        
            return Promise.all(promise)
        }
    }

    draw() {
        for (let id = 0, len = this.render.length; id < len; id++) {
            const anim = this.render[id]
            if ((anim.frame.delta + anim.data.delay) > frameDelta.now) {return}

            if (anim.frame.current >= (anim.frame.max - 1)) {
                if (anim.data.loop != "end") {
                    anim.frame.current = 0
                }
            } else {
                anim.frame.current++
            }

            this.img[id] = anim.textureList[anim.frame.current]
            anim.frame.delta = frameDelta.now
        }
    }
}

function renderGame() {
    // Render Now
    window.requestAnimationFrame(renderGame)
    frameDelta.now = performance.now()

    // Frame Limit
    if ((frameDelta.then + frameDelta.delay) > frameDelta.now) {return}
    taskRunPriority(frameDelta.now)
    if (taskRunCount >= dataRender.taskDelay) {
        taskRun(frameDelta.now)
        taskRunCount = 0
    }

    // Render
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    renAnim.draw()
    renSprite.draw()

    // Text Debug
    if (dataRender.debugDisplay) {
        var frameFps = parseInt(1000 / (frameDelta.now - frameDelta.then))
        ctx.font = "30px Arial"
        ctx.fillStyle = "white"
        ctx.fillText(`fps ${frameFps} delta ${frameDelta.now}`, 10, 50)
        ctx.fillText(`anim ${renAnim.img.length}`, 10, 150)
    }

    // End
    frameDelta.then = frameDelta.now
    taskRunCount++
}

function renderStart() {
    camera.screenResize({w: window.innerWidth, h: window.innerHeight})
    window.addEventListener("resize", () => {
        camera.screenResize({w: window.innerWidth, h: window.innerHeight})
    })
    window.requestAnimationFrame(renderGame)
}

// Sprite for Render
class Sprite {
    constructor(pos, size, param = {isAnimation: false}) {
        param = {
            isAnimation: {required: param.isAnimation, available: false}
        }

        // Component
        this.id = null
        this.loaded = false
        this.pos = {x: pos[0], y: pos[1]}
        this.size = {w: size[0], h: size[1]}
        this.sizeHalf = {w: (size[0] * 0.5), h: (size[1] * 0.5)}
        this.velo = {x: 0, y: 0}
        this.img = null
        this.anim = {id: null, name: null}
        this.param = param

        renSprite.register.push({
            draw: () => {return this.draw()},
            setID: (id) => {return this.setID(id)}
        })
    }

    setID(id) {
        this.id = id
    }

    draw() {
        // Velocity
        this.pos.x += this.velo.x
        this.pos.y += this.velo.y

        // Camera Calc
        var pos = {
            x: ((this.pos.x - this.sizeHalf.w) + (camera.sizeHalf.w + camera.pos.x)),
            y: (((this.pos.y * -1.0) - this.sizeHalf.h) + (camera.sizeHalf.h + camera.pos.y))
        }

        // Animation
        if (this.anim.id != null) {
            ctx.drawImage(renAnim.img[this.anim.id], pos.x, pos.y, this.size.w, this.size.h)
            return
        }

        // Render
        if (this.img != null) {
            ctx.drawImage(this.img, pos.x, pos.y, this.size.w, this.size.h)
        } else if (!this.param.isAnimation.required) {
            ctx.fillRect(pos.x, pos.y, this.size.w, this.size.h)
        }
    }

    // Position Component
    setPosition(pos = {x: null, y: null}) {
        if (pos.x != null) {this.pos.x = pos.x}
        if (pos.y != null) {this.pos.y = pos.y}
    }

    setSize(size = {w: null, h: null}) {
        if (size.w != null) {this.size.w = size.w}
        if (size.h != null) {this.size.h = size.h}
    }

    setVelocity(speed = {x: null, y: null}) {
        if (speed.x != null) {this.velo.x = speed.x}
        if (speed.y != null) {this.velo.y = speed.y}
    }

    getPosition() {
        return this.pos
    }

    // Image Component
    setImage(texture = {img: null}) {
        this.img = texture.img
    }

    // Animation Component
    playAnimation(name) {
        const newanim = new Animation(name)
        this.anim.name = newanim.name
        this.anim.id = newanim.id

        const animation = renAnim.render[this.anim.id]
        if (animation.data.loop == "end") {
            animation.frame.current = 0
        }
        //this.img = renAnim.img[this.anim.id]
    }

    destroy(param = {isWaitScreen: false}) {
        const sdestroy = () => {
            renSprite.render[this.id] = null
        }
        if (!param.isWaitScreen) {sdestroy(); return}

        var task = new Task(() => {
            var pos = this.getPosition()
            var a = pos.x - camera.pos.x
            var b = pos.y - camera.pos.y
            var distance = Math.sqrt((a * a) + (b * b))
            if (distance > 1200.0) {
                sdestroy()
                task.stop()
                task = null
            }
        }, 100, {isLoop: true})
    }
}

// Camera
class Camera {
    constructor(pos) {
        this.pos = {x: pos[0], y: pos[1]}
        this.sizeHalf = {w: (canvas.width * 0.5), h: (canvas.height * 0.5)}
        this.folowSprite = null
    }

    screenResize(size) {
        canvas.width = size.w
        canvas.height = size.h
        this.sizeHalf = {w: (size.w * 0.5), h: (size.h * 0.5)}
    }

    setFollowSprite(sprite) {
        this.folowSprite = sprite.id
    }

    setFollowNormal() {
        this.folowSprite = null
    }

    setPosition(pos = {x: null, y: null}) {
        if (pos.x != null) {this.pos.x = pos.x}
        if (pos.y != null) {this.pos.y = pos.y}
    }

    getPosition() {
        return this.pos
    }
}

// Texture Manager
class Texture {
    constructor(path, param = {isSpecial: false}) {
        this.path = path
        this.img = null
        this.imgori = null
        this.color = null
        this.param = param
    }

    async load() {
        await new Promise((resolve, reject) => {
            // Load Image
            if (this.img != null || this.imgori != null) {
                resolve(true)
                return
            }
            var img = new Image()
            img.onload = () => {
                if (this.param.isSpecial) {
                    this.imgori = img
                } else {
                    this.img = img
                }
                resolve(true)
            }
            img.src = this.path
        })

        await new Promise((resolve, reject) => {
            // Canvas
            if (!this.param.isSpecial) {
                resolve(true)
                return
            }
            mixcan.width = this.imgori.width
            mixcan.height = this.imgori.height
            mixctx.clearRect(0, 0, mixcan.width, mixcan.height)
            
            // Color
            if (this.color != null) {
                mixctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`
                mixctx.fillRect(0, 0, this.imgori.width, this.imgori.height)
                mixctx.globalCompositeOperation = "destination-atop"
            }

            // Save Buffer
            mixctx.drawImage(this.imgori, 0, 0)
            var img = mixctx.getImageData(0, 0, this.imgori.width, this.imgori.height)
            createImageBitmap(img).then(img => {
                this.img = img
                resolve(true)
            })
        })
    }

    async extractImage(max) {
        mixcan.width = this.img.width / max
        mixcan.height = this.img.height
        var imgList = []
        var frmWidth = this.img.width / max
        var frmHeight = this.img.height

        for (let frm = 0; frm < max; frm++) {
            mixctx.clearRect(0, 0, mixcan.width, mixcan.height)
            mixctx.drawImage(this.img, frm * frmWidth, 0, frmWidth, frmHeight, 0, 0, frmWidth, frmHeight)
            var img = mixctx.getImageData(0, 0, mixcan.width, mixcan.height)
            img = await createImageBitmap(img)
            imgList.push(img)
        }
        return imgList
    }

    setColor(col) {
        this.color = {r: col[0], g: col[1], b: col[2]}
    }
}

// Animation Sprite
class Animation {
    constructor(name) {
        this.name = name
        this.id = this.isAvailable()
        if (this.id == null) {throw `animation not available ${name}`}
    }

    /** @private */
    isAvailable() {
        var id = renAnim.loaded.indexOf(this.name)
        if (id == -1) {return null}
        return id
    }

    getData() {
        return renAnim.render[this.id]
    }
}

// Class to var
var renSprite = new renderSprite()
var renAnim = new renderAnimation()
var camera = new Camera([0.0, 0.0])
export {renderStart, Sprite, Texture, Animation, camera}