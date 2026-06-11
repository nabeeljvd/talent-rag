# main.py

import os
import re

from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaEmbeddings, ChatOllama

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

from langchain_community.retrievers import BM25Retriever
from langchain_classic.retrievers.ensemble import EnsembleRetriever

from app.config import BASE_RESUME_PATH, EMBEDDING_MODEL, LLM_MODEL, TOP_K, FETCH_K

chains = {}
job_chain = None


# =========================
# LOAD RESUME RAG
# =========================


def load_candidate_rag(candidate_id, chunks):

    global chains

    print(f"🔄 Loading RAG for {candidate_id}")

    index_path = os.path.join(BASE_RESUME_PATH, candidate_id, "faiss_index")

    embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL)

    vs = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)

    bm25 = BM25Retriever.from_documents(chunks)
    bm25.k = TOP_K

    dense = vs.as_retriever(
        search_type="mmr", search_kwargs={"k": TOP_K, "fetch_k": FETCH_K}
    )

    hybrid = EnsembleRetriever(retrievers=[bm25, dense], weights=[0.5, 0.5])

    llm = ChatOllama(model=LLM_MODEL, temperature=0)

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "You are a professional resume analyzer."),
            ("human", "<context>\n{context}\n</context>\n\nQuestion: {question}"),
        ]
    )

    def format_docs(docs):
        return "\n\n".join([d.page_content for d in docs])

    chain = (
        {
            "context": hybrid | format_docs,
            "question": RunnablePassthrough(),
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    chains[candidate_id] = chain

    print(f"✅ Resume RAG loaded for {candidate_id}")


# =========================
# LOAD JOB RAG
# =========================


def load_job_rag(chunks):

    global job_chain

    embeddings = OllamaEmbeddings(model=EMBEDDING_MODEL)

    vs = FAISS.load_local(
        "job_description", embeddings, allow_dangerous_deserialization=True
    )

    retriever = vs.as_retriever()

    llm = ChatOllama(model=LLM_MODEL, temperature=0)

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "You analyze job descriptions."),
            ("human", "<context>\n{context}\n</context>\n\nQuestion: {question}"),
        ]
    )

    def format_docs(docs):
        return "\n\n".join([d.page_content for d in docs])

    job_chain = (
        {
            "context": retriever | format_docs,
            "question": RunnablePassthrough(),
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    print("✅ Job RAG Loaded")


# =========================
# SCORE EXTRACTION
# =========================


def extract_score(text):

    match = re.search(r"(\d{1,3})", text)

    if match:
        score = int(match.group(1))
        return min(score, 100)

    return 0


# =========================
# MATCH + RANK
# =========================


def match_all_candidates():

    global chains, job_chain

    if job_chain is None:
        return "Upload job description first."

    results = []

    job_summary = job_chain.invoke("Extract required skills and experience.")

    for candidate_id, chain in chains.items():
        match_prompt = f"""
Compare candidate resume with job.

Job Requirements:
{job_summary}

Return:

Match Score: (0-100)

Strengths:
Missing Skills:
Final Recommendation:
"""

        response = chain.invoke(match_prompt)

        score = extract_score(response)

        results.append(
            {
                "candidate": candidate_id,
                "score": score,
                "analysis": response,
            }
        )

    return sorted(results, key=lambda x: x["score"], reverse=True)


# =========================
# NEW FIXED FUNCTIONS (ADDED)
# =========================


def ask_candidate_question(candidate_id: str, question: str):

    if candidate_id not in chains:
        return "Candidate not loaded."

    return chains[candidate_id].invoke(question)


def analyze_candidate(candidate_id: str):

    if candidate_id not in chains:
        return "Candidate not loaded."

    chain = chains[candidate_id]

    prompt = "Analyze this resume in detail with strengths, weaknesses, and summary."

    return chain.invoke(prompt)


# =========================
# CLEAR MEMORY
# =========================


def clear_all_candidates():

    global chains, job_chain

    chains.clear()
    job_chain = None

    print("🧹 Memory Cleared")
