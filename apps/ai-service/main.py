from fastapi import FastAPI

app = FastAPI(title="Second Brain AI Service")

@app.get("/")
def read_root():
    return {"status": "AI Service Running"}
