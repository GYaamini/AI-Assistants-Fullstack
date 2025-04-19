import os
import gradio as gr
from transformers import pipeline
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from ibm_watson_machine_learning.foundation_models import Model
from ibm_watson_machine_learning.foundation_models.extensions.langchain import WatsonxLLM
from ibm_watson_machine_learning.metanames import GenTextParamsMetaNames as GenParams
from dotenv import load_dotenv

load_dotenv()

credentials = {
    "url"    : "https://us-south.ml.cloud.ibm.com",
    'apikey' : os.getenv('watsonx_API')
}
params = {
        GenParams.MAX_NEW_TOKENS: 800, # The maximum number of tokens that the model can generate in a single run.
        GenParams.TEMPERATURE: 0.1,   # A parameter that controls the randomness of the token generation. A lower value makes the generation more deterministic, while a higher value introduces more randomness.
    }
LLAMA2_model = Model(
        model_id= 'meta-llama/llama-3-2-11b-vision-instruct', 
        credentials=credentials,
        params=params,
        project_id=os.getenv('project_id'),  
        )
llm = WatsonxLLM(LLAMA2_model) 

#######------------- Prompt Template-------------####

temp = """
GPT4 Correct User: List key points with details from this context:
<context>{context}</context>
<|end_of_turn|>
GPT4 Correct Assistant:
"""

pt = PromptTemplate(
    input_variables=["context"],
    template= temp)

prompt_chain = LLMChain(llm=llm, prompt=pt)


def meeting_assistant():
    def transcript_audio(audio_file):
        pipe = pipeline(
            "automatic-speech-recognition",
            model="openai/whisper-tiny.en",
            chunk_length_s=30,
        )

        transcript_txt = pipe(audio_file, batch_size=8)["text"]
        result = prompt_chain.run({"context": transcript_txt})

        return result

    meeting_assistant_app = gr.Interface(fn= transcript_audio, 
                        inputs= gr.Audio(sources="upload", type="filepath"),
                        outputs= gr.Textbox(), 
                        title= "Audio Transcription",
                        description= "Upload the audio file")

    return meeting_assistant_app