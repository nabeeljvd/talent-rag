# api.py

from fastapi import FastAPI, UploadFile, File
from contextlib import asynccontextmanager
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

import tempfile
import os
import shutil

# Import from project
from app.index import (
    build_resume_index,
    build_job_index,
)

from app.main import (
    load_candidate_rag,
    ask_candidate_question,
    analyze_candidate,
    clear_all_candidates,
    load_job_rag,
    match_all_candidates,
)

from app.config import BASE_RESUME_PATH, JOB_PATH


# =========================
# FASTAPI LIFESPAN
# =========================


@asynccontextmanager
async def lifespan(app: FastAPI):

    print("🚀 Resume Matching API Started")

    # Ensure folders exist
    os.makedirs(BASE_RESUME_PATH, exist_ok=True)
    os.makedirs(JOB_PATH, exist_ok=True)

    yield

    print("🛑 API Shutdown")


app = FastAPI(title="AI Resume Matching API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# REQUEST MODEL
# =========================


class QueryRequest(BaseModel):
    question: str


# =========================
# UPLOAD RESUME
# =========================


@app.post("/upload-resume/{candidate_id}")
async def upload_resume(candidate_id: str, file: UploadFile = File(...)):

    tmp_path = None

    try:
        print(f"📥 Uploading Resume: {candidate_id}")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())

            tmp_path = tmp.name

        # Build FAISS index
        chunks = build_resume_index(tmp_path, candidate_id)

        # Load RAG
        load_candidate_rag(candidate_id, chunks)

        return {"candidate": candidate_id, "message": "Resume uploaded successfully"}

    except Exception as e:
        return {"error": str(e)}

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


# =========================
# SINGLE RESUME ANALYSIS
# =========================


@app.get("/analyze/{candidate_id}")
def analyze_resume(candidate_id: str):

    try:
        result = analyze_candidate(candidate_id)

        return {
            "candidate": candidate_id,
            "analysis": result,
        }

    except Exception as e:
        return {"error": str(e)}


# =========================
# ASK CUSTOM QUESTION
# =========================


@app.post("/ask/{candidate_id}")
def ask_candidate(candidate_id: str, query: QueryRequest):

    try:
        result = ask_candidate_question(candidate_id, query.question)

        return {
            "candidate": candidate_id,
            "answer": result,
        }

    except Exception as e:
        return {"error": str(e)}


# =========================
# UPLOAD JOB DESCRIPTION
# =========================


@app.post("/upload-job")
async def upload_job(file: UploadFile = File(...)):

    tmp_path = None

    try:
        print("📥 Uploading Job Description")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())

            tmp_path = tmp.name

        chunks = build_job_index(tmp_path)

        load_job_rag(chunks)

        return {"message": "Job description uploaded successfully"}

    except Exception as e:
        return {"error": str(e)}

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


# =========================
# MATCH + RANK CANDIDATES
# =========================


@app.get("/match-candidates")
def match_candidates():

    try:
        results = match_all_candidates()

        return {"results": results}

    except Exception as e:
        return {"error": str(e)}


# =========================
# RESET SYSTEM
# =========================


@app.delete("/reset-all")
def reset_all():

    try:
        print("🧹 Resetting System")

        # Delete Resume Folder
        if os.path.exists(BASE_RESUME_PATH):
            shutil.rmtree(BASE_RESUME_PATH)

            os.makedirs(BASE_RESUME_PATH)

        # Delete Job Folder
        if os.path.exists(JOB_PATH):
            shutil.rmtree(JOB_PATH)

            os.makedirs(JOB_PATH)

        clear_all_candidates()

        return {"message": "System reset successful"}

    except Exception as e:
        return {"error": str(e)}
