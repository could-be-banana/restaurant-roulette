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
client.connect();
client.on('err', err => console.error(err));



// listen!
app.listen(PORT, () => console.log(`Loud and clear on ${PORT}`));

// Application Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ejs!
app.set('view engine', 'ejs');
//look into app.set view options
app.set('view options', { layout: false });

// API Routes
app.get('/', getLogIn);
app.get('/signup', showForm);
app.post('/login', allowIn);
app.post('/signup', addUser);
app.get('/pages/index.ejs', spinTheWheel);
app.get('/pages/about-us.ejs', aboutUs);
app.get('/pages/how-to.ejs', howTo);
app.post('/placeSearch', getPlaces);

app.post('/add-to-database', addShop);
app.post('/add-to-results', saveResults);

// app.post('/create-search', searchGeocode);
// app.post('/shop-favorites', showFavs);
// app.post('/shop-details/:shop_id', showShopDetails);
// app.post('/show-shop', showShop);


// ****Marry's code starts here*****

function addUser(request, response) {
  console.log('done!', request.body);


  let { username } = request.body;

  username = username.toLowerCase();


  console.log('this is the user name: ', username);

  let userExist = 'SELECT * FROM users WHERE username = $1;';

  let valuesOne = [username];

  client.query(userExist, valuesOne)
    .then(results => {
      if (results.rows.length > 0) {
        response.redirect('login');
        console.log('this username exist!!!');
      } else {
        let SQL = 'INSERT INTO users (username) VALUES ($1);';
        let values = [username]

        client.query(SQL, values)
          .then(result => {
            console.log(result);
            response.redirect('/')
          })
          .catch(error => handleError(error, response));
      }
    })
    .catch(error => handleError(error, response));
}


function getLogIn(request, response) {
  response.render('login');
}

function showForm(request, response) {
  response.render('signup');
}

function allowIn(request, response) {
  let username = request.body;
  let check = 'SELECT * FROM users WHERE username = $1;';
  let value = [username];

  client.query(check, value)
    .then(results => {
      console.log(results);
      if (results.rowCount !== 0 && results.rows[0].username === username) {
        response.redirect('/pages/index');
        console.log('success!!!');
      } else {
        response.redirect('signup');
        console.log('this route failed');
      }
    })
    .catch(error => handleError(error, response));
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
function aboutUs(request, response) {
  response.render('pages/about-us');
}

function howTo(request, response) {
  response.render('pages/how-to');
}
// ****************************************
// Our search, so far ❤️
function getPlaces(request, response) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.body.placenearby}&key=${process.env.GOOGLE_API_KEY}`;
  superagent.get(url)
    .then(result => {
      let tempArr=[];
      const location = new Location(request.body, result);
      const nearbyurl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude}, ${location.longitude}&radius=50&type=restaurant&keyword=restaurant&maxprice=${request.body.budget}&key=${process.env.GOOGLE_API_KEY}`
      superagent.get(nearbyurl)
        .then(result => {
          const nearbyPlaces = result.body.results.map(nearby => new Place(nearby));
          Place.prototype.toString = function placeString(){return '' + this.place_id;};
          let arr=[];
          nearbyPlaces.forEach(element => {
            let placeKey = element.toString();
            const detailurl = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeKey}&fields=formatted_address,name,permanently_closed,photo,place_id,type,url,vicinity,website,formatted_phone_number,price_level,rating,opening_hours&key=${process.env.GOOGLE_API_KEY}`;
            superagent.get(detailurl)
            .then(result => {
              const placeDetails= new Details(result.body.result);

              // the result is an object, you can't map. we need to use an object method here, whoops!
              // const placeDetails = result.body.result.map(placeid => new Details(placeid));
              // console.log('details!🦑',placeDetails);
              arr.push(placeDetails);
              console.log(arr,'arr🦑');
              tempArr.push(arr);
              console.log(tempArr[1],'🙈')
              response.render('pages/show-results.ejs', { searchResults: arr });
            })
          });
        })
        // .then(console.log(tempArr,'🙈'))
    })
    .catch(err => handleError(err, response));
}


//----Richard's code starts here--------------------

// Add search result details to a temp table in the database to be read for 1) selecting a result at random to display on the page and 2) to save the random result to the restaurant (history) table.


function saveResults(request, response) {

  let { name, place_id, price, rating, photo_ref, photo, website, formatted_address, quick_address, formatted_phone_number, hours } = request.body;

  let SQL = 'INSERT INTO temp (name, place_id, price, rating, photo_ref, photo, website, formatted_address, quick_address, formatted_phone_number, hours) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);';

  let values = [name, place_id, price, rating, photo_ref, photo, website, formatted_address, quick_address, formatted_phone_number, hours];

  return client.query(SQL, values)
    .then(result => response.redirect('/add-to-results'))
    .catch(err => handleError(err, response));
}

// Add a shop (restaurant) to restaurants table when it gets "randomly" selected from the temp table of search results.
// If both saveResults and addShop functions are used, refactor to use same SQL code, time permitting.

function addShop(request, response) {

  let { name, place_id, price, rating, photo_ref, photo, website, formatted_address, quick_address, formatted_phone_number, hours } = request.body;

  let SQL = 'INSERT INTO restaurants (name, place_id, price, rating, photo_ref, photo, website, formatted_address, quick_address, formatted_phone_number, hours) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);';

  let values = [name, place_id, price, rating, photo_ref, photo, website, formatted_address, quick_address, formatted_phone_number, hours];

  return client.query(SQL, values)
    .then(result => response.redirect('/add-to-database'))
    .catch(err => handleError(err, response));

}

// Select a random restaurant to 1) display on the page and 2) save to history/favorites

// function showShop(request, response) {
//     .then(shelves => {
//       let SQL = 'SELECT * FROM temp WHERE id=$1;';
//       let values = [request.params.id];
//       client.query(SQL, values)
//         .then(result => response.render('show-shop', { temp: place_id,  }))
//         .catch(err => handleError(err, response));
//     })
// }

// -------Richard's code ends here-------------------

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

// details
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
}


app.get('*', (request, response) => response.status(404).send('Nothing to see here...'));

// Error Handler
// function handleError(err, response) {
//   console.error(err);
//   if (response) response.status(500).send('Sorry something went wrong');
// }

function handleError(error, response) {
  console.log(error);
  response.render('error', { error: error });
}

// Shuffle an array javascript
// function shuffle ( array ) { array . sort ( ( ) => Math . random ( ) - 0.5 ) ; } let arr = [ 1 , 2 , 3 ] ; shuffle ( arr ) ; alert ( arr ) ; That somewhat works, because Math.random() - 0.5 is a random number that may be positive or negative, so the sorting function reorders elements randomly.
