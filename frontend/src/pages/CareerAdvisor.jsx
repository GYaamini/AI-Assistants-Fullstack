import React from 'react'
import { BASE_URL } from '../App'
import Navbar from '../components/Navbar'

const CareerAdvisor = () => {
  return (
    <>
        <Navbar />
        <iframe 
            className='iframe-wrapper'
            src={BASE_URL+"/career_advisor"}
            width="100%"
            height="100%"
            title="Career Advisor"
        ></iframe>
    </>
  )
}

export default CareerAdvisor