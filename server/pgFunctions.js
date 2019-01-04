const knexfile = require("./knexfile.js");
const knex     = require("knex")(knexfile);

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
    var playersResponse = await getPlayers({accessCode})
    if(!playersResponse.status || !winningNumberResponse) {return {status: false, info: "invalid access code"}}
    var playersArrayWithHost = playersResponse.info;
    var playersArray = playersArrayWithHost.slice(1);
    var winningNumber = winningNumberResponse.winning_number
    playersArray.sort(function(a, b) {
        return Math.abs(winningNumber - a.guess) - Math.abs(winningNumber - b.guess) 
    })
    return {status: true, info: playersArray}
}

function createGame({playerData, winningNumber}) {
    return knex("games").insert(
        {
        access_code: generateAccessCode(), 
        players: JSON.stringify([playerData]), 
        winning_number: winningNumber,
        game_end: false
        })
}

function deleteGame({accessCode}) {
    return knex("games").where({access_code: accessCode}).del();
}

async function getPlayers({accessCode}) {
    const [players] = await knex("games").where({access_code: accessCode}).select("players")
    // console.log(players.players)
    return {status: true, info: players.players}
}
async function addPlayer({playerData, accessCode}) {
    const guess = playerData.guess
    var playersResponse = await getPlayers({accessCode})
    if(!playersResponse.status) {return playersResponse}
    var playersArray = playersResponse.info
    if (uniqueGuess({guess, playersArray})) {
        playersArray.push(playerData)
        const addPlayerResponse = await knex("games").where({access_code: accessCode}).update({players: JSON.stringify(playersArray)})
        if (addPlayerResponse) {
            return {status: true, info: "succesfully added player"}
        }
        // add player to matching access_code in games table
    } else {
        return {status: false, info: "did not add player, guess already in DB"}
    }
}

function uniqueGuess({guess, playersArray}) {
    let uniqueGuess = true;
    for(let i = 1; i < playersArray.length; i++) {
        if(playersArray[i].guess === guess) {
            uniqueGuess = false
            break
        }
    }
    return uniqueGuess
}

function updatePlayer({playerName, accessCode}) {
    // should players be allowed to update their guesses?
}
function removePlayer({playerName, accessCode}) {
    // allow host to remove player or allow player to remove themself ??
}



module.exports = {
    createGame,
    addPlayer,
    getPlayers,
    deleteGame,
    sortPlayerRank
}