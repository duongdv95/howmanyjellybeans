import React from "react";
const axios = require("axios")

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
        const players = response.data.message
        if(response.data.status === true){
            this.setState({players: players, status: true})
        } else {
            this.setState({players: players, status: false})
        }
    }

    componentDidMount() {
        this.loadData()
        setInterval(() => {
            this.loadData()
        }, 2000)
    }

    render() {
        const players = this.state.players
        const displayPlayers = (this.state.status) ? players.map(function(element) {
            return (
                <div key={element.id}>
                {element.username}, {element.guess}, {element.host + ""}
                </div>
            )
        }) : (
            <div>
                {players}
            </div>
        )
        return (
            <div>
                <h1>Waiting for players...</h1>
                {displayPlayers}
            </div>
        )
    }
}

export default Game
