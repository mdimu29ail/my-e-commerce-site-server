const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    নতুন প্রোডাক্ট তৈরি করা (সেলার এবং অ্যাডমিন)
// @route   POST /api/products
// @access  Private (Seller/Admin)
exports.createProduct = async (req, res) => {
  try {
    // ১. ইউজার অথেনটিকেশন চেক
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: 'আপনার লগইন সেশন শেষ হয়ে গেছে, আবার লগইন করুন' });
    }

    // ২. ক্যাটাগরি ভ্যালিডেশন
    if (!req.body.category) {
      return res
        .status(400)
        .json({ message: 'দয়া করে একটি ক্যাটাগরি সিলেক্ট করুন' });
    }

    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return res
        .status(400)
        .json({ message: 'ভ্যালিড ক্যাটাগরি সিলেক্ট করুন' });
    }

    // ৩. ডাটা প্রসেসিং (ফ্রন্টএন্ডের সব ডাইনামিক ফিল্ড সেভ হবে)
    const product = new Product({
      ...req.body, // colors, sizes, fabricGsm, processor ইত্যাদি সব এখানে চলে আসবে
      seller: req.user._id, // লগইন করা ইউজারের আইডি
      isFeatured:
        req.body.isFeatured === 'true' || req.body.isFeatured === true,
      isOrganic: req.body.isOrganic === 'true' || req.body.isOrganic === true,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('CREATE PRODUCT ERROR:', error.message);

    // Duplicate Name/Slug Error
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'এই নামের প্রোডাক্ট ডাটাবেসে অলরেডি আছে, নাম পরিবর্তন করুন',
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// @desc    সব প্রোডাক্ট পাওয়া (ফিল্টার, সার্চ এবং পেজিনেশন সহ)
exports.getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 12;
    const page = Number(req.query.pageNumber) || Number(req.query.page) || 1;

    const searchKeyword = req.query.keyword || req.query.search;
    const keyword = searchKeyword
      ? {
          $or: [
            { nameEn: { $regex: searchKeyword, $options: 'i' } },
            { nameBn: { $regex: searchKeyword, $options: 'i' } },
            { brand: { $regex: searchKeyword, $options: 'i' } },
          ],
        }
      : {};

    let filters = { ...keyword };

    // ১. ক্যাটাগরি ফিল্টার (ID বা Slug দিয়ে)
    if (req.query.category && req.query.category !== 'all') {
      // যদি ক্যাটাগরি আইডি না হয়ে স্ল্যাগ হয়
      if (req.query.category.match(/^[0-9a-fA-F]{24}$/)) {
        filters.category = req.query.category;
      } else {
        const cat = await Category.findOne({ slug: req.query.category });
        if (cat) {
          filters.category = cat._id;
        }
      }
    }

    if (req.query.seller) filters.seller = req.query.seller;

    // ২. প্রাইজ রেঞ্জ ফিল্টার
    if (req.query.minPrice || req.query.maxPrice) {
      filters.price = {};
      if (req.query.minPrice) filters.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filters.price.$lte = Number(req.query.maxPrice);
    }

    // ৩. কালার এবং সাইজ ফিল্টার
    if (req.query.color) {
      filters.colors = req.query.color; // Mongoose $in অটোমেটিক হ্যান্ডেল করে যদি অ্যারে হয়, স্ট্রিং হলেও কাজ করে
    }
    if (req.query.size) {
      filters.sizes = req.query.size;
    }

    // শুধু পাবলিশড প্রোডাক্ট দেখাবে (অ্যাডমিন প্যানেল বাদে)
    if (!req.query.showAll) {
      filters.status = 'published';
      // filters.stock = { $gt: 0 }; // স্টক ০ হলেও অনেক সময় প্রোডাক্ট দেখানো হয় (আউট অফ স্টক হিসেবে)
    }

    // ৪. সর্টিং
    let sortOrder = { createdAt: -1 };
    if (req.query.sort) {
      if (req.query.sort === 'price') sortOrder = { price: 1 };
      else if (req.query.sort === '-price') sortOrder = { price: -1 };
      else if (req.query.sort === '-rating') sortOrder = { rating: -1 };
      else if (req.query.sort === 'oldest') sortOrder = { createdAt: 1 };
      else {
        // যদি সরাসরি ফিল্ড নেম আসে (যেমন '-createdAt' বা 'createdAt')
        const field = req.query.sort.startsWith('-')
          ? req.query.sort.substring(1)
          : req.query.sort;
        const order = req.query.sort.startsWith('-') ? -1 : 1;
        sortOrder = { [field]: order };
      }
    }

    const count = await Product.countDocuments(filters);
    const products = await Product.find(filters)
      .populate('category', 'nameEn nameBn slug')
      .populate('seller', 'name email shopName')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort(sortOrder);

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize) || 1,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    সিঙ্গেল প্রোডাক্ট ডিটেইলস
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'nameEn nameBn slug')
      .populate('seller', 'name email role shopName');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'প্রোডাক্ট পাওয়া যায়নি' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    প্রোডাক্ট আপডেট করা
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: 'প্রোডাক্ট পাওয়া যায়নি' });

    const isPrivileged =
      req.user.role === 'admin' || req.user.role === 'moderator';
    const isOwner = product.seller.toString() === req.user._id.toString();

    if (!isPrivileged && !isOwner)
      return res.status(401).json({ message: 'অনুমতি নেই' });

    Object.assign(product, req.body);
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    প্রোডাক্ট ডিলিট করা
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: 'প্রোডাক্ট পাওয়া যায়নি' });

    const isPrivileged =
      req.user.role === 'admin' || req.user.role === 'moderator';
    const isOwner = product.seller.toString() === req.user._id.toString();

    if (!isPrivileged && !isOwner)
      return res.status(401).json({ message: 'অনুমতি নেই' });

    await product.deleteOne();
    res.json({ message: 'প্রোডাক্ট সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    AI Recommendation
exports.getRecommendedProducts = async (req, res) => {
  try {
    const { exclude, category, limit = 4 } = req.query;
    let query = {
      _id: { $ne: exclude },
      status: 'published',
      stock: { $gt: 0 },
    };
    if (category && category !== 'undefined') query.category = category;

    const products = await Product.find(query)
      .limit(Number(limit))
      .sort({ rating: -1, createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    সব প্রোডাক্টের সব রিভিউ একসাথে পাওয়া (অ্যাডমিন প্যানেলের জন্য)
// @route   GET /api/products/all-reviews
exports.getAllReviews = async (req, res) => {
  try {
    // সব প্রোডাক্ট খুঁজে বের করা এবং তাদের রিভিউ সেকশনের ইউজার পপুলেট করা (ছবিসহ)
    const products = await Product.find({})
      .populate('reviews.user', 'name email avatar image')
      .select('nameEn reviews');

    let allReviews = [];

    products.forEach(product => {
      if (product.reviews && product.reviews.length > 0) {
        product.reviews.forEach(rev => {
          allReviews.push({
            _id: rev._id,
            rating: rev.rating,
            comment: rev.comment,
            status: rev.status || 'Pending',
            createdAt: rev.createdAt,
            user: rev.user, // এখানে ইউজারের অবজেক্ট থাকবে যেখানে নাম ও প্রোফাইল পিকচার আছে
            product: {
              _id: product._id,
              nameEn: product.nameEn,
            },
          });
        });
      }
    });

    // নতুন রিভিউ আগে দেখানোর জন্য সর্ট করা
    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(allReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    রিভিউ স্ট্যাটাস আপডেট (Approve/Reject)
// @route   PUT /api/products/:productId/reviews/:reviewId/status
exports.updateReviewStatus = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const { status } = req.body; // Approved or Rejected

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'প্রোডাক্ট পাওয়া যায়নি' });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'রিভিউ পাওয়া যায়নি' });
    }

    review.status = status;
    await product.save();

    res.json({ message: `Review marked as ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
