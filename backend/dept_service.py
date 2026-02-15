import os
import time
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer, util
import torch


# ============================================================
# ------------------- SUPABASE CONFIG ------------------------
# ============================================================

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

# Fallback (Temporary Prototype Fix)
if not SUPABASE_URL:
    print("[PARS] WARNING: Using hardcoded Supabase credentials.")
    SUPABASE_URL = "https://ddgvfnlsxbtggxlgsknp.supabase.co"
    SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZ3ZmbmxzeGJ0Z2d4bGdza25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNjAyNDEsImV4cCI6MjA4NjYzNjI0MX0.KVvDw6qnimwvcarZ4caxYK8jiHRunPybRnXxvPDTPT4"

def get_supabase() -> Client:
    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"[PARS] Error creating Supabase client: {e}")
        return None


# ============================================================
# ------------------- DEPARTMENTS ----------------------------
# ============================================================

DEPARTMENTS = [
    "Cardiology (Heart, Blood Pressure, Chest Pain)",
    "Neurology (Brain, Nerves, Headache, Stroke)",
    "Gastroenterology (Stomach, Digestion, Vomiting, Abdominal Pain)",
    "Pulmonology (Lungs, Breathing, Asthma, Cough)",
    "Orthopedics (Bones, Joints, Fractures, Muscle Pain)",
    "Emergency_Trauma (Severe Injuries, Trauma, Accident, Shock)",
    "General_Medicine (Fever, Flu, Weakness, Fatigue)",
    "Dermatology (Skin, Rashes, Itch)",
    "ENT (Ear, Nose, Throat, Sinus)",
    "Urology_Nephrology (Kidney, Bladder, Urine, UTI)",
    "Psychiatry (Mental Health, Depression, Anxiety)",
    "Toxicology (Poisoning, Overdose, Chemicals, Alcohol)"
]


# ============================================================
# ------------------- MODEL LOADING --------------------------
# ============================================================

MODEL_NAMES = [
    # "multi-qa-distilbert-cos-v1", # Too heavy
    "all-MiniLM-L6-v2",           # Lightweight & fast
    # "paraphrase-MiniLM-L6-v2"   # Redundant
]

MODELS = []
DEPT_EMBEDDINGS_MAP = {}

print("[PARS] Loading NLP Models...")

for name in MODEL_NAMES:
    try:
        model = SentenceTransformer(name)
        MODELS.append(model)
        print(f"[PARS] Loaded model: {name}")
    except Exception as e:
        print(f"[PARS] Failed loading {name}: {e}")

if not MODELS:
    print("[PARS] WARNING: No models loaded successfully.")
else:
    # Precompute department embeddings per model
    for model in MODELS:
        try:
            DEPT_EMBEDDINGS_MAP[model] = model.encode(
                DEPARTMENTS,
                convert_to_tensor=True
            )
        except Exception as e:
            print(f"[PARS] Error encoding departments for model: {e}")


# ============================================================
# -------- TIME-BASED MODEL SWITCHING (20 MIN) --------------
# ============================================================

def get_active_model():
    """
    Rotates model every 20 minutes (1200 seconds)
    """
    if not MODELS:
        return None

    current_time = int(time.time())
    index = (current_time // 1200) % len(MODELS)
    return MODELS[index]


# ============================================================
# ------------------- NLP CLASSIFICATION ---------------------
# ============================================================

def get_department(complaint: str) -> str:
    if not complaint or len(complaint.strip()) < 3:
        return "General_Medicine"

    active_model = get_active_model()

    if active_model and active_model in DEPT_EMBEDDINGS_MAP:
        try:
            complaint_embedding = active_model.encode(
                complaint,
                convert_to_tensor=True
            )

            dept_embeddings = DEPT_EMBEDDINGS_MAP[active_model]

            cos_scores = util.cos_sim(
                complaint_embedding,
                dept_embeddings
            )[0]

            best_match_idx = int(torch.argmax(cos_scores))

            full_dept_name = DEPARTMENTS[best_match_idx]
            clean_name = full_dept_name.split(" (")[0].strip()

            print(f"[PARS] Active Model Used.")

            return clean_name

        except Exception as e:
            print(f"[PARS] NLP Error: {e}")

    # Fallback to keyword logic
    return get_department_legacy(complaint)


# ============================================================
# ------------------- KEYWORD FALLBACK -----------------------
# ============================================================

def get_department_legacy(complaint: str) -> str:
    complaint = complaint.lower()

    hospital_map = {
        "Cardiology": ["chest pain", "heart", "bp", "palpitations"],
        "Neurology": ["stroke", "headache", "seizure", "paralysis"],
        "Gastroenterology": ["stomach", "vomiting", "diarrhea"],
        "Pulmonology": ["cough", "asthma", "breath"],
        "Orthopedics": ["fracture", "bone", "joint"],
        "Emergency_Trauma": ["accident", "trauma", "bleed"],
        "General_Medicine": ["fever", "flu", "fatigue"],
        "Dermatology": ["rash", "itch", "skin"],
        "ENT": ["ear", "nose", "throat"],
        "Urology_Nephrology": ["kidney", "urine", "bladder"],
        "Psychiatry": ["depression", "anxiety", "suicide"],
        "Toxicology": ["poison", "overdose", "chemical"]
    }

    for department, keywords in hospital_map.items():
        if any(k in complaint for k in keywords):
            return department

    return "General_Medicine"


# ============================================================
# ------------------- REFERRAL SYSTEM ------------------------
# ============================================================

def get_referral(complaint_or_reason: str):

    dept_table = get_department(complaint_or_reason)
    print(f"[PARS] Determined Department: {dept_table}")

    supabase = get_supabase()
    doctors = []

    if supabase:
        try:
            response = supabase.table(dept_table.lower()).select("*").execute()
            data = response.data

            for doc in data:
                doctors.append({
                    "name": doc.get("doc_name"),
                    "experience": doc.get("experience_years"),
                    "available": doc.get("is_available")
                })

        except Exception as e:
            print(f"[PARS] Supabase Query Error: {e}")
            doctors = [{
                "name": "Dr. House (Mock)",
                "experience": 10,
                "available": True
            }]

    return {
        "department": dept_table,
        "doctors": doctors
    }
