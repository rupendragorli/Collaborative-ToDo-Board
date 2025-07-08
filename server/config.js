const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  mongoURI: process.env.ATLASDB_URL || 'mongodb://localhost:27017/todoboard',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_here',
}; 