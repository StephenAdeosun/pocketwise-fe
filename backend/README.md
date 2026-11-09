# Student Budget Tracker API

FastAPI backend for the Student Budget and Expense Tracker.

## Run locally

From `backend/`:

```text
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Open `http://localhost:8000/docs` for the interactive API documentation.

## Test

From `backend/`, run `pytest` after dependencies are installed.

The API follows `../docs/API_CONTRACT.md` and uses SQLite for the initial implementation.
