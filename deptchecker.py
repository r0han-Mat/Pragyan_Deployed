def get_department(complaint):
    complaint = complaint.lower()
    
    # basic mapping from given complaint to the present depts
    hospital_map = {
        "Cardiology": ["chest pain", "angina", "heart attack", "heart failure", "arrhythmia", "chest tightness", "palpitations"],
        "Neurology": ["stroke", "migraine", "vertigo", "confusion", "syncope", "dizziness", "unresponsive", "headache", "blurry vision"],
        "Gastroenterology": ["gastric pain", "indigestion", "abdominal pain", "nausea", "vomiting", "loss of appetite"],
        "Pulmonology": ["pneumonia", "shortness of breath", "cough", "respiratory", "asthma", "chest heaviness"],
        "Orthopedics": ["ankle sprain", "wrist pain", "joint pain", "fracture", "back pain", "leg pain", "shoulder pain"],
        "Emergency/Trauma": ["crash injury", "multi-trauma", "fall injury", "severe", "septic shock", "overdose"],
        "General Medicine": ["fever", "flu", "fatigue", "weakness", "routine checkup", "edema", "dehydration"],
        "Dermatology": ["rash", "skin"],
        "ENT": ["ear pain", "sore throat"],
        "Urology/Nephrology": ["kidney stone", "urinary pain", "catheter"],
        "Psychiatry": ["anxiety", "confusion"],
        "Toxicology": ["drug reaction", "overdose", "medication"]
    }

    # Check for matches
    for department, symptoms in hospital_map.items():
        if any(symptom in complaint for symptom in symptoms):
            return department
            
    return "General Medicine (Triage Recommended)" #when you dont get a match- unlikely since all the given key words are mapped

# usage
user_input = input("Enter your chief complaint: ") #here we'll remove this as user input and connect it w the Chief_Complaint column
result = get_department(user_input)
print(f"Assigned Department: {result}")