import React from "react";
import {Link} from "react-router-dom";

class Invalid extends React.Component {
    render() {
        let accessCode
        try {
            accessCode = this.props.location.state.accessCode
        } catch (e) {
            accessCode = ""
        }
        return (
            <div>
                <h1>Invalid Access Code</h1>
                <Link to={`/${accessCode}`}>Click to go back home</Link>
            </div>
        )
    }
}

export default Invalid