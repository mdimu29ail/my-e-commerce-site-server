const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'আপনার এই অনুমতি নেই' });
    }
    next();
  };
};

const adminOnly = authorize('admin');
const adminOrSeller = authorize('admin', 'seller');
const moderatorOrAdmin = authorize('moderator', 'admin'); // নিশ্চিত করুন এই লাইনটি আছে

// সবশেষে এক্সপোর্ট চেক করুন
module.exports = { authorize, adminOnly, adminOrSeller, moderatorOrAdmin };
