const express     = require("express");
const app         = express();
const bodyParser  = require("body-parser");
const pgFunctions = require("./pgFunctions");
const session     = require("express-session");

app.use(bodyParser.json());
app.use(session({
    secret: "merp",
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: null}
}));

app.get("/:id/players", async (req, res) => {
    const accessCode = req.params.id
    const response = await pgFunctions.getPlayers({accessCode});
    // playersResponse ? res.json(playersResponse.players) : res.status(400).send("Access code not found")
    response.status ? res.status(200).send(response) : res.status(400).send(response)
})

app.get("/:id/sortplayers", async (req, res) => {
    const accessCode = req.params.id
    const response = await pgFunctions.sortPlayerRank({accessCode});
    response ? res.status(200).send(response) : res.status(400).send(response.info)
})

app.post("/createGame", async (req, res) => {
    const username = req.body.username
    const winningNumber = req.body.winningNumber
    const playerData = generatePlayerObj({username, guess: null, host: true, sessionID: null})
    if(username.length === 0 || winningNumber.length === 0) {
        res.status(400).send({error: "username or winning number is empty"})
    } else {
        const response = await pgFunctions.createGame({playerData, winningNumber})
        response ? res.status(200).send() : res.status(400).send()
    }
})

app.post("/joinGame", async (req, res) => {
    const username = req.body.username
    const guess = req.body.guess
    const accessCode = req.body.accessCode
    const playerData = generatePlayerObj({username, guess, host: false, sessionID: null})
    if(username.length === 0 || guess.length === 0) {
        res.status(400).send({error: "username or guess is empty"})
    } else {
        const response = await pgFunctions.addPlayer({playerData, accessCode})
        response.status ? res.status(200).send(response.info) : res.status(400).send(response.info)
    }
})

app.delete("/:id/deleteGame", async (req, res) => {
    // add middleware to verify that creator/host is ending game
    const accessCode = req.params.id;
    const response = await pgFunctions.deleteGame({accessCode});
    response ? res.status(200).send() : res.status(400).send("Access code not found")
})

var generatePlayerObj = function playerData({username, guess, host, sessionID}) {
    return {
        username,
        guess,
        host,
        sessionID,
    }
}

const port = 5000;
app.listen(port, function() {
  console.log("Express server started.")
})