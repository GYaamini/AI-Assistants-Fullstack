# Step 1: Build the Frontend (Vite)
FROM node:22-slim AS frontend

WORKDIR /frontend

COPY frontend/ ./
RUN npm install
RUN npm run build

# Step 2: Set up Backend (Flask)
FROM python:3.11-slim AS backend

# Set working directory for backend
WORKDIR /backend

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

RUN pip install -r requirements.txt

# Step 3: Copy the built frontend to the backend container
# We copy the built frontend (from the first stage) to the backend container
COPY --from=frontend /frontend/dist /frontend

# Expose the Flask app's port
EXPOSE 10000

CMD ["uvicorn", "backend.server:app", "--host", "0.0.0.0", "--port", "10000"]
