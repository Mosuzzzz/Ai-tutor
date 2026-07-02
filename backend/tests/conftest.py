import os

# ponytail: default tests to SQLite so pytest runs without a live Postgres;
# CI/devs can still override by exporting DATABASE_URL.
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")

# Force offline sandbox mode: tests must be deterministic and never call the
# live LLM API, even when backend/.env carries a real key (load_dotenv does
# not override an already-set env var).
os.environ["GROQ_API_KEY"] = ""
