
import sys
import os

# Set up path to import dept_service
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from dept_service import get_referral, get_department
    
    print("Testing NLP Department Mapping...")
    
    test_cases = [
        ("severe chest pain", "Cardiology"),
        ("I feel very dizzy and my head hurts", "Neurology"),
        ("I can't stop vomiting", "Gastroenterology"),
        ("hard to breathe", "Pulmonology"),
        ("broke my leg", "Orthopedics"),
        ("car crash severe bleeding", "Emergency_Trauma"),
        ("skin rash all over", "Dermatology"),
        ("ear pain", "ENT"),
        ("pain when urinating", "Urology_Nephrology"),
        ("feeling very depressed", "Psychiatry"),
        ("swallowed poison", "Toxicology")
    ]
    
    passed = 0
    for complaint, expected in test_cases:
        dept = get_department(complaint)
        print(f"Complaint: '{complaint}' -> Dept: {dept} (Expected: {expected})")
        if dept == expected:
            passed += 1
        else:
            print(f"❌ MISMATCH for '{complaint}'")

    print(f"\nPassed {passed}/{len(test_cases)} tests.")

except Exception as e:
    print(f"❌ ERROR: {e}")
