const fs = require('fs');
const https = require('https');
const express = require('express');
const cors = require('cors');
const parser = require('body-parser');
const path = require('path');

const app = express();
app.use(express.static('public'));

// CORS Configuration
const corsOptions = {
  origin: 'https://localhost:4200', // Allow requests from this origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(parser.json());

const routesDMS = require("./router");
app.use('/DMSSystem', routesDMS);

// SSL certificates
const sslServerOptions = {
  key: fs.readFileSync(path.join(__dirname, 'cert', 'localhost.key')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'localhost.crt'))
};

https.createServer(sslServerOptions, app).listen(8080, () => {
  console.log("Connected")
  console.log('HTTPS Server is running on port 8080.');
});