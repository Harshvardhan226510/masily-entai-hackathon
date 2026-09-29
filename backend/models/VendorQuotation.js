const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  vendorName: { type: String, required: true },
  category: { type: String, required: true },
  submittedAmount: { type: Number, required: true },
  deliveryTimelineDays: { type: Number, required: true },
  brandProposed: { type: String, required: true },
  paymentTerms: { type: String, required: true },
  unitRates: [{
    description: String,
    unit: String,
    rate: Number
  }],
  // Fields populated by Gemini
  normalizedTotal: { type: Number },
  costEfficiencyScore: { type: Number },
  metrics: {
    costScore: { type: Number },
    speedScore: { type: Number },
    qualityScore: { type: Number },
    riskScore: { type: Number }
  },
  riskFlags: [{ type: String }],
  isRecommended: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('VendorQuotation', quotationSchema);
