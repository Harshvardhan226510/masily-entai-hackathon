const VendorQuotation = require('../models/VendorQuotation');
const asyncHandler = require('express-async-handler');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const compareQuotations = asyncHandler(async (req, res) => {
  const { projectId } = req.body;

  const quotations = await VendorQuotation.find({ projectId });
  if (!quotations || quotations.length === 0) {
    return res.status(404).json({ message: 'No quotations found for this project' });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are an expert enterprise infrastructure procurement AI for a Fortune 500 company.
    I will provide you with JSON data containing multiple vendor quotations for a project.
    Your task is to:
    1. Normalize unit rates if possible to find the true cost.
    2. Rank them by overall value (cost efficiency score 0-100).
    3. Generate detailed vector metrics (0-100) for Cost, Speed, Quality, and Risk Aversion based on the data.
    4. Flag any hidden contract risks (e.g., unusual payment terms, slow delivery, low quality brand).
    5. Recommend exactly one vendor.
    6. Write a highly professional, 2-paragraph executive summary explaining the rationale behind the recommendation and analyzing the trade-offs.
    
    Quotations data:
    ${JSON.stringify(quotations, null, 2)}
    
    Return EXACTLY this JSON structure and nothing else, no markdown formatting:
    {
      "executiveSummary": "A highly professional, 2-paragraph markdown summary explaining the rationale behind the recommendation, analyzing the trade-offs between cost, speed, and risk for the category.",
      "results": [
        {
          "quotationId": "mongo-object-id",
          "normalizedTotal": 12345,
          "costEfficiencyScore": 85,
          "metrics": {
            "costScore": 80,
            "speedScore": 60,
            "qualityScore": 90,
            "riskScore": 75
          },
          "riskFlags": ["requires 100% advance", "unknown brand"],
          "isRecommended": true
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '');
    const aiAnalysis = JSON.parse(responseText);

    for (const analysis of aiAnalysis.results) {
      await VendorQuotation.findByIdAndUpdate(analysis.quotationId, {
        normalizedTotal: analysis.normalizedTotal,
        costEfficiencyScore: analysis.costEfficiencyScore,
        metrics: analysis.metrics,
        riskFlags: analysis.riskFlags,
        isRecommended: analysis.isRecommended
      });
    }

    const updatedQuotations = await VendorQuotation.find({ projectId });
    res.json({ quotations: updatedQuotations, summary: aiAnalysis.executiveSummary });

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'AI comparison failed', details: error.message });
  }
});

const getQuotations = asyncHandler(async (req, res) => {
  const quotations = await VendorQuotation.find({ projectId: req.params.projectId });
  res.json(quotations);
});

module.exports = { compareQuotations, getQuotations };
