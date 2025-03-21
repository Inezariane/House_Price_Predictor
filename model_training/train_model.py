import os
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import json

# Set random seed for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

# Paths
DATA_PATH = os.path.join(os.path.dirname(__file__), 'housing.csv')
MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), '../server/trained_models')
MODEL_JSON_PATH = os.path.join(MODEL_SAVE_PATH, 'model.json')
SCALER_PATH = os.path.join(MODEL_SAVE_PATH, 'scaler.pkl')
FEATURE_MAP_PATH = os.path.join(MODEL_SAVE_PATH, 'feature_map.json')

# Ensure directory exists
os.makedirs(MODEL_SAVE_PATH, exist_ok=True)

def load_and_preprocess_data():
    print("Loading data from", DATA_PATH)
    df = pd.read_csv(DATA_PATH)
    
    print(f"Loaded {len(df)} rows of data")
    
    # Convert boolean columns
    if 'has_garage' in df.columns:
        df['has_garage'] = df['has_garage'].map({'true': 1, 'false': 0})
    if 'has_pool' in df.columns:
        df['has_pool'] = df['has_pool'].map({'true': 1, 'false': 0})
    
    # Display data info
    print("\nData overview:")
    print(df.head())
    print("\nData info:")
    print(df.info())
    print("\nData statistics:")
    print(df.describe())
    
    # Split features and target
    X = df.drop('price', axis=1)
    y = df['price']
    
    # Create feature map for categorical variables
    feature_map = {
        'oceanProximity_map': {k: i for i, k in enumerate(df['oceanProximity'].unique())},
        'propertyType_map': {k: i for i, k in enumerate(df['propertyType'].unique())}
    }
    
    # Save feature map
    with open(FEATURE_MAP_PATH, 'w') as f:
        json.dump(feature_map, f)
    
    # Define numeric and categorical features
    numeric_features = ['squareFeet', 'bedrooms', 'bathrooms', 'yearBuilt']
    if 'lot_size' in X.columns:
        numeric_features.append('lot_size')
    
    categorical_features = ['oceanProximity', 'propertyType']
    binary_features = []
    
    if 'has_garage' in X.columns:
        binary_features.append('has_garage')
    if 'has_pool' in X.columns:
        binary_features.append('has_pool')
    
    # Create preprocessor
    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(drop='first')
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ],
        remainder='passthrough'
    )
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Fit and transform the data
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)
    
    # Save the preprocessor
    joblib.dump(preprocessor, SCALER_PATH)
    
    # Get feature names
    cat_feature_names = []
    for i, feature in enumerate(categorical_features):
        values = X[feature].unique()
        # Drop the first category (as we're using drop='first' in OneHotEncoder)
        for val in values[1:]:
            cat_feature_names.append(f"{feature}_{val}")
    
    feature_names = numeric_features + cat_feature_names + binary_features
    print("\nFeatures after preprocessing:", feature_names)
    print(f"Training data shape: {X_train_processed.shape}")
    
    return X_train_processed, X_test_processed, y_train, y_test, feature_names

def build_model(input_shape):
    model = keras.Sequential([
        keras.layers.Dense(128, activation='relu', input_shape=[input_shape]),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(64, activation='relu'),
        keras.layers.Dropout(0.2),
        keras.layers.Dense(32, activation='relu'),
        keras.layers.Dense(1)
    ])
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.0005),
        loss='mse',
        metrics=['mae']
    )
    
    return model

def train_model(model, X_train, y_train, X_test, y_test):
    # Define callbacks
    early_stopping = keras.callbacks.EarlyStopping(
        monitor='val_loss',
        patience=10,
        restore_best_weights=True
    )
    
    # Train the model
    history = model.fit(
        X_train, y_train,
        epochs=50,
        batch_size=32,
        validation_split=0.2,
        callbacks=[early_stopping],
        verbose=1
    )
    
    # Evaluate the model
    loss, mae = model.evaluate(X_test, y_test, verbose=0)
    print(f"\nTest Mean Absolute Error: ${int(mae):,}")
    print(f"Test Mean Squared Error: ${int(loss):,}")
    
    # Sample predictions
    sample_indices = np.random.choice(len(X_test), 5, replace=False)
    X_sample = X_test[sample_indices]
    y_sample = y_test.iloc[sample_indices]
    
    predictions = model.predict(X_sample)
    
    print("\nSample Predictions:")
    print("Actual\t\tPredicted")
    for actual, predicted in zip(y_sample, predictions.flatten()):
        print(f"${int(actual):,}\t${int(predicted):,}")
    
    return history

def save_model_for_tensorflow_js(model, feature_names):
    """Save the model in TensorFlow.js format"""
    # First, save the model in h5 format
    h5_path = os.path.join(MODEL_SAVE_PATH, 'keras_model.h5')
    model.save(h5_path)
    
    # Convert to TensorFlow.js format
    tfjs_path = os.path.join(MODEL_SAVE_PATH, 'tfjs_model')
    os.system(f"tensorflowjs_converter --input_format=keras {h5_path} {tfjs_path}")
    
    # Create a model metadata file
    model_metadata = {
        "features": feature_names,
        "inputShape": [len(feature_names)],
        "outputShape": [1],
        "modelVersion": "1.0.0"
    }
    
    with open(MODEL_JSON_PATH, 'w') as f:
        json.dump(model_metadata, f)
    
    print(f"\nModel saved to {tfjs_path}")
    print(f"Model metadata saved to {MODEL_JSON_PATH}")
    print(f"Preprocessor saved to {SCALER_PATH}")

def main():
    """Main training function"""
    print("Starting model training process...")
    
    # Load and preprocess data
    X_train, X_test, y_train, y_test, feature_names = load_and_preprocess_data()
    
    # Build the model
    input_shape = X_train.shape[1]
    model = build_model(input_shape)
    print(model.summary())
    
    # Train the model
    history = train_model(model, X_train, y_train, X_test, y_test)
    
    # Save the model for TensorFlow.js
    save_model_for_tensorflow_js(model, feature_names)
    
    print("\nTraining completed successfully!")

if __name__ == "__main__":
    main()
