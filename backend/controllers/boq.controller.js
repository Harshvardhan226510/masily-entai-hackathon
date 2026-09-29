const Project = require('../models/Project');
const asyncHandler = require('express-async-handler');

// Get first project (For MVP)
const getFirstProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne();
  if (!project) {
    res.status(404);
    throw new Error('No project found');
  }
  res.json(project);
});

// Get project BOQ status
const getProjectBoq = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  res.json(project);
});

// Freeze BOQ
const freezeBoq = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  
  if (project.boqStatus === 'FROZEN') {
    res.status(400);
    throw new Error('BOQ is already frozen');
  }

  const totalCapex = project.boqItems.reduce((acc, item) => acc + item.totalEstimated, 0);
  
  project.boqStatus = 'FROZEN';
  project.allocatedBudget = totalCapex;
  project.frozenCapex = totalCapex;
  await project.save();

  res.json({ message: 'BOQ Frozen successfully', project });
});

// Programmatic disbursement validation
const disbursePayment = asyncHandler(async (req, res) => {
  const { projectId, amount, description } = req.body;
  
  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.boqStatus !== 'FROZEN') {
    res.status(400);
    throw new Error('Cannot disburse payments before BOQ is FROZEN');
  }

  const totalDisbursed = project.disbursements.reduce((acc, d) => acc + d.amount, 0);
  const remainingBudget = project.frozenCapex - totalDisbursed;

  if (amount > remainingBudget) {
    res.status(400).json({ 
      error: 'BUDGET_CEILING_BREACHED', 
      message: `Requested amount (${amount}) exceeds remaining frozen budget (${remainingBudget})` 
    });
    return;
  }

  project.disbursements.push({
    amount,
    description,
    status: 'DISBURSED'
  });

  await project.save();
  res.json({ message: 'Payment disbursed successfully', project });
});

// Update Project Phase
const updateProjectStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const project = await Project.findById(req.params.id);
  
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Validate status
  const validStatuses = ['SCOUTING', 'DESIGN', 'BOQ', 'EXECUTION', 'HANDOVER'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  project.status = status;
  await project.save();

  res.json({ message: 'Project phase updated successfully', project });
});

module.exports = { getProjectBoq, freezeBoq, disbursePayment, getFirstProject, updateProjectStatus };
