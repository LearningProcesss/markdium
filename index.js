const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { Tor } = require('./api/Tor');
const { Interpreter } = require('./api/Interpreter');
const { Writer } = require('./api/Writer');
const { startServer } = require('./server/server');
const util = require('util');


// async function scrollToBottom(page) {
//     const distance = 100; // should be less than or equal to window.innerHeight
//     const delay = 100;
//     while (await page.evaluate(() => document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight)) {
//         await page.evaluate((y) => { document.scrollingElement.scrollBy(0, y); }, distance);
//         await page.waitFor(delay);
//     }
// }

async function scrollToBottom() {
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

async function main() {

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

    await page.goto('https://javascript.plainenglish.io/showcase-your-medium-articles-with-react-20a2a4151091', { waitUntil: 'domcontentloaded', timeout: 60000 });

    console.log('page loaded');

    await page.evaluate(scrollToBottom);

    console.log('page scrolled');

    const content = await page.content();

    const $ = await cheerio.load(content);

    const html = $.html();

    const article = $('article').first();

    const section = article.find('section').first();

    const interpreter = new Interpreter($, page);

    const writer = new Writer("/workspaces/markdium/output/test.md");

    const arr = section.find('h1, h2, img, p, a, iframe, div, pre').toArray();

    for await (const it of elIterator(interpreter, arr)) {
        writer.append(it);
    }

    await browser.close();
}

/**
 * @param {Interpreter} interpreter
 * @param {cheerio.Element[]} elements 
 */
async function* elIterator(interpreter, elements) {
    for (const el of elements) {
        yield await interpreter.do(el);
    }
}

startServer();

// main();

// const tor = new Tor(new Interpreter(), new Writer("/workspaces/markdium/output/test.md"));

// tor.parsePage("https://javascript.plainenglish.io/showcase-your-medium-articles-with-react-20a2a4151091");
