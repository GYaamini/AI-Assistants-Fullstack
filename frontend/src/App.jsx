import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import HomePage from "./pages/HomePage";
import ToolsPage from "./pages/ToolsPage";
import ToolIframe from "./components/ToolIframe";
import CareerCoachPage from './pages/CareerCoachPage'
import './App.css'
import Navbar from "./components/Navbar";
import CareerAdvisor from "./pages/CareerAdvisor";


export const BASE_URL = import.meta.env.VITE_BASE_URL

function App() {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/career_coach" element={<CareerCoachPage />} />
            {/* <Route 
              path="/career_advisor/" 
              element={<CareerAdvisor />} 
            /> */}
            <Route 
              path="/career_advisor" 
              element={<ToolIframe className="career-page" tool="/career_advisor" />} 
            />
            <Route 
              path="/resume_polisher" 
              element={<ToolIframe className="career-page" tool="/resume_polisher" />} 
            />
            <Route 
              path="/customize_cover_letter" 
              element={<ToolIframe className="career-page" tool="/customize_cover_letter" />} 
            />
            <Route 
              path="/image_captioning" 
              element={<ToolIframe className="tool-page" tool="/image_captioning" />} 
            />
            <Route 
              path="/meeting_assistant" 
              element={<ToolIframe className="tool-page" tool="/meeting_assistant" />} 
            />
        </Routes>
    </Router>
  )
}

export default App
