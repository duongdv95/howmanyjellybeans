import React from "react";
import axios from "axios"

// Components Hierarchy
// -Game
//    -Title
//    -Access Code
//    -PLAYER TABLE [host inputs]
//        -DELETE PLAYER
//        -UPDATE PLAYER GUESS
//    -OPTIONS
//        -LEAVE GAME
//        -END GAME
//    -Footer

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
        const displayOptions = () => {
            return (isHost) ? 
            ([this.renderLeaveButton(), this.renderEndButton()]) 
            : 
            ([this.renderLeaveButton()])
        }
        return (
            <div>
                {displayOptions()}
            </div>
        )
    }
}

class PlayerTable extends React.Component {
    render() {
        const playerMap = this.props.playerMap
        const players = this.props.players
        const gameEnded = this.props.gameEnded

        const displayPlayers = () => {
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
            } else {
                return (<div>Loading...</div>)
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
        this.state = {
            accessCode: this.props.match.params.id,
            players: [],
            status: false,
            isHost: false,
            gameEnded: false,
            hostsArray: []
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
        const data = response.data.message
        if(response.data.status === true){
            this._isMounted && this.setState({players: data, status: true})
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
        if(this.state.status) {
            return playersWithoutHost.map(function(element) {
                return (!gameEnded) ? (
                    <tr key={element.id}>
                        <td>
                            {element.username}
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
                <PlayerTable
                playerMap = {this.playerMap()}
                players = {this.state.players}
                gameEnded = {this.state.gameEnded}
                />
                <Options
                onClick = {(option) => this.handleClick(option)}
                isHost = {this.state.isHost}
                />
            </div>
        )
    }
}

export default Game
