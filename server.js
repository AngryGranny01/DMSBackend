const fs = require('fs');
const https = require('https');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const rateLimit = require('express-rate-limit');

// Middleware imports
const errorHandler = require('./middleware/errorHandler');
const router = require('./router'); // Import the router

const app = express();
app.use(express.static('public'));

// CORS Configuration
const corsOptions = {
  origin: 'https://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.use(bodyParser.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
