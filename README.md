
# HomeValueAI

HomeValueAI is a comprehensive property valuation application that uses machine learning to predict house prices based on various property features and location data.

## Features

- 🏠 AI-powered property price prediction
- 📱 Responsive design for all devices
- 🔒 Modern and intuitive user interface

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS
- shadcn/ui component library
- React Router for navigation

### Backend
- Node.js with Express
- TensorFlow.js for model inference
- RESTful API architecture

### Machine Learning
- Python with TensorFlow for model training
- scikit-learn for data preprocessing
- Model conversion to TensorFlow.js format

## Getting Started


## Prerequisites

- Node.js (v14 or later) for the Frontend and Backend
- Python (v3.8 or later) for Model Training
- npm or yarn
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd home-value-ai
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at http://localhost:5173

### 3. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start development server
npm run dev
```

The API server will be available at http://localhost:5000

### 4. Model Training (Python)

If you want to train the model with your own data:

1. Set up a Python environment
```bash
# Navigate to model_training directory
cd model_training

# Create a virtual environment (optional but recommended)
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

2. Prepare your data:
   - Replace the sample data in `model_training/data/housing_data_sample.csv` with your real dataset
   - Rename it to `housing_data.csv`

3. Run the training script:
```bash
python train_model.py
```

This will:
- Load and preprocess your housing data
- Train a TensorFlow model
- Convert the model to TensorFlow.js format
- Save the model to the server's directory

## Integration Workflow

1. **Data Collection**: Gather housing price data and save it as a CSV file in the `model_training/data` directory.

2. **Model Training**: Use the Python script to train the model based on your data.

3. **Backend Integration**: The Node.js backend will automatically load the trained model and use it for predictions.

4. **Frontend Usage**: The frontend app will communicate with the backend API to get price predictions.

## Development Notes

- **Model Updates**: Whenever you train a new model, the backend will automatically load the latest version.

- **API Testing**: You can test the API endpoints using tools like Postman or curl.

- **Environment Variables**: In production, consider using environment variables for API URLs and other configurations.

## Deployment

For production deployment:

1. Build the frontend:
```bash
npm run build
```

2. Deploy the backend and frontend to your preferred hosting service.

3. Ensure that the model files are included in your backend deployment.
