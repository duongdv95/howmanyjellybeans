const express          = require("express");
const app              = express();
const bodyParser       = require("body-parser");
const pgFunctions      = require("./pgFunctions");
const session          = require("express-session");
const uuid             = require("uuid/v4");
const KnexSessionStore = require("connect-session-knex")(session);
const knexfile         = require("./knexfile.js");
const knex             = require("knex")(knexfile);
const path             = require("path");

app.use(express.static(path.join(__dirname, '/../build')));
app.use(bodyParser.json());
app.use(session({
    genid: (req) => {
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

app.get("/api/:id/status", async (req, res) => {
    const accessCode = req.params.id
    const response = await pgFunctions.gameStatus({accessCode});
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

app.get("/api/:id/players", async (req, res) => {
    const accessCode = req.params.id
    const sessionID = req.session.id
    const response = await pgFunctions.getPlayers({accessCode, sessionID});
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

// Restricted to host
app.get("/api/:id/sortplayers", isAllowed({role: "host"}), async (req, res) => {
    // console.log("Inside sortplayers")
    // console.log(req.sessionID)
    const accessCode = req.params.id
    const response = await pgFunctions.sortPlayerRank({accessCode});
    response ? res.status(200).json(response) : res.status(400).json(response.message)
})

app.post("/api/createGame", async (req, res) => {
    const username = req.body.username
    const winningNumber = req.body.winningNumber
    const playerData = generatePlayerObj({username, guess: null, host: true, sessionID: req.sessionID})
    const response = await pgFunctions.createGame({playerData, winningNumber})
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

app.post("/api/addPlayer", gameNotOver, async (req, res) => {
    const username = req.body.username
    const guess = req.body.guess
    const accessCode = req.body.accessCode
    const playerData = generatePlayerObj({username, guess, host: false, sessionID: req.sessionID})
    const response = await pgFunctions.addPlayer({playerData, accessCode})
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

// Restricted to host
app.delete("/api/:id/deleteGame", isAllowed({role: "host"}), async (req, res) => {
    const accessCode = req.params.id;
    const response = await pgFunctions.deleteGame({accessCode});
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

app.put("/api/:id/endGame", isAllowed({role: "host"}), async (req, res) => {
    const accessCode = req.params.id;
    const response = await pgFunctions.endGame({accessCode});
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

// Restricted to host
app.put("/api/deletePlayer", isAllowed({role: "host"}), gameNotOver, async (req, res) => {
    const sessionID = req.session.id
    const playerID = req.body.playerID
    const accessCode = req.body.accessCode
    const response = await pgFunctions.deletePlayer({sessionID, playerID, accessCode})
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

app.put("/api/leaveGame", isAllowed({role: "player"}), gameNotOver, async (req, res) => {
    const sessionID = req.session.id
    const accessCode = req.body.accessCode
    const response = await pgFunctions.deletePlayer({sessionID, accessCode})
    if(response) {
        req.session.destroy(function(){
          });
    }
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

app.put("/api/updatePlayer", isAllowed({role: "host"}), gameNotOver, async (req, res) => {
    const playerID = req.body.playerID
    const accessCode = req.body.accessCode
    const guess = req.body.guess
    const host = req.body.host
    const response = await pgFunctions.updatePlayer({playerID, accessCode, guess, host})
    response.status ? res.status(200).json(response) : res.status(400).json(response)
})

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/../build/index.html"));
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
                //delete all games every 24 hour 
                var responses = await pgFunctions.deleteGame({accessCode})
            }
        }
    }
}

setInterval(deleteGames, 1*60*60*1000) //check DB every hour for any games to delete

function isAllowed(args) {
    const role = args.role //"host" or "player"
    const isHost = (role === "host") ? true : false
    return async function (req, res, next) {
        const sessionID = req.session.id
        const accessCode = req.params.id || req.body.accessCode
        const gameStatus = await pgFunctions.gameStatus({accessCode});
        if(gameStatus.message === true) {
            return next()
        }
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


app.listen(process.env.PORT, function() {
  console.log("Express server started.")
})