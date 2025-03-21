const path = require('path');
const tf = require('@tensorflow/tfjs-node');
const { preprocessing } = require('../utils/preprocessing');
const { loadModel } = require('../models/modelLoader');

let modelData = { model: null, metadata: null };

// Load model when server starts
(async () => {
  try {
    modelData = await loadModel();
    console.log('Model loaded successfully');
  } catch (error) {
    console.error('Failed to load model:', error);
  }
})();

// Controller for predicting house prices
exports.predictPrice = async (req, res) => {
  try {
    const {
      squareFeet,
      bedrooms,
      bathrooms,
      oceanProximity,
      yearBuilt,
      propertyType,
      lotSize,
      hasGarage,
      hasPool,
    } = req.body;

    // Validate input
    if (!squareFeet || !bedrooms || !bathrooms || !oceanProximity || !yearBuilt || !propertyType) {
      return res.status(400).json({ error: 'Missing required property information' });
    }

    // Check if model is loaded
    if (!modelData.model) {
      modelData = await loadModel();
    }

    // Preprocess input data
    const processedData = preprocessing(
      {
        squareFeet,
        bedrooms,
        bathrooms,
        oceanProximity,
        yearBuilt,
        propertyType,
        lotSize,
        hasGarage,
        hasPool,
      },
      modelData.metadata
    );

    // Convert to tensor
    const inputTensor = tf.tensor2d([processedData]);

    // Make prediction
    const prediction = await modelData.model.predict(inputTensor);
    const predictedPrice = prediction.dataSync()[0];

    // Cleanup
    inputTensor.dispose();
    prediction.dispose();

    return res.status(200).json({
      predictedPrice: Math.round(predictedPrice),
      confidence: 0.85, // Placeholder - would be calculated from model in production
      comparableProperties: generateComparableProperties(predictedPrice, oceanProximity),
    });
  } catch (error) {
    console.error('Prediction error:', error);
    return res.status(500).json({ error: 'An error occurred during prediction' });
  }
};

// Controller for getting price history
exports.getPriceHistory = async (req, res) => {
  try {
    const { oceanProximity } = req.query;

    if (!oceanProximity) {
      return res.status(400).json({ error: 'Ocean proximity is required' });
    }

    const priceHistoryData = generatePriceHistoryData(oceanProximity);
    return res.status(200).json({ priceHistory: priceHistoryData });
  } catch (error) {
    console.error('Error fetching price history:', error);
    return res.status(500).json({ error: 'Failed to retrieve price history' });
  }
};

// Controller for saving a property
exports.saveProperty = async (req, res) => {
  try {
    const { propertyData, predictedPrice } = req.body;

    // In a real application, you would save the property to a database
    console.log('Property saved:', { propertyData, predictedPrice });
    return res.status(200).json({ message: 'Property saved successfully' });
  } catch (error) {
    console.error('Error saving property:', error);
    return res.status(500).json({ error: 'Failed to save property' });
  }
};

// Controller for getting saved properties
exports.getSavedProperties = async (req, res) => {
  try {
    // In a real application, you would retrieve the properties from a database
    const savedProperties = [
      { id: 1, address: '123 Main St', price: 550000 },
      { id: 2, address: '456 Oak Ave', price: 720000 },
    ];
    return res.status(200).json({ savedProperties });
  } catch (error) {
    console.error('Error getting saved properties:', error);
    return res.status(500).json({ error: 'Failed to retrieve saved properties' });
  }
};

// Helper function to generate comparable properties
function generateComparableProperties(basePrice, oceanProximity) {
  const comparableProperties = [];
  const priceRange = 0.1; // 10% above and below the base price
  const minPrice = basePrice * (1 - priceRange);
  const maxPrice = basePrice * (1 + priceRange);

  // Generate a few sample comparable properties
  for (let i = 0; i < 3; i++) {
    const randomPrice = Math.random() * (maxPrice - minPrice) + minPrice;
    comparableProperties.push({
      address: `${Math.floor(Math.random() * 1000)} Random St, (${oceanProximity})`,
      price: Math.round(randomPrice),
      bedrooms: Math.floor(Math.random() * 5) + 2,
      bathrooms: Math.floor(Math.random() * 3) + 2,
      squareFeet: Math.floor(Math.random() * 500) + 1500,
    });
  }

  return comparableProperties;
}

// Helper function to generate price history data
function generatePriceHistoryData(oceanProximity) {
  const priceHistory = [];
  const currentDate = new Date();

  // Base price varies by ocean proximity
  let basePrice = 500000;

  switch (oceanProximity) {
    case 'NEAR BAY':
      basePrice = 800000;
      break;
    case 'NEAR OCEAN':
      basePrice = 900000;
      break;
    case '<1H OCEAN':
      basePrice = 500000;
      break;
    case 'INLAND':
      basePrice = 350000;
      break;
  }

  // Generate price data for the last 12 months
  for (let i = 11; i >= 0; i--) {
    const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const price = basePrice + i * 5000 + Math.random() * 20000; // Base price + trend + random fluctuation
    priceHistory.push({
      month: month.toISOString().slice(0, 7), // YYYY-MM
      averagePrice: Math.round(price),
    });
  }

  return priceHistory;
}