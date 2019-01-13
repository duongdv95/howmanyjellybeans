import React from "react";
import {Link} from "react-router-dom";
import './home.css'

// Components Hierarchy
// -HOME
//    -IMG
//    -OPTIONS [user inputs]
//        -CREATE GAME
//        -GAME FORM    
//        -JOIN GAME
//        -JOIN FORM    
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

function BackButton(props) {
    return (
        <button onClick={() => props.onClick("backButton")}>
        Back
        </button>
    )
}

function CreateGameButton(props) {
    return (
        <button onClick={() => props.onClick("createGame")}>
        Create Game
        </button>
    )
}

function GameForm() {
    return (
        <form>
            <input type="text" placeholder="Enter your name"/>
            <input type="text" placeholder="Enter the winning guess"/>
            <input type="submit" value="Create Game"/>
        </form>
    )
}

function JoinGameForm() {
    return (
        <form>
            <input type="text" placeholder="Enter your name"/>
            <input type="text" placeholder="Enter your guess"/>
            <input type="submit" value="Join game"/>
        </form>
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
    renderBackButton() {
        return (
            <BackButton
            key = {"backButton"} 
            onClick={(option) => this.props.onClick(option)}
            />
        );
    }

    renderGameButton() {
        return (
            <CreateGameButton
            key = {"createGame"} 
            onClick={(option) => this.props.onClick(option)}
            />
        );
    }

    renderGameForm() {
        return (
            <GameForm
            key = {"gameForm"} 
            />
        );
    }

    renderJoinGameButton() {
        return (
            <JoinGameButton
            key = {"joinGame"}
            onClick={(option) => this.props.onClick(option)}
            />
        );
    }

    renderJoinGameForm() {
        return (
            <JoinGameForm
            key = {"joinGameForm"} 
            />
        );
    }

    render() {
        const displayArray = this.props.display
        const options = {
            "createGame": this.renderGameButton(),
            "joinGame": this.renderJoinGameButton(),
            "gameForm": this.renderGameForm(),
            "backButton": this.renderBackButton(),
            "joinGameForm": this.renderJoinGameForm()
        }
        const display = displayArray.map(function(element) {
            let option
            if(options.hasOwnProperty(element)) {
                option =options[element]
            }
            return (option)
        })
        return (
            <div className ="options">
                {display}
            </div>
        )
    }
}

class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            display: ["createGame", "joinGame"]
        }
    }

    handleClick(option) {
        switch(option) {
            case "createGame":
                this.setState({display: ["gameForm", "backButton"]})
                break
            case "joinGame":
                this.setState({display: ["joinGameForm", "backButton"]})
                break
            case "backButton":
                this.setState({display: ["createGame", "joinGame"]})
                break
            default: console.log("error")
        }
    }
    
    render() {
        return (
            <div className = "home">
                <Image/>
                <Options 
                display = {this.state.display}
                onClick = {(options) => this.handleClick(options)}
                />
                <Footer/>
            </div>
        )
    }
}

export default Home