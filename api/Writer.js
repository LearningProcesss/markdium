const fs = require('fs');
const path = require('path');

class Writer {

    /**
     * @type String
     */
    baseDir;

    /**
     * 
     * @param {String} baseDir 
     */
    constructor(baseDir) {
        this.baseDir = baseDir;
    }

    /**
     * @param {String} fileName
     * @param {String} text 
     */
    append(fileName, text) {

        if (!fileName || !text) {
            return;
        }

        fs.writeFileSync(path.join(this.baseDir, fileName), text, { flag: "a+", encoding: "utf-8"});
    }

    /**
     * 
     * @param {string} fileName 
     * @returns {String}
     */
    getFullFilePath(fileName) {
        return path.join(this.baseDir, fileName);
    }

}

module.exports = {
    Writer
}