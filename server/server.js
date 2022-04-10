const express = require('express');
const fs = require('fs');
const { marked } = require('marked');
const { Factory } = require('../api/Factory');

const app = express();

const tor = Factory.Create();

const port = 3000

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/convert', async (req, res) => {
    
    const url = req.query.url;
    const download = ((req.query.download + '').toLowerCase() === 'true')

    console.log('url->', url);

    const file = await tor.parsePage(url);

    if (download) {
        return res.download(file);
    }

    const fileContent = fs.readFileSync(file, "utf-8");

    res.send(marked.parse(fileContent));
});

function startServer() {
    app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}

module.exports = {
    startServer
}