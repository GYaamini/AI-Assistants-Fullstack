import React from 'react'
import { useNavigate } from "react-router-dom"
import ai from '../assets/ai.png'

const HomePage = () => {
    const navigate = useNavigate();

    const handleScrollDown = () => {
        document.getElementById("scroll-target-down").scrollIntoView({ behavior: "smooth" });
    };

    const handleScrollUp = () => {
        document.getElementById("scroll-target-up").scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="dark-theme">
            <section id="scroll-target-up" className="about-section">
                <h1>About</h1>
                <div className="content-container">
                    <p className="compact-text">
                        This platform is part of my ongoing journey as an AI developer — a space to learn, 
                        build, and share intelligent systems using modern machine learning tools and frameworks.
                    <br></br>
                        Throughout this learning path, I’ve worked with foundational technologies in the 
                        AI space: building conversational <strong>chatbots</strong>, fine-tuning <strong>
                        Large Language Models (LLMs)</strong> using platforms like  <strong>
                        Hugging Face</strong> and <strong>IBM Watson</strong>, and applying advanced 
                        techniques such as <strong>prompt engineering</strong> and <strong>
                        Retrieval-Augmented Generation (RAG)</strong>.
                    <br></br>
                        These tools go beyond experimentation — they’re full-stack integrations, 
                        combining <strong>Generative AI</strong> with <strong>FastAPI</strong> web 
                        framework for backend APIs, and using <strong> Gradio</strong> for interactive 
                        interfaces and rapid prototyping. Each project represents hands-on experience 
                        in bridging models with usable, real-world applications.
                    <br></br>
                        This site is a personal lab where I explore the potential of modern AI, and where 
                        each project marks a step forward in my growth as a developer.
                    </p>
                </div>
                <div className="scroll-down-container">
                    <button className="scroll-btn" onClick={handleScrollDown}>⬇️ AI Tools</button>
                </div>
            </section>

            <section id="scroll-target-down" className="image-button-section">
                <div className="scroll-up-container">
                    <button className="scroll-btn" onClick={handleScrollUp}>⬆️ About</button>
                </div>
                <img
                    src={ai}
                    alt="Explore AI Tools"
                    className="ai-image"
                    onClick={() => navigate("/tools")}
                />
            </section>
        </div>
    )
}

export default HomePage