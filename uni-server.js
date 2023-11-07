const express = require('express');
const app = express();
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const bodyParser = require('body-parser');
const https = require('https');
var options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}

https.createServer(options, app).listen(443, () => {
    console.log(new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }), 'HTTPS Server running on port 443');
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname)));
app.set('etag', false)
app.use(bodyParser.json());
app.use(cors());
app.disable('x-powered-by');

app.get('/dashboard', (req, res) => {
    console.log('/dashboard');
    res.sendFile(__dirname + '/simulator/dashboard.html');
})

app.get('/simulator/dashboard', (req, res) => {
    res.sendFile(__dirname + '/simulator/dashboard.html');
})

app.get('/simulator/dashboard.css', (req, res) => {
    res.sendFile(__dirname + '/simulator/dashboard.css');
})

app.get('/simulator/dashboard.js', (req, res) => {
    console.log('/dashboard');
    res.sendFile(__dirname + '/simulator/dashboard.js');
})

app.listen(80, () => {
    console.log(new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }), 'HTTP Server running on port 80');
});
