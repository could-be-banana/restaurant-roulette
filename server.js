'use strict';

// envir variables
require('dotenv').config();

// app dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const ejs = require('ejs');
const method = require('method-override');


//Application Setup
const app = express();
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);

// listen!
app.listen(PORT, () => console.log(`Loud and clear on ${PORT}`));

// Application Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ejs!
app.set('view engine', 'ejs');

// API Routes
// Renders the search form
app.get('/', spinTheWheel);
app.post('/placeSearch', getGeocode);


app.get('*', (request, response) => response.status(404).send('Nothing to see here...'));


// HELPER FUNCTIONS


// landing page... going to change
function spinTheWheel(request, response) {
  response.render('index');
}


function getGeocode(request, response) {

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.body[0]}&key=${process.env.GOOGLE_API_KEY}`;
  console.log(url);

  superagent.get(url)
    .then(result => {
      console.log(result.body.results[0]);
      const location = new Location(request.body, result);
      // response.send(location);

      const nearbyurl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude}, ${location.longitude}&radius=1600&type=restaurant&keyword=restaurant&key=${process.env.GOOGLE_API_KEY}`;

      console.log(nearbyurl);
    })
    .catch(err => handleError(err, response));
}

// geocode constructor
function Location(query, res) {
  this.search_query = query;
  this.formatted_query = res.body.results[0].formatted_address;
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
}

// function getNearby(request, response) {
//   // Define the url for nearby search
//   const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${request.query.data.latitude}, ${request.query.data.longitude}&radius=1600&type=restaurant&keyword=restaurant&key=${process.env.GOOGLE_API_KEY}`;
//   // console.log(url);

//   superagent.get(url)
//     .then(result => {
//       // console.log(result.body);
//       const nearbyPlaces = result.body.results.map(nearby => new Place(nearby));
//       response.send(nearbyPlaces);
//     })
//     .catch(err => handleError(err, response));
// }

// function Place(nearby) {
//   this.name = nearby.name;
//   this.place_id = nearby.place_id;
//   this.price = nearby.price_level;
//   this.rating = nearby.rating;
//   this.photo_ref = nearby.photos.photo_reference;
// }

// function getNearby(request, response) {
//   // Define the url for nearby search
//   const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${result.body.results.nearby.place_id}&fields=address_component,adr_address,alt_id,formatted_address,geometry,icon,id,name,permanently_closed,photo,place_id,plus_code,scope,type,url,utc_offset,vicinity,website,formatted_phone_number,price_level,rating,review,user_ratings_total,opening_hours&key=${process.env.GOOGLE_API_KEY}`;
//   // console.log(url);

//   superagent.get(url)
//     .then(result => {
//       // console.log(result.body);
//       const placeDetails = result.body.results.map(details => new Deets(details));
//       response.send(placeDetails);
//     })
//     .catch(err => handleError(err, response));
// }

// function Place(nearby) {
//   this.name = nearby.name;
//   this.place_id = nearby.place_id;
//   this.price = nearby.price_level;
//   this.rating = nearby.rating;
//   this.photo_ref = nearby.photos.photo_reference;
// }


// Error Handler
function handleError(err, response) {
  console.error(err);
  if (response) response.status(500).send('Sorry something went wrong');
}
