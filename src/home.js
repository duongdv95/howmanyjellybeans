import React from "react";
import {Link} from "react-router-dom";
import './home.css'
import axios from "axios"
import Footer from './footer.js';
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
    var submitButton
    var nameInput = (props.gameFormStage === 1) ? (
        <input 
        name="hostName"
        type="text" 
        placeholder="Enter your host name"
        value={props.hostName}
        onChange ={props.handleChange}
        />) : null
    var winningNumberInput = (props.gameFormStage === 2) ? (
        <input
        name="winningNumber"
        type="text" 
        placeholder="Enter the winning guess"
        value={props.winningNumber}
        onChange ={props.handleChange}
        />
    ) : null
    if (props.gameFormStage === 1) {
        submitButton = (<button> Submit name </button>)
    }
    if (props.gameFormStage === 2) {
        submitButton = (<button> Submit guess </button>)
    }
    return (
        <form 
        name="createGameClicked"
        onSubmit ={props.handleSubmit}
        data-stage = {props.gameFormStage}
        >
            {nameInput}
            {winningNumberInput}
            <div>
                {submitButton}
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
    var submitButton
    const accessCode = (props.gameFormStage === 1) ? (
        <React.Fragment>
            <input 
            className="input"
            name="accessCode"
            type="text" 
            placeholder="Enter an access code"
            value={props.accessCode}
            onChange ={props.handleChange}
            />
        </React.Fragment>
        ) : null
    const playerName = (props.gameFormStage === 2) ? (
    <React.Fragment>
        <input 
            className="input"
            name="playerName"
            type="text" 
            placeholder="Enter your name"
            value={props.playerName}
            onChange ={props.handleChange}
            />
    </React.Fragment>) : null
    const playerGuess = (props.gameFormStage === 3) ? (
    <React.Fragment>
        <input 
        className="input"
        name="playerGuess"
        type="text" 
        placeholder="Enter your guess"
        value={props.playerGuess}
        onChange ={props.handleChange}
        />
    </React.Fragment>) : null
    if (props.gameFormStage === 1) {
        submitButton = (<button>Submit code</button>)
    }
    if (props.gameFormStage === 2) {
        submitButton = (<button>Submit name</button>)
    }
    if (props.gameFormStage === 3) {
        submitButton = (<button>Submit guess</button>)
    }
    return (
        <form
        name="joinGameClicked"
        onSubmit ={props.handleSubmit}
        data-stage = {props.gameFormStage}
        >
            {accessCode}
            {playerName}
            {playerGuess}
            <div>
                {submitButton}
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
            gameFormStage={this.props.gameFormStage}
            hostName={this.props.hostName}
            winningNumber={this.props.winningNumber}
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
            gameFormStage={this.props.gameFormStage}
            onClick={(option) => this.props.onClick(option)}
            playerName = {this.props.playerName}
            accessCode = {this.props.accessCode}
            playerGuess = {this.props.playerGuess}
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
            winningNumber: "",
            accessCode: "",
            playerName: "",
            playerGuess: "",
            response: "",
            gameFormStage: 0
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
                this.setState({display: ["gameForm", "backButton"], gameFormStage: 1})
                break
            case "joinGame":
                this.setState({display: ["joinGameForm", "backButton"], gameFormStage: 1})
                break
            case "backButton":
                let gameFormStage = this.state.gameFormStage - 1
                if(gameFormStage === 0) {
                    this.setState({display: ["createGame", "joinGame"], gameFormStage})
                } else {
                    this.setState({gameFormStage})
                }
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
        const stage = parseInt(event.target.getAttribute("data-stage"));
        switch(eventType) {
            case "createGameClicked":
                if(stage === 1 && hostName && hostName.length > 0) {
                        this.setState({gameFormStage: 2})
                    }
                if(
                    winningNumber && winningNumber > 0 &&
                    isNumerical(winningNumber)     
                    && stage === 2
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
                if(stage === 1 && accessCode) {
                    this.setState({gameFormStage: 2})
                }
                if(stage === 2 && playerName && playerName.length > 0) {
                    this.setState({gameFormStage: 3})
                }
                if(stage === 3 && isNumerical(playerGuess)) {
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
        let errorMessage = (<div></div>)
        if(response.message ==="Game does not exist") {
            errorMessage = (
                <div>{response.message}.</div>
            )
        }      
        if(response.message ==="User already in game") {
            errorMessage = (
                <div>
                You already joined this game. Click <Link to={`/${this.state.accessCode}`}>here</Link> to return.
                </div>
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
                gameFormStage = {this.state.gameFormStage}
                hostName = {this.state.hostName}
                winningNumber = {this.state.winningNumber}
                playerName = {this.state.playerName}
                accessCode = {this.state.accessCode}
                playerGuess = {this.state.playerGuess}
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