const mongoose = require('mongoose');

const siteLogSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  engineerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectPhase: { type: String, enum: ['SCOUTING', 'DESIGN', 'BOQ', 'EXECUTION', 'HANDOVER'], default: 'EXECUTION' },
  taskName: { type: String, required: true },
  claimedCompletionPercentage: { type: Number, required: true },
  imageUrl: { type: String, required: true }, // Base64 or local path for MVP
  // Fields populated by Gemini Multimodal Audit
  auditStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'DISCREPANCY_FLAGGED'], default: 'PENDING' },
  plausibilityScore: { type: Number },
  visualProgressEstimate: { type: Number },
  discrepancyReasoning: { type: String },
  safetyHazardsDetected: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('SiteLog', siteLogSchema);
