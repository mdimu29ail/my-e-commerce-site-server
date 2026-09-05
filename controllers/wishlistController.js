const Wishlist = require('../models/Wishlist');
const asyncHandler = require('express-async-handler');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
  res.status(200).json(wishlist ? wishlist.products : []);
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
  } else {
    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }
  }
  
  const updatedWishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
  res.status(200).json(updatedWishlist.products);
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  
  if (wishlist) {
    wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
    await wishlist.save();
  }
  
  const updatedWishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
  res.status(200).json(updatedWishlist ? updatedWishlist.products : []);
});
