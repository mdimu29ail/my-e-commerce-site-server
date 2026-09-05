// const Message = require('../models/Message');
// const User = require('../models/User');
// const Conversation = require('../models/Conversation');
// const { getIO } = require('../sockets/chatSocket');

// const canMessage = (senderRole, receiverRole) => {
//   // Admin and Moderator can message anyone
//   if (['admin', 'moderator'].includes(senderRole)) return true;

//   // User can message Admin, Moderator, and Seller
//   if (senderRole === 'user')
//     return ['admin', 'moderator', 'seller'].includes(receiverRole);

//   // Seller can message User, Admin, and Moderator
//   if (senderRole === 'seller')
//     return ['user', 'admin', 'moderator'].includes(receiverRole);

//   return false;
// };

// exports.sendMessage = async (req, res) => {
//   try {
//     const { receiverId, message, productId } = req.body;
//     const receiver = await User.findById(receiverId);

//     if (!receiver)
//       return res.status(404).json({ message: 'রিসিভার পাওয়া যায়নি' });

//     if (!canMessage(req.user.role, receiver.role)) {
//       return res.status(403).json({ message: 'আপনি এই ইউজারকে মেসেজ পাঠাতে পারবেন না' });
//     }

//     const newMessage = await Message.create({
//       sender: req.user._id,
//       receiver: receiverId,
//       message,
//       product: productId || null,
//     });

//     // Update or create conversation
//     await Conversation.findOneAndUpdate(
//       { participants: { $all: [req.user._id, receiverId] } },
//       { lastMessage: newMessage._id },
//       { upsert: true, new: true }
//     );

//     const populatedMessage = await Message.findById(newMessage._id).populate(
//       'product'
//     );

//     try {
//       const io = getIO();
//       io.to(receiverId.toString()).emit('receiveMessage', populatedMessage);
//     } catch (err) {
//       console.log('Socket notification failed:', err.message);
//     }

//     res.status(201).json(populatedMessage);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.findOrCreateConversation = async (req, res) => {
//   try {
//     const { receiverId } = req.body;
//     const myId = req.user._id;

//     // Ensure participants are always sorted to match the index order
//     const participants = [myId, receiverId].sort((a, b) => a.toString().localeCompare(b.toString()));

//     // 1. Try to find existing conversation
//     let conversation = await Conversation.findOne({
//       participants: { $all: participants, $size: 2 }
//     }).populate('participants', 'name photoURL role');

//     // 2. If not found, create it
//     if (!conversation) {
//       try {
//         conversation = await Conversation.create({ participants });
//         conversation = await conversation.populate('participants', 'name photoURL role');
//       } catch (error) {
//         // Handle race condition if another process created it simultaneously
//         if (error.code === 11000) {
//           conversation = await Conversation.findOne({
//             participants: { $all: participants, $size: 2 }
//           }).populate('participants', 'name photoURL role');
//         } else {
//           throw error;
//         }
//       }
//     }

//     res.status(200).json(conversation);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getMessages = async (req, res) => {
//   try {
//     const { otherUserId } = req.params;
//     const myId = req.user._id;

//     const messages = await Message.find({
//       $or: [
//         { sender: myId, receiver: otherUserId },
//         { sender: otherUserId, receiver: myId },
//       ],
//     })
//       .sort({ createdAt: 1 })
//       .populate('product', 'nameEn nameBn images price');

//     res.status(200).json(messages);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getConversations = async (req, res) => {
//   try {
//     const myId = req.user._id;

//     const conversations = await Message.aggregate([
//       {
//         $match: {
//           $or: [{ sender: myId }, { receiver: myId }],
//         },
//       },
//       {
//         $sort: { createdAt: -1 },
//       },
//       {
//         $group: {
//           _id: {
//             $cond: [{ $eq: ['$sender', myId] }, '$receiver', '$sender'],
//           },
//           lastMessage: { $first: '$message' },
//           lastTimestamp: { $first: '$createdAt' }, // Fixed $first array issue
//           unreadCount: {
//             $sum: {
//               $cond: [
//                 {
//                   $and: [
//                     { $eq: ['$receiver', myId] },
//                     { $eq: ['$isRead', false] }
//                   ]
//                 },
//                 1,
//                 0
//               ]
//             }
//           }
//         },
//       },
//       {
//         $lookup: {
//           from: 'users',
//           localField: '_id',
//           foreignField: '_id',
//           as: 'userDetails',
//         },
//       },
//       {
//         $unwind: '$userDetails',
//       },
//       {
//         $project: {
//           _id: 1,
//           lastMessage: 1,
//           lastTimestamp: 1,
//           unreadCount: 1,
//           'userDetails._id': 1,
//           'userDetails.name': 1,
//           'userDetails.role': 1,
//           'userDetails.image': '$userDetails.photoURL',
//         },
//       },
//       {
//         $sort: { lastTimestamp: -1 }
//       }
//     ]);

