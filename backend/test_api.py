import requests
import json

url = "http://localhost:8000/predict"
payload = {
    "Age": 30,
    "Gender": "Male",
    "Heart_Rate": 75,
    "Systolic_BP": 120,
    "Diastolic_BP": 80,
    "O2_Saturation": 98,
    "Temperature": 37.0,
    "Respiratory_Rate": 16,
    "Chief_Complaint": "snake bite",
    "Pain_Score": 0,
    "GCS_Score": 15,
    "Arrival_Mode": "Walk-in",
    "Diabetes": False,
    "Hypertension": False,
    "Heart_Disease": False
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Request failed: {e}")
