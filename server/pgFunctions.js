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
    // return sorted array of how close players are to the winning number
    // [{name: player1, guess: 576, rank: 1}, {name: player2, guess: 646, rank: 2}, etc...]
    const [winningNumberResponse] = await getWinningNumber({accessCode});
    var playersResponse = await getPlayers({accessCode, revealSessionID: true})
    if(!playersResponse.status || !winningNumberResponse) {return {status: false, message: "invalid access code"}}
    var playersArrayWithHost = playersResponse.message;
    var playersArray = playersArrayWithHost.filter(element => element.host == false)
    var winningNumber = winningNumberResponse.winning_number
    playersArray.sort(function(a, b) {
        return Math.abs(winningNumber - a.guess) - Math.abs(winningNumber - b.guess) 
    })
    return {status: true, message: playersArray}
}

async function createGame({playerData, winningNumber}) {
    if(playerData.username.length === 0 || winningNumber.length === 0 || isNaN(winningNumber)) {
        return {status: false, message: "Invalid username or winning number"}
    } else {
        playerData.id = shortid.generate();
        const response = await knex("games").insert(
            {
            access_code: generateAccessCode(), 
            players: JSON.stringify([playerData]), 
            winning_number: winningNumber,
            game_end: false
            }
        )
        return response ? {status: true, message: "Succesfully created game."} : {status: false, message: "Error! could not create game."}
    }
    
}

async function deleteGame({accessCode}) {
    const response = await knex("games").where({access_code: accessCode}).del();
    return (response) ? {status: true, message: "Succesfully deleted game"} : {status: false, message: "Invalid access code"}
}

async function getPlayers(args) {
    const accessCode = args.accessCode || null;
    const revealSessionID = args.revealSessionID || false;
    const [response] = await knex("games").where({access_code: accessCode}).select("players")
    if(!response) {
        return {status: false, message: "Invalid access code"}
    }
    const playersArray = revealSessionID ? response.players : response.players.map(function(obj) {
        var removeSessionID = {
            "username": obj.username, 
            "guess":obj.guess, 
            "host": obj.host,
            "id": obj.id}
        return removeSessionID
    })
    return response ? {status: true, message: playersArray} : {status: false, message: "Invalid access code"}
}

async function addPlayer({playerData, accessCode}) {
    if(playerData.username.length === 0 || playerData.guess.length === 0) {
        return {status: false, message: "Invalid access code."}
    }
    const guess = playerData.guess
    var playersResponse = await getPlayers({accessCode})
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
        if(playersArray[i].guess === guess) {
            uniqueGuess = false
            break
        }
    }
    return uniqueGuess
}

function getPlayerIndex({playersArray, playerID}) {
    let index = null;
    for(let i = 0; i < playersArray.length; i++) {
        if(playersArray[i].id == playerID) {
            index = i;
            break
        }
    }
    return index
}
async function updatePlayer(args) {
    // should players be allowed to update their guesses?
    // or only permit host to update people's guesses
    const playerID = args.playerID
    const accessCode = args.accessCode
    const guess = args.guess
    const host = args.host || false
    var playersResponse = await getPlayers({accessCode})
    if(!playersResponse.status) {return playersResponse}
    var playersArray = playersResponse.message
    var index = getPlayerIndex({playersArray, playerID})

    if(index == null){
        return {status: false, message: "Player not found."}
    }
    if (uniqueGuess({guess, playersArray})) {
        playersArray[index].guess = guess
        playersArray[index].host = host
        const updatePlayerResponse = await knex("games").where({access_code: accessCode}).update({players: JSON.stringify(playersArray)})
        if (updatePlayerResponse) {
            return {status: true, message: playersArray}
        }
    } else {
        return {status: false, message: "Did not update, guess already in DB."}
    }
}

async function deletePlayer({playerID, accessCode}) {
    // allow host to remove player or allow player to remove themself ??
    var playersResponse = await getPlayers({accessCode})
    if(!playersResponse.status) {return playersResponse}
    var playersArray = playersResponse.message
    var index = getPlayerIndex({playersArray, playerID})

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
    updatePlayer
}