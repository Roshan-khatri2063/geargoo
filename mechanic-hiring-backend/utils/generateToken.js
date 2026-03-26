const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', {
    expiresIn: '7d',
  });
};

module.exports = generateToken;