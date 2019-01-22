import React from "react";
const axios = require("axios")

class PlayersTable extends React.Component {
    render() {
        const displayPlayers = this.props.displayPlayers
        return (
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
                    {displayPlayers}
                </tbody>
            </table>
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

    displayPlayers() { 
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
                <PlayersTable
                displayPlayers = {this.displayPlayers()}
                />
            </div>
        )
    }
}

export default Game
