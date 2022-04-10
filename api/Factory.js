const { Tor } = require('./Tor');
const { Interpreter } = require('./Interpreter');
const { Writer } = require('./Writer');

class Factory {
    static Create() {
        const interpreter = new Interpreter();
        const writer = new Writer('/workspaces/markdium/output/');
        const tor = new Tor(interpreter, writer);

        return tor;
    }
}

module.exports = {
    Factory
}