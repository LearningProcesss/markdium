const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { H1, H2, P, Img, A, Iframe, Div, Pre } = require("./Interpretation");

class Interpreter {

    /**
     * @type {Object.<string, Interpretation>}
     */
    interpretation = {
        "h1": new H1(this),
        "h2": new H2(this),
        "p": new P(this),
        "img": new Img(this),
        "a": new A(this),
        "iframe": new Iframe(this),
        "div": new Div(this),
        "pre": new Pre(this)
    };

    /**
     * @type {cheerio.CheerioAPI}
     */
    $;

    /**
     * @type {puppeteer.Page}
     */
    page;

    // /**
    //  * 
    //  * @param {cheerio.CheerioAPI} $
    //  * @param {puppeteer.Page} page 
    //  */
    // constructor($, page) {
    //     this.$ = $;
    //     this.page = page;
    // }

    /**
     * 
     * @param {cheerio.CheerioAPI} $ 
     * @param {puppeteer.Page} page 
     * @param {cheerio.Element} el 
     * @returns {Promise<String>}
     */
    async do($, page, el) {

        if (!$ || !page || !el) {
            return;
        }

        const i = this.interpretation[el.tagName];

        if (!i) { return; }

        return await i.do($, page, el);
    }
}


module.exports = { Interpreter }
