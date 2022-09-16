require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const app = express();
const helmet = require('helmet');
const path = require('path');
const {Role} = require("./models");
const morgan = require('morgan');                  //Morgan is used for logging request details
const cron = require('node-cron');
const authCtrl = require("./controller/auth.controller");
const mongoService = require("./connection/mongo.service");

mongoService.connect();

app.use(cors({ credentials: true, origin: true }));

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(morgan('dev'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/'));
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/public/banner'))
app.use(express.static(__dirname + '/public/user'))

app.use(helmet());
//Routes
app.use('/', require('./routes'));

cron.schedule('0 23 * * *', () => {
  console.log("Task is running every 2 minute " + new Date());
  authCtrl.removeExpiredToken();
});



// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// app.use(initial());
initial();
function initial() {

    Role.estimatedDocumentCount((err, count) => {
      if (!err && count === 0) {
        new Role({
          role_name: "user"
        }).save(err => {
          if (err) {
            console.log("error", err);
          }
          console.log("added 'user' to roles collection");
        });
        new Role({
            role_name: "moderator"
        }).save(err => {
          if (err) {
            console.log("error", err);
          }
          console.log("added 'moderator' to roles collection");
        });
        new Role({
            role_name: "admin"
        }).save(err => {
          if (err) {
            console.log("error", err);
          }
          console.log("added 'admin' to roles collection");
        });
      }
    });
  }

module.exports = app;