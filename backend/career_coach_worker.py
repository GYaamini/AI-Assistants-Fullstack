# Import necessary packages
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.foundation_models.schema import TextChatParameters
import gradio as gr
import os
from dotenv import load_dotenv

load_dotenv()

################################################
# MODEL INITIALIZATION
################################################

model_id = "meta-llama/llama-3-2-11b-vision-instruct"

credentials = Credentials(
                   url = "https://us-south.ml.cloud.ibm.com",
                   api_key = os.getenv('watsonx_API')
                )
project_id = os.getenv('project_id')

params = TextChatParameters(
    temperature=0.7,
    max_tokens=512
)

model = ModelInference(
    model_id=model_id,
    credentials=credentials,
    project_id=project_id,
    params=params
)


################################################
# CAREER COACH FUNCTIONS
################################################

def career_advisor():
    def generate_career_advice(position_applied, job_description, resume_content):
        prompt = f"""Considering the job description: {job_description}, and 
            the resume provided: {resume_content}, identify areas for 
            enhancement in the resume. Offer specific suggestions on how to 
            improve these aspects to better match the job requirements and 
            increase the likelihood of being selected for the position of 
            {position_applied}.
            """
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                ]
            }
        ]   
        
        generated_response = model.chat(messages=messages)
        generated_text = generated_response['choices'][0]['message']['content']
        
        return generated_text

    career_advice_app = gr.Interface(
        fn=generate_career_advice,
        flagging_mode="never",
        inputs=[
            gr.Textbox(
                label="Position Applied For",
                placeholder="Enter the position you are applying for..."
            ),
            gr.Textbox(
                label="Job Description Information",
                placeholder="Paste the job description here...",
                lines=10
            ),
            gr.Textbox(
                label="Your Resume Content",
                placeholder="Paste your resume content here...",
                lines=10
            ),
        ],
        outputs=gr.Textbox(label="Advice"),
        title="Career Advisor",
        description="""Enter the position you're applying for, paste the 
            job description, and your resume content to get advice on what 
            to improve for getting this job.
            """
    )

    return career_advice_app

def resume_polisher():
    def polish_resume(position_name, resume_content, polish_prompt=None):
        prompt_use = ""
        polish_prompt = polish_prompt or ""

        if polish_prompt.strip():
            prompt_use = f"""Given the resume content: '{resume_content}', 
                polish it based on the following instructions: {polish_prompt} 
                for the {position_name} position.
                """
        else:
            prompt_use = f"""Suggest improvements for the following resume 
                content: '{resume_content}' to better align with the 
                requirements and expectations of a {position_name} position. 
                Return the polished version, highlighting necessary adjustments 
                for clarity, relevance, and impact in relation to the targeted role.
                """
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt_use
                    },
                ]
            }
        ]
        
        generated_response = model.chat(messages=messages)
        generated_text = generated_response['choices'][0]['message']['content']
        
        return generated_text
    
    resume_polish_app = gr.Interface(
        fn = polish_resume,
        flagging_mode = "never",
        inputs = [
            gr.Textbox(
                label="Position Name",
                placeholder="Enter the name of the position..."
            ),
            gr.Textbox(
                label="Resume Content",
                placeholder="Paste your resume content here...",
                lines=20
            ),
            gr.Textbox(
                label="Polish Instruction (Optional)",
                placeholder="Enter specific instructions or areas for improvement (optional)...",
                lines=2
            ),
        ],
        outputs = gr.Textbox(label="Polished Content"),
        title = "Resume Polisher",
        description="""This application helps you polish your resume. 
            Enter the position your want to apply, your resume content, 
            and specific instructions or areas for improvement (optional), 
            then get a polished version of your content.
            """
    )
    
    return resume_polish_app

def customize_cover_letter():
    def generate_cover_letter(company_name, position_name, resume_content, job_description=None, technical_skills=None):
        prompt = ""

        job_description = job_description or ""
        technical_skills = technical_skills or ""
        
        if job_description.strip() and technical_skills.strip():
            prompt = f"""Generate a customized cover letter using the company name: 
                {company_name}, the position applied for: {position_name}, the 
                job description: {job_description}, and the technical skills: 
                {technical_skills}. Ensure the cover letter highlights my 
                qualifications and experience as detailed in the resume content: 
                {resume_content}. Adapt the content carefully to avoid including 
                experiences not present in my resume but mentioned in the job 
                description. The goal is to emphasize the alignment between my 
                existing skills and the requirements of the role.
                """
        elif job_description.strip():
            prompt = f"""Generate a customized cover letter using the company name: 
                {company_name}, the position applied for: {position_name}, and 
                the job description: {job_description}. Ensure the cover letter 
                highlights my qualifications and experience as detailed in the 
                resume content: {resume_content}. Adapt the content carefully to 
                avoid including experiences not present in my resume but mentioned 
                in the job description. The goal is to emphasize the alignment 
                between my existing skills and the requirements of the role.
                """
        elif technical_skills.strip():
            prompt = f"""Generate a customized cover letter using the company name: 
                {company_name}, the position applied for: {position_name}, and 
                the technical skills: {technical_skills}. Ensure the cover letter 
                highlights my qualifications and experience as detailed in the 
                resume content: {resume_content}. Adapt the content carefully to 
                avoid including experiences not present in my resume but mentioned 
                in the technical skills. The goal is to emphasize the alignment 
                between my existing skills and the requirements of the role.
                """
        else:
            prompt = f"""Generate a customized cover letter using the company name: 
                {company_name}, and the position applied for: {position_name}. 
                Ensure the cover letter highlights my qualifications, experience, 
                and capabilities as detailed in the resume content: 
                {resume_content} that would suit the company: {company_name} goals 
                and position: {position_name} probable requirements. Adapt the 
                content carefully to avoid including experiences not present in 
                my resume but relevant to the position. The goal is to emphasize 
                the alignment between my existing skills and the requirements of 
                the role.
                """
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                ]
            }
        ]   

        generated_response = model.chat(messages=messages)
        generated_text = generated_response['choices'][0]['message']['content']
        return generated_text

    cover_letter_app = gr.Interface(
        fn=generate_cover_letter,
        flagging_mode="never",
        inputs=[
            gr.Textbox(
                label="Company Name",
                placeholder="Enter the name of the company..."
            ),
            gr.Textbox(
                label="Position Name",
                placeholder="Enter the name of the position..."
            ),
            gr.Textbox(
                label="Resume Content",
                placeholder="Paste your resume content here...",
                lines=10
            ),
            gr.Textbox(
                label="Job Description Information",
                placeholder="Paste the job description here...",
                lines=10
            ),
            gr.Textbox(
                label="Job Skills Keywords",
                placeholder="Paste the job required skills keywords here...",
                lines=5
            ),
        ],
        outputs=gr.Textbox(label="Customized Cover Letter"),
        title="Customized Cover Letter Generator",
        description="""Generate a customized cover letter by entering the 
            company name, position name, job description and your resume.
            """
    )
    
    return cover_letter_app
