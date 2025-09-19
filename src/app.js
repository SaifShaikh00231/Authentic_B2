const express = require('express');
const cors = require('cors');
const app = express();

const authRoutes = require('./routes/authRoutes');
const sweetsRoutes = require('./routes/sweetsRoutes');

app.use(cors({
  origin: 'http://localhost:5173',  // Allow this origin
  // You can also add other options here if needed
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetsRoutes);

module.exports = app;
