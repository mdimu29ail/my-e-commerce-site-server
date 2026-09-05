const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @description লগইন করা ইউজার কি না তা যাচাই করার মিডলওয়্যার
 */
const protect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: 'অননুমোদিত এক্সেস, কোনো টোকেন পাওয়া যায়নি' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');

    if (!req.user) {
      return res
        .status(401)
        .json({ message: 'এই টোকেনের জন্য কোনো ইউজার খুঁজে পাওয়া যায়নি' });
    }

    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res
      .status(401)
      .json({ message: 'আপনার সেশন শেষ হয়ে গেছে, আবার লগইন করুন' });
  }
};

/**
 * @description শুধুমাত্র অ্যাডমিনদের জন্য অনুমতি চেক করা
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'শুধুমাত্র অ্যাডমিনরাই এই সুবিধা পাবেন' });
  }
};

/**
 * @description মডারেটর অথবা অ্যাডমিন কি না তা যাচাই করা
 */
const moderatorOrAdmin = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === 'admin' || req.user.role === 'moderator')
  ) {
    next();
  } else {
    res.status(403).json({ message: 'আপনার এই তথ্য দেখার অনুমতি নেই' });
  }
};

// ৩টি মিডলওয়্যারই এক্সপোর্ট করতে হবে
module.exports = { protect, adminOnly, moderatorOrAdmin };
