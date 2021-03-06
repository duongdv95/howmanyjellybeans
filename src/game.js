import React from "react";
import axios from "axios"
import io from "socket.io-client";
import Footer from './footer.js';
import debounce from "lodash.debounce";
// var URL    = process.env.REACT_APP_PRODUCTIONSITE || "http://localhost:5000"
var URL    = "https://jellybean-app.herokuapp.com"
var socket = io(URL);

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
    let winningNumber = (<h3>Winning Number: {props.winningNumber}</h3>)
    const hostsArray = props.hostsArray
    const hostUsernamesArray = hostsArray.map(function(element) {
        let hostUserName = element.username
        if(element.currentPlayer === true) {
            hostUserName = hostUserName + " (you)"
        } else if (props.winningNumber === null) {
            winningNumber = null
        }
        return (
            hostUserName
        )
    })
    
    const displayLoading = (props.status) ? (
        <div id="game-info">
            <h3>Access Code: {props.accessCode}</h3>
            {winningNumber}
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

function ApprovePlayerCheckBox({handleChange, playerID, isHost, approved}) {
    let playerApprovedMessage = (approved) ? "Yes":"Pending"
    let checked = approved
    return (isHost) ? (
        <label className="switch">
            <input 
            name="approvePlayerCheckBox"
            type="checkbox"
            checked={checked}
            data-id={playerID} 
            onChange ={handleChange}
            ></input>
            <span className="slider"></span>
        </label>
    ) : (playerApprovedMessage)
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
            // displayArray.push("leaveButton")
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
                            <div className="item">Approved</div>
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

function subscribeToDatabase({accessCode, getUpdates, lastUpdated}) {
    var debounceUpdate = debounce(getUpdates, 1500, {
        "leading": false,
        "trailing": true
    })
    socket.on('connect', function() {
        socket.emit('subscribeToDatabase', accessCode);
        getUpdates()
    });
    socket.on('databaseUpdated', databaseUpdated => {
        // console.log(`Database Updated: ${databaseUpdated}`);
        if(databaseUpdated) {
            lastUpdated()
            debounceUpdate()
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
            accessCode: this.getLowerCaseAccessCode(),
            players: [],
            status: false,
            isHost: false,
            gameEnded: false,
            inDB: false,
            playerName: "",
            playerGuess: null,
            winningNumber: "",
            awaitingUpdate: false,
            message: null,
            lastUpdated: this.lastUpdated()
        }
    }

    getLowerCaseAccessCode() {
        let accessCode = this.props.match.params.id + ""
        return accessCode.toLowerCase()
    }

    lastUpdated() {
        var currentDate = new Date()
        currentDate.setMilliseconds(0)
        return currentDate
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
        var updateState = () => {
            this.setState({players: data, status: true, 
                inDB: response.data.inDB,
                matchesSession: response.data.matchesSession,
                gameEnded: response.data.gameEnded,
                winningNumber: response.data.winningNumber
            })
            this.setState({awaitingUpdate: false})
            this.setState({message: (<h3 className="message">Ready!</h3>)})
        }
        if(response.data.status === true){
            this._isMounted && updateState()
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
        const handleChange = (option) => this.handleChange(option)
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
                        <div className="item">
                            {ApprovePlayerCheckBox({
                                handleChange, 
                                playerID: element.id, 
                                isHost, approved: 
                                element.approved})}
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
            var endGame = window.confirm('Are you sure you want to end the game?')
            if(endGame){
                this.endGame(this.state.accessCode)
            } else {

            }
        }
        if(option === "deletePlayerButton") {
            const playerID = buttonElement.dataset.id
            this.deletePlayer(this.state.accessCode, playerID)
            this.setState({awaitingUpdate: true, message: (<div><h3 className="message">Deleting player...</h3><div className="lds-ring"><div></div><div></div><div></div><div></div></div></div>)})
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
                    if(!response.data.status) {
                        this.setState({message: (<h3 className="message">{response.data.message}</h3>)})
                    }
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
    
    async handleChange(event) {
        const eventType = event.target.name
        switch(eventType) {
            case "playerName":
            this.setState({playerName: event.target.value})
            break
            
            case "playerGuess":
            this.setState({playerGuess: event.target.value})
            break
            
            case "approvePlayerCheckBox":
            if(!this.state.awaitingUpdate) {
                this.setState({awaitingUpdate: true, message: (<div><h3 className="message">Updating players...</h3><div className="lds-ring"><div></div><div></div><div></div><div></div></div></div>)})
                const playerID = event.target.dataset.id
                this.setState(this.updateApprovedPlayers(playerID, this.state.accessCode))
            }
            break
            
            default: 
            console.log("error")
        }
    }
    
    updateApprovedPlayers(playerID, accessCode) {
        return async (previousState) => {
            // console.table(previousState.players)
            let index
            for(let i = 0; i < previousState.players.length; i++) {
                if(previousState.players[i].id === playerID) {
                    index = i
                    break
                }
            }
            previousState.players[index].approved = !previousState.players[index].approved
            
            
            const response = await this.approvePlayer(accessCode, playerID, previousState.players[index].approved)
            return (response.data.status) ? {players: previousState.players} : {}
            
        }
    }
    
    async approvePlayer(accessCode, playerID, playerApproved) {
        try {
            const response = await axios.put("/api/approvePlayer", 
            {    
                "accessCode": accessCode,
                "playerID": playerID,
                "approved": playerApproved
            })
            if(response.data.status) {
            }
            return response
        } catch (error) {
            return error.response
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
    
    async getUpdates() {
        let gameEnded = await this.getGameStatus()
        if(gameEnded) {this.setState({status: false, message: (<h3>Game over!</h3>)})}
        await this.loadData(gameEnded)
    }

    async componentDidMount() {
        this._isMounted = true
        this._isMounted && subscribeToDatabase({
        accessCode: this.state.accessCode, 
        getUpdates: async () => {
            await this.getUpdates()
        },
        lastUpdated: () => {
            this.setState({lastUpdated: this.lastUpdated()})
        }
    })
        this.getUpdates()
    }


    componentWillUnmount() {
        this._isMounted = false
        socket.removeAllListeners("timer");
    }

    render() {
        const message = this.state.message
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
                winningNumber = {this.state.winningNumber}
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