# Enterprise AI Knowledge & Upskilling Platform (Backend)

This is the FastAPI backend for the Multi-tenant B2B SaaS Enterprise AI Knowledge & Upskilling Platform.

## Core Modules & Capabilities
* **Identity SSO & JIT Provisioning**: Enforces OIDC/SAML pre-flight verification and provisions employee profiles automatically with active corporate domain checks.
* **Classroom Ingestion**: Background document pipeline to extract text, divide paragraphs, and record vector embeddings from PDFs, Word, PowerPoint, and images.
* **AI Recap Suite**: Generates structured Markdown digests in different levels (concise Executive overview vs deep field guidelines).
* **Skill-Gap Analytics Dashboard**: Tracks student streak days, aggregate department progress, and scans incorrect quiz answers to identify team knowledge gaps.
* **Strict-Grounding VPC Chatbot**: Context-restricted RAG query engine that answers questions using retrieved document facts only, appending exact citations.
* **Assessment & MCQ Generator**: Generates 4-choice quizzes from manuals with options, answers, and reasons, saved initially as draft blueprints for Trainer revisions.
* **Compliance Audit Logs**: Administrative security tracking that logs SSO logs, file actions, chatbot prompts, and submissions.

---

## Installation & Setup (using `uv`)

This project uses [uv](https://github.com/astral-sh/uv), an extremely fast Rust-based Python package manager.

### 1. Initialize Virtual Environment & Install Dependencies
First, navigate to the `backend/` directory, create a virtual environment, and install dependencies using `uv`:
```bash
cd backend
uv venv .venv
source .venv/bin/activate
uv pip install -r requirements.txt
```

### 2. Start PostgreSQL Container
Spin up the local PostgreSQL instance loaded with the `pgvector` extension using Docker Compose:
```bash
docker compose up -d
```

### 3. Launching the API Server
Ensure your `.env` contains the correct database URL (`DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/enterprise_platform`), then start the development server:
```bash
uv run python index.py
```
The server starts on [http://127.0.0.1:8000](http://127.0.0.1:8000). You can explore all API routes and schemas using the interactive Swagger documentation at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 4. Running Verification Tests
To run the automated end-to-end integration test suite against the PostgreSQL database:
```bash
uv run python test_backend.py
```
This test creates an isolated sandbox, seeds tenants/roles, uploads mock manuals, triggers ingestion, generates summaries/quizzes/chat RAG queries, scores assessments, and prints diagnostic outputs.