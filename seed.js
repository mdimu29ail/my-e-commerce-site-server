// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const bcrypt = require('bcryptjs');

// dotenv.config({ path: __dirname + '/.env' });

// const User = require('./models/User');
// const Category = require('./models/Category');
// const Product = require('./models/Product');
// const Order = require('./models/Order');
// const Tracking = require('./models/Tracking');

// const seedData = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('Connected to MongoDB for seeding...');

//     // Clear existing collections
//     await User.deleteMany({});
//     await Category.deleteMany({});
//     await Product.deleteMany({});
//     await Order.deleteMany({});
//     await Tracking.deleteMany({});

//     console.log('Cleared existing data.');

//     // 1. Seed Users
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash('password123', salt);

//     const admin = await User.create({
//       name: 'Admin Manager',
//       email: 'mdimu290@gmail.com',
//       password: hashedPassword,
//       phone: '01711000001',
//       role: 'admin',
//       isApproved: true,
//       address: {
//         division: 'Dhaka',
//         district: 'Dhaka',
//         upazila: 'Gulshan',
//         detailAddress: 'House 42, Road 11, Gulshan-1',
//       },
//       loyaltyPoints: 1500,
//     });

//     const seller = await User.create({
//       name: 'Apex Digital Seller',
//       email: 'seller@example.com',
//       password: hashedPassword,
//       phone: '01711000002',
//       role: 'seller',
//       shopName: 'Apex Digital Hub',
//       isApproved: true,
//       address: {
//         division: 'Dhaka',
//         district: 'Dhaka',
//         upazila: 'Banani',
//         detailAddress: 'Block D, Road 4, Banani',
//       },
//       loyaltyPoints: 800,
//     });

//     const moderator = await User.create({
//       name: 'Community Moderator',
//       email: 'moderator@example.com',
//       password: hashedPassword,
//       phone: '01711000003',
//       role: 'moderator',
//       isApproved: true,
//       address: {
//         division: 'Chittagong',
//         district: 'Chittagong',
//         upazila: 'Kotwali',
//         detailAddress: 'GEC Circle',
//       },
//       loyaltyPoints: 400,
//     });

//     const customer = await User.create({
//       name: 'Tanvir Ahmed',
//       email: 'user@example.com',
//       password: hashedPassword,
//       phone: '01711000004',
//       role: 'user',
//       isApproved: true,
//       address: {
//         division: 'Dhaka',
//         district: 'Dhaka',
//         upazila: 'Dhanmondi',
//         detailAddress: 'Flat 4B, Road 8/A, Dhanmondi',
//       },
//       loyaltyPoints: 350,
//     });

//     console.log('Seeded Users: Admin, Seller, Moderator, Customer.');

//     // 2. Seed Categories
//     const categoriesData = [
//       {
//         nameEn: 'Smartphones & Tablets',
//         nameBn: 'স্মার্টফোন এবং ট্যাবলেট',
//         slug: 'smartphones',
//         icon: 'Smartphone',
//         description:
//           'Latest flagship and budget smartphones from top global brands.',
//         createdBy: admin._id,
//       },
//       {
//         nameEn: 'Laptops & Computers',
//         nameBn: 'ল্যাপটপ ও কম্পিউটার',
//         slug: 'laptops',
//         icon: 'Laptop',
//         description: 'Powerful laptops, ultrabooks, and desktop accessories.',
//         createdBy: admin._id,
//       },
//       {
//         nameEn: 'Audio & Headphones',
//         nameBn: 'অডিও ও হেডফোন',
//         slug: 'audio',
//         icon: 'Headphones',
//         description: 'Premium noise-canceling headphones and wireless earbuds.',
//         createdBy: admin._id,
//       },
//       {
//         nameEn: 'Smartwatches & Wearables',
//         nameBn: 'স্মার্ট ওয়াচ ও ওয়্যারেবলস',
//         slug: 'watches',
//         icon: 'Watch',
//         description: 'Fitness trackers and high-end smartwatches.',
//         createdBy: admin._id,
//       },
//       {
//         nameEn: 'Fashion & Apparel',
//         nameBn: 'ফ্যাশন ও পোশাক',
//         slug: 'fashion',
//         icon: 'Shirt',
//         description:
//           'Trendy casual wear, premium cotton t-shirts, and apparel.',
//         createdBy: admin._id,
//       },
//       {
//         nameEn: 'Home & Living',
//         nameBn: 'হোম ও লিভিং',
//         slug: 'home',
//         icon: 'Home',
//         description: 'Modern lifestyle products and minimal home decor.',
//         createdBy: admin._id,
//       },
//     ];

