import os
# from ibm_watson_machine_learning.foundation_models.utils.enums import ModelTypes
from ibm_watson_machine_learning.foundation_models import Model
from ibm_watson_machine_learning.metanames import GenTextParamsMetaNames as GenParams
from ibm_watson_machine_learning.foundation_models.utils.enums import DecodingMethods
from ibm_watson import TextToSpeechV1, SpeechToTextV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from dotenv import load_dotenv
load_dotenv(load_dotenv(override=True))

PROJECT_ID = os.getenv('project_id')
credentials = {
    "url": "https://us-south.ml.cloud.ibm.com",
    "apikey": os.getenv('watsonx_API')
}
# model_id = ModelTypes.FLAN_UL2
model_id = "meta-llama/llama-3-3-70b-instruct"

parameters = {
    GenParams.DECODING_METHOD: DecodingMethods.GREEDY,
    GenParams.MIN_NEW_TOKENS: 1,
    GenParams.MAX_NEW_TOKENS: 1024,
    GenParams.TEMPERATURE: 0.3
}

model = Model(
    model_id = model_id,
    params = parameters,
    credentials = credentials,
    project_id = PROJECT_ID
)


def speech_to_text(audio_binary,model=""):
    load_dotenv(override=True)
    api_key = os.getenv('STT_API_KEY')
    service_url = os.getenv('STT_SERVICE_URL')
    
    authenticator = IAMAuthenticator(api_key)
    stt_service = SpeechToTextV1(authenticator=authenticator)
    
    stt_service.set_service_url(service_url)
    
    try:
        response = stt_service.recognize(
            audio = audio_binary,
            content_type = 'audio/l16; rate=16000',
            model = model,
        ).get_result()
            
        text = 'null'
        
        if 'results' in response and len(response['results']) > 0:
            text = response['results'][0]['alternatives'][0]['transcript']
        
        print('Recognized text:', text)
        
        return text
    except Exception as e:
        print(f"Error during speech-to-text conversion: {str(e)}")
        return None


def text_to_speech(text, voice=""):
    load_dotenv(override=True)
    api_key = os.getenv('TTS_API_KEY')
    service_url = os.getenv('TTS_SERVICE_URL')
    
    authenticator = IAMAuthenticator(api_key)
    tts_service = TextToSpeechV1(authenticator=authenticator)
    
    tts_service.set_service_url(service_url)
    
    try:
        audio_data = tts_service.synthesize(
            text,
            voice=voice,
            accept='audio/wav'
        ).get_result().content
            
        return audio_data
    except Exception as e:
        print(f"Error while converting text to speech: {str(e)}")
        return None


def watsonx_process_message(user_message,fromLang,toLang):
    # prompt = f"""
    #     You are an assistant helping translate sentences from ```{fromLang}``` into ```{toLang}```.
    #     Translate this ```{fromLang}``` sentence to ```{toLang}```: ```{user_message}```
    # """
    prompt = f"""
        Task: Direct Translation Only  
        Source Language: {fromLang}  
        Target Language: {toLang}

        Guidelines:
        1. Translate **only** the content of the input from {fromLang} to {toLang}.  
        2. Maintain precise meaning and natural expression in {toLang}.  
        3. Preserve proper nouns.  
        4. Do not include any explanation or commentary. Output only the translated sentence without romanization.
        5. Do **not** generate additional related translations.

        Examples:
        - EN: Hello → JA: こんにちは  
        - EN: Goodbye → JA: さようなら  
        - EN: Hello → KO: 안녕하세요  
        - EN: Goodbye → KO: 감사합니다  
        - KO: 안녕하세요 → EN: Hello  
        - JA: こんにちは → EN: Hello
        - KO: 'Annyeonghaseyo' → EN: 'Hello'
        - JP: 'Konnichiwa' → EN: 'Hello'

        Translate this:
        {user_message}  
        Translation:
        """
    response_text = model.generate_text(prompt=prompt)
    
    lines = response_text.splitlines()
    for line in lines:
        if "Translation:" in line:
            line = line.split("Translation:")[-1].strip()
        if line:
            return line
    return ""
