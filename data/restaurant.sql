-- Schema for restaurant_app

DROP TABLE IF EXISTS locations;

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude NUMERIC(10,7),
  image_url VARCHAR(255),
  longitude NUMERIC(10,7)
);


INSERT INTO locations ( name, longitude, latitude, image_url )
VALUES('MeronRes', '151.200775', '-33.866135', 'https://i.imgur.com/J5LVHEL.jpeg' )
