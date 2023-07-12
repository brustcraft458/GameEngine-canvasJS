import {load} from "../controler/loader.js"
import {tagScript} from "../controler/script.js"
import {Sprite} from "../controler/render.js"
import {Layout} from "../controler/layout.js"
import {Sound} from "../controler/sound.js"

// Example Script
tagScript("initialize", async() => {
    // Image & Layout Load
    load.layout("menu_main_loading", {isDisplayNow: true})
    load.layout("menu_main")
    load.layout("game_tiles")
    load.animation("stone_idle")
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

    // Play Music
    var musik = new Sound("music_dreamer")
    musik.play()

    // Spawn
    for (let posY = 0.0; posY < 200.0; posY += 50.0) {
        var obj = new Sprite([0.0, posY], [50.0, 50.0], {isAnimation: true})
        obj.playAnimation("stone_idle")
    }
})