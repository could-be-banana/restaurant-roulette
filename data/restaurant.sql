-- Schema for restaurant_app

DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS restaurants;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(10) UNIQUE NOT NULL
);
 

CREATE TABLE restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  image_url VARCHAR(255),
  place_id VARCHAR(255),
  formatted_address VARCHAR(255),
  formatted_phone_number VARCHAR(255),
  website VARCHAR(255),
  weekday_text VARCHAR(400),
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


INSERT INTO users (username) VALUES ('meron');

-- SELECT * from users;

INSERT INTO users (username) VALUES ('userOne');
INSERT INTO users (username) VALUES ('userTwo');
INSERT INTO restaurants (name, image_url, place_id, formatted_address, formatted_phone_number, website, weekday_text, price_level, rating) VALUES ('Yummy Food', '', 'test place_id', '123 Main Street, Anytown, USA', '(555) 555-1212', 'https://google.com', 'hours here', '1', '4');
INSERT INTO restaurants (name, image_url, place_id, formatted_address, formatted_phone_number, website, weekday_text, price_level, rating) VALUES ('Shake Shack', '', 'ChIJGzI5Xu8VkFQR5GlNg-K43Sg', '2115 Westlake Ave, Seattle, WA 98121, USA', '(206) 279-2313', 'https://www.shakeshack.com/', '[
                "Monday: 11:00 AM – 10:00 PM",
                "Tuesday: 11:00 AM – 10:00 PM",
                "Wednesday: 11:00 AM – 10:00 PM",
                "Thursday: 11:00 AM – 10:00 PM",
                "Friday: 11:00 AM – 11:00 PM",
                "Saturday: 11:00 AM – 11:00 PM",
                "Sunday: 11:00 AM – 10:00 PM"
            ]', '2', '4');
INSERT INTO favorites (user_id, restaurants_id) VALUES ('1', '1');
INSERT INTO favorites (user_id, restaurants_id) VALUES ('2', '1');



