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

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/entai_infra')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
