FROM python:3.12-slim
WORKDIR /srv/ajo
COPY pyproject.toml README.md ./
COPY backend ./backend
COPY frontend/public ./frontend/public
COPY migrations ./migrations
COPY alembic.ini ./
RUN pip install --no-cache-dir . && useradd --create-home ajo && mkdir /data && chown ajo:ajo /data
USER ajo
ENV AJO_FRONTEND_ASSETS=/srv/ajo/frontend/public/assets PYTHONPATH=/srv/ajo/backend AJO_PLATFORM_DATABASE_URL=sqlite:////data/ajo-platform.db AJO_DATA_DIR=/data/secrets
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
