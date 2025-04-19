import gradio as gr
import numpy as np
from PIL import Image
from transformers import AutoProcessor, BlipForConditionalGeneration


processor = AutoProcessor.from_pretrained("Salesforce/blip-image-captioning-base",use_fast=True)
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")


def image_captioning():
    def caption_image(input_image:np.array):
        raw_image = Image.fromarray(input_image).convert('RGB')
        
        text = "the image of"
        inputs = processor(images=raw_image, text=text, return_tensors="pt")
        outputs = model.generate(**inputs, max_length=50)

        caption = processor.decode(outputs[0], skip_special_tokens=True)
        
        return caption


    image_captioning_app = gr.Interface(
        fn=caption_image, 
        inputs=gr.Image(), 
        outputs="text",
        title="Image Captioning",
        description="This is a simple web app for generating captions for images using a trained model."
    )

    return image_captioning_app