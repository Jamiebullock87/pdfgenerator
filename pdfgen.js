const express = require('express');
// const mustacheExpress = require('mustache-express');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const app = express();
var cors = require('cors');

// Use cors middleware, accept requests from any place
app.use(cors());

// Bodyparser to handle json string, and transform it back to an object
app.use(express.json());
app.unsubscribe(bodyParser.json());

app.set('view engine', 'html')

app.all('/export/pdf', cors(),(req, res) => {
    (async () => {
        // Builds the variable object, this needs extending for each bit of dynamic data we want to output
        const templateData = {
            title: req.body.title,
            date: req.body.date,
            name: req.body.name,
            logo: req.body.logo
        }
        // run it through handlebars - the template is at /views/template.html
        var templateHtml = fs.readFileSync(path.join(process.cwd(), '/views/template.html'), 'utf8');
        var template = handlebars.compile(templateHtml);
        var finalHtml = template(templateData);
        // formatting options for handlebars document
        var options = {
            format: 'A4',
            headerTemplate: "<p></p>",
            footerTemplate: "<p></p>",
            displayHeaderFooter: false,
            margin: {
                top: "40px",
                bottom: "100px"
            },
            printBackground: true, // shows background images if they're there
            path: 'invoice.pdf' // output filename
        }
        // run it through puppeteer to make the html into a pdf
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(`data:text/html,${finalHtml}`, {
            waitUntil: 'networkidle0'
        });
        const buffer = await page.pdf(options)
        await browser.close()
        res.send(buffer)
    })()
})

app.listen(3000,() => {console.log('listening on port 3000')});