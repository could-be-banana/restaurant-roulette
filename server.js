'use strict';

//PROVIDE ACCESS TO ENVIROMENT VARIABLES IN .env
require('dotenv').config();

//Application Dependencies
const express = require('express');
const bodyParser = require('body-parser')
const superagent = require('superagent');
const pg = require('pg');
const method = require('method-override');

//Application Setup
const app = express();
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.error(err));

//Server is listening
app.listen(PORT, () => console.log(`Its alive ${PORT}`));

//Application Middleware
app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'));

app.use(method(function (request) {
  if (request.body && typeof request.body === 'object' && '_method' in request.body) {
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}));

// ERROR HANDLER
function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

//Set the view engine for server-side templating
app.set('view engine', 'ejs');

//Endpoints
app.get('/', login)
app.get('/signup', signUp)
app.post( '/users',  createUser)
app.post('/create-search', searchGeocode);
// app.post('/shop-favorites', showFavs);
// app.post('/shop-details/:shop_id', showShopDetails);
// app.post('/add-to-databse', addShop);

app.delete('/delete-favorite/:shop_id', deleteFav);

function login(req, res){
  let SQL = 'SELECT * FROM users';
  
  if (!res.username) {
    return client.query(SQL)
  
  .then(data => {
    res.render('login', {users: data.rows});
  })
  .catch(err => {
    console.log(err);
    res.render('/error', {err});
  });
}
}

function  createUser (req, res){
  const {username} = req.body
  let SQL = (`INSERT INTO users (username) VALUES ($1);`);
  let values = (SQL, [req.body.username]);
  return client.query(SQL, values)
    .then(result => {
      let SQL = 'SELECT id FROM users Where username=$1;rs';
      let values = [req.body.username];

      return client.query(SQL,values)
        .then(result =>{
          res.redirect(`/login/${result.rows[0].id}`);
        })

        .catch(err => handleError(err, res));
    })
    .catch(err => handleError(err,res));
  }

function signUp(request, response) {
  response.render('signUp.ejs', {users: request.flash('signUpUsers')})
};

// HELPER FUNCTIONS

//Gets info from DB
function getDataFromDB(sqlInfo) {
  // Create a SQL Statement
  let condition = '';
  let values = [];

  if (sqlInfo.searchQuery) {
    condition = 'search_query';
    values = [sqlInfo.searchQuery];
  } else {
    condition = 'location_id';
    values = [sqlInfo.id];
  }

  let sql = `SELECT * FROM ${sqlInfo.endpoint}s WHERE ${condition}=$1;`;

  // Get the Data and Return
  try { return client.query(sql, values); }
  catch (error) { handleError(error); }
}

//Saves to DB
function saveDataToDB(sqlInfo) {
  // Create the parameter placeholders
  let params = [];

  for (let i = 1; i <= sqlInfo.values.length; i++) {
    params.push(`$${i}`);
  }

  let sqlParams = params.join();

  let sql = '';
  if (sqlInfo.searchQuery) {
    // location
    sql = `INSERT INTO ${sqlInfo.endpoint}s (${sqlInfo.columns}) VALUES (${sqlParams}) RETURNING ID;`;
  } else {
    // all other endpoints
    sql = `INSERT INTO ${sqlInfo.endpoint}s (${sqlInfo.columns}) VALUES (${sqlParams});`;
  }

  // save the data
  try { return client.query(sql, sqlInfo.values); }
  catch (err) { handleError(err); }
}

//Searches geocode API 
function searchGeocode (request, response) {
  let sqlInfo = {
    searchQuery: request.query.data,
    endpoint: 'location'
  };

  
  getDataFromDB(sqlInfo)
  .then(result => {
    if (result.rowCount > 0) {
      response.send(result.rows[0]);
    } else {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`;
      
      console.log(url);
        superagent.get(url)
          .then(result => {
            if (!result.body.results.length) { throw 'NO LOCATION DATA'; }
            else {
              let location = new Location(sqlInfo.searchQuery, result.body.results[0]);

              sqlInfo.columns = Object.keys(location).join();
              sqlInfo.values = Object.values(location);

              saveDataToDB(sqlInfo)
                .then(data => {
                  location.id = data.rows[0].id;
                  response.send(location);
                });
            }
          })
          .catch(error => handleError(error, response));
      }
    });
}

//Deletes restaurant from DB
function deleteFav (request, response) {
  const SQL = 'DELETE FROM favorites WHERE id=$1;';
  const value = [request.params.place_id];
  client.query (SQL, value)
    .then(response.redirect('/shop-favorites'))
    .catch(err => handleError(err, response));
}

//Constructor Functions
function Location (query, location) {
  this.search_query = query;
  this.formatted_query = location.formatted_address;
  this.latitude = location.geometry.location.lat;
  this.longitude = location.geometry.location.lng;
}


// Catch-all
app.get('*', (request, response) => response.status(404).send('This route does not exist'));
