# Stage 1: Dependency Builder
FROM python:3.12-slim AS builder

WORKDIR /app

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Stage 2: Minimal Runtime Image
FROM python:3.12-slim AS runner

WORKDIR /app

ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Copy compiled virtualenv from builder
COPY --from=builder /opt/venv /opt/venv

# Copy source code
COPY src/ ./src/

# Security: Run as unprivileged user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
