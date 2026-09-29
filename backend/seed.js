require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const VendorQuotation = require('./models/VendorQuotation');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/entai_infra');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await User.deleteMany();
    await Project.deleteMany();
    await VendorQuotation.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const pm = await User.create({
      name: 'Priya Sharma (PM)',
      email: 'pm@entai.com',
      password,
      role: 'PROJECT_MANAGER'
    });

    const engineer = await User.create({
      name: 'Rahul Verma (Site Engineer)',
      email: 'engineer@entai.com',
      password,
      role: 'SITE_ENGINEER'
    });

    const project = await Project.create({
      name: 'Bangalore Innovation Campus - Fit-out',
      location: 'Bangalore',
      status: 'EXECUTION',
      boqStatus: 'FROZEN',
      allocatedBudget: 1830000,
      frozenCapex: 1830000,
      disbursements: [
        { amount: 150000, description: 'Initial Mobilization Advance', status: 'DISBURSED' },
        { amount: 200000, description: 'HVAC Ducting Milestone 1', status: 'DISBURSED' }
      ],
      boqItems: [
        { category: 'Civil', description: 'Drywall Partitioning', unit: 'sqft', quantity: 5000, estimatedRate: 150, totalEstimated: 750000 },
        { category: 'HVAC', description: 'Cassette AC Units', unit: 'nos', quantity: 10, estimatedRate: 60000, totalEstimated: 600000 },
        { category: 'Electrical', description: 'Wiring and Fixtures', unit: 'lumpsum', quantity: 1, estimatedRate: 400000, totalEstimated: 400000 },
        { category: 'Networking', description: 'Cat6 Cabling', unit: 'meters', quantity: 2000, estimatedRate: 40, totalEstimated: 80000 }
      ]
    });

    await VendorQuotation.insertMany([
      // HVAC Category
      {
        projectId: project._id, vendorName: 'AeroTech Climate', category: 'HVAC', brandProposed: 'Daikin',
        submittedAmount: 580000, deliveryTimelineDays: 15, paymentTerms: '50% Advance, 50% on Delivery',
        normalizedTotal: 610000, costEfficiencyScore: 88, isRecommended: true,
        metrics: { costScore: 85, speedScore: 92, qualityScore: 90, riskScore: 80 }
      },
      {
        projectId: project._id, vendorName: 'ThermaCool Systems', category: 'HVAC', brandProposed: 'Voltas',
        submittedAmount: 550000, deliveryTimelineDays: 30, paymentTerms: '30% Advance, 70% on Completion',
        normalizedTotal: 585000, costEfficiencyScore: 75, isRecommended: false,
        metrics: { costScore: 90, speedScore: 60, qualityScore: 75, riskScore: 65 }
      },
      {
        projectId: project._id, vendorName: 'Vertex HVAC Corp', category: 'HVAC', brandProposed: 'Carrier',
        submittedAmount: 610000, deliveryTimelineDays: 10, paymentTerms: '100% Advance',
        normalizedTotal: 620000, costEfficiencyScore: 70, isRecommended: false, riskFlags: ['100% Advance is high risk'],
        metrics: { costScore: 60, speedScore: 98, qualityScore: 85, riskScore: 40 }
      },
      {
        projectId: project._id, vendorName: 'BlueRidge Cooling', category: 'HVAC', brandProposed: 'LG',
        submittedAmount: 520000, deliveryTimelineDays: 45, paymentTerms: '10% Advance, 90% against PDC',
        normalizedTotal: 560000, costEfficiencyScore: 68, isRecommended: false, riskFlags: ['Slow delivery SLA', 'Complex PDC terms'],
        metrics: { costScore: 95, speedScore: 40, qualityScore: 70, riskScore: 50 }
      },
      {
        projectId: project._id, vendorName: 'Zephyr Ventilation', category: 'HVAC', brandProposed: 'Blue Star',
        submittedAmount: 595000, deliveryTimelineDays: 20, paymentTerms: '40% Advance, 60% on completion',
        normalizedTotal: 605000, costEfficiencyScore: 82, isRecommended: false,
        metrics: { costScore: 78, speedScore: 85, qualityScore: 82, riskScore: 85 }
      },
      // Networking Category
      {
        projectId: project._id, vendorName: 'CyberNet Systems', category: 'Networking', brandProposed: 'Cisco',
        submittedAmount: 85000, deliveryTimelineDays: 45, paymentTerms: '20% Advance, 80% Post-Installation',
        normalizedTotal: 88000, costEfficiencyScore: 92, isRecommended: true,
        metrics: { costScore: 82, speedScore: 75, qualityScore: 98, riskScore: 95 }
      },
      {
        projectId: project._id, vendorName: 'Nexus Techworks', category: 'Networking', brandProposed: 'Juniper',
        submittedAmount: 78000, deliveryTimelineDays: 60, paymentTerms: '50% Advance',
        normalizedTotal: 82000, costEfficiencyScore: 78, isRecommended: false, riskFlags: ['Slow delivery SLA'],
        metrics: { costScore: 88, speedScore: 50, qualityScore: 85, riskScore: 70 }
      },
      {
        projectId: project._id, vendorName: 'Aegis Networks', category: 'Networking', brandProposed: 'Aruba',
        submittedAmount: 82000, deliveryTimelineDays: 30, paymentTerms: '10% Advance',
        normalizedTotal: 84000, costEfficiencyScore: 85, isRecommended: false,
        metrics: { costScore: 75, speedScore: 85, qualityScore: 88, riskScore: 90 }
      },
      {
        projectId: project._id, vendorName: 'Vanguard IT Infrastructure', category: 'Networking', brandProposed: 'CommScope',
        submittedAmount: 91000, deliveryTimelineDays: 15, paymentTerms: '100% on completion',
        normalizedTotal: 93000, costEfficiencyScore: 80, isRecommended: false,
        metrics: { costScore: 65, speedScore: 95, qualityScore: 92, riskScore: 98 }
      },
      {
        projectId: project._id, vendorName: 'Summit Data Systems', category: 'Networking', brandProposed: 'D-Link',
        submittedAmount: 65000, deliveryTimelineDays: 25, paymentTerms: '30% Advance',
        normalizedTotal: 68000, costEfficiencyScore: 72, isRecommended: false, riskFlags: ['Lower tier enterprise brand'],
        metrics: { costScore: 98, speedScore: 80, qualityScore: 60, riskScore: 65 }
      }
    ]);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error('Error with data import', error);
    process.exit(1);
  }
};

connectDB().then(importData);
