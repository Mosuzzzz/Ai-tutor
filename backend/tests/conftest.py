import os

# ponytail: default tests to SQLite so pytest runs without a live Postgres;
# CI/devs can still override by exporting DATABASE_URL.
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