//     const categories = [];
//     for (const c of categoriesData) {
//       const createdCat = await Category.create(c);
//       categories.push(createdCat);
//     }
//     console.log(`Seeded ${categories.length} Categories.`);

//     const catMap = {};
//     categories.forEach(c => {
//       catMap[c.slug] = c._id;
//     });

//     // 3. Seed Products
//     const productsData = [
//       {
//         nameEn: 'Apple iPhone 15 Pro Max 256GB - Natural Titanium',
//         nameBn: 'অ্যাপল আইফোন ১৫ প্রো ম্যাক্স ২৫৬ জিবি - টাইটানিয়াম',
//         descriptionEn:
//           'Forged in titanium and featuring the groundbreaking A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever.',
//         descriptionBn:
//           'টাইটানিয়াম বডি এবং গ্রাউন্ডব্রেকিং এ১৭ প্রো চিপ সহ অ্যাপলের সবথেকে শক্তিশালী ক্যামেরা সিস্টেম।',
//         price: 155000,
//         discountPrice: 147500,
//         category: catMap['smartphones'],
//         seller: seller._id,
//         brand: 'Apple',
//         stock: 18,
//         images: [
//           'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
//           'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
//         ],
//         attributes: [
//           { key: 'Color', value: 'Natural Titanium' },
//           { key: 'Storage', value: '256GB' },
//         ],
//         rating: 4.9,
//         numReviews: 24,
//         isFeatured: true,
//         soldCount: 42,
//         tags: ['apple', 'iphone', 'flagship', 'smartphone', 'gadgets'],
//         reviews: [
//           {
//             name: 'Tanvir Ahmed',
//             rating: 5,
//             comment: 'Amazing battery life and camera is exceptional!',
//             user: customer._id,
//           },
//         ],
//       },
//       {
//         nameEn: 'Samsung Galaxy S24 Ultra 5G - Titanium Gray',
//         nameBn: 'স্যামসাং গ্যালাক্সি এস২৪ আল্ট্রা ৫জি - টাইটানিয়াম গ্রে',
//         descriptionEn:
//           'Galaxy AI is here. Epic titanium shield with Corning Gorilla Armor, built-in S Pen, and 200MP camera system.',
//         descriptionBn:
//           'গ্যালাক্সি এআই ফিচার সমৃদ্ধ ২০০ মেগাপিক্সেল ক্যামেরা ও বিল্ট-ইন এস-পেন সহ স্যামসাং ফ্ল্যাগশিপ।',
//         price: 142000,
//         discountPrice: 135000,
//         category: catMap['smartphones'],
//         seller: seller._id,
//         brand: 'Samsung',
//         stock: 25,
//         images: [
//           'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
//         ],
//         attributes: [
//           { key: 'Color', value: 'Titanium Gray' },
//           { key: 'RAM', value: '12GB' },
//         ],
//         rating: 4.8,
//         numReviews: 18,
//         isFeatured: true,
//         soldCount: 38,
//         tags: ['samsung', 'galaxy', 'ai', 'smartphone'],
//       },
//       {
//         nameEn: 'MacBook Air 15-inch M3 Chip 16GB RAM 512GB SSD',
//         nameBn: 'ম্যাকবুক এয়ার ১৫-ইঞ্চি এম৩ চিপ ১৬ জিবি র‍্যাম',
//         descriptionEn:
//           'Strikingly thin and fast MacBook Air with up to 18 hours of battery life and Liquid Retina display.',
//         descriptionBn:
//           'আল্ট্রা-স্লিম ডিজাইন, এম৩ সুপারফাস্ট প্রসেসর এবং ১৮ ঘণ্টার অবিশ্বাস্য ব্যাটারি ব্যাকআপ।',
//         price: 178000,
//         discountPrice: 169000,
//         category: catMap['laptops'],
//         seller: seller._id,
//         brand: 'Apple',
//         stock: 12,
//         images: [
//           'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
//           'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
//         ],
//         rating: 4.9,
//         numReviews: 31,
//         isFeatured: true,
//         soldCount: 29,
//         tags: ['apple', 'macbook', 'laptop', 'm3'],
//       },
//       {
//         nameEn: 'Dell XPS 13 Plus OLED Intel Core i7 13th Gen',
//         nameBn: 'ডেল এক্সপিএস ১৩ প্লাস ওলেড ইন্টেল কোর আই৭',
//         descriptionEn:
//           'Modern minimalist design with capacitive touch row, seamless glass touchpad, and 3.5K OLED touchscreen display.',
//         descriptionBn:
//           '৩.৫কে ওলেড ডিসপ্লে, হিডেন টাচপ্যাড এবং ১৩তম প্রজন্মের কোর আই৭ প্রসেসর সমৃদ্ধ আল্ট্রাবুক।',
//         price: 165000,
//         discountPrice: 154000,
//         category: catMap['laptops'],
//         seller: seller._id,
//         brand: 'Dell',
//         stock: 15,
//         images: [
//           'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
//         ],
//         rating: 4.7,
//         numReviews: 12,
//         isFeatured: false,
//         soldCount: 16,
//         tags: ['dell', 'xps', 'laptop', 'oled'],
//       },
//       {
//         nameEn: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
//         nameBn: 'সনি ডব্লিউএইচ-১০০০এক্সএম৫ ওয়্যারলেস হেডফোন',
//         descriptionEn:
//           'Industry-leading noise cancellation with two processors and 8 microphones for unparalleled quietness and audio clarity.',
//         descriptionBn:
//           'সর্বাধুনিক অ্যাক্টিভ নয়েজ ক্যান্সেলেশন এবং হাই-রেস অডিও সাউন্ড কোয়ালিটি।',
//         price: 36500,
//         discountPrice: 32900,
//         category: catMap['audio'],
//         seller: seller._id,
//         brand: 'Sony',
//         stock: 40,
//         images: [
//           'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
//           'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
//         ],
//         rating: 4.9,
//         numReviews: 55,
//         isFeatured: true,
//         soldCount: 88,
//         tags: ['sony', 'audio', 'headphones', 'anc'],
//       },
//       {
//         nameEn: 'Apple AirPods Pro (2nd Generation) with USB-C',
//         nameBn: 'অ্যাপল এয়ারপডস প্রো (২য় প্রজন্ম) ইউএসবি-সি',
//         descriptionEn:
//           'Up to 2x more Active Noise Cancellation, Adaptive Audio, and Transparency mode for immersion anywhere.',
//         descriptionBn:
//           'অ্যাডাপ্টিভ অডিও, ২ গুণ বেশি নয়েজ ক্যান্সেলেশন এবং ইউএসবি টাইপ-সি কেস।',
//         price: 28500,
//         discountPrice: 26000,
//         category: catMap['audio'],
//         seller: seller._id,
//         brand: 'Apple',
//         stock: 50,
//         images: [
//           'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
//         ],
//         rating: 4.8,
//         numReviews: 43,
//         isFeatured: true,
//         soldCount: 95,
//         tags: ['apple', 'airpods', 'audio', 'earbuds'],
//       },
//       {
//         nameEn: 'Apple Watch Ultra 2 Titanium with Ocean Band',
//         nameBn: 'অ্যাপল ওয়াচ আল্ট্রা ২ টাইটানিয়াম ওশেন ব্যান্ড',
//         descriptionEn:
//           'The most rugged and capable Apple Watch. Precision dual-frequency GPS, up to 36 hours of normal use, and 3000-nit display.',
//         descriptionBn:
//           'অ্যাথলেট ও অ্যাডভেঞ্চারারদের জন্য প্রিমিয়াম টাইটানিয়াম ও ৩০০০ নিটস ডিসপ্লে সমৃদ্ধ ওয়াচ।',
//         price: 98000,
//         discountPrice: 91500,
//         category: catMap['watches'],
//         seller: seller._id,
//         brand: 'Apple',
//         stock: 20,
//         images: [
//           'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
//           'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
//         ],
//         rating: 4.9,
//         numReviews: 27,
//         isFeatured: true,
//         soldCount: 35,
//         tags: ['apple', 'watch', 'smartwatch', 'ultra'],
//       },
//       {
//         nameEn: 'Samsung Galaxy Watch6 Classic 47mm LTE',
//         nameBn: 'স্যামসাং গ্যালাক্সি ওয়াচ৬ ক্লাসিক ৪৭ মিমি',
//         descriptionEn:
//           'Timeless rotating bezel, Sapphire Crystal glass, advanced sleep coaching, and BIA body composition analysis.',
//         descriptionBn:
//           'রোটেটিং বেজেল, স্যাফায়ার ক্রিস্টাল গ্লাস এবং উন্নত হেলথ মনিটরিং সেন্সর।',
//         price: 42000,
//         discountPrice: 38000,
//         category: catMap['watches'],
//         seller: seller._id,
//         brand: 'Samsung',
//         stock: 30,
//         images: [
//           'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
//         ],
//         rating: 4.7,
//         numReviews: 19,
//         isFeatured: false,
//         soldCount: 28,
//         tags: ['samsung', 'watch', 'smartwatch'],
//       },
//       {
//         nameEn: 'Premium Heavyweight 100% Supima Cotton Crewneck Tee',
//         nameBn: 'প্রিমিয়াম হেভিওয়েট সুপিমা কটন টি-শার্ট',
//         descriptionEn:
//           'Crafted from ultra-soft long-staple Supima cotton. Retains color and luxurious softness wash after wash.',
//         descriptionBn:
//           '১০০% খাঁটি সুপিমা কটন থেকে তৈরি অত্যন্ত আরামদায়ক ও টেকসই লাক্সারি টি-শার্ট।',
//         price: 1850,
//         discountPrice: 1450,
//         category: catMap['fashion'],
//         seller: seller._id,
//         brand: 'Bazaar Essentials',
//         stock: 120,
//         images: [
//           'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
//         ],
//         rating: 4.8,
//         numReviews: 64,
//         isFeatured: true,
//         soldCount: 210,
//         tags: ['fashion', 'cotton', 'tshirt', 'apparel'],
//       },
//       {
//         nameEn:
//           'Minimalist Ergonomic Workspace Desk Lamp with Wireless Charging',
//         nameBn: 'মিনিমালিস্ট ডেস্ক ল্যাম্প ও ওয়্যারলেস চার্জার',
//         descriptionEn:
//           'Dimmable color temperature, touch slide control, integrated 15W Qi fast wireless charging base, and timer.',
//         descriptionBn:
//           'স্পর্শ নিয়ন্ত্রিত আধুনিক ডেস্ক ল্যাম্প এবং ইনবিল্ট ফাস্ট ওয়্যারলেস চার্জিং ডক।',
//         price: 4500,
//         discountPrice: 3800,
//         category: catMap['home'],
//         seller: seller._id,
//         brand: 'Lumina',
//         stock: 45,
//         images: [
//           'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=800&q=80',
//         ],
//         rating: 4.6,
//         numReviews: 22,
//         isFeatured: false,
//         soldCount: 47,
//         tags: ['home', 'lamp', 'desk', 'decor'],
//       },
//       {
//         nameEn: 'Anker 737 Power Bank (PowerCore 24K) 140W Fast Charging',
//         nameBn: 'অ্যাঙ্কার ৭৩৭ পাওয়ার ব্যাংক ১৪০ ওয়াট ফাস্ট চার্জিং',
//         descriptionEn:
//           'Equipped with USB-C Power Delivery 3.1 and smart digital display showing output and recharge status.',
//         descriptionBn:
//           '১৪০ ওয়াট আল্ট্রা ফাস্ট চার্জিং ক্ষমতা ও ডিজিটাল স্মার্ট ডিসপ্লে সমৃদ্ধ পাওয়ার ব্যাংক।',
//         price: 14500,
//         discountPrice: 12800,
//         category: catMap['smartphones'],
//         seller: seller._id,
//         brand: 'Anker',
//         stock: 35,
//         images: [
//           'https://images.unsplash.com/photo-1609592424307-e54942f7eb9b?auto=format&fit=crop&w=800&q=80',
//         ],
//         rating: 4.9,
//         numReviews: 38,
//         isFeatured: true,
//         soldCount: 76,
//         tags: ['anker', 'powerbank', 'gadgets', 'fastcharge'],
//       },
//       {
//         nameEn: 'Keychron K2 Pro QMK Wireless Custom Mechanical Keyboard',
//         nameBn: 'কিক্রন কে২ প্রো ওয়্যারলেস মেকানিক্যাল কিবোর্ড',
//         descriptionEn:
//           'Hot-swappable tactile RGB mechanical keyboard compatible with Mac and Windows via Bluetooth 5.1 or USB-C.',
//         descriptionBn:
//           'হট-সোয়াপ্যাবল মেকানিক্যাল সুইচ, আরজিবি ব্যাকলাইট এবং ব্লুটুথ মাল্টি-ডিভাইস কানেক্টিভিটি।',
//         price: 12500,
//         discountPrice: 11200,
//         category: catMap['laptops'],
//         seller: seller._id,
//         brand: 'Keychron',
//         stock: 28,
//         images: [
//           'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
//         ],
//         rating: 4.8,
//         numReviews: 29,
//         isFeatured: true,
//         soldCount: 54,
//         tags: ['keychron', 'keyboard', 'mechanical', 'computer'],
//       },
//     ];

