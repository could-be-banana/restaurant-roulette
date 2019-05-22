'use strict';

//PROVIDE ACCESS TO ENVIROMENT VARIABLES IN .env
require('dotenv').config();

//Application Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const method = require('method-override');

//Application Setup
const app = express();
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();

//Application Middleware
app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'));

app.use(method(function (request) {
  if (request.body && typeof request.body === 'object' && '_method' in request.body) {
    let method = request.body._method;
    delete request.body._method;
    return method
  }
}));

//Setthe view engine for server-side templating
app.set('view engine', 'ejs');
