import os
import re
import json
import google.generativeai as genai
from pypdf import PdfReader
from io import BytesIO
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("VITE_GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("[PARS] WARNING: GEMINI_API_KEY not found in environment variables.")

def extract_text_from_pdf(file_bytes):
    """Extracts raw text from a PDF file."""
    try:
        reader = PdfReader(BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"PDF Text Extraction Error: {e}")
        return ""

def extract_vitals_from_pdf(file_bytes):
    """
    Scans a PDF for medical details using Google Gemini API.
    Returns a dictionary of structured patient data.
    """
    text = extract_text_from_pdf(file_bytes)
    if not text:
        return {}

    if not GEMINI_API_KEY:
        print("[PARS] Fallback to legacy regex parser (No API Key)")
        return extract_vitals_regex_fallback(text)

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are a medical data extraction assistant. Extract the following patient details from the provided clinical text.
        Return ONLY a raw JSON object (no markdown formatting, no code blocks) with keys matching exactly these names and types:
        
        - name: string (or "Unknown")
        - Age: integer (default 0)
        - Gender: string ("Male", "Female", "Other")
        - Heart_Rate: integer (default 75)
        - Systolic_BP: integer (default 120)
        - Diastolic_BP: integer (default 80)
        - O2_Saturation: float (default 98.0)
        - Temperature: float (default 37.0)
        - Respiratory_Rate: integer (default 16)
        - Pain_Score: integer (0-10, default 0)
        - GCS_Score: integer (3-15, default 15)
        - Diabetes: boolean
        - Hypertension: boolean
        - Heart_Disease: boolean
        - Chief_Complaint: string (summarize symptoms)
        
        If a value is not found in the text, use the default or a reasonable normal value for a healthy adult.
        
        Clinical Text:
        {text[:10000]} 
        """
        # Limit text to avoid token limits if PDF is huge

        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean up potential markdown code blocks if the model ignores the instruction
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        return json.loads(response_text)

    except Exception as e:
        print(f"Gemini Extraction Error: {e}")
        return extract_vitals_regex_fallback(text)

def extract_vitals_regex_fallback(text):
    """Legacy Regex extraction as a fallback"""
    text_lower = text.lower().replace('\n', ' ')
    extracted_data = {}

    # Basic Regex Patterns (Same as before)
    hr_match = re.search(r'(heart rate|pulse|hr)\s*[:=-]?\s*(\d{2,3})', text_lower)
    if hr_match: extracted_data['Heart_Rate'] = int(hr_match.group(2))

    bp_match = re.search(r'(bp|blood pressure)\s*[:=-]?\s*(\d{2,3})\s*[/-]\s*(\d{2,3})', text_lower)
    if bp_match: 
        extracted_data['Systolic_BP'] = int(bp_match.group(2))
        extracted_data['Diastolic_BP'] = int(bp_match.group(3))

    # ... (Keep other regexes if needed, or just return empty for now to keep it simple)
    return extracted_data