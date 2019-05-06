import React from "react";
import {Link} from "react-router-dom";
import Footer from './footer.js';

class About extends React.Component {
    render() {
        return (
    <React.Fragment>
    <div id="about" className="grid">
        <div className="content-wrap">
            <h2>About the author</h2>
        </div>
    </div>
    <Footer/>
</React.Fragment>
        )
    }
}

export default About