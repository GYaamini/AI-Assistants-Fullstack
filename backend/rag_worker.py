# import os
# import torch
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

from langchain.chains import RetrievalQA
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
# from langchain_ibm import WatsonxLLM
from dotenv import load_dotenv

load_dotenv()

# Check for GPU availability and set the appropriate device for computation.
# DEVICE = "cuda:0" if torch.cuda.is_available() else "cpu"
DEVICE = "cpu"

conversation_retrieval_chain = None
chat_history = []
llm_hub = None
embeddings = None
db = None

# Function to initialize the language model and its embeddings
def init_llm():
    global llm_hub, embeddings

    # logger.info("Initializing WatsonxLLM and embeddings...")
       
    # # Llama Model
    # MODEL_ID = "meta-llama/llama-3-3-70b-instruct"
    # WATSONX_URL = "https://us-south.ml.cloud.ibm.com"
    # PROJECT_ID = os.getenv('project_id')
    # WATSONX_API = os.getenv('watsonx_API')

    # model_parameters = {
    #     "max_new_tokens": 256,
    #     "temperature": 0.1,
    # }
    # # Initialize Llama LLM using the updated WatsonxLLM API
    # llm_hub = WatsonxLLM(
    #     model_id=MODEL_ID,
    #     url=WATSONX_URL,
    #     apikey=WATSONX_API,
    #     project_id=PROJECT_ID,
    #     params=model_parameters
    # )
    
    # logger.debug("WatsonxLLM initialized: %s", llm_hub)
    #Initialize embeddings using a pre-trained model to represent the text data.
    embeddings =  HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={"device": DEVICE}
    )  
    logger.debug("Embeddings initialized with model device: %s", DEVICE)

# Function to process a PDF document
def process_document(document_path):
    global conversation_retrieval_chain, db

    logger.info("Loading document from path: %s", document_path)
    # Load the document
    loader =  PyPDFLoader(document_path)
    documents = loader.load()
    logger.debug("Loaded %d document(s)", len(documents))

    # Split the document into chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1024, chunk_overlap=64)
    texts = text_splitter.split_documents(documents)
    logger.debug("Document split into %d text chunks", len(texts))

    # Create an embeddings database using Chroma from the split text chunks.
    logger.info("Initializing Chroma vector store from documents...")
    db = Chroma.from_documents(texts, embedding=embeddings)
    logger.debug("Chroma vector store initialized.")

    # conversation_retrieval_chain = RetrievalQA.from_chain_type(
    #     llm=llm_hub,
    #     chain_type="stuff",
    #     retriever=db.as_retriever(search_type="mmr", search_kwargs={'k': 6, 'lambda_mult': 0.25}),
    #     return_source_documents=False,
    #     input_key="question"
    # )
    # logger.info("RetrievalQA chain created successfully.")
  
def get_context(question):
    if not db:
        return []
    return db.as_retriever(
        search_type="mmr", 
        search_kwargs={'k': 6, 'lambda_mult': 0.25}
    ).get_relevant_documents(question)
  
# # Function to process a user prompt
# def process_prompt(prompt):
#     global conversation_retrieval_chain
#     global chat_history

#     logger.info("Processing prompt: %s", prompt)
#     # Query the model using the new .invoke() method
#     output = conversation_retrieval_chain.invoke({"question": prompt, "chat_history": chat_history})
#     answer = output["result"]
#     logger.debug("Model response: %s", answer)

#     # Update the chat history
#     chat_history.append((prompt,answer))
#     logger.debug("Chat history updated. Total exchanges: %d", len(chat_history))
    
#     logger.debug("Chat history updated. Total exchanges: %d", len(chat_history))

#     return answer

# Initialize the language model
init_llm()
logger.info("LLM and embeddings initialization complete.")
