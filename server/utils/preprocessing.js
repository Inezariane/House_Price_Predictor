const path = require('path');
const fs = require('fs');

// Default feature map
const defaultFeatureMap = {
  oceanProximity_map: {
    INLAND: 0,
    '<1H OCEAN': 1,
    'NEAR BAY': 2,
    'NEAR OCEAN': 3,
  },
  propertyType_map: {
    Townhouse: 0,
    Villa: 1,
    Condo: 2,
    Apartment: 3,
    House: 4,
  },
};

// Load feature map from file
let featureMap;
try {
  const featureMapPath = path.join(__dirname, '../trained_models/feature_map.json');
  if (fs.existsSync(featureMapPath)) {
    featureMap = JSON.parse(fs.readFileSync(featureMapPath, 'utf8'));
    console.log('Feature map loaded successfully:', featureMapPath);
  } else {
    console.warn('Feature map file not found. Using default feature map.');
    featureMap = defaultFeatureMap;
  }
} catch (error) {
  console.error('Error loading feature map:', error);
  console.warn('Using default feature map.');
  featureMap = defaultFeatureMap;
}

/**
 * Preprocess property data for model input based on the model trained in Python
 * @param {Object} property Property data
 * @param {Object} metadata Model metadata
 * @returns {Array} Preprocessed feature array
 */
exports.preprocessing = (property, metadata) => {
  try {
    // Extract values from property object
    const {
      squareFeet,
      bedrooms,
      bathrooms,
      oceanProximity,
      yearBuilt,
      propertyType,
      lotSize = 0,
      hasGarage = false,
      hasPool = false,
    } = property;

    // Validate required fields
    if (
      squareFeet === undefined ||
      bedrooms === undefined ||
      bathrooms === undefined ||
      oceanProximity === undefined ||
      yearBuilt === undefined ||
      propertyType === undefined
    ) {
      throw new Error('Missing required property information');
    }

    // Normalize numerical features (simple normalization for demo purposes)
    const normalizedSquareFeet = squareFeet / 3000;
    const normalizedBedrooms = bedrooms / 6;
    const normalizedBathrooms = bathrooms / 4;
    const normalizedYearBuilt = (yearBuilt - 1900) / 123;
    const normalizedLotSize = lotSize / 10000;

    // One-hot encode ocean proximity
    const oceanProximityVector = [];
    const oceanProximityMapEntries = Object.entries(featureMap.oceanProximity_map);
    const numProximities = oceanProximityMapEntries.length - 1;

    // Initialize with all zeros
    for (let i = 0; i < numProximities; i++) {
      oceanProximityVector.push(0);
    }

    // Find the ocean proximity index (skipping the reference level)
    for (const [prox, idx] of oceanProximityMapEntries) {
      if (idx > 0 && oceanProximity === prox) {
        oceanProximityVector[idx - 1] = 1;
        break;
      }
    }

    // One-hot encode property type
    const propertyTypeVector = [];
    const propertyTypeKey = propertyType.trim(); // Ensure no extra spaces
    const propertyTypeMapEntries = Object.entries(featureMap.propertyType_map);
    const numPropertyTypes = propertyTypeMapEntries.length - 1;

    // Initialize with all zeros
    for (let i = 0; i < numPropertyTypes; i++) {
      propertyTypeVector.push(0);
    }

    // Find the property type index (skipping the reference level)
    for (const [type, idx] of propertyTypeMapEntries) {
      if (idx > 0 && propertyTypeKey === type) {
        propertyTypeVector[idx - 1] = 1;
        break;
      }
    }

    // Binary features
    const garageFeature = hasGarage ? 1 : 0;
    const poolFeature = hasPool ? 1 : 0;

    // Combine all features
    const features = [
      normalizedSquareFeet,
      normalizedBedrooms,
      normalizedBathrooms,
      normalizedYearBuilt,
      normalizedLotSize,
      ...oceanProximityVector,
      ...propertyTypeVector,
      garageFeature,
      poolFeature,
    ];

    console.log('Preprocessed features:', features);

    return features;
  } catch (error) {
    console.error('Error in preprocessing:', error);
    throw new Error('Failed to preprocess property data');
  }
};