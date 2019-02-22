import React from "react";
import {Link} from "react-router-dom";
import './home.css'
import axios from "axios"

// Components Hierarchy
// -HOME
//    -IMG
//    -OPTIONS [user inputs]
//        -CREATE GAME
//        -GAME FORM    
//        -JOIN GAME
//        -JOIN FORM    
//    -Footer

function Header() {
    return (
        <div id="home-header" className ="grid">
            <div className="content-wrap">
                <h2>
                    How many jellybeans?
                </h2>
                <div className="bg-image"></div>
            </div>
        </div>
    )
}

function Footer() {
    return (
        <div id="home-footer" className="footer grid">
            <div className="content-wrap">
                <div>
                    <Link to={"/instructions"}>Organize an event</Link>
                </div>
                <div>
                    <Link to={"/about"}>About</Link>    
                </div>
            </div>
        </div>
    )
}

function CreateGameButton(props) {
    return (
        <div>
            <button onClick={() => props.onClick("createGame")}>
                Create Game
            </button>
        </div>
    )
}

function GameForm(props) {
    return (
        <form 
        name="createGameClicked"
        onSubmit ={props.handleSubmit}
        >
            <input 
            name="hostName"
            type="text" 
            placeholder="Enter your name"
            value={props.hostname}
            onChange ={props.handleChange}
            />
            <input
            name="winningNumber"
            type="text" 
            placeholder="Enter the winning guess"
            value={props.winningNumber}
            onChange ={props.handleChange}
            />
            <div>
                <button> Create Game </button>
            </div>
            <div>
                <button type="button" onClick={() => props.onClick("backButton")}>
                    Back
                </button>
            </div>
        </form>
    )
}

function JoinGameForm(props) {
    return (
        <form
        name="joinGameClicked"
        onSubmit ={props.handleSubmit}
        >
            <input 
            className="input"
            name="accessCode"
            type="text" 
            placeholder="Enter an access code"
            value={props.accessCode}
            onChange ={props.handleChange}
            />     
            <input 
            className="input"
            name="playerName"
            type="text" 
            placeholder="Enter your name"
            value={props.hostname}
            onChange ={props.handleChange}
            />
            <input 
            className="input"
            name="playerGuess"
            type="text" 
            placeholder="Enter your guess"
            value={props.playerGuess}
            onChange ={props.handleChange}
            />
            <div>
                <button>Join Game</button>
            </div>
            <div>
                <button type="button" onClick={() => props.onClick("backButton")}>
                    Back
                </button>
            </div>
        </form>
    )
}

function JoinGameButton(props) {
    return (
        <div>
            <button onClick={() => props.onClick("joinGame")}>
            Join Game
            </button>
        </div>
    )
}

class Options extends React.Component {
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
            onClick={(option) => this.props.onClick(option)}
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
            handleSubmit={this.props.handleSubmit}
            handleChange={this.props.handleChange}
            onClick={(option) => this.props.onClick(option)}
            />
        );
    }

    render() {
        const displayArray = this.props.display
        const options = {
            "createGame": this.renderGameButton(),
            "joinGame": this.renderJoinGameButton(),
            "gameForm": this.renderGameForm(),
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
            <div id="home-options" className ="grid">
                <div className="content-wrap">
                    {display}
                </div>
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
            hostName: "",
            playername: "",
            winningNumber: null,
            accessCode: null,
            playerName: "",
            playerGuess: "",
            response: ""
        }
    }

    getAccessCode(hostName, winningNumber) {
        try {
            const response = axios.post("/api/createGame", {
                "username": hostName,
                "winningNumber": winningNumber
            })
            return response
        } catch (error) {
            return error.response
        }
    }

    async joinGame(accessCode, playerName, playerGuess) {
        try {
            const response = await axios.post("/api/addplayer", 
            {    
                "username": playerName,
                "guess": playerGuess,
                "accessCode": accessCode
            })
            return response
        } catch (error) {
            return error.response
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
    
    async handleSubmit(event) {
        event.preventDefault()
        const eventType = event.target.name
        const hostName = this.state.hostName
        const winningNumber = this.state.winningNumber
        const accessCode = this.state.accessCode
        const playerName = this.state.playerName
        const playerGuess = this.state.playerGuess
        switch(eventType) {
            case "createGameClicked":
                if(
                    winningNumber &&
                    isNumerical(winningNumber) &&
                    hostName && hostName.length > 0
                ) {
                    const response = await this.getAccessCode(hostName, winningNumber)
                    if (response.data.status === true) {
                        const accessCode = response.data.message
                        this.props.history.push(`/${accessCode}`)
                    } else {
                        this.setState({errorMessage: response.data.message})
                    }
                }
                break
            case "joinGameClicked":
                if(
                    accessCode &&
                    isNumerical(playerGuess) &&
                    playerName && playerName.length > 0
                ) {
                    const response = await this.joinGame(accessCode, playerName, playerGuess)
                    return (response.data.status === true) ? this.props.history.push(`/${accessCode}`) : this.setState({response: response.data})
                }
                break
            default: console.log("error")
        }
    }

    handleChange(event) {
        const eventType = event.target.name
        switch(eventType) {
            case "hostName":
            this.setState({hostName: event.target.value})
            break

            case "winningNumber":
            this.setState({winningNumber: event.target.value})
            break

            case "playerName":
            this.setState({playerName: event.target.value})
            break

            case "accessCode":
            this.setState({accessCode: event.target.value})
            break

            case "playerGuess":
            this.setState({playerGuess: event.target.value})
            break

            default: 
                console.log("error")
        }
    }

    
    render() {
        const response = this.state.response
        let errorMessage
        if(response.status === false) {
            errorMessage = (
                <div>{response.message}</div>
            ) 
        } else {
            errorMessage = (
                <div></div>
            )
        }
        return (
            <div id ="home" className="container">
                <Header/>
                <Options
                display = {this.state.display}
                onClick = {(options) => this.handleClick(options)}
                handleSubmit = {this.handleSubmit}
                handleChange = {this.handleChange}
                />
                {errorMessage}
                <Footer/>
            </div>
        )
    }
}

export default Home

function isNumerical(guess) {
    return (isNaN(guess)) ? false : true
}