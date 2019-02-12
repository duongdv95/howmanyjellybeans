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

async function sortPlayerRank({accessCode}) {
    const [winningNumberResponse] = await getWinningNumber({accessCode});
    var playersResponse = await getPlayers({accessCode, revealSessionID: true})
    if(!playersResponse.status || !winningNumberResponse) {return {status: false, message: "invalid access code"}}
    var playersArrayWithHost = playersResponse.message;
    var playersArray = playersArrayWithHost.filter(element => element.host == false)
    var winningNumber = winningNumberResponse.winning_number
    playersArray.sort(function(a, b) {
        return Math.abs(winningNumber - a.guess) - Math.abs(winningNumber - b.guess) 
    })
    const rankedPlayersArray = playersArray.map(function(obj, index) {
        var removeSessionID = {
            "username": obj.username, 
            "guess":obj.guess, 
            "host": obj.host,
            "sessionID": obj.sessionID,
            "id": obj.id,
            "rank": index + 1}
            return removeSessionID
    })
    return {status: true, message: rankedPlayersArray}
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
            game_end: false
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

async function gameStatus({accessCode}) {
    const [response] = await knex("games").where({access_code: accessCode}).select("game_end");
    // console.log(response)
    return (response) ? {status: true, message: response.game_end} : {status: false, message: "Invalid access code"}
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
        isHost = (!isNaN(index) && response.players.length > 0) ? response.players[index].host : null 
        // console.log(isHost)
    }
    const playersArray = (revealSessionID) ? response.players : response.players.map(function(obj) {
        var removeSessionID = {
            "username": obj.username, 
            "guess":obj.guess, 
            "host": obj.host,
            "id": obj.id}
            return removeSessionID
        })
    return response ? {status: true, message: playersArray, isHost} : {status: false, message: "Invalid access code"}
}

async function addPlayer({playerData, accessCode}) {
    const guess = playerData.guess
    if(playerData.username.length === 0 || playerData.guess.length === 0 || isNaN(guess)) {
        return {status: false, message: "Invalid username or guess"}
    }
    var playersResponse = await getPlayers({accessCode, revealSessionID: true})
    if(!playersResponse.status) {return playersResponse}
    var playersArray = playersResponse.message
    if (uniqueGuess({guess, playersArray})) {
        playerData.id = shortid.generate();
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
    // allow host to remove player or allow player to remove themself ??
    const accessCode = args.accessCode
    const playerID = args.playerID
    const sessionID = args.sessionID
    var playersResponse = await getPlayers({accessCode, revealSessionID: true})
    if(!playersResponse.status) {return playersResponse}
    var playersArray = playersResponse.message
    var index = (playerID) ? getPlayerIndex({playersArray, playerID}) : getPlayerIndex({playersArray, sessionID})
    if(index == null){
        return {status: false, message: "Player not found."}
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
    getGames
}