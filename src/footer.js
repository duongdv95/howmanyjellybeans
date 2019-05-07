import React from "react";
import './home.css'

function Footer() {
    return (
        <div id="home-footer" className="footer grid">
            <div className="content-wrap">
                <div className="footer-link">
                    <a href="/instructions" target="_blank">Organize an Event</a>
                </div>
                <span> | </span>
                <div className="footer-link">
                    <a href="/contact" target="_blank">Contact</a>    
                </div>
                <span> | </span>                
                <div className="footer-link">
                    <a href="/">Home</a>    
                </div>
                <div id="amazon-disclaimer">
                    Howmanyjellybeans.com is a participant in the 
                    <span> </span>
                    <a href="https://amazon.com" target="_blank" rel="noopener noreferrer">Amazon</a> 
                    <span> </span>
                    Services LLC Associates Program.
                </div>
            </div>
        </div>
    )
}

export default Footer