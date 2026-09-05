const SSLCommerzPayment = require('sslcommerz-lts');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    পেমেন্ট শুরু করা (Initialize SSLCommerz)
// @route   POST /api/payment/initiate
// @access  Private
exports.initiatePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId).populate('user');

    if (!order) {
      return res.status(404).json({ message: 'অর্ডার পাওয়া যায়নি' });
    }

    const tran_id = order._id.toString(); // অর্ডারের আইডিকেই ট্রানজেকশন আইডি হিসেবে ব্যবহার করা হচ্ছে

    const data = {
      total_amount: order.totalPrice,
      currency: 'BDT',
      tran_id: tran_id, // ইউনিক ট্রানজেকশন আইডি
      success_url: `${process.env.BACKEND_URL}/api/payment/success/${tran_id}`,
      fail_url: `${process.env.BACKEND_URL}/api/payment/fail/${tran_id}`,
      cancel_url: `${process.env.BACKEND_URL}/api/payment/cancel/${tran_id}`,
      ipn_url: `${process.env.BACKEND_URL}/api/payment/ipn`,
      shipping_method: 'Courier',
      product_name: 'E-commerce Products',
      product_category: 'Electronic',
      product_profile: 'general',
      cus_name: order.user.name,
      cus_email: order.user.email,
      cus_add1: order.shippingAddress.addressDetail,
      cus_city: order.shippingAddress.district,
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: order.user.phone,
      ship_name: order.user.name,
      ship_add1: order.shippingAddress.addressDetail,
      ship_city: order.shippingAddress.district,
      ship_state: order.shippingAddress.district,
      ship_postcode: 1000,
      ship_country: 'Bangladesh',
    };

    const sslcz = new SSLCommerzPayment(
      process.env.SSL_STORE_ID,
      process.env.SSL_STORE_PASSWORD,
      process.env.NODE_ENV === 'development' ? false : true // false মানে স্যান্ডবক্স মোড
    );

    sslcz.init(data).then(apiResponse => {
      // পেমেন্ট গেটওয়ের ইউআরএল পাঠানো হচ্ছে
      let GatewayPageURL = apiResponse.GatewayPageURL;
      res.json({ url: GatewayPageURL });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    পেমেন্ট সফল হলে (Callback)
// @route   POST /api/payment/success/:tranId
// @access  Public
exports.paymentSuccess = async (req, res) => {
  try {
    const { tranId } = req.params;

    // অর্ডার আপডেট করা
    const order = await Order.findById(tranId);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentStatus = 'Paid';
      order.paymentResult = {
        id: req.body.val_id, // SSLCommerz Validation ID
        status: req.body.status,
        bank_tran_id: req.body.bank_tran_id,
      };
      await order.save();

      // ফ্রন্টএন্ডে রিডাইরেক্ট করা
      res.redirect(`${process.env.FRONTEND_URL}/checkout/success/${tranId}`);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    পেমেন্ট ফেইল হলে
// @route   POST /api/payment/fail/:tranId
exports.paymentFail = async (req, res) => {
  const { tranId } = req.params;
  await Order.findByIdAndUpdate(tranId, { paymentStatus: 'Failed' });
  res.redirect(`${process.env.FRONTEND_URL}/checkout/fail`);
};

// @desc    পেমেন্ট ক্যানসেল করলে
// @route   POST /api/payment/cancel/:tranId
exports.paymentCancel = async (req, res) => {
  const { tranId } = req.params;
  await Order.findByIdAndUpdate(tranId, { paymentStatus: 'Cancelled' });
  res.redirect(`${process.env.FRONTEND_URL}/cart`);
};

// @desc    Instant Payment Notification (IPN) - সিকিউরিটির জন্য ব্যাকগ্রাউন্ড চেক
// @route   POST /api/payment/ipn
exports.paymentIPN = async (req, res) => {
  // SSLCommerz থেকে আসা IPN রিকোয়েস্ট চেক করা এবং ডাটাবেস ভেরিফাই করা
  console.log('IPN Received:', req.body);
  res.status(200).send('IPN Received');
};
