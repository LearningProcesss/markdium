const express = require('express');
const fs = require('fs');
const { marked } = require('marked');
const { Factory } = require('../api/Factory');

const app = express();

const tor = Factory.Create();

const port = 3000

app.get('/convert', async (req, res) => {

    const url = req.query.url;
    const getAs = req.query.getAs;

    console.log('url->', url);
    console.log('getAs->', getAs);

    const file = await tor.parsePage(url);
    const fileContent = fs.readFileSync(file, "utf-8");

    if (getAs === 'download') {
        return res.download(file);
    } else if (getAs === 'text') {
        res.set('content-type', 'text/plain');
        return res.send(fileContent);
    } else if (getAs === 'md') {
        return res.send(marked.parse(fileContent));
    }

    return res.send("<h1>getAs not valid!</h1>");
});

function startServer() {
    app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}

module.exports = {
    startServer
}