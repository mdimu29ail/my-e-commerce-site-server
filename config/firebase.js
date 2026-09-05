const admin = require('firebase-admin');

// Firebase Console -> Project Settings -> Service Accounts থেকে JSON ফাইলটি ডাউনলোড করুন
// সেই ফাইলের তথ্যগুলো .env-এ রাখা নিরাপদ।
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Newline হ্যান্ডেল করার জন্য
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
