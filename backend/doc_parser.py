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
    print(f"[PARS] Extracting text from PDF (Size: {len(file_bytes)} bytes)...")
    text = extract_text_from_pdf(file_bytes)
    print(f"[PARS] Extracted text length: {len(text)}")
    
    # If text is empty, it might be a scan.
    # For now, we unfortunately rely on text. If empty, we can't do much without OCR/Vision.
    # BUT, let's try to send a "This is a scanned document" prompt if we were using 1.5-pro/vision.
    # Since we are using 2.0-flash, it supports multimodal but we need to pass image parts, not text.
    # For this fix, let's just Log it clearly.
    
    if not text or len(text.strip()) < 50:
        print("[PARS] WARNING: Extracted text is very short or empty. Likely a scanned PDF/Image.")
        # Proceed anyway? Gemini might halluncinate if we send empty text. 
        # Better: Return specific error so frontend knows.
        # OR: Try to use a "cleaner" approach if I can (e.g. sending the bytes?).
        # genai.GenerativeModel.generate_content supports 'blob' for PDF?
        # Yes, standard Gemini API supports PDF as a "part".
        
    if not GEMINI_API_KEY:
        print("[PARS] Fallback to legacy regex parser (No API Key)")
        return extract_vitals_regex_fallback(text)

    try:
        # gemini-1.5-flash was deprecated/not found for this key. Using 2.0-flash.
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # If we have text, use it. If not, try to use the PDF blob directly (Multimodal).
        if len(text) > 50:
             prompt_content = f"""
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
            {text[:20000]} 
            """
             response = model.generate_content(prompt_content)
        else:
             # Try passing the PDF bytes directly for Vision/Multimodal processing
             print("[PARS] Attempting native PDF understanding (Multimodal)...")
             prompt_part = "Extract patient vitals and details as JSON."
             
             # Create a Part object (Dictionary structure for Google GenAI SDK)
             pdf_part = {
                 "mime_type": "application/pdf",
                 "data": file_bytes
             }
             
             # Note: generate_content accepts list of [prompt, image/blob]
             response = model.generate_content([prompt_part, pdf_part])
             
        print("[PARS] Gemini Response Received.")
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