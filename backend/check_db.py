
import os
from supabase import create_client, Client

# Use env vars or defaults (User provided these in previous contexts? I'll assume standard vite envs available or I can peek .env if needed, but I don't have access to .env content tool directly usually, but I can Try to read it OR just use the values from source code if hardcoded. 
# actually, I see "src/integrations/supabase/client.ts" imports from env.
# I will try to read the client.ts to see if I can scrape the url/key or if I should assume local/public.
# actually, best to use the python client with the same CREDs if possible.
# Wait, I don't have the explicit CREDs in the chat context. 
# I will assume the backend `dept_service.py` or similar might have them?
# Let's check `backend/doc_parser.py` or `backend/main.py`.

import os
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    # Try to find them in a .env file in the root or backend?
    # I'll just look for a .env file.
    pass

print(f"URL: {url}, Key: {key and '***'}")
