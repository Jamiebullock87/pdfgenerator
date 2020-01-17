const express = require('express');
const mustacheExpress = require('mustache-express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const app = express();
var cors = require('cors');

// Use cors middleware, accept requests from any place
app.use(cors());
app.use(express.json());
app.unsubscribe(bodyParser.json());

/*
APP FLOW -
get body from POST request from front end at /export/pdf
render HTML page with handlebars, using data from the body, sent as js object
*/

app.engine('html', mustacheExpress())
app.set('view engine', 'html')

app.all('/export/html', (req, res) => {
    console.log(req);
    const templateData = {
        title: req.query.title,
        date: req.query.date,
        name: req.query.name,
        logo: req.query.logo
    }
    res.render('template.html', templateData)
})

app.all('/export/pdf', cors(),(req, res) => {
    // console.log(req.body.title);
    (async () => {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto('http://localhost:3000/export/html')
        const buffer = await page.pdf({
            format: 'A4',
        })
        res.type('application/pdf')
        res.set('Content-Disposition: attachment; filename="invoice.pdf"');
        // console.log('request', req.body);
        res.send(buffer)
        browser.close()
    })()
})

app.listen(3000,() => {console.log('listening on port 3000')});