//     console.log(`Conversations fetched for user ${myId}:`, conversations);

//     res.status(200).json(conversations);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.markAsRead = async (req, res) => {
//   try {
//     const { senderId } = req.params;
//     const myId = req.user._id;

//     await Message.updateMany(
//       { sender: senderId, receiver: myId, isRead: false },
//       { $set: { isRead: true } }
//     );

//     try {
//       const io = getIO();
//       io.to(senderId.toString()).emit('messagesRead', { readerId: myId });
//     } catch (err) {
//       // Socket not active
//     }

//     res.status(200).json({ message: 'মেসেজগুলো পঠিত হিসেবে মার্ক করা হয়েছে' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const Message = require('../models/Message');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const { getIO } = require('../sockets/chatSocket');

const canMessage = (senderRole, receiverRole) => {
  if (['admin', 'moderator'].includes(senderRole)) return true;
  if (senderRole === 'user')
    return ['admin', 'moderator', 'seller'].includes(receiverRole);
  if (senderRole === 'seller')
    return ['user', 'admin', 'moderator'].includes(receiverRole);
  return false;
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message, productId } = req.body;
    const senderId = req.user._id.toString();
    const targetReceiverId = receiverId.toString();

    const receiver = await User.findById(targetReceiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'রিসিভার পাওয়া যায়নি' });
    }

    if (!canMessage(req.user.role, receiver.role)) {
      return res
        .status(403)
        .json({ message: 'আপনি এই ইউজারকে মেসেজ পাঠাতে পারবেন না' });
    }

    // ১. মেসেজ তৈরি
    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: targetReceiverId,
      message,
      product: productId || null,
    });

    // ২. কনভারসেশন আপডেট
    await Conversation.findOneAndUpdate(
      { participants: { $all: [req.user._id, targetReceiverId] } },
      { lastMessage: newMessage._id },
      { upsert: true, new: true }
    );

    // ৩. মেসেজ ডাটা রিট্রাইভ ও পিওর JS অবজেক্টে কনভার্ট (.lean())
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('product', 'nameEn nameBn images price')
      .lean();

    // 🔴 FIX: sender এবং receiver নিশ্চিতভাবে Pure String ID বানিয়ে দেওয়া
    const socketPayload = {
      ...populatedMessage,
      sender: senderId,
      receiver: targetReceiverId,
    };

    // 🔴 FIX: সকেট নোটিফিকেশন হ্যান্ডলিং (Receiver & Sender Both)
    try {
      const io = getIO();
      // রিসিভার (User B)-এর রুমে মেসেজ পাঠানো
      io.to(targetReceiverId).emit('receiveMessage', socketPayload);

      // সেন্ডার (User A)-এর নিজের ব্যাকঅফ নিশ্চিত করা
      io.to(senderId).emit('messageSent', socketPayload);
    } catch (err) {
      console.log('Socket notification failed:', err.message);
    }

    res.status(201).json(socketPayload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.findOrCreateConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const myId = req.user._id;

    const participants = [myId, receiverId].sort((a, b) =>
      a.toString().localeCompare(b.toString())
    );

    let conversation = await Conversation.findOne({
      participants: { $all: participants, $size: 2 },
    }).populate('participants', 'name photoURL role');

    if (!conversation) {
      try {
        conversation = await Conversation.create({ participants });
        conversation = await conversation.populate(
          'participants',
          'name photoURL role'
        );
      } catch (error) {
        if (error.code === 11000) {
          conversation = await Conversation.findOne({
            participants: { $all: participants, $size: 2 },
          }).populate('participants', 'name photoURL role');
        } else {
          throw error;
        }
      }
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('product', 'nameEn nameBn images price');

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const myId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: myId }, { receiver: myId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$sender', myId] }, '$receiver', '$sender'],
          },
          lastMessage: { $first: '$message' },
          lastTimestamp: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', myId] },
                    { $eq: ['$isRead', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails',
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          lastTimestamp: 1,
          unreadCount: 1,
          'userDetails._id': 1,
          'userDetails.name': 1,
          'userDetails.role': 1,
          'userDetails.image': '$userDetails.photoURL',
        },
      },
      {
        $sort: { lastTimestamp: -1 },
      },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const myId = req.user._id;

    await Message.updateMany(
      { sender: senderId, receiver: myId, isRead: false },
      { $set: { isRead: true } }
    );

    try {
      const io = getIO();
      io.to(senderId.toString()).emit('messagesRead', { readerId: myId });
    } catch (err) {
      // Socket inactive
    }

    res.status(200).json({ message: 'মেসেজগুলো পঠিত হিসেবে মার্ক করা হয়েছে' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
