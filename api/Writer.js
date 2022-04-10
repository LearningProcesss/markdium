const fs = require('fs');

class Writer {

    /**
     * @type String
     */
    filePath;

    /**
     * 
     * @param {String} filePath 
     */
    constructor(filePath) {
        this.filePath = filePath;
    }

    /**
     * 
     * @param {String} text 
     */
    append(text) {

        if (!text) {
            return;
        }

        fs.writeFileSync(this.filePath, text, { flag: "a+", encoding: "utf-8"});
    }
}

module.exports = {
    Writer
}