const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [
      {
        nameEn: { type: String, required: true },
        nameBn: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
      },
    ],
    shippingAddress: {
      phone: { type: String, required: true },
      division: { type: String, required: true },
      district: { type: String, required: true },
      upazila: { type: String, required: true },
      addressDetail: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['bKash', 'Nagad', 'Card', 'Cash on Delivery'],
    },
    paymentStatus: {
      type: String,
      required: true,
      default: 'Pending',
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },

    // ৬. স্ট্যাটাস প্রোটোকল (ফ্রন্টএন্ডের সাথে মিল রাখা হয়েছে)
    status: {
      type: String,
      required: true,
      default: 'Order Placed',
      enum: [
        'Order Placed',
        'Processing & Verification',
        'En Route to Destination',
        'Out for Delivery',
        'Successfully Delivered',
        'Cancelled',
        'Returned',
      ],
    },
    placedAt: { type: Date },
    verifiedAt: { type: Date },
    shippedAt: { type: Date },
    outForDeliveryAt: { type: Date },
    deliveredAt: { type: Date },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
