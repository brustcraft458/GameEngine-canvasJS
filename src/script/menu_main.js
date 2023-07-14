import {load} from "../controler/loader.js"
import {tagScript} from "../controler/script.js"
import {Sprite} from "../controler/render.js"
import {Layout} from "../controler/layout.js"
import {Sound} from "../controler/sound.js"
import {timer} from "../controler/task.js"
import {grid} from "../controler/chunk.js"

// Example Script
tagScript("initialize", async() => {
    // Image & Layout Load
    load.layout("menu_main_loading", {isDisplayNow: true})
    load.layout("menu_main")
    load.layout("game_tiles")
    load.animation("stone_idle")
    load.animation("stone_idle2")
    await load.requestLayout()
    await load.requestAnimation()

    // Title
    var layout = new Layout("menu_main")
    layout.display()

    // Music Load
    load.sound("music_dreamer")
    await load.requestSound()
})

tagScript("gameplay", async() => {
    // Game
    var layout = new Layout("game_tiles")
    layout.display()

    // Score
    const domScore = document.getElementById("game_tiles_score")
    var score = 0

    // Play Music
    var musik = new Sound("music_dreamer")
    musik.play()

    // Spawn
    const createObj = (pos) => {
        let obj = new Sprite([pos.x, pos.y], [50.0, 50.0], {isAnimation: true, isButton: true})
        obj.playAnimation("stone_idle")
        obj.onTouch = async() => {
            // Play
            obj.playAnimation("stone_idle2")

            // Score Update
            score++
            domScore.innerText = `Score: ${score}`

            // Object Respawn
            await timer.sleep(150)
            obj.destroy()

            var newpos = {
                x: (Math.random() - 0.5) * 300.0,
                y: (Math.random() - 0.5) * 300.0
            }
            createObj(newpos)
        }
    }

    // Spawn with Grid
    grid.draw((y) => {
        grid.draw((x) => {
            createObj({x, y})
        }, 390.0, 3.0, 5)
    }, 390.0, 3.0, 4,)
})