import os
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from huggingface_hub import InferenceClient

app = FastAPI()

# 1. Load Models
# Text: Qwen 2.5 (Smart & Fast)
TEXT_MODEL_ID = "Qwen/Qwen2.5-0.5B-Instruct"
print(f"Loading local text model: {TEXT_MODEL_ID}...")
text_pipe = pipeline("text-generation", model=TEXT_MODEL_ID, torch_dtype="auto", device_map="auto")

# Image: Stable Diffusion via API (Requires HF_TOKEN env var)
IMAGE_API_MODEL = "stabilityai/stable-diffusion-2-1"
hf_token = os.environ.get("HF_TOKEN")
image_client = InferenceClient(model=IMAGE_API_MODEL, token=hf_token)

class UserInput(BaseModel):
    message: str

# 2. Smart Intent Router
def is_image_request(text: str) -> bool:
    triggers = ["draw", "generate image", "generate a picture", "create an image", "make a picture", "show me a picture", "show me an image"]
    return any(t in text.lower() for t in triggers)

@app.get("/")
def home():
    return {"status": "Cool Shot AI v2 Online"}

@app.post("/chat")
async def chat(user_input: UserInput):
    message = user_input.message.strip()

    # Route: Image
    if is_image_request(message):
        try:
            image_client.text_to_image(message)
            return {"reply": "IMAGE_READY:" + message, "is_image_metadata": True}
        except Exception as e:
            return {"reply": f"Image generation error: {str(e)}"}

    # Route: Text
    messages = [
        {"role": "system", "content": "You are Cool Shot AI, a helpful assistant."},
        {"role": "user", "content": message}
    ]
    prompt = text_pipe.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    outputs = text_pipe(prompt, max_new_tokens=256, do_sample=True, temperature=0.7)
    reply = outputs[0]["generated_text"].split("<|im_start|>assistant")[-1].replace("<|im_end|>", "").strip()

    return {"reply": reply, "is_image_metadata": False}
