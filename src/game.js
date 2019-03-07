import React from "react";
import axios from "axios"
import {Link} from "react-router-dom";
import io from "socket.io-client";

var socket = io("http://localhost:5000");


// Components Hierarchy
// -Game
//    -Title
//    -Game info
//        -Access Code
//        -Host
//    -Loading icon
//    -PLAYER TABLE [host inputs]
//        -DELETE PLAYER
//        -UPDATE PLAYER GUESS
//    -OPTIONS
//        -JOIN GAME
//        -LEAVE GAME
//        -END GAME
//    -Footer

function GameInfo(props) {
    const hostsArray = props.hostsArray
    const hostUsernamesArray = hostsArray.map(function(element) {
        return (
            element.username
        )
    })
    const displayLoading = (props.status) ? (
        <div id="game-info">
            <h3>Access Code: {props.accessCode}</h3>
            <h3>Host: {hostUsernamesArray} </h3>
            {props.message}
        </div>
    ) : null 
    return (
        displayLoading
    )
}

function LoadingIcon(props) {
    const displayLoading = (props.status) ? null : (<div>Loading...</div>)
    return (
        displayLoading
    )
}

function JoinGameForm(props) {
    return (
        <form
        name="joinGameClicked"
        onSubmit ={props.handleSubmit}
        >   
            <input 
            name="playerName"
            type="text" 
            placeholder="Enter your name"
            value={props.hostname}
            onChange ={props.handleChange}
            />
            <input 
            name="playerGuess"
            type="text" 
            placeholder="Enter your guess"
            value={props.playerGuess}
            onChange ={props.handleChange}
            />
            <button>Join Game</button>
        </form>
    )
}

function LeaveButton(props) {
    return (
        <div>
            <button 
            name="leaveButton"
            onClick={(e) => props.onClick(e)}>
            Leave Game
            </button>
        </div>
    )
}

function EndButton(props) {
    return (
        <div>
            <button 
            name="endButton"
            onClick={(e) => props.onClick(e)}>
            End Game
            </button>
        </div>
    )
}

function DeletePlayerButton(onClick, playerID, isHost) {
    return (isHost) ? (
        <button 
        name="deletePlayerButton"
        data-id={playerID} 
        onClick={(e) => {
            onClick(e)
        }}>
        <i className="fas fa-times"></i>
        </button>
    ) : (null)
}

class Options extends React.Component {
    renderJoinGameForm() {
        return (
            <JoinGameForm 
            key="joinGameForm"
            handleSubmit={this.props.handleSubmit}
            handleChange={this.props.handleChange}
            />
        )
    }
    renderLeaveButton() {
        return (
            <LeaveButton 
            key="leaveButton"
            onClick={(option) => this.props.onClick(option)}
            />
        );
    }

    renderEndButton() {
        return (
            <EndButton
            key="endButton"
            onClick={(option) => this.props.onClick(option)}
            />
        );
    }

    render() {
        const isHost = this.props.isHost
        const inDB = this.props.inDB
        const displayArray = []
        const status = this.props.status
        const gameEnded = this.props.gameEnded
        if(inDB && isHost) {
            displayArray.push("leaveButton")
            displayArray.push("endButton")
        }
        if(inDB && !isHost) {
            displayArray.push("leaveButton")
        }
        if(!inDB) {
            displayArray.push("joinGameForm")
        }
        const options = {
            "endButton": this.renderEndButton(),
            "leaveButton": this.renderLeaveButton(),
            "joinGameForm": this.renderJoinGameForm()
        }
        const display = (status && !gameEnded) ? displayArray.map(function(element) {
            let option
            if(options.hasOwnProperty(element)) {
                option = options[element]
            }
            return (option)
        }) : null
        return (
            <div id="game-options">
                {display}
            </div>
        )
    }
}

