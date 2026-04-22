from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from routes import router
from dotenv import load_dotenv


load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: verify env vars
    required = ["SUPABASE_URL", "SUPABASE_KEY"]
    missing = [v for v in required if not os.environ.get(v)]
    if missing:
        raise RuntimeError(f"Missing environment variables: {missing}")
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title="Course Scheduling API",
    description="API for course catalog and scheduling",
    version="1.0.0",
    lifespan=lifespan
)

# CORS - adjust origins for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)