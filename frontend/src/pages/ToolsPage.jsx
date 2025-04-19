import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './ToolsPage.css'
import {BASE_URL} from '../App.jsx'
import Navbar from '../components/Navbar';
import careerCoach from '../assets/career_coach.png'
import translatorAssistant from "../assets/translator_assistant.png"
import pdfSummarizer from "../assets/pdf_summarizer.png"
import voiceAssistant from "../assets/voice_assistant.png"
import meetingAssistant from "../assets/meeting_assistant.png"
import imageCaptioning from "../assets/image_captioning.png"
import chatbot from "../assets/chatbot.png"

export const tools = [
    {
        title: "Career Coach",
        image: careerCoach,
        link: "/career_coach",
        type: "page",
    },
    {
        title: "Translator Voice Assistant",
        image: translatorAssistant,
        link: "/translator_assistant",
        type: "link",
    },
    {
        title: "PDF Summarizer",
        image: pdfSummarizer,
        link: "/pdf_summarizer",
        type: "link",
    },
    {
        title: "Voice Assistant",
        image: voiceAssistant,
        link: "/voice_assistant",
        type: "link",
    },
    {
        title: "Meeting Assistant",
        image: meetingAssistant,
        link: "/meeting_assistant",
        type: "iframe",
    },
    {
        title: "Image Captioning",
        image: imageCaptioning,
        link: "/image_captioning",
        type: "iframe",
    },
    {
        title: "Chatbot",
        image: chatbot,
        link: "/chatbot",
        type: "link",
    },
];

const ToolsPage = () => {
    const navigate = useNavigate()
    const [iframeSrc, setIframeSrc] = useState(null);
    const [iframeTitle, setIframeTitle] = useState("");

    const handleToolClick = (tool) => {
        setIframeSrc(`${BASE_URL}${tool.link}`);
        setIframeTitle(tool.title);
    };

    return (
        <div className="tool-page">
            <Navbar />
            <div className="container-main">
                 {!iframeSrc && <h1 className="h1-tools">AI Tools</h1>}

                {iframeSrc ? (
                    <div className="iframe-wrapper">
                        <iframe
                            src={iframeSrc}
                            width="100%"
                            height="100%"
                            title={iframeTitle}
                        />
                    </div>
                ) : (
                    <div className="tool-container">
                        {tools.map((tool, index) => (
                            tool.type === "link" ? (
                                <a 
                                    key={index}
                                    className="tool"
                                    href={`${BASE_URL}${tool.link}`}
                                    style={{ cursor: "pointer"}}
                                >
                                    <img src={tool.image} alt={tool.title} className="tool-image" />
                                    <div className="tool-text">{tool.title}</div>
                                </a>
                            ) : tool.type === "iframe" ? (
                                <div
                                    key={index}
                                    className="tool"
                                    onClick={() => navigate(tool.link)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <img src={tool.image} alt={tool.title} className="tool-image" />
                                    <div className="tool-text">{tool.title}</div>
                                </div>
                            ) : (
                                <div
                                    key={index}
                                    className="tool"
                                    onClick={() => navigate(tool.link)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <img src={tool.image} alt={tool.title} className="tool-image" />
                                    <div className="tool-text">{tool.title}</div>
                                </div>
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ToolsPage
