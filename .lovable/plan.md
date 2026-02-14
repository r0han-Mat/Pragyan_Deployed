

# PARS - Patient Assessment & Risk Stratification

## Overview
A hospital triage system with a "Red Alert" dark theme. The React frontend runs in Lovable, connecting to Supabase for auth/database and an external FastAPI backend (hosted by you) for AI risk prediction.

---

## 1. Theme & Design System ("Red Alert")
- Dark mode with near-black background (`#0a0a0a`), dark grey cards (`#121212`), and neon red accents (`#dc2626`)
- Status colors: Red (high risk, pulsing), Yellow (medium), Green (low)
- Framer Motion animations throughout (card transitions, pulse effects, gauge animations)

## 2. Authentication (Supabase Auth)
- Dark, centered login card with email/password fields
- "Heartbeat" pulse animation on the Login button
- Sign-up flow included
- Protected routes — redirects unauthenticated users to login

## 3. Command Dashboard (3-Column Cockpit Layout)

### Column 1 — Live Triage Queue
- Real-time patient list from Supabase, auto-sorted by risk (high risk always on top)
- Color-coded risk badges with pulse animation for critical patients
- **"Live Sim" toggle**: When ON, generates a random patient every 5 seconds, sends to FastAPI for scoring, and saves to Supabase
- Click a patient to view their details

### Column 2 — Intake & Vitals Form
- Full triage form with all fields: Age, Gender, Heart Rate, Systolic/Diastolic BP, O2 Saturation, Temperature, Respiratory Rate, Pain Score, GCS Score, Arrival Mode, and medical history checkboxes (Diabetes, Hypertension, Heart Disease)
- Large glowing "ANALYZE RISK" button
- Submits to your external FastAPI `POST /predict` endpoint
- Saves patient + result to Supabase

### Column 3 — Analytics & Explainability
- Big animated Risk Score gauge (0–100%)
- "Why this score?" explanation text
- Bar chart (Recharts) showing current ER distribution (High / Medium / Low counts from Supabase)

## 4. Database (Supabase)
- **`profiles` table**: User profile linked to auth
- **`patients` table**: Stores all triaged patients with vitals, risk score, risk label, explanation text, timestamps, and the triaging user
- Row Level Security so users see patients within their session/organization

## 5. API Integration
- Configurable FastAPI base URL (environment variable / settings)
- `useTriage` hook for calling `POST /predict` and handling loading/error states
- Fallback behavior if the backend is unreachable (shows connection error, doesn't crash)

## 6. FastAPI Backend (Reference Files)
- Generated as downloadable reference files in the project (not executed by Lovable)
- **`requirements.txt`**: fastapi, uvicorn, sqlalchemy, tensorflow, scikit-learn, pandas, joblib, numpy
- **`ml_service.py`**: `TriageModel` class that loads the Keras model + preprocessor, applies hybrid guardrails (HR > 180, Systolic < 70, O2 < 85 → force high risk), and runs prediction
- **`main.py`**: FastAPI app with CORS config and `POST /predict` endpoint returning `{ risk_score, risk_label, details }`

