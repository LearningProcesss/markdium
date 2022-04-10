const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { Writer } = require('./Writer');
const { Interpreter } = require('./Interpreter');

class Tor {

    /**
     * @type {Interpreter}
     */
    interpreter;

    /**
     * @type {Writer}
     */
    writer;

    /**
     * 
     * @param {Interpreter} interpreter 
     * @param {Writer} writer 
     */
    constructor(interpreter, writer) {
        this.interpreter = interpreter;
        this.writer = writer;
    }

    async scrollToBottom() {
        await new Promise(resolve => {
            const distance = 100; // should be less than or equal to window.innerHeight
            const delay = 100;
            const timer = setInterval(() => {
                document.scrollingElement.scrollBy(0, distance);
                if (document.scrollingElement.scrollTop + window.innerHeight >= document.scrollingElement.scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, delay);
        });
    }

     /**
    * @param {Interpreter} interpreter
    * @param {cheerio.CheerioAPI} $ 
    * @param {puppeteer.Page} page 
    * @param {cheerio.Element[]} elements 
    */
      async * elIterator(interpreter, $, page, elements) {
        for (const el of elements) {
            yield await interpreter.do($, page, el);
        }
    }

    /**
     * 
     * @param {String} url 
     */
    async parsePage(url) {

        if (!url) {
            return;
        }

        const browser = await puppeteer.launch({
            headless: true,

            // Add the following line.
            args: [
                "--disable-gpu",
                "--disable-dev-shm-usage",
                "--disable-setuid-sandbox",
                "--no-sandbox",
                '--disable-web-security',
                '--window-size=800,600',
                '--disable-features=IsolateOrigins,site-per-process',
                '--proxy-server=socks5://127.0.0.1:9050'
            ]
        });

        const page = await browser.newPage();

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        console.log('page loaded');

        await page.evaluate(this.scrollToBottom);

        console.log('page scrolled');

        const content = await page.content();

        const $ = await cheerio.load(content);

        const html = $.html();

        const article = $('article').first();

        const section = article.find('section').first();

        const arr = section.find('h1, h2, img, p, a, iframe, div, pre').toArray();

        const fileName = url.substring(url.lastIndexOf('/') + 1) + '.md';

        for await (const it of this.elIterator(this.interpreter, $, page, arr)) {
            this.writer.append(fileName, it);
        }

        await browser.close();

        return this.writer.getFullFilePath(fileName);
    }
}

module.exports = {
    Tor
}