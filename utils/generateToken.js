const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction, // Must be true for SameSite=None
    sameSite: isProduction ? 'none' : 'lax', // Use 'none' in production for cross-site support
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

module.exports = generateToken;
