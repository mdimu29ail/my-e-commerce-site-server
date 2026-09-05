// const express = require('express');
// const router = express.Router();

// // কন্ট্রোলার ইমপোর্ট (আমরা আগে এটি তৈরি করেছি)
// const {
//   sendMessage,
//   getMessages,
//   getConversations,
//   markAsRead,
//   findOrCreateConversation,
// } = require('../controllers/messageController');

// // মিডলওয়্যার ইমপোর্ট (সিকিউরিটির জন্য লগইন থাকা বাধ্যতামূলক)
// const { protect } = require('../middleware/authMiddleware');

// /**
//  * @desc    ইনবক্স বা কনভারসেশন লিস্ট পাওয়া
//  * @route   GET /api/messages/conversations
//  */
// router.get('/conversations', protect, getConversations);

// /**
//  * @desc    নতুন কনভারসেশন খোঁজা বা তৈরি করা
//  * @route   POST /api/messages/conversations
//  * @access  Private
//  */
// router.post('/conversations', protect, findOrCreateConversation);

// /**
//  * @desc    নতুন মেসেজ পাঠানো
//  * @route   POST /api/messages
//  * @access  Private
//  */
// router.post('/', protect, sendMessage);

// /**
//  * @desc    নির্দিষ্ট কোনো ইউজারের সাথে চ্যাট হিস্ট্রি (Conversation) দেখা
//  * @route   GET /api/messages/:otherUserId
//  * @access  Private
//  */
// router.get('/:otherUserId', protect, getMessages);

// /**
//  * @desc    মেসেজ পঠিত (Mark as Read) হিসেবে মার্ক করা
//  * @route   PUT /api/messages/read/:senderId
//  * @access  Private
//  */
// router.put('/read/:senderId', protect, markAsRead);

// module.exports = router;

const express = require('express');
const router = express.Router();

const {
  sendMessage,
  getMessages,
  getConversations,
  markAsRead,
  findOrCreateConversation,
} = require('../controllers/messageController');

const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, getConversations);
router.post('/conversations', protect, findOrCreateConversation);
router.post('/', protect, sendMessage);
router.get('/:otherUserId', protect, getMessages);
router.put('/read/:senderId', protect, markAsRead);

module.exports = router;
