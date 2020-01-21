const express = require('express');
const fs = require('fs');
const http = require('http');
const path = require('path');
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
// const cors = require('cors');
const app = express();

require('dotenv').config()

// Use cors middleware, accept requests from any place
// var corsOptions = {
//     origin: 'http://jamiebullock.io',
//     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }
// app.use(cors(corsOptions));
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Bodyparser to handle json string, and transform it back to an object
app.use(express.json());
app.unsubscribe(bodyParser.json());

app.set('view engine', 'html')

app.post('/export/pdf', (req, res) => {
    (async () => {
        // Builds the variable object, this needs extending for each bit of dynamic data we want to output
        const templateData = {
            invoiceNo: req.body.invoiceNo,
            // If we pass in the company details, we cou
            logo: req.body.logo,
            date: req.body.date,
            orderNo: req.body.orderNo,
            orderDate: req.body.orderDate,
            orderStatus: req.body.orderStatus,
            shipType: req.body.shipType,
            paymentMethod: req.body.paymentMethod,
            specialNote: req.body.specialNote,
            total: req.body.total,
            orderItems: req.body.orderItems, // expects arr of objects with ref desc qty unitPrice itemTotal
        }
        // run it through handlebars - the template is at /views/template.html
        // Could potentially make this take a variable and use different templates eg..
        // if(req.body.docType === 'invoice') { ... /views/invoice.html}
        // if(req.body.docType === 'deliveryNote') { ... /views/deliveryNote.html}
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

const server = http.createServer(app);
server.listen(process.env.PORT || 3000, err => {
    console.log(err || `Server listening on port ${process.env.PORT}`);
});