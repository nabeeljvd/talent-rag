# config.py

import os
from dotenv import load_dotenv

# Load .env
load_dotenv()


# =========================
# PATHS
# =========================

BASE_RESUME_PATH = "resumes"
JOB_PATH = "job_description"


# =========================
# MODELS
# =========================

EMBEDDING_MODEL = os.getenv("EMBED_MODEL", "nomic-embed-text:latest")

LLM_MODEL = os.getenv("LLM_MODEL", "gemma4:31b-cloud")


# =========================
# CHUNK SETTINGS
# =========================

CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 500))

CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", 75))


# =========================
# RETRIEVAL SETTINGS
# =========================

TOP_K = int(os.getenv("TOP_K", 4))

FETCH_K = int(os.getenv("FETCH_K", 10))
