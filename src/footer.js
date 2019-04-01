import React from "react";
import {Link} from "react-router-dom";
import './home.css'

function Footer() {
    return (
        <div id="home-footer" className="footer grid">
            <div className="content-wrap">
                <div>
                    <Link to={"/instructions"} target="__blank">Organize an event</Link>
                </div>
                <div>
                    <Link to={"/about"} target="__blank">About</Link>    
                </div>
            </div>
        </div>
    )
}

export default Footer