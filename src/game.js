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

class Options extends React.Component {
    renderLeavebutton() {
        return (
            <LeaveButton 
            onClick={(option) => this.props.onClick(option)}
            />
        );
    }
    render() {
        return (
            this.renderLeavebutton()
        )
    }
}

class PlayerTable extends React.Component {

    render() {
        const playerMap = this.props.playerMap
        const players = this.props.players
        const displayPlayers = () => {
            return (players.length !== 0) ? 
            (
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
            ) 
            : 
            (<div>Loading...</div>)
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
            status: false
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

    async loadData() {
        const response = await this.getPlayers()
        const data = response.data.message
        if(response.data.status === true){
            this.setState({players: data, status: true})
        } else {
            this.setState({players: [], status: false})
            this.setState({accessCode: data})
        }
    }

    playerMap() { 
        const players = this.state.players
        if(this.state.status) {
            return players.map(function(element) {
                return (
                    <tr key={element.id}>
                        <td>
                            {element.username}
                        </td>
                        <td>
                            {element.guess}
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
            this.leaveGame()
        }
    }

    async leaveGame(playerID, accessCode) {
        try {
            const response = await axios.post("/addplayer", 
            {    
                "playerID": playerID,
                "accessCode": accessCode
            })
            return response
        } catch (error) {
            return error.response
        }
    }
    
    componentDidMount() {
        this.loadData()
        setInterval(() => {
            this.loadData()
        }, 2000)
    }

    render() {
        return (
            <div>
                <h1>How many jellybeans?</h1>
                <h3>Access Code: {this.state.accessCode}</h3>
                <PlayerTable
                playerMap = {this.playerMap()}
                players = {this.state.players}
                />
                <Options
                onClick = {(option) => this.handleClick(option)}
                />
            </div>
        )
    }
}

export default Game
