import React from "react";
import axios from "axios"

// Components Hierarchy
// -Game
//    -PLAYER TABLE [host inputs]
//        -DELETE PLAYER
//        -UPDATE PLAYER GUESS
//    -OPTIONS
//        -LEAVE GAME
//        -END GAME
//    -Footer

function LeaveButton(props) {
    return (
        <button onClick={() => props.onClick("leaveButton")}>
        Leave Game
        </button>
    )
}

function EndButton(props) {
    return (
        <button onClick={() => props.onClick("endButton")}>
        End Game
        </button>
    )
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
        this.state = {
            accessCode: this.props.match.params.id,
            players: [],
            status: false,
            isHost: false,
            gameEnded: false
        }
    }

    async getGameStatus() {
        try {
            const response = await axios(`/${this.state.accessCode}/status`)
            return response.data.message
        } catch (error) {
            return error.response
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
        // console.log(response.data.message)
        const data = response.data.message
        if(response.data.status === true){
            this.setState({players: data, status: true})
            if(response.data.isHost === true) {
                this.setState({isHost: true})
            }
        } else {
            this.setState({players: [], status: false})
            this.setState({accessCode: data})
        }  
    }

    playerMap() { 
        const players = this.state.players
        const gameEnded = this.state.gameEnded
        if(this.state.status) {
            return players.map(function(element) {
                return (!gameEnded) ? (
                    <tr key={element.id}>
                        <td>
                            {element.username}
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
            return (<tr><td></td></tr>)
        }
    }

    handleClick(option) {
        if(option === "leaveButton") {
            this.leaveGame(this.state.accessCode)
        }        
        if(option === "endButton") {
            this.endGame(this.state.accessCode)
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
        const gameEnded = await this.getGameStatus()
        this.setState({gameEnded})
        this.loadData(this.state.gameEnded)
        this.myInterval = setInterval(() => {
            this.loadData(this.state.gameEnded)
        }, 1000)
    }

    componentWillUnmount() {
        clearInterval(this.myInterval)
    }

    render() {
        return (
            <div>
                <h1>How many jellybeans?</h1>
                <h3>Access Code: {this.state.accessCode}</h3>
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
