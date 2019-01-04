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

function sortRank(playersArray) {
    // return sorted array of how close players are to the winning number
    // [{name: player1, guess: 576, rank: 1}, {name: player2, guess: 646, rank: 2}, etc...]
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

function getPlayers({accessCode}) {
    const players = knex("games").where({access_code: accessCode}).select("players")
    return players
}
async function addPlayer({playerData, accessCode}) {
    const guess = playerData.guess
    var [playersResponse] = await getPlayers({accessCode})
    if(!playersResponse) {return}
    var playersArray = playersResponse.players
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
    // player can update their guess
}
function removePlayer({playerName, accessCode}) {
    // allow host to remove player or allow player to remove themself ??

}



module.exports = {
    createGame,
    addPlayer,
    getPlayers,
    deleteGame
}