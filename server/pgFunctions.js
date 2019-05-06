const knexfile = require("./knexfile.js");
const knex     = require("knex")(knexfile);
const shortid  = require("shortid");

function generateAccessCode() {
    var code = "";
    const possible = "afghijkloqrsuwxy23456789";
    for(var i=0; i < 6; i++){
        code += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return code;
}

function getWinningNumber({accessCode}) {
    return knex("games").where({access_code: accessCode}).select("winning_number")
}

function createTiesArray(absDiffArray) {
    let tieArray = []
    for(let i=0;i<absDiffArray.length;i++) {
        if(typeof tieArray[i] !== "boolean") {
            tieArray[i] = false
        }
        let first = absDiffArray[i]
        let second = absDiffArray[i + 1] || null
        if(first === second) {
            tieArray[i] = true
            tieArray[i+1] = true
        } 
        else if (first !== second && i !== (absDiffArray.length - 1)) {
            tieArray[i+1] = false
        }
    }
    return tieArray
}

async function sortPlayerRank({accessCode}) {
    const [winningNumberResponse] = await getWinningNumber({accessCode});
    var playersResponse = await getPlayers({accessCode, revealSessionID: true})
    if(!playersResponse.status || !winningNumberResponse) {return {status: false, message: "invalid access code"}}
    var playersArrayWithHost = playersResponse.message;
    var hostsArray = playersArrayWithHost.filter(element => element.host === true)
    var playersArray = playersArrayWithHost.filter((element) => 
        element.host === false && element.approved === true
    )
    var winningNumber = winningNumberResponse.winning_number
    playersArray.sort(function(a, b) {
        return Math.abs(winningNumber - a.guess) - Math.abs(winningNumber - b.guess) 
    })
    let absDiffArray = []
    playersArray.forEach(element=> {
        absDiffArray.push(Math.abs(element.guess - winningNumber))
    })
    let tieArray = createTiesArray(absDiffArray);
    let rank = 1
    let trueCounter = 0
    const rankedPlayersArray = playersArray.map(function(obj, index) {
        if(trueCounter === 2) {
            rank ++;
            trueCounter = 0;
        }
        if(tieArray[index] === true) {
            trueCounter++
        } else {
            trueCounter = 2;
        }

        var removeSessionID = {
            "username": obj.username, 
            "guess":obj.guess, 
            "host": obj.host,
            "sessionID": obj.sessionID,
            "id": obj.id,
            "rank": rank,
            "absoluteDifference": Math.abs(obj.guess - winningNumber)}
            return removeSessionID
    })
    const rankedPlayers = rankedPlayersArray.concat(hostsArray);
    const sortPlayerResponse = await knex("games").where({access_code: accessCode}).update({ranked_players: JSON.stringify(rankedPlayers)});
    if (sortPlayerResponse) {
        return {status: true, message: sortPlayerResponse}
    } else {
        return {status: false, message: "Error sorting players!"}
    }
}

async function getSortedPlayersRank({accessCode}) {
    const [response] = await knex("games").where({access_code: accessCode}).select("ranked_players", "winning_number")
    if(!response) {
        return {status: false, message: "Invalid access code"}
    }
    let winningNumber = (response.winning_number) ? response.winning_number : null;
    const gameStatusResponse = await gameStatus({accessCode});
    const rankedPlayers = response.ranked_players
    return  {status: true, message: rankedPlayers, inDB: true, gameEnded: gameStatusResponse.message, winningNumber}
}

async function createGame({playerData, winningNumber}) {
    if(playerData.username.length === 0 || winningNumber.length === 0 || isNaN(winningNumber)) {
        return {status: false, message: "Invalid username or winning number"}
    } else {
        playerData.id = shortid.generate();
        const access_code = generateAccessCode()
        const response = await knex("games").insert(
            {
            access_code, 
            players: JSON.stringify([playerData]), 
            winning_number: winningNumber,
            game_end: false,
            ranked_players: JSON.stringify([])
            }
        )
        return response ? {status: true, message: access_code} : {status: false, message: "Error! could not create game."}
    }
}
async function getGames() {
    const response = await knex("games").select("access_code", "created_at")
    return (response) ? {status: true, message: response} : {status: false, message: "Failed to get games"}
}

async function deleteGame({accessCode}) {
    const response = await knex("games").where({access_code: accessCode}).del();
    return (response) ? {status: true, message: `Succesfully deleted game /${accessCode}`} : {status: false, message: "Invalid access code"}
}

async function endGame({accessCode}) {
    const response = await knex("games").where({access_code: accessCode}).update({game_end: true});
    return (response) ? {status: true, message: `Succesfully ended game /${accessCode}`, gameEnded: true} : {status: false, message: "Invalid access code"}
}

async function gameStatus({accessCode, revealWinningNumber}) {
    const [response] = await knex("games").where({access_code: accessCode}).select("game_end", "winning_number");
    let winningNumber = (revealWinningNumber) ? response.winning_number : null;
    // console.log(response)
    return (response) ? {status: true, message: response.game_end, winningNumber} : {status: false, message: "Invalid access code"}
}

async function getPlayers(args) {
    const accessCode = args.accessCode || null;
    const revealSessionID = args.revealSessionID || false;
    const sessionID = args.sessionID || null
    const [response] = await knex("games").where({access_code: accessCode}).select("players")
    if(!response) {
        return {status: false, message: "Invalid access code"}
    }
    let index, isHost
    if(sessionID) {
        index = getPlayerIndex({playersArray: response.players, sessionID})
        isHost = ((typeof index == "number") && response.players.length > 0) ? response.players[index].host : null 
    }
    const inDB = (typeof index === "number") ? true : false
    const gameStatusResponse = await gameStatus({accessCode, revealWinningNumber: true});
    const playersArray = (revealSessionID) ? response.players : response.players.map(function(obj) {
        const currentPlayer = (obj.sessionID === sessionID) ? true : false
        const removeSessionID = {
            "username": obj.username, 
            "guess":obj.guess, 
            "host": obj.host,
            "id": obj.id,
            "currentPlayer": currentPlayer,
            "approved": obj.approved}
        return removeSessionID
        })
    return response ? {
        status: true, 
        message: playersArray, 
        isHost, 
        inDB, 
        gameEnded: 
        gameStatusResponse.message, 
        winningNumber: gameStatusResponse.winningNumber
    } : {status: false, message: "Invalid access code"}
}

async function approvePlayer(args) {
    const accessCode = args.accessCode
    const playerID = args.playerID
    const playerApproved = args.playerApproved
    if(typeof(playerApproved) !== "boolean") {
        return {status: false, message: "Error. Please enter true or false"}
    }
    var playersResponse = await getPlayers({accessCode, revealSessionID: true})
    if(!playersResponse.status) {return playersResponse}
    var playersArray = playersResponse.message
    var index = getPlayerIndex({playersArray, playerID})
    if(index == null) return {status: false, message: "Player not found."}
    playersArray[index].approved = playerApproved
    const updatePlayerResponse = await knex("games").where({access_code: accessCode}).update({players: JSON.stringify(playersArray)})
    if (updatePlayerResponse) {
        return {status: true, message: playersArray}
    } else {
        return {status: false, message: "Error. Player was not approved."}
    }
}

async function addPlayer({playerData, accessCode}) {
    const guess = playerData.guess
    if(playerData.username.length === 0 || playerData.guess.length === 0 || isNaN(guess) || guess < 0) {
        return {status: false, message: "Invalid username or guess"}
    }
    var playersResponse = await getPlayers({accessCode, revealSessionID: true})
    if(!playersResponse.status) {return playersResponse}
    var playersArray = playersResponse.message
    if (uniqueGuess({guess, playersArray})) {
        playerData.id = shortid.generate();
        playerData.approved = false;
        playersArray.push(playerData)
        const addPlayerResponse = await knex("games").where({access_code: accessCode}).update({players: JSON.stringify(playersArray)})
        if (addPlayerResponse) {
            return {status: true, message: "Succesfully added player."}
        }
    } else {
        return {status: false, message: "Did not add player, guess already in DB."}
    }
}

function uniqueGuess({guess, playersArray}) {
    let uniqueGuess = true;
    for(let i = 0; i < playersArray.length; i++) {
        if(playersArray[i].guess == guess) {
            uniqueGuess = false
            break
        }
    }
    return uniqueGuess
}

function getPlayerIndex(args) {
    const playersArray = args.playersArray
    const playerID = args.playerID
    const sessionID = args.sessionID
    let index = null;
    let arg1 = (playerID) ? "id" : "sessionID"
    let arg2 = (playerID) ? playerID : sessionID
    for(let i = 0; i < playersArray.length; i++) {
        if(playersArray[i][arg1] == arg2) {
            index = i;
            break
        }
    }

    return index
}

// Refactor, functions looks too big
// Also, if a host changes a player to a host, should it be permanent? As in hosts can't be converted back to players
async function updatePlayer(args) {
    const playerID = args.playerID
    const accessCode = args.accessCode
    const host = args.host
    const guess = args.guess
    if(guess && isNaN(guess)) return {status: false, message: "Invalid guess"}

    var guessUndefined = false
    var hostUndefined = false
    if(guess == undefined) guessUndefined = true
    if(host == undefined) hostUndefined = true
    if(!guessUndefined && !hostUndefined) return {status: false, message: "Update either guess or host."}

    var playersResponse = await getPlayers({accessCode, revealSessionID: true})
    if(!playersResponse.status) {return playersResponse}
    var playersArray = playersResponse.message
    var index = getPlayerIndex({playersArray, playerID})
    if(index == null) return {status: false, message: "Player not found."}
    
    let isOnlyHost = (guessUndefined && !hostUndefined)
    let hostStatusIsDifferent = (playersArray[index].host != host)
    let guessIsUnique = (guess && uniqueGuess({guess, playersArray}))

    let condition = (isOnlyHost) ? (hostStatusIsDifferent) : (guessIsUnique)
    if (condition) {
        if (isOnlyHost) {
            playersArray[index].host = host
            if(host == true) playersArray[index].guess = null
        } else {
            playersArray[index].guess = guess
        }
        const updatePlayerResponse = await knex("games").where({access_code: accessCode}).update({players: JSON.stringify(playersArray)})
        if (updatePlayerResponse) return {status: true, message: playersArray}
    } else {
        let message
        if(guess && !(uniqueGuess({guess, playersArray}))) {
            message = "Did not update, guess already in DB."
        } else {
            message = `Did not update, host status is already ${playersArray[index].host}.`
        }
        return {status: false, message}
    }
}

async function deletePlayer(args) {
    const accessCode = args.accessCode
    const playerID = args.playerID
    const sessionID = args.sessionID
    var playersResponse = await getPlayers({accessCode, revealSessionID: true, sessionID})
    if(!playersResponse.status) {return playersResponse}
    var playersArray = playersResponse.message
    var index = (playerID) ? getPlayerIndex({playersArray, playerID}) : getPlayerIndex({playersArray, sessionID}) // true -> host deletes player
    if(index == null){                                                                                                     // false -> player leaves game
        return {status: false, message: "Player not found."}
    }
    if(playerID && playersArray[index].sessionID === sessionID) {
        return {status: false, message: "Cannot delete yourself if you are the host."}
    }
    playersArray.splice(index, 1)
    const deletePlayerResponse = await knex("games").where({access_code: accessCode}).update({players: JSON.stringify(playersArray)})
    if (deletePlayerResponse) {
        return {status: true, message: playersArray}
    } else {
        return {status: false, message: "Error deleting player!"}
    }
}

module.exports = {
    createGame,
    addPlayer,
    getPlayers,
    deleteGame,
    sortPlayerRank,
    deletePlayer,
    updatePlayer,
    endGame,
    gameStatus,
    getGames,
    getSortedPlayersRank,
    approvePlayer
}