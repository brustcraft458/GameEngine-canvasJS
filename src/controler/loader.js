import {dataAnim} from "../config/anim.js"
import {dataLayout} from "../config/layout.js"
import {dataSound} from "../config/sound.js"

// Becl Studio
// Game Engine Canvas 2D
// ----------------------
// Loader

// Initialize
const domParse = new DOMParser()

class Loader {
    constructor() {
        this.callb = {animation: null, layout: null, sound: null}
        this.callreq = {animation: null, layout: null, sound: null}
    }

    animation(name) {return this.callb.animation(name)}
    requestAnimation() {return this.callreq.animation()}
    layout(name, param) {return this.callb.layout(name, param)}
    requestLayout() {return this.callreq.layout()}
    sound(name) {return this.callb.sound(name)}
    requestSound() {return this.callreq.sound()}

    getConfig(name, type, filetype) {
        var sname = name.split("_")
        var path = name.replaceAll("_", "/")
        path = `../../data/${type}/${path}.${filetype}`
        var config = null

        try {
            switch (type) {
                case "animation":
                    config = dataAnim[sname[0]][sname[1]]
                break;
                case "sound":
                    config = dataSound[sname[0]][sname[1]]
                break;
            
                default:
                throw "type invalid";
            }
        } catch (e) {
            return null
        }
        return {data: config, path}
    }

    getXml(name, type, filetype) {
        /** @type {Document} */
        var xml = null

        switch (type) {
            case "layout":
                xml = domParse.parseFromString(dataLayout[name], `text/${filetype}`)
            break;
        
            default:
            throw "type invalid";
        }
        return xml
    }

}

// Class to var
var load = new Loader()
export {load}