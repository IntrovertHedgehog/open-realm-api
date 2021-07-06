const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const compression = require("compression");
const helmet = require("helmet");
const path = require("path");
const rateLimit = require('express-rate-limit');
const {body, check} = require('express-validator');
const checkJwt = require('./app/config/jwt.config');
// const axios = require('axios');

dotenv.config();

const app = express();

const isproduction = process.env.NODE_ENV === 'production';

const whitelist = ['https://www.hedgeing.xyz', 'https://theopenrealm.herokuapp.com'];

const corsOptions = isproduction ? {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
} : {
  origin: 'http://localhost:3000'
};

app.use(cors(corsOptions));

// app.use(function (req, res, next) {
//
//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', 'https://www.hedgeing.xyz');
//
//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//
//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//
//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);
//
//     // Pass to next layer of middleware
//     next();
// });

// comprpess http
app.use(compression());

// protect from well-known vulnerability
app.use(helmet());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // 50 requests,
});

app.use(limiter);

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// sync tables
const db = require("./app/models");
db.sequelize.sync();
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

app.use(checkJwt());

require("./app/routes/book.route.js")(app);
require("./app/routes/chapter.route.js")(app);
require("./app/routes/prompt.route.js")(app);
require("./app/routes/promptComment.route.js")(app);
require("./app/routes/writing.route.js")(app);
require("./app/routes/writingComment.route.js")(app);
require("./app/routes/promptBookmark.route.js")(app);
require("./app/routes/writingBookmark.route.js")(app);


// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
