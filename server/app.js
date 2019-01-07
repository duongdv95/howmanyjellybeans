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

app.get("/:id/players", async (req, res) => {
    console.log("Inside homepage")
    console.log(req.sessionID)
    const accessCode = req.params.id
    const response = await pgFunctions.getPlayers({accessCode});
    response.status ? res.status(200).send(response) : res.status(400).send(response)
})

// Restricted to host
app.get("/:id/sortplayers", isHost, async (req, res) => {
    console.log("Inside homepage")
    console.log(req.sessionID)
    const accessCode = req.params.id
    const response = await pgFunctions.sortPlayerRank({accessCode});
    response ? res.status(200).send(response) : res.status(400).send(response.message)
})

app.post("/createGame", async (req, res) => {
    const username = req.body.username
    const winningNumber = req.body.winningNumber
    const playerData = generatePlayerObj({username, guess: null, host: true, sessionID: req.sessionID})
    const response = await pgFunctions.createGame({playerData, winningNumber})
    response.status ? res.status(200).send(response) : res.status(400).send(response)
})

app.post("/addPlayer", async (req, res) => {
    const username = req.body.username
    const guess = req.body.guess
    const accessCode = req.body.accessCode
    const playerData = generatePlayerObj({username, guess, host: false, sessionID: req.sessionID})
    const response = await pgFunctions.addPlayer({playerData, accessCode})
    response.status ? res.status(200).send(response) : res.status(400).send(response)
})

// Restricted to host
app.delete("/:id/deleteGame", async (req, res) => {
    const accessCode = req.params.id;
    const response = await pgFunctions.deleteGame({accessCode});
    response.status ? res.status(200).send(response) : res.status(400).send(response)
})

// Restricted to host
app.put("/deletePlayer", async (req, res) => {
    const playerID = req.body.playerID
    const accessCode = req.body.accessCode
    const response = await pgFunctions.deletePlayer({playerID, accessCode})
    response.status ? res.status(200).send(response) : res.status(400).send(response)
})

app.put("/updatePlayer", async (req, res) => {
    const playerID = req.body.playerID
    const accessCode = req.body.accessCode
    const guess = req.body.guess
    const response = await pgFunctions.updatePlayer({playerID, accessCode, guess})
    response.status ? res.status(200).send(response) : res.status(400).send(response)
})

var generatePlayerObj = function playerData({username, guess, host, sessionID}) {
    return {
        username,
        guess,
        host,
        sessionID,
    }
}

async function isHost(req, res, next) {
    const sessionID = req.session.id
    const accessCode = req.params.id
    const response = await pgFunctions.getPlayers({accessCode, revealSessionID: true});
    const playersArray = response.message
    for(let i = 0; i < playersArray.length; i++) {
        if(playersArray[i].sessionID == sessionID) {
            console.log(playersArray[i].sessionID, sessionID)
            return next()
        }
    }
    res.status(400).send("Unauthorized")
}

const port = 5000;
app.listen(port, function() {
  console.log("Express server started.")
})