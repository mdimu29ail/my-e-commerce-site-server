const admin = require('firebase-admin');

// ─── Lazy-initialized Firebase Admin SDK ────────────────────────────────────
// Firebase is only initialized when first needed, and only if all required
// env vars are present. This prevents a crash-at-startup when Firebase env
// vars are missing (e.g. during early Vercel cold starts before vars are set).

let _admin = null;
let _bucket = null;
let _initialized = false;

const initFirebase = () => {
  if (_initialized) return;

  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_STORAGE_BUCKET',
  ];

  const missing = requiredVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    console.warn(
      `⚠️  Firebase not initialized — missing env vars: ${missing.join(', ')}\n` +
        '   Firebase-dependent features will be unavailable until these are set in Vercel Dashboard.'
    );
    _initialized = true; // Mark as attempted so we don't spam logs
    return;
  }

  try {
    // Only initialize if not already done (handles hot-reload / multiple requires)
    if (!admin.apps.length) {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // FIREBASE_PRIVATE_KEY stored in Vercel has literal \n — convert to real newlines
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }

    _admin = admin;
    _bucket = admin.storage().bucket();
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error(`❌ Firebase initialization error: ${error.message}`);
  }

  _initialized = true;
};

// Getters — call initFirebase() on first access
const getAdmin = () => {
  initFirebase();
  return _admin;
};

const getBucket = () => {
  initFirebase();
  return _bucket;
};

module.exports = { getAdmin, getBucket };
