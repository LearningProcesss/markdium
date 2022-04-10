const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const axios = require('axios');
const path = require('path');
const { Interpreter } = require('./Interpreter');

class Interpretation {

    extensions = {
        '.tsx': 'typescript',
        '.js': 'javascript',
    }

    /**
     * @type {Interpreter}
     */
    interpreter;

    /**
     * 
     * @param {Interpreter} interpreter 
     */
    constructor(interpreter) {
        this.interpreter = interpreter;
    }

    /**
     *
     * @param {cheerio.CheerioAPI} $
     * @param {cheerio.Element} el
     * @returns {Promise<String>}
     */
    async do($, page, el) {
        throw "base class not implemented!";
    }
}
/**
 * @extends Interpretation
 */
class H1 extends Interpretation {

    /**
    * 
    * @param {Interpreter} interpreter 
    */
    constructor(interpreter) {
        super(interpreter);
    }

    /**
    *
    * @param {cheerio.CheerioAPI} $
    * @param {cheerio.Element} el
    * @returns {Promise<String>}
    */
    async do($, page, el) {
        return `# ${$(el).text()}\r\n\r\n`;
    }
}

/**
 * @extends Interpretation
 */
class H2 extends Interpretation {
    /**
    *
    * @param {cheerio.CheerioAPI} $
    * @param {cheerio.Element} el
    * @returns {Promise<String>}
    */
    do($, page, el) {
        return `## ${$(el).text()}\r\n\r\n`;
    }
}

/**
 * @extends Interpretation
 */
class Pre extends Interpretation {
    /**
    *
    * @param {cheerio.CheerioAPI} $
    * @param {cheerio.Element} el
    * @returns {Promise<String>}
    */
    do($, page, el) {

        const spans = $(el).children('span').toArray().map(span => '\t' + $(span).text());

        console.log(spans);

        return spans.length >= 1 ? spans.join('\r\n') + '\r\n\r\n' : undefined;
    }
}

/**
 * @extends Interpretation
 */
class P extends Interpretation {
    /**
    * 
    * @param {Interpreter} interpreter 
    */
    constructor(interpreter) {
        super(interpreter);
    }

    /**
    *
    * @param {cheerio.CheerioAPI} $
    * @param {cheerio.Element} el
    * @returns {Promise<String>}
    */
    async do($, page, el) {

        const aElements = $(el).children('a')
            .toArray();

        let pText = $(el).text();

        console.log('p -> a length', aElements.length);

        for (const aElement of aElements) {

            const aText = $(aElement).text();

            const aCompiled = await this.interpreter.do(aElement);

            if (!aCompiled) {
                continue;
            }

            pText = pText.replace(aText, aCompiled.replace('\r\n', ''));
        }

        return `${pText}\r\n\r\n`;
    }
}

/**
 * @extends Interpretation
 */
class Img extends Interpretation {
    /**
    *
    * @param {cheerio.CheerioAPI} $
    * @param {cheerio.Element} el
    * @returns {Promise<String>}
    */
    do($, page, el) {
        return `![Tux, the Linux mascot](${el.attribs["src"]})\r\n\r\n`;
    }
}

/**
 * @extends Interpretation
 */
class A extends Interpretation {
    /**
    * 
    * @param {Interpreter} interpreter 
    */
    constructor(interpreter) {
        super(interpreter);
    }
    /**
    *
    * @param {cheerio.CheerioAPI} $
    * @param {cheerio.Element} el
    * @returns {Promise<String>}
    */
    async do($, page, el) {

        console.log(`a -> ${el.attribs["href"]} -> ${path.extname(el.attribs["href"])}`);

        if (path.extname(el.attribs["href"]) === '') {
            return `[${$(el).text()}](${el.attribs["href"]})\r\n\r\n`;
        } else if (path.extname(el.attribs["href"]) !== '' && !path.extname(el.attribs["href"]).includes('com')) {
            return `![${$(el).text()}](${el.attribs["href"]})\r\n\r\n`;
        }

        return undefined;
    }
}

/**
 * @extends Interpretation
 */
class Div extends Interpretation {
    /**
       *
       * @param {cheerio.CheerioAPI} $
       * @param {puppeteer.Page} page
       * @param {cheerio.Element} el
       * @returns {Promise<String>}
       */
    async do($, page, el) {

        if (el.attribs["role"] === 'separator') {
            console.log('separator');
            return '---\r\n\r\n\r\n';
        }

    }
}

/**
 * @extends Interpretation
 */
class Iframe extends Interpretation {
    /**
    *
    * @param {cheerio.CheerioAPI} $
    * @param {puppeteer.Page} page
    * @param {cheerio.Element} el
    * @returns {Promise<String>}
    */
    async do($, page, el) {

        console.log('iframe interpratation');

        const element = await page.$('iframe[title="' + el.attribs["title"] + '"]');

        console.log('iframe interpratation->load');

        const frame = await element.contentFrame();

        try {
            const href = await frame.$eval('div.gist-meta > a', (el) => el.href);

            console.log(href);

            const resp = await axios.default.get(href);

            const data = resp.data;

            console.log('frame extension', path.extname(href));

            const result = '```' + this.extensions[path.extname(href)] + '\r\n' + data + '\r\n' + '```\r\n\r\n';

            return result;
        } catch (error) {
            console.log("div.gist-meta > a not found");

            return undefined;
        }
    }
}

module.exports = {
    H1,
    H2,
    Div,
    P,
    Img,
    A,
    Iframe,
    Pre
}