import React from 'react'
import { BASE_URL } from '../App'
import Navbar from '../components/Navbar'

const ToolIframe = ({className, tool}) => {
    return (
    <>
        <div className={className}>
            <Navbar />
            <div className='container-main'>
                <iframe 
                    className='iframe-wrapper'
                    src={BASE_URL+tool+"/"}
                    width="100%"
                    height="100%"
                    title="Career Advisor"
                ></iframe>
            </div>
        </div>
    </>
    )
}

export default ToolIframe