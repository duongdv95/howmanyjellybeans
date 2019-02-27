import React from "react";

function HowToPlay() {
    return (
        <div id="instructions">
        <h2>Organize a family/work event</h2>
        <ul>
            <li>Get a jar</li>
            <li>Fill it with hershey kisses or jellybeans that you have counted</li>
            <li>Create a game making sure to enter the winning number</li>
            <li>Have people join on their phones via the access code</li>
            <li>End the game when you are ready</li>
        </ul>
        </div>
    )
}

class Instructions extends React.Component {
    render() {
        return (
            <HowToPlay/>
        )
    }
}

export default Instructions