const express = require('express');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
// const cors = require('cors');
const app = express();

require('dotenv').config()

// Use cors middleware, accept requests from any place
// app.use(cors());

// Bodyparser to handle json string, and transform it back to an object
app.use(express.json());
app.unsubscribe(bodyParser.json());

app.set('view engine', 'html')

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    // res.header('Access-Control-Allow-Credentials', true);
    // res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});

app.all('/export/pdf', (req, res) => {
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
        res.set('Access-Control-Allow-Origin', '*');
        res.send(buffer)
    })()
})

app.listen(process.env.PORT || 3000,() => {console.log('listening on port 3000')});