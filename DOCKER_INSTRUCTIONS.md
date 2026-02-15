# Running PARS with Docker 🐳

This project is fully containerized for easy setup and deployment.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running.

## Quick Start

1.  **Build and Run**:
    ```bash
    docker-compose up --build
    ```

2.  **Access the App**:
    - **Frontend**: [http://localhost:8081](http://localhost:8081)
    - **Backend API**: [http://localhost:8000/docs](http://localhost:8000/docs)

## Features

- **Hot Reloading**: Changes to your code in `src/` or `backend/` will automatically reload the application inside the containers.
- **Unified config**: Both services are orchestrated via `docker-compose.yml`.

## Troubleshooting

- **Ports busy?** If ports 8080 or 8000 are in use, stop your local servers (`npm run dev` or `uvicorn`) before running Docker.
- **ML Model**: Ensure your ML model files (`triage_model_nn.keras`, `preprocessor_nn.pkl`) are present in the `backend/` directory. They will be mounted automatically.
