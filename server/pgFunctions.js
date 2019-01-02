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

function createGame({playerData}) {
    return knex("games").insert({access_code: generateAccessCode(), properties: playerData})
}

function deleteGame(accessCode) {
    // remove game from postgres after inactivity or host ends
}

function addPlayer({playerData, accessCode}) {
    const guess = playerData.guess
    if (uniqueGuess({guess, accessCode})) {
        // add player to matching access_code in games table
    }
}

function removePlayer({playerName, accessCode}) {
    // allow host to remove player or allow player to remove themself
}

function updatePlayer({playerName, accessCode}) {
    // player can update their guess
}

function uniqueGuess({guess, accessCode}) {
    // check if player guess is unique
    // returns true/false
}

module.exports = {
    createGame
}