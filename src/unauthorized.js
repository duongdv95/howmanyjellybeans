import React from "react";
import {Link} from "react-router-dom";

class Unauthorized extends React.Component {
    render() {
        return (
            <div>
                <h1>Unauthorized</h1>
                <Link to={`/${this.props.location.state.accessCode}`}>Go Back</Link>
            </div>
        )
    }
}

export default Unauthorized