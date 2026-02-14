import pandas as pd
import numpy as np
import tensorflow as tf
import joblib
import os

# Suppress TensorFlow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# 1. LOAD ASSETS
print("📂 Loading model and preprocessor...")

try:
    # Load the Scikit-Learn Preprocessor (for scaling)
    preprocessor = joblib.load('preprocessor_nn.pkl')
    
    # Load the Keras Neural Network (for prediction)
    model = tf.keras.models.load_model('triage_model_nn.keras')
    print("✅ Assets loaded successfully.")
except Exception as e:
    print(f"❌ Error loading files: {e}")
    print("Please make sure you ran 'train_nn.py' first.")
    exit()

# 2. DEFINE THE TEST PATIENT
# Scenario: Extreme Heart Rate (220) but other vitals might be confusing the model
new_patient = {
    'Age': 52,                  # Middle-aged
    'Gender': 'Female',
    'BMI': 29.5,
    'Heart_Rate': 112,          # Tachycardia (Elevated, but safe from override)
    'Systolic_BP': 155,         # Hypertensive (High, but stable)
    'Diastolic_BP': 95,
    'O2_Saturation': 94,        # Mild Hypoxia (Needs oxygen, but not ICU)
    'Temp': 38.6,               # Significant Fever
    'Respiratory_Rate': 24,     # Breathing fast
    'Pain_Score': 6,            # Moderate Pain
    'GCS_Score': 15,            # Fully Alert (Crucial for Medium)
    'History_Diabetes': 1,
    'History_Hypertension': 1,
    'History_Heart_Disease': 0,
    'Arrival_Mode': 'Walk-in',  # Walk-ins are usually lower risk than Ambulance
}

# 3. PREPROCESS
print("\n🔎 Processing new patient...")
input_df = pd.DataFrame([new_patient])

# --- FIX 1: Handle Column Naming ---
if 'Temperature' in input_df.columns:
    input_df = input_df.rename(columns={'Temperature': 'Temp'})

# --- FIX 2: Add the Missing Dummy Column ---
# The model expects this because it was in the training CSV
input_df['Unnamed: 0'] = 0 

try:
    # Scale/Encode the data
    input_transformed = preprocessor.transform(input_df)
except Exception as e:
    print(f"⚠️ Preprocessing Error: {e}")
    print("Double check your column names match the CSV exactly.")
    exit()

# ==============================================================================
# 4. PREDICT WITH SAFETY GUARDRAILS
# ==============================================================================

# --- STEP A: AI PREDICTION ---
# The NN outputs a number between 0.0 and 1.0
try:
    ai_risk_score = model.predict(input_transformed, verbose=0)[0][0]
except Exception as e:
    print(f"Prediction Error: {e}")
    exit()

# --- STEP B: RULE-BASED SAFETY OVERRIDE ---
# This forces the model to respect critical "Death Zone" values
forced_reason = None

# Critical Thresholds (ESI Level 1 Logic)
if input_df['Heart_Rate'].values[0] > 180:
    forced_reason = "Critical Tachycardia (>180 BPM)"
elif input_df['Heart_Rate'].values[0] < 40:
    forced_reason = "Critical Bradycardia (<40 BPM)"
elif input_df['Systolic_BP'].values[0] < 70:
    forced_reason = "Severe Hypotension / Shock (<70 mmHg)"
elif input_df['O2_Saturation'].values[0] < 85:
    forced_reason = "Critical Hypoxia (<85%)"
elif input_df['GCS_Score'].values[0] <= 8:
    forced_reason = "Unconscious / Coma (GCS <= 8)"

# --- STEP C: FINALIZE RESULT ---
if forced_reason:
    final_score = 0.99
    risk_level = "HIGH"
    action = "Immediate Resuscitation / ICU"
    color = "🔴"
    note = f"⚠️ SAFETY OVERRIDE: {forced_reason}"
else:
    final_score = ai_risk_score
    note = "✅ AI Prediction"
    
    # Standard Mapping
    if final_score >= 0.75:
        risk_level = "HIGH"
        action = "Immediate Resuscitation / ICU"
        color = "🔴"
    elif final_score >= 0.40:
        risk_level = "MEDIUM"
        action = "Urgent Care / Observation"
        color = "🟡"
    else:
        risk_level = "LOW"
        action = "General Ward / Discharge"
        color = "🟢"

# 5. OUTPUT
print("-" * 40)
print(f"🎯 RISK SCORE: {final_score:.4f} ({note})")
print(f"{color} LEVEL:      {risk_level}")
print(f"📋 ACTION:     {action}")
print("-" * 40)