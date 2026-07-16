import uvicorn
from fastapi import FastAPI, HTTPException
from schemas import ProcessRequest, ProcessResponse
from nlp_service import generate_embedding, extract_tags

app = FastAPI(title="AI Service", description="Isolated NLP worker node")

@app.get("/health")
async def health_check():
    """Sanity checkpoint yielding service status."""
    return {"status": "AI Service Running"}

@app.post("/api/v1/process", response_model=ProcessResponse)
async def process_text(request: ProcessRequest):
    """Parses raw texts, invokes NLP pipeline utilities, and streams validation-secure responses."""
    try:
        embedding = generate_embedding(request.text)
        tags = extract_tags(request.text)
        
        return ProcessResponse(
            embedding=embedding,
            tags=tags
        )
    except Exception as e:
        # Clean runtime safety exception blocks to prevent container crashes
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

if __name__ == "__main__":
    # Standardize to bind Uvicorn to host="0.0.0.0" and port=5000
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=False)
