# Talent-Rag: AI-Powered Resume Analysis & Matching System

Talent-Rag is a professional-grade Recruitment Tech (RecTech) solution that leverages **Retrieval-Augmented Generation (RAG)** to automate the process of analyzing resumes and matching candidates to job descriptions with high precision.

By combining dense vector search with sparse keyword retrieval, the system provides a nuanced understanding of a candidate's experience, moving beyond simple keyword matching to actual semantic competency analysis.

---

## 🏗️ System Architecture

### High-Level Flow
1. **Ingestion**: PDF resumes and job descriptions are uploaded via the frontend.
2. **Indexing**: The backend processes PDFs, splits them into semantic chunks, and creates local vector indices (FAISS).
3. **Hybrid Retrieval**: When a query is made, the system uses a combination of **FAISS (Dense)** and **BM25 (Sparse)** retrieval to find the most relevant context.
4. **Generation**: A Large Language Model (LLM) processes the retrieved context to generate professional analysis, scores, and recommendations.

### Detailed Component Breakdown

#### 1. Frontend (User Interface)
- **Framework**: Built with **React 19** and **Vite** for a fast, responsive experience.
- **Styling**: Implements **Tailwind CSS 4** for a modern, clean, and professional aesthetic.
- **Routing**: Uses `react-router-dom` to manage navigation between the upload dashboard and analysis views.
- **Role**: Acts as the orchestration layer, allowing recruiters to manage candidate pools and trigger matching algorithms.

#### 2. Backend (API & Orchestration)
- **Framework**: **FastAPI** provides a high-performance asynchronous REST API.
- **RAG Engine (LangChain)**:
    - **Document Processing**: `PyPDFLoader` for extraction and `RecursiveCharacterTextSplitter` for maintaining semantic context.
    - **Hybrid Search**: Implements an `EnsembleRetriever` that weights both:
        - **FAISS**: Captures semantic meaning (e.g., understanding that "Distributed Systems" is related to "Scalability").
        - **BM25**: Ensures exact keyword matches for critical certifications or specific tool names.
- **Model Integration**: Integrated with **Ollama** for local execution of Embedding models and LLMs, ensuring data privacy and low latency.

#### 3. Data Layer
- **Vector Store**: Local FAISS indices stored in the `resumes/` and `job_description/` directories.
- **State Management**: Temporary in-memory chains for active candidate sessions to ensure rapid response times.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS 4 | User Interface & UX |
| **Backend** | Python 3.11+, FastAPI | API & Business Logic |
| **LLM Framework**| LangChain | RAG Orchestration |
| **Vector DB** | FAISS | Dense Vector Storage |
| **Search** | BM25 | Sparse Keyword Retrieval |
| **Models** | Ollama (Gemma/Nomic) | LLM & Embeddings |
| **Environment** | UV, Dotenv | Dependency & Config Management |

---

## 🚀 Getting Started

### Prerequisites
- [Ollama](https://ollama.com/) installed and running.
- Python 3.11+ installed.
- Node.js installed.

### Backend Setup
1. Navigate to the root directory.
2. Install dependencies:
   ```bash
   uv sync
   ```
3. Create a `.env` file with your preferred models:
   ```env
   EMBED_MODEL=nomic-embed-text:latest
   LLM_MODEL=gemma4:31b-cloud
   ```
4. Start the server:
   ```bash
   uv run uvicorn backend.app.api:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📡 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/upload-resume/{id}` | `POST` | Uploads a PDF and builds a unique FAISS index for the candidate. |
| `/upload-job` | `POST` | Uploads a job description and builds the job RAG index. |
| `/analyze/{id}` | `GET` | Generates a detailed SWOT analysis of a specific candidate. |
| `/ask/{id}` | `POST` | Query a specific candidate's resume using RAG. |
| `/match-candidates` | `GET` | Ranks all uploaded candidates against the current job description. |
| `/reset-all` | `DELETE`| Clears all indices and memory for a fresh session. |

---

## 🎯 Matching Logic
The matching process follows a two-step pipeline:
1. **Requirement Extraction**: The Job RAG analyzes the uploaded job description to extract a structured list of "Must-have" and "Nice-to-have" skills.
2. **Candidate Comparison**: The system iterates through all indexed candidates, performing a hybrid retrieval of their resume against the extracted requirements, and assigning a score (0-100) based on LLM evaluation.
