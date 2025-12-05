from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
import pickle
import os
import logging

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for model and encoders
model = None
label_encoders = {}
scaler = None

class RentPredictionModel:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.feature_columns = [
            'distanceFromCollege', 'roomSize', 'facilitiesCount', 
            'furnishing_encoded', 'roomType_encoded', 'city_encoded'
        ]
        
    def prepare_sample_data(self):
        """Generate sample training data for demonstration"""
        np.random.seed(42)
        
        cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad']
        room_types = ['Single', 'Double', 'Triple', 'Shared', 'Dormitory']
        furnishing_types = ['Fully Furnished', 'Semi Furnished', 'Unfurnished']
        
        n_samples = 1000
        data = []
        
        for _ in range(n_samples):
            city = np.random.choice(cities)
            room_type = np.random.choice(room_types)
            furnishing = np.random.choice(furnishing_types)
            
            # Base prices vary by city
            city_base_prices = {
                'Mumbai': 8000, 'Delhi': 7000, 'Bangalore': 6500,
                'Chennai': 5500, 'Kolkata': 4500, 'Pune': 6000, 'Hyderabad': 5500
            }
            
            base_price = city_base_prices[city]
            distance = np.random.uniform(0.5, 15.0)  # Distance in km
            room_size = np.random.randint(80, 300)  # Room size in sq ft
            facilities_count = np.random.randint(3, 12)  # Number of facilities
            
            # Calculate rent based on features
            rent = base_price
            
            # Distance factor (closer to college = higher rent)
            rent += max(0, (5 - distance) * 200)
            
            # Room size factor
            rent += (room_size - 150) * 5
            
            # Facilities factor
            rent += facilities_count * 150
            
            # Room type factor
            room_type_multiplier = {
                'Single': 1.3, 'Double': 1.0, 'Triple': 0.8, 
                'Shared': 0.7, 'Dormitory': 0.6
            }
            rent *= room_type_multiplier[room_type]
            
            # Furnishing factor
            furnishing_multiplier = {
                'Fully Furnished': 1.2, 'Semi Furnished': 1.0, 'Unfurnished': 0.8
            }
            rent *= furnishing_multiplier[furnishing]
            
            # Add some random variation
            rent += np.random.normal(0, rent * 0.1)
            rent = max(2000, int(rent))  # Minimum rent of 2000
            
            data.append({
                'distanceFromCollege': distance,
                'roomSize': room_size,
                'facilitiesCount': facilities_count,
                'furnishing': furnishing,
                'roomType': room_type,
                'city': city,
                'rent': rent
            })
        
        return pd.DataFrame(data)
    
    def train(self, df=None):
        """Train the model with sample data"""
        if df is None:
            df = self.prepare_sample_data()
        
        logger.info(f"Training model with {len(df)} samples")
        
        # Encode categorical variables
        categorical_columns = ['furnishing', 'roomType', 'city']
        for col in categorical_columns:
            le = LabelEncoder()
            df[f'{col}_encoded'] = le.fit_transform(df[col])
            self.label_encoders[col] = le
        
        # Prepare features and target
        X = df[self.feature_columns]
        y = df['rent']
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled, y)
        
        # Calculate model performance
        train_score = self.model.score(X_scaled, y)
        logger.info(f"Model training completed. R² score: {train_score:.3f}")
        
        return train_score
    
    def predict(self, features):
        """Predict rent for given features"""
        try:
            # Create feature vector
            feature_vector = np.array([
                features['distanceFromCollege'],
                features['roomSize'],
                features['facilitiesCount'],
                self.label_encoders['furnishing'].transform([features['furnishing']])[0],
                self.label_encoders['roomType'].transform([features['roomType']])[0],
                self.label_encoders['city'].transform([features['city']])[0]
            ]).reshape(1, -1)
            
            # Scale features
            feature_vector_scaled = self.scaler.transform(feature_vector)
            
            # Make prediction
            prediction = self.model.predict(feature_vector_scaled)[0]
            return max(1000, int(prediction))  # Minimum rent of 1000
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            # Fallback calculation
            return self.fallback_prediction(features)
    
    def fallback_prediction(self, features):
        """Simple fallback calculation if ML prediction fails"""
        base_rent = 5000
        
        # Distance factor
        if features['distanceFromCollege'] <= 2:
            base_rent += 2000
        elif features['distanceFromCollege'] <= 5:
            base_rent += 1000
        
        # Room size factor
        base_rent += (features['roomSize'] - 150) * 3
        
        # Facilities factor
        base_rent += features['facilitiesCount'] * 100
        
        # Room type factor
        room_multipliers = {
            'Single': 1.3, 'Double': 1.0, 'Triple': 0.8,
            'Shared': 0.7, 'Dormitory': 0.6
        }
        base_rent *= room_multipliers.get(features['roomType'], 1.0)
        
        # Furnishing factor
        furnishing_multipliers = {
            'Fully Furnished': 1.2, 'Semi Furnished': 1.0, 'Unfurnished': 0.8
        }
        base_rent *= furnishing_multipliers.get(features['furnishing'], 1.0)
        
        return max(1000, int(base_rent))

