
import sys
import os
from sentence_transformers import util
import torch

# Set up path to import dept_service
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dept_service import get_department, model, DEPARTMENTS, DEPT_EMBEDDINGS

print("Debugging 'I feel very dizzy and my head hurts'")
complaint = "I feel very dizzy and my head hurts"

if model and DEPT_EMBEDDINGS is not None:
    complaint_embedding = model.encode(complaint, convert_to_tensor=True)
    cos_scores = util.cos_sim(complaint_embedding, DEPT_EMBEDDINGS)[0]
    
    # Print all scores
    print("\nScores:")
    for i, score in enumerate(cos_scores):
        print(f"{DEPARTMENTS[i]}: {score:.4f}")
        
    best_match_idx = int(torch.argmax(cos_scores))
    print(f"\nBest Match: {DEPARTMENTS[best_match_idx]}")
else:
    print("Model or Embeddings not loaded.")

print(f"\nResult from get_department: {get_department(complaint)}")
