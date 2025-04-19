import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi import Request
from gradio import mount_gradio_app
from career_coach_worker import career_advisor, resume_polisher, customize_cover_letter
from image_captioning_worker import image_captioning
from meeting_assistant_worker import meeting_assistant
from routes import router


app = FastAPI()

parent = parent = os.getcwd().split('backend')[0]
frontend_path = os.path.join(parent,'frontend', 'dist')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory=frontend_path)

app = mount_gradio_app(app, career_advisor(), path="/career_advisor")
app = mount_gradio_app(app, resume_polisher(), path="/resume_polisher")
app = mount_gradio_app(app, customize_cover_letter(), path="/customize_cover_letter")
app = mount_gradio_app(app, image_captioning(), path="/image_captioning")
app = mount_gradio_app(app, meeting_assistant(), path="/meeting_assistant")

app.include_router(router)

app.mount("/static", StaticFiles(directory=os.path.join(frontend_path,"static")), name="static")
static_mounts = [
    ("/assets", "assets", False),
    ("/chatbot", "chatbot", True),
    ("/pdf_summarizer", "pdf_summarizer", True),
    ("/translator_assistant", "translator_assistant", True),
    ("/voice_assistant", "voice_assistant", True)
]

for route, folder, html in static_mounts:
    dir_path = os.path.join(frontend_path, folder)
    if os.path.exists(dir_path):
        app.mount(
            route,
            StaticFiles(directory=dir_path, html=html),
            name=folder
        )

@app.get("/chatbot")
@app.get("/chatbot/")
async def serve_static_chatbot():
    return FileResponse(os.path.join(frontend_path, "chatbot", "index.html"))

@app.get("/pdf_summarizer")
@app.get("/pdf_summarizer/")
async def serve_static_summarizer():
    return FileResponse(os.path.join(frontend_path, "pdf_summarizer", "index.html"))
    
@app.get("/translator_assistant")
@app.get("/translator_assistant/")
async def serve_static_translator():
    return FileResponse(os.path.join(frontend_path, "translator_assistant", "index.html"))

@app.get("/voice_assistant")
@app.get("/voice_assistant/")
async def serve_static_voice_assistant():
    return FileResponse(os.path.join(frontend_path, "voice_assistant", "index.html"))


@app.get("/{full_path:path}", response_class=HTMLResponse)
async def serve_react_app(request: Request, full_path: str):
    return templates.TemplateResponse("index.html", {"request": request})

if __name__ == "__main__":
    uvicorn.run(app)
