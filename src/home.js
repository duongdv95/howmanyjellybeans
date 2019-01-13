import React from "react";
import {Link} from "react-router-dom";

// Components Hierarchy
// -HOME
//    -IMG
//    -OPTIONS [user inputs]
//        -NEW GAME    
//        -JOIN GAME    
//    -Footer

function Image() {
    return (
        <img src={"https://images.unsplash.com/photo-1519687079572-8a59631f3685?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80"} width="400" alt="MERP"/>
    )
}

function Footer() {
    return (
        <div className="footer">
            <Link to={"/instructions"}>Instructions</Link>
        </div>
    )
}

function CreateGameButton(props) {
    return (
        <button onClick={() => props.onClick("createGame")}>
        Create Game
        </button>
    )
}

function JoinGameButton(props) {
    return (
        <button onClick={() => props.onClick("joinGame")}>
        Join Game
        </button>
    )
}

class Options extends React.Component {
    renderCreateGame() {
        return (
            <CreateGameButton 
            onClick={(option) => this.props.onClick(option)}
            />
        );
    }

    renderJoinGame() {
        return (
            <JoinGameButton 
            onClick={(option) => this.props.onClick(option)}
            />
        );
    }
    render() {
        return (
            <div className ="options">
                {this.renderCreateGame()}
                {this.renderJoinGame()}
            </div>
        )
    }
}

class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            createGame: false,
            joinGame: false
        }
    }

    handleClick(option) {
        switch(option) {
            case "createGame":
                var createGame = this.state.createGame
                createGame = !createGame
                this.setState({createGame})
                break
            case "joinGame":
                var joinGame = this.state.joinGame
                joinGame = !joinGame
                this.setState({joinGame})
                break
            default: console.log("error")
        }
    }
    
    render() {
        return (
            <div className = "home">
                <Image/>
                <h1>How many jelly beans??</h1>
                <Options
                onClick = {(options) => this.handleClick(options)}
                />
                <Footer/>
            </div>
        )
    }
}

export default Home