# Project Title: AI-Powered Smart Patient Triage System (Hackathon Winner)
## 1. Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Framer Motion (for smooth animations), Lucide React (icons), Recharts (for risk charts).
- **Backend:** Python FastAPI (standard for ML integration).
- **Database:** SQLite (for simplicity) using SQLAlchemy.
- **ML Engine:** Python (TensorFlow/Keras + Scikit-Learn logic).

## 2. User Flow & Experience
1.  **Login Screen:** A clean, professional medical login (email/password). Use a medical blue/white theme.
2.  **Main Dashboard (The "Command Center"):**
    -   **Top Bar:** Hospital stats (Total Patients, Avg Wait Time, Critical Cases).
    -   **Left Panel (Patient Queue):** A live-updating list of patients.
        -   *Visual:* Rows must be color-coded: Red (High Risk), Yellow (Medium), Green (Low).
        -   *Animation:* When a new High Risk patient arrives, they must "pop" in at the top with a smooth animation.
    -   **Right Panel (Triage Form):** A form to enter new patient data manually.
    -   **"Live Simulation" Button:** A prominent button in the UI. When clicked, it should simulate a random patient arriving every 3 seconds to demonstrate the queue re-ordering itself.

## 3. Database Schema (SQL)
Please set up the following SQLite database structure. Use SQLAlchemy models.

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    role VARCHAR DEFAULT 'nurse' -- 'nurse' or 'doctor'
);

CREATE TABLE patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR NOT NULL, -- Generate fake names if needed
    age INTEGER,
    gender VARCHAR,
    arrival_mode VARCHAR, -- 'Ambulance', 'Walk-in'
    chief_complaint TEXT,
    
    -- Vitals
    heart_rate INTEGER,
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    o2_saturation INTEGER,
    temperature FLOAT,
    respiratory_rate INTEGER,
    gcs_score INTEGER, -- Glasgow Coma Scale (3-15)
    pain_score INTEGER, -- 1-10
    
    -- AI Prediction Results
    risk_score FLOAT, -- 0.0 to 1.0
    risk_level VARCHAR, -- 'HIGH', 'MEDIUM', 'LOW'
    triage_action VARCHAR, -- e.g., 'Immediate ICU'
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_processed BOOLEAN DEFAULT FALSE
);