class PlayerTable extends React.Component {
    render() {
        const playerMap = this.props.playerMap
        const players = this.props.players
        const gameEnded = this.props.gameEnded
        const inDB = this.props.inDB
        const status = this.props.status

        const displayPlayers = () => {
            if(!inDB || !status) {
                return null
            }
            if(players.length !== 0) {
                return (!gameEnded) ? (
                <div id="player-table">
                    <div className="content-wrap">
                        <div className="nested-grid">
                            <div className="item">Player</div>
                            <div className="item">Guess</div>
                            {playerMap}
                        </div>
                    </div>
                </div>
            ) : (
                <div id="player-table-ranked">
                    <div className="content-wrap">
                        <div className="nested-grid">
                            <div className="item">Rank</div>
                            <div className="item">Player</div>
                            <div className="item">Guess</div>
                            {playerMap}
                        </div>
                    </div>
                </div>
            )
            }
        }
        
        return (
            <div>
                {displayPlayers()}
            </div>
        )
    }
}

function Footer() {
    return (
        <div id="home-footer" className="grid">
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

function subscribeToDatabase({accessCode, getUpdates}) {
    socket.on('connect', function() {
        socket.emit('subscribeToDatabase', accessCode);
        getUpdates()
    });
    socket.on('databaseUpdated', databaseUpdated => {
        // console.log(`Database Updated: ${databaseUpdated}`);
        if(databaseUpdated) {
            getUpdates()
        }
    });
}

class Game extends React.Component {
    constructor(props) {
        super(props)
        this._isMounted = false;
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.state = {
            accessCode: this.props.match.params.id,
            players: [],
            status: false,
            isHost: false,
            gameEnded: false,
            inDB: false,
            playerName: "",
            playerGuess: null,
            correctGuess: ""
        }
    }

    async getGameStatus() {
        try {
            const response = await axios(`/api/${this.state.accessCode}/status`)
            this._isMounted && this.setState({gameEnded: response.data.message})
            return response.data.message
        } catch (error) {
            return error.response.data.status
        }
    }

    async getPlayers() {
        try {
            const response = await axios(`/api/${this.state.accessCode}/players`)
            return response
        } catch (error) {
            return error.response
        }
    }

    async loadData(gameEnded) {
        const response = (gameEnded) ? await this.getSortedPlayers() : await this.getPlayers()
        if(response.data.message === "Unauthorized") {
            return this.props.history.push({pathname: "/unauthorized", state: {accessCode: this.state.accessCode}})
        } 
        else if(response.data.message === "Invalid access code") {
            return this.props.history.push("/invalidaccesscode")
        }
        const data = response.data.message
        if(response.data.status === true){
            this._isMounted && this.setState({players: data, status: true, 
                                              inDB: response.data.inDB,
                                              matchesSession: response.data.matchesSession,
                                              gameEnded: response.data.gameEnded
                                              })
            if(response.data.isHost === true) {
                this._isMounted && this.setState({isHost: true})
            }
        } else {
            this._isMounted && this.setState({players: [], status: false})
            this._isMounted && this.setState({accessCode: data})
        }  
    }

    playerMap() { 
        const players = this.state.players
        const gameEnded = this.state.gameEnded
        const onClick = (option) => this.handleClick(option)
        const isHost = this.state.isHost
        const playersWithoutHost = players.filter(function(element) {
            return element.host === false
        })
        const playerIndicator = (element) => {
            return (element.currentPlayer === true) ? " (you)" : ""
        }
        if(this.state.status) {
            return playersWithoutHost.map(function(element) {
                return (!gameEnded) ? (
                    <React.Fragment key={element.id}>
                        <div className="item">
                            {element.username + playerIndicator(element)}
                            {DeletePlayerButton(onClick, element.id, isHost)}
                        </div>
                        <div className="item">
                            {element.guess}
                        </div>
                    </React.Fragment>
                ) : (
                    <React.Fragment key={element.id}>
                        <div className="item">
                            {element.rank}
                        </div>
                        <div className="item">
                            {element.username}
                        </div>
                        <div className="item">
                            {element.guess}
                        </div>
                    </React.Fragment>
                )
            })
        } else {
            return (null)
        }
    }

    handleClick(e) {
        const buttonElement = e.target
        const option = buttonElement.name
        if(option === "leaveButton") {
            this.leaveGame(this.state.accessCode)
        }        
        if(option === "endButton") {
            this.endGame(this.state.accessCode)
        }
        if(option === "deletePlayerButton") {
            const playerID = buttonElement.dataset.id
            this.deletePlayer(this.state.accessCode, playerID)
        }
    }

    async handleSubmit(event) {
        event.preventDefault()
        const eventType = event.target.name
        const accessCode = this.state.accessCode
        const playerName = this.state.playerName
        const playerGuess = this.state.playerGuess
        switch(eventType) {
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

    handleChange(event) {
        const eventType = event.target.name
        switch(eventType) {
            case "playerName":
            this.setState({playerName: event.target.value})
            break

            case "playerGuess":
            this.setState({playerGuess: event.target.value})
            break

            default: 
                console.log("error")
        }
    }

    async deletePlayer(accessCode, playerID) {
        try {
            const response = await axios.put("/api/deletePlayer", 
            {    
                "accessCode": accessCode,
                "playerID": playerID
            })
            return response
        } catch (error) {
            return error.response
        }
    }

    async leaveGame(accessCode) {
        try {
            const response = await axios.put("/api/leaveGame", 
            {    
                "accessCode": accessCode
            })
            return response
        } catch (error) {
            return error.response
        }
    }

    async getSortedPlayers() {
        const accessCode = this.state.accessCode
        try {
            const response = await axios.get(`/api/${accessCode}/sortPlayers`, 
            {    
                "accessCode": accessCode
            })
            return response
        } catch (error) {
            return error.response
        }
    }

    async endGame(accessCode) {
        try {
            const response = await axios.put(`/api/${accessCode}/endGame`, 
            {    
                "accessCode": accessCode
            })
            if (response.data.gameEnded) {
                this.setState({gameEnded: true, status: false})
            } else {
                this.setState({gameEnded: false})
            }
            return response
        } catch (error) {
            return error.response
        }
    }
    
    async componentDidMount() {
        this._isMounted = true
        this._isMounted && subscribeToDatabase({
        accessCode: this.state.accessCode, 
        getUpdates: async () => {
            let gameEnded = await this.getGameStatus()
            if(gameEnded) {this.setState({status: false})}
            await this.loadData(gameEnded)
        }}
        )
        
    }

    componentWillUnmount() {
        this._isMounted = false
        socket.removeAllListeners("timer");
    }

    render() {
        const message = (this.state.gameEnded) ? (<h3>Game over!</h3>) : (<div></div>)
        const hostsArray = this.state.players.filter(function(element) {
            return element.host === true
        })
        return (
            <div id="game">
                <h2>How many jellybeans?</h2>
                <GameInfo 
                accessCode = {this.state.accessCode}
                hostsArray = {hostsArray}
                message = {message}
                status = {this.state.status}
                />
                <LoadingIcon
                status = {this.state.status}
                />
                <PlayerTable
                playerMap = {this.playerMap()}
                players = {this.state.players}
                gameEnded = {this.state.gameEnded}
                inDB = {this.state.inDB}
                status = {this.state.status}
                />
                <Options
                onClick = {(option) => this.handleClick(option)}
                isHost = {this.state.isHost}
                inDB = {this.state.inDB}
                handleChange = {this.handleChange}
                handleSubmit = {this.handleSubmit}
                status = {this.state.status}
                gameEnded = {this.state.gameEnded}
                />
                <Footer/>
            </div>
        )
    }
}

export default Game

function isNumerical(guess) {
    return (isNaN(guess)) ? false : true
}

// package.json scripts
// "start": "react-scripts start"
// "build": "react-scripts build",
// "test": "react-scripts test",
// "eject": "react-scripts eject"

//"proxy": "http://localhost:5000"