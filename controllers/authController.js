const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * @description JWT টোকেন তৈরি এবং কুকি সেট করার ফাংশন
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

// @desc    ইউজার রেজিস্ট্রেশন
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // ১. চেক করুন ইমেইল আগে থেকেই আছে কি না
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'এই ইমেইল দিয়ে ইতোমধ্যে অ্যাকাউন্ট খোলা হয়েছে',
      });
    }

    // ২. নতুন ইউজার তৈরি
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
    });

    // ৩. টোকেন জেনারেট করা
    const token = user.getSignedJwtToken();

    // ৪. কুকিতে টোকেন সেট করে রেসপন্স পাঠানো
    res
      .status(201)
      .cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Days
      })
      .json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    // 💥 টার্মিনালে সঠিক এররটি প্রিন্ট করার জন্য:
    console.error('🔴 REGISTRATION ERROR: ', error.message);
    next(error);
  }
};
// @desc    ইউজার লগইন
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error('Please provide email and password');
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);

      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL,
        isApproved: user.isApproved,
      });
    } else {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    ইউজার লগআউট
exports.logoutUser = (req, res, next) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'সফলভাবে লগআউট হয়েছে' });
};

// @desc    ইউজার প্রোফাইল দেখা
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.status(200).json(user);
    } else {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    পাসওয়ার্ড রিসেট (প্লেসহোল্ডার)
exports.forgotPassword = async (req, res, next) => {
  res.status(501).json({ message: 'এই ফিচারটি শীঘ্রই আসবে' });
};
