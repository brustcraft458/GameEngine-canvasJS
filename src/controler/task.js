// Becl Studio
// Game Engine Canvas 2D
// ----------------------
// Task

// Initialize
var taskQuene = {num: 0, empty: [], listed: []}
var taskprQuene = {garbage: 0, num: 0, listed: []}

// Task Runner
function taskRun(frameDeltaNow) {
    var tid = 0, len = taskQuene.listed.length;
    while (tid < len) {
        const task = taskQuene.listed[tid]
        btask: {
            if (task == null) {
                if (taskQuene.empty.indexOf(tid) == -1) {taskQuene.empty.push(tid)}
                break btask
            }
            if ((task.time.delta + task.time.delay) > frameDeltaNow) {break btask}
        
            // Run
            task.callb()
            if (!task.param.isLoop) {task.stop()}
            task.time.delta = frameDeltaNow
        }

        tid++
    }
}

function taskRunPriority(frameDeltaNow) {
    var tid = 0, len = taskprQuene.listed.length;
    while (tid < len) {
        const task = taskprQuene.listed[tid]
        if (task != null) {
            // Run
            task.callb()
            if (!task.param.isLoop) {task.stop()}
        }
        
        tid++
    }
}

class Task {
    constructor(callb, delay, param = {isLoop: false, isPriority: false}) {
        this.param = param
        var id = null
        if (param.isPriority) {
            id = taskprQuene.num
        } else {
            id = this.generateID()
        }
        
        var task = {
            time: {delay, delta: performance.now()},
            param,
            callb,
            stop: () => {return this.stop()}
        }

        if (param.isPriority) {
            taskprQuene.listed[id] = task
            taskprQuene.num++
        } else {
            taskQuene.listed[id] = task
        }

        this.id = id
    }

    generateID() {
        var id = null
        if (taskQuene.empty.length == 0) {
            id = taskQuene.num
            taskQuene.num++
        } else {
            id = taskQuene.empty.pop()
        }
        return id
    }

    stop() {
        if (this.param.isPriority) {
            taskprQuene.listed[this.id] = null
        } else {
            taskQuene.listed[this.id] = null
        }
    }

    clearAll() {
        if (this.param.isPriority) {
            taskprQuene = {garbage: 0, num: 0, listed: []}
        } else {
            taskQuene = {num: 0, empty: [], listed: []}
        }
    }
}

class Timer {
    constructor() {}

    sleep(delay) {
        return new Promise((resolve) => {
            new Task(() => {
                resolve(true)
            }, delay)
        })
    }
}

// Class to var
var timer = new Timer()
export {taskRunPriority, taskRun, Task, timer}