const mongoose = require('mongoose');

const boqItemSchema = new mongoose.Schema({
  category: { type: String, required: true }, // e.g., Civil, HVAC, Electrical
  description: { type: String, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true },
  estimatedRate: { type: Number, required: true },
  totalEstimated: { type: Number, required: true }
});

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'DISBURSED'], default: 'PENDING' }
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['SCOUTING', 'DESIGN', 'BOQ', 'EXECUTION', 'HANDOVER'], default: 'BOQ' },
  boqStatus: { type: String, enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'FROZEN'], default: 'DRAFT' },
  allocatedBudget: { type: Number, default: 0 },
  frozenCapex: { type: Number, default: 0 },
  boqItems: [boqItemSchema],
  disbursements: [paymentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
