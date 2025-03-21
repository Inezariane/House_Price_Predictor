const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const propertyRoutes = require('./routes/propertyRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/property', propertyRoutes);

// Static files - serve the trained models directory
app.use('/models', express.static(path.join(__dirname, 'trained_models')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Health check at http://localhost:${PORT}/health`);
});