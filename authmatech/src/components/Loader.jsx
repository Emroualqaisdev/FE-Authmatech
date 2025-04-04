import React from 'react'
import '../styles/loader.css'
import logo from '../assets/images/authmatech-logo.png'

const Loader = () => (
  <div className="loader">
    <img src={logo} alt="Authmatech Logo" />
    <p>Detecting mobile number...</p>
  </div>
)

export default Loader
