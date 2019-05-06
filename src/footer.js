import React from "react";
import './home.css'

function Footer() {
    return (
        <div id="home-footer" className="footer grid">
            <div className="content-wrap">
                <div>
                    <a href="/instructions" target="_blank">Organize an event</a>
                </div>
                <div>
                    <a href="/contact" target="_blank">Contact</a>    
                </div>
            </div>
        </div>
    )
}

export default Footer