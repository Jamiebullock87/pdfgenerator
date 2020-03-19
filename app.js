const express = require('express');
const fs = require('fs');
const http = require('http');
const path = require('path');
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

require('dotenv').config()

// Bodyparser to handle json string, and transform it back to an object to send to handlebars
app.use(express.json());
app.unsubscribe(bodyParser.json());

app.set('view engine', 'html')

app.options('*', cors());
app.use(cors())

app.post('/export/pdf', (req, res) => {
    (async () => {
        // Builds the variable object, this needs extending for each bit of dynamic data we want to output
        const templateData = {
            invoiceNo: req.body.invoiceNo,
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
        };
        // run it through handlebars - the template is at /views/template.html
        // Could potentially make this take a variable and use different templates eg..
        // if(req.body.docType === 'invoice') { ... /views/invoice.html}
        // if(req.body.docType === 'deliveryNote') { ... /views/deliveryNote.html}
        const templateHtml = fs.readFileSync(path.join(process.cwd(), '/views/template.html'), 'utf8');
        const template = handlebars.compile(templateHtml);
        const finalHtml = template(templateData);
        // formatting options for handlebars document

        // We can build the header/footer out here over multiple lines if its complicated
        const header = `
        <div>
            <h1>Company Name</h1>
            <h4>Company Tag Line</h4>
        </div>
        `;
        const options = {
            format: 'A4',
            headerTemplate: header, // can create a reusable header?
            footerTemplate: "<p></p>", // Also a reusable footer
            displayHeaderFooter: false, // not for now though
            margin: {
                top: "40px",
                bottom: "100px"
            },
            printBackground: true, // shows background images if they're there
            path: 'invoice.pdf' // output filename
        }
        // run it through puppeteer to make the html into a pdf
        const browser = await puppeteer.launch({args: ["--no-sandbox", "--disable-setuid-sandbox"]});
        const page = await browser.newPage();
        await page.goto(`data:text/html,${finalHtml}`, {
            waitUntil: 'networkidle0'
        });
        const buffer = await page.pdf(options);
        await browser.close();
        res.send(buffer);
    })()
})

const server = http.createServer(app);
server.listen(process.env.PORT, () => {
    console.log(`EXPRESS`, `HTTP server started on port ${process.env.PORT}.`);
});
