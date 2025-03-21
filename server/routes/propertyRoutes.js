
const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

// Route to predict house price
router.post('/predict', propertyController.predictPrice);

// Route to get price history data
router.get('/history', propertyController.getPriceHistory);

// Route to save a property prediction
router.post('/save', propertyController.saveProperty);

// Route to get all saved properties
router.get('/saved', propertyController.getSavedProperties);

module.exports = router;
