
import os
from supabase import create_client, Client

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

# --- DEPARTMENT MAPPING LOGIC ---

def get_department(complaint: str) -> str:
    if not complaint:
        return "General_Medicine"

    complaint = complaint.lower()
    
    # Mapping: Key = Table Name (underscores), Value = list of keywords
    hospital_map = {
        "Cardiology": ["chest pain", "angina", "heart attack", "heart failure", "arrhythmia", "chest tightness", "palpitations", "heart"],
        "Neurology": ["stroke", "migraine", "vertigo", "confusion", "syncope", "dizziness", "unresponsive", "headache", "blurry vision", "faint"],
        "Gastroenterology": ["gastric", "indigestion", "abdominal", "nausea", "vomiting", "appetite", "stomach", "belly"],
        "Pulmonology": ["pneumonia", "breath", "cough", "respiratory", "asthma", "chest heaviness", "lung"],
        "Orthopedics": ["sprain", "fracture", "bone", "joint", "back pain", "leg pain", "shoulder", "knee", "arm"],
        "Emergency_Trauma": ["crash", "trauma", "fall", "injury", "severe", "shock", "overdose", "accident", "bleed"],
        "General_Medicine": ["fever", "flu", "fatigue", "weakness", "checkup", "edema", "dehydration", "cold"],
        "Dermatology": ["rash", "skin", "itch", "redness"],
        "ENT": ["ear", "throat", "nose", "sinus"],
        "Urology_Nephrology": ["kidney", "urine", "urinary", "bladder", "stone"],
        "Psychiatry": ["anxiety", "depression", "suicide", "hallucination", "panic"],
        "Toxicology": ["poison", "drug", "pill", "chemical"]
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
