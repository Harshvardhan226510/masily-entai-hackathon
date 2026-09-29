const SiteLog = require('../models/SiteLog');
const asyncHandler = require('express-async-handler');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const Project = require('../models/Project');

// In a real prod environment, image would be uploaded to S3. For MVP, we'll accept base64.
const auditSiteLog = asyncHandler(async (req, res) => {
  const { projectId, taskName, claimedCompletionPercentage, imageBase64 } = req.body;
  const engineerId = req.user.id;
  
  const project = await Project.findById(projectId);

  // Save log as pending
  const siteLog = await SiteLog.create({
    projectId,
    engineerId,
    projectPhase: project.status,
    taskName,
    claimedCompletionPercentage,
    imageUrl: 'base64_image_placeholder', // We won't store giant base64s in DB usually, but for hackathon keeping it simple
  });

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format the image for Gemini
    const imagePart = {
      inlineData: {
        data: imageBase64.split(',')[1] || imageBase64, // strip data:image/jpeg;base64, if present
        mimeType: "image/jpeg"
      }
    };

    const prompt = `
      You are an expert civil engineer and site auditor.
      The site engineer claims that the task "${taskName}" is ${claimedCompletionPercentage}% complete.
      Analyze the provided image of the site.
      1. Estimate the visual progress percentage.
      2. Calculate a plausibility score (0-100) on how likely their claim is true based on the visual evidence.
      3. Identify any clear discrepancy between the claim and the image. If none, leave blank.
      4. Point out any visible safety hazards.

      Return EXACTLY this JSON structure and nothing else:
      {
        "auditStatus": "VERIFIED" | "DISCREPANCY_FLAGGED",
        "plausibilityScore": 85,
        "visualProgressEstimate": 50,
        "discrepancyReasoning": "Detailed reason here if flagged, else empty",
        "safetyHazardsDetected": ["No hard hats", "Exposed wiring"]
      }
      
      Note: Use VERIFIED if the plausibilityScore is > 70.
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '');
    const auditData = JSON.parse(responseText);

    siteLog.auditStatus = auditData.auditStatus;
    siteLog.plausibilityScore = auditData.plausibilityScore;
    siteLog.visualProgressEstimate = auditData.visualProgressEstimate;
    siteLog.discrepancyReasoning = auditData.discrepancyReasoning;
    siteLog.safetyHazardsDetected = auditData.safetyHazardsDetected;

    await siteLog.save();
    res.json(siteLog);

  } catch (error) {
    console.error('Gemini API Error:', error);
    // Mark as pending or error so humans can review
    res.status(500).json({ error: 'AI Audit failed', details: error.message, siteLog });
  }
});

const getSiteLogs = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  const logs = await SiteLog.find({ 
    projectId: req.params.projectId,
    projectPhase: project.status
  })
    .sort({ createdAt: -1 })
    .populate('engineerId', 'name email');
  res.json(logs);
});

module.exports = { auditSiteLog, getSiteLogs };
