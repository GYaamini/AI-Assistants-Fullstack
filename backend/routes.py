import base64
import os
import json
from fastapi import APIRouter, Request, UploadFile, File
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel
from chatbot_worker import chat_prompt
from watson_workers import speech_to_text, text_to_speech, watsonx_process_message
import rag_worker as rag_worker

router = APIRouter()

# Data model for JSON body
class MessageData(BaseModel):
    userMessage: str
    voice: str
    toLang: str
    # fromLang: str

# Pydantic model for message
class Message(BaseModel):
    userMessage: str

# Data model for TTS
class TTSData(BaseModel):
    text: str
    voice: str

class ChatRequest(BaseModel):
    prompt: str
    
class QuestionRequest(BaseModel):
    userMessage: str

#######################################################
# ROUTES
#######################################################

# Chatbot
@router.post("/chatbot/handle_prompt")
def handle_prompt(chat_request: ChatRequest):
    input_text = chat_request.prompt
    
    response = chat_prompt(input_text)
    
    return response


# PDF Summarizer
# @router.post("/pdf_summarizer/process_message")
# async def process_message_route_pdf(message: Message):
#     print("user_message", message.userMessage)
#     try:
#         bot_response = rag_worker.process_prompt(message.userMessage)
#         return JSONResponse(content={"botResponse": bot_response}, status_code=200)
#     except Exception as e:
#         return JSONResponse(content={"error": str(e)}, status_code=500)


@router.post("/pdf_summarizer/get_context")
def get_context_route(request: QuestionRequest):
    docs = rag_worker.get_context(request.userMessage)
    return JSONResponse(
        content = {
        "context": [d.page_content for d in docs]
        },
        status_code=200
    )


@router.post("/pdf_summarizer/process_document")
async def process_document_route(file: UploadFile = File(...)):
    try:
        file_path = file.filename
        with open(file_path, "wb") as f:
            f.write(await file.read())

        rag_worker.process_document(file_path)

        return JSONResponse(
            content={
                "botResponse": "Thank you for providing your PDF document. I have analyzed it, so now you can ask me any questions regarding it!"
            },
            status_code=200
        )
    except Exception as e:
        return JSONResponse(
            content={
                "botResponse": "It seems like the file was not uploaded correctly. Please try again. If the problem persists, try a different file.",
                "error": str(e)
            },
            status_code=400
        )


# Translator Assistant
@router.post("/translator_assistant/speech_to_text")
async def speech_to_text_route_translator(request: Request):
    print("Processing STT...")
    form = await request.form()
    audio_file = form.get("audio")
    audio_binary = await audio_file.read()
    model =  form.get("model")
    
    text = speech_to_text(audio_binary, model)
    
    return JSONResponse(content={"text":text}, status_code=200)


@router.post("/translator_assistant/process_message")
async def process_message_route_translator(data: MessageData):
    response_text = data.userMessage
    voice = data.voice
    toLang = data.toLang
    # fromLang = data.fromLang

    # watsonx_response_text = watsonx_process_message(user_message, fromLang, toLang)
    # watsonx_response_text = os.linesep.join(
    #     s.strip() for s in watsonx_response_text.splitlines() if s.strip()
    # )

    if not response_text:
        response_text = f"Sorry, could not translate that to {toLang}"
        voice = "en-AU_JackExpressive"

    watsonx_response_speech = text_to_speech(response_text, voice)
    
    if watsonx_response_speech:
        watsonx_response_speech = base64.b64encode(watsonx_response_speech).decode("utf-8")
    else:
        watsonx_response_speech = None

    return JSONResponse(
        content={
            "watsonxResponseText": response_text,
            "watsonxResponseSpeech": watsonx_response_speech
        },
        status_code=200
    )


# Voice Assistant
@router.post("/voice_assistant/speech_to_text")
async def speech_to_text_route_voice(request: Request):
    print("Processing STT...")
    audio_binary = await request.body()
    model = 'en-US_Multimedia'
    
    text = speech_to_text(audio_binary, model)
    
    return JSONResponse(content={"text":text}, status_code=200)

@router.post("/voice_assistant/text_to_speech")
async def text_to_speech_route_voice(data: TTSData):
    print("Processing TTS...")
    audio = text_to_speech(data.text, data.voice)
    
    if audio is None:
        return JSONResponse(
            content={"error": "Failed to convert text to speech"},
            status_code=500
        )
    
    return Response(content=audio, media_type="audio/wav")
