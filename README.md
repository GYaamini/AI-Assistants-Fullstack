# 🤖 AI Tools Hub  
### **Full-Stack AI Application Suite with FastAPI, Gradio, and React**  

| Home | Tools |
| ------ | ------ |
| ![About](https://github.com/user-attachments/assets/a9ff513e-652b-488c-a732-6a90c5267cbe) ![Home](https://github.com/user-attachments/assets/fb6e6bbd-756c-40b3-9a54-f98ee770b837) | ![Tools Light Theme](https://github.com/user-attachments/assets/eef2118e-7e9d-4c0d-ba2b-3ca95bc5f0c8) ![Tools Dark Theme](https://github.com/user-attachments/assets/afd3f207-48a8-4bf1-86a8-5a624bbdc2fa) |

---
## ⚓ Featured Tools  

| Tool | Description | Core Technologies |
| ----------------------- | ----------------------- | -----------------------  |
| **Face to Anime Portrait**<br>![Anime Portrait](https://github.com/user-attachments/assets/63e067f7-c690-4a95-8575-d5d5cf3bd0c0) | Convert face images into Anime portraits | [AnimeGANv2](https://github.com/bryandlee/animegan2-pytorch), Gradio |
| | | |
| **Career Coach** <br>![Career Coach light](https://github.com/user-attachments/assets/b6989032-fa89-4ca6-9c38-e31ced961a37) <br>![Career Coach dark](https://github.com/user-attachments/assets/2be3a1ce-ebc7-4e1c-913b-492534d51b2c)| Role specific resume and cover letter tailoring ![Career Advisor](https://github.com/user-attachments/assets/fefe6f41-74b8-4ae2-b8cb-0f44e79d6518) <br>![Resume Polisher](https://github.com/user-attachments/assets/fd462f50-2c70-4617-a032-56c9be46ddd2) <br>![Customize Cover Letter](https://github.com/user-attachments/assets/5fafc663-ddcb-4f94-86bc-74a454091521) | Llama3, Gradio |
| | | |
| **Translator Voice Assistant**<br>![Translator Assistant light](https://github.com/user-attachments/assets/fb248203-582a-441a-8d5f-34dbec8bd4a1) ![Translator Assistant dark](https://github.com/user-attachments/assets/77fd5ec6-2322-436f-93c1-09f776d248f2)| Translation with voice/text input and output. Current languages: English, French, German, Spanish, Italian, Portugese, Dutch, Japanese, and Korean | Llama3, Watsonx STT & TTS, FastAPI  |
| | | |
| **PDF Summarizer**<br>![PDF Summarizer light](https://github.com/user-attachments/assets/0b6e3181-8008-4f3c-85d4-b4fb3382f41f) ![PDF Summarizer dark](https://github.com/user-attachments/assets/ef349e40-dacc-4e8a-a730-919454796a15) | PDF document analysis with LLM and RAG | Llama3, LangChain, FastApi  |
| | | |
| **Voice Assistant**<br>![Voice Assistant light](https://github.com/user-attachments/assets/18e7fb9c-c1e3-442f-9305-93f380869a74) ![Voice Assistant dark](https://github.com/user-attachments/assets/64af0f1b-075c-476d-9abd-d1eda0e97f91) | Voice interactions with voice/text input and supports image analysis | GPT-4o, Watsonx STT & TTS, FastAPI  |
| | | |
| **Meeting Assistant**<br>![Meeting Assistant](https://github.com/user-attachments/assets/bb11ba0b-42bb-403e-90fd-b2b64af307e5) | Audio transcripted meeting notes and action items | Whisper, Llama2, Gradio  |
| | | |
| **Image Captioning**<br>![Image Captioning](https://github.com/user-attachments/assets/b050fac5-d5f8-4087-8ab3-5ba347650582) | Automated image captioning | BLIP, Gradio |
| | | |
| **Chatbot**<br>![Chatbot](https://github.com/user-attachments/assets/81edd4e8-6fa6-4c52-8ef2-907dea1258be) | Basic chatbot demo | Blenderbot, Transformers, FastApi |
| | | |

---
## ⚙️ System Architecture
```mermaid
flowchart TB
    subgraph Frontend["Frontend (React + Static)"]
        A[React SPA] -->|Bundled by| B[Vite]
       C[Static Files] -.->|HTML/CSS/JS| D[FastAPI Static Endpoints]
    end

    subgraph Backend["Backend (FastAPI)"]
        E[FastAPI] --> F[Gradio Mounts]
       E --> G[AI Models]
       E --> H[Static File Serving]
    end

    A <-->|API Calls| E
    H -->|Serves| C
```

---
## 🛠️ Tech Stack  

### Frontend  
| Component | Technology |  
|-----------|------------|  
| Main Interface | React + Vite |  
| Static Pages | HTML5, Bootstrap 5 |  
| Interactive Elements | jQuery |  

### Backend  
| Service | Technology |  
|---------|------------|  
| API Server | FastAPI |  
| AI Tools Interface | Gradio |  
| Chat Engine | Llama3, Llama2, GPT-4o |
| RAG | LangChain |
| Voice Processing | Watsonx STT/TTS |  

---
## ✨ Key Features  

1. **Multi-Tool Dashboard**  
   - Unified interface for 7 AI assistants  
   - Responsive grid layout with dark/light mode  

2. **Advanced AI Integration**  
``` mermaid
flowchart TB
    subgraph Backend["FastAPI (Watsonx Services)"]
        A[[Watsonx Speech-to-Text]]
        B[[Watsonx Text-to-Speech]]
    end

    subgraph Frontend["Browser"]
        C[[LLM Service: puter.ai]]
        E[Voice Input] -->|POST audio| A
        F[Text Input] --> C
        A -->|Text| C
        C -->|Text Response| B
        B -->|Audio| G[Voice Output]
        C -->|Text| H[Text Output]
    end
```

``` mermaid
flowchart TB
    subgraph Backend["FastApi (LangChain)"]
        A[PyPDFLoader] --> B[TextSplitter]
        B --> C[ChromaDB]
    end

    subgraph Frontend["Browser"]
        D[Get Context] --> E[Build Prompt]
        E --> F[LLM Service: puter.ai]
    end
```

``` mermaid
flowchart TB
    subgraph Gradio["Gradio Interface"]
        A[Context Input: Text/File Upload] --> B[Prompt Engineering]
        B --> C["LLM Processing (foundational model)"]
        C --> D[Output Display Text]
    end
```

3. **CI/CD Pipeline**
    - Docker containerization
    - Netlify frontend deployment

---
## Run the App Locally

1. Clone the repository

2. Navigate to the project directory
    ```bash
    cd AI-Assistants-Fullstack
    ```

3. Set up Frontend
    ```bash
    cd frontend
    ```
   * App.jsx under ./src
        * For development, set VITE_BASE_URL = http://127.0.0.1:10000 under .env in the frontend root folder
        * For Vite, import statement: import.meta.env.VITE_BASE_URL
        * For production, set VITE_BASE_URL = https://repo-name.onrender.com under environmental variables on gh-pages and Render
    
    ```bash
    npm install
    nom run build
    ```

5. Set up Backend
    ```bash
    cd ../backend
    python3 -m venv venv
    venv\Scripts\activate   ## on MacOS and Linux : source venv/bin/activate
    pip install -r requirements.txt

    python -u server.py --reload
    or
    uvicorn server:app --host 127.0.0.1 --port 10000

    ```
    * .env in the backend root folder should contain the following
        * watsonx_API, project_id: from Watsonx.ai 
        * TTS_API_KEY, TTS_SERVICE_URL: from IBM Cloud TTS service
        * STT_API_KEY, STT_SERVICE_URL: from IBM Cloud STT service

6. Open browser and go to `http://localhost:10000/` to view the application
---