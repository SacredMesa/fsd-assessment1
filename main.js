// Libraries
const express = require('express');
const handlebars = require('express-handlebars');
const mysql = require('mysql2/promise');
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

// SQL Queries
const SQL_GET_TITLE = 'select title from goodreads.book2018 where title like ?'

// SQL Query creator function
const mkQuery = (sqlQuery, pool) => {
    const execute = async (params) => {
        // Get connection from pool
        const conn = await pool.getConnection();

        console.log('HELP ME ', await pool.query(sqlQuery, params));

        try {
            const results = await pool.query(sqlQuery, params)
            console.log('THIS IS RESULTS: ', results);
            return results[0];
        } catch (e) {
            return Promise.reject(e);
        } finally {
            conn.release();
        }
    }
    return execute;
}

// SQL Query functions
const getBookByTitle = mkQuery(SQL_GET_TITLE, pool);

// Request handlers
// Homepage
app.get('/', async (req, res) => {
    res.status(200);
    res.type('text/html');
    res.render('index');
});

// Book Titles Page
app.get('/titles/:titleStart', async (req, res) => {

    const titleStart = req.params.titleStart;

    console.log('this is from button: ', req.params.titleStart);

    try {

      const results = await getBookByTitle([titleStart]);
      const recs = results[0];

      console.log('recs: ', recs);

      if (recs.length <= 0) {
          res.status(404);
          res.type('text/html');
          res.send(`${titleStart} not found`);
          return
      }

        res.status(200);
        res.type('text/html');
        res.render('titles', {
          titleResults: recs
        });
    } catch (e) {
        console.info(e)
        res.status(500);
        res.type('text/html');
        res.send(JSON.stringify(e));
    }


});


// Start Connection Pool and Server
const startApp = async (app, pool) => {
    try {
        const conn = await pool.getConnection();
        console.log('Pinging Database');
        await conn.ping();

        conn.release();

        if (API_KEY) {
            app.listen(PORT, () => {
                console.log(`Application started on port ${PORT} at ${new Date}`);
                console.log(`With key ${API_KEY}`);
            });
        } else {
            console.error('API_KEY is not set');
        }
    } catch (e) {
        console.error(`ERROR: `, e);
    }
}

startApp(app, pool);