# Initialize model
rent_model = RentPredictionModel()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Student Helper AI Service',
        'version': '1.0.0'
    })

@app.route('/train', methods=['POST'])
def train_model():
    """Train the model with sample data"""
    try:
        score = rent_model.train()
        return jsonify({
            'success': True,
            'message': 'Model trained successfully',
            'r2_score': score
        })
    except Exception as e:
        logger.error(f"Training error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Training failed: {str(e)}'
        }), 500

@app.route('/predict-rent', methods=['POST'])
def predict_rent():
    """Predict rent based on hostel features"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = [
            'distanceFromCollege', 'roomSize', 'facilitiesCount',
            'furnishing', 'roomType', 'city'
        ]
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                'success': False,
                'message': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Make ML prediction
        base_prediction = rent_model.predict(data)
        adjusted = float(base_prediction)
        
        # Optional post-adjustments based on extra factors
        breakdown = {
            'base_prediction': int(base_prediction),
            'multipliers': {}
        }
        
        floor = int(data.get('floor', 0) or 0)
        if floor > 1:
            m = max(0.6, 1 - 0.02 * (floor - 1))
            adjusted *= m
            breakdown['multipliers']['floor'] = m
        
        owner_on_site = bool(data.get('ownerOnSite') or data.get('owner_on_site') or False)
        if owner_on_site:
            adjusted *= 0.97
            breakdown['multipliers']['ownerOnSite'] = 0.97
        
        total_rooms = int(data.get('totalRooms', data.get('total_rooms', 0)) or 0)
        if total_rooms:
            if total_rooms <= 10:
                adjusted *= 1.04
                breakdown['multipliers']['totalRooms'] = 1.04
            elif total_rooms >= 40:
                adjusted *= 0.95
                breakdown['multipliers']['totalRooms'] = 0.95
        
        # Clamp and round
        adjusted = max(1000, min(50000, adjusted))
        adjusted = int(round(adjusted))
        
        # Calculate confidence based on feature reasonableness
        confidence = calculate_confidence(data)
        
        return jsonify({
            'success': True,
            'predictedRent': adjusted,
            'confidence': confidence,
            'features_used': {
                'distance': data['distanceFromCollege'],
                'room_size': data['roomSize'],
                'facilities': data['facilitiesCount'],
                'furnishing': data['furnishing'],
                'room_type': data['roomType'],
                'city': data['city']
            },
            'breakdown': breakdown
        })
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Prediction failed: {str(e)}'
        }), 500

def calculate_confidence(features):
    """Calculate prediction confidence based on feature values"""
    confidence = 1.0
    
    # Distance factor
    if features['distanceFromCollege'] > 20:
        confidence *= 0.8
    
    # Room size factor
    if features['roomSize'] < 50 or features['roomSize'] > 500:
        confidence *= 0.7
    
    # Facilities factor
    if features['facilitiesCount'] > 15:
        confidence *= 0.9
    
    return round(confidence, 2)

@app.route('/model-info', methods=['GET'])
def get_model_info():
    """Get information about the trained model"""
    try:
        return jsonify({
            'success': True,
            'model_type': 'Random Forest Regressor',
            'features': rent_model.feature_columns,
            'categorical_encoders': list(rent_model.label_encoders.keys()),
            'trained': hasattr(rent_model.model, 'feature_importances_')
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

if __name__ == '__main__':
    # Train the model on startup
    try:
        logger.info("Training model on startup...")
        rent_model.train()
        logger.info("Model training completed successfully")
    except Exception as e:
        logger.error(f"Failed to train model on startup: {str(e)}")
    
    # Start the Flask application
    app.run(host='0.0.0.0', port=8000, debug=True)