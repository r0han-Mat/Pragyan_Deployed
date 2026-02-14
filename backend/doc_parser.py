import re
from pypdf import PdfReader
from io import BytesIO

def extract_vitals_from_pdf(file_bytes):
    """
    Scans a PDF for medical keywords and extracts values using Regex.
    """
    try:
        # 1. Read PDF Text
        reader = PdfReader(BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
        # Normalize text (lowercase, remove extra spaces)
        text_lower = text.lower().replace('\n', ' ')
        
        extracted_data = {}

        # --- REGEX PATTERNS ( The "Smart" Search ) ---
        
        # 1. Heart Rate (e.g., "Heart Rate: 80", "Pulse: 100 bpm")
        hr_match = re.search(r'(heart rate|pulse|hr)\s*[:=-]?\s*(\d{2,3})', text_lower)
        if hr_match:
            extracted_data['Heart_Rate'] = int(hr_match.group(2))

        # 2. Blood Pressure (e.g., "BP: 120/80", "120 / 80 mmHg")
        bp_match = re.search(r'(bp|blood pressure)\s*[:=-]?\s*(\d{2,3})\s*[/-]\s*(\d{2,3})', text_lower)
        if bp_match:
            extracted_data['Systolic_BP'] = int(bp_match.group(2))
            extracted_data['Diastolic_BP'] = int(bp_match.group(3))

        # 3. Oxygen Saturation (e.g., "SpO2: 98%", "O2: 99")
        o2_match = re.search(r'(spo2|o2|saturation)\s*[:=-]?\s*(\d{2,3})', text_lower)
        if o2_match:
            extracted_data['O2_Saturation'] = int(o2_match.group(2))

        # 4. Temperature (e.g., "Temp: 37.5", "T: 98.6")
        temp_match = re.search(r'(temp|temperature|t)\s*[:=-]?\s*(\d{2,3}(\.\d)?)', text_lower)
        if temp_match:
            extracted_data['Temp'] = float(temp_match.group(2))

        # 5. Age (e.g., "Age: 45", "45 yo")
        age_match = re.search(r'(age)\s*[:=-]?\s*(\d{2,3})', text_lower)
        if age_match:
            extracted_data['Age'] = int(age_match.group(2))
            
        return extracted_data

    except Exception as e:
        print(f"Parsing Error: {e}")
        return {}