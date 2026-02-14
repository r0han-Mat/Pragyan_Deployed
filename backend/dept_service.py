import os
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer, util
import torch

# --- CONFIGURATION (Load from .env manually if needed, or hardcode for prototype) ---
# ideally use python-dotenv, but we'll parse the file from parent dir for simplicity
SUPABASE_URL = ""
SUPABASE_KEY = ""

try:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_path = os.path.join(base_dir, ".env")
    print(f"[PARS DEBUG] Looking for .env at: {env_path}")
    
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            for line in f:
                if line.startswith("VITE_SUPABASE_URL"):
                    SUPABASE_URL = line.split("=")[1].strip().strip('"')
                elif line.startswith("VITE_SUPABASE_PUBLISHABLE_KEY"):
                    SUPABASE_KEY = line.split("=")[1].strip().strip('"')
        print(f"[PARS DEBUG] Loaded SUPABASE_URL: {SUPABASE_URL}")
    else:
        print("[PARS DEBUG] .env file NOT FOUND")

except Exception as e:
    print(f"[PARS] Error loading .env: {e}")

# FALLBACK: If loading failed, use known values (Temporary Fix)
if not SUPABASE_URL:
    print("[PARS] WARNING: SUPABASE_URL not found in .env. Using hardcoded fallback.")
    SUPABASE_URL = "https://ddgvfnlsxbtggxlgsknp.supabase.co"
    SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZ3ZmbmxzeGJ0Z2d4bGdza25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjAyNDEsImV4cCI6MjA4NjYzNjI0MX0.KVvDw6qnimwvcarZ4caxYK8jiHRunPybRnXxvPDTPT4"

def get_supabase() -> Client:
    try:
        client = create_client(SUPABASE_URL, SUPABASE_KEY)
        return client
    except Exception as e:
        print(f"[PARS] Error creating Supabase client: {e}")
        return None

# --- NLP MODEL SETUP ---

