const Category = require('../models/Category');
const Product = require('../models/Product');
const slugify = require('slugify');

// @desc    নতুন ক্যাটাগরি তৈরি করা (অ্যাডমিন)
exports.createCategory = async (req, res) => {
  try {
    const { nameEn, nameBn, image, description } = req.body;

    // ১. চেক করা অ্যাডমিন লগইন আছে কি না
    if (!req.user) {
      return res.status(401).json({ message: 'লগইন সেশন শেষ, আবার লগইন করুন' });
    }

    // ২. চেক করা একই নামের ক্যাটাগরি আছে কি না
    const categoryExists = await Category.findOne({ nameEn });
    if (categoryExists) {
      return res.status(400).json({ message: 'এই ক্যাটাগরি অলরেডি আছে' });
    }

    // ৩. ডাটাবেসে সেভ করা
    const category = new Category({
      nameEn,
      nameBn,
      image, // ফ্রন্টএন্ড থেকে আসা ImgBB URL
      description: description || '',
      createdBy: req.user._id,
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('CREATE CATEGORY ERROR:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    সব ক্যাটাগরি এবং প্রোডাক্ট কাউন্ট পাওয়া
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({})
      .populate('parentCategory', 'nameEn nameBn')
      .sort({ createdAt: -1 });

    const categoriesWithCount = await Promise.all(
      categories.map(async cat => {
        const count = await Product.countDocuments({ category: cat._id });
        return {
          ...cat._doc,
          productCount: count,
        };
      })
    );

    res.json(categoriesWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    ক্যাটাগরি আপডেট করা
exports.updateCategory = async (req, res) => {
  try {
    const { nameEn, nameBn, image, description } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'ক্যাটাগরি পাওয়া যায়নি' });
    }

    // ডাটা আপডেট
    category.nameEn = nameEn || category.nameEn;
    category.nameBn = nameBn || category.nameBn;
    category.image = image || category.image;
    category.description = description || category.description;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    ক্যাটাগরি ডিলিট করা
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'ক্যাটাগরি পাওয়া যায়নি' });
    }

    // চেক করা: এই ক্যাটাগরিতে কোনো প্রোডাক্ট আছে কি না
    const hasProducts = await Product.findOne({ category: req.params.id });
    if (hasProducts) {
      return res
        .status(400)
        .json({ message: 'এই ক্যাটাগরিতে পণ্য আছে, তাই ডিলিট করা যাবে না' });
    }

    await category.deleteOne();
    res.json({ message: 'ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    নেস্টেড ক্যাটাগরি স্ট্রাকচার পাওয়া
exports.getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.find({});
    // Tree Logic (যদি আপনার প্রয়োজন হয়)
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
