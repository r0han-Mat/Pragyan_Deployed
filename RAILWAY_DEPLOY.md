# Deploying to Railway 🚂

Follow these steps to deploy your full-stack application to Railway.app.

## Prerequisites

1.  A [Railway](https://railway.app/) account.
2.  Your code pushed to a [GitHub repository](https://github.com/).

## Step 1: Push to GitHub

If you haven't already, commit and push your code to a new GitHub repository.
```bash
git init
git add .
git commit -m "Initial commit with Docker config"
git branch -M main
# Add your remote
# git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
# git push -u origin main
```

## Step 2: Create Project on Railway

1.  Log in to Railway.
2.  Click **"New Project"** -> **"Deploy from GitHub repo"**.
3.  Select your repository.
4.  Click **"Add Variables"** later, for now just let it set up.

## Step 3: Configure Services

Railway handles "Monorepos" (multiple apps in one repo) by creating distinct services. You need two services:

### Service 1: Backend (Python API)
1.  Click on the service that was created.
2.  Go to **Settings** -> **Root Directory**.
3.  Change it to `/backend`.
4.  Railway should automatically detect the `Dockerfile` inside `backend/`.
5.  **Variables**: Add any env vars from your `.env` file (e.g., `SUPABASE_URL`, `SUPABASE_KEY`).
6.  Railway automatically assigns a `PORT` and our code now listens to it.

### Service 2: Frontend (React App)
1.  Go back to the project view (graph).
2.  Click **"New"** -> **"GitHub Repo"** -> Select the **same repository again**.
3.  This creates a second service linked to the same code.
4.  Go to **Settings** -> **Root Directory**.
5.  Ensure it is `/` (root) or just empty.
6.  Railway should detect the `Dockerfile` in the root.
7.  **Networking**: Go to **Settings** -> **Networking** -> **Generate Domain** to get a public URL (e.g., `web-production.up.railway.app`).

## Step 4: Connect Them

1.  Get the **Public URL** of your **Backend Service** (from its Settings -> Networking).
2.  Go to your **Frontend Service** -> **Variables**.
3.  Add `VITE_BACKEND_URL` and paste the Backend URL (e.g., `https://backend-production.up.railway.app`).
4.  Redeploy the Frontend service.

## Done! 🚀

Your app should now be live.
- Frontend: Your generated Frontend URL.
- Backend: Your generated Backend URL.
