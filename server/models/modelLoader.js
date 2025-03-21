
const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const fs = require('fs');

/**
 * Loads the trained TensorFlow model
 * @returns {Promise<{model: tf.LayersModel, metadata: any}>} Loaded model and metadata
 */
exports.loadModel = async () => {
  try {
    const modelDir = path.join(__dirname, '../server/trained_models');  
    const modelPath = path.join(modelDir, 'tfjs_model/model.json');    
    const metadataPath = path.join(modelDir, 'model.json');            
    // const scalerPath = path.join(modelDir, 'scaler.pkl');       
    
    // Check if model exists
    if (!fs.existsSync(modelPath)) {
      console.log('Model not found, creating a new one...');
      return createDummyModel();
    }
    
    // Load model from filesystem
    console.log(`Loading model from ${modelPath}`);
    const model = await tf.loadLayersModel(`file://${modelPath}`);
    
    // Load metadata
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    model.summary();
    return { model, metadata };
  } catch (error) {
    console.error('Error loading model:', error);
    console.log('Falling back to dummy model...');
    return createDummyModel();
  }
};

/**
 * Creates a simple dummy model for testing when trained model isn't available
 * @returns {Promise<{model: tf.LayersModel, metadata: any}>} A simple regression model and metadata
 */
async function createDummyModel() {
  console.log('Creating dummy model...');
  
  // Create a simple model for testing
  const model = tf.sequential();
  
  // Adding layers
  model.add(tf.layers.dense({
    inputShape: [15],
    units: 64,
    activation: 'relu'
  }));
  
  model.add(tf.layers.dense({
    units: 32,
    activation: 'relu'
  }));
  
  model.add(tf.layers.dense({
    units: 16,
    activation: 'relu'
  }));
  
  model.add(tf.layers.dense({
    units: 1
  }));
  
  // Compile the model
  model.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError'
  });
  
  // Create dummy metadata
  const metadata = {
    features: [
      'square_feet', 'bedrooms', 'bathrooms', 'year_built', 'lot_size', 
      'location_new york', 'location_austin', 'location_seattle', 'location_chicago',
      'property_type_condo', 'property_type_townhouse',
      'has_garage', 'has_pool'
    ],
    inputShape: [15],
    outputShape: [1],
    modelVersion: '1.0.0-dummy'
  };
  
  console.log('Dummy model created and compiled');
  model.summary();
  
  return { model, metadata };
}
