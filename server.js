const fs = require('fs');
const https = require('https');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const rateLimit = require('express-rate-limit');

const errorHandler = require('./middleware/errorHandler');
const router = require('./router'); 

const app = express();
app.use(express.static('public'));

// CORS Configuration
const corsOptions = {
  origin: 'https://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Pre-flight support

app.use(bodyParser.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Serve Swagger documentation
app.use('/DMSSystemAPI/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Use the router
app.use('/DMSSystemAPI', router);

// Error handling middleware
app.use(errorHandler);

// SSL certificates
const sslServerOptions = {
  key: fs.readFileSync(path.join(__dirname, 'cert', 'localhost.key')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'localhost.crt'))
};

https.createServer(sslServerOptions, app).listen(8080, () => {
  console.log('HTTPS Server is running on port 8080.');
});
