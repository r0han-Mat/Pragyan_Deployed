import sys
import os

# Ensure we can import from the current directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from ml_service import TriageModel
    print("[TEST] Importing TriageModel...")
    model = TriageModel()
    print("[TEST] ✅ Model loaded successfully.")
except Exception as e:
    print(f"[TEST] ❌ Failed to load model: {e}")
    sys.exit(1)
