// Becl Studio
// Game Engine Canvas 2D
// ----------------------
// Script

// Initialize
var scriptQuene = []

async function runScript(name) {
    scriptQuene = []

    // Script Load
    await new Promise((resolve, reject) => {
        const element = document.getElementById("script_additional")
        var script = document.createElement("script")
        script.onload = () => {
            resolve(true)
        }

        script.src = `./src/script/${name}.js`
        script.type = "module"
        element.appendChild(script)
    })

    // Script Runner
    for (let id = 0; id < scriptQuene.length; id++) {
        const script = scriptQuene[id]
        console.log(`runscript "${name}" tag "${script.tag}"`)
        await script.callb()
    }
}

function tagScript(tag, callb) {
    scriptQuene.push({tag, callb})   
}


export {runScript, tagScript}