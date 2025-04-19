import React from 'react'
import './CareerCoachPage.css'
import career_advisor from '../assets/career_advisor.png'
import resume_polisher from '../assets/resume_polisher.png'
import customize_cover_letter from '../assets/customize_cover_letter.png'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

export const career = [
    {
        title: "Career Advisor",
        image: career_advisor,
        link: "/career_advisor",
    },
    {
        title: "Resume Polisher",
        image: resume_polisher,
        link: "/resume_polisher",
    },
    {
        title: "Customize Cover Letter",
        image: customize_cover_letter,
        link: "/customize_cover_letter",
    },
]

const CareerCoachPage = () => {
    const navigate = useNavigate()

    return (
        <div className="career-page">
            <Navbar />
            <div className="container-main">
                <h1 className="h1-career">Career Coach</h1>

                <div className="card-container">
                    {career.map((card, index) => 
                        <div
                            key={index}
                            className="card"
                            onClick={() => navigate(card.link)}
                            style={{ cursor: "pointer" }}
                        >
                            <img src={card.image} alt={card.title} className="card-image" />
                            <div className="card-text">{card.title}</div>
                        </div>
                    )}
                </div>    
            </div>
        </div>
    )
}

export default CareerCoachPage