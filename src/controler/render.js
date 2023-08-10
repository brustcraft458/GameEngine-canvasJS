import {dataRender} from "../config/render.js"
import {load} from "../controler/loader.js"
import {taskRunPriority, taskRun, Task} from "../controler/task.js"
import {check, isMobile} from "../controler/basic.js"
import {webgl} from "../controler/webgl.js"

// Becl Studio
// Game Engine Canvas 2D
// ----------------------
// Render

// Initialize
const canvas = document.querySelector('canvas')
const mixcan = document.createElement("canvas")
const mixctx = mixcan.getContext('2d', {willReadFrequently: true})
var taskRunCount = 0
var frameDelta = {now: 0, then: performance.now(), delay: dataRender.frameDelay}
document.addEventListener('contextmenu', event => event.preventDefault())

// Sprite for Render
class renderSprite {
    constructor() {
        this.limit = dataRender.spriteMax
        this.register = []
        this.render = new Array(this.limit).fill(null)
    }

    draw() {
        // Init
        var event = {
            button: lstButton.get()
        }

        // Sprite Render
        for (let sid = 0, len = this.limit; sid < len; sid++) {
            const sprite = this.render[sid]
            if (sprite == null) {
                if (this.register.length == 0) {continue}
                const nsprite = this.register.pop()

                nsprite.call.setID(sid)
                this.render[sid] = nsprite
                continue
            }

            if (event.button != null && sprite.param.isButton.required) {
                sprite.call.button(event.button.type, event.button.event)
            }
            sprite.call.draw()
        }

        // End
        lstButton.next()
    }
}

// Animation for Render
class renderAnimation {
    constructor() {
        this.loaded = []
        this.render = []
        this.texture = []

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
                        var textureList = await texture.extractImage(anim.frame.max, {isRender: true})
        
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

            this.texture[id] = anim.textureList[anim.frame.current]
            anim.frame.delta = frameDelta.now
        }
    }
}

// Button Listener
class listenButton {
    constructor() {
        this.listen = []
        this.touchState = false

        if (isMobile()) {
            canvas.addEventListener("touchstart", (event) => {
                for (let i = 0; i < event.touches.length; i++) {
                    const touch = event.touches[i]
                    this.listen.push({type: "touch", event: touch})
                }
            })
        } else {
            canvas.addEventListener("mousedown", (event) => {
                this.listen.push({type: "touch", event})
            })
        }
    }

    /** @private */
    pop() {
        if (this.listen.length == 0) {return null}
        return this.listen.pop()
    }

    get() {
        if (this.listen.length == 0) {return null}
        return this.listen[this.listen.length - 1]
    }

    next() {
        if (this.touchState) {this.touchState = false; return}
        this.pop()
    }

