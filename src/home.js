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

function GameForm(props) {
    return (
        <form onSubmit ={props.handleSubmit}>
            <input 
            name="hostName"
            type="text" 
            placeholder="Enter your name"
            value={props.hostname}
            onChange ={props.handleChange}
            />
            <input
             name="winningGuess"
             type="text" 
             placeholder="Enter the winning guess"
             value={props.winningGuess}
             onChange ={props.handleChange}
             />
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
            handleSubmit={this.props.handleSubmit}
            handleChange={this.props.handleChange}
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
                option = options[element]
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

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.state = {
            display: ["createGame", "joinGame"],
            createGameClicked: false,
            hostName: "",
            playername: "",
            winningGuess: null
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
    
    handleSubmit(event) {
        this.setState({createGameClicked: true})
        event.preventDefault()
    }

    handleChange(event) {
        const eventType = event.target.name
        switch(eventType) {
            case "hostName":
                this.setState({hostName: event.target.value})
            break
            case "winningGuess":
                this.setState({winningGuess: event.target.value})
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
                handleSubmit = {this.handleSubmit}
                handleChange = {this.handleChange}
                />
                <Footer/>
            </div>
        )
    }
}

export default Home