//     const products = [];
//     for (const p of productsData) {
//       const createdProd = await Product.create(p);
//       products.push(createdProd);
//     }
//     console.log(`Seeded ${products.length} Products.`);

//     // 4. Seed Sample Orders for Customer
//     const sampleOrder = await Order.create({
//       user: customer._id,
//       orderItems: [
//         {
//           nameEn: products[4].nameEn,
//           nameBn: products[4].nameBn,
//           qty: 1,
//           image: products[4].images[0],
//           price: products[4].discountPrice,
//           product: products[4]._id,
//           seller: seller._id,
//         },
//         {
//           nameEn: products[8].nameEn,
//           nameBn: products[8].nameBn,
//           qty: 2,
//           image: products[8].images[0],
//           price: products[8].discountPrice,
//           product: products[8]._id,
//           seller: seller._id,
//         },
//       ],
//       shippingAddress: {
//         phone: '01711000004',
//         division: 'Dhaka',
//         district: 'Dhaka',
//         upazila: 'Dhanmondi',
//         addressDetail: 'Flat 4B, Road 8/A, Dhanmondi',
//       },
//       paymentMethod: 'bKash',
//       paymentStatus: 'Paid',
//       isPaid: true,
//       paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
//       itemsPrice: products[4].discountPrice + products[8].discountPrice * 2,
//       shippingPrice: 80,
//       totalPrice:
//         products[4].discountPrice + products[8].discountPrice * 2 + 80,
//       status: 'Shipped',
//       courierName: 'Pathao Courier',
//       trackingId: 'PTH-8839210',
//     });

