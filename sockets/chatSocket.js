const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');

let io;
const onlineUsers = new Map(); // socket.id -> userId

const chatSocket = server => {
  io = socketio(server, {
    cors: {
      origin: [process.env.FRONTEND_URL, 'http://localhost:5173'].filter(
        Boolean
      ),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use((socket, next) => {
    try {
      let token;

      if (socket.handshake.auth && socket.handshake.auth.token) {
        token = socket.handshake.auth.token;
      } else if (
        socket.handshake.headers.authorization &&
        socket.handshake.headers.authorization.startsWith('Bearer')
      ) {
        token = socket.handshake.headers.authorization.split(' ')[1];
      } else if (socket.handshake.headers.cookie) {
        const cookies = socket.handshake.headers.cookie.split(';');
        for (const cookieItem of cookies) {
          const trimmed = cookieItem.trim();
          if (trimmed.startsWith('jwt=')) {
            token = decodeURIComponent(trimmed.slice(4));
            break;
          }
        }
      } else if (socket.handshake.query && socket.handshake.query.token) {
        token = socket.handshake.query.token;
      }

      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return next(new Error('Authentication error: Invalid token'));
        }

        const rawId = decoded.userId || decoded.id || decoded._id;
        if (!rawId) {
          return next(
            new Error('Authentication error: User ID not found in token')
          );
        }

        socket.userId = String(rawId);
        next();
      });
    } catch (error) {
      next(new Error('Socket authentication failed'));
    }
  });

  io.on('connection', socket => {
    const userId = String(socket.userId);

    // Join user's individual room by pure string ID
    socket.join(userId);

    onlineUsers.set(socket.id, userId);
    io.emit('userStatusUpdate', { userId, status: 'online' });
    socket.emit('getOnlineUsers', Array.from(new Set(onlineUsers.values())));

    // Real-time message sending
    socket.on('sendMessage', async data => {
      const { receiverId, message, productId } = data;
      if (!receiverId || !message || !message.toString().trim()) return;

      const senderId = String(userId);
      const targetReceiverId = String(receiverId);

      try {
        const newMessage = await Message.create({
          sender: senderId,
          receiver: targetReceiverId,
          message: message.toString().trim(),
          product: productId || null,
        });

        // Ensure participants are sorted to align with compound unique index
        const sortedParticipants = [senderId, targetReceiverId].sort((a, b) =>
          a.toString().localeCompare(b.toString())
        );

        try {
          const Conversation = require('../models/Conversation');
          await Conversation.findOneAndUpdate(
            { participants: { $all: sortedParticipants, $size: 2 } },
            {
              $set: { lastMessage: newMessage._id },
              $setOnInsert: { participants: sortedParticipants },
            },
            { upsert: true, new: true }
          );
        } catch (convErr) {
          console.warn(
            'Non-fatal conversation update warning:',
            convErr.message
          );
        }

        const populatedMessage = await Message.findById(newMessage._id)
          .populate('product', 'nameEn nameBn images price')
          .lean();

        // 🔴 CRITICAL FIX: Ensure sender, receiver, and _id are pure string IDs
        const socketPayload = {
          ...populatedMessage,
          _id: String(populatedMessage._id),
          sender: senderId,
          receiver: targetReceiverId,
        };

        // 🔴 Broadcast to receiver's room (User B)
        io.to(targetReceiverId).emit('receiveMessage', socketPayload);

        // 🔴 Confirm back to sender's room (User A)
        io.to(senderId).emit('messageSent', socketPayload);
      } catch (error) {
        console.error('Error in chatSocket sendMessage:', error);
      }
    });

    // Global messaging
    socket.on('sendGlobalMessage', async data => {
      const { message } = data;
      if (!message || !message.toString().trim()) return;

      try {
        const sender = await User.findById(userId).select('name');
        const payload = {
          senderId: String(userId),
          senderName: sender ? sender.name : 'Unknown User',
          message: message.toString().trim(),
          timestamp: new Date(),
        };
        io.emit('receiveGlobalMessage', payload);
      } catch (error) {
        console.error('Error in chatSocket sendGlobalMessage:', error);
      }
    });

    // Typing indicators
    socket.on('typing', data => {
      if (data && data.receiverId) {
        const targetReceiverId = String(data.receiverId);
        io.to(targetReceiverId).emit('displayTyping', {
          senderId: String(userId),
        });
      }
    });

    socket.on('stopTyping', data => {
      if (data && data.receiverId) {
        const targetReceiverId = String(data.receiverId);
        io.to(targetReceiverId).emit('hideTyping', {
          senderId: String(userId),
        });
      }
    });

    // Disconnect handling with multi-socket awareness
    socket.on('disconnect', () => {
      onlineUsers.delete(socket.id);
      const isStillOnline = Array.from(onlineUsers.values()).includes(userId);
      if (!isStillOnline) {
        io.emit('userStatusUpdate', { userId, status: 'offline' });
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};

module.exports = { chatSocket, getIO };
