const express          = require("express");
const app              = express();
const bodyParser       = require("body-parser");
const pgFunctions      = require("./pgFunctions");
const session          = require("express-session");
const uuid             = require("uuid/v4");
const KnexSessionStore = require("connect-session-knex")(session);
const knexfile         = require("./knexfile.js");
const knex             = require("knex")(knexfile);

app.use(bodyParser.json());
app.use(session({
    genid: (req) => {
        console.log("Inside the session middleware")
        console.log(req.sessionID)
        return uuid()
    },
    store: new KnexSessionStore({
        knex: knex,
        tablename: "sessions"
    }),
    secret: "merp",
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: null}
}));

app.get("/:id/status", async (req, res) => {
    const accessCode = req.params.id
    const response = await pgFunctions.gameStatus({accessCode});
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

app.get("/:id/players", async (req, res) => {
    const accessCode = req.params.id
    const sessionID = req.session.id
    const response = await pgFunctions.getPlayers({accessCode, sessionID});
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

// Restricted to host
app.get("/:id/sortplayers", isAllowed({role: "host"}), async (req, res) => {
    // console.log("Inside sortplayers")
    // console.log(req.sessionID)
    const accessCode = req.params.id
    const response = await pgFunctions.sortPlayerRank({accessCode});
    response ? res.status(200).json(response) : res.status(400).json(response.message)
})

app.post("/createGame", async (req, res) => {
    const username = req.body.username
    const winningNumber = req.body.winningNumber
    const playerData = generatePlayerObj({username, guess: null, host: true, sessionID: req.sessionID})
    const response = await pgFunctions.createGame({playerData, winningNumber})
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

app.post("/addPlayer", gameNotOver, async (req, res) => {
    const username = req.body.username
    const guess = req.body.guess
    const accessCode = req.body.accessCode
    const playerData = generatePlayerObj({username, guess, host: false, sessionID: req.sessionID})
    const response = await pgFunctions.addPlayer({playerData, accessCode})
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

// Restricted to host
app.delete("/:id/deleteGame", isAllowed({role: "host"}), async (req, res) => {
    const accessCode = req.params.id;
    const response = await pgFunctions.deleteGame({accessCode});
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

app.put("/:id/endGame", isAllowed({role: "host"}), async (req, res) => {
    const accessCode = req.params.id;
    const response = await pgFunctions.endGame({accessCode});
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

// Restricted to host
app.put("/deletePlayer", isAllowed({role: "player"}), gameNotOver, async (req, res) => {
    const playerID = req.body.playerID
    const accessCode = req.body.accessCode
    const response = await pgFunctions.deletePlayer({playerID, accessCode})
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

app.put("/leaveGame", isAllowed({role: "player"}), gameNotOver, async (req, res) => {
    const sessionID = req.session.id
    const accessCode = req.body.accessCode
    req.session.destroy(function(){
      });
    const response = await pgFunctions.deletePlayer({sessionID, accessCode})
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

app.put("/updatePlayer", isAllowed({role: "host"}), gameNotOver, async (req, res) => {
    const playerID = req.body.playerID
    const accessCode = req.body.accessCode
    const guess = req.body.guess
    const host = req.body.host
    const response = await pgFunctions.updatePlayer({playerID, accessCode, guess, host})
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

var generatePlayerObj = function playerData({username, guess, host, sessionID}) {
    return {
        username,
        guess: guess + "",
        host,
        sessionID,
    }
}

async function deleteGames() {
    const response = await pgFunctions.getGames()
    if(response.status) {
        const gamesArray = response.message
        for(let i = 0; i < gamesArray.length; i++) {
            var date = new Date(gamesArray[i].created_at)
            var currentDate = new Date()
            currentDate.setMilliseconds(0)
            var timeElapsed = (currentDate - date)/1000
            //24*60*60, 24 hours converted to seconds
            var accessCode = gamesArray[i].access_code
            if (timeElapsed > 24*60*60) {
                var responses = await pgFunctions.deleteGame({accessCode})
                console.log(responses)
            }
        }
    }
}

setInterval(deleteGames, 60*60*1000)

function isAllowed(args) {
    const role = args.role //"host" or "player"
    var isHost = (role === "host") ? true : false
    return async function (req, res, next) {
        const sessionID = req.session.id
        const accessCode = req.params.id || req.body.accessCode
        const response = await pgFunctions.getPlayers({accessCode, revealSessionID: true})
        const playersArray = response.message
        // console.log(sessionID, accessCode, response, playersArray)
        const condition = function(i) {
            return (isHost) ? (playersArray[i].sessionID == sessionID && playersArray[i].host == true) : (playersArray[i].sessionID == sessionID)
        }
        for(let i = 0; i < playersArray.length; i++) {
            // console.log(playersArray[i].sessionID, sessionID, playersArray[i].host)
            if(condition(i)) {
                return next()
            }
        }
        res.status(400).json({status: false, message: "Unauthorized"})
    }
}

async function gameNotOver(req, res, next) {
    const accessCode = req.params.id || req.body.accessCode
    const response = await pgFunctions.gameStatus({accessCode});
    if(response.message === false) {
        return next()
    }
    res.status(400).json({status: false, message: "Game already ended by host"})
}

const port = 5000;
app.listen(port, function() {
  console.log("Express server started.")
})