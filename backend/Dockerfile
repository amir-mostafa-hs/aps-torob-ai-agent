# Dockerfile for Torob In-Person Assistant Backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    sqlite3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ /app/backend/

# Copy processed datasets (SQLite DB and JSON lookups)
COPY torob-dataset/processed_data/torob_agent.sqlite /app/torob-dataset/processed_data/
COPY torob-dataset/processed_data/tehran_malls_directory.json /app/torob-dataset/processed_data/
COPY torob-dataset/processed_data/tehran_bazaar_hubs_by_category.json /app/torob-dataset/processed_data/
COPY torob-dataset/processed_data/product_reviews_and_buying_guides.json /app/torob-dataset/processed_data/

ENV PYTHONPATH=/app/backend
ENV PORT=8000
ENV HOST=0.0.0.0

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/v1/health || exit 1

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
