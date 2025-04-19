import React from 'react'
import {Link, useLocation} from "react-router-dom"
import { useState, useEffect } from "react"

const Navbar = () => {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "dark";
    })

    useEffect(() => {
        document.body.classList.toggle("dark", darkMode)
        localStorage.setItem("theme", darkMode ? "dark" : "light")
    }, [darkMode])

    const toggleTheme = () => {
        setDarkMode((prevMode) => !prevMode)
    }
    
    const location = useLocation()
    const secondary = ["/career_advisor", "/resume_polisher", "/customize_cover_letter"];
    const isOnSecondaryTools = secondary.includes(location.pathname)
    const isOnTools = location.pathname === "/tools"

    return (
        <nav className="navbar-main">
            {isOnSecondaryTools ? (
                <Link to="/career_coach" className="home-link">💼 Career Coach</Link>
            ) : isOnTools ? (
                <Link to="/" className="home-link">📑 Home</Link>
            ) : (
                <Link to="/tools" className="home-link">🔙 AI Tools</Link>
            )}
            <button className="toggle-mode-main" onClick={toggleTheme}>
                {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
        </nav>
    )
}

export default Navbar