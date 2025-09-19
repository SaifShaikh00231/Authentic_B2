const Sweet = require('../models/Sweet');
const cloudinary = require('../config/cloudinary');





const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "sweets" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error); // 👈 never leave unresolved
        }
        resolve(result); // 👈 always resolve
      }
    );

    // write the buffer into the upload stream
    stream.end(buffer);
  });
};


exports.addSweet = async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;
    console.log("Incoming data:", req.body);

    if (!name || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: 'Name, category, price, and quantity are required' });
    }

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      console.log("Uploading to Cloudinary...");
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
      const results = await Promise.all(uploadPromises);
      console.log("Cloudinary upload done:", results);
      imageUrls = results.map(r => r.secure_url);
    }

    console.log("Saving sweet...");
    const sweet = new Sweet({ name, category, price, quantity, imageUrls });
    const savedSweet = await sweet.save();
    console.log("Sweet saved:", savedSweet);

    res.status(201).json(savedSweet);
  } catch (error) {
    console.error("Error in addSweet:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.getAllSweets = async (req, res) => {
  console.log('GET /api/sweets/ called');
  try {
    const sweets = await Sweet.find();
    res.json(sweets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getHomePageSweets = async (req, res) => {
  try {
    const sweets = await Sweet.find({ quantity: { $gt: 0 } }) // only in-stock sweets
      .sort({ createdAt: -1 }) // newest first
      .limit(8); // latest 8 sweets

    res.json(sweets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.searchSweets = async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;
    const filter = {};

    if (name) filter.name = new RegExp(name, 'i');
    if (category) filter.category = new RegExp(category, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sweets = await Sweet.find(filter);
    res.json(sweets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSweet = async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ message: 'Sweet not found' });

    const { name, category, price, quantity } = req.body;

    if (name !== undefined) sweet.name = name;
    if (category !== undefined) sweet.category = category;
    if (price !== undefined) sweet.price = price;
    if (quantity !== undefined) sweet.quantity = quantity; // ✅ add this

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
      const results = await Promise.all(uploadPromises);
      sweet.imageUrls = results.map(r => r.secure_url);
    }

    const updatedSweet = await sweet.save();
    res.json(updatedSweet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteSweet = async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ message: 'Sweet not found' });

    await sweet.deleteOne();
    res.json({ message: 'Sweet deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/sweetsController.js
exports.purchaseSweet = async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ message: 'Sweet not found' });

    const { quantity } = req.body; // get the quantity user wants to purchase
    const purchaseQty = Number(quantity) || 1; // fallback to 1 if not provided

    if (purchaseQty <= 0) {
      return res.status(400).json({ message: 'Invalid purchase quantity' });
    }

    if (sweet.quantity < purchaseQty) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    // ✅ decrease by requested quantity
    sweet.quantity -= purchaseQty;
    await sweet.save();

    res.json({ message: 'Purchase successful', sweet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.restockSweet = async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ message: 'Sweet not found' });

    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    sweet.quantity += amount;
    await sweet.save();

    res.json({ message: `Restocked with ${amount} units`, sweet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


