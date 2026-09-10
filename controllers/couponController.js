

const Coupon = require('../models/Coupon');

// ১. সব কুপন দেখা (Admin সব দেখবে, Seller শুধু নিজের গুলো)
// @desc    সব কুপন গেট করা (Admin সব দেখবে, Seller শুধু নিজের)
exports.getCoupons = async (req, res) => {
  try {
    // লজিক: অ্যাডমিন হলে পুরো ডাটাবেস {}, সেলার হলে শুধু তার নিজের আইডি { seller: ID }
    let query = {};

    if (req.user.role === 'seller') {
      query = { seller: req.user._id };
    } else if (req.user.role === 'admin') {
      query = {}; // অ্যাডমিন সব দেখবে
    } else {
      // যদি অন্য কেউ হয় (যেমন সাধারণ ইউজার), তবে তাকে খালি লিস্ট দিবে
      return res.status(200).json([]);
    }

    const coupons = await Coupon.find(query)
      .populate('seller', 'name shopName') // সেলারের নাম দেখার জন্য পপুলেট
      .sort({ createdAt: -1 });

    res.status(200).json(coupons);
  } catch (error) {
    console.error('FETCH ERROR:', error.message);
    res.status(500).json({ message: 'আর্কাইভ সিঙ্ক ফেইলড' });
  }
};

// ২. নতুন কুপন তৈরি (Admin এবং Seller উভয়ই পারবে)
// @desc    নতুন কুপন ইনজেস্ট করা
// @route   POST /api/coupons
exports.createCoupon = async (req, res) => {
  try {
    console.log('--- START COUPON INGESTION ---');
    console.log('Received Data:', req.body);

    const { code, discount, expiryDate, usageLimit } = req.body;

    // ১. ডাটা ভ্যালিডেশন
    if (!code || !discount || !expiryDate) {
      return res.status(400).json({
        message: 'নামমাত্র ডাটা প্রদান করুন (Code, Discount, Expiry)',
      });
    }

    // ২. ইউজার অথেনটিকেশন চেক (req.user চেক)
    if (!req.user || !req.user._id) {
      console.log(
        'Error: User not found in request. Check protect middleware.'
      );
      return res
        .status(401)
        .json({ message: 'অথোরাইজেশন প্রোটোকল ফেইলড: আবার লগইন করুন' });
    }

    // ৩. ডুপ্লিকেট কোড চেক
    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ message: 'এই কোডটি আর্কাইভে অলরেডি আছে' });
    }

    // ৪. কুপন অবজেক্ট তৈরি
    const coupon = new Coupon({
      code: code.toUpperCase().trim(),
      discount: Number(discount),
      expiryDate: new Date(expiryDate), // নিশ্চিত করুন এটি ভ্যালিড ডেট
      usageLimit: usageLimit ? Number(usageLimit) : 100,
      seller: req.user._id, // এটি রিকোয়ার্ড, নিশ্চিত করুন মডেলের সাথে মিল আছে
    });

    // ৫. ডাটাবেসে সেভ করা
    const savedCoupon = await coupon.save();
    console.log('SUCCESS: Coupon Ingested!');
    res.status(201).json(savedCoupon);
  } catch (error) {
    // টার্মিনালে এররটি প্রিন্ট হবে
    console.error('CRITICAL COUPON ERROR:', error.message);

    // যদি স্লাগ বা কোড ডুপ্লিকেট হয় (Mongo Error 11000)
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'Duplicate Key: এই কোডটি ব্যবহার করা যাবে না' });
    }

    res
      .status(500)
      .json({ message: 'Internal Protocol Error: ' + error.message });
  }
};

// ৩. কুপন আপডেট
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res
        .status(404)
        .json({ message: 'MANIFEST NOT FOUND: কুপন পাওয়া যায়নি' });
    }

    // সিকিউরিটি চেক: সেলার কি নিজের কুপন এডিট করছে? (অ্যাডমিন সব পারবে)
    if (
      req.user.role !== 'admin' &&
      coupon.seller.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: 'ACCESS DENIED: এই কুপন পরিবর্তনের অনুমতি আপনার নেই',
      });
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ message: 'UPDATE FAILED: আপডেট ব্যর্থ হয়েছে' });
  }
};

// ৪. কুপন ডিলিট
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'কুপন পাওয়া যায়নি' });
    }

    // সিকিউরিটি চেক
    if (
      req.user.role !== 'admin' &&
      coupon.seller.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'ডিলিট করার অনুমতি নেই' });
    }

    await coupon.deleteOne();
    res.json({ message: 'ERASURE COMPLETE: সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (error) {
    res.status(500).json({ message: 'DELETE FAILED' });
  }
};

// ৫. কুপন ভেরিফাই (পাবলিক/ইউজার যখন চেকআউট করবে)
exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({ message: 'ভুল কুপন কোড' });
    }

    // মেয়াদ শেষ কি না চেক করা
    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'কুপনের মেয়াদ শেষ হয়ে গেছে' });
    }

    // ইউসেজ লিমিট চেক করা
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'এই কুপনের ব্যবহারের সীমা শেষ' });
    }

    res.json({
      success: true,
      code: coupon.code,
      discount: coupon.discount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
