# index.py

import os
import shutil

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaEmbeddings

from app.config import (
    BASE_RESUME_PATH,
    JOB_PATH,
    EMBEDDING_MODEL,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
)


# =========================
# BUILD RESUME INDEX
# =========================


def build_resume_index(pdf_path, candidate_id):

    print(f"🔄 Building index for {candidate_id}")

    candidate_path = os.path.join(BASE_RESUME_PATH, candidate_id)

    index_path = os.path.join(candidate_path, "faiss_index")

    os.makedirs(candidate_path, exist_ok=True)

    if os.path.exists(index_path):
        shutil.rmtree(index_path)

    loader = PyPDFLoader(pdf_path)

    docs = loader.load()

    if not docs:
        raise ValueError("No content found in PDF")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )

    chunks = splitter.split_documents(docs)

    embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL)

    vs = FAISS.from_documents(chunks, embeddings)

    vs.save_local(index_path)

    print(f"✅ Index created for {candidate_id}")

    return chunks


# =========================
# BUILD JOB INDEX
# =========================


def build_job_index(pdf_path):

    print("🔄 Building Job Description Index")

    if os.path.exists(JOB_PATH):
        shutil.rmtree(JOB_PATH)

    loader = PyPDFLoader(pdf_path)

    docs = loader.load()

    if not docs:
        raise ValueError("No content found in Job Description")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )

    chunks = splitter.split_documents(docs)

    embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL)

    vs = FAISS.from_documents(chunks, embeddings)

    vs.save_local(JOB_PATH)

    print("✅ Job index created")

    return chunks
