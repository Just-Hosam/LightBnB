const properties = require('./json/properties.json');
const users = require('./json/users.json');

const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  const promise = new Promise((resolve, reject) => {
    pool.query(`
    SELECT *
    FROM users
    WHERE email = $1;
    `, [email])
    .then(data => resolve(data.rows[0]))
    .catch(() => reject(null));
  });
  return promise;
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const promise = new Promise((resolve, reject) => {
    pool.query(`
    SELECT *
    FROM users
    WHERE id = $1;
    `, [id])
    .then(data => resolve(data.rows[0]))
    .catch(() => reject(null));
  });
  return promise;
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const promise = new Promise((resolve, reject) => {
    pool.query(`
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;
    `, [user.name, user.email, user.password])
    .then(data => resolve(data.rows[0]))
    .catch(() => reject(null));
  });
  return promise;
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  const promise = new Promise((resolve, reject) => {
    pool.query(`
    SELECT properties.*, reservations.*, avg(rating) as average_rating
    FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    JOIN property_reviews ON properties.id = property_reviews.property_id 
    WHERE reservations.guest_id = $1
    AND reservations.end_date < now()::date
    GROUP BY properties.id, reservations.id
    ORDER BY reservations.start_date
    LIMIT $2;
    `, [guest_id, limit])
    .then(data => resolve(data.rows))
    .catch(() => reject(null));
  });
  return promise;
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  const queryParams = [];
  let hasConditionAlready = false;
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
    hasConditionAlready = true;
  }
  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    (hasConditionAlready) ? queryString += `AND ` : queryString += `WHERE `;
    queryString += `owner_id = $${queryParams.length} `;
    hasConditionAlready = true;
  }
  if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night}`);
    (hasConditionAlready) ? queryString += `AND ` : queryString += `WHERE `;
    queryString += `cost_per_night >= $${queryParams.length} `;
    hasConditionAlready = true;
  }
  if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night}`);
    (hasConditionAlready) ? queryString += `AND ` : queryString += `WHERE `;
    queryString += `cost_per_night <= $${queryParams.length} `;
    hasConditionAlready = true;
  }
  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    (hasConditionAlready) ? queryString += `AND ` : queryString += `WHERE `;
    queryString += `rating >= $${queryParams.length} `;
    hasConditionAlready = true;
  }
  // 4
  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams)
  .then(res => res.rows);
}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
