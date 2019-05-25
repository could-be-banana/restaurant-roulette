-- Schema for restaurant_app

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS favorites;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255)
);
 

CREATE TABLE restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  image_url VARCHAR(255),
  place_id VARCHAR(255),
  formatted_address VARCHAR(255),
  formatted_phone_number VARCHAR(255),
  website VARCHAR(255),
  weekday_text VARCHAR(255),
  price_level VARCHAR(255),
  rating VARCHAR(255)
);
  

CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id),
  restaurants_id INTEGER NOT NULL,
  FOREIGN KEY (restaurants_id) REFERENCES restaurants (id)
);