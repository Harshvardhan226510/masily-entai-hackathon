require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const boqRoutes = require('./routes/boq.routes');
const quotationRoutes = require('./routes/quotation.routes');
const auditRoutes = require('./routes/audit.routes');

const app = express();

// Increase JSON limit for base64 image uploads during MVP
app.use(express.json({ limit: '10mb' }));
app.use(cors());

let isConnected = false;
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/entai_infra', {
        serverSelectionTimeoutMS: 5000
      });
      isConnected = true;
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('MongoDB connection error:', err);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/boq', boqRoutes);
app.use('/api/ai', quotationRoutes);
app.use('/api/ai', auditRoutes);

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
