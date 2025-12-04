import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from huggingface_hub import InferenceClient

app = FastAPI()

# --- CONFIGURATION ---
# We use the Serverless API for both Text and Image to get maximum quality on free tier.
# Text: Mistral 7B (Very smart, conversational)
TEXT_MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.3"

# Image: Stable Diffusion 2.1
IMAGE_MODEL_ID = "stabilityai/stable-diffusion-2-1"

# Load Token
hf_token = os.environ.get("HF_TOKEN")
if not hf_token:
    print("WARNING: HF_TOKEN is missing. The app will fail to generate content.")

# Initialize Clients
client = InferenceClient(token=hf_token)

class UserInput(BaseModel):
    message: str

# --- INTENT DETECTION ---
def is_image_request(text: str) -> bool:
    triggers = ["draw", "generate image", "generate a picture", "create an image", "make a picture", "show me a picture", "show me an image"]
    return any(t in text.lower() for t in triggers)

@app.get("/")
def home():
    return {"status": "Cool Shot AI (Mistral Powered) Online"}

@app.post("/chat")
async def chat(user_input: UserInput):
    message = user_input.message.strip()

    # 1. IMAGE ROUTE
    if is_image_request(message):
        try:
            # We trigger the image generation
            client.text_to_image(message, model=IMAGE_MODEL_ID)
            return {"reply": "IMAGE_READY:" + message, "is_image_metadata": True}
        except Exception as e:
            return {"reply": f"I tried to generate that image, but the API reported an error: {str(e)}"}

    # 2. TEXT ROUTE (The Upgrade)
    # We use chat_completion which formats the prompt automatically for Mistral
    try:
        messages = [
            {"role": "system", "content": "You are Cool Shot AI, a helpful, intelligent, and professional assistant created by Professor. You answer concisely and accurately."},
            {"role": "user", "content": message}
        ]

        response = client.chat_completion(
            model=TEXT_MODEL_ID,
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )

        reply = response.choices[0].message.content
        return {"reply": reply, "is_image_metadata": False}

    except Exception as e:
        print(f"Error: {e}")
        return {"reply": "I am having trouble reaching my brain (Hugging Face API). Please check if your HF_TOKEN is valid."}
