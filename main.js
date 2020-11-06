// Libraries
const express = require('express');
const handlebars = require('express-handlebars');
const fetch = require('node-fetch');
const withQuery = require('with-query').default;
const morgan = require('morgan')

// Instances
const app = express();

// Express configuration
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/static'));

// Handlebars configuration
app.engine('hbs', handlebars({
    defaultLayout: 'default.hbs'
}));
app.set('view engine', 'hbs')
app.set('views', __dirname + '/views');

// Environment
const PORT = parseInt(process.argv[2] || process.env.PORT) || 3000;

const API_KEY = process.env.API_KEY || "";

const ENDPOINT = "https://api.nytimes.com/svc/books/v3/reviews.json";

// Connection pool config
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || '3306',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || 'goodreads',
    connectionLimit: 4,
    timezone: '+08:00'
})

// Queries


// Request handlers
// Homepage


// Start Server
if (API_KEY) {
    app.listen(PORT, () => {
        console.log(`Application started on port ${PORT} at ${new Date}`);
        console.log(`With key ${API_KEY}`);
    });
} else {
    console.error('API_KEY is not set');
}