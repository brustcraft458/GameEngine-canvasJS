import {load} from "../controler/loader.js"
import {Task} from "../controler/task.js"

// Becl Studio
// Game Engine Canvas 2D
// ----------------------
// Sound

// Initialize
const canvas = document.querySelector('canvas')
var soundQuene = {listed: [], loaded: []}

// Sound Manager
canvas.addEventListener("click", () => {
    soundQuene.listed.forEach(sound => {
        loadq: {
            if (sound == null) {break loadq}
            if (sound.available) {
                if (sound.audio.pause) {sound.audio.play()}
                break loadq
            }

            sound.audio.volume = 0.0
            sound.audio.loop = true
            sound.audio.play()
            sound.available = true
        }
    })
})

document.addEventListener("visibilitychange", () => {
    soundQuene.listed.forEach(sound => {
        loadq: {
            if (sound == null) {break loadq}
            if (!sound.available) {break loadq}
            
            if (document.visibilityState == "visible") {
                if (sound.audio.pause) {sound.audio.play()}
            } else {
                sound.audio.pause()
            }
        }
    })
})

// Sound Loader
load.callb.sound = (name) => {
    var config = load.getConfig(name, "sound", "webm")
    if (config == null) {throw `sound name invalid "${name}"`}
    if (soundQuene.loaded.indexOf(name) != -1) {return}
    var audio = new Audio(config.path)
    audio.volume = 0.0
    
    // Load
    var id = soundQuene.listed.push({audio, available: false}) - 1
    soundQuene.loaded[id] = name
}

load.callreq.sound = () => {
    var promise = []
    soundQuene.listed.forEach(sound => {
        if (sound != null) {
            promise.push(new Promise((resolve, reject) => {let loop = new Task(() => {
                if (sound.available) {
                    loop.stop()
                    resolve(true)
                }
            }, 10, {isLoop: true})}))
        }
    })

    return Promise.all(promise)
}

class Sound {
    #name; #id; #audio;
    constructor(name) {
        var id = soundQuene.loaded.indexOf(name)
        if (id == -1) {throw `sound not available "${name}"`}

        this.#name = name
        this.#id = id
        /** @type {HTMLAudioElement} */
        this.#audio = soundQuene.listed[id].audio
    }

    play() {
        this.#audio.currentTime = 0
        this.#audio.volume = 1.0
    }

    stop() {
        this.#audio.volume = 0.0
        this.#audio.currentTime = 0
    }

    volumeFadeIn(timeDelay) {
        var volume = this.#audio.volume
        var loop = new Task(() => {
            volume += 0.1
            if (volume > 1.0) {
                loop.stop()
            } else {
                this.#audio.volume = volume
            }
        }, timeDelay, {isLoop: true})
    }

    volumeFadeOut(timeDelay) {
        var volume = this.#audio.volume
        var loop = new Task(() => {
            volume -= 0.1
            if (0.0 > volume) {
                loop.stop()
            } else {
                this.#audio.volume = volume
            }
        }, timeDelay, {isLoop: true})
    }
}

export {Sound}