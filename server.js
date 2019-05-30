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


// client.connect();
// client.on('err', err => console.error(err));

// listen!
app.listen(PORT, () => console.log(`Loud and clear on ${PORT}`));

// Application Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ejs!
app.set('view engine', 'ejs');

// API Routes
app.get('/', show);
app.get('/', login);
app.post('/', allowIn);
app.post('/signup', addUser);
app.get('/pages/index.ejs', spinTheWheel);
app.get('/pages/about-us.ejs', aboutUs);
app.get('/pages/how-to.ejs', howTo);
app.post('/placeSearch', getPlaces);
app.get('*', (request, response) => response.status(404).send('Nothing to see here...'));


//Endpoints

// app.post('/create-search', searchGeocode);
// app.post('/shop-favorites', showFavs);
// app.post('/shop-details/:shop_id', showShopDetails);
// app.post('/add-to-databse', addShop);


// ****Marry's code starts here*****

function addUser(request, response) {
  console.log('done!', request.body);


  let {username} = request.body;
  username  = username.toLowerCase();
  console.log('this is the user name:', username);

  let userExist = 'SELECT * FROM users WHERE username = $1;';

  let valuesOne = [username];

  client.query(userExist, valuesOne)
    .then(results => {
      if(results.rows.length > 0) {
        response.render('/');
        console.log('this username exist!!!');
      } else{
        let SQL= 'INSERT INTO users (username) values ($1);';
        let values = [username]

        client.query(SQL, values)
          .then(result => {
            console.log(result);
            response.render('/signup')
          })
          .catch(error => handleError(error, response));
      }
    })
    .catch(error => handleError(error, response));
}


function show(request, response){
  response.render('login');
}

function login(request, response){
  response.render('pages/index');
}

function allowIn(request, response) {
  let username = request.body;
  let check = 'SELECT * FROM users WHERE username = $1;';
  let value = [username];

  client.query(check, value)
    .then(results => {
      console.log(results);
      if(results.rowCount !== 0 && results.rows[0].username === username) {
        response.redirect('index');
        console.log('success!!!');
      } else {
        response.render('login');
        console.log('this route failed');
      }
    })
    .catch(error => handleError(error, response));
}

function handleError(error, response) {
  console.log(error);
  response.render('error', { error: error });
}


// function signUp(request, response) {
//   response.render('signUp.ejs', {users: request.flash('signUpUsers')})
// };

// ****Marry's code ends here***


// HELPER FUNCTIONS
// Landing page... going to change--
// this calls us to the search initializing page
function spinTheWheel(request, response) {
  response.render('pages/index');
}

//Rendering About Us page
function aboutUs (request, response) {
  response.render('pages/about-us');
}

function howTo (request, response) {
  response.render('pages/how-to');
}

// Our search, so far ❤️
function getPlaces(request, response) {
  // console.log('hey requst',request.body.placenearby);
  // console.log('💰',request.body.budget);

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.body.placenearby}&key=${process.env.GOOGLE_API_KEY}`;
  
  // console.log(url);


  superagent.get(url)
    .then(result => {
      // console.log(result.body.results[0]);
      const location = new Location(request.body, result);
      // response.send(location);

      console.log('location is', location);


      const nearbyurl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude}, ${location.longitude}&radius=300&type=restaurant&keyword=restaurant&maxprice=${request.body.budget}&key=${process.env.GOOGLE_API_KEY}`
      // console.log(nearbyurl);
      // DON'T FORGET TO CHANGE DISTANCE PARAM BEFORE LAUNCH! SHORTENED TO MAKE FOR EASIER READING WHILE TESTING
      
      superagent.get(nearbyurl)
        .then(result => {
          // console.log('💰',request.body.budget);
        
          const nearbyPlaces = result.body.results.map(nearby => new Place(nearby));

          Place.prototype.toString = function placeString() {
            return '' + this.place_id;
          }
          // console.log('🥡nearbyPlaces is an array of plac_id objs',nearbyPlaces);

          nearbyPlaces.forEach(element => {
            // console.log('element.place_id', element.toString());

            let placeKey = element.toString();
            // console.log(placeKey);

            const detailurl = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeKey}&fields=formatted_address,name,permanently_closed,photo,place_id,type,url,vicinity,website,formatted_phone_number,price_level,rating,opening_hours&key=${process.env.GOOGLE_API_KEY}`;

            superagent.get(detailurl)
            .then(result => {
              // console.log('the result you are mapping is ',result.body.result);
              console.log('objvalues',Object.values(result.body.result));

              return Object.values(result.body.result);
              // the result is an object, you can't map. we need to use an object method here, whoops!
              // const placeDetails = result.body.result.map(placeid => new Details(placeid));
              // console.log('details!🦑',placeDetails);
            })
          });

        })
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
// placemaker
function Place(nearby) {
  this.place_id = nearby.place_id;

}

// placemaker
function Details(placeid) {
  this.name = placeid.name;
  this.place_id = placeid.place_id;
  this.price = placeid.price_level;
  this.rating = placeid.rating;
  this.photo_ref = placeid.photos[0].photo_reference;
  this.photo = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${placeid.photos[0].photo_reference}&key=${process.env.GOOGLE_API_KEY}`;
  this.website = placeid.website;
  this.formatted_address = placeid.formatted_address;
  this.quick_address = placeid.vicinity;
  this.formatted_phone_number = placeid.formatted_phone_number;
  this.hours = placeid.opening_hours.weekday_text;

  // formatted_address,
  // name,
  // permanently_closed,
  // photo,
  // place_id,
  // type,
  // url,
  // vicinity,
  // website,
  // formatted_phone_number,
  // price_level,
  // rating,
  // opening_hours
}



// Error Handler
function handleError(err, response) {
  console.error(err);
  if (response) response.status(500).send('Sorry something went wrong');
}