# Load a compact, high-performance model (approx 80MB)
# 'all-MiniLM-L6-v2' is perfect for real-time classification
try:
    print("[PARS] Loading NLP Model 'all-MiniLM-L6-v2'...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("[PARS] NLP Model loaded successfully.")
except Exception as e:
    print(f"[PARS] WARNING: Could not load NLP model: {e}")
    model = None

# Define your departments with descriptives
# Keys must match Supabase table names (e.g. Urology_Nephrology)
DEPARTMENTS = [
    "Cardiology (Heart, Blood Pressure, Chest Pain)",
    "Neurology (Brain, Nerves, Headache, Dizziness, Stroke)",
    "Gastroenterology (Stomach, Digestion, Vomiting, Abdominal Pain)",
    "Pulmonology (Lungs, Breathing, Asthma, Cough)",
    "Orthopedics (Bones, Joints, Fractures, Muscle Pain)",
    "Emergency_Trauma (Severe Injuries, Trauma, Accident, Shock)",
    "General_Medicine (Fever, Flu, Weakness, Fatigue)",
    "Dermatology (Skin, Rashes, Itch)",
    "ENT (Ear, Nose, Throat, Sinus)",
    "Urology_Nephrology (Kidney, Bladder, Urine, UTI)",
    "Psychiatry (Mental Health, Depression, Anxiety)",
    "Toxicology (Poisoning, Overdose, Chemicals)"
]

# Pre-calculate embeddings for departments once to save compute
if model:
    try:
        DEPT_EMBEDDINGS = model.encode(DEPARTMENTS, convert_to_tensor=True)
    except Exception as e:
        print(f"[PARS] Error encoding departments: {e}")
        DEPT_EMBEDDINGS = None
else:
    DEPT_EMBEDDINGS = None


# --- DEPARTMENT MAPPING LOGIC ---

def get_department(complaint: str) -> str:
    if not complaint or len(complaint.strip()) < 3:
        return "General_Medicine"

    # Use NLP Model if available
    if model is not None and DEPT_EMBEDDINGS is not None:
        try:
            # 1. Encode the user's complaint into a vector
            complaint_embedding = model.encode(complaint, convert_to_tensor=True)
        
            # 2. Compute Cosine Similarity against all departments
            cos_scores = util.cos_sim(complaint_embedding, DEPT_EMBEDDINGS)[0]
        
            # 3. Find the index of the highest score
            best_match_idx = int(torch.argmax(cos_scores))

            # Extract the clean name (part before parenthesis)
            full_dept_name = DEPARTMENTS[best_match_idx]
            clean_name = full_dept_name.split(" (")[0].strip()
        
            return clean_name
        except Exception as e:
            print(f"[PARS] NLP Error: {e}")
            # Fallback to legacy keyword search if NLP fails
            pass
            
    # Fallback to keyword search (Legacy Logic)
    return get_department_legacy(complaint)


def get_department_legacy(complaint: str) -> str:
    """Original keyword-based matching as fallback"""
    complaint = complaint.lower()
    
    # Mapping: Key = Table Name (underscores), Value = list of keywords
    hospital_map = {
        "Cardiology": [
            "chest pain", "angina", "heart attack", "heart failure", "arrhythmia", 
            "chest tightness", "palpitations", "heart", "hypertension", "high blood pressure",
            "bp", "pulse", "tachycardia", "bradycardia", "irregular heartbeat", 
            "cardiac", "myocardial", "coronary", "valve", "atrial", "ventricular"
        ],
        "Neurology": [
            "stroke", "migraine", "vertigo", "confusion", "syncope", "dizziness", 
            "unresponsive", "headache", "blurry vision", "faint", "seizure", 
            "paralysis", "numbness", "tingling", "tremor", "slurred speech", 
            "memory loss", "coma", "concussion", "brain", "nerve", "neuropathy", 
            "epilepsy", "facial droop", "unconscious"
        ],
        "Gastroenterology": [
            "gastric", "indigestion", "abdominal", "nausea", "vomiting", "appetite", 
            "stomach", "belly", "diarrhea", "constipation", "heartburn", "reflux", 
            "acid", "bloating", "gas", "ulcer", "liver", "bowel", "stool", "blood in stool",
            "appendicitis", "cramps", "dysphagia", "swallowing difficulty", "gallbladder"
        ],
        "Pulmonology": [
            "pneumonia", "breath", "cough", "respiratory", "asthma", "chest heaviness", 
            "lung", "wheezing", "bronchitis", "shortness of breath", "dyspnea", 
            "sputum", "phlegm", "copd", "tuberculosis", "apnea", "oxygen", 
            "suffocation", "airway"
        ],
        "Orthopedics": [
            "sprain", "fracture", "bone", "joint", "back pain", "leg pain", "shoulder", 
            "knee", "arm", "swelling", "arthritis", "dislocation", "hip", "ankle", 
            "wrist", "spine", "disc", "muscle", "cramp", "strain", "tear", "ligament", 
            "tendon", "rib", "neck pain", "limp"
        ],
        "Emergency_Trauma": [
            "crash", "trauma", "fall", "injury", "severe", "shock", "overdose", 
            "accident", "bleed", "burn", "cut", "wound", "laceration", "gunshot", 
            "stab", "head injury", "electrocution", "drowning", "critical", 
            "hemorrhage", "amputation", "assault", "bite", "crush"
        ],
        "General_Medicine": [
            "fever", "flu", "fatigue", "weakness", "checkup", "edema", "dehydration", 
            "cold", "infection", "malaise", "weight loss", "chills", "sweat", "viral", 
            "bacterial", "diabetes", "sugar", "lethargy", "body ache", "sick", "shivering"
        ],
        "Dermatology": [
            "rash", "skin", "itch", "redness", "lesion", "boil", "acne", "eczema", 
            "psoriasis", "hives", "blister", "sore", "lump", "mole", "hair", "nail", 
            "infection", "allergy", "burns"
        ],
        "ENT": [
            "ear", "throat", "nose", "sinus", "hearing", "tinnitus", "ringing", 
            "deafness", "tonsil", "hoarse", "voice", "smell", "nosebleed", 
            "nasal", "congestion", "sore throat"
        ],
        "Urology_Nephrology": [
            "kidney", "urine", "urinary", "bladder", "stone", "prostate", "dialysis", 
            "uti", "burning", "blood in urine", "hematuria", "groin", "testicular", 
            "renal", "incontinence", "stream", "flank pain"
        ],
        "Psychiatry": [
            "anxiety", "depression", "suicide", "hallucination", "panic", 
            "schizophrenia", "bipolar", "stress", "insomnia", "delusion", 
            "aggressive", "behavioral", "mental", "mood", "withdrawal"
        ],
        "Toxicology": [
            "poison", "drug", "pill", "chemical", "ingestion", "venom", 
            "snake bite", "spider bite", "reaction", "alcohol", "intoxication", 
            "substance", "fume", "gas"
        ]
    }

    for department, keywords in hospital_map.items():
        if any(k in complaint for k in keywords):
            return department
            
    return "General_Medicine"

def get_referral(complaint_or_reason: str):
    """
    Determines department table and fetches doctor list.
    """
    dept_table = get_department(complaint_or_reason)
    print(f"[PARS] Determined Department: {dept_table} for compliant: '{complaint_or_reason}'")
    
    # Initialize Supabase
    supabase = get_supabase()
    doctors = []
    
    if supabase:
        try:
            # Table names in DB match the keys in hospital_map but are lowercased in Postgres
            # e.g. "Cardiology" -> "cardiology"
            response = supabase.table(dept_table.lower()).select("*").execute()
            data = response.data
            
            # Format for frontend
            for doc in data:
                doctors.append({
                    "name": doc.get("doc_name"),
                    "experience": doc.get("experience_years"),
                    "available": doc.get("is_available")
                })
        except Exception as e:
            print(f"[PARS] Supabase Query Error for {dept_table}: {e}")
            
            # Fallback mock data if DB fails
            doctors = [{"name": "Dr. House (Mock)", "experience": 10, "available": True}]
    
    return {
        "department": dept_table,
        "doctors": doctors
    }