from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI()

# Initialize the text-generation pipeline
# We can load this on startup to avoid loading it on every request,
# although pipeline does caching, doing it globally is standard for this simple app.
generator = pipeline("text-generation", model="distilgpt2")

class ChatRequest(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"status": "Cool Shot Systems Backend Online"}

@app.post("/chat")
def chat(request: ChatRequest):
    try:
        # Generate response
        response = generator(request.text, max_length=100, num_return_sequences=1)
        return response[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