    touch() {
        this.pop()
        this.touchState = true
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
    webgl.clearScreen()
    renAnim.draw()
    renSprite.draw()

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
    #id; #pos; #size; #sizeHalf; #velo; #img; #tex; #anim; #shader; #param; #button;
    constructor(pos, size, param = {isAnimation: false, isButton: false}) {
        param = {
            isAnimation: {required: check.boolean(param.isAnimation), available: false},
            isButton: {required: check.boolean(param.isButton)}
        }

        // Component
        this.#id = null
        this.#pos = {x: pos[0], y: pos[1]}
        this.#size = {w: size[0], h: size[1]}
        this.#sizeHalf = {w: (size[0] * 0.5), h: (size[1] * 0.5)}
        this.#velo = {x: 0, y: 0}
        this.#tex = null
        this.#anim = null
        this.#shader = "image"
        this.#param = param
        this.#button = {state: false, callb: null}

        // Call
        const call = {
            setID: (id) => {
                this.#id = id
            },

            draw: () => {
                // Velocity
                this.#pos.x += this.#velo.x
                this.#pos.y += this.#velo.y
        
                // Animation
                if (this.#anim != null) {
                    const texture = this.#anim.getTexture()
                    webgl.drawImage(texture, this.#pos.x, this.#pos.y, this.#size.w, this.#size.h, this.#shader)
                    return
                }
        
                // Render
                if (this.#tex != null) {
                    webgl.drawImage(this.#tex, this.#pos.x, this.#pos.y, this.#size.w, this.#size.h, this.#shader)
                }
            },

            button: (type, onTouch) => {
                return this.#button.callb(type, onTouch)
            }
        }

        renSprite.register.push({param, call})
    }

    inRectangle(touchPos) {
        // Box
        var a = this.#pos.x - touchPos.x
        var b = this.#pos.y - touchPos.y
        var distance = {
            x: Math.sqrt(a * a),
            y: Math.sqrt(b * b)
        }
        
        if (this.#sizeHalf.w > distance.x && this.#sizeHalf.h > distance.y) {
            return true
        }
        return false
    }

    // Button Component
    addButtonListener(type, onTouch) {
        this.#button.type = type
        const getEventPos = (event) => {
            const camSizeHalf = camera.getSizeHalf()
            const camPos = camera.getPosition()
            return {
                x: (event.clientX - (camSizeHalf.w + camPos.x)),
                y: (event.clientY - (camSizeHalf.h + camPos.y)) * -1.0
            }
        }

        const callEvent = async() => {
            this.#button.state = true
            await onTouch()
            if (renSprite.render[this.#id] != null) {this.#button.state = false}
        }

        this.#button.callb = (type, event) => {
            if (this.#button.state) {return}
            if (this.#button.type != type) {return}
            let pos = getEventPos(event)

            if (this.inRectangle(pos)) {
                lstButton.touch()
                callEvent()
            }
        }
    }

    // Position Component
    setPosition(pos = {x: null, y: null}) {
        if (pos.x != null) {this.#pos.x = pos.x}
        if (pos.y != null) {this.#pos.y = pos.y}
    }

    setSize(size = {w: null, h: null}) {
        if (size.w != null) {this.#size.w = size.w}
        if (size.h != null) {this.#size.h = size.h}
    }

    setVelocity(speed = {x: null, y: null}) {
        if (speed.x != null) {this.#velo.x = speed.x}
        if (speed.y != null) {this.#velo.y = speed.y}
    }

    getPosition() {
        return this.#pos
    }

    // Shader Component
    setShader(name) {
        if (!webgl.checkProgram(name)) {throw `shader not available "${name}"`}
        this.#shader = name
    }

    // Image Component
    setImage(texture) {
        this.#tex = texture.getImage()
    }

    getID() {
        return this.#id
    }

    // Animation Component
    playAnimation(name) {
        this.#anim = new Animation(name)

        const animation = this.#anim.getData()
        if (animation.data.loop == "end") {
            animation.frame.current = 0
        }
    }

    destroy(param = {isWaitScreen: false}) {
        const sdestroy = () => {
            renSprite.render[this.#id] = null
        }
        if (!param.isWaitScreen) {sdestroy(); return}

        var task = new Task(() => {
            var pos = this.getPosition()
            var camPos = camera.getPosition()
            var a = pos.x - camPos.x
            var b = pos.y - camPos.y
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
    #pos; #sizeHalf; #folowSprite;
    constructor(pos) {
        this.#pos = {x: pos[0], y: pos[1]}
        this.#sizeHalf = {w: (canvas.width * 0.5), h: (canvas.height * 0.5)}
        this.#folowSprite = null
    }

    screenResize(size) {
        canvas.width = size.w
        canvas.height = size.h
        webgl.resizeScreen(size)
        this.#sizeHalf = {w: (size.w * 0.5), h: (size.h * 0.5)}
    }

    setFollowSprite(sprite) {
        this.#folowSprite = sprite.getID()
    }

    setFollowNormal() {
        this.#folowSprite = null
    }

    setPosition(pos = {x: null, y: null}) {
        if (pos.x != null) {this.#pos.x = pos.x}
        if (pos.y != null) {this.#pos.y = pos.y}
        webgl.changeCamera(this.#pos)
    }

    getFollowSprite(spriteID) {
        return (spriteID == this.#folowSprite) ? true : false
    }

    getPosition() {
        return this.#pos
    }

    getSizeHalf() {
        return this.#sizeHalf
    }
}

// Texture Manager
class Texture {
    #tex; #path; #img; #size; #param;
    constructor(src, param = {isRender: false}) {
        this.#tex = null
        this.#path = null
        this.#img = null
        this.#size = {w: 0.0, h: 0.0}
        this.#param = param

        switch (src.constructor.name) {
            case "ImageBitmap":
                if (param.isRender) {
                    this.#tex = webgl.loadImageTexture(src)
                } else {
                    this.#img = src
                }

                this.#size = {w: src.width, h: src.height}
            break;
            case "String":
                this.#path = src
            break;
        
            default:
            break;
        }
    }

    load() {
        return new Promise((resolve, reject) => {
            // Load Image
            if (this.#img != null || this.#tex != null) {
                resolve(true)
                return
            }

            var img = new Image()
            img.onload = () => {
                if (this.#param.isRender) {
                    this.#tex = webgl.loadImageTexture(img)
                } else {
                    this.#img = img
                }

                this.#size = {w: img.width, h: img.height}
                resolve(true)
            }
            img.src = this.#path
        })
    }

    async extractImage(max, param) {
        mixcan.width = this.#img.width / max
        mixcan.height = this.#img.height
        var imgList = []
        var frmWidth = this.#img.width / max
        var frmHeight = this.#img.height

        for (let frm = 0; frm < max; frm++) {
            mixctx.clearRect(0, 0, mixcan.width, mixcan.height)
            mixctx.drawImage(this.#img, frm * frmWidth, 0, frmWidth, frmHeight, 0, 0, frmWidth, frmHeight)
            var img = mixctx.getImageData(0, 0, mixcan.width, mixcan.height)
            img = await createImageBitmap(img)
            imgList.push(new Texture(img, param).getImage())
        }
        return imgList
    }

    getImage() {
        if (this.#param.isRender) {return this.#tex}
        return this.#img
    }

    getSize() {
        return this.#size
    }
}

// Animation Sprite
class Animation {
    #name; #id;
    constructor(name) {
        var id = renAnim.loaded.indexOf(name)
        if (id == -1) {throw `animation not available ${name}`}
        this.#name = name
        this.#id = id
    }

    getData() {
        return renAnim.render[this.#id]
    }

    getTexture() {
        return renAnim.texture[this.#id]
    }
}

// Class to var
var renSprite = new renderSprite()
var renAnim = new renderAnimation()
var lstButton = new listenButton()
var camera = new Camera([0.0, 0.0])
export {renderStart, Sprite, Texture, Animation, camera}