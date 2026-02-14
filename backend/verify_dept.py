
import sys
import os

# Set up path to import dept_service
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from dept_service import get_referral, get_department
    
    print("Testing Department Mapping...")
    dept = get_department("severe chest pain")
    print(f"Complaint: 'severe chest pain' -> Dept: {dept}")
    assert dept == "Cardiology"
    
    print("\nTesting Supabase Connection (fetching doctors)...")
    referral = get_referral("severe chest pain")
    print(f"Referral Data: {referral}")
    
    if referral['doctors'] and len(referral['doctors']) > 0:
        print("✅ SUCCESS: Doctors fetched from Supabase.")
    else:
        print("⚠️ WARNING: No doctors found. DB might be empty or connection failed.")
        
except Exception as e:
    print(f"❌ ERROR: {e}")
