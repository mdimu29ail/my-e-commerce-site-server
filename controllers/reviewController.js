const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

exports.createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'orderItems.product': productId,
      isDelivered: true,
    });

    if (!hasPurchased) {
      return res.status(400).json({
        message: 'আপনি পণ্যটি ডেলিভারি পাওয়ার পরেই রিভিউ দিতে পারবেন',
      });
    }

    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'আপনি এই পণ্যে একবার রিভিউ দিয়েছেন' });
    }

    await Review.create({
      product: productId,
      user: req.user._id,
      rating: Number(rating),
      comment,
      isVerifiedPurchase: true,
      status: 'Pending',
    });

    res.status(201).json({ message: 'আপনার রিভিউটি মডারেশনের জন্য পেন্ডিং আছে' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminAddReview = async (req, res) => {
  try {
    const { rating, comment, userId } = req.body;
    const productId = req.params.id;

    await Review.create({
      product: productId,
      user: userId,
      rating: Number(rating),
      comment,
      isVerifiedPurchase: true,
      status: 'Approved',
    });

    await updateProductRating(productId);

    res.status(201).json({ message: 'অ্যাডমিন রিভিউ যোগ করা হয়েছে' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { status },
      { new: true }
    );

    if (!review) return res.status(404).json({ message: 'রিভিউ পাওয়া যায়নি' });

    await updateProductRating(review.product);

    res.json({ message: `রিভিউ স্ট্যাটাস ${status} করা হয়েছে`, review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProductRating = async (productId) => {
  const approvedReviews = await Review.find({ product: productId, status: 'Approved' });
  const numReviews = approvedReviews.length;
  const rating = numReviews > 0 
    ? approvedReviews.reduce((acc, item) => item.rating + acc, 0) / numReviews 
    : 0;

  await Product.findByIdAndUpdate(productId, { rating, numReviews });
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'রিভিউ পাওয়া যায়নি' });
    
    await updateProductRating(review.product);
    res.json({ message: 'রিভিউ ডিলিট করা হয়েছে' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'nameEn nameBn')
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'Approved' })
      .populate('user', 'name')
      .populate('product', 'nameEn nameBn')
      .sort({ createdAt: -1 })
      .limit(6);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(3);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
