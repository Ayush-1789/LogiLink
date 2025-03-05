# LogiLink

## How to run:

1. Start database with `docker compose up -d` (alternatively, install and start PostgreSQL with the PostGIS extension, set the database name to `logilink` and set the username and password to `test`) 
2. Create venv with `python -m venv .venv` (if the `python` command is not found, try `python3`)
3. Activate venv with `source .venv/bin/activate` (Linux, macOS) or `.venv\Scripts\activate` (Windows)
4. Install dependencies with `pip install -r requirements.txt`
5. Run `fastapi dev main.py`