//     await Tracking.create({
//       order: sampleOrder._id,
//       user: customer._id,
//       trackingId: 'PTH-8839210',
//       courierName: 'Pathao Courier',
//       currentStatus: 'In Transit',
//       history: [
//         {
//           status: 'In Transit',
//           location: 'Dhaka Central Hub',
//           messageEn: 'Package handed over to delivery rider.',
//           messageBn: 'পার্সেল ডেলিভারি রাইডারের নিকট হস্তান্তর করা হয়েছে।',
//           updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
//         },
//         {
//           status: 'Processing',
//           location: 'Sorting Facility Tejgaon',
//           messageEn: 'Package packed and sorted.',
//           messageBn: 'প্যাকেজিং সম্পন্ন হয়েছে।',
//           updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
//         },
//       ],
//     });

//     console.log('Seeded Sample Order and Tracking record.');

//     console.log('--------------------------------------------------');
//     console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
//     console.log('Credentials:');
//     console.log('Admin:      admin@example.com / password123');
//     console.log('Seller:     seller@example.com / password123');
//     console.log('Moderator:  moderator@example.com / password123');
//     console.log('Customer:   user@example.com / password123');
//     console.log('--------------------------------------------------');

//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Seeding Error:', error);
//     process.exit(1);
//   }
// };

// seedData();
