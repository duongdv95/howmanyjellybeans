import React from "react";
import axios from "axios"

// Components Hierarchy
// -Game
//    -Title
//    -Access Code
//    -Loading icon
//    -PLAYER TABLE [host inputs]
//        -DELETE PLAYER
//        -UPDATE PLAYER GUESS
//    -OPTIONS
//        -JOIN GAME
//        -LEAVE GAME
//        -END GAME
//    -Footer
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
            <input type="submit" value="Join game"/>
        </form>
    )
}

function LeaveButton(props) {
    return (
        <button 
        name="leaveButton"
        onClick={(e) => props.onClick(e)}>
        Leave Game
        </button>
    )
}

function EndButton(props) {
    return (
        <button 
        name="endButton"
        onClick={(e) => props.onClick(e)}>
        End Game
        </button>
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
        X
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
        const display = (status) ? displayArray.map(function(element) {
            let option
            if(options.hasOwnProperty(element)) {
                option = options[element]
            }
            return (option)
        }) : null
        return (
            display
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
                <table>
                    <tbody>
                        <tr>
                            <th>
                                Player
                            </th>
                            <th>
                                Guess
                            </th>
                        </tr>
                        {playerMap}
                    </tbody>
                </table>
            ) : (
                <table>
                    <tbody>
                        <tr>
                            <th>
                                Player
                            </th>
                            <th>
                                Guess
                            </th>
                            <th>
                                Rank
                            </th>
                        </tr>
                        {playerMap}
                    </tbody>
                </table>
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
            playerGuess: null
        }
    }

    async getGameStatus() {
        try {
            const response = await axios(`/${this.state.accessCode}/status`)
            this._isMounted && this.setState({gameEnded: response.data.message})
            return response.data.message
        } catch (error) {
            return error.response.data.status
        }
    }

    async getPlayers() {
        try {
            const response = await axios(`/${this.state.accessCode}/players`)
            return response
        } catch (error) {
            return error.response
        }
    }

    async loadData(gameEnded) {
        const response = (gameEnded) ? await this.getSortedPlayers() : await this.getPlayers()
        if(this.state.accessCode === "Unauthorized") {
            this.props.history.push(`/unauthorized`)
        } 
        const data = response.data.message
        if(response.data.status === true){
            this._isMounted && this.setState({players: data, status: true, 
                                              inDB: response.data.inDB,
                                              matchesSession: response.data.matchesSession
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
                    <tr key={element.id}>
                        <td>
                            {element.username + playerIndicator(element)}
                            {DeletePlayerButton(onClick, element.id, isHost)}
                        </td>
                        <td>
                            {element.guess}
                        </td>
                    </tr>
                ) : (
                    <tr key={element.id}>
                        <td>
                            {element.username}
                        </td>
                        <td>
                            {element.guess}
                        </td>
                        <td>
                            {element.rank}
                        </td>
                    </tr>
                )
            })
        } else {
            return (null)
            //<tr><td></td></tr>
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
            const response = await axios.post("/addplayer", 
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
            const response = await axios.put("/deletePlayer", 
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
            const response = await axios.put("/leaveGame", 
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
            const response = await axios.get(`/${accessCode}/sortPlayers`, 
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
            const response = await axios.put(`/${accessCode}/endGame`, 
            {    
                "accessCode": accessCode
            })
            if (response.data.gameEnded) {
                this.setState({gameEnded: true})
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
        this._isMounted && this.getGameStatus()
        this.loadData(this.state.gameEnded)
        this.myInterval = setInterval(() => {
            this.loadData(this.state.gameEnded)
        }, 2000)
    }

    componentWillUnmount() {
        this._isMounted = false
        clearInterval(this.myInterval)
    }

    render() {
        const message = (this.state.gameEnded) ? (<h3>Game over!</h3>) : (<div></div>)
        const hostsArray = this.state.players.filter(function(element) {
            return element.host === true
        })
        const hostsElement = hostsArray.map(function(element) {
            return (
                element.username
            )
        })
        return (
            <div>
                <h1>How many jellybeans?</h1>
                <h3>Access Code: {this.state.accessCode}</h3>
                <h3>Host: {hostsElement} </h3>
                {message}
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
                />
            </div>
        )
    }
}

export default Game

function isNumerical(guess) {
    return (isNaN(guess)) ? false : true
}