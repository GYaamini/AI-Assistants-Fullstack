from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# Model initialization
model_name = "facebook/blenderbot-400M-distill"
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)
# Chat
conversation_history = []

def chat_prompt(input_text):
    history = "\n".join(conversation_history)
    
    inputs = tokenizer.encode_plus(history,
                                   input_text, 
                                   return_tensors="pt",
                                   padding=True,
                                   truncation=True,
                                   max_length=512 
                                )
    outputs = model.generate(**inputs, max_length=120)
    response = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()

    conversation_history.append(input_text)
    conversation_history.append(response)
    
    return response