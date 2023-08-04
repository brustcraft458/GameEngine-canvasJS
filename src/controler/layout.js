import {load} from "../controler/loader.js"
import {isMobile} from "../controler/basic.js"

// Becl Studio
// Game Engine Canvas 2D
// ----------------------
// Layout

// Initialize
const body = document.getElementById("interface_main")
var layoutQuene = {loaded: [], listed: []}

// Layout Loader
load.callb.layout = (name, param={isDisplayNow: false}) => {
    // Load
    var component = load.getXml(name, "layout", "xml")
    if (component == null) {throw `layout failed to load "${name}"`}
    if (layoutQuene.loaded.indexOf(name) != -1) {return}

    // Add Mobile CSS
    if (isMobile()) {
        mobileClass(component.getElementsByTagName("div"))
        mobileClass(component.getElementsByTagName("text"))
    }

    // Instant Display
    if (param.isDisplayNow) {
        body.innerHTML = component.firstChild.innerHTML
        return
    }

    // Append Quene
    var id = layoutQuene.listed.push({available: false, component}) - 1
    layoutQuene.loaded[id] = name
}

load.callreq.layout = () => {
    var promise = []
    for (let i = 0; i < layoutQuene.listed.length; i++) {
        const layout = layoutQuene.listed[i];
        if (layout == null) {continue}
        if (layout.available) {continue}
        /** @type {Document} */
        const component = layout.component
        
        // Load Images
        var imgelm = component.getElementsByTagName("img")
        for (let i2 = 0; i2 < imgelm.length; i2++) {
            const elm = imgelm[i2]
            promise.push(new Promise((resolve, reject) => {
                var img = new Image()
                img.onload = () => {
                    layout.available = true
                    resolve(true)
                }
                img.src = elm.getAttribute("src")
            }))
        }  
    }

    return Promise.all(promise)
}

class Layout {
    constructor(name) {
        this.name = name
        this.id = this.isAvailable()
        if (this.id == null) {throw `layout not available "${name}"`}

        /** @type {Document} */
        this.component = layoutQuene.listed[this.id].component
    }

    /** @private */
    isAvailable() {
        var id = layoutQuene.loaded.indexOf(this.name)
        if (id == -1) {
            return null
        }
        return id
    }

    display() {
        body.innerHTML = this.component.firstChild.innerHTML
    }
}

// Additional Functions
function mobileClass(elements) {
    for (let i = 0; i < elements.length; i++) {
        const elm = elements[i];
        const elmClass = elm.getAttribute("class")
        elm.setAttribute("class", `${elmClass} mobile`)
    }
}

export {Layout}