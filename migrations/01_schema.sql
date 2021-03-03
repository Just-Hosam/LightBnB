DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS property_reviews;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255)
);

CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255),
  description TEXT,
  thumbnail_photo_url VARCHAR(255),
  cover_photo_url VARCHAR(255),
  cost_per_night INTEGER,
  parking_spaces INTEGER,
  number_of_bathrooms INTEGER,
  number_of_bedrooms INTEGER,
  country VARCHAR(255),
  street VARCHAR(255),
  city VARCHAR(255),
  province VARCHAR(255),
  post_code VARCHAR(255),
  active BOOLEAN
);

CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  guest_id INTEGER REFERENCES users(id),
  property_id INTEGER REFERENCES properties(id),
  start_date DATE,
  end_date DATE
);

CREATE TABLE property_reviews (
  id SERIAL PRIMARY KEY,
  guest_id INTEGER REFERENCES users(id),
  property_id INTEGER REFERENCES properties(id),
  reservation_id INTEGER REFERENCES reservations(id),
  rating SMALLINT,
  message TEXT
);