import React from "react";
import {Link} from "react-router-dom";

class Unauthorized extends React.Component {
    render() {
        let accessCode
        try {
            accessCode = this.props.location.state.accessCode
        } catch (e) {
            accessCode = ""
        }
        return (
            <div>
                <h1>Unauthorized</h1>
                <Link to={`/${accessCode}`}>Go Back</Link>
            </div>
        )
    }
}

export default Unauthorized