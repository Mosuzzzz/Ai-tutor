import sys
import os

# Ensure repository root is on sys.path when running from backend/ so
# top-level proxy modules at repo root become importable for tests.
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)
