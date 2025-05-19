import os
from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("Set the GEMINI_API_KEY environment variable.")

app = FastAPI()

@app.get("/")
def root():
    return {"message": "FastAPI is working!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)